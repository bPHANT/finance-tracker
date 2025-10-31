import { emojis } from "@/assets/emojis"
import { useColorScheme } from "nativewind"
import React, { useMemo } from "react"
import { Dimensions, FlatList, Pressable, Text } from "react-native"
import BaseModal from "./BaseModal"

type Props = {
  visible: boolean
  selected?: string
  onClose: () => void
  onSelect: (emoji: string) => void
}

export default function EmojiModal({
  visible,
  selected,
  onClose,
  onSelect,
}: Props) {
  const { colorScheme } = useColorScheme()
  const isLight = colorScheme === "light"

  const data = useMemo(() => Object.values(emojis), [])
  const numColumns = 4
  const screenWidth = Dimensions.get("window").width
  const itemSize = (screenWidth - 16 * 2 - 12 * (numColumns - 1)) / numColumns

  return (
    <BaseModal visible={visible} title='Emoji wählen' onClose={onClose}>
      <FlatList
        data={data}
        numColumns={numColumns}
        keyExtractor={(item) => item}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 12,
        }}
        contentContainerStyle={{ paddingBottom: 12 }}
        renderItem={({ item }) => {
          const isSelected = item === selected
          return (
            <Pressable
              onPress={() => onSelect(item)}
              className={`border-2 rounded-lg items-center justify-center bg-gray-50 border-gray-200 dark:bg-primary-950 dark:border-primary-800 ${
                isSelected
                  ? isLight
                    ? "border-primary-600 bg-primary-50"
                    : "border-primary-500 bg-primary-800"
                  : ""
              }`}
              style={[
                {
                  width: itemSize,
                  height: itemSize,
                },
              ]}
            >
              <Text className='text-center text-emoji-xs'>{item}</Text>
            </Pressable>
          )
        }}
      />
    </BaseModal>
  )
}
