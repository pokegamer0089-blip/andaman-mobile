import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";

const BACKEND_URL = "http://10.58.72.42"; // keep your IP

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

const QUICK_SUGGESTIONS = [
  "Plan a 1 day trip to Havelock Island",
  "Best beaches in Andaman",
  "Things to do in Neil Island",
];

export default function PlannerChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(text?: string) {
    const finalText = text ?? input;
    if (!finalText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: finalText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalText }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: Date.now().toString() + "-bot",
        text: data.text,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-err",
          text: "❌ Could not connect to planner",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {messages.length === 0 ? (
        // 🌴 WELCOME STATE
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>
            Where do you want to go in Andaman? 🌴
          </Text>

          {QUICK_SUGGESTIONS.map((q) => (
            <TouchableOpacity
              key={q}
              style={styles.suggestion}
              onPress={() => sendMessage(q)}
            >
              <Text style={styles.suggestionText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        // 💬 CHAT VIEW
        <>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: SPACING.m }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.message,
                  item.sender === "user" ? styles.user : styles.bot,
                ]}
              >
                <Text
                  style={[
                    styles.text,
                    item.sender === "user" && { color: COLORS.textLight },
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            )}
          />

          {loading && (
            <ActivityIndicator style={{ marginBottom: SPACING.s }} />
          )}
        </>
      )}

      {/* INPUT BAR */}
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your trip..."
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => sendMessage()}
        >
          <Text style={{ color: COLORS.textLight, fontWeight: "600" }}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* Welcome */
  welcome: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.l,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: SPACING.l,
  },
  suggestion: {
    backgroundColor: COLORS.card,
    padding: SPACING.m,
    borderRadius: RADIUS.m,
    marginBottom: SPACING.s,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  suggestionText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: "500",
  },

  /* Chat */
  message: {
    maxWidth: "78%",
    padding: SPACING.m,
    borderRadius: RADIUS.l,
    marginBottom: SPACING.s,
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.userBubble,
    borderTopRightRadius: 0,
  },
  bot: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.botBubble,
    borderTopLeftRadius: 0,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.textDark,
  },

  /* Input */
  inputBar: {
    flexDirection: "row",
    padding: SPACING.s,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    paddingHorizontal: SPACING.m,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.l,
    justifyContent: "center",
    borderRadius: 999,
    marginLeft: SPACING.s,
  },
});
