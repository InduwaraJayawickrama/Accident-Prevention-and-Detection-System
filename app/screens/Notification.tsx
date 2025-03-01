import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import moment from "moment";
import { Home, Book, User, Heart, Send } from "lucide-react-native"; 

const notifications = [
  {
    id: 1,
    name: "Yashi",
    location: "Ariviyal Nagar, Kilinochchi",
    area: "Colombo - Jaffna Road",
    time: "08:30 AM",
    status: "Severe collision, Traffic affected",
    image: "https://i.imgur.com/JzV6AXl.jpeg", 
    likes: "12K",
  },
  {
    id: 2,
    name: "Yashi",
    location: "Ariviyal Nagar, Kilinochchi",
    area: "Colombo - Jaffna Road",
    time: "08:30 AM",
    status: "Minor accident, No injuries",
    image: "https://i.imgur.com/MKMVb2O.jpeg", 
    likes: "12K",
  },
];

const Notification = () => {
  const [address, setAddress] = useState("Fetching location...");
  const [currentTime, setCurrentTime] = useState(moment().format("hh:mm A"));

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Permission Denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      let reverseGeo = await Location.reverseGeocodeAsync(loc.coords);
      if (reverseGeo.length > 0) {
        setAddress(`${reverseGeo[0].city}, ${reverseGeo[0].region} ${reverseGeo[0].postalCode}`);
      }
    })();

    const timeInterval = setInterval(() => {
      setCurrentTime(moment().format("hh:mm A"));
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  return (
    <View className="flex-1 bg-yellow-400">
      <View className="px-5 pt-10 pb-3 flex-row justify-between items-center">
        <View>
          <Text className="text-5xl font-bold text-black">Hi Thilina</Text>
          <Text className="text-2xl text-gray-800">Good morning!</Text>
        </View>
        <Text className="text-2pl text-gray-700 text-right">{address}</Text>
      </View>

      <Text className="px-5 text-4xl font-semibold text-black">Notification</Text>

      <ScrollView className="px-4">
        {notifications.map((item) => (
          <View key={item.id} className="bg-white p-4 rounded-xl mt-4 shadow-md">
            <View className="flex-row items-center">
              <Image source={{ uri: "https://i.imgur.com/2nCt3Sbl.jpg" }} className="w-10 h-10 rounded-full mr-3" />
              <View>
                <Text className="text-lg font-semibold">{item.name}</Text>
                <Text className="text-sm text-gray-600">{item.location}</Text>
              </View>
            </View>

            <View className="mt-3">
              <Text className="text-gray-700">📍 Location: {item.area}</Text>
              <Text className="text-gray-700">⏰ Time: {item.time}</Text>
              <Text className="text-gray-700">⚠️ Status: {item.status}</Text>
              <Text className="text-blue-600 mt-1">read more..</Text>
            </View>

            <Image source={{ uri: item.image }} className="w-full h-36 mt-3 rounded-lg" />

            <View className="flex-row justify-between mt-3">
              <View className="flex-row items-center">
                <Heart size={20} color="gray" />
                <Text className="ml-2 text-gray-600">{item.likes}</Text>
              </View>
              <Send size={20} color="gray" />
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row justify-between bg-black p-4 rounded-t-xl mt-3">
        <TouchableOpacity className="items-center">
          <Book size={24} color="green" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Home size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <User size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Notification;
