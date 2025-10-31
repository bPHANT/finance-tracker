import { colors } from "@/assets/colors"
import { Ionicons } from "@expo/vector-icons"
import { Text, TouchableOpacity, View } from "react-native"

type ButtonProps = {
  title: string
  icon?: keyof typeof Ionicons.glyphMap
  right?: boolean
  functional?: "submit" | "cancel"
  onPress: () => void
}

export default function Button(props: ButtonProps) {
  const bg = props.functional
    ? props.functional === "submit"
      ? "bg-functional-submit"
      : "bg-functional-delete"
    : "bg-primary-600 dark:bg-primary-800"
  const flex = props.right ? "flex-1" : ""
  return (
    <TouchableOpacity
      onPress={props.onPress}
      className={`flex-row justify-center items-center ${flex} relative ${bg} rounded-lg p-4 gap-3`}
    >
      {props.icon && (
        <Ionicons name={props.icon} size={16} color={colors.gray[50]} />
      )}
      <Text className='text-gray-50 font-semibold rounded-lg'>
        {props.title}
      </Text>
      {props.right && (
        <View className='absolute right-4'>
          <Ionicons
            name={"chevron-forward"}
            size={16}
            color={colors.gray[50]}
          />
        </View>
      )}
    </TouchableOpacity>
  )
}
