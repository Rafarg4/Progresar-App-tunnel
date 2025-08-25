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
        <Text style={styles.headerText}>Mis Tarjetas</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {tarjetas.map((tarjeta, index) => {
            const colorTarjeta = coloresTarjetas[index % coloresTarjetas.length];

            return (
              <View key={index} style={[styles.cardContainer, { backgroundColor: colorTarjeta }]}>
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
                  <FontAwesome5
                    name="credit-card"
                    size={120}
                    color="#fff"
                    style={styles.cardBackgroundIcon}
                  />

                  <View style={styles.cardIconContainer}>
                    <FontAwesome5 name="credit-card" size={28} color="#fff" />
                  </View>

                  <Text style={styles.cardBrand}>
                    {nombresTarjeta[tarjeta.clase_tarjeta] || 'Desconocido'}
                  </Text>
                  <Text style={styles.cardNumber}>{formatearNumero(tarjeta.nro_tarjeta)}</Text>
                  <Text style={styles.cardHolder}>{tarjeta.nombre_usuario}</Text>
                </TouchableOpacity>

                {/* Footer: botón de movimientos */}
                <TouchableOpacity
                  style={styles.cardFooter}
                  onPress={() => handleMovimientos(tarjeta)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="exchange-alt" size={14} color="#fff" style={{ marginRight: 5 }} />
                    <Text style={styles.cardFooterText}>Mis movimientos</Text>
                  </View>
                </TouchableOpacity>

              </View>
            );
          })}
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
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25
  },
  cardIconContainer: { marginBottom: 12, zIndex: 2 },
  cardBackgroundIcon: { position: 'absolute', top: 20, right: 20, opacity: 0.08, zIndex: 0 },
  headerImage: { width: Dimensions.get('window').width, height: 180 },
  headerText: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  scrollContainer: { padding: 20 },
  cardContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4
  },
  cardBrand: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  cardNumber: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 10 },
  cardHolder: { fontSize: 16, color: '#fff', fontWeight: '500' },
  cardFooter: { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)', paddingTop: 8 },
  cardFooterText: { color: '#fff', fontWeight: 'bold', fontSize: 14, textAlign: 'right', textDecorationLine: 'underline' }
});
