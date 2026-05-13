import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
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
  askBackendChatbot,
  BackendChatMessage,
  combineFamilyStories,
  getBackendCases,
  getBackendEpisodes,
  getBackendFamilies,
} from '@/data/backend';
import { quickSuggestions } from '@/data/mock';

type Message = {
  id: string;
  role: 'assistant' | 'user' | 'typing';
  text: string;
  familyId?: string;
};

const starterMessages: Message[] = [
  {
    id: 'm1',
    role: 'assistant',
    text: 'Hello. Ask me about a family name, location, episode, or donation details. I will search the backend data and help you find the right profile.',
  },
];

async function findRelatedFamilyId(text: string) {
  const [episodes, cases, families] = await Promise.all([
    getBackendEpisodes(),
    getBackendCases(),
    getBackendFamilies(),
  ]);
  const stories = combineFamilyStories(cases, families, episodes);
  const normalized = text.toLowerCase();

  const exactNameMatch = stories.find((story) => normalized.includes(story.name.toLowerCase()));
  if (exactNameMatch) {
    return exactNameMatch.caseId;
  }

  const locationMatch = stories.find((story) => normalized.includes(story.location.toLowerCase()));
  if (locationMatch) {
    return locationMatch.caseId;
  }

  const episodeMatch = stories.find((story) => normalized.includes(`episode ${story.episodeNo}`) || normalized.includes(`tap ${story.episodeNo}`));
  return episodeMatch?.caseId;
}

export default function AICompassScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
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
    };
  }, [dotAnimations]);

  const scrollToEnd = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const send = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || sending) {
      return;
    }

    const chatHistory: BackendChatMessage[] = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-6)
      .map((message) => ({
        role: message.role,
        content: message.text,
      }));

    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', text };
    const typingMessage: Message = { id: `${Date.now()}-typing`, role: 'typing', text: '' };

    setMessages((current) => [...current, userMessage, typingMessage]);
    setInput('');
    setSending(true);
    scrollToEnd();

    try {
      const response = await askBackendChatbot(text, chatHistory);
      const familyId = await findRelatedFamilyId(`${text}\n${response.reply}`);
      setMessages((current) => current
        .filter((message) => message.role !== 'typing')
        .concat({
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: response.reply,
          familyId,
        }));
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

  return (
    <SafeAreaView className="flex-1 bg-[#FAF7F2]" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={12}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.page}>
              <ScreenHeader
                title="Ask & Find"
                icon="chatbubbles"
                meta="Gemini backend"
                trailing={
                  <View className="flex-row items-center rounded-full bg-white px-3 py-2">
                    <View className={`mr-2 h-2.5 w-2.5 rounded-full ${sending ? 'bg-[#B7842D]' : 'bg-[#1F8B4C]'}`} />
                    <Text className="font-beSemiBold text-xs text-[#261F1A]">{sending ? 'Thinking' : 'AI online'}</Text>
                  </View>
                }
              />

              <View className="mt-5 rounded-[28px] bg-white p-5" style={styles.heroCard}>
                <Text className="font-beSemiBold text-base text-[#261F1A]">Search by family, episode, or donation detail</Text>
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
                      <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-[#F3EAE1]">
                        <Ionicons name="sparkles" size={14} color={palette.primary} />
                      </View>
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
                  {item.familyId ? (
                    <Pressable onPress={() => router.push(`/family/${item.familyId}`)} className="mt-4 flex-row items-center self-start rounded-full bg-[#F3EAE1] px-3 py-2">
                      <Ionicons name="person-circle-outline" size={15} color={palette.primary} />
                      <Text className="ml-1.5 font-beSemiBold text-xs text-primary">Open profile</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          )}
        />

        <View className="border-t border-[#EFE6DD] bg-white px-4 pb-4 pt-3">
          <View style={styles.page}>
            <View className="flex-row items-center rounded-[26px] bg-[#F7F3EE] px-3 py-2">
              <TextInput
                className="mr-2 h-11 flex-1 font-beRegular text-sm text-[#2B2B2B]"
                value={input}
                onChangeText={setInput}
                placeholder="Type a family, episode, or donation question"
                placeholderTextColor="#9E978F"
                textAlignVertical="center"
              />
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
});
