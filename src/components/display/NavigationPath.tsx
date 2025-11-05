import { Text, View } from "react-native"

export type NavigationPathItem = {
  id: number
  name: string
}

type NavigationButtonProps = {
  index: number
  pathItem: NavigationPathItem
}

export default function NavigationPath(props: NavigationButtonProps) {
  return (
    <View key={props.pathItem.id} className='flex-row items-center'>
      {props.index > 0 && (
        <Text className='text-base text-gray-600 dark:text-gray-200 mx-2'>
          ›
        </Text>
      )}
      <Text className='text-base text-gray-600 dark:text-gray-200 text-sm font-medium'>
        {props.pathItem.name}
      </Text>
    </View>
  )
}
