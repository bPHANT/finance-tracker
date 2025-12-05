import { colors, CustomColorKeys } from "@/assets/colors"
import { Ionicons } from "@expo/vector-icons"
import { useColorScheme } from "nativewind"
import { Text, TouchableOpacity, View } from "react-native"
import EmojiWithBackground from "../display/EmojiWithBackground"

export type Category = {
  id: number | null
  name: string
  color: CustomColorKeys
  emoji: string
  parentCategoryId?: number | null
}

export type CategoryWithChildrenCheck = Category & {
  hasChildren?: boolean
}

type NavigationContainerProps = {
  category: CategoryWithChildrenCheck
  currentCategoryId?: number
  onPress: (category: CategoryWithChildrenCheck) => Promise<void>
  onNavigationPress?: (category: CategoryWithChildrenCheck) => Promise<void>
}

export default function NavigationContainer(props: NavigationContainerProps) {
  const { colorScheme } = useColorScheme()

  return (
    <View
      key={props.category.id}
      className={`flex-row items-center rounded-xl ${
        props.currentCategoryId === props.category.id
          ? "bg-primary-200 dark:bg-primary-700"
          : "bg-gray-50 dark:bg-primary-800"
      }`}
    >
      <TouchableOpacity
        onPress={() => props.onPress(props.category)}
        className='flex-1 flex-row items-center p-4'
        activeOpacity={0.7}
      >
        <EmojiWithBackground
          color={props.category.color}
          emoji={props.category.emoji}
          size='xs'
        />
        <Text
          className={`text-base ml-4 flex-1 ${
            props.currentCategoryId === props.category.id
              ? "text-primary-800 dark:text-primary-200 font-semibold"
              : "text-gray-900 dark:text-gray-100"
          }`}
        >
          {props.category.name}
        </Text>
      </TouchableOpacity>

      {props.category.hasChildren && (
        <TouchableOpacity
          onPress={() => props.onNavigationPress?.(props.category)}
          className='p-2 items-center justify-center border-2 border-gray-500 dark:border-primary-500 rounded-xl m-4'
        >
          <Ionicons
            name='chevron-forward-outline'
            size={24}
            color={
              colorScheme === "dark" ? colors.primary[500] : colors.gray[500]
            }
          />
        </TouchableOpacity>
      )}
    </View>
  )
}
