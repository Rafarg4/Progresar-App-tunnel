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
import { useNavigation } from '@react-navigation/native';

export default function MisElectrodomesticos() {
  const [electros, setElectros] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const cargarElectros = async () => {
    try {
      setLoading(true);
      const usuario = await AsyncStorage.getItem('usuarioGuardado');
      if (!usuario) {
        console.log('Usuario no encontrado');
        setElectros([]);
        return;
      }
      const response = await fetch(`https://api.progresarcorp.com.py/api/ver_electrodomesticos/${usuario}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setElectros(data);
      } else if (data && data.nro_comprobante) {
        setElectros([data]);
      } else {
        setElectros([]);
      }
    } catch (error) {
      console.log('Error al obtener electrodomésticos:', error);
      Alert.alert('Error', 'No se pudieron cargar los electrodomésticos.');
      setElectros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarElectros();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header con subtítulo */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/Electro.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerText}>Mis Electrodomésticos</Text>
          <Text style={styles.headerSubtitle}>Visualizá tus compras y cuotas vigentes</Text>
        </View>
      </View>

      {/* Contenido */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9e2021" />
          <Text style={styles.loadingText}>Cargando tus electrodomésticos...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {electros.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesome5 name="inbox" size={40} color="#9e2021" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyTitle}>Sin Electrodomésticos</Text>
              <Text style={styles.emptyText}>
                No encontramos electrodomésticos asociados a tu usuario por ahora.
              </Text>

              <TouchableOpacity style={styles.emptyButton} onPress={cargarElectros}>
                <FontAwesome5 name="redo" size={16} color="#fff" />
                <Text style={styles.emptyButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            electros.map((item, index) => {
              const key = `${item.cod_cliente || 'cli'}-${item.nro_comprobante || index}-${index}`;
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.cardContainer}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('DetalleElectro', {
                      cod_cliente: item.cod_cliente,
                      nro_comprobante: item.nro_comprobante,
                      nro_cuota: item.nro_cuota
                    })
                  }
                >
                  {/* Ícono de fondo */}
                  <FontAwesome5
                    name="tv"
                    size={Dimensions.get('window').width * 0.35}
                    color="rgba(158,32,33,0.25)"
                    style={styles.cardBackgroundIcon}
                  />

                  {/* Ícono principal */}
                  <View style={styles.cardIconContainer}>
                    <FontAwesome5 name="tv" size={26} color="#9e2021" />
                  </View>

                  {/* Texto principal */}
                  <Text style={styles.cardBrand}>Comprobante #{item.nro_comprobante}</Text>
                  <Text style={styles.cardDetail}>Tipo: {item.tipo_comprobante || '-'} - Crédito</Text>
                  <Text style={styles.cardDetail}>Fecha origen: {item.fec_origen || '-'}</Text>
                  <Text style={styles.cardDetail}>Cuotas: {item.nro_cuota}</Text>
                  <Text style={styles.cardDetail}>
                    Monto total: {Number(item.monto_cuota || 0).toLocaleString()} Gs
                  </Text>
                  <Text style={styles.cardDetail}>
                    Saldo pendiente: {Number(item.saldo_cuota || 0).toLocaleString()} Gs
                  </Text>
                </TouchableOpacity>
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

  // HEADER
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

  // LOADING
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9e2021', marginTop: 10, fontWeight: '500' },

  // CONTENIDO
  scrollContainer: { padding: 16 },

  // TARJETAS
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
    right: 5,
    bottom: 30,
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

  // ESTADO VACÍO
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
