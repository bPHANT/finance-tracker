import React from "react"
import { Modal, Text, TouchableOpacity, View } from "react-native"

type AlertType = "error" | "confirm"

type AlertModalProps = {
  visible: boolean
  type: AlertType
  title?: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
}

export default function AlertModal(props: AlertModalProps) {
  const { visible, type, title, message, onConfirm, onCancel } = props

  return (
    <Modal transparent visible={visible} animationType='fade'>
      <View className='flex-1 bg-black/40 justify-center items-center'>
        {/* Alert-Box */}
        <View className='w-4/5 rounded-2xl p-5 bg-gray-50 dark:bg-primary-900 shadow-xl shadow-black/20 dark:shadow-black/50'>
          {/* Titel */}
          {title && (
            <Text className='text-lg font-semibold mb-2 dark:text-gray-50'>
              {title}
            </Text>
          )}

          {/* Message */}
          <Text className='text-base mb-6 dark:text-gray-100'>{message}</Text>

          {/* Buttons */}
          <View className='flex-row justify-end items-center'>
            {type === "confirm" && (
              <TouchableOpacity className='mr-6' onPress={onCancel}>
                <Text className='text-base text-gray-500 dark:text-gray-300'>
                  Abbrechen
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={onConfirm}>
              <Text className='text-base font-semibold text-primary-600 dark:text-primary-400'>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
