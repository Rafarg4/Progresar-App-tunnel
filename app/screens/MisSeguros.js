import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MisSeguros() {
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);

  const coloresTarjetas = ['#FF6F61', '#26A69A', '#5C6BC0', '#FFA726', '#8D6E63'];

  useEffect(() => {
    const obtenerSeguros = async () => {
      try {
        const usuario = await AsyncStorage.getItem('usuarioGuardado');
        if (!usuario) {
          console.log('Usuario no encontrado');
          setLoading(false);
          return;
        }

        const response = await fetch(`https://api.progresarcorp.com.py/api/ver_seguros/${usuario}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setSeguros(data);
        } else if (data && data.id) {
          setSeguros([data]);
        }

      } catch (error) {
        console.log('Error al obtener seguros:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerSeguros();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/08/seguro.png' }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <Text style={styles.headerText}>Mis Seguros</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {seguros.map((seguro, index) => {
            const colorTarjeta = coloresTarjetas[index % coloresTarjetas.length];

            return (
              <View key={index} style={[styles.cardContainer, { backgroundColor: colorTarjeta }]}>
                {/* Ícono de fondo grande */}
                <FontAwesome5
                  name="shield-alt"
                  size={120}
                  color="#fff"
                  style={styles.cardBackgroundIcon}
                />

                {/* Ícono pequeño arriba */}
                <View style={styles.cardIconContainer}>
                  <FontAwesome5 name="shield-alt" size={28} color="#fff" />
                </View>

                <Text style={styles.cardBrand}>{seguro.tipo_seguro}</Text>
                <Text style={styles.cardNumber}>Nro. Documento: {seguro.numero}</Text>
                <Text style={styles.cardHolder}>Asegurado: {seguro.aseguradora}</Text>
                <Text style={styles.cardDetail}>Desde: {seguro.fec_inicial} - Hasta: {seguro.vencimiento}</Text>
                <Text style={styles.cardDetail}>Monto: {Number(seguro.monto_seguro).toLocaleString()} Gs</Text>
                <Text style={styles.cardDetail}>Prima: {Number(seguro.prima_seguro).toLocaleString()} Gs</Text>
                <Text style={[styles.cardEstado, { color: seguro.vencido === 'V' ? '#FFD54F' : '#C8E6C9' }]}>
                  Estado: {seguro.vencido === 'V' ? 'Vencido' : 'Activo'}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25
  },
  headerImage: {
    width: Dimensions.get('window').width,
    height: 180,
  },
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
  scrollContainer: {
    padding: 20
  },
  cardContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: 'relative'
  },
  cardIconContainer: {
    marginBottom: 12,
    zIndex: 2
  },
  cardBackgroundIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.08,
    zIndex: 0
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4
  },
  cardHolder: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4
  },
  cardDetail: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2
  },
  cardEstado: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold'
  }
});
