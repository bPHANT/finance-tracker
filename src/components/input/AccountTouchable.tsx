import { colors } from "@/assets/colors"
import { Ionicons } from "@expo/vector-icons"
import { Text, TouchableOpacity } from "react-native"

type AccountTouchableProps = {
  title: string
  onPress: () => Promise<void>
}

export default function AccountTouchable(props: AccountTouchableProps) {
  return (
    <TouchableOpacity
      className='flex-row justify-between items-center bg-gray-50 dark:bg-primary-800 rounded-lg p-4'
      onPress={props.onPress}
    >
      <Text className='text-gray-900 dark:text-gray-50 flex-1'>
        {props.title}
      </Text>
      <Ionicons name='chevron-forward' size={16} color={colors.gray[50]} />
    </TouchableOpacity>
  )
}
