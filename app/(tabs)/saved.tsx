import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, onValue, remove } from 'firebase/database';
import { auth, db } from '../../services/firebaseConfig';
import { Colors } from '../../constants/Colors';
import { Trash, MapPin, Coffee, Send, Pencil, Star } from 'lucide-react-native';
import CustomAlert from '../../components/CustomAlert';
import { useRouter } from 'expo-router';

export default function SavedScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [navTarget, setNavTarget] = useState<any>(null);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const favRef = ref(db, `users/${userId}/favorites`);
    const unsubscribe = onValue(favRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          dbKey: key,
          ...data[key],
        }));
        setFavorites(list);
      } else {
        setFavorites([]);
      }
    });

    return unsubscribe;
  }, []);

  const confirmDelete = () => {
    if (deleteId && auth.currentUser) {
      remove(ref(db, `users/${auth.currentUser.uid}/favorites/${deleteId}`));
      setDeleteId(null);
    }
  };

  const handleNavigate = () => {
    if (navTarget) {
      router.push({
        pathname: '/(tabs)',
        params: {
          startNav: 'true',
          lat: navTarget.lat,
          lng: navTarget.lng,
          name: navTarget.name,
          id: navTarget.id
        }
      });
      setNavTarget(null);
    }
  };

  const handleEdit = (item: any) => {
    router.push({
      pathname: '/edit-saved',
      params: {
        dbKey: item.dbKey,
        name: item.name,
        address: item.address,
        rating: item.rating ? item.rating.toString() : '0'
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.dbKey}
        contentContainerStyle={{ paddingBottom: 10.8, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}

        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Coffee size={40} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Koleksi</Text>
            <Text style={styles.emptyText}>Jelajahi peta Surabaya dan simpan coffee shop favoritmu.</Text>
          </View>
        }

        renderItem={({ item }) => {
          const isSearchItem = item.id && item.id.toString().startsWith('osm_');

          return (
            <View style={styles.cardItem}>
              <View style={styles.cardLeftSection}>
                <View style={styles.cardImagePlaceholder}>
                  {isSearchItem ? (
                    <MapPin size={26} color={Colors.white} strokeWidth={2.5} />
                  ) : (
                    <Coffee size={26} color={Colors.white} strokeWidth={2.5} />
                  )}
                </View>
              </View>
              
              <View style={styles.cardContent}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4}}>
                    {item.brand && (
                    <View style={styles.brandBadge}>
                        <Text style={styles.brandText}>{item.brand}</Text>
                    </View>
                    )}
                    {item.rating > 0 && (
                        <View style={styles.ratingBadge}>
                            <Star size={8} color="#FFC107" fill="#FFC107" />
                            <Text style={styles.ratingText}>{item.rating}.0</Text>
                        </View>
                    )}
                </View>
                
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                
                <View style={styles.locationRow}>
                  <MapPin size={10} color={Colors.textLight} style={{ marginTop: 2 }} />
                  <Text style={styles.cardAddress} numberOfLines={2}>
                    {item.address || 'Surabaya, Jawa Timur'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionContainer}>
                <TouchableOpacity 
                  onPress={() => setNavTarget(item)} 
                  style={[styles.actionBtn, { backgroundColor: '#EFEBE9' }]} 
                >
                  <Send 
                    color={Colors.primary} 
                    size={18} 
                    strokeWidth={2.5} 
                  />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleEdit(item)} 
                  style={[styles.actionBtn, { backgroundColor: '#FFF3E0' }]}
                >
                  <Pencil color="#EF6C00" size={18} strokeWidth={2.5} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setDeleteId(item.dbKey)} 
                  style={[styles.actionBtn, { backgroundColor: '#FFEBEE' }]}
                >
                  <Trash color="#D32F2F" size={18} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <CustomAlert 
        visible={!!deleteId}
        type="warning"
        title="Hapus Favorit?"
        message="Lokasi ini akan dihapus dari daftar koleksi Anda."
        confirmText="Hapus"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      <CustomAlert 
        visible={!!navTarget}
        type="info"
        title="Mulai Navigasi"
        message={`Arahkan peta menuju ${navTarget?.name}?`}
        confirmText="Ya"
        onCancel={() => setNavTarget(null)}
        onConfirm={handleNavigate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  cardItem: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8D6E63',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FAFAFA'
  },
  cardLeftSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  cardContent: { 
    flex: 1, 
    marginRight: 8,
    justifyContent: 'center'
  },
  brandBadge: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#EFEBE9', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 8,
  },
  brandText: { 
    fontFamily: 'Poppins_600SemiBold', 
    fontSize: 9,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: '#FFF8E1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6
  },
  ratingText: {
    fontFamily: 'Poppins_600SemiBold', fontSize: 9, color: '#FFB300'
  },
  cardTitle: { 
    fontFamily: 'Poppins_600SemiBold', 
    fontSize: 15, 
    color: Colors.text, 
    marginBottom: 2,
    lineHeight: 20
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    gap: 4 
  },
  cardAddress: { 
    fontFamily: 'Poppins_400Regular', 
    fontSize: 11, 
    color: Colors.textLight, 
    maxWidth: '95%',
    lineHeight: 16
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  actionBtn: { 
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 40 },
  emptyIconBg: { width: 80, height: 80, backgroundColor: '#EFEBE9', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: Colors.text, marginBottom: 8 },
  emptyText: { fontFamily: 'Poppins_400Regular', color: Colors.textLight, textAlign: 'center', lineHeight: 22 },
});