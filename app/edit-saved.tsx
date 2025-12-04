import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ref, update, get, child } from 'firebase/database';
import { auth, db } from '../services/firebaseConfig';
import { Colors } from '../constants/Colors';
import { showMessage } from 'react-native-flash-message';
import { ArrowLeft, Save, MapPin, Tag, Coffee, Camera, Star } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function EditSavedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true); 
  
  const [name, setName] = useState(params.name as string || '');
  const [address, setAddress] = useState(params.address as string || '');
  const [image, setImage] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(params.rating ? parseInt(params.rating as string) : 0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const userId = auth.currentUser?.uid;
        const dbKey = params.dbKey as string;

        if (userId && dbKey) {
          const snapshot = await get(child(ref(db), `users/${userId}/favorites/${dbKey}`));
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.image) setImage(data.image);
            if (data.rating) setRating(data.rating);
          }
        }
      } catch (error) {
        console.log("Gagal memuat data");
      } finally {
        setImageLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setImage(imageUri);
      }
    } catch (error) {
      showMessage({ message: "Gagal mengambil gambar", type: "danger" });
    }
  };

  const handleSave = async () => {
    if (!name || !address) {
      showMessage({ message: "Data tidak boleh kosong", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      const dbKey = params.dbKey as string;

      if (userId && dbKey) {
        await update(ref(db, `users/${userId}/favorites/${dbKey}`), {
          name: name,
          address: address,
          image: image,
          rating: rating
        });
        showMessage({ message: "Berhasil diperbarui!", type: "success" });
        router.back();
      }
    } catch (error) {
      showMessage({ message: "Gagal update data", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
            <Star 
              size={32} 
              color={star <= rating ? "#FFC107" : "#E0E0E0"} 
              fill={star <= rating ? "#FFC107" : "transparent"} 
              strokeWidth={star <= rating ? 0 : 2}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Favorit</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detail Lokasi</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Foto Lokasi</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imagePickerBtn} activeOpacity={0.8}>
              {imageLoading ? (
                <View style={styles.imagePlaceholder}>
                   <ActivityIndicator size="small" color={Colors.primary} />
                   <Text style={[styles.imagePlaceholderText, {marginTop: 8}]}>Memuat Foto...</Text>
                </View>
              ) : image ? (
                <Image source={{ uri: image }} style={styles.pickedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                   <Camera size={32} color={Colors.primary} strokeWidth={2} />
                   <Text style={styles.imagePlaceholderText}>Tambah Foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Tempat</Text>
            <View style={styles.inputWrapper}>
              <Tag size={20} color={Colors.primary} strokeWidth={2.5} />
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                placeholder="Contoh: Kopi Kenangan Mantan" 
                placeholderTextColor="#BCAAA4"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Alamat / Catatan</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={20} color={Colors.primary} strokeWidth={2.5} />
              <TextInput 
                style={styles.input} 
                value={address} 
                onChangeText={setAddress} 
                placeholder="Alamat lengkap atau catatan..." 
                placeholderTextColor="#BCAAA4"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rating</Text>
            <View style={styles.ratingWrapper}>
               {renderStars()}
               <Text style={styles.ratingText}>{rating > 0 ? `${rating}.0` : 'Belum ada rating'}</Text>
            </View>
          </View>

        </View>

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save size={20} color="white" strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingBottom: 20, 
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#8D6E63',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4
  },
  backBtn: { 
    padding: 10, borderRadius: 14, backgroundColor: '#FAFAFA', 
    borderWidth: 1, borderColor: '#F5F5F5' 
  },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: Colors.text },
  
  content: { padding: 20 },
  
  card: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    padding: 24, 
    shadowColor: '#8D6E63',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FAFAFA'
  },
  cardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, marginBottom: 16, color: Colors.text },
  
  inputGroup: { marginBottom: 16 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: Colors.text, marginBottom: 8 },
  
  inputWrapper: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#FAFAFA', 
    borderRadius: 16, 
    paddingHorizontal: 16, height: 54, 
    borderWidth: 1, borderColor: '#EEEEEE' 
  },
  input: { 
    flex: 1, marginLeft: 12, 
    fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 14, height: '100%' 
  },
  ratingWrapper: {
    alignItems: 'center', justifyContent: 'center', padding: 10,
    backgroundColor: '#FAFAFA', borderRadius: 16, borderWidth: 1, borderColor: '#EEEEEE'
  },
  starContainer: {
    flexDirection: 'row', gap: 8, marginBottom: 8
  },
  ratingText: {
    fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: Colors.textLight
  },

  imagePickerBtn: {
    width: '100%',
    height: 180,
    backgroundColor: '#FAFAFA',
    borderRadius: 16, 
    borderWidth: 1, borderColor: '#EEEEEE',
    borderStyle: 'dashed', 
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  pickedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 8,
    opacity: 0.6
  },
  imagePlaceholderText: {
    fontFamily: 'Poppins_500Medium',
    color: Colors.primary,
    fontSize: 14
  },
  
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: 'white', paddingTop: 20, paddingHorizontal: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 15
  },
  saveButton: { 
    backgroundColor: Colors.primary, height: 56, 
    borderRadius: 24, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, 
    shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
  },
  saveButtonText: { fontFamily: 'Poppins_600SemiBold', color: 'white', fontSize: 16 },
});