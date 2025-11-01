import { Text, TouchableOpacity, View } from "react-native"

export default function DuoSwitch<T extends string>({
  value,
  onChange,
  options,
}: {
  value: boolean
  onChange: (val: T) => void
  options: T[]
}) {
  return (
    <View className='flex-row rounded-lg overflow-hidden border border-primary-600 dark:border-primary-800 self-center'>
      {options.map((option, i) => {
        const isSelected = value === !!i
        return (
          <TouchableOpacity
            key={option}
            disabled={isSelected}
            onPress={() => {
              onChange(option)
            }}
            className={`px-4 py-2 ${
              isSelected
                ? "bg-primary-600 dark:bg-primary-600"
                : "bg-gray-50 dark:bg-primary-900"
            }`}
          >
            <Text
              className={`font-semibold ${
                isSelected
                  ? "text-gray-50"
                  : "text-primary-600 dark:text-gray-50"
              }`}
            >
              {option}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
