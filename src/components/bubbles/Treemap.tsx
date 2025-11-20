import { useState } from "react"
import { Dimensions, LayoutChangeEvent, View } from "react-native"
import { TreemapBox, type BoxData } from "./TreemapBox"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface TreemapProps {
  data: BoxData[]
  onBoxPress?: (id: number) => void
  topOffset?: number
}

// Treemap layout algorithm to fill space without gaps
function calculateTreemapLayout(
  data: BoxData[],
  width: number,
  height: number
): (BoxData & { x: number; y: number; width: number; height: number })[] {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0)
  const result: (BoxData & {
    x: number
    y: number
    width: number
    height: number
  })[] = []

  let currentX = 0
  let currentY = 0
  let remainingWidth = width
  let remainingHeight = height
  let remainingValue = totalValue

  data.forEach((item) => {
    const ratio = item.value / remainingValue
    let boxWidth: number
    let boxHeight: number

    if (remainingWidth > remainingHeight) {
      // Split horizontally
      boxWidth = remainingWidth * ratio
      boxHeight = remainingHeight
      result.push({
        ...item,
        x: currentX,
        y: currentY,
        width: boxWidth,
        height: boxHeight,
      })
      currentX += boxWidth
      remainingWidth -= boxWidth
    } else {
      // Split vertically
      boxWidth = remainingWidth
      boxHeight = remainingHeight * ratio
      result.push({
        ...item,
        x: currentX,
        y: currentY,
        width: boxWidth,
        height: boxHeight,
      })
      currentY += boxHeight
      remainingHeight -= boxHeight
    }

    remainingValue -= item.value
  })

  return result
}

export function Treemap({ data, onBoxPress, topOffset = 72 }: TreemapProps) {
  const [containerHeight, setContainerHeight] = useState(0)

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height)
  }

  const boxes = calculateTreemapLayout(data, SCREEN_WIDTH, containerHeight)

  return (
    <View
      className='flex-1'
      style={{ marginTop: topOffset }}
      onLayout={handleLayout}
    >
      {containerHeight > 0 && (
        <View className='flex-1 relative'>
          {boxes.map((box, index) => (
            <TreemapBox
              key={box.id}
              item={box}
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
              index={index}
              onPress={onBoxPress}
            />
          ))}
        </View>
      )}
    </View>
  )
}
