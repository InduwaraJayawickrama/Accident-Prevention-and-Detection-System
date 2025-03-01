import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import moment from "moment";
import { Home, Coffee, User } from "lucide-react-native"; 

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
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
      {/* Header */}
      <View className="px-5 pt-10 pb-3 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-black">Hi Thilina</Text>
          <Text className="text-lg text-gray-800">Good morning!</Text>
        </View>
        <Text className="text-sm text-gray-700 text-right">{address}</Text>
      </View>

      {/* Safety Message */}
      <View className="px-5 mb-3">
        <Text className="text-lg font-semibold text-black">
          Drive safe. Save lives. 🚦🚗
        </Text>
      </View>

      {/* Map Section */}
      <View className="flex-1 mx-4 rounded-lg overflow-hidden border border-gray-400">
        {location ? (
          <MapView
            style={{ width: "100%", height: 300 }}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {/* Marker for Current Location */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
            />
            {/* Circle Around the Location */}
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

      {/* Date & Time Section */}
      <View className="flex-row justify-center space-x-2 mt-3">
        <Text className="px-5 py-2 bg-blue-200 text-gray-800 rounded-lg">{currentDate}</Text>
        <Text className="px-5 py-2 bg-blue-200 text-gray-800 rounded-lg">{currentTime}</Text>
      </View>

      {/* Bottom Navigation */}
      <View className="flex-row justify-between bg-black p-4 rounded-t-xl mt-3">
        <TouchableOpacity className="items-center">
          <Coffee size={24} color="white" />
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
