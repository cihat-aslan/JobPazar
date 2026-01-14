import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, STYLES } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

export default function JobCard({ job, hasApplied }) {
    const navigation = useNavigation();

    // Determine badge color based on budget string
    const getBadgeColor = (budget) => {
        switch (budget) {
            case 'Very Low':
                return { bg: '#B5F1CC', text: '#064e3b' }; // Mintier Green (More green than Low)
            case 'Low':
                return { bg: '#CBFFA9', text: '#365314' }; // User's Lime-Green choice (Darker text)
            case 'Medium':
                return { bg: '#FFFEC4', text: '#713f12' }; // User's Yellow choice (Darker text)
            case 'High':
                return { bg: '#FFC8DD', text: '#831843' }; // Pinkish, lighter than Very High (Darker text)
            case 'Very High':
                return { bg: '#FF9B9B', text: '#7f1d1d' }; // User's Red choice (Darker text)
            default:
                return { bg: '#f3f4f6', text: '#374151' }; // Gray default
        }
    };

    const badge = getBadgeColor(job.budget);

    return (
        <TouchableOpacity
            style={[styles.card, hasApplied && styles.appliedCard]}
            onPress={() => navigation.navigate('JobDetail', { jobId: job.id, jobTitle: job.title })}
        >
            <View style={styles.header}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
                    {hasApplied && (
                        <View style={styles.appliedBadge}>
                            <Text style={styles.appliedText}>✓ Teklif Verildi</Text>
                        </View>
                    )}
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>
                        {job.budget}
                    </Text>
                </View>
            </View>

            <View style={styles.categoryContainer}>
                <Text style={styles.category}>{job.category || 'Genel'}</Text>
            </View>

            <Text style={styles.description} numberOfLines={3}>
                {job.description}
            </Text>

            <View style={styles.footer}>
                <Text style={styles.employer}>
                    @{job.employer ? job.employer.username : 'Gizli İşveren'}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.card,
        borderRadius: STYLES.radius,
        padding: 16,
        marginBottom: 16,
        ...STYLES.shadow,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    categoryContainer: {
        marginBottom: 8,
    },
    category: {
        fontSize: 12,
        color: COLORS.primary,
        backgroundColor: '#eff6ff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    description: {
        fontSize: 14,
        color: COLORS.subText,
        marginBottom: 12,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 12,
    },
    employer: {
        fontSize: 12,
        color: COLORS.subText,
        fontWeight: '600',
    },
    appliedCard: {
        borderColor: COLORS.success,
        borderWidth: 1,
    },
    appliedBadge: {
        marginTop: 4,
        alignSelf: 'flex-start',
        backgroundColor: '#dcfce7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    appliedText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#166534',
    },
});
