import React, { useMemo } from "react"
import { View, Text, StyleSheet, FlatList, Pressable, Dimensions } from "react-native"
import { useColorScheme } from "nativewind"
import BaseModal from "./BaseModal"
import { emojis } from "@/assets/emojis"

type Props = {
  visible: boolean
  selected?: string
  onClose: () => void
  onSelect: (emoji: string) => void
}

/**
 * Emoji-Auswahl als 4-Spalten-Grid
 * Nutzt Emojis aus assets/emojis.ts
 */
export default function EmojiModal({ visible, selected, onClose, onSelect }: Props) {
  const { colorScheme } = useColorScheme()
  const isLight = colorScheme === "light"

  const data = useMemo(() => Object.values(emojis), [])
  const numColumns = 4
  const screenWidth = Dimensions.get("window").width
  const itemSize = (screenWidth - 16 * 2 - 12 * (numColumns - 1)) / numColumns

  return (
    <BaseModal visible={visible} title="Emoji wählen" onClose={onClose}>
      <FlatList
        data={data}
        numColumns={numColumns}
        keyExtractor={(item) => item}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => {
          const isSelected = item === selected
          return (
            <Pressable
              onPress={() => onSelect(item)}
              style={[
                styles.cell,
                {
                  width: itemSize,
                  height: itemSize,
                  backgroundColor: isLight ? "#fff" : "#0F1A2B",
                  borderColor: isSelected
                    ? isLight
                      ? "#2563EB" // blue-600
                      : "#60A5FA" // blue-400
                    : isLight
                    ? "#E5E7EB"
                    : "#1F2A3B",
                },
              ]}
            >
              <Text style={styles.emoji}>{item}</Text>
            </Pressable>
          )
        }}
      />
    </BaseModal>
  )
}

const styles = StyleSheet.create({
  cell: {
    borderWidth: 2,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 26,
    textAlign: "center",
  },
})
