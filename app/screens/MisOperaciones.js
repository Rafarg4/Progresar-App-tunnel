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
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function MisOperaciones() {
  const [operaciones, setOperaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const sectores = {
    FRC: 'Francés',
    AME: 'Americano',
    FIS: 'Fisalco',
    DIR: 'Directo',
  };

  const cargarOperaciones = async () => {
    try {
      setLoading(true);
      const usuario = await AsyncStorage.getItem('usuarioGuardado');
      if (!usuario) {
        console.log('Usuario no encontrado');
        setOperaciones([]);
        return;
      }

      const response = await fetch(`https://api.progresarcorp.com.py/api/ver_operaciones/${usuario}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setOperaciones(data);
      } else if (data && data.nro_comprobante) {
        setOperaciones([data]);
      } else {
        setOperaciones([]);
      }
    } catch (error) {
      console.log('Error al obtener operaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las operaciones.');
      setOperaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOperaciones();
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
          <Text style={styles.headerText}>Mis Operaciones</Text>
          <Text style={styles.headerSubtitle}>Visualizá tus préstamos y su estado actual</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9e2021" />
          <Text style={styles.loadingText}>Cargando tus operaciones...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {operaciones.length === 0 ? (
            <View style={styles.emptyCard}>
              <FontAwesome5 name="inbox" size={40} color="#9e2021" style={{ marginBottom: 10 }} />
              <Text style={styles.emptyTitle}>Sin operaciones registradas</Text>
              <Text style={styles.emptyText}>
                No encontramos operaciones asociadas a tu usuario.
              </Text>

              <TouchableOpacity style={styles.emptyButton} onPress={cargarOperaciones}>
                <FontAwesome5 name="redo" size={16} color="#fff" />
                <Text style={styles.emptyButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            operaciones.map((op, index) => {
              const key = `${op.cod_cliente || 'cli'}-${op.nro_comprobante || index}-${index}`;
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.cardContainer}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('DetalleOperaciones', {
                      cod_cliente: op.cod_cliente,
                      nro_comprobante: op.nro_comprobante,
                    })
                  }
                >
                  {/* Ícono de fondo */}
                  <FontAwesome5
                    name="file-invoice-dollar"
                    size={Dimensions.get('window').width * 0.35}
                    color="rgba(158,32,33,0.25)"
                    style={styles.cardBackgroundIcon}
                  />

                  {/* Ícono principal */}
                  <View style={styles.cardIconContainer}>
                    <FontAwesome5 name="file-invoice-dollar" size={26} color="#9e2021" />
                  </View>

                  {/* Datos principales */}
                  <Text style={styles.cardBrand}>Operación #{op.nro_comprobante}</Text>
                  <Text style={styles.cardDetail}>
                    Método: {sectores[op.cod_sector] || op.cod_sector || '-'}
                  </Text>
                  <Text style={styles.cardDetail}>Cantidad de cuotas: {op.nro_cuota}</Text>
                  <Text style={styles.cardDetail}>Fecha de operación: {op.fec_origen}</Text>
                  <Text style={styles.cardDetail}>
                    Total operación: {Number(op.monto_cuota || 0).toLocaleString()} Gs
                  </Text>
                  <Text style={styles.cardDetail}>
                    Saldo pendiente: {Number(op.saldo_cuota || 0).toLocaleString()} Gs
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
    right: 10,
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
