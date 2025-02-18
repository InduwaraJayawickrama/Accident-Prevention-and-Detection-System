import { useLocalSearchParams } from 'expo-router'
import { View, Text } from 'react-native'

const SimpleProducts = () => {

    const params = useLocalSearchParams()
    console.log(params)
  return (
    <View>
      <Text>SimpleProducts</Text>
    </View>
  )
}

export default SimpleProducts