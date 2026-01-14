import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, STYLES } from '../constants/theme';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function CreateJobScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [budget, setBudget] = useState('');
    const [duration, setDuration] = useState(''); // New State
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);

    const categories = ['Yazılım Geliştirme', 'Dijital Pazarlama', 'Grafik Tasarım', 'Çeviri & İçerik', 'Video & Animasyon', 'Diğer'];
    const budgets = [
        { label: 'Very Low (100 - 1.000 TL)', value: 'Very Low' },
        { label: 'Low (1.000 - 5.000 TL)', value: 'Low' },
        { label: 'Medium (5.000 - 15.000 TL)', value: 'Medium' },
        { label: 'High (15.000 - 50.000 TL)', value: 'High' },
        { label: 'Very High (50.000+ TL)', value: 'Very High' }
    ];

    const handleAiGenerate = async () => {
        if ((!title || title.length < 5) && (!description || description.length < 5)) {
            Alert.alert('AI Asistan', 'Lütfen en azından bir ilan başlığı veya taslak açıklama girin.');
            return;
        }
        setAiLoading(true);
        try {
            // Include description as draft for refinement
            const response = await api.post('/ai/generate-job-description', {
                title,
                draft: description
            });
            setDescription(response.data.response);
        } catch (error) {
            Alert.alert('Hata', 'AI yanıtı alınamadı.');
            console.error(error);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !category || !budget || !duration) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title,
                description,
                category,
                budget,
                duration: parseInt(duration) || 0
            };

            await api.post(`/jobs?employerId=${user.id}`, payload);
            Alert.alert('Başarılı', 'İlanınız başarıyla oluşturuldu!', [
                { text: 'Tamam', onPress: () => navigation.navigate('Home') }
            ]);

            // Reset form
            setTitle('');
            setDescription('');
            setCategory('');
            setBudget('');
            setDuration('');
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'İlan oluşturulurken bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const renderSelectorModal = (visible, onClose, items, onSelect, title) => (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {items.map((item, index) => {
                            const isObject = typeof item === 'object';
                            const label = isObject ? item.label : item;
                            const val = isObject ? item.value : item;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        onSelect(val);
                                        onClose();
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    // Helper to get label derived from value
    const getBudgetLabel = (val) => {
        const found = budgets.find(b => b.value === val);
        return found ? found.label : val;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Yeni İlan Oluştur</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Title Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>İlan Başlığı</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Örn: E-ticaret sitesi için logo tasarımı"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />
                </View>

                {/* Category Selection */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Kategori</Text>
                    <TouchableOpacity
                        style={styles.selector}
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <Text style={category ? styles.selectorText : styles.placeholderText}>
                            {category || 'Kategori Seçiniz'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={COLORS.subText} />
                    </TouchableOpacity>
                </View>

                {/* Budget Selection */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Bütçe</Text>
                    <TouchableOpacity
                        style={styles.selector}
                        onPress={() => setShowBudgetModal(true)}
                    >
                        <Text style={budget ? styles.selectorText : styles.placeholderText}>
                            {budget ? getBudgetLabel(budget) : 'Bütçe Seçiniz'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={COLORS.subText} />
                    </TouchableOpacity>
                </View>

                {/* Duration Input - NEW */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tahmini Süre (Gün)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Örn: 30"
                        value={duration}
                        onChangeText={setDuration}
                        keyboardType="numeric"
                        maxLength={3}
                    />
                </View>

                {/* Description Input with AI */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>İş Tanımı</Text>
                        <TouchableOpacity
                            style={styles.aiButton}
                            onPress={handleAiGenerate}
                            disabled={aiLoading}
                        >
                            <Ionicons name="sparkles" size={16} color="#fff" style={{ marginRight: 4 }} />
                            <Text style={styles.aiButtonText}>
                                {aiLoading ? 'Yazılıyor...' : 'AI ile Yaz'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="İşin detaylarını, beklentilerinizi ve teslim süresini belirtin..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>İlanı Yayınla</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {renderSelectorModal(
                showCategoryModal,
                () => setShowCategoryModal(false),
                categories,
                setCategory,
                "Kategori Seç"
            )}

            {renderSelectorModal(
                showBudgetModal,
                () => setShowBudgetModal(false),
                budgets,
                setBudget,
                "Bütçe Seç"
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: COLORS.text,
    },
    textArea: {
        height: 150,
        paddingTop: 12,
    },
    selector: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectorText: {
        fontSize: 16,
        color: COLORS.text,
    },
    placeholderText: {
        fontSize: 16,
        color: COLORS.subText,
    },
    aiButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.ai,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignItems: 'center',
    },
    aiButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        ...STYLES.shadow,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    modalItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalItemText: {
        fontSize: 16,
        color: COLORS.text,
    },
});
