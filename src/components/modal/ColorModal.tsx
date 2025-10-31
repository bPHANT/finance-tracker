import React, { useMemo } from "react"
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native"
import { useColorScheme } from "nativewind"
import { colors } from "@/assets/colors"
import type { CustomColors } from "@/assets/colors"

type Props = {
  visible: boolean
  selected?: CustomColors
  onClose: () => void
  onSelect: (color: CustomColors) => void
}

/**
 * Bottom-Sheet Modal zum Auswählen einer Farbe.
 * Nutzt ausschließlich die in assets/colors -> custom deklarierten Farben.
 */
export default function ColorModal({ visible, selected, onClose, onSelect }: Props) {
  const { colorScheme } = useColorScheme()
  const isLight = colorScheme === "light"

  // Array aus den custom-Farben (Key + Hex)
  const data = useMemo(
    () => Object.entries(colors.custom) as [CustomColors, string][],
    []
  )

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* halbtransparenter Hintergrund (Tap schließt Modal) */}
      <Pressable onPress={onClose} style={styles.backdrop} />

      {/* Bottom Sheet */}
      <View style={[styles.sheet, { backgroundColor: isLight ? "#fff" : "#0B1220" }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isLight ? "#111827" : "#F9FAFB" }]}>
            Farbe wählen
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={{ color: isLight ? "#111827" : "#F9FAFB", fontSize: 16 }}>
              Schließen
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={data}
          keyExtractor={([key]) => key}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item: [key, hex] }) => {
            const isSelected = key === selected
            return (
              <TouchableOpacity
                onPress={() => onSelect(key)}
                activeOpacity={0.8}
                style={[
                  styles.row,
                  {
                    backgroundColor: isLight ? "#fff" : "#0F1A2B",
                    borderColor: isSelected ? hex : isLight ? "#E5E7EB" : "#1F2A3B",
                  },
                ]}
              >
                {/* Farbfeld (links) */}
                <View style={[styles.swatch, { backgroundColor: hex }]} />

                {/* Farbnamen (rechts) */}
                <Text style={[styles.label, { color: isLight ? "#111827" : "#F9FAFB" }]}>
                  {key}
                </Text>
              </TouchableOpacity>
            )
          }}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "70%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
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
