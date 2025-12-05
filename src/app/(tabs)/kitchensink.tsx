import { useRouter } from "expo-router"
import React, { useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import CircularButton from "@/components/buttons/CircularButton"
import Button from "@/components/buttons/Button"
import BudgetContainer from "@/components/containers/BudgetContainer"
import TransactionRow from "@/components/containers/TransactionGroupContainer"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import AlertModal from "@/components/modal/AlertModal"
import AccountModal from "@/components/modal/AccountModal"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import BalanceCard from "@/components/widgets/BalanceWidget"
import { useDb } from "@/db"
import { accountTable, type Account } from "@/db/schemas/accounts"
import { eq } from "drizzle-orm"
import { useEffect } from "react"

export default function KitchensinkScreen() {
  const router = useRouter()
  const db = useDb()

  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showConfirmAlert, setShowConfirmAlert] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)

  return (
    <>
      {/* Alerts */}
      <AlertModal
        visible={showErrorAlert}
        type='error'
        title='Fehler'
        message='Es ist ein Fehler aufgetreten.'
        onConfirm={() => setShowErrorAlert(false)}
      />

      <AlertModal
        visible={showConfirmAlert}
        type='confirm'
        title='Sind Sie sich sicher?'
        message='Möchten Sie diese Aktion wirklich ausführen?'
        onConfirm={() => {
          setShowConfirmAlert(false)
        }}
        onCancel={() => setShowConfirmAlert(false)}
      />

      <AccountModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSelectAccount={(account) => {
          console.log("Selected account:", account)
          setShowAccountModal(false)
        }}
        onAddAccount={() => {
          console.log("Add new account")
          setShowAccountModal(false)
        }}
      />

      <SafeAreaView className='bg-gray-100 dark:bg-primary-950 flex-1'>
        <ScrollView>
          <ScreenTitle title='Kitchensink' />

          <ScrollView
            className='flex-1'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View className='gap-4'>
              <View className='mx-6 flex-col gap-2 justify-start items-start'>
                <Text className='text-gray-900 dark:text-gray-100'>
                  Circular Button
                </Text>
                <CircularButton
                  icon='home'
                  onPress={() => router.replace("/home")}
                />
              </View>

              <TransactionRow
                name='Kino - UCI Dresden'
                amount='-16.5'
                emoji='🎬'
                color='blue'
              />

              <TransactionRow
                name='Laptop verkauft'
                amount='1000'
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

              <View className='mx-6 flex-col gap-2 justify-start items-start mt-4'>
                <Text className='text-gray-900 dark:text-gray-100'>
                  Emoji with Background
                </Text>

                <View className='flex-row gap-2'>
                  <EmojiWithBackground size='l' color='orange' emoji='🍔' />
                  <EmojiWithBackground size='s' color='blue' emoji='⭐' />
                  <EmojiWithBackground
                    size='xs'
                    color='turquoise'
                    emoji='💛💚'
                  />
                </View>
              </View>

              {/* Demo Buttons für Alerts */}
              <View className='mx-6 flex-row gap-2 mt-6'>
                <Pressable
                  className='bg-red-500 px-4 py-2 rounded-xl'
                  onPress={() => setShowErrorAlert(true)}
                >
                  <Text className='text-gray-900 dark:text-gray-50 font-medium text-sm'>
                    Error Alert
                  </Text>
                </Pressable>

                <Pressable
                  className='bg-blue-500 px-4 py-2 rounded-xl'
                  onPress={() => setShowConfirmAlert(true)}
                >
                  <Text className='text-gray-900 dark:text-gray-50 font-medium text-sm'>
                    Confirm Alert
                  </Text>
                </Pressable>
              </View>

              {/* Account Modal Button */}
              <View className='mx-6 flex-col gap-2 mt-6'>
                <Text className='text-gray-900 dark:text-gray-100'>
                  Account Modal
                </Text>
                <Button
                  title='Manage Accounts'
                  onPress={() => setShowAccountModal(true)}
                  arrowRight
                  textLeft
                />
              </View>
            </View>
          </ScrollView>

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
    </>
  )
}
