import { Ionicons } from "@expo/vector-icons"
import { useColorScheme } from "nativewind"
import { Text, TouchableOpacity, View } from "react-native"

export default function ScreenTitle({
  title,
  onBack,
}: {
  title: string
  onBack?: () => Promise<void> | undefined
}) {
  const { colorScheme } = useColorScheme()

  return (
    <View className='flex-row items-center mb-2'>
      {onBack && (
        <TouchableOpacity className='p-2 rounded-full' onPress={onBack}>
          <Ionicons
            name='arrow-back'
            size={24}
            color={colorScheme === "light" ? "#28535c" : "#fff"}
          />
        </TouchableOpacity>
      )}

      <Text className='text-title font-bold text-primary-600 dark:text-gray-100'>
        {title}
      </Text>
    </View>
  )
}
