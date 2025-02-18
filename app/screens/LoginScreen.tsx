import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, FlatList, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}
import CarAccident1 from '../assets/images/car_accident1.jpg';
import CarAccident2 from '../assets/images/car_accident2.jpg';
import CarAccident3 from '../assets/images/car_accident3.jpg';
const images = [CarAccident1, CarAccident2, CarAccident3];
const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }: LoginScreenProps) => {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % images.length;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        }, 3000); 

        return () => clearInterval(interval);
    }, [currentIndex]);

    return (
        <View className="flex-1 items-center justify-center relative">
            <View className="absolute top-0 w-full h-2/5">
                <FlatList
                    ref={flatListRef}
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <Image source={{ uri: item }} className="w-full h-full object-cover" />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    onMomentumScrollEnd={(event) => {
                        const index = Math.round(event.nativeEvent.contentOffset.x / width);
                        setCurrentIndex(index);
                    }}
                />
                <View className="absolute bottom-2 w-full flex-row justify-center space-x-2">
                    {images.map((_, index) => (
                        <View
                            key={index}
                            className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-orange-400' : 'bg-white'}`}
                        />
                    ))}
                </View>
            </View>
            <View className="absolute bottom-0 w-full h-3/5 bg-orange-400 flex items-center justify-center p-5">
                <View className="bg-white p-5 rounded-2xl w-80 items-center shadow-lg">
                    <Text className="text-2xl font-bold mb-5">Login</Text>
                    <TextInput className="w-full p-2 mb-3 border border-gray-300 rounded-lg" placeholder="Email" keyboardType="email-address" />
                    <TextInput className="w-full p-2 mb-3 border border-gray-300 rounded-lg" placeholder="Password" secureTextEntry />
                    <TouchableOpacity onPress={() => Alert.alert('Forgot Password Pressed!')}>
                        <Text className="text-red-500 mb-3">Forgot Password?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-red-400 p-3 rounded-lg w-full items-center mb-3" onPress={() => navigation.navigate('Home')}>
                        <Text className="text-white font-bold">Sign In</Text>
                    </TouchableOpacity>
                    <Text className="mb-3">Or Continue With</Text>
                    <View className="flex-row justify-between w-full mb-3">
                        <TouchableOpacity className="p-2 bg-white rounded-lg shadow">
                            <Text>🔵</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2 bg-white rounded-lg shadow">
                            <Text>⚫</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2 bg-white rounded-lg shadow">
                            <Text>🔴</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
                        <Text className="mt-3">Don't have an account? <Text className="font-bold text-red-500">Register for free</Text></Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default LoginScreen;