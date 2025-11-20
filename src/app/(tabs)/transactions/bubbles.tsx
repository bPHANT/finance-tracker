import { Treemap } from "@/components/bubbles/Treemap"
import { type BoxData } from "@/components/bubbles/TreemapBox"
import { SafeAreaView } from "react-native-safe-area-context"

const SAMPLE_DATA: BoxData[] = [
  { id: "1", name: "Groceries", emoji: "🛒", value: 450, color: "#FF6B6B" },
  { id: "2", name: "Rent", emoji: "🏠", value: 1200, color: "#4ECDC4" },
  { id: "3", name: "Transport", emoji: "🚗", value: 200, color: "#45B7D1" },
  { id: "4", name: "Entertainment", emoji: "🎬", value: 150, color: "#FFA07A" },
  { id: "5", name: "Utilities", emoji: "💡", value: 300, color: "#98D8C8" },
  { id: "6", name: "Dining", emoji: "🍽️", value: 250, color: "#F7DC6F" },
  { id: "7", name: "Shopping", emoji: "🛍️", value: 180, color: "#BB8FCE" },
  { id: "8", name: "Health", emoji: "⚕️", value: 120, color: "#85C1E2" },
]

export default function BubbleScreen() {
  const handleBoxPress = (id: string) => {
    console.log("Box pressed:", id)
    // Handle box press by id here
  }

  return (
    <SafeAreaView
      className='flex-1 bg-background dark:bg-primary-950 mb-6'
      edges={["left", "right"]}
    >
      <Treemap data={SAMPLE_DATA} onBoxPress={handleBoxPress} topOffset={48} />
    </SafeAreaView>
  )
}
