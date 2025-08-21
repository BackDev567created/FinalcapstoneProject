import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Platform
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabaseAdmin } from "../../supabaseClient";

export default function ChatWithCustomer() {
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!userId) return;

    fetchCustomerInfo();
    fetchMessages();

    // Real-time subscription for new messages
    const channel = supabaseAdmin
      .channel(`realtime-messages-${userId}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "messages",
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          // Scroll to bottom when new message arrives
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabaseAdmin.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages load
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);

  const fetchCustomerInfo = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", userId)
        .single();

      if (!error && data) {
        const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
        setCustomerName(fullName || "Customer");
      }
    } catch (err) {
      console.error("Error fetching customer info:", err);
      setCustomerName("Customer");
    }
  };

  const fetchMessages = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabaseAdmin
        .from("messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    try {
      const { error } = await supabaseAdmin.from("messages").insert([
        {
          user_id: userId,
          message: `[ADMIN]: ${newMessage.trim()}`,
        },
      ]);

      if (!error) {
        setNewMessage("");
        Keyboard.dismiss();
      } else {
        console.error("Error sending message:", error);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const isAdminMessage = (message: string) => {
    return message.startsWith("[ADMIN]");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{customerName}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item }) => {
          const isAdmin = isAdminMessage(item.message);
          return (
            <View style={[
              styles.messageBubble,
              isAdmin ? styles.adminMessage : styles.customerMessage
            ]}>
              <Text style={isAdmin ? styles.adminMessageText : styles.customerMessageText}>
                {isAdmin 
                  ? item.message.replace("[ADMIN]:", "").trim()
                  : item.message
                }
              </Text>
              <Text style={[
                styles.timestamp,
                { color: isAdmin ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.5)" }
              ]}>
                {new Date(item.created_at).toLocaleTimeString()}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet.</Text>
          </View>
        }
        onContentSizeChange={() => {
          if (messages.length > 0) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }}
      />

      <View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  messagesContainer: {
    padding: 16,
    flexGrow: 1,
    paddingBottom: 80,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: "80%",
  },
  adminMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    marginLeft: "20%",
  },
  customerMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
    marginRight: "20%",
  },
  adminMessageText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  customerMessageText: {
    fontSize: 16,
    color: "#000000",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    position: 'absolute',
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
});