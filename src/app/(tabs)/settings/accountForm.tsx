import type { CustomColorKeys } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import TextField from "@/components/input/TextField"
import ColorModal from "@/components/modal/ColorModal"
import EmojiModal from "@/components/modal/EmojiModal"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useAccounts from "@/db/queries/accounts"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import React, { useCallback, useState } from "react"
import { View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"

type AccountFormDataCreate = {
  name: string
  color: CustomColorKeys
  emoji: string
  balance: number
}

type AccountFormDataUpdate = AccountFormDataCreate & {
  id: number
}

export default function AccountFormScreen() {
  const { t } = useTypedTranslation()
  const { get: getAccount } = useAccounts()

  const params = useLocalSearchParams()

  const [accountId, setAccountId] = useState<number>()
  const [accountName, setAccountName] = useState<string>("")
  const [accountColor, setAccountColor] = useState<CustomColorKeys>("gray")
  const [accountEmoji, setAccountEmoji] = useState("💰")
  const [balance, setBalance] = useState<string>("0")

  const mode = params.accountId === "-1" ? "create" : "update"

  const fetchAccount = useCallback(async () => {
    setAccountId(params.accountId ? Number(params.accountId) : 0)
    if (!accountId || accountId === -1) return

    const accountResult = await getAccount({ id: accountId })
    if (accountResult) {
      setAccountName(accountResult.name)
      setAccountColor(accountResult.color as CustomColorKeys)
      setAccountEmoji(accountResult.emoji)
      setBalance(accountResult.balance.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId])

  useFocusEffect(
    useCallback(() => {
      fetchAccount()
    }, [fetchAccount])
  )

  const [colorModalOpen, setColorModalOpen] = useState(false)
  const [emojiModalOpen, setEmojiModalOpen] = useState(false)

  async function handleNameChange(value: string) {
    setAccountName(value)
  }

  async function handleBalanceChange(value: string) {
    // Allow minus sign only at the start, numbers, and decimal point
    const cleanedValue = value.replace(/[^0-9.-]/g, "")
    // Ensure minus is only at the start
    const parts = cleanedValue.split("-")
    if (parts.length > 2 || (parts.length === 2 && parts[0] !== "")) return
    // Ensure only one decimal point
    const decimalParts = cleanedValue.split(".")
    if (decimalParts.length > 2) return
    setBalance(cleanedValue)
  }

  async function handleSubmit() {
    if (!accountName || accountName.trim() === "") {
      alert(t("screens.accountForm.alertNoName"))
      return
    }

    const finalBalance = parseFloat(balance) || 0

    if (mode === "create") {
      const accountData: AccountFormDataCreate = {
        name: accountName,
        color: accountColor,
        emoji: accountEmoji,
        balance: finalBalance,
      }
      console.log("Creating account:", accountData)
      // TODO: Implement createAccount
      // await createAccount(accountData)
    } else {
      if (!accountId) return
      const accountData: AccountFormDataUpdate = {
        id: accountId,
        name: accountName,
        color: accountColor,
        emoji: accountEmoji,
        balance: finalBalance,
      }
      console.log("Updating account:", accountData)
      // TODO: Implement updateAccount
      // await updateAccount(accountData)
    }

    router.back()
  }

  return (
    <>
      <ColorModal
        visible={colorModalOpen}
        selected={accountColor}
        onClose={() => setColorModalOpen(false)}
        onSelect={(c) => {
          setAccountColor(c)
          setColorModalOpen(false)
        }}
      />
      <EmojiModal
        visible={emojiModalOpen}
        selected={accountEmoji}
        onClose={() => setEmojiModalOpen(false)}
        onSelect={(e) => {
          setAccountEmoji(e)
          setEmojiModalOpen(false)
        }}
      />

      <SafeAreaView className='flex-1 bg-primary-50 dark:bg-primary-950'>
        <ScrollView className='flex-col gap-4 px-4'>
          <View className='gap-4'>
            <ScreenTitle
              title={
                mode === "create"
                  ? t("screens.accountForm.title.create")
                  : t("screens.accountForm.title.update")
              }
              onBack={async () => router.back()}
            />
            <View className='items-center'>
              <View>
                <EmojiWithBackground
                  size='l'
                  emoji={accountEmoji}
                  color={accountColor}
                />
              </View>
            </View>

            <TextField
              title={t("screens.accountForm.name")}
              value={accountName}
              onChangeValue={handleNameChange}
            />

            <View className='flex-row gap-4'>
              <Button
                title={t("screens.accountForm.color")}
                onPress={() => setColorModalOpen(true)}
                arrowRight
              />
              <Button
                title={t("screens.accountForm.emoji")}
                onPress={() => setEmojiModalOpen(true)}
                arrowRight
              />
            </View>

            <TextField
              title={t("screens.accountForm.balance")}
              value={balance}
              onChangeValue={handleBalanceChange}
            />

            <Button
              title={
                mode === "create"
                  ? t("screens.accountForm.create")
                  : t("common.save")
              }
              onPress={handleSubmit}
              functional='submit'
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}
