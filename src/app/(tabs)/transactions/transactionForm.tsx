import { CustomColorKeys } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import DuoSwitch from "@/components/buttons/DuoSwitch"
import EmojiWithBackground from "@/components/display/EmojiWithBackground"
import TextField from "@/components/input/TextField"
import ScreenTitle from "@/components/tabs/ScreenTitle"
import useCategory from "@/db/queries/category"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, router } from "expo-router"
import React, { useEffect, useState } from "react"
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type Category = {
  id: number
  name: string
  color: CustomColorKeys
  emoji: string
}

export default function TransactionFormScreen() {
  const { t } = useTypedTranslation()
  const params = useLocalSearchParams()

  /** Editing? */
  const editIndex = params.editIndex ? Number(params.editIndex) : -1
  const isEditMode = editIndex >= 0

  /** Wenn editing: vorhandene Daten */
  const editData = params.editData
    ? JSON.parse(params.editData as string)
    : null

  /** Kategorie aus CategorySelector */
  const passedCategoryId = params.selectedCategoryId
    ? Number(params.selectedCategoryId)
    : null

  /** Lokale Form-Daten */
  const [formData, setFormData] = useState({
    name: editData ? editData.name : "",
    amount: editData ? editData.amount : "",
    type: editData
      ? parseFloat(editData.amount) < 0
        ? "expense"
        : "income"
      : "expense",
    categoryId: editData ? editData.category.id : 0,
  })

  /** Kategorien */
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    editData ? editData.category : null
  )

  const { getMany: getCategories } = useCategory()

  /** Kategorien laden */
  useEffect(() => {
    const load = async () => {
      const cats = await getCategories({})
      setCategories(cats)
    }
    load()
  }, [])

  /** Kategorie Änderung übernehmen */
  useEffect(() => {
    if (passedCategoryId) {
      const found = categories.find((c) => c.id === passedCategoryId)
      if (found) {
        setSelectedCategory(found)
        setFormData((prev) => ({
          ...prev,
          categoryId: found.id,
        }))
      }
    }
  }, [passedCategoryId, categories])

  /** Kategorie auswählen */
  const handleCategoryPress = () => {
    router.push({
      pathname: "/transactions/categorySelector",
      params: {
        selectedCategoryId: formData.categoryId,
        editIndex: isEditMode ? editIndex.toString() : undefined,
        editData: isEditMode ? JSON.stringify(editData) : undefined,
      },
    })
  }

  /** Speichern */
  const handleSubmit = () => {
    if (!formData.name || !formData.amount || !selectedCategory) {
      return Alert.alert("Fehler", "Bitte alle Felder ausfüllen.")
    }

    const amountValue = parseFloat(formData.amount)
    if (isNaN(amountValue)) {
      return Alert.alert("Fehler", "Ungültiger Betrag.")
    }

    const finalAmount =
      formData.type === "expense"
        ? -Math.abs(amountValue)
        : Math.abs(amountValue)

    const tx = {
      name: formData.name,
      amount: finalAmount.toString(),
      category: selectedCategory,
    }

    /** Zur transactionGroupForm zurückgeben */
    if (isEditMode) {
      router.push({
        pathname: "/transactions/transactionGroupForm",
        params: {
          updatedTransaction: JSON.stringify({
            index: editIndex,
            data: tx,
          }),
        },
      })
    } else {
      router.push({
        pathname: "/transactions/transactionGroupForm",
        params: {
          newTransaction: JSON.stringify(tx),
        },
      })
    }
  }

  return (
    <SafeAreaView className="bg-gray-100 dark:bg-primary-950 flex-1">
      <ScrollView className="mx-4">
        <ScreenTitle title={isEditMode ? "Bearbeiten" : "Hinzufügen"} />

        <View className="gap-4 mb-6">

          {/* Name */}
          <TextField
            title="Name"
            value={formData.name}
            onChangeValue={(v) =>
              setFormData((prev) => ({ ...prev, name: v }))
            }
          />

          {/* Typ (Ausgabe / Einnahme) */}
          <DuoSwitch
            value={formData.type === "income"}
            onChange={() =>
              setFormData((prev) => ({
                ...prev,
                type: prev.type === "expense" ? "income" : "expense",
              }))
            }
            options={["Ausgabe", "Einnahme"]}
          />

          {/* Betrag */}
          <TextField
            title="Betrag"
            value={formData.amount}
            onChangeValue={(v) =>
              setFormData((prev) => ({ ...prev, amount: v }))
            }
          />

          {/* Kategorie */}
          <Text className="font-semibold text-gray-900 dark:text-gray-100">
            Kategorie
          </Text>

          <TouchableOpacity
            onPress={handleCategoryPress}
            className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900 flex-row items-center"
          >
            {selectedCategory ? (
              <>
                <EmojiWithBackground
                  emoji={selectedCategory.emoji}
                  color={selectedCategory.color}
                  size="s"
                />
                <Text className="ml-3 text-gray-900 dark:text-gray-100">
                  {selectedCategory.name}
                </Text>
              </>
            ) : (
              <Text className="text-gray-500 dark:text-gray-100">
                Kategorie auswählen
              </Text>
            )}

            <Ionicons
              name="chevron-forward"
              size={22}
              color="gray"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          {/* Buttons */}
          <View className="flex-row gap-4 mt-4">
            <Button
              title="Abbrechen"
              onPress={() => router.back()}
            />
            <Button
              title={isEditMode ? "Aktualisieren" : "Hinzufügen"}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
