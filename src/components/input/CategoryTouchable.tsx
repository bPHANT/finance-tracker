import { colors, CustomColorKeys } from "@/assets/colors"
import { Ionicons } from "@expo/vector-icons"
import { Text, TouchableOpacity } from "react-native"
import EmojiWithBackground from "../display/EmojiWithBackground"

type CategoryTouchableProps = {
  color?: CustomColorKeys
  emoji?: string
  title: string
  onPress: () => Promise<void>
}

export default function CategoryTouchable(props: CategoryTouchableProps) {
  const color = props.color ?? "gray"
  const emoji = props.emoji ?? " "
  return (
    <TouchableOpacity
      className='flex-row justify-between items-center bg-primary-600 dark:bg-primary-800 rounded-lg p-2 pr-4'
      onPress={props.onPress}
    >
      <EmojiWithBackground color={color} emoji={emoji} size='xs' />
      <Text className='text-gray-900 dark:text-gray-50'>{props.title}</Text>
      <Ionicons name={"chevron-forward"} size={16} color={colors.gray[50]} />
    </TouchableOpacity>
  )
}
