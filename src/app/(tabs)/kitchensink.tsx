import React, { useState } from "react"
import { Pressable, Text, View, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

import CircularButton from "@/components/buttons/CircularButton"
import TransactionRow from "@/components/containers/TransactionGroupContainer"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import BalanceCard from "@/components/widgets/BalanceWidget"
import AlertModal from "@/components/modal/AlertModal"

export default function KitchensinkScreen() {
  const router = useRouter()

  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showConfirmAlert, setShowConfirmAlert] = useState(false)

  return (
    <SafeAreaView className='bg-gray-100 dark:bg-primary-950 flex-1 gap-4'>
      <ScreenTitle title='Kitchensink' />

      <ScrollView
        className='flex-1'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Button zu Category Settings */}
        <View className='mx-6 mb-2'>
          <Pressable
            onPress={() => router.push("/settings/categorySettings")}
            className='bg-primary-600 dark:bg-primary-700 px-4 py-2 rounded-xl self-start'
          >
            <Text className='text-white font-medium text-sm'>
              Kategorie bearbeiten
            </Text>
          </Pressable>
        </View>

        <View className='mx-6 flex-col gap-2 justify-start items-start'>
          <Text className='text-gray-900 dark:text-gray-100'>
            Circular Button
          </Text>
          <CircularButton icon='home' onPress={() => router.replace("/home")} />
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
            <EmojiWithBackground size='xs' color='turquoise' emoji='💚' />
          </View>
        </View>

        {/* Demo Buttons für Alerts */}
        <View className='mx-6 flex-row gap-2 mt-6'>
          <Pressable
            className='bg-red-500 px-4 py-2 rounded-xl'
            onPress={() => setShowErrorAlert(true)}
          >
            <Text className='text-white font-medium text-sm'>Error Alert</Text>
          </Pressable>

          <Pressable
            className='bg-blue-500 px-4 py-2 rounded-xl'
            onPress={() => setShowConfirmAlert(true)}
          >
            <Text className='text-white font-medium text-sm'>
              Confirm Alert
            </Text>
          </Pressable>
        </View>
      </ScrollView>

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
          // TODO: Aktion bei Bestätigung
        }}
        onCancel={() => setShowConfirmAlert(false)}
      />
    </SafeAreaView>
  )
}
