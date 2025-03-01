import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import moment from "moment";
import { Home, Book, User } from "lucide-react-native"; 

const HomeScreen = () => {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [address, setAddress] = useState("Fetching location...");
  const [currentTime, setCurrentTime] = useState(moment().format("hh:mm A"));
  const [currentDate, setCurrentDate] = useState(moment().format("MMM DD, YYYY"));

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Permission Denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      let reverseGeo = await Location.reverseGeocodeAsync(loc.coords);
      if (reverseGeo.length > 0) {
        setAddress(`${reverseGeo[0].city}, ${reverseGeo[0].region} ${reverseGeo[0].postalCode}`);
      }
    })();

    const timeInterval = setInterval(() => {
      setCurrentTime(moment().format("hh:mm A"));
      setCurrentDate(moment().format("MMM DD, YYYY"));
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
        <Text className="text-1xl text-gray-700 text-right">{address}</Text>
      </View>

      <View className="px-2 py-3 mb-3">
        <Text className="text-4xl font-semibold text-black text-center">
          Drive safe.Save lives.🚦🚗
        </Text>
      </View>

      <View className="flex-1 mx-8 my-8 rounded-lg overflow-hidden border border-gray-400">
        {location ? (
          <MapView
            style={{ width: "100%", height: "100%" }}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
            />
            <Circle
              center={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              radius={1000}
              strokeColor="rgba(0, 150, 255, 0.5)"
              fillColor="rgba(0, 150, 255, 0.2)"
            />
          </MapView>
        ) : (
          <View className="items-center justify-center h-72">
            <ActivityIndicator size="large" color="black" />
            <Text className="text-gray-700 mt-2">Fetching location...</Text>
          </View>
        )}
      </View>

      <View className="flex-row justify-center space-x-2 mt-3">
        <Text className="px-5 py-5 bg-blue-200 text-gray-800 rounded-lg">{currentDate}</Text>
        <Text className="px-5 py-5 bg-blue-200 text-gray-800 rounded-lg">{currentTime}</Text>
      </View>

      <View className="flex-row justify-between bg-black p-4 rounded-t-xl mt-3">
        <TouchableOpacity className="items-center">
          <Book size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Home size={24} color="green" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <User size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
