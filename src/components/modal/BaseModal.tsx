import { useColorScheme } from "nativewind"
import React from "react"
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native"

type BaseModalProps = {
  visible: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
}

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
      animationType='slide'
      transparent
      onRequestClose={onClose}
    >
      <Pressable className='flex-1' onPress={onClose} />

      <View
        className={`absolute left-0 right-0 bottom-0 max-h-3/4 rounded-lg px-4 pb-4 pt-5 ${
          isLight ? "bg-gray-50" : "bg-primary-900"
        }`}
      >
        <View className='flex-row justify-between items-center mb-3'>
          <Text
            className={`text-subtitle ${
              isLight ? "text-gray-950" : "text-gray-50"
            }`}
          >
            {title}
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text className={`${isLight ? "text-gray-950" : "text-gray-50"}`}>
              Schließen
            </Text>
          </TouchableOpacity>
        </View>

        {children}
      </View>
    </Modal>
  )
}
