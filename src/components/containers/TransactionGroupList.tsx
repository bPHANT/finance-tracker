import { useRef } from "react"
import { View } from "react-native"
import TransactionGroupContainer, {
  TransactionGroupContainerProps,
  TransactionGroupContainerRef,
} from "./TransactionGroupContainer"

export type TransactionGroupListProps = {
  groups: TransactionGroupContainerProps[]
  onDelete?: (id: number) => void
  onPress?: (id: number) => void
}

export default function TransactionGroupList(props: TransactionGroupListProps) {
  const length = props.groups.length
  const swipeableRefs = useRef<(TransactionGroupContainerRef | null)[]>([])

  const handleSwipeOpen = (openIndex: number) => {
    // Close all other swipeables when one opens
    swipeableRefs.current.forEach((ref, index) => {
      if (index !== openIndex && ref) {
        ref.close()
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (props.onDelete) {
      await props.onDelete(id)
      // Reset all refs after deletion to prevent stale references
      swipeableRefs.current = []
    }
  }

  return (
    <View className='rounded-xl bg-gray-200 dark:bg-primary-700 gap-0.5'>
      {props.groups.map((group, index) => {
        return (
          <TransactionGroupContainer
            key={`${group.id}-${index}`}
            ref={(ref) => {
              swipeableRefs.current[index] = ref
            }}
            name={group.name}
            amount={group.amount}
            color={group.color}
            emoji={group.emoji}
            id={group.id}
            onDelete={handleDelete}
            onSwipeOpen={() => handleSwipeOpen(index)}
            onPress={props.onPress}
            rounded={
              length === 1
                ? "full"
                : index === 0
                ? "top"
                : index === length - 1
                ? "bottom"
                : undefined
            }
          />
        )
      })}
    </View>
  )
}
