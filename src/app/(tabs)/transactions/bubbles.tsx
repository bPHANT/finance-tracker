import { colors, type CustomColorKeys } from "@/assets/colors"
import { Treemap } from "@/components/bubbles/Treemap"
import { type BoxData } from "@/components/bubbles/TreemapBox"
import { NavigationPathItem } from "@/components/display/NavigationPath"
import TransactionListModal, {
  TransactionItem,
} from "@/components/modal/TransactionListModal"
import useCategory from "@/db/queries/category"
import useTransaction from "@/db/queries/transaction"
import { useFocusEffect } from "expo-router"
import { useCallback, useRef, useState } from "react"
import { BackHandler } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function BubbleScreen() {
  const { getManyWithAmount: getCategories, hasChildren, get } = useCategory()
  const { getByCategoryId } = useTransaction()
  const getCategoriesRef = useRef(getCategories)
  getCategoriesRef.current = getCategories

  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [categoryStack, setCategoryStack] = useState<(number | null)[]>([null])
  const [navigationPath, setNavigationPath] = useState<NavigationPathItem[]>([])
  const [data, setData] = useState<BoxData[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<
    TransactionItem[]
  >([])
  const [selectedCategory, setSelectedCategory] = useState<{
    name: string
    emoji: string
  }>({ name: "", emoji: "" })

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setCategoryStack((prev) => {
          if (prev.length > 1) {
            const newStack = prev.slice(0, -1)
            setParentCategoryId(newStack[newStack.length - 1])
            setNavigationPath((navPath) => navPath.slice(0, -1))
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
      const category = await get({ id })
      if (category) {
        setCategoryStack((prev) => [...prev, id])
        setParentCategoryId(id)
        setNavigationPath((prev) => [
          ...prev,
          { id: category.id, name: category.name },
        ])
      }
    }
  }

  const handleBoxLongPress = async (id: number) => {
    const category = data.find((box) => box.id === id)
    if (!category) return

    const transactions = await getByCategoryId({ categoryId: id })
    setSelectedCategory({ name: category.name, emoji: category.emoji })
    setSelectedTransactions(transactions)
    setModalVisible(true)
  }

  const handleBackPress = async () => {
    setCategoryStack((prev) => {
      if (prev.length > 1) {
        const newStack = prev.slice(0, -1)
        setParentCategoryId(newStack[newStack.length - 1])
        setNavigationPath((navPath) => navPath.slice(0, -1))
        return newStack
      }
      return prev
    })
  }

  return (
    <SafeAreaView
      className='flex-1 bg-background dark:bg-primary-950 mb-6'
      edges={["left", "right"]}
    >
      <Treemap
        data={data}
        onBoxPress={handleBoxPress}
        onBoxLongPress={handleBoxLongPress}
        topOffset={48}
        navigationPath={navigationPath}
        onBackPress={handleBackPress}
      />
      <TransactionListModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        transactions={selectedTransactions}
        categoryName={selectedCategory.name}
        categoryEmoji={selectedCategory.emoji}
      />
    </SafeAreaView>
  )
}
