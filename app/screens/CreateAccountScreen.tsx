import { View, Text } from "react-native";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../Navigation";

type CreateAccountScreenNavigationProp = StackNavigationProp<RootStackParamList, "CreateAccount">;

interface CreateAccountScreenProps {
  navigation: CreateAccountScreenNavigationProp;
}

const CreateAccountScreen = ({ navigation }: CreateAccountScreenProps) => {
  return (
    <View className="flex-1 justify-center items-center bg-amber-400">

      <View className="absolute w-full h-full">
        <View className="h-[40%] bg-amber-400" />
        <View className="h-[60%] bg-black w-[100%] rounded-t-2xl" />
      </View>
      <View className="w-[80%] bg-white py-5 px-2 rounded-3xl">
        <View className="w-[80%] mx-auto">
          <Text className="text-3xl text-center font-bold text-gray-900 mb-6">Create Account</Text>

          <InputField placeholder="Full Name" />
          <InputField placeholder="Email" />
          <InputField placeholder="Password" secureTextEntry />
          <InputField placeholder="Confirm Password" secureTextEntry />

          <CustomButton title="Sign Up" onPress={() => navigation.navigate("Home")} />

          <Text
            className="text-red-500 mt-4 text-center"
            onPress={() => navigation.navigate("Login")}
          >
            Already have an account? Login
          </Text>
        </View>
          
      </View>
    </View>
  );
};

export default CreateAccountScreen;
