import { colors, CustomColorKeys } from "@/assets/colors"
import { Ionicons } from "@expo/vector-icons"
import { Text, TouchableOpacity, View } from "react-native"
import EmojiWithBackground from "../display/EmojiWithBackground"

type ButtonProps = {
  title: string
  icon?: keyof typeof Ionicons.glyphMap
  emojiWithBackground?: {
    emoji: string
    color: CustomColorKeys
  }
  arrowRight?: boolean
  textLeft?: boolean
  functional?: "submit" | "cancel"
  onPress: () => void
}

export default function Button(props: ButtonProps) {
  const bg = props.functional
    ? props.functional === "submit"
      ? "bg-functional-submit"
      : "bg-functional-delete"
    : "bg-gray-50 dark:bg-primary-800" // <— DEIN Weiß!

  const flex = props.arrowRight ? "flex-1" : ""
  const textLeft = props.textLeft ? "justify-start" : "justify-center"

  return (
    <TouchableOpacity
      onPress={props.onPress}
      className={`flex-row ${textLeft} items-center ${flex} relative ${bg} rounded-lg p-4 gap-3`}
    >
      {props.icon && (
        <Ionicons
          name={props.icon}
          size={16}
          color={colors.gray[900]} // dark text on white
        />
      )}

      {props.emojiWithBackground && (
        <EmojiWithBackground
          color={props.emojiWithBackground.color}
          emoji={props.emojiWithBackground.emoji}
          size='xs'
        />
      )}

      <Text className='text-gray-900 dark:text-gray-50 font-semibold rounded-lg'>
        {props.title}
      </Text>

      {props.arrowRight && (
        <View className='absolute right-4'>
          <Ionicons
            name={"chevron-forward"}
            size={16}
            color={colors.gray[900]}
          />
        </View>
      )}
    </TouchableOpacity>
  )
}
