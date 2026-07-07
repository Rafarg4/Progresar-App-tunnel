import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { formatGs } from '../components/WalletCard';
import BottomNav from '../components/BottomNav';

export default function MisSeguros() {
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState('');
  const navigation = useNavigation();

  const cargarSeguros = async () => {
    try {
      setLoading(true);
      const doc = await AsyncStorage.getItem('usuarioGuardado');
      if (!doc) {
        console.log('Usuario no encontrado');
        setSeguros([]);
        return;
      }
      setUsuario(doc);

      const response = await fetch(`https://api.progresarcorp.com.py/api/ver_seguros/${doc}`);
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
          <Text style={styles.headerTitle}>Mis seguros</Text>
          <Text style={styles.headerSubtitle}>Visualizá tus pólizas y coberturas vigentes</Text>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9e2021" />
            <Text style={styles.loadingText}>Cargando tus seguros...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {seguros.length === 0 ? (
              <View style={styles.emptyCard}>
                <FontAwesome5 name="shield-alt" size={36} color="#9e2021" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>Sin seguros registrados</Text>
                <Text style={styles.emptyText}>
                  No encontramos seguros asociados a tu usuario por ahora.
                </Text>

                <TouchableOpacity style={styles.emptyButton} onPress={cargarSeguros}>
                  <FontAwesome5 name="redo" size={14} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.emptyButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              seguros.map((seguro, index) => {
                const key = `${seguro.id || 'seg'}-${index}`;
                return (
                  <View key={key} style={styles.seguroCard}>
                    <View style={styles.seguroHeader}>
                      <View style={styles.seguroIconBadge}>
                        <FontAwesome5 name="shield-alt" size={13} color="#9e2021" />
                      </View>
                      <Text style={styles.seguroTitle}>{seguro.tipo_seguro}</Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Nro. Documento</Text>
                      <Text style={styles.value}>{seguro.numero}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Aseguradora</Text>
                      <Text style={styles.value}>{seguro.aseguradora}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Desde</Text>
                      <Text style={styles.value}>{seguro.fec_inicial}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Hasta</Text>
                      <Text style={styles.value}>{seguro.vencimiento}</Text>
                    </View>
                    <View style={[styles.row, { marginBottom: 0 }]}>
                      <Text style={styles.label}>Monto asegurado</Text>
                      <Text style={[styles.value, styles.valuePositive]}>{formatGs(seguro.monto_seguro)}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      <BottomNav usuario={usuario} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // 🔹 Encabezado
  headerBackground: {
    paddingTop: 60,
    paddingHorizontal: 20,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    marginTop: 22,
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
    flex: 1,
    backgroundColor: '#faf6f5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 20,
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9e2021', marginTop: 10, fontWeight: '500' },

  scrollContainer: { padding: 16, paddingBottom: 140 },

  // 🔹 Cards de seguro
  seguroCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  seguroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  seguroIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(158,32,33,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  seguroTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#241a1a',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#6b5c5d',
  },
  value: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#241a1a',
  },
  valuePositive: {
    color: '#3f8f5f',
  },

  // 🔹 Estado vacío
  emptyCard: {
    borderRadius: 18,
    padding: 24,
    marginTop: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#241a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#6b5c5d',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9e2021',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#9e2021',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  emptyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
