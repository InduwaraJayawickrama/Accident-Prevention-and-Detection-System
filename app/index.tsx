import { Link } from 'expo-router'
import { View, Text } from 'react-native'

const index = () => {
  return (
    <View>
      <Text className="text-xl font-bold
      text-green-700">index</Text>
      <Link href={'/category'}>Category</Link>
      <Link href={'/products'}>Products</Link>
      <Link href={'/screens/HomeScreen'}>Home</Link>
      <Link href={'/screens/Notification'}>Notification</Link>
      <Link href={'/screens/CreateAccountScreen'}>Registration</Link>
      <Link href={'/screens/LoginScreen'}>Login</Link>
    <Link href={{
        pathname: '/[productid]',
        params:{
            productid: '1',
            name : 'product1'
        }
    }}>SimpleProducts</Link> 
    </View>
  )
}

export default index