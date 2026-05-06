import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
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
import { ScreenHeader } from '@/components/ui/screen-header';
import { palette } from '@/constants/design';
import { families, quickSuggestions } from '@/data/mock';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  familyId?: string;
};

const starterMessages: Message[] = [
  {
    id: 'm1',
    role: 'assistant',
    text: 'Hello. Ask me about urgent families, bank details, locations, or the latest updates.',
  },
];

function createReply(question: string): Message {
  const normalized = question.toLowerCase();
  const urgent = families.find((family) => family.urgency === 'High') ?? families[0];
  const quangNam = families.find((family) => family.location === 'Quang Nam') ?? families[0];

  if (normalized.includes('urgent')) {
    return {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      text: `${urgent.name} is currently the strongest urgent match. The profile is verified, located in ${urgent.location}, and focused on ${urgent.supportFocus.toLowerCase()}.`,
      familyId: urgent.id,
    };
  }

  if (normalized.includes('bank') || normalized.includes('account')) {
    return {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      text: 'Every family profile includes bank name, beneficiary, account number, and verification date. Open a family profile to copy the account number in one tap.',
      familyId: families[0].id,
    };
  }

  if (normalized.includes('quang nam')) {
    return {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      text: `${quangNam.name} is the family currently listed in Quang Nam. The current monthly need is ${quangNam.monthlyNeed}.`,
      familyId: quangNam.id,
    };
  }

  if (normalized.includes('update') || normalized.includes('news')) {
    return {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      text: 'You can review current verification and program changes in Updates. The feed is filtered and each card opens a clean detail view.',
    };
  }

  return {
    id: `${Date.now()}-assistant`,
    role: 'assistant',
    text: 'I can help you find the right family by urgency, location, or support focus. Try asking about urgent families, Quang Nam, or bank details.',
  };
}

export default function AICompassScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const listRef = useRef<FlatList<Message>>(null);

  const send = (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text) {
      return;
    }

    const nextMessages: Message[] = [
      { id: `${Date.now()}-user`, role: 'user', text },
      createReply(text),
    ];

    setMessages((current) => [...current, ...nextMessages]);
    setInput('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
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
                title="Support guide"
                icon="chatbubbles"
                meta="AI assistant"
                trailing={
                  <View className="flex-row items-center rounded-full bg-white px-3 py-2">
                    <View className="mr-2 h-2.5 w-2.5 rounded-full bg-[#1F8B4C]" />
                    <Text className="font-beSemiBold text-xs text-[#261F1A]">AI online</Text>
                  </View>
                }
              />

              <View className="mt-5 rounded-[28px] bg-white p-5" style={styles.heroCard}>
                <Text className="font-beSemiBold text-base text-[#261F1A]">Ask anything about support</Text>
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
              <View className={`mb-3 ${item.role === 'assistant' ? 'items-start' : 'items-end'}`}>
                <View className={`max-w-[88%] rounded-[24px] px-4 py-3 ${item.role === 'assistant' ? 'bg-white' : 'bg-primary'}`} style={styles.messageCard}>
                  <Text className={`font-beRegular text-sm leading-6 ${item.role === 'assistant' ? 'text-[#261F1A]' : 'text-white'}`}>{item.text}</Text>
                  {item.familyId ? (
                    <Pressable onPress={() => router.push(`/family/${item.familyId}`)} className="mt-3 self-start rounded-full bg-[#F3EAE1] px-3 py-2">
                      <Text className="font-beSemiBold text-xs text-primary">Open family profile</Text>
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
                placeholder="Ask about families, locations, or bank details"
                placeholderTextColor="#9E978F"
                textAlignVertical="center"
              />
              <Pressable onPress={() => send()} className="h-11 w-11 items-center justify-center rounded-full bg-primary">
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
});
