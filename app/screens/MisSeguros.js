import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MisSeguros() {
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);

  const coloresTarjetas = ['#FF6F61', '#26A69A', '#5C6BC0', '#FFA726', '#8D6E63'];

  const cargarSeguros = async () => {
    try {
      setLoading(true);
      const usuario = await AsyncStorage.getItem('usuarioGuardado');
      if (!usuario) {
        console.log('Usuario no encontrado');
        setSeguros([]);
        return;
      }

      const response = await fetch(`https://api.progresarcorp.com.py/api/ver_seguros/${usuario}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setSeguros(data);
      } else if (data && data.id) {
        setSeguros([data]);
      } else {
        setSeguros([]);
      }
    } catch (error) {
      console.log('Error al obtener seguros:', error);
      Alert.alert('Error', 'No se pudieron cargar los seguros.');
      setSeguros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSeguros();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/08/inicio.png' }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <Text style={styles.headerText}>Mis Seguros</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {seguros.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesome5 name="shield-alt" size={40} color="#FF6F61" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyTitle}>Sin seguros registrados</Text>
              <Text style={styles.emptyText}>
                No encontramos seguros asociados a tu usuario por ahora.
              </Text>

              <TouchableOpacity style={styles.emptyButton} onPress={cargarSeguros}>
                <FontAwesome5 name="redo" size={16} color="#fff" />
                <Text style={styles.emptyButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            seguros.map((seguro, index) => {
              const colorTarjeta = coloresTarjetas[index % coloresTarjetas.length];
              const key = `${seguro.id || 'seg'}-${index}`;

              return (
                <View key={key} style={[styles.cardContainer, { backgroundColor: colorTarjeta }]}>
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
                  <Text style={styles.cardDetail}>
                    Desde: {seguro.fec_inicial}
                  </Text>
                  <Text style={styles.cardDetail}>
                    Hasta: {seguro.vencimiento}
                  </Text>
                  <Text style={styles.cardDetail}>
                    Monto asegurado: {Number(seguro.monto_seguro || 0).toLocaleString()} Gs
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25
  },
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

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  scrollContainer: { padding: 20 },

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
  cardIconContainer: { marginBottom: 12, zIndex: 2 },
  cardBackgroundIcon: { position: 'absolute', top: 20, right: 20, opacity: 0.08, zIndex: 0 },
  cardBrand: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  cardNumber: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  cardHolder: { fontSize: 16, color: '#fff', marginBottom: 4 },
  cardDetail: { fontSize: 14, color: '#fff', marginBottom: 2 },
  cardEstado: { marginTop: 10, fontSize: 14, fontWeight: 'bold' },

  // Estado vacío
  emptyCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 14 },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6F61',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
});
