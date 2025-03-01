import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

const LoginScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [
    { url: "https://th.bing.com/th/id/OIP.wvgQhxY4XBdwOPG8CrC2ywHaEK?w=316&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7", alt: "car_accident1" },
    { url: "https://th.bing.com/th/id/OIP.Zf5qIZbZHKJDsDeaUkRGIgHaE8?w=266&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7", alt: "car_accident2" },
    { url: "https://th.bing.com/th/id/OIP.ZG-ROAe8mt3tZj2FOfQ-YQHaE9?rs=1&pid=ImgDetMain", alt: "car_accident3" }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-amber-400 pt-8">
      <View className="absolute w-full h-full">
        <View className="h-[40%] bg-amber-400" />
        <View className="h-[60%] bg-black w-[100%] rounded-t-2xl" />
      </View>

      <View className="items-center mb-5">
        <View className="relative w-[320px] h-[240px] rounded-lg overflow-hidden">
          <Image source={{ uri: images[currentSlide].url }} className="w-full h-full" />
          <TouchableOpacity onPress={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full">
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full">
            <ChevronRight size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row mt-2 space-x-2">
          {images.map((_, index) => (
            <View key={index} className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-gray-400'}`} />
          ))}
        </View>
      </View>

      <View className="pt-5 pb-1 py-5">
      <View className="bg-white p-8 rounded-3xl shadow-lg mx-auto w-[90%]">
        <Text className="text-2xl font-bold text-center mb-5">Login</Text>

        <TextInput className="w-full border border-gray-300 rounded-lg p-3 mb-4" placeholder="Email" keyboardType="email-address" />
        <TextInput className="w-full border border-gray-300 rounded-lg p-3 mb-4" placeholder="Password" secureTextEntry />

        <TouchableOpacity>
          <Text className="text-red-500 text-right mb-5">Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity className="w-full bg-red-500 py-4 rounded-lg">
          <Text className="text-white text-center font-semibold">Sign In</Text>
        </TouchableOpacity>

        <Text className="text-gray-600 text-center my-5">Or Continue With</Text>

        <View className="flex-row justify-evenly mb-5">
          <TouchableOpacity className="w-10 h-10 bg-blue-600 rounded-full" />
          <TouchableOpacity className="w-10 h-10 bg-gray-800 rounded-full" />
          <TouchableOpacity className="w-10 h-10 bg-red-600 rounded-full" />
        </View>

        <View className="flex-row justify-center">
          <Text className="text-gray-700">Don't have an account?</Text>
          <TouchableOpacity>
            <Text className="text-red-500 ml-1">Register for free</Text>
          </TouchableOpacity>
        </View>
      </View>

      </View>
    </ScrollView>
  );
};

export default LoginScreen;
