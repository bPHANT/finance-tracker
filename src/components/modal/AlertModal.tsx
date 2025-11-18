import React from "react"
import { Modal, View, Text, Pressable, StyleSheet } from "react-native"

type AlertType = "error" | "confirm"

type Props = {
  visible: boolean
  type: AlertType
  title?: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
}

const AlertModal: React.FC<Props> = ({
  visible,
  type,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal transparent visible={visible} animationType='fade'>
      <View style={styles.overlay}>
        <View style={styles.box}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {type === "confirm" && (
              <Pressable style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelText}>Abbrechen</Text>
              </Pressable>
            )}

            <Pressable style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default AlertModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    marginRight: 15,
  },
  cancelText: {
    color: "#888",
    fontSize: 16,
  },
  confirmBtn: {},
  confirmText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
})
