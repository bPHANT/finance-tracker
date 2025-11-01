import { colors } from "@/assets/colors"
import { useTypedTranslation } from "@/language/useTypedTranslation"
import { Ionicons } from "@expo/vector-icons"
import { useColorScheme } from "nativewind"
import { Text, TouchableOpacity } from "react-native"

type BackButtonProps = {
  onPress: () => Promise<void>
}

export default function BackButton(props: BackButtonProps) {
  const { t } = useTypedTranslation()
  const { colorScheme } = useColorScheme()

  return (
    <TouchableOpacity
      onPress={props.onPress}
      className='flex-row items-center justify-center gap-2 mr-2 p-2 bg-gray-200 dark:bg-primary-800 rounded-lg'
    >
      <Ionicons
        name='arrow-back-outline'
        size={20}
        color={colorScheme === "dark" ? colors.gray[200] : colors.gray[600]}
      />
      <Text className='text-gray-600 dark:text-gray-200 text-base'>
        {t("common.back")}
      </Text>
    </TouchableOpacity>
  )
}
