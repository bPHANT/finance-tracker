import { CustomColorKeys } from "@/assets/colors"
import AmountBadge from "@/components/display/AmountBadge"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { Ionicons } from "@expo/vector-icons"
import { forwardRef, useImperativeHandle } from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import Button from "../buttons/Button"


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
      Alert.alert(
        t("common.deleteTransaction"),
        t("common.deleteTransactionConfirmation"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: () => props.onDelete!(props.id!),
          },
        ]
      )
    }
  }

  const handlePress = () => {
    if (isOpen.value) return
    if (props.onPress) props.onPress(props.id)
    console.log("PRESS")
  }

  const onSwipeOpen = () => {
    runOnJS(props.onSwipeOpen ?? (() => {}))()
  }

  const gestureHandler = Gesture.Pan()
    .minDistance(100)
    .onStart(() => {
      if (!isOpen.value) {
        runOnJS(onSwipeOpen)()
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
      <Button
        title={"TEST"}
        onPress={() => console.log("PRESSED")} />

      <AmountBadge amount={props.amount} />
    </View>
    
  )

  if (props.id && props.onDelete) {
    return (
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

        <GestureDetector gesture={gestureHandler}>
          <Animated.View style={animatedStyle}>
            <TransactionContent />
          </Animated.View>
        </GestureDetector>
      </View>
    )
  }

  return <TransactionContent />
})

TransactionGroupContainer.displayName = "TransactionGroupContainer"

export default TransactionGroupContainer
