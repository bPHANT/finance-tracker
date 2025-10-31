import React, { useMemo } from "react"
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native"
import BaseModal from "./BaseModal"
import { colors } from "@/assets/colors"
import type { CustomColors } from "@/assets/colors"
import { useColorScheme } from "nativewind"

type Props = {
  visible: boolean
  selected?: CustomColors
  onClose: () => void
  onSelect: (color: CustomColors) => void
}

export default function ColorModal({ visible, selected, onClose, onSelect }: Props) {
  const { colorScheme } = useColorScheme()
  const isLight = colorScheme === "light"
  const data = useMemo(
    () => Object.entries(colors.custom) as [CustomColors, string][],
    []
  )

  return (
    <BaseModal visible={visible} title="Farbe wählen" onClose={onClose}>
      <FlatList
        data={data}
        keyExtractor={([key]) => key}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item: [key, hex] }) => {
          const isSelected = key === selected
          return (
            <Pressable
              onPress={() => onSelect(key)}
              style={[
                styles.row,
                {
                  backgroundColor: isLight ? "#fff" : "#0F1A2B",
                  borderColor: isSelected ? hex : isLight ? "#E5E7EB" : "#1F2A3B",
                },
              ]}
            >
              <View style={[styles.swatch, { backgroundColor: hex }]} />
              <Text style={[styles.label, { color: isLight ? "#111827" : "#F9FAFB" }]}>
                {key}
              </Text>
            </Pressable>
          )
        }}
      />
    </BaseModal>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  label: {
    fontSize: 16,
    textTransform: "capitalize",
  },
})
