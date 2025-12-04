import { Tabs } from 'expo-router';
import { Map, Heart, User, Coffee } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const getIconContainerStyle = (focused: boolean) => ({
    backgroundColor: focused ? Colors.primary : 'transparent',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center' as 'center',
    justifyContent: 'center' as 'center',
    marginBottom: 4,
  });

  const CustomHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Surabaya Coffee</Text>
      </View>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true, 
        header: () => <CustomHeader />, 
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#A1887F',
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10, 
          shadowColor: '#8D6E63', 
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 }, 
          height: 70 + insets.bottom, 
          paddingBottom: insets.bottom + 10,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins_600SemiBold',
          fontSize: 10,
          marginTop: 2
        },
      }}
    >
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Simpan',
          tabBarIcon: ({ color, focused }) => (
            <View style={getIconContainerStyle(focused)}>
              <Heart 
                size={22} 
                color={focused ? '#FFFFFF' : color} 
                strokeWidth={2.5}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Peta',
          tabBarIcon: ({ color, focused }) => (
            <View style={getIconContainerStyle(focused)}>
              <Map 
                size={22}
                color={focused ? '#FFFFFF' : color} 
                strokeWidth={2.5}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View style={getIconContainerStyle(focused)}>
              <User 
                size={22} 
                color={focused ? '#FFFFFF' : color} 
                strokeWidth={2.5}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingBottom: 20,
    paddingHorizontal: 24,
    elevation: 8, 
    shadowColor: '#8D6E63',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, 
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: Colors.text,
    includeFontPadding: false,
    marginTop: 2, 
  },
});