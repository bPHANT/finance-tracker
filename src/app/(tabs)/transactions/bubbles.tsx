import { colors, type CustomColorKeys } from "@/assets/colors"
import { Treemap } from "@/components/bubbles/Treemap"
import { type BoxData } from "@/components/bubbles/TreemapBox"
import useCategory from "@/db/queries/category"
import { useFocusEffect } from "expo-router"
import { useCallback, useRef, useState } from "react"
import { BackHandler } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function BubbleScreen() {
  const { getManyWithAmount: getCategories, hasChildren } = useCategory()
  const getCategoriesRef = useRef(getCategories)
  getCategoriesRef.current = getCategories

  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null)
  const [categoryStack, setCategoryStack] = useState<(number | null)[]>([null])
  const [data, setData] = useState<BoxData[]>([])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setCategoryStack((prev) => {
          if (prev.length > 1) {
            const newStack = prev.slice(0, -1)
            setParentCategoryId(newStack[newStack.length - 1])
            return newStack
          }
          return prev
        })
        return true
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      )

      return () => subscription.remove()
    }, [])
  )

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const categories = await getCategoriesRef.current({
          parentId: parentCategoryId,
        })

        const boxData: BoxData[] = categories
          .filter((cat) => {
            const amount =
              typeof cat.totalAmount === "number"
                ? cat.totalAmount
                : parseFloat(cat.totalAmount)
            return amount !== 0
          })
          .map((cat) => {
            const amount =
              typeof cat.totalAmount === "number"
                ? cat.totalAmount
                : parseFloat(cat.totalAmount)
            return {
              id: cat.id,
              name: cat.name,
              emoji: cat.emoji,
              value: Math.abs(amount),
              displayAmount: amount,
              color: colors.custom[cat.color as CustomColorKeys],
            }
          })

        setData(boxData)
      }

      fetchData()
    }, [parentCategoryId])
  )

  const handleBoxPress = async (id: number) => {
    if (await hasChildren({ categoryId: id })) {
      setCategoryStack((prev) => [...prev, id])
      setParentCategoryId(id)
    }
  }

  return (
    <SafeAreaView
      className='flex-1 bg-background dark:bg-primary-950 mb-6'
      edges={["left", "right"]}
    >
      <Treemap data={data} onBoxPress={handleBoxPress} topOffset={48} />
    </SafeAreaView>
  )
}
