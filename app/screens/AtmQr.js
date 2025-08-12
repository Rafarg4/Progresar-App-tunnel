import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  // Enviar como nro_doc
  navigation.navigate('AdelantoQr', { nro_doc: String(usuario) });
};

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Cabecera con imagen como en otras pantallas */}
      <ImageBackground
        source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/08/inicio.png' }}
        style={styles.header}
        resizeMode="cover"
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <Text style={styles.headerTitle}>Adelanto en ATM</Text>
      </ImageBackground>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <FontAwesome name="qrcode" size={39} color="#bf0404" />
            <Text style={styles.stepText}>
              <Text style={styles.stepBold}>Paso 1:</Text> Escanear QR generado por el cajero
            </Text>
          </View>

          <View style={styles.step}>
            <FontAwesome name="credit-card" size={30} color="#bf0404" />
            <Text style={styles.stepText}>
              <Text style={styles.stepBold}>Paso 2:</Text> Seleccionar la cuenta de la cual quiera realizar el adelanto
            </Text>
          </View>

          <View style={styles.step}>
            <FontAwesome name="money" size={30} color="#bf0404" />
            <Text style={styles.stepText}>
              <Text style={styles.stepBold}>Paso 3:</Text> Seleccionar el monto en el ATM
            </Text>
          </View>

          <View style={styles.step}>
            <FontAwesome name="check" size={30} color="#bf0404" />
            <Text style={styles.stepText}>
              <Text style={styles.stepBold}>Paso 4:</Text> Retirar el dinero
            </Text>
          </View>

          <View style={styles.step}>
            <FontAwesome name="exclamation-triangle" size={30} color="#bf0404" />
            <Text style={styles.stepText}>
              <Text style={styles.stepBold}>Nota:</Text> Este apartado solo realiza la autenticación al ATM; no quedarán registrados los movimientos.
            </Text>
          </View>

          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (!usuario) {
                Alert.alert('Falta usuario', 'No se puede continuar sin el usuario.');
                return;
              }
              navigation.navigate('AdelantoQr', { num_doc: String(usuario) });
            }}
          >
            <FontAwesome name="qrcode" size={24} color="white" />
            <Text style={styles.buttonText}>Iniciar</Text>
          </TouchableOpacity>
          {usuario ? (
            <Text style={{ marginTop: 10, textAlign: 'center' }}>
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Cabecera
  header: { height: 160, justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 12 },
  headerImage: { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#fff', fontSize: 22, fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3
  },

  stepsContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepText: { marginLeft: 10, fontSize: 14 },
  stepBold: { fontWeight: 'bold', fontSize: 12 },
  separator: { height: 1, backgroundColor: '#ccc', marginVertical: 10, width: '100%' },
  button: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#bf0404',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: { color: 'white', fontSize: 16, marginLeft: 10 },
});

export default AtmQr;
