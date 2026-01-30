import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";

const PLACES = [
  {
    name: "Radhanagar Beach",
    image:
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1",
  },
  {
    name: "Cellular Jail",
    image:
      "https://images.unsplash.com/photo-1627882272472-9f5d9eacbf7d",
  },
  {
    name: "Neil Island",
    image:
      "https://images.unsplash.com/photo-1587502536263-9298a1d1b0b6",
  },
  {
    name: "Ross Island",
    image:
      "https://images.unsplash.com/photo-1602067340370-99d6a2d6e8aa",
  },
  {
    name: "Baratang Island",
    image:
      "https://images.unsplash.com/photo-1615361200141-f4504b0d2c45",
  },
];

export default function PlacesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Explore Places</Text>

      {PLACES.map((place) => (
        <View key={place.name} style={styles.card}>
          <ImageBackground
            source={{ uri: place.image }}
            style={styles.image}
            imageStyle={styles.imageRadius}
          >
            <View style={styles.overlay}>
              <Text style={styles.text}>{place.name}</Text>
            </View>
          </ImageBackground>
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
    marginBottom: SPACING.m,
    borderRadius: RADIUS.l,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },

  image: {
    height: 180,
    justifyContent: "flex-end",
  },

  imageRadius: {
    borderRadius: RADIUS.l,
  },

  overlay: {
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: SPACING.m,
  },

  text: {
    color: COLORS.textLight,
    fontSize: 20,
    fontWeight: "700",
  },
});
