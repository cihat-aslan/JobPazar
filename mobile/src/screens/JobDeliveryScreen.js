import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, STYLES } from '../constants/theme';
import api from '../services/api';

export default function JobDeliveryScreen({ route, navigation }) {
    const { jobId, jobTitle } = route.params;
    const [loading, setLoading] = useState(true);
    const [proposal, setProposal] = useState(null);
    const [job, setJob] = useState(null);

    // Revision Logic
    const [revisionNote, setRevisionNote] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchDeliveryDetails();
        });
        return unsubscribe;
    }, [navigation, jobId]);

    const fetchDeliveryDetails = async () => {
        try {
            // 1. Get Job Details to check status
            const jobRes = await api.get(`/jobs/${jobId}`);
            setJob(jobRes.data);

            // Defensive Check: If job is already completed, redirect.
            if (jobRes.data.status === 'COMPLETED') {
                Alert.alert('Bilgi', 'Bu iş zaten onaylanmış ve tamamlanmıştır.', [
                    { text: 'Tamam', onPress: () => navigation.navigate('Profile', { screen: 'ProfileMain' }) }
                ]);
                return;
            }

            // 2. Get Proposals to find the ACCEPTED one which contains delivery info
            const proposalsRes = await api.get(`/proposals/${jobId}`);
            // Filter for the accepted proposal
            const accepted = proposalsRes.data.find(p => p.status === 'ACCEPTED');

            if (accepted) {
                setProposal(accepted);
            } else {
                Alert.alert('Hata', 'Bu ilan için kabul edilmiş bir teklif bulunamadı.');
                navigation.goBack();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Teslimat detayları alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        Alert.alert(
            'Onaylıyor musunuz?',
            'İşi onayladığınızda ödeme serbest bırakılacak ve ilan tamamlanacak.',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Onayla ve Bitir',
                    style: 'default',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await api.post(`/jobs/approve/${jobId}`);
                            Alert.alert('Başarılı', 'İş onaylandı ve tamamlandı!', [
                                {
                                    text: 'Tamam',
                                    onPress: () => {
                                        // Update local state or navigate back to Profile Jobs list
                                        navigation.navigate('Profile', { screen: 'ProfileMain', params: { refresh: Date.now() } });
                                    }
                                }
                            ]);
                        } catch (error) {
                            Alert.alert('Hata', 'İşlem başarısız oldu.');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleRequestRevision = async () => {
        if (!revisionNote.trim()) {
            Alert.alert('Uyarı', 'Lütfen bir revize notu yazın.');
            return;
        }

        setActionLoading(true);
        try {
            await api.post(`/jobs/revision/${jobId}`, { feedback: revisionNote });
            await api.post(`/jobs/revision/${jobId}`, { feedback: revisionNote });
            Alert.alert('Başarılı', 'Revize talebi gönderildi.', [
                {
                    text: 'Tamam',
                    onPress: () => {
                        navigation.navigate('Profile', { screen: 'ProfileMain', params: { refresh: Date.now() } });
                    }
                }
            ]);
        } catch (error) {
            Alert.alert('Hata', 'Revize talebi gönderilemedi.');
        } finally {
            setActionLoading(false);
        }
    };

    const openFile = (url) => {
        if (url) {
            Linking.openURL(url).catch(err => Alert.alert('Hata', 'Link açılamadı.'));
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (!proposal) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Teslimat İncelemesi</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centerContent}>
                    <Text>Teslimat bilgisi bulunamadı.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Teslimat İncelemesi</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.jobTitle}>{jobTitle || job?.title}</Text>
                <Text style={styles.freelancerName}>
                    Freelancer: <Text style={{ fontWeight: 'bold' }}>{proposal.freelancer.name}</Text>
                </Text>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Teslimat Mesajı:</Text>
                <View style={styles.messageBox}>
                    <Text style={styles.messageText}>
                        {proposal.deliveryMessage || "Mesaj yok."}
                    </Text>
                </View>

                {proposal.deliveryFileUrl && (
                    <TouchableOpacity
                        style={styles.fileLink}
                        onPress={() => openFile(proposal.deliveryFileUrl)}
                    >
                        <Ionicons name="link" size={20} color={COLORS.primary} />
                        <Text style={styles.linkText}>Dosyayı Görüntüle</Text>
                    </TouchableOpacity>
                )}

                {!proposal.deliveryFileUrl && (
                    <Text style={styles.noFileText}>Dosya eklenmemiş.</Text>
                )}

                {/* Web-Like Revision Input Section - ONLY IF IN REVIEW STATUS */}
                {job?.status === 'REVIEW' && (
                    <View style={styles.revisionSection}>
                        <Text style={styles.sectionTitle}>Revize Notu (Eğer revize isteyecekseniz)</Text>
                        <TextInput
                            style={styles.revisionInput}
                            placeholder="Şurası olmamış, düzeltip tekrar atar mısın?"
                            multiline
                            textAlignVertical="top"
                            value={revisionNote}
                            onChangeText={setRevisionNote}
                        />
                    </View>
                )}
            </ScrollView>

            {job?.status === 'REVIEW' && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.reviseButton]}
                        onPress={handleRequestRevision}
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <ActivityIndicator color="#EF4444" />
                        ) : (
                            <Text style={styles.reviseButtonText}>Revize İste</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={handleApprove}
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.approveButtonText}>Onayla ve Bitir</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    jobTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    freelancerName: {
        fontSize: 14,
        color: COLORS.subText,
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#E9ECEF',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    messageBox: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        minHeight: 80,
        marginBottom: 20,
    },
    messageText: {
        fontSize: 15,
        color: COLORS.text,
        lineHeight: 22,
    },
    fileLink: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        marginBottom: 24,
    },
    linkText: {
        marginLeft: 10,
        fontSize: 15,
        color: COLORS.primary,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    noFileText: {
        fontStyle: 'italic',
        color: COLORS.subText,
        marginBottom: 24,
    },
    revisionSection: {
        marginTop: 10,
    },
    revisionInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        fontSize: 14,
        color: COLORS.text,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviseButton: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    reviseButtonText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 15,
    },
    approveButton: {
        backgroundColor: '#22C55E',
    },
    approveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    }
});
