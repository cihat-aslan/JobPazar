import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { COLORS, STYLES } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function JobDetailScreen({ route, navigation }) {
    const { jobId, jobTitle } = route.params;
    const { user, isGuest, logout } = useContext(AuthContext);

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Proposal State (For Owner)
    const [proposals, setProposals] = useState([]);

    // Applying State (For Non-Owner)
    const [applying, setApplying] = useState(false);
    const [myProposal, setMyProposal] = useState(null);

    // Proposal Form State
    const [modalVisible, setModalVisible] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [price, setPrice] = useState('');
    const [days, setDays] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    const isOwner = user && job && job.employer && user.id === job.employer.id;

    useEffect(() => {
        fetchJobDetails();
    }, []);

    const fetchJobDetails = async () => {
        try {
            const response = await api.get(`/jobs/${jobId}`);
            setJob(response.data);

            // If user is logged in
            if (user) {
                // Check if owner to fetch proposals
                if (response.data.employer && user.id === response.data.employer.id) {
                    fetchProposals(response.data.id);
                } else {
                    checkMyProposal(response.data.id);
                }
            }
        } catch (error) {
            Alert.alert('Hata', 'İş detayları alınamadı.');
            navigation.goBack();
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchProposals = async (id) => {
        try {
            const response = await api.get(`/proposals/${id}`);
            setProposals(response.data);
        } catch (error) {
            console.error('Proposals error:', error);
        }
    };

    const checkMyProposal = async (id) => {
        if (!user) return;
        try {
            const response = await api.get(`/proposals/my-proposal?jobId=${id}&freelancerId=${user.id}`);
            if (response.status === 200 && response.data) {
                setMyProposal(response.data);
                // Pre-fill form for editing
                setPrice(response.data.price?.toString() || '');
                setDays(response.data.daysToDeliver?.toString() || '');
                setCoverLetter(response.data.coverLetter || '');
            }
        } catch (error) {
            // No proposal found or error, ignore
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobDetails();
    };

    // Owner Actions
    const handleDeleteJob = () => {
        Alert.alert(
            "İlanı Sil",
            "Bu ilanı silmek istediğinize emin misiniz?",
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/jobs/${jobId}`);
                            Alert.alert('Başarılı', 'İlan silindi.');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Hata', 'İlan silinemedi.');
                        }
                    }
                }
            ]
        );
    };

    const handleEditJob = () => {
        navigation.navigate('EditJob', { jobId: jobId });
    };

    const handleProposalAction = async (proposalId, action) => {
        try {
            if (action === 'accept') {
                await api.put(`/proposals/${proposalId}/accept`);
                Alert.alert('Başarılı', 'Teklif kabul edildi.');
            } else {
                await api.put(`/proposals/${proposalId}/reject`);
                Alert.alert('Başarılı', 'Teklif reddedildi.');
            }
            fetchProposals(jobId); // Refresh proposals list
            fetchJobDetails(); // Refresh job status (e.g. to show "Anlaşma Sağlandı")
        } catch (error) {
            Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
        }
    };

    // Apply Actions
    const handleAiGenerate = async () => {
        if (!coverLetter || coverLetter.length < 5) {
            Alert.alert('AI Asistan', 'Lütfen kendinizden bahsetmek için en az birkaç kelime yazın.');
            return;
        }

        setAiLoading(true);
        try {
            const response = await api.post('/ai/generate-proposal', {
                jobDescription: job.description,
                userDraft: coverLetter
            });
            setCoverLetter(response.data.response);
        } catch (error) {
            Alert.alert('Hata', 'AI yanıtı alınamadı.');
        } finally {
            setAiLoading(false);
        }
    };

    const submitProposal = async () => {
        if (!price || !days || !coverLetter) {
            Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
            return;
        }

        setApplying(true);
        try {
            const payload = {
                price: parseFloat(price),
                daysToDeliver: parseInt(days),
                coverLetter: coverLetter
            };

            await api.post(`/proposals/${jobId}?freelancerId=${user.id}`, payload);
            Alert.alert('Başarılı', 'Teklifiniz gönderildi!');
            setModalVisible(false);
            checkMyProposal(jobId);
        } catch (error) {
            Alert.alert('Hata', error.response?.data || 'Teklif gönderilemedi.');
        } finally {
            setApplying(false);
        }
    };

    const handleApplyPress = () => {
        if (isGuest) {
            Alert.alert(
                "Misafir Kullanıcı",
                "Teklif vermek için lütfen giriş yapın veya kayıt olun.",
                [
                    { text: "İptal", style: "cancel" },
                    { text: "Giriş Yap", onPress: () => logout() }
                ]
            );
            return;
        }
        setModalVisible(true);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!job) return null;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* ... (Header and Job Info - No Change) ... */}
                <View style={styles.header}>
                    <Text style={styles.title}>{job.title}</Text>
                    <View style={styles.badges}>
                        <View style={styles.tag}><Text style={styles.tagText}>{job.category}</Text></View>
                        <View style={[styles.tag, { backgroundColor: '#e0e7ff' }]}><Text style={[styles.tagText, { color: COLORS.primary }]}>{job.budget}</Text></View>
                    </View>
                </View>

                {job.status === 'IN_PROGRESS' && (
                    <View style={[styles.statusBanner, { backgroundColor: '#dcfce7' }]}>
                        <Text style={[styles.statusBannerText, { color: '#166534' }]}>Bu ilan için anlaşma sağlandı.</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>İş Tanımı</Text>
                    <Text style={styles.description}>{job.description}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>İşveren</Text>
                    <Text style={styles.text}>@{job.employer?.username}</Text>
                </View>

                {isOwner ? (
                    // OWNER VIEW (No Change)
                    <View>
                        <View style={styles.actionButtons}>
                            {job.status === 'OPEN' ? (
                                <>
                                    <TouchableOpacity style={styles.editButton} onPress={handleEditJob}>
                                        <Text style={styles.editButtonText}>İlanı Düzenle</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteJob}>
                                        <Text style={styles.deleteButtonText}>İlanı Sil</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={{ flex: 1, padding: 10, backgroundColor: '#f3f4f6', borderRadius: 8, alignItems: 'center' }}>
                                    <Text style={{ color: '#6b7280', fontStyle: 'italic' }}>
                                        Bu ilan {job.status === 'COMPLETED' ? 'tamamlandığı' : 'işleme alındığı'} için düzenlenemez.
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>Teklifler ({proposals.length})</Text>

                        {proposals.length === 0 ? (
                            <Text style={styles.emptyText}>Henüz teklif gelmedi.</Text>
                        ) : (
                            proposals.map(prop => (
                                <View key={prop.id} style={styles.proposalCard}>
                                    <View style={styles.proposalHeader}>
                                        <Text style={styles.freelancerName}>@{prop.freelancer ? prop.freelancer.username : 'Bilinmeyen'}</Text>
                                        <Text style={styles.proposalPrice}>{prop.price} TL</Text>
                                    </View>
                                    <Text style={styles.proposalLetter}>{prop.coverLetter}</Text>
                                    <Text style={styles.proposalMeta}>{prop.daysToDeliver} Günde teslim</Text>

                                    <View style={styles.proposalActions}>
                                        {prop.status === 'ACCEPTED' ? (
                                            <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                                                <Text style={{ color: '#166534', fontWeight: 'bold' }}>ONAYLANDI</Text>
                                            </View>
                                        ) : prop.status === 'REJECTED' ? (
                                            <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
                                                <Text style={{ color: '#991b1b', fontWeight: 'bold' }}>REDDEDİLDİ</Text>
                                            </View>
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    style={[styles.actionBtn, styles.acceptBtn]}
                                                    onPress={() => handleProposalAction(prop.id, 'accept')}
                                                >
                                                    <Text style={styles.actionBtnText}>Onayla</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.actionBtn, styles.rejectBtn]}
                                                    onPress={() => handleProposalAction(prop.id, 'reject')}
                                                >
                                                    <Text style={styles.actionBtnText}>Reddet</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                ) : (
                    // PUBLIC / FREELANCER VIEW
                    <View>
                        {myProposal && (
                            <View style={styles.statusCard}>
                                <Text style={styles.statusTitle}>Teklif Durumu</Text>
                                <Text style={styles.statusText}>
                                    {myProposal.status === 'PENDING' ? 'Beklemede' :
                                        myProposal.status === 'ACCEPTED' ? 'Kabul Edildi' : 'Reddedildi'}
                                </Text>
                                <View style={{ marginTop: 8, padding: 8, backgroundColor: '#f0f9ff', borderRadius: 6 }}>
                                    <Text style={{ fontSize: 13, color: '#0369a1' }}>
                                        <Text style={{ fontWeight: 'bold' }}>Teklifiniz:</Text> {myProposal.price} TL ({myProposal.daysToDeliver} Gün)
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {!isOwner && user?.role !== 'EMPLOYER' && user?.role !== 'ADMIN' && job.status === 'OPEN' && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.applyButton, myProposal && { backgroundColor: COLORS.success }]}
                        onPress={handleApplyPress}
                    >
                        <Text style={styles.applyButtonText}>
                            {myProposal ? 'Teklifi Düzenle' : 'Teklif Ver'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Proposal Modal - Title Update */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{myProposal ? 'Teklifi Güncelle' : 'Teklif Hazırla'}</Text>

                        {myProposal && (
                            <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#eff6ff', borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe' }}>
                                <Text style={{ color: '#1e40af', fontSize: 13 }}>
                                    ℹ️ Mevcut teklifinizi güncelliyorsunuz. Önceki teklifinizin üzerine yazılacaktır.
                                </Text>
                            </View>
                        )}

                        <Text style={styles.label}>Ücret Beklentiniz (₺)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                            placeholder="Örn: 5000"
                        />

                        <Text style={styles.label}>Teslim Süresi (Gün)</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={days}
                            onChangeText={setDays}
                            placeholder="Örn: 7"
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.label}>Ön Yazı</Text>
                            <TouchableOpacity onPress={handleAiGenerate} disabled={aiLoading}>
                                <Text style={{ color: COLORS.ai, fontWeight: 'bold' }}>
                                    {aiLoading ? 'Yazıyor...' : '✨ AI ile Yaz'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            value={coverLetter}
                            onChangeText={setCoverLetter}
                            placeholder="Kendinizden ve projeye yaklaşımınızdan kısaca bahsedin..."
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ccc' }]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalBtnText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                                onPress={submitProposal}
                                disabled={applying}
                            >
                                {applying ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Gönder</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    navHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    backButton: { marginRight: 16 },
    navTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    content: { padding: 20 },
    header: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
    badges: { flexDirection: 'row', gap: 10 },
    tag: { backgroundColor: '#eee', padding: 6, borderRadius: 6 },
    tagText: { fontSize: 12, fontWeight: '600' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: COLORS.text },
    description: { fontSize: 16, color: COLORS.subText, lineHeight: 24 },
    text: { fontSize: 16, color: COLORS.text },
    statusCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: COLORS.success },
    statusTitle: { fontWeight: 'bold', color: COLORS.success },
    statusText: { fontSize: 16 },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
    applyButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, alignItems: 'center' },
    applyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 400 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: COLORS.text },
    input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, marginBottom: 15 },
    textArea: { height: 100, textAlignVertical: 'top' },
    modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
    modalBtn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
    modalBtnText: { color: '#fff', fontWeight: 'bold' },

    // Owner Styles
    actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    editButton: { flex: 1, backgroundColor: COLORS.warning || '#f59e0b', padding: 14, borderRadius: 8, alignItems: 'center' },
    editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    deleteButton: { flex: 1, backgroundColor: COLORS.error || '#ef4444', padding: 14, borderRadius: 8, alignItems: 'center' },
    deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
    emptyText: { fontStyle: 'italic', color: COLORS.subText },
    proposalCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, ...STYLES.shadow },
    proposalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    freelancerName: { fontWeight: 'bold', fontSize: 16, color: COLORS.text },
    proposalPrice: { fontWeight: 'bold', fontSize: 16, color: COLORS.primary },
    proposalLetter: { color: COLORS.subText, marginBottom: 8, lineHeight: 20 },
    proposalMeta: { fontSize: 12, color: COLORS.subText, marginBottom: 12 },
    proposalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
    actionBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
    acceptBtn: { backgroundColor: COLORS.success || '#22c55e' },
    rejectBtn: { backgroundColor: COLORS.error || '#ef4444' },
    actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
    statusBanner: { padding: 10, borderRadius: 8, marginBottom: 15 },
    statusBannerText: { fontWeight: 'bold', textAlign: 'center' }
});
