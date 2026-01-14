import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, STYLES } from '../constants/theme';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function AboutContactScreen() {
    const { user } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendFeedback = async () => {
        if (!message.trim()) {
            Alert.alert('Uyarı', 'Lütfen bir mesaj yazın.');
            return;
        }

        if (!user) {
            Alert.alert('Hata', 'Mesaj göndermek için giriş yapmalısınız.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/feedbacks', {
                userId: user.id,
                message: message
            });
            Alert.alert('Başarılı', 'Mesajınız iletildi. Teşekkürler!');
            setMessage('');
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* About Section */}
                <View style={styles.card}>
                    <Text style={styles.title}>Hakkımızda</Text>
                    <Text style={styles.text}>
                        JobPazar, iş arayanlarla işverenleri buluşturan yenilikçi bir platformdur.
                        Amacımız, güvenilir ve hızlı bir şekilde doğru işi doğru kişiyle eşleştirmektir.
                        AI destekli özelliklerimizle kariyer yolculuğunuzda size rehberlik ediyoruz.
                    </Text>
                </View>

                {/* Contact Section */}
                <View style={styles.card}>
                    <Text style={styles.title}>İletişim</Text>
                    <Text style={styles.text}>
                        Soru, görüş ve önerileriniz bizim için değerlidir. Aşağıdaki formu kullanarak bize ulaşabilirsiniz.
                    </Text>

                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Mesajınız</Text>
                        <TouchableOpacity style={styles.aiButton} onPress={async () => {
                            if (!message || message.length < 3) {
                                Alert.alert('AI Asistan', 'Lütfen mesajınızın taslağını yazın.');
                                return;
                            }
                            // Local loading logic handling is tricky without state, but for simplicity:
                            try {
                                Alert.alert('AI', 'Mesajınız düzenleniyor...');
                                const response = await api.post('/ai/refine-feedback', { text: message });
                                setMessage(response.data.response);
                            } catch (error) {
                                Alert.alert('Hata', 'AI yanıtı alınamadı.');
                            }
                        }}>
                            <Text style={styles.aiButtonText}>✨ AI ile Düzenle</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Bize bir şeyler yazın..."
                        placeholderTextColor={COLORS.subText}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSendFeedback}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Gönder</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>JobPazar v1.0.0</Text>
                    <Text style={styles.footerText}>© 2026 Tüm Hakları Saklıdır.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: COLORS.card,
        padding: 20,
        borderRadius: STYLES.radius,
        marginBottom: 20,
        ...STYLES.shadow,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 10,
    },
    text: {
        fontSize: 15,
        color: COLORS.text,
        lineHeight: 22,
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
        marginTop: 10,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 8,
    },
    aiButton: {
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    aiButtonText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    textArea: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: STYLES.radius,
        padding: 12,
        marginBottom: 20,
        fontSize: 14,
        color: COLORS.text,
        height: 120,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: STYLES.radius,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
        marginTop: 10,
        paddingBottom: 20,
    },
    footerText: {
        color: COLORS.subText,
        fontSize: 12,
        marginBottom: 4,
    }
});
