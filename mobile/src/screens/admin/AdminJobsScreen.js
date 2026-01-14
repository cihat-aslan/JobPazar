import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../../services/api';
import { COLORS, STYLES } from '../../constants/theme';

export default function AdminJobsScreen({ navigation }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/admin/jobs');
            setJobs(response.data);
        } catch (error) {
            Alert.alert('Hata', 'İlanlar alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Sil', 'İlanı silmek istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Sil', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/admin/jobs/${id}`);
                        fetchJobs(); // Refresh
                    } catch (error) {
                        Alert.alert('Hata', 'Silme başarısız.');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            {/* Main Info Row */}
            <TouchableOpacity
                style={styles.infoRow}
                onPress={() => navigation.navigate('JobDetail', { jobId: item.id, jobTitle: item.title })}
            >
                <View style={styles.columnMain}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.subInfo}>@{item.employer?.username}</Text>
                </View>
                <View style={styles.columnBudget}>
                    <Text style={styles.budget}>{item.budget}</Text>
                </View>
                <View style={styles.columnStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'OPEN' ? '#dcfce7' : '#f3f4f6' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'OPEN' ? '#166534' : '#4b5563' }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Actions Row */}
            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => navigation.navigate('AdminEditJob', { jobId: item.id })}
                >
                    <Text style={styles.editBtnText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(item.id)}
                >
                    <Text style={styles.deleteBtnText}>Kaldır</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    return (
        <FlatList
            style={styles.container}
            data={jobs}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20 }}
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: STYLES.radius, marginBottom: 10, ...STYLES.shadow },
    infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    columnMain: { flex: 2 },
    columnBudget: { flex: 1, alignItems: 'center' },
    columnStatus: { flex: 1, alignItems: 'flex-end' },

    title: { fontWeight: 'bold', fontSize: 15, color: COLORS.text },
    subInfo: { color: COLORS.subText, fontSize: 13, marginTop: 2 },
    budget: { fontSize: 13, fontWeight: '600', color: COLORS.text },

    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: 'bold' },

    actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10, gap: 10, justifyContent: 'flex-end' },
    actionBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, minWidth: 80, alignItems: 'center' },
    editBtn: { backgroundColor: '#3b82f6' }, // Blue
    editBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    deleteBtn: { backgroundColor: '#ef4444' }, // Red
    deleteBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
