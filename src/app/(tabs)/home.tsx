import CircularButton from "@/components/buttons/CircularButton"
import useTransaction from "@/db/queries/transaction"
import useTransactionGroup from "@/db/queries/transactionGroup"
import { router, useFocusEffect } from "expo-router"
import { useCallback, useState } from "react"
import { BackHandler, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function HomeScreen() {
  const { error } = useTransactionGroup()

  const { getTotalAmount } = useTransaction()

  const [totalAmount, setTotalAmount] = useState<string>("0")

  const fetchTotalAmount = useCallback(async () => {
    try {
      const totalAmountResult = await getTotalAmount()
      setTotalAmount(totalAmountResult ?? "0")
    } catch (err) {
      console.error("Failed to fetch totalAmount:", err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
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
      fetchTotalAmount()
    }, [fetchTotalAmount])
  )

  return (
    <SafeAreaView className='flex-1 bg-gray-100 dark:bg-primary-950 '>
      <View className='mx-4 gap-4'>
        {error && (
          <View className=' p-3 bg-red-100 border border-red-400 rounded'>
            <Text className='text-red-800'>{error.message}</Text>
          </View>
        )}
        <View className='flex-row justify-center pt-2 gap-4'>
          <CircularButton icon='search' onPress={() => {}} />
          <CircularButton
            icon='grid-outline'
            onPress={() => router.push("/kitchensink")}
          />
        </View>
        <View className='bg-primary-600 dark:bg-primary-800 p-4 rounded-lg'>
          <Text className='text-gray-50 text-base text-center'>
            {totalAmount} €
          </Text>
        </View>
        {/* <Button
          title='Debug'
          onPress={() => {
            handleDebug()
          }}
        /> */}
      </View>
    </SafeAreaView>
  )
}
