import React, { useState, useCallback, useContext } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import JobCard from '../components/JobCard';
import { COLORS } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Header Component extracted to prevent re-renders and focus loss
const Header = ({
    searchTerm,
    onSearch,
    categories,
    selectedCategory,
    onSelectCategory,
    budgets,
    selectedBudget,
    onSelectBudget
}) => (
    <View style={styles.header}>
        <Text style={styles.headerTitle}>JobPazar</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.subText} style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="İş ilanı veya anahtar kelime ara..."
                value={searchTerm}
                onChangeText={onSearch}
                placeholderTextColor={COLORS.subText}
            />
        </View>

        {/* Category Filters */}
        <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Kategoriye Göre:</Text>
            <FlatList
                horizontal
                data={categories}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            selectedCategory === item && styles.activeChip
                        ]}
                        onPress={() => onSelectCategory(item)}
                    >
                        <Text style={[
                            styles.chipText,
                            selectedCategory === item && styles.activeChipText
                        ]}>{item}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.filterList}
            />
        </View>

        {/* Budget Filters */}
        <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Bütçeye Göre:</Text>
            <FlatList
                horizontal
                data={budgets}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            selectedBudget === item && styles.activeChip
                        ]}
                        onPress={() => onSelectBudget(item)}
                    >
                        <Text style={[
                            styles.chipText,
                            selectedBudget === item && styles.activeChipText
                        ]}>{item}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.filterList}
            />
        </View>
    </View>
);

export default function HomeScreen() {
    const { user, isGuest } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Track applied jobs
    const [appliedJobIds, setAppliedJobIds] = useState(new Set());

    // Filters
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBudget, setSelectedBudget] = useState(null);

    const categories = ['Yazılım Geliştirme', 'Dijital Pazarlama', 'Grafik Tasarım', 'Çeviri & İçerik', 'Video & Animasyon', 'Diğer'];

    // Updated filtering options to match Web
    const budgets = [
        'Very Low',
        'Low',
        'Medium',
        'High',
        'Very High'
    ];

    const fetchJobs = async () => {
        try {
            const [jobsResponse, proposalsResponse] = await Promise.all([
                api.get('/jobs'),
                user ? api.get(`/proposals/my-proposals?freelancerId=${user.id}`) : Promise.resolve({ data: [] })
            ]);

            const jobsData = jobsResponse.data;
            setJobs(jobsData);

            // Extract applied job IDs
            const appliedIds = new Set(proposalsResponse.data.map(p => p.job.id));
            setAppliedJobIds(appliedIds);

            applyFilters(jobsData, searchTerm, selectedCategory, selectedBudget);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchJobs();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const applyFilters = (data, search, category, budget) => {
        let result = data;

        // Search Filter
        if (search) {
            const lowerText = search.toLowerCase();
            result = result.filter(job =>
                job.title.toLowerCase().includes(lowerText) ||
                (job.description && job.description.toLowerCase().includes(lowerText))
            );
        }

        // Category Filter
        if (category) {
            result = result.filter(job => job.category === category);
        }

        // Budget Filter (String Match)
        if (budget) {
            result = result.filter(job => job.budget === budget);
        }

        setFilteredJobs(result);
    };

    const handleSearch = (text) => {
        setSearchTerm(text);
        applyFilters(jobs, text, selectedCategory, selectedBudget);
    };

    const handleCategorySelect = (category) => {
        const newCategory = selectedCategory === category ? null : category;
        setSelectedCategory(newCategory);
        applyFilters(jobs, searchTerm, newCategory, selectedBudget);
    };

    const handleBudgetSelect = (budget) => {
        const newBudget = selectedBudget === budget ? null : budget;
        setSelectedBudget(newBudget);
        applyFilters(jobs, searchTerm, selectedCategory, newBudget);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <FlatList
                contentContainerStyle={styles.listContent}
                data={filteredJobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <JobCard
                        job={item}
                        hasApplied={appliedJobIds.has(item.id)}
                    />
                )}
                // ... (rest of FlatList props)
                ListHeaderComponent={
                    <Header
                        searchTerm={searchTerm}
                        onSearch={handleSearch}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleCategorySelect}
                        budgets={budgets}
                        selectedBudget={selectedBudget}
                        onSelectBudget={handleBudgetSelect}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>İlan bulunamadı.</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    header: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        height: '100%',
    },
    filterSection: {
        marginBottom: 15,
    },
    filterTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.subText,
        marginBottom: 8,
    },
    filterList: {
        paddingRight: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
    },
    activeChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 12,
        color: COLORS.subText,
        fontWeight: '500',
    },
    activeChipText: {
        color: '#fff',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: COLORS.subText,
        fontSize: 16,
    },
});
