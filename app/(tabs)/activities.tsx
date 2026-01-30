import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";

const ACTIVITIES = [
  "Scuba Diving 🤿",
  "Snorkeling 🌊",
  "Sea Walk 🚶‍♂️",
  "Jet Ski 🚤",
  "Glass Boat Ride 🚢",
];

export default function ActivitiesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Activities</Text>

      {ACTIVITIES.map((activity) => (
        <View key={activity} style={styles.card}>
          <Text style={styles.text}>{activity}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.m,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: SPACING.m,
    color: COLORS.textDark,
  },
  card: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.m,
    borderRadius: RADIUS.m,
    marginBottom: SPACING.s,
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textLight,
  },
});
