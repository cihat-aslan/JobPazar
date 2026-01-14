import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import api from '../../services/api';
import { COLORS, STYLES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminEditJobScreen({ route, navigation }) {
    const { jobId } = route.params;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('Medium');
    const [status, setStatus] = useState('');
    const [duration, setDuration] = useState('');
    const [category, setCategory] = useState('Yazılım Geliştirme'); // Default or fetched

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Options
    const budgetOptions = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    const statusOptions = ['OPEN', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'];
    const categoryOptions = [
        'Yazılım Geliştirme', 'Grafik Tasarım', 'Dijital Pazarlama',
        'Çeviri', 'Video & Animasyon', 'Müzik & Ses', 'Diğer'
    ];

    // Modal States for Selectors
    const [modalType, setModalType] = useState(null); // 'budget', 'status', 'category'

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
            setStatus(job.status);
            setDuration(job.duration ? job.duration.toString() : '');
            setCategory(job.category || 'Yazılım Geliştirme');
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
            // Using existing update endpoint. 
            // NOTE: Backend might need update to support status/duration/category change if not already supported in PUT /jobs/{id}
            // For now assuming we send what we can, or using specific admin endpoint if strictly defined. 
            // In many simple implementations PUT /jobs/{id} updates full object.

            // If backend doesn't support status update via general PUT, we might need separate calls or a specific admin endpoint.
            // Sending standard fields first.

            const payload = {
                title,
                description,
                budget,
                duration: parseInt(duration) || 0,
                // category and status might be ignored by standard /jobs/{id} update if it's user-facing only
                // If so, we might need a dedicated admin update endpoint or assume the backend handles it.
                // Assuming backend aligns with payload for now:
                category,
                status
            };

            await api.put(`/jobs/${jobId}`, payload);
            Alert.alert('Başarılı', 'İlan güncellendi.');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Güncelleme başarısız.');
        } finally {
            setSaving(false);
        }
    };

    const renderSelectorModal = () => {
        let options = [];
        let onSelect = null;
        let titleText = '';

        if (modalType === 'budget') {
            options = budgetOptions;
            onSelect = setBudget;
            titleText = 'Bütçe Seç';
        } else if (modalType === 'status') {
            options = statusOptions;
            onSelect = setStatus;
            titleText = 'Durum Seç';
        } else if (modalType === 'category') {
            options = categoryOptions;
            onSelect = setCategory;
            titleText = 'Kategori Seç';
        }

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!modalType}
                onRequestClose={() => setModalType(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{titleText}</Text>
                            <TouchableOpacity onPress={() => setModalType(null)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {options.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={styles.modalOption}
                                    onPress={() => {
                                        onSelect(opt);
                                        setModalType(null);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>{opt}</Text>
                                    {((modalType === 'budget' && budget === opt) ||
                                        (modalType === 'status' && status === opt) ||
                                        (modalType === 'category' && category === opt)) && (
                                            <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                        )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>İlan Başlığı</Text>
                <TextInput style={styles.input} value={title} onChangeText={setTitle} />

                <View style={styles.labelRow}>
                    <Text style={styles.label}>Açıklama</Text>
                    <TouchableOpacity style={styles.aiButton} onPress={async () => {
                        if ((!title || title.length < 5) && (!description || description.length < 5)) {
                            Alert.alert('AI Asistan', 'Lütfen başlık veya taslak açıklama girin.');
                            return;
                        }
                        try {
                            const response = await api.post('/ai/generate-job-description', {
                                title,
                                draft: description
                            });
                            setDescription(response.data.response);
                        } catch (error) {
                            Alert.alert('Hata', 'AI yanıtı alınamadı.');
                        }
                    }}>
                        <Text style={styles.aiButtonText}>✨ AI ile Yaz</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <Text style={styles.label}>Kategori</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setModalType('category')}>
                    <Text style={styles.selectorText}>{category}</Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.subText} />
                </TouchableOpacity>

                <Text style={styles.label}>Bütçe</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setModalType('budget')}>
                    <Text style={styles.selectorText}>{budget}</Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.subText} />
                </TouchableOpacity>

                <Text style={styles.label}>Durum</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setModalType('status')}>
                    <Text style={[styles.selectorText, { fontWeight: 'bold' }]}>{status}</Text>
                    <Ionicons name="chevron-down" size={20} color={COLORS.subText} />
                </TouchableOpacity>

                <Text style={styles.label}>Tahmini Süre (Gün)</Text>
                <TextInput
                    style={styles.input}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                />

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Güncelle</Text>}
                </TouchableOpacity>
            </ScrollView>

            {renderSelectorModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: COLORS.text, marginTop: 10 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 8 },
    aiButton: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
    aiButtonText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, backgroundColor: '#fff', fontSize: 15 },
    textArea: { height: 120, textAlignVertical: 'top' },
    selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
    selectorText: { fontSize: 15, color: COLORS.text },
    saveButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: 400 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalOptionText: { fontSize: 16, color: COLORS.text },
});
