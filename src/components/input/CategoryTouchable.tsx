import { colors, CustomColorKeys } from "@/assets/colors"
import { Ionicons } from "@expo/vector-icons"
import { Text, TouchableOpacity, useColorScheme } from "react-native"
import EmojiWithBackground from "../display/EmojiWithBackground"

type CategoryTouchableProps = {
  color?: CustomColorKeys
  emoji?: string
  title: string
  onPress: () => Promise<void>
  showDelete?: boolean
}

export default function CategoryTouchable(props: CategoryTouchableProps) {
  const color = props.color ?? "gray"
  const emoji = props.emoji ?? " "

  const scheme = useColorScheme()
  const iconColor = scheme === "dark" ? colors.gray[50] : colors.gray[900]

  return (
    <TouchableOpacity
      className='flex-row justify-between items-center bg-gray-50 dark:bg-primary-800 rounded-lg p-2 pr-4'
      onPress={props.onPress}
    >
      <EmojiWithBackground color={color} emoji={emoji} size='xs' />
      <Text className='text-gray-900 dark:text-gray-50  ml-2 flex-1'>
        {props.title}
      </Text>
      <Ionicons
        name={props.showDelete ? "trash-outline" : "chevron-forward"}
        size={16}
        color={props.showDelete ? colors.functional.delete : colors.gray[50]}
      />
    </TouchableOpacity>
  )
}
