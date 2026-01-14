import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import api from '../../services/api';
import { COLORS, STYLES } from '../../constants/theme';

export default function AdminUsersScreen() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editEmail, setEditEmail] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editPassword, setEditPassword] = useState(''); // Optional
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            Alert.alert('Hata', 'Kullanıcılar alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditEmail(user.email);
        setEditBio(user.bio || '');
        setEditPassword('');
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!editEmail) {
            Alert.alert('Uyarı', 'Email boş olamaz.');
            return;
        }

        setUpdating(true);
        try {
            const payload = { email: editEmail, bio: editBio };
            if (editPassword) {
                payload.password = editPassword;
            }

            await api.put(`/admin/users/${selectedUser.id}`, payload);
            Alert.alert('Başarılı', 'Kullanıcı güncellendi.');
            setModalVisible(false);
            fetchUsers();
        } catch (error) {
            Alert.alert('Hata', 'Güncelleme başarısız.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Sil', 'Kullanıcıyı silmek istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Sil', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/admin/users/${id}`);
                        fetchUsers(); // Refresh
                    } catch (error) {
                        Alert.alert('Hata', 'Silme başarısız.');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.role}>{item.role}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.actionBtn, { backgroundColor: '#e0f2fe' }]}>
                    <Text style={{ color: '#0284c7', fontWeight: 'bold' }}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]}>
                    <Text style={{ color: '#991b1b', fontWeight: 'bold' }}>Sil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    return (
        <View style={styles.container}>
            <FlatList
                data={users}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Kullanıcıyı Düzenle</Text>

                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} autoCapitalize="none" />

                        <Text style={styles.label}>Biyografi</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={editBio}
                            onChangeText={setEditBio}
                            multiline
                        />

                        <Text style={styles.label}>Yeni Şifre (İsteğe bağlı)</Text>
                        <TextInput style={styles.input} value={editPassword} onChangeText={setEditPassword} secureTextEntry placeholder="Değiştirmek istemiyorsanız boş bırakın" />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.btn, { backgroundColor: '#9ca3af' }]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, { backgroundColor: COLORS.primary }]} onPress={handleSave} disabled={updating}>
                                {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Kaydet</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );

}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: STYLES.radius, marginBottom: 10, ...STYLES.shadow },
    username: { fontWeight: 'bold', fontSize: 16 },
    email: { color: COLORS.subText, fontSize: 14 },
    role: { color: COLORS.primary, fontSize: 12, marginTop: 4 },
    role: { color: COLORS.primary, fontSize: 12, marginTop: 4 },
    actionBtn: { padding: 8, borderRadius: 8 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    label: { fontWeight: 'bold', marginBottom: 5, color: COLORS.text, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10 },
    textArea: { height: 100, textAlignVertical: 'top' },
    modalButtons: { flexDirection: 'row', gap: 10, marginTop: 20, justifyContent: 'flex-end' },
    btn: { padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' }
});
