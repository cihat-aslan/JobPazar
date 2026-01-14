import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import api from '../../services/api';
import { COLORS, STYLES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminFeedbackScreen() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Reply Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const response = await api.get('/feedbacks');
            // Sort by date desc (if API doesn't)
            const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setFeedbacks(sorted);
        } catch (error) {
            Alert.alert('Hata', 'Geri bildirimler alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReply = (item) => {
        if (item.replied) {
            Alert.alert('Bilgi', 'Bu bildirime zaten yanıt verilmiş.');
            return;
        }
        setSelectedFeedback(item);
        setReplyText('');
        setModalVisible(true);
    };

    const sendReply = async () => {
        if (!replyText.trim()) {
            Alert.alert('Uyarı', 'Lütfen bir yanıt yazın.');
            return;
        }

        setSending(true);
        try {
            await api.post('/admin/feedback/reply', {
                feedbackId: selectedFeedback.id,
                reply: replyText
            });
            Alert.alert('Başarılı', 'Yanıt gönderildi.');
            setModalVisible(false);
            fetchFeedbacks(); // Refresh list to show "Replied" status
        } catch (error) {
            Alert.alert('Hata', 'Yanıt gönderilemedi.');
        } finally {
            setSending(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.username}>@{item.user ? item.user.username : 'Anonim'}</Text>
                <Text style={styles.date}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : ''}
                </Text>
            </View>

            <Text style={styles.message}>{item.message}</Text>

            {item.replied ? (
                <View style={styles.repliedBox}>
                    <Text style={styles.repliedText}>✅ Yanıtlandı: {item.reply}</Text>
                </View>
            ) : (
                <TouchableOpacity style={styles.replyButton} onPress={() => handleOpenReply(item)}>
                    <Text style={styles.replyButtonText}>Yanıtla</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />;

    return (
        <View style={styles.container}>
            <FlatList
                data={feedbacks}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={<Text style={styles.emptyText}>Henüz geri bildirim yok.</Text>}
            />

            {/* Reply Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Kullanıcıya Yanıt Ver</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.originalMessage}>
                            <Text style={styles.label}>Kullanıcı Mesajı:</Text>
                            <Text style={{ fontStyle: 'italic', color: COLORS.subText }}>"{selectedFeedback?.message}"</Text>
                        </View>

                        <Text style={styles.label}>Yanıtınız:</Text>
                        <TextInput
                            style={styles.input}
                            multiline
                            placeholder="Yanıtınızı buraya yazın..."
                            value={replyText}
                            onChangeText={setReplyText}
                        />

                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={sendReply}
                            disabled={sending}
                        >
                            {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Gönder</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: STYLES.radius, marginBottom: 15, ...STYLES.shadow },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    username: { fontWeight: 'bold', color: COLORS.primary },
    date: { fontSize: 12, color: COLORS.subText },
    message: { fontSize: 15, color: COLORS.text, lineHeight: 22, marginBottom: 10 },
    repliedBox: { backgroundColor: '#f0fdf4', padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#16a34a' },
    repliedText: { color: '#166534', fontSize: 13 },
    replyButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 8, alignItems: 'center', alignSelf: 'flex-start' },
    replyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.subText },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    originalMessage: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 8, marginBottom: 15 },
    label: { fontWeight: 'bold', marginBottom: 5, color: COLORS.text },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, height: 100, textAlignVertical: 'top', marginBottom: 15 },
    sendButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center' },
    sendButtonText: { color: '#fff', fontWeight: 'bold' }
});
