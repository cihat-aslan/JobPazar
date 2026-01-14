import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../services/api';
import { COLORS, STYLES } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function EditJobScreen({ route, navigation }) {
    const { jobId } = route.params;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('Medium'); // Default
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Hardcoded budget options for now, should match backend/EmploymentType if applicable but using string as per JobCard logic
    const budgetOptions = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

    useEffect(() => {
        fetchJobDetails();
    }, []);

    const fetchJobDetails = async () => {
        try {
            const response = await api.get(`/jobs/${jobId}`);
            const job = response.data;
            setTitle(job.title);
            setDescription(job.description);
            setBudget(job.budget || 'Medium');

            // Defensive Check
            if (job.status !== 'OPEN') {
                Alert.alert('Uyarı', 'Bu ilan artık düzenlenemez.');
                navigation.goBack();
            }
        } catch (error) {
            Alert.alert('Hata', 'İş detayları alınamadı.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title || !description) {
            Alert.alert('Hata', 'Lütfen başlık ve açıklama giriniz.');
            return;
        }

        setSaving(true);
        try {
            await api.put(`/jobs/${jobId}`, {
                title,
                description,
                budget, // Backend expects this string if reusing validation
                // Add other fields if necessary
            });
            Alert.alert('Başarılı', 'İlan güncellendi.');
            navigation.goBack(); // Go back to JobDetail
        } catch (error) {
            Alert.alert('Hata', 'Güncelleme başarısız.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>İlanı Düzenle</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>İlan Başlığı</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Örn: E-Ticaret Sitesi Geliştirme"
                />

                <Text style={styles.label}>Açıklama</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    placeholder="Detaylı iş tanımı..."
                />

                <Text style={styles.label}>Bütçe</Text>
                <View style={styles.budgetContainer}>
                    {budgetOptions.map(opt => (
                        <TouchableOpacity
                            key={opt}
                            style={[
                                styles.budgetOption,
                                budget === opt && styles.budgetOptionActive
                            ]}
                            onPress={() => setBudget(opt)}
                        >
                            <Text style={[
                                styles.budgetOptionText,
                                budget === opt && styles.budgetOptionTextActive
                            ]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    content: { padding: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: COLORS.text },
    input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16, backgroundColor: '#fff' },
    textArea: { height: 120, textAlignVertical: 'top' },
    budgetContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    budgetOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    budgetOptionActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary
    },
    budgetOptionText: { fontSize: 14, color: COLORS.text },
    budgetOptionTextActive: { color: '#fff', fontWeight: 'bold' },
    saveButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
