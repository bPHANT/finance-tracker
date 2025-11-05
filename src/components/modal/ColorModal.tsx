import type { CustomColorKeys } from "@/assets/colors"
import { colors, customBgColors } from "@/assets/colors"
import { useColorScheme } from "nativewind"
import React, { useMemo } from "react"
import { FlatList, Pressable, Text, View } from "react-native"
import BaseModal from "./BaseModal"

type Props = {
  visible: boolean
  selected?: CustomColorKeys
  onClose: () => void
  onSelect: (color: CustomColorKeys) => void
}

export default function ColorModal({
  visible,
  selected,
  onClose,
  onSelect,
}: Props) {
  const { colorScheme } = useColorScheme()
  const isLight = colorScheme === "light"
  const data = useMemo(
    () => Object.entries(colors.custom) as [CustomColorKeys, string][],
    []
  )

  return (
    <BaseModal visible={visible} title='Farbe wählen' onClose={onClose}>
      <FlatList
        data={data}
        keyExtractor={([key]) => key}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item: [key, _] }) => {
          const isSelected = key === selected
          return (
            <Pressable
              onPress={() => onSelect(key)}
              className={`flex-row items-center border-2 rounded-lg p-3 gap-3 bg-gray-50 border-gray-200 dark:bg-primary-950 dark:border-primary-800 ${
                isSelected
                  ? isLight
                    ? "border-primary-600"
                    : "border-primary-500"
                  : ""
              }`}
            >
              <View className={`size-7 rounded-lg ${customBgColors[key]}`} />
              <Text
                className={`flex-1 capitalize ${
                  isLight ? "text-gray-900" : "text-gray-50"
                }`}
              >
                {key}
              </Text>
            </Pressable>
          )
        }}
      />
    </BaseModal>
  )
}
