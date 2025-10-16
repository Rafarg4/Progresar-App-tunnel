import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MisTarjetas() {
  const [tarjetas, setTarjetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const coloresTarjetas = ['#FF6F61', '#26A69A', '#5C6BC0', '#FFA726', '#8D6E63'];
  const nombresTarjeta = {
    JM: 'CLÁSICA',
    '1': 'DINELCO',
    TR: 'LA TRINIDAD',
    M2: 'PROGAR',
    J5: 'EDT',
    J0: 'EMPRESARIAL',
    JW: 'MUJER',
    FR: 'AFUNI',
    J7: 'FEP',
    RC: 'ROTARY',
    RM: 'ROTARY',
    V6: 'VISA',
    TS: 'COMEDI',
    LE: 'LINALU',
    EV: 'EL VIAJERO',
    EI: 'VISA EMPRESARIAL'
  };

  const navigation = useNavigation();

  useEffect(() => {
    const obtenerTarjetas = async () => {
      try {
        const usuario = await AsyncStorage.getItem('usuarioGuardado');
        if (!usuario) {
          console.log('Usuario no encontrado en el storage');
          setLoading(false);
          return;
        }
        const response = await fetch(`https://api.progresarcorp.com.py/api/ver_tarjeta/${usuario}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setTarjetas(data);
        } else if (data && data.nro_tarjeta) {
          setTarjetas([data]);
        }
      } catch (error) {
        console.log('Error al obtener tarjetas:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerTarjetas();
  }, []);

  // >>> AQUI la lógica para decidir la pantalla de movimientos
  const handleMovimientos = (t) => {
    const clase = String(t.clase_tarjeta || '');
    const routeName = clase === '1' ? 'DetaBepsa' : 'DetaProcard';
    navigation.navigate(routeName, { nro_tarjeta: t.nro_tarjeta });
  };

  return (
      <View style={styles.container}>
  <View style={styles.headerContainer}>
    <Image
      source={require('../assets/inicio.png')}
      style={styles.headerImage}
      resizeMode="cover"
    />
    <View style={styles.headerOverlay}>
      <Text style={styles.headerText}>Mis Tarjetas</Text>
      <Text style={styles.headerSubtitle}>Visualizá tus tarjetas y accedé a sus movimientos</Text>
    </View>
  </View>

  {loading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#9e2021" />
      <Text style={styles.loadingText}>Cargando tus tarjetas...</Text>
    </View>
  ) : (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {tarjetas.map((tarjeta) => (
        <View key={tarjeta.nro_tarjeta} style={styles.cardContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              const clase = String(tarjeta.clase_tarjeta ?? '');
              if (clase === '1') {
                navigation.navigate('DetalleBepsa', { nro_tarjeta: tarjeta.nro_tarjeta, tarjeta });
              } else {
                navigation.navigate('DetalleTarjetas', { tarjeta });
              }
            }}
          >
            {/* Ícono de fondo */}
            <FontAwesome5
              name="credit-card"
              size={Dimensions.get('window').width * 0.30} // 🔹 reducido 15%
              color="rgba(158,32,33,0.3)"
              style={styles.cardBackgroundIcon}
            />

            {/* Ícono principal */}
            <View style={styles.cardIconContainer}>
              <FontAwesome5 name="credit-card" size={24} color="#9e2021" />
            </View>

            {/* Texto principal */}
            <Text style={styles.cardBrand}>
              {nombresTarjeta[tarjeta.clase_tarjeta] || 'Desconocido'}
            </Text>
            <Text style={styles.cardNumber}>
              {formatearNumero(tarjeta.nro_tarjeta)}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cardHolder}>
              {tarjeta.nombre_usuario}
            </Text>
          </TouchableOpacity>

          {/* Botón */}
          <TouchableOpacity
            style={styles.cardFooterButton}
            onPress={() => handleMovimientos(tarjeta)}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="exchange-alt" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.cardFooterButtonText}>Mis movimientos</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  )}
</View>

  );
}

// Función para ocultar los dígitos del número de tarjeta
const formatearNumero = (numero) => {
  if (!numero || numero.length < 4) return numero;
  return '**** **** **** ' + numero.slice(-4);
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22
  },

  headerImage: { width: Dimensions.get('window').width, height: 170 },

  headerOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },

  headerText: {
    color: '#fff',
    fontSize: 22, // 🔹 antes 26
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  headerSubtitle: {
    color: '#fff',
    fontSize: 13.5, // 🔹 antes 15
    marginTop: 3,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  scrollContainer: { padding: 16 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9e2021', marginTop: 8, fontWeight: '500', fontSize: 13 },

  cardContainer: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(158,32,33,0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  cardBackgroundIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.18,
    zIndex: 0,
  },

  cardIconContainer: { marginBottom: 10, zIndex: 2 },

  cardBrand: {
    fontSize: 16, // 🔹 antes 18
    fontWeight: 'bold',
    color: '#9e2021',
    marginBottom: 12,
  },

  cardNumber: {
    fontSize: 17, // 🔹 antes 20
    fontWeight: '600',
    color: '#9e2021',
    marginBottom: 6,
  },

  cardHolder: {
    fontSize: 14.5, // 🔹 antes 16
    color: '#9e2021',
    fontWeight: '500',
    maxWidth: '90%',
  },

  cardFooterButton: {
    marginTop: 14,
    backgroundColor: '#9e2021',
    borderRadius: 26,
    paddingVertical: 10, // 🔹 antes 13
    width: '88%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#9e2021',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },

  cardFooterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14, // 🔹 antes 15
    letterSpacing: 0.4,
  },
});
