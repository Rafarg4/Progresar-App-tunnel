import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Alert, ScrollView } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';

const AtmQr = () => {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const u = await AsyncStorage.getItem('usuarioGuardado');
        if (!u) {
          Alert.alert('Atención', 'No se encontró el usuario en el almacenamiento.');
        }
        setUsuario(u);
      } catch (e) {
        console.log('Error leyendo AsyncStorage:', e);
        Alert.alert('Error', 'No se pudo obtener el usuario.');
      } finally {
        setLoading(false);
      }
    };
    cargarUsuario();
  }, []);

  const handleStart = () => {
    if (!usuario) {
      Alert.alert('Falta usuario', 'No se puede continuar sin el usuario.');
      return;
    }
    navigation.navigate('AdelantoQr', { num_doc: String(usuario) });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <ImageBackground
          source={require('../assets/inicio_nuevo.png')}
          style={styles.headerBackground}
          imageStyle={styles.headerImage}
        >
          <View style={styles.headerOverlay} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={16} color="#9e2021" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Adelanto en ATM</Text>
            <Text style={styles.headerSubtitle}>Retirá tu adelanto sin tarjeta</Text>
          </View>
        </ImageBackground>

        <View style={styles.sheet}>
          <View style={styles.sectionCard}>
            <View style={styles.step}>
              <FontAwesome name="qrcode" size={30} color="#9e2021" />
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Paso 1: </Text>Escanear QR generado por el cajero
              </Text>
            </View>

            <View style={styles.step}>
              <FontAwesome name="credit-card" size={26} color="#9e2021" />
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Paso 2: </Text>Seleccionar la cuenta de la cual quiera realizar el adelanto
              </Text>
            </View>

            <View style={styles.step}>
              <FontAwesome name="money" size={26} color="#9e2021" />
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Paso 3: </Text>Seleccionar el monto en el ATM
              </Text>
            </View>

            <View style={styles.step}>
              <FontAwesome name="check" size={26} color="#9e2021" />
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Paso 4: </Text>Retirar el dinero
              </Text>
            </View>

            <View style={[styles.step, { marginBottom: 0 }]}>
              <FontAwesome name="exclamation-triangle" size={26} color="#9e2021" />
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Nota: </Text>Este apartado solo realiza la autenticación al ATM; no quedarán registrados los movimientos.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleStart} activeOpacity={0.85}>
            <FontAwesome name="qrcode" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.submitButtonText}>Iniciar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav usuario={usuario} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // 🔹 Encabezado
  headerBackground: {
    width: '100%',
    paddingTop: 60,
    paddingHorizontal: 0,
    paddingBottom: 40,
  },
  headerImage: {},
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(36,16,18,0.25)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
    opacity: 0.95,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // 🔹 Hoja de contenido
  sheet: {
    backgroundColor: '#faf6f5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 20,
    paddingHorizontal: 16,
  },

  // 🔹 Card de sección
  sectionCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepText: { flex: 1, marginLeft: 12, fontSize: 13.5, color: '#241a1a' },
  stepBold: { fontWeight: 'bold', color: '#9e2021' },

  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#9e2021',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9e2021',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14.5,
  },
});

export default AtmQr;
