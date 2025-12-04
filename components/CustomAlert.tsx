import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
// ICONS: Update strokeWidth ke 2.5
import { AlertCircle, CheckCircle2, HelpCircle, Coffee } from 'lucide-react-native';

interface CustomAlertProps {
  visible: boolean;
  type: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  onCancel?: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function CustomAlert({ 
  visible, type, title, message, onCancel, onConfirm, confirmText = "Ya", cancelText = "Batal" 
}: CustomAlertProps) {
  
  const getIcon = () => {
    switch(type) {
      case 'danger': return <AlertCircle size={36} color={Colors.error} strokeWidth={2.5} />;
      case 'success': return <CheckCircle2 size={36} color={Colors.success} strokeWidth={2.5} />;
      case 'warning': return <HelpCircle size={36} color="#F57C00" strokeWidth={2.5} />;
      default: return <Coffee size={36} color={Colors.primary} strokeWidth={2.5} />;
    }
  };

  const getBgColor = () => {
    switch(type) {
      case 'danger': return '#FFEBEE';
      case 'success': return '#E8F5E9';
      case 'warning': return '#FFF3E0';
      default: return '#EFEBE9';
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        {/* CARD: Rounded 28 & Shadow */}
        <View style={styles.card}>
          
          {/* ICON: Squircle Shape */}
          <View style={[styles.iconContainer, { backgroundColor: getBgColor() }]}>
            {getIcon()}
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonRow}>
            {onCancel && (
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onCancel}>
                <Text style={styles.btnCancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.btn, type === 'danger' ? styles.btnDanger : styles.btnPrimary]} 
              onPress={onConfirm}
            >
              <Text style={styles.btnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(62, 39, 35, 0.5)', // Overlay coklat gelap transparan
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  
  card: { 
    backgroundColor: 'white', 
    borderRadius: 28, // Lebih rounded
    padding: 24, 
    width: '100%', 
    alignItems: 'center', 
    // Shadow Style
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  },
  
  iconContainer: { 
    marginBottom: 16, 
    padding: 16, 
    borderRadius: 22, // Squircle (bukan lingkaran sempurna)
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  title: { 
    fontFamily: 'Poppins_700Bold', 
    fontSize: 18, 
    color: Colors.text, 
    textAlign: 'center',
    marginBottom: 4
  },
  
  message: { 
    fontFamily: 'Poppins_400Regular', 
    fontSize: 14, 
    color: Colors.textLight, 
    textAlign: 'center', 
    marginBottom: 24,
    lineHeight: 22 
  },
  
  buttonRow: { 
    flexDirection: 'row', 
    gap: 12, 
    width: '100%' 
  },
  
  btn: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 20, // Hyper-rounded buttons
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 2
  },
  
  btnCancel: { 
    backgroundColor: '#FAFAFA', 
    borderWidth: 1, 
    borderColor: '#EEEEEE',
    elevation: 0 
  },
  
  btnPrimary: { 
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
  },
  
  btnDanger: { 
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
  },
  
  btnText: { color: 'white', fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  btnCancelText: { color: Colors.textLight, fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
});