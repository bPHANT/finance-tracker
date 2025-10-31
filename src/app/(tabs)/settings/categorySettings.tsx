import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ScrollView } from "react-native-gesture-handler"
import { Ionicons } from "@expo/vector-icons"
import { useColorScheme } from "nativewind"
import { router } from "expo-router"
import ColorModal from "@/components/modal/ColorModal"

import ScreenTitle from "@/components/tabs/ScreenTitle"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import type { CustomColors } from "@/assets/colors"
import { colors } from "@/assets/colors"
import { useTypedTranslation } from "@/language/useTypedTranslation"

export default function CategorySettingsScreen() {
  const { t } = useTypedTranslation() // 👈 wie im SettingsScreen
  const { colorScheme } = useColorScheme()

  // Demo-State – ersetze später durch Store/Route-Params
  const [name, setName] = useState("Freizeit")
  const [emoji, setEmoji] = useState("⚽️")
  const [bgColor, setBgColor] = useState<CustomColors>("orange")

  const isLight = colorScheme === "light"
  const textOn = isLight ? "text-gray-900" : "text-gray-100"
  const cardBg = isLight ? "bg-white" : "bg-primary-800"
  const borderCol = isLight ? "border-gray-200" : "border-primary-700"
  const chevron = isLight ? colors.gray[500] : colors.gray[50]
  const [colorModalOpen, setColorModalOpen] = useState(false)

  return (
    <SafeAreaView className='flex-1 bg-primary-50 dark:bg-primary-950'>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
      >
        {/* Titel */}
        <ScreenTitle title={t("screens.settings.title")} showBackButton />

        {/* große Emoji-Vorschau */}
        <View className='items-center mt-1 mb-5'>
          <View style={styles.shadowMd}>
            <EmojiWithBackground size='l' emoji={emoji} color={bgColor} />
          </View>
        </View>

        {/* Name der Kategorie */}
        <Text className={`mb-2 ${textOn}`}>
          {t("screens.settings.categoryName")}
        </Text>
        <View className={`rounded-2xl ${cardBg} mb-5`} style={styles.shadowSm}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholderTextColor='#9CA3AF'
            className='px-4 py-3 text-base'
            style={{ color: isLight ? "#111827" : "#F9FAFB" }}
          />
        </View>

        {/* Farbe & Icon Karten */}
        <View className='flex-row gap-4 mb-8'>
          {/* Farbe */}
          <TouchableOpacity
            className={`flex-1 ${cardBg} rounded-2xl border ${borderCol} px-4 py-4`}
            style={styles.shadowSm}
            onPress={() => setColorModalOpen(true)}
            activeOpacity={0.75}
          >
            <View className='flex-row justify-between items-center mb-3'>
              <Text className={`font-medium ${textOn}`}>
                {t("screens.settings.color")}
              </Text>
              <Ionicons name='chevron-forward' size={18} color={chevron} />
            </View>
            <EmojiWithBackground size='s' emoji=' ' color={bgColor} />
          </TouchableOpacity>

          {/* test */}
          {/* Icon */}
          <TouchableOpacity
            className={`flex-1 ${cardBg} rounded-2xl border ${borderCol} px-4 py-4`}
            style={styles.shadowSm}
            onPress={() => router.push("/settings/iconPicker")}
            activeOpacity={0.75}
          >
            <View className='flex-row justify-between items-center mb-3'>
              <Text className={`font-medium ${textOn}`}>
                {t("screens.settings.emoji")}
              </Text>
              <Ionicons name='chevron-forward' size={18} color={chevron} />
            </View>
            <EmojiWithBackground size='s' emoji={emoji} color={bgColor} />
          </TouchableOpacity>
        </View>

        {/* Superkategorie */}
        <Text className={`mb-2 ${textOn}`}>
          {t("screens.settings.supercategory")}
        </Text>
        <ListItemButton
          label={t("screens.settings.chooseSupercategory")}
          onPress={() => router.push("/settings/selectSuperCategory")}
          cardBg={cardBg}
          borderCol={borderCol}
          chevronColor={chevron}
          textOn={textOn}
        />

        {/* Subkategorie */}
        <Text className={`mt-6 mb-2 ${textOn}`}>
          {t("screens.settings.subcategory")}
        </Text>
        <ListItemButton
          label={t("screens.settings.chooseSubcategory")}
          onPress={() => router.push("/settings/selectSubcategory")}
          cardBg={cardBg}
          borderCol={borderCol}
          chevronColor={chevron}
          textOn={textOn}
        />
        <ColorModal
          visible={colorModalOpen}
          selected={bgColor}
          onClose={() => setColorModalOpen(false)}
          onSelect={(c) => {
            setBgColor(c) // Vorschau ändert sich sofort
            setColorModalOpen(false) // Modal schließen
          }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

/* Hilfs-Item wie im SettingsScreen-Look */
function ListItemButton({
  label,
  onPress,
  cardBg,
  borderCol,
  chevronColor,
  textOn,
}: {
  label: string
  onPress: () => void
  cardBg: string
  borderCol: string
  chevronColor: string
  textOn: string
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${cardBg} rounded-2xl border ${borderCol} px-4 py-3 flex-row items-center justify-between`}
      style={styles.shadowSm}
      activeOpacity={0.75}
    >
      <Text className={`text-base ${textOn}`}>{label}</Text>
      <Ionicons name='chevron-forward' size={20} color={chevronColor} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  shadowSm: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  shadowMd: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
})
