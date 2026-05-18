import { Ionicons } from '@expo/vector-icons';
import {
  AudioQuality,
  IOSOutputFormat,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import type { AudioRecorder, RecordingOptions } from 'expo-audio';
import { Href, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormattedContent } from '@/components/ui/formatted-content';
import { ScreenHeader } from '@/components/ui/screen-header';
import { palette } from '@/constants/design';
import {
  askBackendVoiceChat,
  askBackendChatbot,
  BackendChatMessage,
  BackendEpisode,
  BackendNews,
  combineFamilyStories,
  formatDate,
  getBackendCases,
  getBackendEpisodes,
  getBackendFamilies,
  getBackendNews,
} from '@/data/backend';
import { quickSuggestions } from '@/data/mock';

type MessageAction = {
  id: string;
  kind: 'family' | 'episode' | 'news';
  label: string;
  caption: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
};

type Message = {
  id: string;
  role: 'assistant' | 'user' | 'typing';
  text: string;
  actions?: MessageAction[];
};

function isChatHistoryMessage(message: Message): message is Message & { role: 'assistant' | 'user' } {
  return message.role === 'user' || message.role === 'assistant';
}

const starterMessages: Message[] = [
  {
    id: 'm1',
    role: 'assistant',
    text: 'Hi! I can help you explore family profiles, episode details, locations, and donation information from the program. What would you like to know?',
  },
];

const voiceRecordingOptions: RecordingOptions = {
  ...RecordingPresets.LOW_QUALITY,
  extension: '.m4a',
  sampleRate: 22050,
  numberOfChannels: 1,
  bitRate: 48000,
  android: {
    extension: '.m4a',
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
  },
  ios: {
    extension: '.m4a',
    sampleRate: 22050,
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.LOW,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 48000,
  },
};

function normalizeText(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractEpisodeNumbers(text: string) {
  return Array.from(
    new Set(
      Array.from(normalizeText(text).matchAll(/\b(?:episode|ep|tap)\s*(\d{1,4})\b/g))
        .map((match) => Number(match[1]))
        .filter(Boolean),
    ),
  );
}

function asksLatestEpisode(text: string) {
  const normalized = normalizeText(text);
  return (
    /\b(latest|newest|most recent|moi nhat|gan nhat)\b.*\b(episode|ep|tap|broadcast)\b/.test(normalized)
    || /\b(episode|ep|tap|broadcast)\b.*\b(latest|newest|most recent|moi nhat|gan nhat)\b/.test(normalized)
  );
}

function asksLatestFamily(text: string) {
  const normalized = normalizeText(text);
  const latest = /\b(latest|newest|most recent|moi nhat|gan nhat)\b/;
  const family = /\b(family|families|household|profile|ho gia dinh|gia dinh|ho dan|nhan vat)\b/;
  return latest.test(normalized) && family.test(normalized);
}

function asksNews(text: string) {
  const normalized = normalizeText(text);
  return (
    /\b(news|new|update|updates|tin tuc|tin moi|bai viet|article)\b/.test(normalized)
    || /\b(latest|newest|most recent|moi nhat|gan nhat)\b.*\b(news|new|update|updates|tin|bai viet|article)\b/.test(normalized)
  );
}

function containsNormalized(haystack: string, needle?: string | null) {
  const normalizedNeedle = normalizeText(needle);
  return Boolean(normalizedNeedle && haystack.includes(normalizedNeedle));
}

function getPrimaryActionKind(question: string): MessageAction['kind'] {
  const normalized = normalizeText(question);
  const familySignals = /\b(family|families|household|profile|ho gia dinh|gia dinh|ho dan|nhan vat|donation|donate|quyen gop|bank|tai khoan)\b/;
  const newsSignals = /\b(news|new|update|updates|tin tuc|tin moi|bai viet|article)\b/;
  const episodeSignals = /\b(episode|ep|tap|watch|video|broadcast|chuong trinh|phat song)\b/;

  if (familySignals.test(normalized)) {
    return 'family';
  }
  if (newsSignals.test(normalized) || asksNews(question)) {
    return 'news';
  }
  if (episodeSignals.test(normalized) || asksLatestEpisode(question)) {
    return 'episode';
  }
  return 'family';
}

function asksAllFamiliesInEpisode(text: string) {
  const normalized = normalizeText(text);
  const allSignals = /\b(all|list|every|cac|nhung|tat ca|toan bo|danh sach)\b/;
  const familySignals = /\b(family|families|household|households|profile|profiles|ho gia dinh|gia dinh|nhan vat|ho dan)\b/;
  return allSignals.test(normalized) && familySignals.test(normalized) && extractEpisodeNumbers(text).length > 0;
}

function getExplicitFamilyMatches(
  stories: ReturnType<typeof combineFamilyStories>,
  searchableText: string,
) {
  return stories.filter((story) => {
    const name = normalizeText(story.name);
    const beneficiary = normalizeText(story.beneficiary);
    const accountNumber = normalizeText(story.accountNumber);
    return (
      (name && searchableText.includes(name)) ||
      (beneficiary && searchableText.includes(beneficiary)) ||
      (accountNumber && searchableText.includes(accountNumber))
    );
  });
}

function addAction(actions: MessageAction[], action: MessageAction) {
  if (!actions.some((item) => item.id === action.id)) {
    actions.push(action);
  }
}

function getEpisodeAction(episode: BackendEpisode): MessageAction {
  return {
    id: `episode-${episode.id}`,
    kind: 'episode',
    label: `Episode ${episode.episode_no}`,
    caption: episode.air_date ? formatDate(episode.air_date) : 'Open episode',
    icon: 'play-circle-outline',
    route: `/episode/${episode.id}` as Href,
  };
}

function getNewsAction(item: BackendNews): MessageAction {
  return {
    id: `news-${item.id}`,
    kind: 'news',
    label: item.title,
    caption: item.type || 'News & Updates',
    icon: 'newspaper-outline',
    route: `/update/${item.id}` as Href,
  };
}

function getFamilyAction(story: ReturnType<typeof combineFamilyStories>[number]): MessageAction {
  return {
    id: `family-${story.caseId}`,
    kind: 'family',
    label: story.name,
    caption: `Episode ${story.episodeNo} - ${story.location}`,
    icon: 'person-circle-outline',
    route: `/family/${story.caseId}` as Href,
  };
}

async function findRelatedActions(question: string, answer: string) {
  const [episodes, cases, families, news] = await Promise.all([
    getBackendEpisodes(),
    getBackendCases(),
    getBackendFamilies(),
    getBackendNews(),
  ]);
  const stories = combineFamilyStories(cases, families, episodes);
  const text = `${question}\n${answer}`;
  const answerSearchable = normalizeText(answer);
  const questionSearchable = normalizeText(question);
  const actions: MessageAction[] = [];
  const primaryKind = getPrimaryActionKind(question);
  const sortedEpisodes = [...episodes].sort((a, b) => b.episode_no - a.episode_no);
  const episodeNumbers = extractEpisodeNumbers(text);
  const explicitAnswerFamilyMatches = getExplicitFamilyMatches(stories, answerSearchable);
  const explicitQuestionFamilyMatches = getExplicitFamilyMatches(stories, questionSearchable);
  const shouldAttachEpisodeFamilies =
    asksAllFamiliesInEpisode(question) ||
    asksLatestFamily(question) ||
    (!explicitAnswerFamilyMatches.length && !explicitQuestionFamilyMatches.length && primaryKind === 'family' && episodeNumbers.length > 0);

  if (asksLatestEpisode(text) && sortedEpisodes[0]) {
    episodeNumbers.push(sortedEpisodes[0].episode_no);
  }

  if (primaryKind === 'family' && asksLatestFamily(question) && sortedEpisodes[0]) {
    const latestEpisode = sortedEpisodes[0];
    stories
      .filter((story) => story.episodeId === latestEpisode.id || story.episodeNo === latestEpisode.episode_no)
      .slice(0, 3)
      .forEach((story) => addAction(actions, getFamilyAction(story)));
  }

  Array.from(new Set(episodeNumbers)).forEach((episodeNo) => {
    const episode = episodes.find((item) => item.episode_no === episodeNo);
    if (!episode) {
      return;
    }

    if (primaryKind === 'episode') {
      addAction(actions, getEpisodeAction(episode));
    } else if (primaryKind === 'family' && shouldAttachEpisodeFamilies) {
      stories
        .filter((story) => story.episodeId === episode.id || story.episodeNo === episode.episode_no)
        .slice(0, 3)
        .forEach((story) => addAction(actions, getFamilyAction(story)));
    }
  });

  if (primaryKind === 'family') {
    [...explicitQuestionFamilyMatches, ...explicitAnswerFamilyMatches]
      .forEach((story) => addAction(actions, getFamilyAction(story)));
  }

  if (primaryKind === 'episode') {
    episodes.forEach((episode) => {
      const answerMatches =
        answerSearchable.includes(`episode ${episode.episode_no}`) ||
        answerSearchable.includes(`tap ${episode.episode_no}`) ||
        containsNormalized(answerSearchable, episode.title);
      const directQuestionMatches =
        questionSearchable.includes(`episode ${episode.episode_no}`) ||
        questionSearchable.includes(`tap ${episode.episode_no}`) ||
        containsNormalized(questionSearchable, episode.title);

      if (answerMatches || directQuestionMatches) {
        addAction(actions, getEpisodeAction(episode));
      }
    });
  }

  if (primaryKind === 'news') {
    news.forEach((item) => {
      const answerMatches = containsNormalized(answerSearchable, item.title);
      const directQuestionMatches = containsNormalized(questionSearchable, item.title);

      if (answerMatches || directQuestionMatches) {
        addAction(actions, getNewsAction(item));
      }
    });

    if (!actions.length && asksNews(question)) {
      const latestNews = [...news].sort((a, b) => {
        const aDate = new Date(a.published_at ?? a.created_at).getTime();
        const bDate = new Date(b.published_at ?? b.created_at).getTime();
        return bDate - aDate;
      })[0];

      if (latestNews) {
        addAction(actions, getNewsAction(latestNews));
      }
    }
  }

  return actions.filter((action) => action.kind === primaryKind).slice(0, primaryKind === 'family' ? 4 : 1);
}

export default function AICompassScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [sending, setSending] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const voiceRecorder = useAudioRecorder(voiceRecordingOptions);
  const recordingRef = useRef<AudioRecorder | null>(null);
  const listRef = useRef<FlatList<Message>>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dotAnimations = useRef([new Animated.Value(0.35), new Animated.Value(0.35), new Animated.Value(0.35)]).current;

  useEffect(() => {
    const animations = dotAnimations.map((dot, index) =>
      Animated.sequence([
        Animated.delay(index * 140),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 360,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.35,
              duration: 360,
              useNativeDriver: true,
            }),
          ]),
        ),
      ]),
    );

    const group = Animated.parallel(animations);
    group.start();

    return () => {
      group.stop();
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stop().catch(() => undefined);
        recordingRef.current = null;
      }
    };
  }, [dotAnimations]);

  const scrollToEnd = (animated = true, delay = 90) => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = setTimeout(() => {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated }));
    }, delay);
  };

  useEffect(() => {
    scrollToEnd(true, 120);
  }, [messages.length, voiceStatus]);

  const getChatHistory = () => messages
    .filter(isChatHistoryMessage)
    .slice(-6)
    .map((message) => ({
      role: message.role,
      content: message.text,
    }));

  const send = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || sending) {
      return;
    }

    const chatHistory: BackendChatMessage[] = getChatHistory();

    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', text };
    const typingMessage: Message = { id: `${Date.now()}-typing`, role: 'typing', text: '' };

    setMessages((current) => [...current, userMessage, typingMessage]);
    setInput('');
    setSending(true);
    scrollToEnd();

    try {
      const response = await askBackendChatbot(text, chatHistory);
      const assistantId = `${Date.now()}-assistant`;
      setMessages((current) => current
        .filter((message) => message.role !== 'typing')
        .concat({
          id: assistantId,
          role: 'assistant',
          text: response.reply,
        }));
      findRelatedActions(text, response.reply)
        .then((actions) => {
          setMessages((current) => current.map((message) => (
            message.id === assistantId ? { ...message, actions } : message
          )));
        })
        .catch(() => undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reach chatbot backend.';
      setMessages((current) => current
        .filter((item) => item.role !== 'typing')
        .concat({
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          text: `Minh chua goi duoc chatbot backend. Chi tiet loi: ${message}`,
        }));
    } finally {
      setSending(false);
      scrollToEnd();
    }
  };

  const startVoiceInput = async () => {
    if (sending || voiceStatus !== 'idle') {
      return;
    }

    try {
      setVoiceError(null);
      setVoiceTranscript('');

      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setVoiceStatus('idle');
        setVoiceError('Vui long cap quyen microphone de dat cau hoi bang giong noi.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await voiceRecorder.prepareToRecordAsync();
      voiceRecorder.record();
      recordingRef.current = voiceRecorder;
      setVoiceStatus('recording');
    } catch (error) {
      setVoiceStatus('idle');
      setVoiceError(error instanceof Error ? error.message : 'Khong the bat dau ghi am.');
    }
  };

  const stopVoiceInput = async () => {
    if (voiceStatus !== 'recording') {
      return;
    }

    try {
      const recording = recordingRef.current;
      recordingRef.current = null;
      setVoiceStatus('transcribing');

      if (!recording) {
        setVoiceStatus('idle');
        setVoiceError('Khong tim thay file ghi am. Hay thu lai nhe.');
        return;
      }

      await recording.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      const uri = recording.uri;
      if (!uri) {
        setVoiceStatus('idle');
        setVoiceError('Khong luu duoc file ghi am. Hay thu lai nhe.');
        return;
      }

      const chatHistory: BackendChatMessage[] = getChatHistory();
      const voiceTypingId = `${Date.now()}-voice-typing`;
      setSending(true);
      setMessages((current) => [...current, { id: voiceTypingId, role: 'typing', text: '' }]);
      scrollToEnd();

      const response = await askBackendVoiceChat(uri, 'auto', chatHistory);
      const transcript = response.transcript.trim();
      const userMessage: Message = { id: `${Date.now()}-voice-user`, role: 'user', text: transcript };
      const assistantId = `${Date.now()}-voice-assistant`;
      setVoiceTranscript(transcript);
      setInput('');
      setMessages((current) => current
        .filter((message) => message.id !== voiceTypingId && message.role !== 'typing')
        .concat(userMessage)
        .concat({
          id: assistantId,
          role: 'assistant',
          text: response.reply,
        }));
      scrollToEnd();

      findRelatedActions(transcript, response.reply)
        .then((actions) => {
          setMessages((current) => current.map((message) => (
            message.id === assistantId ? { ...message, actions } : message
          )));
        })
        .catch(() => undefined);
      setVoiceStatus('idle');
    } catch (error) {
      setVoiceStatus('idle');
      setVoiceError(error instanceof Error ? error.message : 'Khong the chuyen giong noi thanh cau hoi.');
    } finally {
      setSending(false);
      scrollToEnd();
    }
  };

  const toggleVoiceInput = () => {
    if (voiceStatus === 'idle') {
      startVoiceInput();
      return;
    }

    if (voiceStatus === 'recording') {
      stopVoiceInput();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={12}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4"
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollToEnd(true, 120)}
          onLayout={() => scrollToEnd(false, 0)}
          ListHeaderComponent={
            <View style={styles.page}>
              <ScreenHeader
                title="Ask & Find"
                icon="chatbubbles"
                meta="CHATBOT"
                trailing={
                  <View className="flex-row items-center rounded-full bg-white px-3 py-2">
                    <View className={`mr-2 h-2.5 w-2.5 rounded-full ${sending ? 'bg-[#B7842D]' : 'bg-[#1F8B4C]'}`} />
                    <Text className="font-beSemiBold text-xs text-[#261F1A]">{sending ? 'Thinking' : 'AI online'}</Text>
                  </View>
                }
              />

              <View className="mt-5 rounded-[28px] bg-white p-5" style={styles.heroCard}>
                <Text className="font-beSemiBold text-base text-[#261F1A]">Search by family, episode, or donation detail</Text>
                <Text className="mt-2 font-beRegular text-xs leading-5 text-[#7D746C]">
                  Tap the microphone and ask naturally in Vietnamese or English.
                </Text>
                <View className="mt-4 flex-row flex-wrap gap-2">
                  {quickSuggestions.map((item) => (
                    <Pressable key={item} onPress={() => send(item)} className="rounded-full bg-[#F5EEE7] px-3 py-2">
                      <Text className="font-beMedium text-xs text-primary">{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View className="h-5" />
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.page}>
              <View className={`mb-3 ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
                <View className={`max-w-[88%] rounded-[24px] px-4 py-3 ${item.role === 'user' ? 'bg-primary' : 'bg-white'}`} style={styles.messageCard}>
                  {item.role === 'assistant' ? (
                    <View className="mb-3 flex-row items-center">
                      <Image
                        source={require('../../assets/images/ai-assistant.png')}
                        resizeMode="contain"
                        style={styles.messageAvatar}
                      />
                      <Text className="font-beBold text-[11px] uppercase text-primary">Mai Am Assistant</Text>
                    </View>
                  ) : null}
                  {item.role === 'typing' ? (
                    <View className="flex-row items-center gap-1 py-1">
                      {dotAnimations.map((dot, index) => (
                        <Animated.View
                          key={`typing-dot-${index}`}
                          style={[
                            styles.typingDot,
                            {
                              opacity: dot,
                              transform: [
                                {
                                  translateY: dot.interpolate({
                                    inputRange: [0.35, 1],
                                    outputRange: [2, -2],
                                  }),
                                },
                              ],
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ) : item.role === 'assistant' ? (
                    <View className="border-l-2 border-[#E7DED4] pl-3">
                      <FormattedContent text={item.text} emptyText="No response." />
                    </View>
                  ) : (
                    <Text className={`font-beRegular text-sm leading-6 ${item.role === 'user' ? 'text-white' : 'text-[#261F1A]'}`}>{item.text}</Text>
                  )}
                  {item.actions?.length ? (
                    <View className="mt-3 flex-row flex-wrap gap-2 border-t border-[#EFE6DD] pt-3">
                      {item.actions.map((action) => (
                        <Pressable
                          key={action.id}
                          onPress={() => router.push(action.route)}
                          className="flex-row items-center rounded-full bg-[#F3EAE1] px-3 py-2"
                          style={styles.actionChip}
                        >
                          <Ionicons name={action.icon} size={14} color={palette.primary} />
                          <Text className="ml-1.5 font-beSemiBold text-[11px] text-primary" numberOfLines={1}>
                            {action.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          )}
        />

        <View className="border-t border-[#EFE6DD] bg-white px-4 pb-4 pt-3">
          <View style={styles.page}>
            {voiceStatus !== 'idle' || voiceTranscript || voiceError ? (
              <View className="mb-3 rounded-[22px] border border-[#E9DDD2] bg-[#FFFBF7] px-4 py-3" style={styles.voiceStatusCard}>
                <View className="flex-row items-center">
                  <View className={`mr-3 h-9 w-9 items-center justify-center rounded-full ${voiceStatus === 'recording' ? 'bg-[#B3261E]' : voiceStatus === 'transcribing' ? 'bg-[#D6A84A]' : 'bg-[#F3EAE1]'}`}>
                    <Ionicons
                      name={voiceStatus === 'recording' ? 'radio-outline' : voiceStatus === 'transcribing' ? 'sparkles' : 'checkmark'}
                      size={17}
                      color={voiceStatus === 'idle' ? palette.primary : palette.white}
                    />
                  </View>
                  <Text className="flex-1 font-beSemiBold text-xs text-[#261F1A]">
                    {voiceStatus === 'recording' ? 'Listening...' : voiceStatus === 'transcribing' ? 'Understanding your question...' : 'Voice captured'}
                  </Text>
                  {voiceStatus === 'recording' ? (
                    <View className="flex-row items-center gap-1">
                      {dotAnimations.map((dot, index) => (
                        <Animated.View
                          key={`voice-wave-${index}`}
                          style={[
                            styles.voiceWave,
                            {
                              opacity: dot,
                              transform: [
                                {
                                  scaleY: dot.interpolate({
                                    inputRange: [0.35, 1],
                                    outputRange: [0.55, 1.6],
                                  }),
                                },
                              ],
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
                {voiceTranscript ? (
                  <Text className="mt-2 font-beRegular text-sm leading-5 text-[#2B2B2B]">{voiceTranscript}</Text>
                ) : null}
                {voiceError ? (
                  <Text className="mt-2 font-beRegular text-xs leading-5 text-[#B3261E]">{voiceError}</Text>
                ) : null}
              </View>
            ) : null}
            <View className="mb-2 flex-row items-center px-1">
              <Ionicons name="language-outline" size={13} color="#8E8E8E" />
              <Text className="ml-1.5 font-beMedium text-[11px] text-[#8E8E8E]">Auto-detects Vietnamese and English</Text>
            </View>
            <View className="flex-row items-center rounded-[28px] border border-[#EFE6DD] bg-white px-2.5 py-2" style={styles.composer}>
              <TextInput
                className="mr-2 h-11 flex-1 font-beRegular text-sm text-[#2B2B2B]"
                value={input}
                onChangeText={setInput}
                placeholder="Ask anything..."
                placeholderTextColor="#9E978F"
                textAlignVertical="center"
              />
              <Pressable
                onPress={toggleVoiceInput}
                disabled={sending || voiceStatus === 'transcribing'}
                className={`mr-2 h-11 w-11 items-center justify-center rounded-full ${voiceStatus === 'recording' ? 'bg-[#B3261E]' : voiceStatus === 'transcribing' ? 'bg-[#D6A84A]' : 'bg-[#F3EAE1]'}`}
                style={styles.voiceButton}
              >
                <Ionicons name={voiceStatus === 'idle' ? 'mic-outline' : voiceStatus === 'recording' ? 'stop' : 'hourglass-outline'} size={18} color={voiceStatus === 'idle' ? palette.primary : palette.white} />
              </Pressable>
              <Pressable onPress={() => send()} disabled={sending} className={`h-11 w-11 items-center justify-center rounded-full ${sending ? 'bg-[#C9B8A7]' : 'bg-primary'}`}>
                <Ionicons name="arrow-up" size={18} color={palette.white} />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionChip: {
    maxWidth: '100%',
  },
  composer: {
    shadowColor: '#8B1D1D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
  },
  voiceStatusCard: {
    shadowColor: '#8B1D1D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  voiceWave: {
    backgroundColor: palette.primary,
    borderRadius: 3,
    height: 13,
    width: 4,
  },
  languageChipActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  heroCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  listContent: {
    paddingBottom: 18,
    paddingTop: 2,
  },
  messageCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  messageAvatar: {
    height: 34,
    marginRight: 8,
    width: 34,
  },
  page: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
  },
  typingDot: {
    backgroundColor: palette.primary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  voiceButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
});
