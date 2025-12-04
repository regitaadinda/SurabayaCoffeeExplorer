import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import { useRouter, Link } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowRight, Coffee } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage({ message: "Gagal", description: "Email dan Password wajib diisi.", type: "warning" });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage({ message: "Selamat Datang Kembali!", type: "success" });
    } catch (error: any) {
      showMessage({ message: "Login Gagal", description: "Email atau password salah.", type: "danger" });
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
            <Text style={styles.welcomeText}>Surabaya Coffee</Text>
            <Text style={styles.subText}>Jelajahi kenikmatan kopi di setiap sudut kota.</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.textLight} />
                <TextInput 
                  style={styles.input} 
                  placeholder="ngopi@surabaya.com" 
                  placeholderTextColor={Colors.textLight}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.textLight} />
                <TextInput 
                  style={styles.input} 
                  placeholder="••••••" 
                  placeholderTextColor={Colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Masuk</Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Daftar</Text>
              </TouchableOpacity>
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
  
  headerSection: { marginBottom: 40, alignItems: 'center' },
  logoBadge: { width: 70, height: 70, backgroundColor: Colors.primary, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 8, shadowColor: Colors.primary, shadowOpacity: 0.4 },
  welcomeText: { fontFamily: 'Poppins_700Bold', fontSize: 26, color: Colors.text, textAlign: 'center' },
  subText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: Colors.textLight, textAlign: 'center', marginTop: 8 },
  
  formSection: { width: '100%' },
  inputContainer: { marginBottom: 18 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: Colors.text, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#D7CCC8' },
  input: { flex: 1, marginLeft: 12, fontFamily: 'Poppins_500Medium', color: Colors.text, height: '100%' },
  
  loginBtn: { backgroundColor: Colors.primary, height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 5, marginTop: 10 },
  loginBtnText: { fontFamily: 'Poppins_600SemiBold', color: 'white', fontSize: 16 },
  
  footer: { marginTop: 40, flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontFamily: 'Poppins_400Regular', color: Colors.textLight },
  registerLink: { fontFamily: 'Poppins_700Bold', color: Colors.primary },
});