import { CustomColorKeys } from "@/assets/colors"
import { View } from "react-native"
import Emoji from "./Emoji"

export default function EmojiWithBackground(props: {
  size: "xs" | "s" | "l"
  emoji: string
  color: CustomColorKeys
}) {
  const backgroundSize = {
    xs: "size-16",
    s: "size-20",
    l: "size-40",
  }[props.size]

  const emojiSize = {
    xs: "text-emoji-xs",
    s: "text-emoji-s",
    l: "text-emoji-xl",
  }[props.size]

  const emoji = props.emoji

  const color = {
    orange: "bg-custom-orange",
    turquoise: "bg-custom-turquoise",
    gray: "bg-custom-gray",
    violet: "bg-custom-violet",
    yellow: "bg-custom-yellow",
    blue: "bg-custom-blue",
    pink: "bg-custom-pink",
    green: "bg-custom-green",
  }[props.color]

  return (
    <View
      className={`items-center justify-center p-2 ${backgroundSize} ${color} rounded-2xl`}
    >
      <Emoji size={emojiSize} emoji={emoji} />
    </View>
  )
}
