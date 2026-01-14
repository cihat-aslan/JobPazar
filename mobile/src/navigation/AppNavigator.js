import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminJobsScreen from '../screens/admin/AdminJobsScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import AdminEditJobScreen from '../screens/admin/AdminEditJobScreen';
import AIChatScreen from '../screens/AIChatScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutContactScreen from '../screens/AboutContactScreen';
import EditJobScreen from '../screens/EditJobScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const AdminStack = createStackNavigator();
const ProfileStack = createStackNavigator();

function HomeNavigator() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="Jobs" component={HomeScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'İlan Detayı' }} />
            <HomeStack.Screen name="EditJob" component={EditJobScreen} options={{ title: 'İlanı Düzenle' }} />
            <HomeStack.Screen name="JobDelivery" component={JobDeliveryScreen} options={{ title: 'Teslimat İncelemesi', headerShown: false }} />
        </HomeStack.Navigator>
    );
}

function ProfileNavigator() {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
            <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ayarlar' }} />
            <ProfileStack.Screen name="AboutContact" component={AboutContactScreen} options={{ title: 'Hakkımızda & İletişim' }} />
            <ProfileStack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'İlan Detayı' }} />
            <ProfileStack.Screen name="EditJob" component={EditJobScreen} options={{ title: 'İlanı Düzenle' }} />
            <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Profil Bilgilerini Düzenle' }} />
            <ProfileStack.Screen name="JobDelivery" component={JobDeliveryScreen} options={{ title: 'Teslimat İncelemesi', headerShown: false }} />
        </ProfileStack.Navigator>
    );
}

function AdminNavigator() {
    return (
        <AdminStack.Navigator>
            <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Yönetici Paneli' }} />
            <AdminStack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Kullanıcı Yönetimi' }} />
            <AdminStack.Screen name="AdminJobs" component={AdminJobsScreen} options={{ title: 'İlan Yönetimi' }} />
            <AdminStack.Screen name="AdminFeedback" component={AdminFeedbackScreen} options={{ title: 'Geri Bildirimler' }} />
            <AdminStack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'İlan Detayı' }} />
            <AdminStack.Screen name="AdminEditJob" component={AdminEditJobScreen} options={{ title: 'İlanı Düzenle (Admin)' }} />
            <AdminStack.Screen name="EditJob" component={EditJobScreen} options={{ title: 'İlanı Düzenle' }} />
        </AdminStack.Navigator>
    );
}

// ... imports
// ... imports
import CreateJobScreen from '../screens/CreateJobScreen';
import JobDeliveryScreen from '../screens/JobDeliveryScreen';

// ... other navigators

function AppTabs() {
    const { isGuest } = useContext(AuthContext); // Access context here

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'AIChat') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'CreateJob') {
                        // Custom center button - Rounded Square (User Request)
                        return (
                            <View style={{
                                width: 28,
                                height: 28,
                                borderRadius: 12, // Rounded Square
                                backgroundColor: COLORS.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: -2, // Slight lift
                                shadowColor: COLORS.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 5,
                            }}>
                                <Ionicons name="add" size={20} color="#fff" />
                            </View>
                        );
                    } else if (route.name === 'Notifications') {
                        iconName = focused ? 'notifications' : 'notifications-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: 'gray',
                // Ensure labels are shown by default for all tabs
                tabBarLabelStyle: { fontSize: 10, paddingBottom: 4 },
            })}
        >
            <Tab.Screen name="Home" component={HomeNavigator} options={{ title: 'Anasayfa' }} />
            <Tab.Screen name="AIChat" component={AIChatScreen} options={{ title: 'AI Sohbet' }} />

            <Tab.Screen
                name="CreateJob"
                component={CreateJobScreen}
                options={{
                    title: 'İlan Ver',
                    // Label behavior is now default (visible)
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        if (isGuest) {
                            e.preventDefault();
                            alert('İlan oluşturmak için giriş yapmalısınız.');
                            // Optionally navigate to a Login screen or show a modal here
                            // navigation.navigate('Auth'); // If you had a root auth stack accessible
                        }
                    },
                })}
            />

            <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Bildirimler' }} />
            <Tab.Screen name="Profile" component={ProfileNavigator} options={{ title: 'Profil' }} />
        </Tab.Navigator>
    );
}

function AuthStack() {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş Yap', headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Kayıt Ol', headerShown: false }} />
        </Stack.Navigator>
    );
}

export default function AppNavigator() {
    const { user, isGuest, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? (
                user.role === 'ADMIN' ? <AdminNavigator /> : <AppTabs />
            ) : (
                isGuest ? <AppTabs /> : <AuthStack />
            )}
        </NavigationContainer>
    );
}
