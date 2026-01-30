import { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

/* ================= MAP HTML ================= */

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html, body, #map {
  height: 100%;
  margin: 0;
  padding: 0;
}
.marker {
  font-size: 26px;
  transform: translate(-50%, -50%);
}
</style>
</head>
<body>
<div id="map"></div>

<script>
const map = L.map("map").setView([11.9, 92.9], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);

function icon(emoji) {
  return L.divIcon({
    html: "<div class='marker'>" + emoji + "</div>",
    className: "",
    iconSize: [30, 30],
  });
}

const placeLayer = L.layerGroup().addTo(map);
const busLayer = L.layerGroup().addTo(map);
const userLayer = L.layerGroup().addTo(map);

// Places
L.marker([11.6234,92.7265],{icon:icon("🏛️")}).addTo(placeLayer).bindPopup("Port Blair");
L.marker([11.9831,92.9936],{icon:icon("🏝️")}).addTo(placeLayer).bindPopup("Havelock Island");
L.marker([11.8316,93.0287],{icon:icon("🌊")}).addTo(placeLayer).bindPopup("Neil Island");

// Bus routes
function bus(coords,color,name){
  L.polyline(coords,{color,weight:5,dashArray:"8,6"})
   .addTo(busLayer).bindPopup("🚌 "+name);
}

bus([[11.6234,92.7265],[11.5842,92.7181],[11.5438,92.7012]],
    "#2563eb","Port Blair – Wandoor");

bus([[11.6234,92.7265],[11.721,92.7453],[11.78,92.7584],[11.95,92.76]],
    "#16a34a","Port Blair – Baratang");

document.addEventListener("message", function(e) {
  const d = JSON.parse(e.data);

  if(d.type==="CENTER"){
    map.setView([d.lat,d.lng],10,{animate:true});
  }

  if(d.type==="ADD"){
    L.marker([d.lat,d.lng],{icon:icon("⭐")})
      .addTo(userLayer)
      .bindPopup(d.label||"Place")
      .openPopup();
  }

  if(d.type==="TOGGLE"){
    const layer = d.layer==="places"?placeLayer:
                  d.layer==="bus"?busLayer:userLayer;
    d.on ? map.addLayer(layer) : map.removeLayer(layer);
  }
});
</script>
</body>
</html>
`;

/* ================= DATA ================= */

const PLACES = [
  { id: "pb", name: "Port Blair", lat: 11.6234, lng: 92.7265 },
  { id: "hv", name: "Havelock Island", lat: 11.9831, lng: 92.9936 },
  { id: "nl", name: "Neil Island", lat: 11.8316, lng: 93.0287 },
];

/* ================= SCREEN ================= */

export default function ExploreScreen() {
  const webRef = useRef<any>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const [layers, setLayers] = useState({
    places: true,
    bus: true,
    user: true,
  });

  function post(msg: any) {
    webRef.current?.postMessage(JSON.stringify(msg));
  }

  function toggle(layer: "places" | "bus" | "user") {
    const on = !layers[layer];
    setLayers({ ...layers, [layer]: on });
    post({ type: "TOGGLE", layer, on });
  }

  async function searchPlaces(text: string) {
    setQuery(text);

    if (text.length < 3) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          text + " Andaman"
        )}`
      );
      const data = await res.json();
      setResults(data.slice(0, 5));
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webRef}
        source={{ html: MAP_HTML }}
        style={{ flex: 1 }}
        originWhitelist={["*"]}
      />

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <Text>🔍</Text>
        <TextInput
          placeholder="Search places"
          placeholderTextColor="#64748b"
          value={query}
          onChangeText={searchPlaces}
          style={styles.searchInput}
        />
        <Text>🎤</Text>
      </View>

      {/* SEARCH RESULTS */}
      {results.length > 0 && (
        <View style={styles.searchResults}>
          {results.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={styles.resultItem}
              onPress={() => {
                post({
                  type: "CENTER",
                  lat: parseFloat(r.lat),
                  lng: parseFloat(r.lon),
                });
                post({
                  type: "ADD",
                  lat: parseFloat(r.lat),
                  lng: parseFloat(r.lon),
                  label: r.display_name.split(",")[0],
                });
                setQuery(r.display_name);
                setResults([]);
              }}
            >
              <Text style={styles.resultTitle}>
                {r.display_name.split(",")[0]}
              </Text>
              <Text style={styles.resultSub}>
                {r.display_name.split(",").slice(1, 3).join(",")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* LAYER CHIPS */}
      <View style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, layers.places && styles.chipOn]}
          onPress={() => toggle("places")}
        >
          <Text>📍</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, layers.bus && styles.chipOn]}
          onPress={() => toggle("bus")}
        >
          <Text>🚌</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, layers.user && styles.chipOn]}
          onPress={() => toggle("user")}
        >
          <Text>⭐</Text>
        </TouchableOpacity>
      </View>

      {/* PLACES CARDS */}
      <View style={styles.cards}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PLACES.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.card}
              onPress={() =>
                post({ type: "CENTER", lat: p.lat, lng: p.lng })
              }
            >
              <Text style={styles.cardTitle}>{p.name}</Text>
              <Text style={styles.cardSub}>Tap to explore</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  searchBar: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    elevation: 10,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
  },
  searchResults: {
    position: "absolute",
    top: 105,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 12,
    zIndex: 20,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  resultTitle: { fontWeight: "600" },
  resultSub: { fontSize: 12, color: "#64748b" },

  chips: {
    position: "absolute",
    top: 115,
    left: 16,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    elevation: 6,
  },
  chip: { paddingHorizontal: 14, paddingVertical: 10 },
  chipOn: { backgroundColor: "#e0e7ff", borderRadius: 20 },

  cards: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    paddingLeft: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginRight: 12,
    width: 200,
    elevation: 6,
  },
  cardTitle: { fontWeight: "700", fontSize: 16 },
  cardSub: { color: "#64748b", marginTop: 4 },
});
