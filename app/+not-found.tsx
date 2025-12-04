import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { AlertCircle } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <AlertCircle size={64} color={Colors.primary} style={{ marginBottom: 20 }} />
        <Text style={styles.title}>Halaman Tidak Ditemukan</Text>
        <Text style={styles.desc}>Sepertinya Anda tersesat saat mencari kopi.</Text>
        
        <Link href="/" asChild>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textLight,
    marginBottom: 30,
    textAlign: 'center',
  },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Poppins_600SemiBold',
  },
});