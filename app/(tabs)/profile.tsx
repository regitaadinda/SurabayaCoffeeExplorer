import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { Colors } from '../../constants/Colors';
import { Power, Settings, ChevronRight, BadgeCheck, FileText, Trash, User } from 'lucide-react-native';
import CustomAlert from '../../components/CustomAlert';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [logoutAlert, setLogoutAlert] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, `users/${user.uid}/profile`);
      const unsub = onValue(userRef, (snapshot) => {
        setProfile(snapshot.val());
      });
      return unsub;
    }
  }, []);

  const MenuItem = ({ icon, bg, label, desc, onPress, isDestructive = false }: any) => (
    <TouchableOpacity style={styles.menuItemCard} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        {icon}
      </View>
      
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, isDestructive && { color: Colors.error }]}>{label}</Text>
        {desc && <Text style={styles.menuDesc} numberOfLines={1}>{desc}</Text>}
      </View>
      
      <ChevronRight size={20} color="#D7CCC8" strokeWidth={2.5} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      
      <View style={styles.headerCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarPlaceholder}>
             {profile?.username ? (
                <Text style={styles.avatarText}>{profile.username.charAt(0).toUpperCase()}</Text>
             ) : (
                <User size={28} color="white" strokeWidth={2.5} />
             )}
          </View>
        </View>
        
        <View style={styles.headerInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
             <Text style={styles.name} numberOfLines={1}>{profile?.username || 'Pengguna'}</Text>
             <BadgeCheck size={16} color="#388E3C" fill="#E8F5E9" />
          </View>
          
          <Text style={styles.email} numberOfLines={1}>{auth.currentUser?.email}</Text>
          
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Akun Terverifikasi</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Akun Saya</Text>
          
          <MenuItem 
            icon={<Settings size={22} color={Colors.primary} strokeWidth={2.5} />}
            bg="#EFEBE9" 
            label="Sunting Profil"
            desc="Kelola detail data diri & keamanan"
            onPress={() => router.push('/edit-profile')}
          />
          
          <MenuItem 
            icon={<FileText size={22} color="#EF6C00" strokeWidth={2.5} />}
            bg="#FFF3E0" 
            label="Informasi Aplikasi"
            desc="Versi 1.0.0 • Info Pengembang"
            onPress={() => router.push('/about')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Keamanan</Text>
          
          <MenuItem 
            icon={<Power size={22} color="#D32F2F" strokeWidth={2.5} />}
            bg="#FFEBEE"
            label="Keluar"
            desc="Akhiri sesi masuk saat ini"
            onPress={() => setLogoutAlert(true)}
            isDestructive
          />
          
          <MenuItem 
            icon={<Trash size={22} color="#C62828" strokeWidth={2.5} />}
            bg="#FFEBEE"
            label="Hapus Akun"
            desc="Menghapus data secara permanen"
            onPress={() => router.push('/delete-account')}
            isDestructive
          />
        </View>

      </ScrollView>

      <CustomAlert 
        visible={logoutAlert}
        type="warning"
        title="Konfirmasi Logout"
        message="Anda harus login kembali untuk mengakses fitur aplikasi ini."
        confirmText="Ya, Keluar"
        onCancel={() => setLogoutAlert(false)}
        onConfirm={() => {
          setLogoutAlert(false);
          signOut(auth);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  scrollContent: { paddingBottom: 7, paddingTop: 4 }, 
  
  headerCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 20, 
    marginHorizontal: 20, 
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 24, 
    shadowColor: '#8D6E63', 
    shadowOpacity: 0.1, 
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  avatarWrapper: { marginRight: 16 },
  avatarPlaceholder: {
    width: 64, 
    height: 64, 
    borderRadius: 22, 
    backgroundColor: Colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3
  },
  avatarText: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: 'white' },
  
  headerInfo: { flex: 1, alignItems: 'flex-start' },
  name: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: Colors.text },
  email: { fontFamily: 'Poppins_500Medium', color: Colors.textLight, fontSize: 13, marginBottom: 8 },
  
  roleBadge: { 
    backgroundColor: '#EFEBE9', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8, 
  },
  roleText: { color: Colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 10, letterSpacing: 0.5 },

  section: { marginBottom: 8 },
  sectionHeader: { 
    fontFamily: 'Poppins_600SemiBold', 
    fontSize: 13, 
    color: Colors.textLight, 
    marginBottom: 12, 
    marginLeft: 24, 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },

  menuItemCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 14, 
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8D6E63',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FAFAFA'
  },
  
  iconBox: { 
    width: 50, 
    height: 50, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  
  menuContent: { flex: 1, justifyContent: 'center' },
  menuTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: Colors.text, marginBottom: 2 },
  menuDesc: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: Colors.textLight },
});