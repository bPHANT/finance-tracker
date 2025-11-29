import Button from "@/components/buttons/Button"
import CircularButton from "@/components/buttons/CircularButton"
import BudgetContainer from "@/components/containers/BudgetContainer"
import TransactionRow from "@/components/containers/TransactionGroupContainer"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import BalanceCard from "@/components/widgets/BalanceWidget"
import { useRouter } from "expo-router"
import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function KitchensinkScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className='bg-gray-100 dark:bg-primary-950 flex-1'>
      <ScrollView>
        <ScreenTitle title='Kitchensink' />

        {/* Button zu Category Settings */}
        <View className='mx-6 mb-2 gap-2'>
          <Button
            onPress={() => router.push("/settings/categorySettings")}
            title='Kategorie bearbeiten'
          ></Button>
          <Button
            onPress={() =>
              router.push({
                pathname: "/(tabs)/budget/[budgetId]",
                params: { budgetId: "-1" },
              })
            }
            title='Budget erstellen'
          ></Button>
        </View>

        <View className='mx-6 flex-col gap-2 justify-start items-start'>
          <Text className='text-gray-900 dark:text-gray-100'>
            Circular Button
          </Text>
          <CircularButton icon='home' onPress={() => router.replace("/home")} />
        </View>

        <TransactionRow
          name='Kino - UCI Dresden'
          amount={"-16.5"}
          emoji='🎬'
          color='blue'
        />

        <TransactionRow
          name='Laptop verkauft'
          amount={"1000"}
          emoji='💻'
          color='gray'
        />

        <View className='mx-6 flex-col gap-2 mt-4'>
          <Text className='text-gray-900 dark:text-gray-100'>
            BalanceWidget
          </Text>
          <BalanceCard
            amount='3.161,45'
            data={[3800, 3200, 10000, 2900, 3161]} // Beispielverlauf
          />
        </View>

        <View className='mx-6 flex-col gap-2 justify-start items-start'>
          <Text className='text-gray-900 dark:text-gray-100'>
            Emoji with Background
          </Text>
          <View className='flex-row gap-2'>
            <EmojiWithBackground size='l' color='orange' emoji='🥰' />
            <EmojiWithBackground size='s' color='blue' emoji='💩' />
            <EmojiWithBackground size='xs' color='turquoise' emoji='💛' />
          </View>
        </View>

        <View className='mx-6 flex-col gap-2 mt-4'>
          <Text className='text-gray-900 dark:text-gray-100'>
            Budget Container
          </Text>
          <View className='gap-0.5'>
            <BudgetContainer
              name='Freizeitaktivitäten'
              amount='3.000,00'
              paidAmount='800,00'
              color='orange'
              emoji='⚽'
              onPress={() => console.log("Freizeitaktivitäten clicked")}
            />
            <BudgetContainer
              name='Lebensmittel'
              amount='500,00'
              paidAmount='400,00'
              color='turquoise'
              emoji='🛒'
              onPress={() => console.log("Lebensmittel clicked")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
