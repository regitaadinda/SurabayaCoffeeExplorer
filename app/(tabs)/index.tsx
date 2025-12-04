import { useIsFocused } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { onValue, push, ref, set } from "firebase/database";
import { ArrowRight, Check, Coffee, Heart, LocateFixed, Map as MapIcon, MapPin, Search, X, Send, Maximize, Star } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import MapView, { Geojson, Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlert from '../../components/CustomAlert';
import { Colors } from '../../constants/Colors';
import { auth, db } from '../../services/firebaseConfig';

const surabayaGeo = require('../../assets/data/Surabaya.json');
const cafeData = require('../../assets/data/cafe_surabaya.json');

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const decodePolyline = (encoded: string) => {
  if (!encoded) return [];
  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return poly;
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const router = useRouter();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const locationRef = useRef<Location.LocationObject | null>(null);

  const [selectedCafe, setSelectedCafe] = useState<any>(null);
  const [searchFeature, setSearchFeature] = useState<any>(null);

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteList, setFavoriteList] = useState<any[]>([]);

  const [isDriveMode, setIsDriveMode] = useState(false);
  const [targetCafeId, setTargetCafeId] = useState<string | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number, longitude: number }[]>([]);

  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const headingSubscription = useRef<Location.LocationSubscription | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'danger' | 'warning' | 'info';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    visible: false, type: 'info', title: '', message: '', onConfirm: () => { }
  });

  const mapCustomStyle = [
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
    { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "labels", "stylers": [{ "visibility": "on" }] }
  ];

  const triggerMapRefresh = () => {
    setTracksViewChanges(true);
    setTimeout(() => setTracksViewChanges(true), 250);
  };

  useEffect(() => {
    if (tracksViewChanges) {
      const timer = setTimeout(() => { setTracksViewChanges(false); }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tracksViewChanges]);

  useEffect(() => {
    if (params.startNav === 'true' && params.lat && params.lng) {
      const targetCafe = {
        id: params.id,
        geometry: { coordinates: [parseFloat(params.lng as string), parseFloat(params.lat as string)] },
        properties: { name: params.name }
      };
      setTimeout(() => {
        startDriveMode(targetCafe);
        router.setParams({ startNav: null });
      }, 500);
    }
  }, [params]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      locationRef.current = loc;
    })();
    return () => {
      if (locationSubscription.current) locationSubscription.current.remove();
      if (headingSubscription.current) headingSubscription.current.remove();
    };
  }, []);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const favRef = ref(db, `users/${userId}/favorites`);
    const unsubscribe = onValue(favRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.values(data);
        const ids = new Set(items.map((item: any) => item.id));
        setFavoriteIds(ids);
        setFavoriteList(items);
      } else {
        setFavoriteIds(new Set());
        setFavoriteList([]);
      }
      triggerMapRefresh();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selectedCafe) return;
    const savedItem = favoriteList.find(f => f.id === selectedCafe.id);
    if (savedItem) {
      if (selectedCafe.properties.name !== savedItem.name ||
        selectedCafe.properties.address !== savedItem.address ||
        selectedCafe.properties.image !== savedItem.image ||
        selectedCafe.properties.rating !== savedItem.rating
      ) {
        setSelectedCafe((prev: any) => ({
          ...prev,
          properties: {
            ...prev.properties,
            name: savedItem.name,
            address: savedItem.address,
            image: savedItem.image,
            rating: savedItem.rating
          }
        }));
      }
    } else {
      const originalJson = cafeData.features.find((f: any) => f.id === selectedCafe.id);
      if (originalJson) {
        if (selectedCafe.properties.name !== originalJson.properties.name) setSelectedCafe(originalJson);
      } else if (searchFeature && searchFeature.id === selectedCafe.id) {
        if (selectedCafe.properties.name !== searchFeature.properties.name) setSelectedCafe(searchFeature);
      }
    }
  }, [favoriteList]);

  const handleMarkerPress = (feature: any) => {
    setSearchResults([]);
    setSearchQuery('');
    const savedItem = favoriteList.find(f => f.id === feature.id);
    if (savedItem) {
      setSelectedCafe({
        id: feature.id, geometry: feature.geometry,
        properties: {
          ...feature.properties,
          name: savedItem.name,
          address: savedItem.address,
          image: savedItem.image,
          rating: savedItem.rating
        }
      });
    } else {
      setSelectedCafe(feature);
    }
    mapRef.current?.animateToRegion({ latitude: feature.geometry.coordinates[1], longitude: feature.geometry.coordinates[0], latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const handleCenterUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005,
      }, 1000);
    }
  };

  const handleCenterInit = () => {
    mapRef.current?.animateToRegion({
      latitude: -7.271, longitude: 112.718, latitudeDelta: 0.3, longitudeDelta: 0.3,
    }, 1000);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    Keyboard.dismiss();
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&addressdetails=1&limit=15&countrycodes=id`,
        { headers: { 'User-Agent': 'SurabayaCoffeeApp/1.0' } }
      );
      if (!response.ok) throw new Error('Gagal');
      let data = await response.json();
      if (locationRef.current) {
        const userLat = locationRef.current.coords.latitude;
        const userLng = locationRef.current.coords.longitude;
        data = data.map((item: any) => {
          const dist = getDistance(userLat, userLng, parseFloat(item.lat), parseFloat(item.lon));
          return { ...item, distance: dist };
        });
        data.sort((a: any, b: any) => a.distance - b.distance);
      }
      setSearchResults(data);
    } catch (error) {
      showMessage({ message: "Gagal mencari lokasi", type: "danger" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: any) => {
    setSearchResults([]);
    setSearchQuery('');
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
    const feature = {
      id: `osm_${result.place_id}`,
      type: "Feature",
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: { name: result.display_name.split(',')[0], brand: "Hasil Pencarian", address: result.display_name }
    };
    setSearchFeature(feature);
    handleMarkerPress(feature);
    triggerMapRefresh();
  };

  const fetchRoute = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=polyline`,
        { headers: { 'User-Agent': 'SurabayaCoffeeApp/1.0' } }
      );
      const json = await response.json();
      if (json.routes && json.routes.length > 0) {
        const points = decodePolyline(json.routes[0].geometry);
        setRouteCoords(points);
      } else { throw new Error("Rute tidak ditemukan"); }
    } catch (error) {
      setRouteCoords([{ latitude: startLat, longitude: startLng }, { latitude: endLat, longitude: endLng }]);
    }
  };

  const handleNavButtonPress = () => {
    if (isDriveMode) {
      setAlertConfig({
        visible: true, type: 'warning', title: 'Berhenti Navigasi',
        message: 'Apakah Anda ingin mengakhiri mode berkendara?',
        onConfirm: stopDriveMode
      });
    } else {
      if (selectedCafe) {
        setAlertConfig({
          visible: true, type: 'info', title: 'Mulai Navigasi',
          message: `Menuju ke ${selectedCafe.properties.name}?`,
          onConfirm: () => startDriveMode(selectedCafe)
        });
        return;
      }
      if (!location) { showMessage({ message: "Lokasi belum ditemukan", type: "warning" }); return; }
      let minDist = Infinity; let nearest: any = null;
      cafeData.features.forEach((feature: any) => {
        const dist = getDistance(location.coords.latitude, location.coords.longitude, feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        if (dist < minDist) { minDist = dist; nearest = feature; }
      });
      if (nearest) {
        setAlertConfig({
          visible: true, type: 'info', title: 'Cafe Terdekat',
          message: `Tujuan: ${nearest.properties.name}\nJarak: ${minDist.toFixed(2)} KM`,
          onConfirm: () => startDriveMode(nearest)
        });
      }
    }
  };

  const startDriveMode = async (targetCafe: any) => {
    closeAlert();
    setIsDriveMode(true);
    setTargetCafeId(targetCafe.id);
    setSelectedCafe(null);
    triggerMapRefresh();
    const targetCoords = { latitude: targetCafe.geometry.coordinates[1], longitude: targetCafe.geometry.coordinates[0] };
    if (location) { fetchRoute(location.coords.latitude, location.coords.longitude, targetCoords.latitude, targetCoords.longitude); }
    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 1 },
      (newLoc) => { setLocation(newLoc); locationRef.current = newLoc; }
    );
    headingSubscription.current = await Location.watchHeadingAsync((obj) => {
      if (locationRef.current && mapRef.current) {
        mapRef.current.animateCamera({ center: { latitude: locationRef.current.coords.latitude, longitude: locationRef.current.coords.longitude }, heading: obj.magHeading, pitch: 60, zoom: 19 }, { duration: 200 });
      }
    });
  };

  const stopDriveMode = () => {
    closeAlert();
    setIsDriveMode(false);
    setTargetCafeId(null);
    setRouteCoords([]);
    setSearchFeature(null);
    triggerMapRefresh();
    if (locationSubscription.current) locationSubscription.current.remove();
    if (headingSubscription.current) headingSubscription.current.remove();
    mapRef.current?.animateCamera({ center: location ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : undefined, pitch: 0, heading: 0, zoom: 15 });
  };

  const confirmSave = () => {
    if (selectedCafe) {
      if (favoriteIds.has(selectedCafe.id)) { showMessage({ message: "Sudah tersimpan!", type: "info" }); return; }
      saveToFavorites(selectedCafe);
    }
  };

  const saveToFavorites = async (item: any) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const newRef = push(ref(db, `users/${userId}/favorites`));
      await set(newRef, {
        id: item.id, name: item.properties.name, brand: 'Place', address: item.properties.address || 'Surabaya',
        lat: item.geometry.coordinates[1], lng: item.geometry.coordinates[0],
        rating: 0
      });
      showMessage({ message: "Disimpan ke Favorit", type: "success" });
      triggerMapRefresh();
    } catch (error) { showMessage({ message: "Gagal menyimpan", type: "danger" }); }
  };

  const isFavorited = selectedCafe && favoriteIds.has(selectedCafe.id);

  return (
    <View style={styles.container}>

      {!isDriveMode && (
        <View style={[styles.headerContainer, { top: insets.top - 15 }]}>
          <View style={styles.searchBar}>
            <View style={styles.logoContainer}><Coffee size={20} color="white" /></View>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari kedai kopi..."
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
              {isSearching ? <ActivityIndicator size="small" color={Colors.primary} /> : <Search size={22} color={Colors.primary} strokeWidth={2.5} />}
            </TouchableOpacity>
          </View>

          {searchResults.length > 0 && (
            <View style={styles.resultsList}>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectResult(item)}>
                    <View style={styles.resultIconBg}><MapIcon size={18} color={Colors.primary} /></View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.resultTitle}>{item.display_name.split(',')[0]}</Text>
                      <Text style={styles.resultSub} numberOfLines={1}>{item.distance ? `${item.distance.toFixed(1)} km • ` : ''}{item.display_name}</Text>
                    </View>
                    <ArrowRight size={18} color={Colors.textLight} />
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeSearch} onPress={() => { setSearchResults([]); setSearchQuery(''); }}>
                <Text style={styles.closeSearchText}>Tutup Hasil</Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedCafe && searchResults.length === 0 && (
            <View style={styles.detailCardContainer}>
              <View style={styles.popupCard}>

                <View style={styles.popupHeaderRow}>
                  <View style={styles.popupIconPlaceholder}>
                    {selectedCafe?.id?.toString().startsWith('osm_') ? <MapPin size={24} color="white" /> : <Coffee size={24} color="white" />}
                  </View>
                  <View style={styles.popupContent}>
                    <View style={styles.badgeRow}>
                      <View style={styles.badge}><Text style={styles.badgeText}>PLACE</Text></View>
                      {selectedCafe?.properties?.rating > 0 && (
                        <View style={styles.ratingBadge}>
                          <Star size={10} color="#FFC107" fill="#FFC107" />
                          <Text style={styles.ratingText}>{selectedCafe.properties.rating}.0</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.popupTitle} numberOfLines={2}>{selectedCafe?.properties?.name}</Text>
                    <Text style={styles.popupAddress} numberOfLines={2}>{selectedCafe?.properties?.address || 'Surabaya, Jawa Timur'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedCafe(null)} style={styles.closeBtnAbsolute}>
                    <X size={20} color={Colors.textLight} />
                  </TouchableOpacity>
                </View>

                {selectedCafe.properties.image && (
                  <Image
                    source={{ uri: selectedCafe.properties.image }}
                    style={styles.popupLargeImage}
                  />
                )}

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.primary, flex: 1 }]}
                    onPress={() => {
                      setAlertConfig({
                        visible: true, type: 'info', title: 'Mulai Navigasi',
                        message: `Menuju ke ${selectedCafe?.properties?.name}?`,
                        onConfirm: () => startDriveMode(selectedCafe)
                      });
                    }}
                  >
                    <Send size={18} color="white" strokeWidth={2.5} />
                    <Text style={styles.actionText}>Arahkan</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { flex: 1, backgroundColor: isFavorited ? '#D7CCC8' : Colors.secondary }]}
                    onPress={confirmSave} disabled={isFavorited}
                  >
                    {isFavorited ? <Check size={18} color="white" strokeWidth={2.5} /> : <Heart size={18} color="white" strokeWidth={2.5} />}
                    <Text style={styles.actionText}>{isFavorited ? 'Tersimpan' : 'Simpan'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ latitude: -7.271, longitude: 112.718, latitudeDelta: 0.3, longitudeDelta: 0.3 }}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        customMapStyle={mapCustomStyle}
        toolbarEnabled={false}
        scrollEnabled={!isDriveMode}
        zoomEnabled={!isDriveMode}
      >
        <Geojson geojson={surabayaGeo} strokeColor={Colors.primary} fillColor="rgba(111, 78, 55, 0.1)" strokeWidth={2} />
        {cafeData.features.map((feature: any) => {
          if (isDriveMode && feature.id !== targetCafeId) return null;
          if (!feature.properties?.name) return null;

          const isFav = favoriteIds.has(feature.id);
          const isTarget = feature.id === targetCafeId && isDriveMode;
          return (
            <Marker key={feature.id} coordinate={{ latitude: feature.geometry.coordinates[1], longitude: feature.geometry.coordinates[0] }} onPress={() => handleMarkerPress(feature)} zIndex={isTarget ? 100 : 1} tracksViewChanges={tracksViewChanges}>
              <View style={[styles.markerContainer, { backgroundColor: isFav ? Colors.secondary : Colors.primary }, isTarget && styles.destinationMarker]}>
                <Coffee size={14} color="white" />
              </View>
            </Marker>
          );
        })}
        {favoriteList.map((fav: any) => {
          if (isDriveMode && fav.id !== targetCafeId) return null;
          const existsInJson = cafeData.features.some((f: any) => f.id === fav.id);
          if (existsInJson) return null;
          const isTarget = fav.id === targetCafeId && isDriveMode;
          const isSearchItem = fav.id.toString().startsWith('osm_');
          return (
            <Marker key={fav.id} coordinate={{ latitude: fav.lat, longitude: fav.lng }} onPress={() => handleMarkerPress({ id: fav.id, geometry: { coordinates: [fav.lng, fav.lat] }, properties: { ...fav } })} zIndex={isTarget ? 100 : 50} tracksViewChanges={tracksViewChanges}>
              <View style={[styles.markerContainer, { backgroundColor: Colors.secondary }, isTarget && styles.destinationMarker]}>
                {isSearchItem ? <MapPin size={14} color="white" /> : <Coffee size={14} color="white" />}
              </View>
            </Marker>
          );
        })}
        {searchFeature && !favoriteIds.has(searchFeature.id) && ((!isDriveMode || searchFeature.id === targetCafeId) && (
          <Marker key={searchFeature.id} coordinate={{ latitude: searchFeature.geometry.coordinates[1], longitude: searchFeature.geometry.coordinates[0] }} onPress={() => handleMarkerPress(searchFeature)} zIndex={searchFeature.id === targetCafeId ? 150 : 60} tracksViewChanges={tracksViewChanges}>
            <View style={[styles.markerContainer, { backgroundColor: Colors.primary }, (isDriveMode && searchFeature.id === targetCafeId) && styles.destinationMarker]}>
              <MapPin size={14} color="white" />
            </View>
          </Marker>
        ))}
        {isDriveMode && <Polyline coordinates={routeCoords} strokeColor={Colors.primary} strokeWidth={6} />}
      </MapView>

      <View style={[styles.rightControlsWrapper, { bottom: insets.bottom - 10 }]}>
        <TouchableOpacity style={[styles.fabButton, { backgroundColor: Colors.primary }, isDriveMode && styles.btnActive]} onPress={handleNavButtonPress}>
          <Send size={22} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {!isDriveMode && (
        <View style={[styles.leftControlsWrapper, { bottom: insets.bottom - 10 }]}>
          <TouchableOpacity style={styles.fabButtonWhite} onPress={handleCenterUser}>
            <LocateFixed size={24} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.fabButtonWhite} onPress={handleCenterInit}>
            <Maximize size={24} color={Colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}

      <CustomAlert visible={alertConfig.visible} type={alertConfig.type} title={alertConfig.title} message={alertConfig.message} onConfirm={alertConfig.onConfirm} onCancel={closeAlert} confirmText="Ya" cancelText="Batal" />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  map: { width: '100%', height: '100%' },

  markerContainer: {
    padding: 7, borderRadius: 14, borderWidth: 2, borderColor: 'white',
    elevation: 4, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3,
  },
  destinationMarker: { backgroundColor: '#388E3C', transform: [{ scale: 1.1 }] },

  headerContainer: { position: 'absolute', left: 20, right: 20, zIndex: 100 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 24, padding: 6, paddingRight: 8,
    elevation: 6, shadowColor: '#8D6E63', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  logoContainer: { width: 42, height: 42, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14, color: Colors.text, height: '100%', paddingRight: 10 },
  searchBtn: { padding: 8, backgroundColor: '#EFEBE9', borderRadius: 14 },

  resultsList: {
    backgroundColor: 'white', marginTop: 12, borderRadius: 24, elevation: 8, shadowColor: '#8D6E63', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, padding: 8, maxHeight: 320,
  },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 4 },
  resultIconBg: { backgroundColor: '#EFEBE9', padding: 10, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  resultTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: Colors.text },
  resultSub: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: Colors.textLight, marginTop: 2 },
  closeSearch: { padding: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#FAFAFA', marginTop: 4 },
  closeSearchText: { fontFamily: 'Poppins_600SemiBold', color: Colors.error, fontSize: 12 },

  detailCardContainer: { marginTop: 12 },
  popupCard: {
    width: '100%', backgroundColor: 'white', borderRadius: 28, padding: 20,
    elevation: 20, shadowColor: '#3E2723', shadowOpacity: 0.25, shadowRadius: 16
  },
  popupHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  popupIconPlaceholder: {
    width: 56, height: 56, borderRadius: 20, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', marginRight: 16,
    shadowColor: Colors.primary, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3,
  },
  popupLargeImage: {
    width: '100%', height: 160, borderRadius: 18, marginBottom: 16, resizeMode: 'cover',
    borderWidth: 1, borderColor: '#F5F5F5'
  },
  popupContent: { flex: 1, justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  badge: { backgroundColor: '#EFEBE9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: Colors.primary, letterSpacing: 0.5 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FFF8E1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: '#FFB300' },
  popupTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: Colors.text, lineHeight: 22, marginBottom: 2 },
  popupAddress: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: Colors.textLight },
  closeBtnAbsolute: { position: 'absolute', right: -5, top: -5, padding: 8, backgroundColor: '#FAFAFA', borderRadius: 20 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 18, gap: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  actionText: { color: 'white', fontFamily: 'Poppins_600SemiBold', fontSize: 14 },

  rightControlsWrapper: { position: 'absolute', right: 20, alignItems: 'center' },
  leftControlsWrapper: { position: 'absolute', left: 20, alignItems: 'center', gap: 20 },

  fabButton: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 5 },
  },
  fabButtonWhite: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#8D6E63', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  btnActive: { backgroundColor: '#F59E0B' },
});