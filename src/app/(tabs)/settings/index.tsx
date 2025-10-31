import { colors } from "@/assets/colors"
import DuoSwitch from "@/components/buttons/DuoSwitch"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { storage } from "@/utils/storage"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useColorScheme } from "nativewind"
import { Text, TouchableOpacity, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme()
  const { t, i18n } = useTypedTranslation()

  const handleLanguageSwitch = (language: "de" | "en") => {
    i18n.changeLanguage(language)
    storage.setString("language", language)
  }

  const handleToggleColorScheme = () => {
    toggleColorScheme()
    storage.setString("appearance", colorScheme === "dark" ? "light" : "dark")
  }

  return (
    <SafeAreaView className='flex-1 bg-background dark:bg-primary-950'>
      <ScrollView className='mx-4'>
        {/* Titel */}
        <ScreenTitle
          title={t("screens.settings.title")}
          showBackButton={false}
        />

        <View className='gap-6'>
          {/* 🎨 Personalisierung */}
          <View className='bg-gray-100 dark:bg-primary-800 rounded-lg overflow-hidden p-4 gap-3'>
            <Text className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              {t("screens.settings.personalization")}
            </Text>

            {/* Dark/Light Mode */}
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

            {/* Sprachumschalter */}
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

          {/* 🗂 Kategorien */}
          <View>
            <Text className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
              {t("screens.settings.categories") || "Kategorien"}
            </Text>

            <View className='bg-gray-100 dark:bg-primary-800 rounded-xl overflow-hidden border border-gray-200 dark:border-primary-700'>
              {/* Kategorien konfigurieren */}
              <TouchableOpacity
                className='flex-row justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-primary-700'
                onPress={() => router.push("/settings/categorySelector")}
              >
                <Text className='text-gray-900 dark:text-gray-100 text-base'>
                  {t("screens.settings.configureCategories") ||
                    "Kategorien konfigurieren"}
                </Text>
                <Ionicons
                  name='chevron-forward'
                  size={20}
                  color={
                    colorScheme === "light"
                      ? colors.primary[600]
                      : colors.gray[50]
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
