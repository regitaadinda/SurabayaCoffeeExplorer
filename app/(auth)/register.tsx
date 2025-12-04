import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../../services/firebaseConfig';
import { useRouter, Link } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, ArrowRight, Coffee } from 'lucide-react-native';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      showMessage({ message: "Data Belum Lengkap", type: "warning" });
      return;
    }
    if (password !== confirmPassword) {
      showMessage({ message: "Password Tidak Cocok", type: "warning" });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await set(ref(db, 'users/' + user.uid + '/profile'), {
        username: username,
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      showMessage({ message: "Registrasi Berhasil!", type: "success" });
    } catch (error: any) {
      showMessage({ message: "Gagal", description: error.message, type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerSection}>
            <View style={styles.logoBadge}>
              <Coffee size={36} color="white" />
            </View>
            <Text style={styles.welcomeText}>Bergabung Sekarang</Text>
            <Text style={styles.subText}>Temukan kopi favoritmu di Surabaya.</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color={Colors.textLight} />
                <TextInput style={styles.input} placeholder="Nama Pengguna" placeholderTextColor={Colors.textLight} value={username} onChangeText={setUsername} />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.textLight} />
                <TextInput style={styles.input} placeholder="email@domain.com" placeholderTextColor={Colors.textLight} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.textLight} />
                <TextInput style={styles.input} placeholder="••••••" placeholderTextColor={Colors.textLight} value={password} onChangeText={setPassword} secureTextEntry />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Konfirmasi Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.textLight} />
                <TextInput style={styles.input} placeholder="••••••" placeholderTextColor={Colors.textLight} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              </View>
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.registerBtnText}>Daftar Akun</Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity><Text style={styles.loginLink}>Masuk</Text></TouchableOpacity>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 50, justifyContent: 'center', minHeight: '100%' },
  headerSection: { marginBottom: 30, alignItems: 'center' },
  logoBadge: { width: 70, height: 70, backgroundColor: Colors.primary, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 8 },
  welcomeText: { fontFamily: 'Poppins_700Bold', fontSize: 26, color: Colors.text, textAlign: 'center' },
  subText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: Colors.textLight, textAlign: 'center', marginTop: 8 },
  formSection: { width: '100%' },
  inputContainer: { marginBottom: 16 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: Colors.text, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#D7CCC8' },
  input: { flex: 1, marginLeft: 12, fontFamily: 'Poppins_500Medium', color: Colors.text, height: '100%' },
  registerBtn: { backgroundColor: Colors.primary, height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 5, marginTop: 10 },
  registerBtnText: { fontFamily: 'Poppins_600SemiBold', color: 'white', fontSize: 16 },
  footer: { marginTop: 30, flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontFamily: 'Poppins_400Regular', color: Colors.textLight },
  loginLink: { fontFamily: 'Poppins_700Bold', color: Colors.primary },
});