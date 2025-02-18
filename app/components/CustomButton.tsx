import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
}

const CustomButton = ({ title, onPress }: CustomButtonProps) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',
        padding: 15,
        backgroundColor: '#007bff',
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default CustomButton;