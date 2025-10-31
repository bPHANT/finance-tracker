import { colors } from "@/assets/colors"
import TabButton from "@/components/tabs/TabButton"
import { Ionicons } from "@expo/vector-icons"
import { Tabs, useRouter } from "expo-router"
import { useColorScheme } from "nativewind"
import React from "react"
import { useTranslation } from "react-i18next"
import { View } from "react-native"

export default function TabLayout() {
  const { t } = useTranslation()
  const { colorScheme } = useColorScheme()
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor:
          colorScheme === "light" ? colors.primary[600] : colors.gray[50],
        tabBarInactiveTintColor:
          colorScheme === "light" ? colors.gray[500] : colors.primary[500],
        tabBarStyle: {
          backgroundColor:
            colorScheme === "light" ? colors.gray[50] : colors.primary[900],
          borderTopWidth: 0,
          height: 92,
          paddingTop: 16,
        },
        tabBarItemStyle: {
          borderRadius: 0,
        },
        tabBarButton: (props) => {
          return <TabButton {...props} />
        },
      }}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: t("screens.home.title"),
          headerShown: false,
          tabBarButton: (props) => {
            props.onPress = () => {
              router.push("/home")
            }
            return <TabButton {...props} />
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='transactions'
        options={{
          title: t("screens.transactions.title"),
          headerShown: false,
          tabBarButton: (props) => {
            props.onPress = () => {
              router.push("/transactions")
            }
            return <TabButton {...props} />
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "card" : "card-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='scan'
        options={{
          title: t("screens.scan.title"),
          headerShown: false,
          tabBarButton: (props) => {
            props.onPress = () => {
              router.push("/scan/camera")
            }
            return <TabButton {...props} />
          },
          tabBarIcon: ({ focused, color, size }) => (
            <View
              className={`${
                focused
                  ? "bg-gray-50 dark:bg-primary-600 border-2 dark:border-0 border-primary-600"
                  : "bg-primary-600 dark:bg-primary-700"
              } w-16 h-16 rounded-full items-center justify-center -mt-16`}
            >
              <Ionicons
                name='scan'
                size={size}
                color={focused ? color : colors.gray[50]}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name='budget'
        options={{
          title: t("screens.budget.title"),
          headerShown: false,
          tabBarButton: (props) => {
            props.onPress = () => {
              router.push("/budget")
            }
            return <TabButton {...props} />
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: t("screens.settings.title"),
          headerShown: false,
          tabBarButton: (props) => {
            props.onPress = () => {
              router.push("/settings")
            }
            return <TabButton {...props} />
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='kitchensink'
        options={{
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  )
}
