import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, STYLES } from '../constants/theme';

export default function SettingsScreen({ navigation }) {
    const { logout, user } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.section} onPress={() => navigation.navigate('EditProfile')}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
                    <Text style={{ color: COLORS.primary, fontSize: 14 }}>Düzenle</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Kullanıcı Adı:</Text>
                    <Text style={styles.value}>{user?.username}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>E-posta:</Text>
                    <Text style={styles.value}>{user?.email || 'Belirtilmemiş'}</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 20,
    },
    section: {
        marginBottom: 30,
        backgroundColor: COLORS.card,
        padding: 15,
        borderRadius: STYLES.radius,
        ...STYLES.shadow,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    label: {
        fontWeight: '600',
        color: COLORS.text,
    },
    value: {
        color: COLORS.subText,
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        padding: 15,
        borderRadius: STYLES.radius,
        alignItems: 'center',
        marginBottom: 15,
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
