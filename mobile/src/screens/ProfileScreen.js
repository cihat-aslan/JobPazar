import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, STYLES } from '../constants/theme';
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
    const { user, isGuest, logout } = useContext(AuthContext);

    // Edit States
    const [modalVisible, setModalVisible] = useState(false);
    const [bio, setBio] = useState(user?.bio || '');
    const [password, setPassword] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    // Tab & Data States
    const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'offers'
    const [userJobs, setUserJobs] = useState([]);
    const [userProposals, setUserProposals] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            if (user) {
                fetchUserData();
            }
        }, [user, activeTab])
    );

    const fetchUserData = async () => {
        setLoadingData(true);
        try {
            if (activeTab === 'jobs') {
                const response = await api.get(`/jobs/my-jobs?userId=${user.id}`);
                setUserJobs(response.data);
            } else {
                const response = await api.get(`/proposals/my-proposals?freelancerId=${user.id}`);
                setUserProposals(response.data);
            }
        } catch (error) {
            console.error('Data fetch error:', error);
        } finally {
            setLoadingData(false);
        }
    };

    if (isGuest) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.guestContainer}>
                    <Ionicons name="person-circle-outline" size={100} color={COLORS.subText} />
                    <Text style={styles.guestTitle}>Misafir Oturumu</Text>
                    <Text style={styles.guestText}>
                        Profilinizi görüntülemek, ilan oluşturmak ve teklif vermek için giriş yapın.
                    </Text>
                    <TouchableOpacity style={styles.loginButton} onPress={logout}>
                        <Text style={styles.loginButtonText}>Giriş Yap / Kayıt Ol</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const handleAiRefine = async () => {
        if (!bio || bio.length < 3) {
            Alert.alert('AI Asistan', 'Lütfen AI için birkaç anahtar kelime yazın.');
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
    };

    const handleSave = async () => {
        if (!password) {
            Alert.alert('Güvenlik', 'Değişiklikleri kaydetmek için mevcut şifrenizi giriniz.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                userId: user.id.toString(),
                username: user.username,
                email: user.email,
                bio: bio,
                currentPassword: password
            };

            const response = await api.put('/auth/update', payload);
            Alert.alert('Başarılı', 'Profiliniz güncellendi.');
            setModalVisible(false);
            setPassword('');
        } catch (error) {
            Alert.alert('Hata', error.response?.data || 'Güncelleme başarısız.');
        } finally {
            setLoading(false);
        }
    };

    // Delivery States
    const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
    const [selectedProposalId, setSelectedProposalId] = useState(null);
    const [deliveryMessage, setDeliveryMessage] = useState('');
    const [deliveryLink, setDeliveryLink] = useState('');
    const [delivering, setDelivering] = useState(false);

    const openDeliveryModal = (proposalId) => {
        setSelectedProposalId(proposalId);
        setDeliveryModalVisible(true);
    };

    const handleDeliverWork = async () => {
        if (!deliveryMessage || !deliveryLink) {
            Alert.alert('Eksik Bilgi', 'Lütfen teslim mesajı ve dosya linki giriniz.');
            return;
        }

        setDelivering(true);
        try {
            await api.post(`/jobs/deliver/${selectedProposalId}`, {
                message: deliveryMessage,
                fileUrl: deliveryLink
            });
            Alert.alert('Başarılı', 'İş başarıyla teslim edildi. İşveren onayı bekleniyor.');
            setDeliveryModalVisible(false);
            setDeliveryMessage('');
            setDeliveryLink('');
            fetchUserData(); // Refresh list
        } catch (error) {
            Alert.alert('Hata', error.response?.data || 'Teslim edilemedi.');
        } finally {
            setDelivering(false);
        }
    };

    const getProposalStatusUI = (proposal) => {
        // Check Job Status for Completion
        if (proposal.job?.status === 'COMPLETED') {
            return { label: 'Tamamlandı', color: '#16a34a', bg: '#dcfce7' };
        }
        if (proposal.job?.status === 'REVIEW') {
            return { label: 'İnceleniyor', color: '#ea580c', bg: '#ffedd5' };
        }

        // Check Proposal Status
        switch (proposal.status) {
            case 'ACCEPTED':
                return { label: 'Kabul Edildi', color: '#16a34a', bg: '#dcfce7' };
            case 'REJECTED':
                return { label: 'Reddedildi', color: '#dc2626', bg: '#fee2e2' };
            default:
                return { label: 'Beklemede', color: '#d97706', bg: '#fef3c7' };
        }
    };

    const getJobStatusUI = (status) => {
        switch (status) {
            case 'OPEN':
                return { label: 'Yayında', color: '#166534', bg: '#dcfce7' };
            case 'IN_PROGRESS':
                return { label: 'Devam Ediyor', color: '#d97706', bg: '#fef3c7' };
            case 'REVIEW':
                return { label: 'İnceleniyor', color: '#0369a1', bg: '#e0f2fe' };
            case 'COMPLETED':
                return { label: 'Tamamlandı', color: '#15803d', bg: '#dcfce7' };
            case 'CLOSED':
                return { label: 'Kapandı', color: '#991b1b', bg: '#fee2e2' };
            case 'CANCELLED':
                return { label: 'İptal Edildi', color: '#991b1b', bg: '#fee2e2' };
            default:
                return { label: status, color: '#374151', bg: '#f3f4f6' };
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>Profilim</Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('AboutContact')}>
                        <View style={styles.infoButton}>
                            <Text style={styles.infoButtonText}>i</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                        <Ionicons name="settings-outline" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Info Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.username}>@{user?.username}</Text>
                        <Text style={styles.role}>{user?.role}</Text>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Hakkında</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Text style={styles.editText}>Düzenle</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.bioText}>
                        {user?.bio || 'Henüz bir biyografi eklenmemiş.'}
                    </Text>
                </View>

                {/* Tab Switcher */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'jobs' && styles.activeTab]}
                        onPress={() => setActiveTab('jobs')}
                    >
                        <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>İlanlarım</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'offers' && styles.activeTab]}
                        onPress={() => setActiveTab('offers')}
                    >
                        <Text style={[styles.tabText, activeTab === 'offers' && styles.activeTabText]}>Tekliflerim</Text>
                    </TouchableOpacity>
                </View>

                {/* Content Area */}
                <View style={styles.listContainer}>
                    {loadingData ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                    ) : (
                        activeTab === 'jobs' ? (
                            // Jobs List
                            userJobs.length > 0 ? (
                                userJobs.map(job => {
                                    const statusUI = getJobStatusUI(job.status);
                                    return (
                                        <TouchableOpacity
                                            key={job.id}
                                            style={styles.itemCard}
                                            onPress={() => navigation.navigate('JobDetail', { jobId: job.id, jobTitle: job.title })}
                                        >
                                            <View style={styles.itemHeader}>
                                                <Text style={styles.itemTitle}>{job.title}</Text>
                                                <View style={[styles.statusBadge, { backgroundColor: statusUI.bg }]}>
                                                    <Text style={[styles.statusText, { color: statusUI.color }]}>
                                                        {statusUI.label}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.itemSubtitle}>{job.category}</Text>
                                            <Text style={styles.itemBudget}>{job.budget}</Text>
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <Text style={styles.emptyText}>Henüz ilanınız yok.</Text>
                            )
                        ) : (
                            // Offers List
                            userProposals.length > 0 ? (
                                userProposals.map(proposal => {
                                    const statusUI = getProposalStatusUI(proposal);

                                    return (
                                        <TouchableOpacity
                                            key={proposal.id}
                                            style={styles.itemCard}
                                            onPress={() => {
                                                if (proposal.job) {
                                                    navigation.navigate('JobDetail', { jobId: proposal.job.id, jobTitle: proposal.job.title });
                                                }
                                            }}
                                        >
                                            <View style={styles.itemHeader}>
                                                {/* Removed "İş: " prefix */}
                                                <Text style={styles.itemTitle}>{proposal.job?.title || 'Bilinmeyen İlan'}</Text>

                                                <View style={[styles.statusBadge, { backgroundColor: statusUI.bg }]}>
                                                    <Text style={[styles.statusText, { color: statusUI.color }]}>
                                                        {statusUI.label}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text style={styles.itemSubtitle}>Teklifiniz: {proposal.price} TL</Text>
                                            <Text style={styles.itemDate}>
                                                {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString('tr-TR') : ''}
                                            </Text>

                                            {/* Deliver Button */}
                                            {proposal.status === 'ACCEPTED' && proposal.job?.status === 'IN_PROGRESS' && (
                                                <TouchableOpacity
                                                    style={styles.deliverButton}
                                                    onPress={() => openDeliveryModal(proposal.id)}
                                                >
                                                    <Text style={styles.deliverButtonText}>İşi Teslim Et</Text>
                                                </TouchableOpacity>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <Text style={styles.emptyText}>Henüz bir teklif vermediniz.</Text>
                            )
                        )
                    )}
                </View>

            </ScrollView>

            {/* Profile Edit Modal */}
            <Modal animationType="slide" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Profili Düzenle</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeText}>Kapat</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={styles.label}>Biyografi</Text>
                            <TouchableOpacity onPress={handleAiRefine} disabled={aiLoading}>
                                <Text style={{ color: COLORS.ai, fontWeight: 'bold' }}>
                                    {aiLoading ? 'Düzenleniyor...' : '✨ AI ile Geliştir'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Kendinizden bahsedin..."
                        />

                        <Text style={styles.label}>Onay İçin Şifre</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Mevcut şifreniz"
                        />

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Kaydet</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Delivery Modal */}
            <Modal animationType="slide" visible={deliveryModalVisible} onRequestClose={() => setDeliveryModalVisible(false)}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>İşi Teslim Et</Text>
                        <TouchableOpacity onPress={() => setDeliveryModalVisible(false)}>
                            <Text style={styles.closeText}>İptal</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={[styles.label, { marginBottom: 15 }]}>
                            Lütfen işi teslim ettiğinize dair bir açıklama ve varsa dosya/proje linkini paylaşın.
                        </Text>

                        <Text style={styles.label}>Teslim Mesajı</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            value={deliveryMessage}
                            onChangeText={setDeliveryMessage}
                            placeholder="İşi tamamladım, detaylar şöyledir..."
                        />

                        <Text style={styles.label}>Proje Linki / Dosya URL</Text>
                        <TextInput
                            style={styles.input}
                            value={deliveryLink}
                            onChangeText={setDeliveryLink}
                            placeholder="https://github.com/..."
                            autoCapitalize="none"
                        />

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleDeliverWork}
                            disabled={delivering}
                        >
                            {delivering ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Teslim Et</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    guestTitle: { fontSize: 24, fontWeight: 'bold', marginVertical: 10, color: COLORS.text },
    guestText: { fontSize: 16, color: COLORS.subText, textAlign: 'center', marginBottom: 30 },
    loginButton: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: STYLES.radius },
    loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    headerBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },

    infoButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.text,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoButtonText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'serif',
    },

    content: { padding: 20 },
    profileSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatarPlaceholder: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: 20
    },
    avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
    infoContainer: { justifyContent: 'center' },
    username: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    role: { fontSize: 14, color: COLORS.subText },

    card: {
        width: '100%', backgroundColor: COLORS.card, borderRadius: STYLES.radius,
        padding: 20, marginBottom: 20, ...STYLES.shadow
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
    editText: { color: COLORS.primary, fontWeight: '600' },
    bioText: { fontSize: 15, color: COLORS.subText, lineHeight: 22 },
    emptyText: { color: COLORS.subText, fontStyle: 'italic' },

    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    closeText: { fontSize: 16, color: 'red' },
    modalContent: { padding: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: COLORS.text },
    input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
    textArea: { height: 150, textAlignVertical: 'top' },
    saveButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: STYLES.radius, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // Tabs & Lists
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: STYLES.radius,
        padding: 4,
        marginBottom: 20,
        ...STYLES.shadow
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: STYLES.radius - 4,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.subText,
    },
    activeTabText: {
        color: '#fff',
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        ...STYLES.shadow,
        shadowOpacity: 0.05,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },
    itemSubtitle: {
        fontSize: 14,
        color: COLORS.subText,
        marginBottom: 4,
    },
    itemBudget: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    itemDate: {
        fontSize: 12,
        color: COLORS.subText,
        marginTop: 4,
        textAlign: 'right',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    deliverButton: {
        marginTop: 10,
        backgroundColor: COLORS.primary,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    deliverButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
