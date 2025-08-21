import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  RefreshControl
} from "react-native";
import { useRouter } from "expo-router";
import { supabaseAdmin } from "../../supabaseClient"; // Import the admin client

export default function ChatsList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      if (!refreshing) setLoading(true);

      // Use the admin client to bypass RLS
      const { data: messagesData, error: messagesError } = await supabaseAdmin
        .from("messages")
        .select("user_id")
        .order("created_at", { ascending: false });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return;
      }

      // Extract unique user IDs
      const uniqueUserIds = Array.from(
        new Set(messagesData.map((msg: any) => msg.user_id))
      );

      if (uniqueUserIds.length === 0) {
        setCustomers([]);
        return;
      }

      // Fetch profile data using admin client
      const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id, first_name, last_name, email, phone_number")
        .in("id", uniqueUserIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        const fallbackCustomers = uniqueUserIds.map((id: string) => ({
          id,
          full_name: `User ${id.substring(0, 8)}`,
          email: "",
        }));
        setCustomers(fallbackCustomers);
        return;
      }

      // Get the latest message for each user
      const latestMessages = await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const { data: messageData } = await supabaseAdmin
            .from("messages")
            .select("message, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1);

          return {
            userId,
            lastMessage: messageData?.[0]?.message || "",
            lastMessageTime: messageData?.[0]?.created_at || "",
          };
        })
      );

      const customerMap = new Map();
      profilesData.forEach((profile: any) => {
        const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown User";
        const latestMessage = latestMessages.find(msg => msg.userId === profile.id);

        customerMap.set(profile.id, {
          id: profile.id,
          full_name: fullName,
          email: profile.email || "",
          phone_number: profile.phone_number || "",
          last_message: latestMessage?.lastMessage || "",
          last_message_time: latestMessage?.lastMessageTime || "",
        });
      });

      const allCustomers = uniqueUserIds.map((id: string) =>
        customerMap.get(id) || {
          id,
          full_name: `User ${id.substring(0, 8)}`,
          email: "",
          phone_number: "",
          last_message: "",
          last_message_time: "",
        }
      );

      setCustomers(allCustomers);
    } catch (err: any) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Customer Chats ({customers.length})</Text>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              router.push({
                pathname: "/tabs/ChatWithCustomer",
                params: { userId: item.id },
              })
            }
          >
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.email}>{item.email || "No email available"}</Text>
            {item.last_message ? (
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.last_message.length > 50
                  ? `${item.last_message.substring(0, 50)}...`
                  : item.last_message}
              </Text>
            ) : null}
            {item.phone_number ? (
              <Text style={styles.phone}>Phone: {item.phone_number}</Text>
            ) : null}
            {item.last_message_time ? (
              <Text style={styles.time}>
                Last message: {new Date(item.last_message_time).toLocaleString()}
              </Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No customer chats found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center" 
  },
  item: { 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: "#ddd", 
    backgroundColor: "#f9f9f9", 
    borderRadius: 8, 
    marginBottom: 8 
  },
  name: { 
    fontSize: 18, 
    fontWeight: "500", 
    marginBottom: 4 
  },
  email: { 
    fontSize: 14, 
    color: "gray", 
    marginBottom: 4 
  },
  phone: { 
    fontSize: 14, 
    color: "blue", 
    marginBottom: 4 
  },
  lastMessage: { 
    fontSize: 14, 
    color: "#666", 
    marginBottom: 4, 
    fontStyle: "italic" 
  },
  time: { 
    fontSize: 12, 
    color: "#999" 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 50, 
    padding: 20 
  },
  emptyText: { 
    fontSize: 16, 
    color: "gray", 
    fontStyle: "italic", 
    marginBottom: 10, 
    textAlign: "center" 
  }
});
