import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Pressable,
  Alert,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { supabase } from '../../supabaseClient';

interface Message {
  id: number;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

const ChatRoom = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [editingMessages, setEditingMessages] = useState<{ [key: number]: string }>({});
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [inputHeight, setInputHeight] = useState(70);
  const MAX_HEIGHT = 300;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) return console.error(error);
      setUserId(data.user?.id || null);
    };
    getUser();
    fetchMessages();

    // Real-time subscription for new messages
    const subscription = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // Add the new message to the state immediately
          setMessages(prev => [...prev, payload.new as Message]);
          // Scroll to the bottom after a short delay
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      supabase.removeChannel(subscription);
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (menuVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [menuVisible, fadeAnim]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`id,user_id,message,created_at,profiles:user_id(first_name,last_name,email)`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data as Message[]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ user_id: userId, message: newMessage.trim() }]);
      if (error) throw error;
      setNewMessage('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (id: number) => {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
      setMessages(prev => prev.filter(msg => msg.id !== id));
      setSelectedMessageId(null);
      setDeleteConfirmVisible(false);
      setMessageToDelete(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete message');
    }
  };

  const saveEdit = async (id: number) => {
    const text = editingMessages[id];
    if (!text || text.trim() === '') return;
    try {
      const { error } = await supabase.from('messages').update({ message: text }).eq('id', id);
      if (error) throw error;
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, message: text } : msg));
      setEditingMessages(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setSelectedMessageId(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to edit message');
    }
  };

  const showMenu = (event: any, item: Message) => {
    if (item.user_id !== userId) return;
    
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setSelectedMessageId(item.id);
    setMenuVisible(true);
  };

  const handleEdit = () => {
    if (!selectedMessageId) return;
    const message = messages.find(m => m.id === selectedMessageId);
    if (message) {
      setEditingMessages(prev => ({ ...prev, [selectedMessageId]: message.message }));
    }
    setMenuVisible(false);
  };

  const handleDelete = () => {
    if (!selectedMessageId) return;
    setMessageToDelete(selectedMessageId);
    setMenuVisible(false);
    setDeleteConfirmVisible(true);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.user_id === userId;
    const isAdminMessage = item.message.startsWith('[ADMIN]:');
    const senderName = item.profiles 
      ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() 
      : 'Unknown User';
    const editing = editingMessages[item.id] !== undefined;

    // For admin messages, always show on left side
    const displayOnLeft = isAdminMessage || !isCurrentUser;

    return (
      <Pressable
        onLongPress={(e) => showMenu(e, item)}
        style={[styles.messageContainer, displayOnLeft ? styles.otherMessage : styles.myMessage]}
      >
        {displayOnLeft && <Text style={styles.senderName}>{isAdminMessage ? 'ADMIN' : senderName}</Text>}
        <View style={[styles.messageBubble, displayOnLeft ? styles.otherBubble : styles.myBubble]}>
          {editing ? (
            <>
              <TextInput
                value={editingMessages[item.id]}
                onChangeText={text => setEditingMessages(prev => ({ ...prev, [item.id]: text }))}
                style={[styles.editInput, { color: displayOnLeft ? '#111827' : '#FFF' }]}
                autoFocus
                multiline
                onSubmitEditing={() => saveEdit(item.id)}
                blurOnSubmit
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => saveEdit(item.id)} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setEditingMessages(prev => {
                      const copy = { ...prev };
                      delete copy[item.id];
                      return copy;
                    });
                  }} 
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={displayOnLeft ? styles.otherMessageText : styles.myMessageText}>
              {isAdminMessage ? item.message.replace('[ADMIN]:', '').trim() : item.message}
            </Text>
          )}
        </View>

        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Pressable>
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Support</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        keyboardShouldPersistTaps="handled"
        refreshing={refreshing}
        onRefresh={onRefresh}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={[styles.inputWrapper, { marginBottom: keyboardHeight > 0 ? keyboardHeight - 10 : 0 }]}
      >
        <TextInput
          style={[styles.textInput, { height: Math.min(inputHeight, MAX_HEIGHT) }]}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          multiline
          scrollEnabled={inputHeight > MAX_HEIGHT}
          onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? <ActivityIndicator color="white" /> : <Icon name="send" size={20} color="white" />}
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Context Menu */}
      <Modal
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
        animationType="none"
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
<Animated.View 
  style={[
    styles.menu, 
    { 
      top: menuPosition.y,
      left: menuPosition.x,
      opacity: fadeAnim,
      transform: [
        {
          scale: fadeAnim.interpolate({ 
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          })
        }
      ]
    }
  ]}
>
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                <Icon name="edit" size={18} color="#3B82F6" style={styles.menuIcon} />
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <Icon name="trash-2" size={18} color="#EF4444" style={styles.menuIcon} />
                <Text style={styles.menuText}>Delete</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={deleteConfirmVisible}
        onRequestClose={() => setDeleteConfirmVisible(false)}
        animationType="fade"
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Delete Message</Text>
            <Text style={styles.confirmMessage}>Are you sure you want to delete this message?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]} 
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.deleteButton]} 
                onPress={() => messageToDelete && deleteMessage(messageToDelete)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 0 : 30, paddingBottom: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  menuButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  headerRight: { width: 24 },
  messagesList: { padding: 16 },
  messageContainer: { marginBottom: 16, maxWidth: '80%' },
  myMessage: { alignSelf: 'flex-end', alignItems: 'flex-end',},
  otherMessage: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderName: { fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: '500' },
  messageBubble: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 4 },
  myBubble: { backgroundColor: '#3B82F6', borderTopRightRadius: 4,},
  otherBubble: { backgroundColor: '#FFF', borderTopLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  myMessageText: { color: '#FFF', fontSize: 16 },
  otherMessageText: { color: '#111827', fontSize: 16 },
  timestamp: { fontSize: 10, color: '#9CA3AF', marginTop: 2, alignSelf: 'flex-end' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 24, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 20 : 12, maxHeight: 220, backgroundColor: '#F9FAFB', marginRight: 8 },
  sendButton: { backgroundColor: '#3B82F6', borderRadius: 24, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#9CA3AF' },
  editInput: { fontSize: 16, padding: 0, marginBottom: 8 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  saveButton: { paddingHorizontal: 12, paddingVertical: 6, marginLeft: 8 },
  saveButtonText: { color: '#3B82F6', fontWeight: '600' },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 6 },
  cancelButtonText: { color: '#6B7280' },
  menuOverlay: { flex: 1 },
  menu: { position: 'absolute', backgroundColor: 'white', borderRadius: 8, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, minWidth: 140 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  menuIcon: { marginRight: 8 },
  menuText: { fontSize: 16 },
  confirmOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  confirmDialog: { backgroundColor: 'white', borderRadius: 12, padding: 20, width: '80%' },
  confirmTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  confirmMessage: { fontSize: 16, marginBottom: 20, color: '#6B7280' },
  confirmButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  confirmButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginLeft: 12 },
  deleteButton: { backgroundColor: '#EF4444' },
  deleteButtonText: { color: 'white', fontWeight: '600' },
});

export default ChatRoom; 