import type { CustomColorKeys } from "@/assets/colors"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import useAccounts from "@/db/queries/accounts"
import { Ionicons } from "@expo/vector-icons"
import { useColorScheme } from "nativewind"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

type Account = {
  id: number
  name: string
  balance: number
  color: string
  emoji: string
}

type Props = {
  visible: boolean
  onClose: () => void
  onSelectAccount: (account: Account) => void
  onAddAccount: () => void
}

export default function AccountModal({
  visible,
  onClose,
  onSelectAccount,
  onAddAccount,
}: Props) {
  const { colorScheme } = useColorScheme()
  const isLight = colorScheme === "light"
  const { getMany: getAccounts, loading } = useAccounts()
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    const loadAccounts = async () => {
      const result = await getAccounts()
      if (result) {
        setAccounts(result)
      }
    }
    if (visible) {
      loadAccounts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance)
  }

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent
      onRequestClose={onClose}
    >
      <Pressable className='flex-1' onPress={onClose} />

      <View
        className={`absolute left-0 right-0 bottom-0 max-h-3/4 rounded-lg px-4 pb-4 pt-5 ${
          isLight ? "bg-gray-50" : "bg-primary-900"
        }`}
      >
        <View className='flex-row justify-between items-center mb-3'>
          <Text
            className={`text-subtitle ${
              isLight ? "text-gray-950" : "text-gray-50"
            }`}
          >
            Konten
          </Text>

          <View className='flex-row items-center gap-3'>
            <TouchableOpacity onPress={onAddAccount} hitSlop={12}>
              <Ionicons
                name='add'
                size={28}
                color={isLight ? "#1f2937" : "#f9fafb"}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text className={`${isLight ? "text-gray-950" : "text-gray-50"}`}>
                Schließen
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View className='py-8 items-center'>
            <ActivityIndicator
              size='large'
              color={isLight ? "#2563eb" : "#3b82f6"}
            />
          </View>
        ) : (
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id!.toString()}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingBottom: 16 }}
            ListEmptyComponent={
              <View className='py-8 items-center'>
                <Text
                  className={`text-body ${
                    isLight ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Keine Konten vorhanden
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const colorKey = item.color as CustomColorKeys

              return (
                <TouchableOpacity
                  onPress={() => onSelectAccount(item)}
                  className={`flex-row items-center rounded-lg p-3 gap-3 bg-gray-50 border-2 border-gray-200 dark:bg-primary-950 dark:border-primary-800`}
                >
                  <EmojiWithBackground
                    size='xs'
                    color={colorKey}
                    emoji={item.emoji}
                  />

                  <View className='flex-1'>
                    <Text
                      className={`text-body font-medium ${
                        isLight ? "text-gray-900" : "text-gray-50"
                      }`}
                    >
                      {item.name}
                    </Text>
                  </View>

                  <Text
                    className={`text-body font-semibold ${
                      isLight ? "text-gray-900" : "text-gray-50"
                    }`}
                  >
                    {formatBalance(item.balance)} €
                  </Text>
                </TouchableOpacity>
              )
            }}
          />
        )}
      </View>
    </Modal>
  )
}
