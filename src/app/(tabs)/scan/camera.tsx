import { colors } from "@/assets/colors"
import Button from "@/components/buttons/Button"
import useCategory from "@/db/queries/category"
import { useAi } from "@/utils/ai"
import { useIsFocused } from "@react-navigation/native"
import { CameraType, CameraView, useCameraPermissions } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import { router, useFocusEffect } from "expo-router"
import { useColorScheme } from "nativewind"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

export default function CameraScreen() {
  const { colorScheme } = useColorScheme()
  const { t } = useTranslation()

  //db
  const { getManyAsJson: getCategoriesAsJson } = useCategory()

  const { categorizePicture } = useAi()

  // Camera variables
  const facing = "back" as CameraType
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()

  // View variables
  const isFocused = useIsFocused()
  const windowWidth = Dimensions.get("window").width
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [categories, setCategories] = useState<any>(null)

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      )

      return () => subscription.remove()
    }, [])
  )

  async function processAndNavigate(photo: any) {
    try {
      setIsProcessing(true)

      // Process image using AI
      await categorizePicture(photo, categories)

      // Navigate to transaction form
      router.replace({
        pathname: "/scan/transactionGroupForm",
        params: { action: "loadAiData" },
      })
    } catch (error) {
      alert(error)
    } finally {
      setIsProcessing(false)
    }
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        skipProcessing: true,
      })

      await processAndNavigate(photo)
    }
  }

  async function openGallery() {
    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 1,
    })

    if (result.canceled) return

    const asset = result.assets[0]

    if (!asset.base64) {
      alert(t("screens.camera.gallery_error"))
      return
    }

    const photo = {
      base64: asset.base64,
      width: asset.width,
      height: asset.height,
      uri: asset.uri,
      format: "jpg",
    }

    await processAndNavigate(photo)
  }

  useEffect(() => {
    const loadCategories = async () => {
      const categoriesResult = await getCategoriesAsJson()
      setCategories(categoriesResult)
    }

    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!permission?.granted) {
    requestPermission()
  }

  if (!isProcessing) {
    // Camera View
    return (
      <View className='flex-1 items-center justify-center bg-gray-100 dark:bg-primary-950'>
        {isFocused ? (
          <View
            style={{ width: windowWidth, flex: 1, justifyContent: "center" }}
          >
            <CameraView facing={facing} style={{ flex: 1 }} ref={cameraRef} />
          </View>
        ) : null}
        <View
          style={{
            position: "absolute",
            bottom: 50 + (windowWidth / 4.5 - windowWidth / 3.8) / 2,
            left: windowWidth / 2 - windowWidth / 3.8 / 2,
            borderRadius: 90,
            opacity: 0.5,
            backgroundColor: "transparent",
            borderColor: "white",
            borderWidth: 4.5,
            width: windowWidth / 3.8,
            height: windowWidth / 3.8,
          }}
        />
        <TouchableOpacity
          onPress={() => {
            takePicture()
          }}
          style={{
            position: "absolute",
            bottom: 50,
            left: windowWidth / 2 - windowWidth / 4.5 / 2,
            borderRadius: 90,
            opacity: 0.4,
            backgroundColor: "white",
            width: windowWidth / 4.5,
            height: windowWidth / 4.5,
          }}
        />
        <View className='absolute bottom-12 right-5'>
          <Button
            title={t("screens.camera.gallery")}
            icon='image-outline'
            onPress={openGallery}
          />
        </View>
      </View>
    )
  } // Process View
  else {
    return (
      <View className='flex-1 items-center justify-center bg-gray-100 dark:bg-primary-950'>
        <ActivityIndicator
          size='large'
          color={colorScheme === "dark" ? colors.gray[100] : colors.gray[950]}
          className='mb-5'
        />
        <Text className='text-gray-950 dark:text-gray-100 text-lg font-medium'>
          {t("screens.camera.processing")}
        </Text>
        <Text className='text-gray-950 dark:text-gray-100 text-sm mt-2 text-center px-8'>
          {t("screens.camera.processing_description")}
        </Text>
      </View>
    )
  }
}
