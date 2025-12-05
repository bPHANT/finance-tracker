import { colors } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import DuoSwitch from "@/components/buttons/DuoSwitch"
import AccountModal, { Account } from "@/components/modal/AccountModal"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { storage } from "@/utils/storage"
import { Ionicons } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"
import { useColorScheme } from "nativewind"
import { useCallback, useState } from "react"
import { BackHandler, Text, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme()
  const { t, i18n } = useTypedTranslation()
  const [showAccountModal, setShowAccountModal] = useState(false)

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

  const handleLanguageSwitch = (language: "de" | "en") => {
    i18n.changeLanguage(language)
    storage.setString("language", language)
  }

  const handleToggleColorScheme = () => {
    toggleColorScheme()
    storage.setString("appearance", colorScheme === "dark" ? "light" : "dark")
  }

  async function handleOnManageCategories() {
    router.push({
      pathname: "/settings/categorySelector",
      params: {
        source: "select",
      },
    })
  }

  async function handleOnAddAccount() {
    router.push({
      pathname: "/settings/accountForm",
      params: {
        accountId: -1,
      },
    })
    setShowAccountModal(false)
  }

  async function handleOnSelectAccount(account: Account) {
    router.push({
      pathname: "/settings/accountForm",
      params: {
        accountId: account.id,
      },
    })
    setShowAccountModal(false)
  }

  return (
    <SafeAreaView className='flex-1 bg-background dark:bg-primary-950'>
      <AccountModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSelectAccount={handleOnSelectAccount}
        onAddAccount={handleOnAddAccount}
      />

      <ScrollView className='mx-4'>
        <ScreenTitle title={t("screens.settings.title")} />

        <View className='gap-6 mt-3'>
          <View className='gap-3'>
            <Text className='text-subtitle font-semibold text-gray-900 dark:text-gray-100'>
              {t("screens.settings.manage") || "Kategorien"}
            </Text>
            <Button
              title={t("screens.settings.manageCategories")}
              onPress={handleOnManageCategories}
              arrowRight
              textLeft
            />
            <Button
              title={t("screens.settings.manageAccounts")}
              onPress={() => setShowAccountModal(true)}
              arrowRight
              textLeft
            />

            <Text className='text-subtitle font-semibold text-gray-900 dark:text-gray-100'>
              {t("screens.settings.personalization")}
            </Text>

            <View className='bg-gray-100 dark:bg-primary-800 rounded-lg overflow-hidden p-4 gap-3'>
              <View className='flex-row justify-between items-center'>
                <View className='flex-row items-center gap-3'>
                  <Ionicons
                    name={colorScheme === "light" ? "sunny" : "moon"}
                    size={22}
                    color={
                      colorScheme === "light"
                        ? colors.primary[600]
                        : colors.gray[50]
                    }
                  />
                  <Text className='text-gray-900 dark:text-gray-100'>
                    {t("screens.settings.appearance")}
                  </Text>
                </View>

                <DuoSwitch
                  value={colorScheme === "dark"}
                  onChange={handleToggleColorScheme}
                  options={[
                    t("screens.settings.light"),
                    t("screens.settings.dark"),
                  ]}
                />
              </View>

              <View className='flex-row justify-between items-center'>
                <View className='flex-row items-center gap-3'>
                  <Ionicons
                    name='globe-outline'
                    size={22}
                    color={
                      colorScheme === "light"
                        ? colors.primary[600]
                        : colors.gray[50]
                    }
                  />
                  <Text className='text-gray-900 dark:text-gray-100'>
                    {t("screens.settings.language")}
                  </Text>
                </View>

                <DuoSwitch
                  value={i18n.language === "en"}
                  onChange={() =>
                    handleLanguageSwitch(i18n.language === "en" ? "de" : "en")
                  }
                  options={["Deutsch", "English"]}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
