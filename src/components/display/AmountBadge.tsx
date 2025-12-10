import { View, Text } from "react-native"

type AmountBadgeProps = {
  amount: string
  variant?: "default" | "blue"
}

export default function AmountBadge({
  amount,
  variant = "default",
}: AmountBadgeProps) {
  const type = +amount >= 0 ? "positive" : "negative"
  const formatted = `${amount} €`

  const color =
    variant === "blue"
      ? "bg-primary-400 dark:bg-primary-500"
      : {
          positive: "bg-balance-green dark:bg-balance-green-dark",
          negative: "bg-balance-red dark:bg-balance-red-dark",
        }[type]

  return (
    <View className={`px-4 py-1 rounded-full ${color}`}>
      <Text className='font-bold text-sm' style={{ color: "#ffffff" }}>
        {formatted}
      </Text>
    </View>
  )
}
