import { CustomColorKeys } from "@/assets/colors"
import { Text, View } from "react-native-reanimated/lib/typescript/Animated"
import EmojiWithBackground from "../display/EmojiWithBackground"

export type CategoryContainerProps = {
  title: string
  color: CustomColorKeys
  emoji: string
}

export default function CategoryContainer(props: CategoryContainerProps) {
  return (
    <View className='flex-row items-center justify-center bg-primary-50 dark:bg-primary-950'>
      <EmojiWithBackground size='s' color={props.color} emoji={props.emoji} />
      <Text className='text-gray-900 dark:text-gray-100 ml-2'>
        {props.title}
      </Text>
    </View>
  )
}
