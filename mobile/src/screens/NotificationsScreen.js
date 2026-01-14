import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, STYLES } from '../constants/theme';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function NotificationsScreen({ navigation }) {
    const { user, isGuest } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [userJobs, setUserJobs] = useState([]);

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            const [notifRes, jobsRes] = await Promise.all([
                api.get(`/notifications/${user.id}`),
                api.get(`/jobs/my-jobs?userId=${user.id}`)
            ]);
            setNotifications(notifRes.data);
            setUserJobs(jobsRes.data);
        } catch (error) {
            console.error('Veri alınamadı:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (user) {
                setLoading(true);
                fetchNotifications().finally(() => setLoading(false));
            }
        }, [user])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    const handleNotificationPress = async (item) => {
        // Mark as read
        if (!item.isRead) {
            try {
                await api.put(`/notifications/${item.id}/read`);
                // Update local state
                setNotifications(prev =>
                    prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error('Okundu işaretlenemedi:', error);
            }
        }

        // Parse navigation logic
        if (item.message.startsWith('Yeni Teklif:')) {
            // Extract Job Title: "Yeni Teklif: [Title]"
            const parts = item.message.split(':');
            if (parts.length > 1) {
                const jobTitle = parts[1].trim();
                const relatedJob = userJobs.find(job => job.title.trim() === jobTitle);

                if (relatedJob) {
                    navigation.navigate('JobDetail', { jobId: relatedJob.id, jobTitle: relatedJob.title });
                } else {
                    // Alert.alert('Bilgi', 'İlgili ilan bulunamadı.');
                }
            }
        } else if (item.message.startsWith('İş Teslim Edildi:')) {
            // "İş Teslim Edildi: 'Title' için..."
            const regex = /'(.*?)'/;
            const match = item.message.match(regex);
            if (match && match[1]) {
                const jobTitle = match[1];
                const relatedJob = userJobs.find(job => job.title.trim() === jobTitle.trim());

                if (relatedJob) {
                    // Navigate to Profile tab -> JobDelivery screen (Matching web flow)
                    navigation.navigate('Profile', {
                        screen: 'JobDelivery',
                        params: { jobId: relatedJob.id, jobTitle: relatedJob.title }
                    });
                } else {
                    // Try navigation anyway if we can't find it in list (might be stale list), pass Title only? 
                    // No, need ID. 
                    console.log('İlgili ilan bulunamadı (Yerel listede yok):', jobTitle);
                }
            }
        } else if (item.message.startsWith('İş Onaylandı:') || item.message.startsWith('Revize Talebi:')) {
            // Just navigate to detail for now or do nothing
            const regex = /'(.*?)'/;
            const match = item.message.match(regex);
            if (match && match[1]) {
                // For now just log or maybe navigate to detail
            }
        }
    };

    const getIconInfo = (message) => {
        if (message.startsWith('Yeni Teklif:')) return { name: 'briefcase', color: '#2563eb', bg: '#dbeafe' }; // Blue
        if (message.startsWith('İş Onaylandı:')) return { name: 'checkmark-circle', color: '#16a34a', bg: '#dcfce7' }; // Green
        if (message.startsWith('İş Teslim Edildi:')) return { name: 'cube', color: '#ea580c', bg: '#ffedd5' }; // Orange
        if (message.startsWith('Revize Talebi:')) return { name: 'alert-circle', color: '#dc2626', bg: '#fee2e2' }; // Red
        return { name: 'notifications', color: COLORS.primary, bg: '#F3F4F6' }; // Default
    };

    if (isGuest) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContent}>
                    <Ionicons name="notifications-off-outline" size={80} color={COLORS.subText} />
                    <Text style={styles.emptyTitle}>Bildirim Yok</Text>
                    <Text style={styles.emptyText}>Bildirimleri görmek için giriş yapmalısınız.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const renderItem = ({ item }) => {
        const iconInfo = getIconInfo(item.message);

        return (
            <TouchableOpacity
                style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: iconInfo.bg }]}>
                    <Ionicons
                        name={item.isRead ? iconInfo.name + "-outline" : iconInfo.name}
                        size={24}
                        color={iconInfo.color}
                    />
                </View>
                <View style={styles.textContainer}>
                    {/* Title parsing for bold effect */}
                    {item.message.includes(':') ? (
                        <>
                            <Text style={styles.title}>{item.message.split(':')[0]}</Text>
                            <Text style={styles.message}>{item.message.substring(item.message.indexOf(':') + 1).trim()}</Text>
                        </>
                    ) : (
                        <Text style={styles.message}>{item.message}</Text>
                    )}

                    <Text style={styles.date}>
                        {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                        })}
                    </Text>
                </View>
                {!item.isRead && <View style={styles.dot} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bildirimler</Text>
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.centerContent}>
                            <Ionicons name="notifications-off-outline" size={60} color={COLORS.subText} />
                            <Text style={styles.emptyTitle}>Henüz bildiriminiz yok</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
        flexGrow: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 400, // Ensure it takes space in FlatList
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: 10,
    },
    emptyText: {
        color: COLORS.subText,
        textAlign: 'center',
        marginTop: 5,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        ...STYLES.shadow,
        shadowOpacity: 0.05,
    },
    unreadCard: {
        backgroundColor: '#F0F9FF', // Light blue tint for unread
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    message: {
        fontSize: 15,
        color: COLORS.text,
        lineHeight: 20,
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: COLORS.subText,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginLeft: 8,
    },
});
