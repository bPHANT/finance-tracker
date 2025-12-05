import { useTypedTranslation } from "@/language/useTypedTranslation"
import DateTimePicker from "@react-native-community/datetimepicker"
import React, { useState } from "react"
import { Modal, Platform, Pressable, Text, View } from "react-native"
import FieldTitle from "./FieldTitle"

type DateInputProps = {
  title: string
  date: Date
  onChangeDate: (event: any, selectedDate?: Date) => void
}

export default function DateField(props: DateInputProps) {
  const { t } = useTypedTranslation()
  const [showPicker, setShowPicker] = useState(false)

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false)
      if (selectedDate) {
        props.onChangeDate(event, selectedDate)
      }
    } else if (Platform.OS === "ios" && selectedDate) {
      props.onChangeDate(event, selectedDate)
    }
  }

  const handleIOSConfirm = () => {
    setShowPicker(false)
  }

  return (
    <View className='gap-1'>
      <FieldTitle title={props.title} />

      <Pressable
        onPress={() => {
          setShowPicker(true)
        }}
      >
        <View className='bg-gray-50 dark:bg-gray-100 rounded-xl p-3'>
          <Text className='text-base text-gray-900 dark:text-gray-800'>
            {props.date.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Text>
        </View>
      </Pressable>

      {showPicker && Platform.OS === "ios" && (
        <Modal
          transparent={true}
          animationType='slide'
          visible={showPicker}
          onRequestClose={handleIOSConfirm}
        >
          <View className='flex-1 justify-end'>
            <View className='bg-white dark:bg-primary-800 rounded-t-xl p-4 bg-gray-50'>
              <View className='flex-row justify-between items-center mb-4'>
                <Text className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  {t("common.selectDate")}
                </Text>
                <Pressable
                  onPress={handleIOSConfirm}
                  className='bg-blue-500 rounded-lg px-4 py-2'
                >
                  <Text className='text-gray-950 dark:text-gray-100 font-semibold'>
                    {t("common.done")}
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={props.date}
                mode='date'
                display='spinner'
                onChange={handleDateChange}
              />
            </View>
          </View>
        </Modal>
      )}

      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={props.date}
          mode='date'
          display='default'
          onChange={handleDateChange}
        />
      )}
    </View>
  )
}
