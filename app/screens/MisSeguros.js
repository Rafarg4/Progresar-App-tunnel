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
      {/* Header con subtítulo */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/inicio.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerText}>Mis Seguros</Text>
          <Text style={styles.headerSubtitle}>Visualizá tus pólizas y coberturas vigentes</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9e2021" />
          <Text style={styles.loadingText}>Cargando tus seguros...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {seguros.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesome5 name="shield-alt" size={40} color="#9e2021" style={{ marginBottom: 10 }} />
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
              const key = `${seguro.id || 'seg'}-${index}`;
              return (
                <View key={key} style={styles.cardContainer}>
                  {/* Ícono de fondo */}
                  <FontAwesome5
                    name="shield-alt"
                    size={Dimensions.get('window').width * 0.35}
                    color="rgba(158,32,33,0.25)"
                    style={styles.cardBackgroundIcon}
                  />

                  {/* Ícono superior */}
                  <View style={styles.cardIconContainer}>
                    <FontAwesome5 name="shield-alt" size={24} color="#9e2021" />
                  </View>

                  {/* Datos del seguro */}
                  <Text style={styles.cardBrand}>{seguro.tipo_seguro}</Text>
                  <Text style={styles.cardDetail}>Nro. Documento: {seguro.numero}</Text>
                  <Text style={styles.cardDetail}>Aseguradora: {seguro.aseguradora}</Text>
                  <Text style={styles.cardDetail}>Desde: {seguro.fec_inicial}</Text>
                  <Text style={styles.cardDetail}>Hasta: {seguro.vencimiento}</Text>
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
    borderBottomRightRadius: 25,
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
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 13.5,
    marginTop: 3,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9e2021', marginTop: 10, fontWeight: '500' },

  scrollContainer: { padding: 16 },

  cardContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(158,32,33,0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardBackgroundIcon: {
    position: 'absolute',
    right: 1,
    bottom: 28,
    opacity: 0.18,
    zIndex: 0,
  },
  cardIconContainer: { marginBottom: 10, zIndex: 2 },

  cardBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9e2021',
    marginBottom: 10,
  },
  cardDetail: {
    fontSize: 14,
    color: '#9e2021',
    marginBottom: 3,
    fontWeight: '500',
  },

  // Estado vacío
  emptyCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9e2021',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13.5,
    color: '#555',
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9e2021',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#9e2021',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  emptyButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },
});
