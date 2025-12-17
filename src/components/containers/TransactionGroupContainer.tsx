import { CustomColorKeys } from "@/assets/colors"
import AmountBadge from "@/components/display/AmountBadge"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import AlertModal from "@/components/modal/AlertModal"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { Ionicons } from "@expo/vector-icons"
import { forwardRef, useImperativeHandle, useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"

export type TransactionGroupContainerProps = {
  name: string
  amount: string
  color: CustomColorKeys
  emoji: string
  rounded?: "top" | "bottom" | "full"
  id: number
  onDelete?: (id: number) => void
  onSwipeOpen?: () => void
  onPress?: (id: number) => void
}

export type TransactionGroupContainerRef = {
  close: () => void
}

const TransactionGroupContainer = forwardRef<
  TransactionGroupContainerRef,
  TransactionGroupContainerProps
>((props, ref) => {
  const { t } = useTypedTranslation()
  const translateX = useSharedValue(0)
  const isOpen = useSharedValue(false)
  const [alertVisible, setAlertVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    close: () => {
      translateX.value = withSpring(0)
      isOpen.value = false
    },
  }))

  const rounded = {
    none: "",
    top: "rounded-t-xl",
    bottom: "rounded-b-xl",
    full: "rounded-xl",
  }[props.rounded ?? "none"]

  const handleDelete = () => {
    if (props.id && props.onDelete) {
      setAlertVisible(true)
    }
  }

  const executeDelete = () => {
    setAlertVisible(false)
    props.onDelete!(props.id!)
  }

  const onSwipeOpen = () => {
    props.onSwipeOpen?.()
  }

  const onPressHandler = () => {
    props.onPress?.(props.id)
  }

  const gestureHandlerPan = Gesture.Pan()
    .onStart(() => {
      if (!isOpen.value) {
        scheduleOnRN(onSwipeOpen)
      }
    })
    .onUpdate((event) => {
      const clampedTranslateX = Math.min(0, Math.max(-100, event.translationX))
      translateX.value = clampedTranslateX
    })
    .onEnd((event) => {
      const shouldOpen = event.translationX < -40 || event.velocityX < -500

      if (shouldOpen) {
        translateX.value = withSpring(-80)
        isOpen.value = true
      } else {
        translateX.value = withSpring(0)
        isOpen.value = false
      }
    })

  const gestureHandlerPress = Gesture.Tap().onEnd(() => {
    scheduleOnRN(onPressHandler)
  })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const deleteButtonStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -10 ? 1 : 0,
  }))

  const TransactionContent = () => (
    <View
      className={`bg-gray-50 dark:bg-primary-800 px-4 py-3 flex-row items-center justify-between ${rounded}`}
    >
      <View className='flex-row items-center gap-3'>
        <EmojiWithBackground
          size='xs'
          color={props.color}
          emoji={props.emoji}
        />
        <Text className='text-gray-950 dark:text-gray-100 font-medium text-base'>
          {props.name}
        </Text>
      </View>

      <AmountBadge amount={props.amount} />
    </View>
  )

  if (props.id && props.onDelete) {
    return (
      <>
        <AlertModal
          visible={alertVisible}
          type='confirm'
          title={t("common.deleteTransaction")}
          message={t("common.deleteTransactionConfirmation")}
          onConfirm={executeDelete}
          onCancel={() => setAlertVisible(false)}
        />
        <View className='relative overflow-hidden'>
          <Animated.View
            style={[deleteButtonStyle]}
            className={`absolute right-0 top-0 bottom-0 w-20 bg-balance-red dark:bg-balance-red-dark flex-row items-center justify-center ${rounded}`}
          >
            <TouchableOpacity
              onPress={handleDelete}
              className='flex-1 items-center justify-center'
            >
              <Ionicons name='trash-outline' size={24} color='white' />
            </TouchableOpacity>
          </Animated.View>

          <GestureDetector
            gesture={Gesture.Exclusive(gestureHandlerPan, gestureHandlerPress)}
          >
            <Animated.View style={animatedStyle}>
              <TransactionContent />
            </Animated.View>
          </GestureDetector>
        </View>
      </>
    )
  }

  return <TransactionContent />
})

TransactionGroupContainer.displayName = "TransactionGroupContainer"

export default TransactionGroupContainer
