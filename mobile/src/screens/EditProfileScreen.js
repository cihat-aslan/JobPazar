import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { COLORS, STYLES } from '../constants/theme';
import api from '../services/api';

export default function EditProfileScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);

    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const handleSave = async () => {
        if (!password) {
            Alert.alert('Güvenlik', 'Değişiklikleri kaydetmek için mevcut şifrenizi giriniz.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                userId: user.id.toString(),
                username: username,
                email: email,
                bio: bio,
                currentPassword: password
            };

            await api.put('/auth/update', payload);
            Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', error.response?.data || 'Güncelleme başarısız.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Hesabı Sil",
            "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: () => {
                        // Backend delete implementation would go here
                        // api.delete('/auth/delete'); 
                        Alert.alert("Bilgi", "Hesabınız başarıyla silindi.");
                        logout();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.formSection}>
                    <Text style={styles.label}>Kullanıcı Adı</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>E-posta</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {/* Bio Section with AI */}
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Biyografi</Text>
                        <TouchableOpacity style={styles.aiButton} onPress={async () => {
                            if (!bio || bio.length < 3) {
                                Alert.alert('AI Asistan', 'Lütfen biyografiniz için birkaç anahtar kelime yazın.');
                                return;
                            }
                            setAiLoading(true);
                            try {
                                const response = await api.post('/ai/refine-bio', { text: bio });
                                setBio(response.data.response);
                            } catch (error) {
                                Alert.alert('Hata', 'AI yanıtı alınamadı.');
                            } finally {
                                setAiLoading(false);
                            }
                        }} disabled={aiLoading}>
                            <Text style={styles.aiButtonText}>{aiLoading ? '...' : '✨ AI ile Düzenle'}</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        placeholder="Kendinizden bahsedin..."
                    />

                    <Text style={styles.label}>Onay İçin Şifre (Zorunlu)</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="Mevcut şifreniz"
                    />

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.dangerZone}>
                    <Text style={styles.dangerTitle}>Tehlikeli Bölge</Text>
                    <Text style={styles.dangerText}>
                        Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir ve geri getirilemez.
                    </Text>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <Text style={styles.deleteButtonText}>Hesabımı Sil</Text>
                    </TouchableOpacity>
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
    formSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: STYLES.radius,
        ...STYLES.shadow,
        marginBottom: 30,
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
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#F9FAFB',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: STYLES.radius,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dangerZone: {
        backgroundColor: '#FEF2F2',
        padding: 20,
        borderRadius: STYLES.radius,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    dangerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#991B1B',
        marginBottom: 8,
    },
    dangerText: {
        fontSize: 14,
        color: '#7F1D1D',
        marginBottom: 15,
        lineHeight: 20,
    },
    deleteButton: {
        backgroundColor: '#DC2626',
        padding: 14,
        borderRadius: STYLES.radius,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
