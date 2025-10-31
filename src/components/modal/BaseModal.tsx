import React from "react"
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native"
import { useColorScheme } from "nativewind"

type BaseModalProps = {
  visible: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
}

/**
 * Universelles Bottom-Sheet-Modal mit einheitlichem Stil
 * → Du brauchst künftig nur noch den Inhalt (children) übergeben.
 */
export default function BaseModal({
  visible,
  title = "",
  onClose,
  children,
}: BaseModalProps) {
  const { colorScheme } = useColorScheme()
  const isLight = colorScheme === "light"

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={[styles.sheet, { backgroundColor: isLight ? "#fff" : "#0B1220" }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isLight ? "#111827" : "#F9FAFB" }]}>
            {title}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text style={{ color: isLight ? "#111827" : "#F9FAFB", fontSize: 16 }}>
              Schließen
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inhalt */}
        {children}
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
})
