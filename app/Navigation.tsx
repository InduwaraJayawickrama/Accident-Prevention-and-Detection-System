import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';

export type RootStackParamList = {
    Login: undefined;
    CreateAccount: undefined;
    Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigation;