import { TextInput, StyleSheet } from 'react-native';

interface InputFieldProps {
    placeholder: string;
    secureTextEntry?: boolean;
}

const InputField = ({ placeholder, secureTextEntry = false }: InputFieldProps) => {
    return (
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        width: '100%',
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        fontSize: 16,
    },
});

export default InputField;