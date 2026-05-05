import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput, View, Pressable } from 'react-native';

type Props = {
    label: string;
    value: string;
    placeholder?: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    onToggleSecure?: () => void;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    labelClassName?: string;
};

export function InfoInput({
    label,
    value,
    placeholder,
    onChangeText,
    secureTextEntry,
    onToggleSecure,
    keyboardType = 'default',
    labelClassName = 'text-[#5F5550]',
}: Props) {
    return (
        <View className="mb-3">
            {label ? <Text className={`mb-1 text-sm font-medium ${labelClassName}`}>{label}</Text> : null}
            {/* Đổi từ rounded-2xl sang rounded-lg để ô nhập liệu vuông vức (hình chữ nhật) */}
            <View className="h-12 flex-row items-center rounded-lg border border-[#E7DED4] bg-white px-3">
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    className="flex-1 text-[15px] text-[#2B2B2B]"
                    placeholderTextColor="#A29D97"
                />
                {typeof onToggleSecure === 'function' ? (
                    <Pressable onPress={onToggleSecure} hitSlop={10}>
                        <Ionicons name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8E8E8E" />
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}