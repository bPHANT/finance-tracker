import { Pressable, Text } from "react-native"
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface BoxData {
  id: string
  name: string
  emoji: string
  value: number
  color: string
}

interface TreemapBoxProps {
  item: BoxData
  x: number
  y: number
  width: number
  height: number
  index: number
  onPress?: (id: string) => void
}

export function TreemapBox({
  item,
  x,
  y,
  width,
  height,
  index,
  onPress,
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

  // Determine if box is large enough to show text (threshold: 100px width)
  const showText = width > 100
  const labelFontSize = Math.max(12, Math.min(width / 8, 18))
  const emojiSize = showText
    ? labelFontSize
    : Math.max(20, Math.min(width / 3, 40))

  const handlePress = () => {
    if (onPress) {
      onPress(item.id)
    }
  }

  return (
    <AnimatedPressable
      className='p-3 justify-center items-center border border-white/30 active:opacity-80'
      onPress={handlePress}
      style={[
        animatedStyle,
        {
          backgroundColor: item.color,
        },
      ]}
    >
      {showText ? (
        <>
          <Text
            className='text-white font-bold text-center mb-1'
            style={{
              fontSize: labelFontSize,
            }}
            numberOfLines={2}
          >
            {item.emoji} {item.name}
          </Text>
          <Text
            className='text-white font-semibold'
            style={{
              fontSize: Math.max(10, Math.min(width / 10, 16)),
            }}
          >
            ${item.value}
          </Text>
        </>
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
