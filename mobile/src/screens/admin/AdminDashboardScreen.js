import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { COLORS, STYLES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboardScreen({ navigation }) {
    const { logout } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // AI Report States
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [aiReport, setAiReport] = useState('');
    const [generatingReport, setGeneratingReport] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    // Add Logout button to Navigation Header
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={logout} style={{ marginRight: 15, padding: 5 }}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAiReport = async () => {
        if (!stats) return;
        setGeneratingReport(true);
        try {
            const response = await api.post('/ai/admin-report', stats);
            setAiReport(response.data.response);
            setReportModalVisible(true);
        } catch (error) {
            console.error('AI Report Error:', error);
            const errorMessage = error.response?.data?.response || error.response?.data?.error || error.message || 'Bilinmeyen hata';
            Alert.alert('Hata', `AI raporu oluşturulamadı: ${errorMessage}`);
        } finally {
            setGeneratingReport(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {loading ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 50 }} /> : (
                <>
                    {/* Management Cards Grid */}
                    <View style={styles.cardsContainer}>
                        {/* Users Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Kullanıcı Yönetimi</Text>
                                <Ionicons name="people" size={24} color={COLORS.primary} />
                            </View>
                            <Text style={styles.cardDescription}>
                                Kayıtlı kullanıcıları görüntüle, düzenle veya sil.
                            </Text>
                            <TouchableOpacity
                                style={styles.cardButton}
                                onPress={() => navigation.navigate('AdminUsers')}
                            >
                                <Text style={styles.cardButtonText}>Kullanıcıları Listele</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Jobs Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>İlan Denetimi</Text>
                                <Ionicons name="briefcase" size={24} color={COLORS.primary} />
                            </View>
                            <Text style={styles.cardDescription}>
                                Onay bekleyen iş ilanlarını incele ve onayla.
                            </Text>
                            <TouchableOpacity
                                style={styles.cardButton}
                                onPress={() => navigation.navigate('AdminJobs')}
                            >
                                <Text style={styles.cardButtonText}>İlanları İncele</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Feedback Card */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Gelen Görüşler</Text>
                                <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
                            </View>
                            <Text style={styles.cardDescription}>
                                Kullanıcılardan gelen geri bildirimleri incele.
                            </Text>
                            <TouchableOpacity
                                style={styles.cardButton}
                                onPress={() => navigation.navigate('AdminFeedback')}
                            >
                                <Text style={styles.cardButtonText}>Mesajları Oku</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* System Statistics Section */}
                    <View style={styles.statsSection}>
                        <View style={styles.statsHeader}>
                            <Text style={styles.statsTitle}>Sistem İstatistikleri</Text>
                            <Ionicons name="stats-chart" size={24} color="#fff" />
                        </View>
                        <Text style={styles.statText}>Toplam Kullanıcı: {stats?.totalUsers || 0}</Text>
                        <Text style={styles.statText}>Aktif İlan: {stats?.totalJobs || 0}</Text>

                        <TouchableOpacity
                            style={styles.aiButton}
                            onPress={handleAiReport}
                            disabled={generatingReport}
                        >
                            {generatingReport ? (
                                <ActivityIndicator color={COLORS.primary} size="small" />
                            ) : (
                                <>
                                    <Ionicons name="sparkles" size={18} color={COLORS.primary} />
                                    <Text style={styles.aiButtonText}>AI Raporu Al</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* AI Report Modal */}
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={reportModalVisible}
                        onRequestClose={() => setReportModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>🤖 AI Yönetici Özeti</Text>
                                    <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={COLORS.text} />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={{ maxHeight: 400 }}>
                                    {aiReport ? (
                                        aiReport.split('\n').map((line, index) => {
                                            // 1. Clean Line & Identify Type
                                            let cleanLine = line.trim();
                                            if (!cleanLine) return <View key={index} style={{ height: 8 }} />; // Spacer for empty lines

                                            // Headers (#)
                                            if (cleanLine.startsWith('#')) {
                                                return (
                                                    <Text key={index} style={[styles.reportText, { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginVertical: 8 }]}>
                                                        {cleanLine.replace(/#/g, '').trim()}
                                                    </Text>
                                                );
                                            }

                                            // Lists (*)
                                            let isBullet = false;
                                            if (cleanLine.startsWith('* ')) {
                                                isBullet = true;
                                                cleanLine = cleanLine.substring(2).trim();
                                            } else if (cleanLine.startsWith('- ')) {
                                                isBullet = true;
                                                cleanLine = cleanLine.substring(2).trim();
                                            }

                                            // Parse Bold (**...**)
                                            const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

                                            return (
                                                <View key={index} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4, paddingLeft: isBullet ? 10 : 0 }}>
                                                    {isBullet && <Text style={[styles.reportText, { marginRight: 6, fontWeight: 'bold' }]}>•</Text>}
                                                    {parts.map((part, partIndex) => {
                                                        if (part.startsWith('**') && part.endsWith('**')) {
                                                            return (
                                                                <Text key={partIndex} style={[styles.reportText, { fontWeight: 'bold' }]}>
                                                                    {part.replace(/\*\*/g, '')}
                                                                </Text>
                                                            );
                                                        }
                                                        return <Text key={partIndex} style={styles.reportText}>{part}</Text>;
                                                    })}
                                                </View>
                                            );
                                        })
                                    ) : (
                                        <Text style={styles.reportText}>Rapor oluşturuluyor...</Text>
                                    )}
                                </ScrollView>
                                <TouchableOpacity style={styles.closeButton} onPress={() => setReportModalVisible(false)}>
                                    <Text style={styles.closeButtonText}>Kapat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },

    cardsContainer: { gap: 15, marginBottom: 25, marginTop: 10 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, ...STYLES.shadow, borderWidth: 1, borderColor: '#e2e8f0' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    cardDescription: { color: '#64748b', fontSize: 13, marginBottom: 20, lineHeight: 18 },
    cardButton: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
    cardButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },

    statsSection: {
        backgroundColor: '#8b5cf6', // Violet/Purple matching web
        borderRadius: 12,
        padding: 20,
        ...STYLES.shadow
    },
    statsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    statsTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    statText: { color: '#e9d5ff', fontSize: 14, marginBottom: 5 },

    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 10,
        marginTop: 15,
        height: 40
    },
    aiButtonText: { color: COLORS.primary, fontWeight: 'bold', marginLeft: 8, fontSize: 13 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: '80%', ...STYLES.shadow },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    reportText: { fontSize: 15, color: '#334155', lineHeight: 24 },
    closeButton: { marginTop: 20, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, alignItems: 'center' },
    closeButtonText: { color: '#64748b', fontWeight: 'bold' }
});
