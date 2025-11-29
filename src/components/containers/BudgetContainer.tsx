import { CustomColorKeys, colors } from "@/assets/colors"
import AmountBadge from "@/components/display/AmountBadge"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import { Ionicons } from "@expo/vector-icons"
import { Text, TouchableOpacity, View } from "react-native"

export type BudgetContainerProps = {
  name: string
  amount: string
  paidAmount: string
  color: CustomColorKeys
  emoji: string
  onPress?: () => void
}

export default function BudgetContainer(props: BudgetContainerProps) {
  // Calculate progress percentage
  const parseAmount = (value: string): number => {
    return parseFloat(value.replace(/[^0-9.-]/g, "").replace(",", ".")) || 0
  }

  const targetAmount = parseAmount(props.amount)
  const paid = parseAmount(props.paidAmount)
  const progressPercentage =
    targetAmount > 0 ? Math.min((paid / targetAmount) * 100, 100) : 0

  return (
    <TouchableOpacity
      onPress={props.onPress}
      disabled={!props.onPress}
      activeOpacity={0.7}
      className='bg-gray-50 dark:bg-primary-800 px-4 py-3 rounded-xl'
    >
      {/* Top Section: Emoji, Name */}
      <View className='flex-row items-center justify-between mb-3'>
        <View className='flex-row items-center gap-3 flex-1'>
          <EmojiWithBackground
            size='xs'
            color={props.color}
            emoji={props.emoji}
          />
          <View className='gap-1 flex-1'>
            <Text
              className='text-gray-950 dark:text-gray-100 font-medium text-base'
              numberOfLines={1}
            >
              {props.name}
            </Text>
            <View className='self-start'>
              <AmountBadge amount={props.amount} variant='blue' />
            </View>
          </View>
        </View>

        {props.onPress && (
          <Ionicons name='chevron-forward' size={20} color={colors.gray[400]} />
        )}
      </View>

      {/* Progress Bar Section */}
      <View className='h-2 bg-gray-200 dark:bg-primary-950 rounded-full overflow-hidden'>
        {/* Progress Bar Fill */}
        <View
          className='h-full bg-primary-600 dark:bg-primary-500 rounded-full'
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
    </TouchableOpacity>
  )
}
