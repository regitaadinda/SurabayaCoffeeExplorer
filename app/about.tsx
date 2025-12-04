import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { ArrowLeft, MapPin, Award, User, BookOpen, Coffee } from 'lucide-react-native';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const InfoRow = ({ icon, label, value }: any) => (
    <View style={styles.row}>
      <View style={styles.iconBox}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
        <View style={{ width: 44 }} /> 
      </View>
      
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        
        <View style={styles.cardCenter}>
          <View style={styles.logoBadge}>
            <Coffee size={42} color="white" strokeWidth={2.5} />
          </View>
          <Text style={styles.appName}>Surabaya Coffee Explorer</Text>
          <Text style={styles.version}>Versi 1.0.0 (Beta)</Text>
          <Text style={styles.descText}>
            Solusi pintar pencarian kedai kopi di Surabaya dengan integrasi peta real-time.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Pengembang</Text>
          
          <InfoRow 
            icon={<User size={20} color={Colors.primary} strokeWidth={2.5} />} 
            label="Nama Lengkap" 
            value="Regita Adinda Sefty" 
          />
          <View style={styles.divider} />
          
          <InfoRow 
            icon={<Award size={20} color={Colors.primary} strokeWidth={2.5} />} 
            label="NIM" 
            value="23/515190/SV/22498" 
          />
          <View style={styles.divider} />
          
          <InfoRow 
            icon={<BookOpen size={20} color={Colors.primary} strokeWidth={2.5} />} 
            label="Mata Kuliah" 
            value="Praktikum Pemrograman Geospasial: Perangkat Bergerak Lanjut" 
          />
          <View style={styles.divider} />
          
          <InfoRow 
            icon={<MapPin size={20} color={Colors.primary} strokeWidth={2.5} />} 
            label="Wilayah Studi" 
            value="Surabaya, Jawa Timur" 
          />
        </View>

        <Text style={styles.copyright}>© 2025 Regita Adinda Sefty. All rights reserved.</Text>

      </ScrollView>
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
  
  cardCenter: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    padding: 30, 
    marginBottom: 20, 
    alignItems: 'center', 
    shadowColor: '#8D6E63',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FAFAFA'
  },
  logoBadge: { 
    width: 80, height: 80, 
    backgroundColor: Colors.primary, 
    borderRadius: 26, 
    justifyContent: 'center', alignItems: 'center', 
    marginBottom: 16, 
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5 
  },
  appName: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: Colors.text, textAlign: 'center' },
  version: { fontFamily: 'Poppins_500Medium', color: Colors.textLight, fontSize: 13, marginBottom: 16 },
  descText: { textAlign: 'center', fontFamily: 'Poppins_400Regular', color: Colors.textLight, lineHeight: 22, fontSize: 13 },
  
  card: { 
    backgroundColor: 'white', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 20, 
    shadowColor: '#8D6E63',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FAFAFA'
  },
  cardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, marginBottom: 20, color: Colors.text },
  
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  iconBox: { 
    width: 48, height: 48, 
    borderRadius: 16, 
    backgroundColor: '#FAFAFA', 
    justifyContent: 'center', alignItems: 'center', 
    marginRight: 16,
    borderWidth: 1, borderColor: '#F5F5F5'
  },
  infoContent: { flex: 1 },
  label: { fontFamily: 'Poppins_500Medium', fontSize: 11, color: Colors.textLight, textTransform: 'uppercase', marginBottom: 2 },
  value: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: Colors.text },
  
  divider: { height: 1, backgroundColor: '#FAFAFA', marginVertical: 12, marginLeft: 64 },
  
  copyright: { textAlign: 'center', fontFamily: 'Poppins_400Regular', color: '#BCAAA4', fontSize: 11, marginTop: 10 },
});