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
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-3xl font-bold text-gray-900 mb-6">Create Account</Text>

      <InputField placeholder="Full Name" />
      <InputField placeholder="Email" />
      <InputField placeholder="Password" secureTextEntry />

      <CustomButton title="Sign Up" onPress={() => navigation.navigate("Home")} />

      <Text
        className="text-red-500 mt-4"
        onPress={() => navigation.navigate("Login")}
      >
        Already have an account? Login
      </Text>
    </View>
  );
};

export default CreateAccountScreen;
