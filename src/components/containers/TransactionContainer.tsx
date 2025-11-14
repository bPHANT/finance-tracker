import { CustomColorKeys } from "@/assets/colors"
import { Text, View } from "react-native"
import InteractionButton from "../buttons/InteractionButton"
import EmojiWithBackground from "../display/EmojiWithBackground"

type TransactionContainerProps = {
  name: string
  specific?: string
  amount: string
  category: {
    name: string
    color: CustomColorKeys
    emoji: string
  }
  onEdit?: () => Promise<void>
  onDelete?: () => Promise<void>
}

export default function TransactionContainer(props: TransactionContainerProps) {
  const categoryColor = {
    orange: "text-custom-orange",
    turquoise: "text-custom-turquoise",
    gray: "text-custom-gray",
    violet: "text-custom-violet",
    yellow: "text-custom-yellow",
    blue: "text-custom-blue",
    pink: "text-custom-pink",
    green: "text-custom-green",
  }[props.category.color]

  const balanceColor = props.amount.startsWith("-")
    ? "text-balance-red dark:text-balance-red-dark"
    : "text-balance-green dark:text-balance-green-dark"

  return (
    <View className='flex-row justify-between items-center bg-gray-50 dark:bg-primary-800 rounded-xl p-4 gap-4'>
      <EmojiWithBackground
        color={props.category.color}
        emoji={props.category.emoji}
        size='s'
      />
      <View className='flex-col flex-1'>
        <Text className={`text-info flex-wrap ${categoryColor}`}>
          {props.category.name}
        </Text>
        <Text className='text-base font-semibold flex-wrap text-gray-950 dark:text-gray-100'>
          {props.name}
        </Text>
        {props.specific && (
          <Text className='text-info flex-wrap text-gray-950 dark:text-gray-100'>
            {props.specific}
          </Text>
        )}
        <Text className={`text-info font-bold ${balanceColor}`}>
          {props.amount} €
        </Text>
      </View>
      <View className='flex-col gap-4 items-center'>
        <InteractionButton type={"edit"} onPress={props.onEdit} />
        <InteractionButton type={"delete"} onPress={props.onDelete} />
      </View>
    </View>
  )
}
