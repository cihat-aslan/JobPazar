import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, STYLES } from '../constants/theme';

export default function RegisterScreen({ navigation }) {
    const { register } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('EMPLOYER'); // Default role, maybe add a switch later
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        setIsLoading(true);
        const userData = { username, email, password, role };
        const result = await register(userData);
        setIsLoading(false);

        if (result.success) {
            Alert.alert('Başarılı', 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.', [
                { text: 'Tamam', onPress: () => navigation.navigate('Login') }
            ]);
        } else {
            Alert.alert('Kayıt Başarısız', result.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>JobPazar</Text>
                        <Text style={styles.subtitle}>Aramıza Katıl</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Kullanıcı Adı</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: ahmet123"
                            placeholderTextColor={COLORS.subText}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>E-posta</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ahmet@ornek.com"
                            placeholderTextColor={COLORS.subText}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Şifre</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={COLORS.subText}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Kayıt Ol</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Zaten hesabın var mı?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.link}>Giriş Yap</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.subText,
    },
    form: {
        backgroundColor: COLORS.card,
        padding: 24,
        borderRadius: STYLES.radius,
        ...STYLES.shadow,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: STYLES.radius,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
        color: COLORS.text,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: STYLES.radius,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        gap: 8,
    },
    footerText: {
        color: COLORS.subText,
    },
    link: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});
