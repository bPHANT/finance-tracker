import { Pressable, Text } from "react-native"
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface BoxData {
  id: number
  name: string
  emoji: string
  value: number
  displayAmount?: number
  color: string
  hasChildren?: boolean
}

interface TreemapBoxProps {
  item: BoxData
  x: number
  y: number
  width: number
  height: number
  index: number
  onPress?: (id: number) => void
  onLongPress?: (id: number) => void
}

export function TreemapBox({
  item,
  x,
  y,
  width,
  height,
  index,
  onPress,
  onLongPress,
}: TreemapBoxProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute" as const,
      left: withSpring(x, { damping: 15 }),
      top: withSpring(y, { damping: 15 }),
      width: withSpring(width, { damping: 15 }),
      height: withSpring(height, { damping: 15 }),
      opacity: withTiming(1, { duration: 300 + index * 100 }),
      transform: [
        {
          scale: withSpring(1, {
            damping: 10,
            stiffness: 100,
          }),
        },
      ],
    }
  })

  // Determine if box is large enough to show text
  const showText = width > 100
  const isSlimHeight = height < 60
  const labelFontSize = Math.max(12, Math.min(width / 8, 18))
  const emojiSize = showText
    ? labelFontSize
    : Math.max(20, Math.min(width / 3, 40))

  const handlePress = () => {
    if (onPress && item.hasChildren === true) {
      onPress(item.id)
    }
  }

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(item.id)
    }
  }

  return (
    <AnimatedPressable
      className={`p-3 border border-white/30 ${
        item.hasChildren === true ? "active:opacity-80" : ""
      } ${
        showText && isSlimHeight
          ? "flex-row justify-start items-center gap-1"
          : "justify-center items-center"
      }`}
      onPress={item.hasChildren === true ? handlePress : undefined}
      onLongPress={handleLongPress}
      style={[
        animatedStyle,
        {
          backgroundColor: item.color,
        },
      ]}
    >
      {showText ? (
        isSlimHeight ? (
          <></>
        ) : (
          <>
            <Text
              className='text-white font-bold text-center mb-1'
              style={{
                fontSize: labelFontSize,
              }}
              numberOfLines={2}
            >
              {" "}
              {item.emoji} {item.name}
            </Text>
            <Text
              className='text-white font-semibold'
              style={{
                fontSize: Math.max(10, Math.min(width / 10, 16)),
              }}
            >
              {item.displayAmount !== undefined
                ? `${item.displayAmount < 0 ? "-" : ""}${Math.abs(
                    item.displayAmount
                  ).toFixed(2)}€`
                : `${item.value.toFixed(2)}€`}
            </Text>
          </>
        )
      ) : (
        <Text
          style={{
            fontSize: emojiSize,
          }}
        >
          {item.emoji}
        </Text>
      )}
    </AnimatedPressable>
  )
}
