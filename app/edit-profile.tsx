import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { auth, db } from '../services/firebaseConfig';
import { ref, update, onValue } from 'firebase/database';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Colors } from '../constants/Colors';
import { showMessage } from 'react-native-flash-message';
import { ArrowLeft, Save, User, Lock, Mail, CheckCircle2 } from 'lucide-react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, `users/${user.uid}/profile`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setUsername(data.username || '');
      }, { onlyOnce: true });
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await update(ref(db, `users/${user.uid}/profile`), { username: username });

      if (newPassword) {
        if (!currentPassword) {
          showMessage({ message: "Gagal", description: "Masukkan password lama untuk konfirmasi.", type: "warning" });
          setLoading(false); return;
        }
        
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }

      showMessage({ message: "Sukses", description: "Profil berhasil diperbarui!", type: "success" });
      router.back();
    } catch (error: any) {
      showMessage({ message: "Gagal", description: "Cek kembali password lama Anda.", type: "danger" });
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
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Pribadi</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Terdaftar</Text>
            <View style={[styles.inputWrapper, { backgroundColor: '#F5F5F5', borderColor: 'transparent' }]}>
              <Mail size={20} color={Colors.textLight} />
              <TextInput 
                style={[styles.input, { color: Colors.textLight }]} 
                value={auth.currentUser?.email || ''} 
                editable={false} 
              />
              <CheckCircle2 size={18} color="#BDBDBD" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Pengguna</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color={Colors.primary} />
              <TextInput 
                style={styles.input} 
                value={username} 
                onChangeText={setUsername} 
                placeholder="Masukkan nama anda" 
                placeholderTextColor="#BCAAA4"
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Keamanan Akun</Text>
          <View style={styles.infoBox}>
             <Text style={styles.infoText}>Isi kolom di bawah ini HANYA jika Anda ingin mengubah kata sandi.</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kata Sandi Lama</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.textLight} />
              <TextInput 
                style={styles.input} 
                value={currentPassword} 
                onChangeText={setCurrentPassword} 
                placeholder="••••••••" 
                placeholderTextColor="#BCAAA4"
                secureTextEntry 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kata Sandi Baru</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.primary} />
              <TextInput 
                style={styles.input} 
                value={newPassword} 
                onChangeText={setNewPassword} 
                placeholder="Minimal 6 karakter" 
                placeholderTextColor="#BCAAA4"
                secureTextEntry 
              />
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
  
  infoBox: { 
    backgroundColor: '#FFF3E0', padding: 12, borderRadius: 12, marginBottom: 16,
    borderWidth: 1, borderColor: '#FFE0B2'
  },
  infoText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#E65100', lineHeight: 18 },
  
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