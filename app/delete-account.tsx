import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { ArrowLeft, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react-native';
import { auth, db } from '../services/firebaseConfig';
import { deleteUser } from 'firebase/auth';
import { ref, remove } from 'firebase/database';
import { showMessage } from 'react-native-flash-message';
import CustomAlert from '../components/CustomAlert';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [confirmAlert, setConfirmAlert] = useState(false);

  const handleFinalDelete = async () => {
    setConfirmAlert(false);
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      await remove(ref(db, `users/${user.uid}`));
      await deleteUser(user);
      
      showMessage({ message: "Akun Berhasil Dihapus", description: "Terima kasih telah menggunakan aplikasi kami.", type: "success" });
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Gagal", "Demi keamanan, silakan Logout lalu Login kembali sebelum menghapus akun.");
      } else {
        showMessage({ message: "Gagal", description: error.message, type: "danger" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hapus Akun</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}>
        
        <View style={styles.cardCenter}>
          <View style={styles.warningIconWrapper}>
            <AlertTriangle size={32} color="#D32F2F" strokeWidth={2.5} />
          </View>
          <Text style={styles.warningTitle}>Tindakan Permanen</Text>
          <Text style={styles.warningDesc}>
            Akun yang dihapus tidak dapat dipulihkan kembali. Seluruh riwayat dan data favorit akan hilang selamanya.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Konsekuensi Penghapusan</Text>
          
          <View style={styles.listItem}>
            <CheckCircle2 size={20} color="#D32F2F" strokeWidth={2.5} />
            <Text style={styles.listText}>Profil dan Username akan dihapus permanen.</Text>
          </View>
          
          <View style={styles.listItem}>
            <CheckCircle2 size={20} color="#D32F2F" strokeWidth={2.5} />
            <Text style={styles.listText}>Semua daftar Coffee Shop favorit akan hilang.</Text>
          </View>
          
          <View style={styles.listItem}>
            <CheckCircle2 size={20} color="#D32F2F" strokeWidth={2.5} />
            <Text style={styles.listText}>Akses login akun ini akan ditutup selamanya.</Text>
          </View>
        </View>

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => setConfirmAlert(true)} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Trash2 size={20} color="white" strokeWidth={2.5} />
              <Text style={styles.deleteText}>Hapus Akun Permanen</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <CustomAlert 
        visible={confirmAlert}
        type="danger"
        title="Konfirmasi Akhir"
        message="Apakah Anda yakin? Data tidak bisa dikembalikan!"
        confirmText="Ya, Hapus"
        onCancel={() => setConfirmAlert(false)}
        onConfirm={handleFinalDelete}
      />
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
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#D32F2F' },
  
  content: { padding: 20 },

  cardCenter: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 20, 
    alignItems: 'center', 
    shadowColor: '#8D6E63',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1, 
    borderColor: '#FFEBEE'
  },
  warningIconWrapper: { 
    width: 64, height: 64, 
    backgroundColor: '#FFEBEE', 
    borderRadius: 22, 
    justifyContent: 'center', alignItems: 'center', 
    marginBottom: 16 
  },
  warningTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#D32F2F', marginBottom: 8 },
  warningDesc: { fontFamily: 'Poppins_400Regular', color: Colors.textLight, textAlign: 'center', lineHeight: 22, fontSize: 13 },

  card: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 20, 
    shadowColor: '#8D6E63',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FAFAFA'
  },
  cardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, marginBottom: 16, color: Colors.text },
  
  listItem: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  listText: { fontFamily: 'Poppins_400Regular', color: Colors.text, flex: 1, lineHeight: 20, fontSize: 13 },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: 'white', paddingTop: 20, paddingHorizontal: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 15
  },
  deleteButton: { 
    backgroundColor: '#D32F2F', height: 56, 
    borderRadius: 24, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, 
    shadowColor: '#D32F2F', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
  },
  deleteText: { fontFamily: 'Poppins_600SemiBold', color: 'white', fontSize: 16 },
});