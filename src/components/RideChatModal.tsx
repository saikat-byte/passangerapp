import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TOITOI_THEME } from '../theme';
import { RideAPI } from '../services/api';
import { setupEcho } from '../services/echo';

interface Props { visible: boolean; onClose: () => void; rideId: string | number; }

export default function RideChatModal({ visible, onClose, rideId }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!visible || !rideId) return;

    // ১. মডাল ওপেন হলেই আগের চ্যাট হিস্ট্রি আনবে
    fetchMessages();

    // ২. সকেট কানেকশন চালু করবে
    const echo = setupEcho();
    
    // 🔴 ব্যাকএন্ডের সাথে মিলিয়ে চ্যানেলের নাম 'chat.ride.id' করা হয়েছে
    const channel = echo.private(`chat.ride.${rideId}`);

  channel.listen('.RideMessageSent', (e: any) => {
      setMessages(prev => {
        if (prev.find(m => m.id === e.message.id)) return prev;
        return [...prev, e.message];
      });
    });

    // ক্লিনআপ: মডাল বন্ধ হলে সকেট থেকে বেরিয়ে যাবে
    return () => { 
      channel.leave(); 
    };
  }, [visible, rideId]);

  const fetchMessages = async () => {
    try {
      const res = await RideAPI.getChat(rideId);
      setMessages(res.data.data || []);
    } catch (e) { 
      console.log('Chat Fetch Error:', e); 
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const textToSend = inputText;
    setInputText(''); // সেন্ড চাপলেই বক্স ফাঁকা হয়ে যাবে

    // Optimistic update: API কল হওয়ার আগেই স্ক্রিনে মেসেজ দেখিয়ে দেওয়া
    // 🔴 ব্যাকএন্ডের সাথে মিলিয়ে 'sender_type' করা হয়েছে
    const tempMessage = { id: Date.now(), sender_type: 'passenger', message: textToSend };
    setMessages(prev => [...prev, tempMessage]);

    try {
      await RideAPI.sendChat(rideId, textToSend);
    } catch (e) { 
      console.log('Chat Send Error:', e); 
      // চাইলে ফেইল করলে মেসেজ রিমুভ করার লজিক দিতে পারেন
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Driver Chat</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              // 🔴 'sender_type' চেক করা হচ্ছে
              <View style={[styles.bubble, item.sender_type === 'passenger' ? styles.myBubble : styles.driverBubble]}>
                <Text style={styles.msgText}>{item.message}</Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.inputRow}>
            <TextInput 
              style={styles.input} 
              value={inputText} 
              onChangeText={setInputText} 
              placeholder="Type a message..." 
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Text style={styles.sendText}>SEND</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: TOITOI_THEME.colors.background, height: '70%', borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, borderTopLeftRadius: TOITOI_THEME.borders.radius.lg, borderTopRightRadius: TOITOI_THEME.borders.radius.lg, padding: 20, ...TOITOI_THEME.shadows.brutal },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: TOITOI_THEME.typography.fontBlack, color: TOITOI_THEME.colors.black },
  closeBtn: { backgroundColor: TOITOI_THEME.colors.danger, borderWidth: TOITOI_THEME.borders.medium, width: 35, height: 35, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontWeight: TOITOI_THEME.typography.fontBlack },
  bubble: { padding: 12, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, borderRadius: TOITOI_THEME.borders.radius.sm, marginBottom: 10, maxWidth: '80%', ...TOITOI_THEME.shadows.brutal },
  myBubble: { backgroundColor: TOITOI_THEME.colors.primary, alignSelf: 'flex-end' },
  driverBubble: { backgroundColor: TOITOI_THEME.colors.white, alignSelf: 'flex-start' },
  msgText: { fontWeight: TOITOI_THEME.typography.fontBold, fontSize: 16 },
  inputRow: { flexDirection: 'row', marginTop: 10 },
  input: { flex: 1, borderWidth: TOITOI_THEME.borders.thick, borderColor: TOITOI_THEME.colors.black, backgroundColor: TOITOI_THEME.colors.white, padding: 10, fontSize: 16, fontWeight: 'bold' },
  sendBtn: { backgroundColor: TOITOI_THEME.colors.black, justifyContent: 'center', paddingHorizontal: 20, marginLeft: 10 },
  sendText: { color: TOITOI_THEME.colors.white, fontWeight: TOITOI_THEME.typography.fontBlack }
});