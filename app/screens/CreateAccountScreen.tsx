import { View, Text, StyleSheet } from 'react-native';
import InputField from '../components/InputField';
import CustomButton from '../components/CustomButton';
import { styles } from '../styles/authStyles';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation';

type CreateAccountScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateAccount'>;

interface CreateAccountScreenProps {
    navigation: CreateAccountScreenNavigationProp;
}

const CreateAccountScreen = ({ navigation }: CreateAccountScreenProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <InputField placeholder="Full Name" />
            <InputField placeholder="Email" />
            <InputField placeholder="Password" secureTextEntry />
            <CustomButton title="Sign Up" onPress={() => navigation.navigate('Home')} />
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                Already have an account? Login
            </Text>
        </View>
    );
};

export default CreateAccountScreen;