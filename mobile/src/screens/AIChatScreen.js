import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, STYLES } from '../constants/theme';
import api from '../services/api';

import { AuthContext } from '../context/AuthContext'; // Import AuthContext

export default function AIChatScreen() {
    const { isGuest, logout } = React.useContext(AuthContext); // Get isGuest and logout
    const [messages, setMessages] = useState([
        { id: '1', text: 'Merhaba! Ben JobPazar AI asistanıyım. Sana iş bulma veya profilini güçlendirme konusunda nasıl yardımcı olabilirim?', sender: 'ai', time: 'Şimdi' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user', time: timestamp };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            const response = await api.post('/ai/chat', { message: userMsg.text });
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                text: response.data.response || "Üzgünüm, bir hata oluştu.",
                sender: 'ai',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                text: "Bağlantı hatası. Lütfen tekrar deneyin.",
                sender: 'ai',
                time: timestamp
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const renderItem = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[
                styles.messageRow,
                isUser ? styles.userRow : styles.aiRow
            ]}>
                {!isUser && (
                    <View style={styles.avatarContainer}>
                        <Ionicons name="sparkles" size={16} color="#fff" />
                    </View>
                )}

                <View style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.aiBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.aiText
                    ]}>{item.text}</Text>
                    <Text style={[
                        styles.timeText,
                        isUser ? styles.userTimeText : styles.aiTimeText
                    ]}>{item.time}</Text>
                </View>

                {isUser && (
                    <View style={[styles.avatarContainer, styles.userAvatar]}>
                        <Ionicons name="person" size={16} color="#fff" />
                    </View>
                )}
            </View>
        );
    };

    if (isGuest) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>AI Asistan</Text>
                </View>
                <View style={styles.centerContent}>
                    <Ionicons name="chatbubbles-outline" size={80} color={COLORS.subText} />
                    <Text style={styles.emptyTitle}>AI Asistan Kilitli</Text>
                    <Text style={styles.emptyText}>
                        Yapay zeka asistanı ile konuşmak ve kariyer tavsiyeleri almak için lütfen giriş yapın.
                    </Text>
                    <TouchableOpacity style={styles.loginButton} onPress={logout}>
                        <Text style={styles.loginButtonText}>Giriş Yap / Kayıt Ol</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>AI Asistan</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
                style={styles.keyboardView}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Bir şeyler sorun..."
                        value={inputText}
                        onChangeText={setInputText}
                        editable={!loading}
                        multiline
                        placeholderTextColor={COLORS.subText}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!inputText.trim() && !loading) && styles.disabledButton]}
                        onPress={sendMessage}
                        disabled={loading || !inputText.trim()}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        backgroundColor: '#fff',
        ...STYLES.shadow,
        shadowOpacity: 0.05,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    aiRow: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8B5CF6', // Purple for AI
        marginBottom: 4,
    },
    userAvatar: {
        backgroundColor: COLORS.primary,
        marginLeft: 8,
        marginBottom: 4,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 20,
        marginLeft: 8,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    userBubble: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
        marginLeft: 0,
        marginRight: 0,
    },
    aiBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#fff',
    },
    aiText: {
        color: COLORS.text,
    },
    timeText: {
        fontSize: 10,
        marginTop: 6,
        alignSelf: 'flex-end',
    },
    userTimeText: {
        color: 'rgba(255,255,255,0.7)',
    },
    aiTimeText: {
        color: COLORS.subText,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        alignItems: 'flex-end',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 12,
        marginRight: 10,
        fontSize: 15,
        maxHeight: 120,
        color: COLORS.text,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    disabledButton: {
        backgroundColor: '#CBD5E1',
    },

    // Guest Mode Styles
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 10,
    },
    emptyText: {
        color: COLORS.subText,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 30, // Space between text and button
        fontSize: 15,
        lineHeight: 22,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: STYLES.radius,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
