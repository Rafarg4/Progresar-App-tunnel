import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';

export default function Beneficios() {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState('');
  const [beneficios, setBeneficios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('usuarioGuardado')
      .then((doc) => doc && setUsuario(doc))
      .catch((e) => console.log('Error al obtener usuario:', e));
  }, []);

  useEffect(() => {
    const cargarBeneficios = async () => {
      try {
        const response = await fetch(
          'https://api.progresarcorp.com.py/api/ver_notificaciones_app'
        );
        const data = await response.json();
        setBeneficios(data);
      } catch (error) {
        console.log('Error al cargar beneficios:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarBeneficios();
  }, []);

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const f = new Date(fecha);
    return f.toLocaleDateString('es-PY');
  };

  const renderBeneficio = (b, i) => (
    <View key={i} style={styles.notificationCard}>
      {/* ICONO */}
      <View style={styles.iconColumn}>
        <View style={[styles.iconCircle, { backgroundColor: '#bf0404' }]}>
          <FontAwesome5 name="gift" size={16} color="#fff" />
        </View>
        <View style={[styles.verticalLine, { backgroundColor: '#bf0404' }]} />
      </View>

      {/* CONTENIDO */}
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>
          {b.titulo?.toUpperCase()}
         </Text>
        <Text style={styles.notificationConcepto}>
          {b.mensaje}
        </Text>
      </View>

      {/* FECHA */}
      <View style={styles.notificationRight}>
        <Text style={styles.notificationFecha}>
          {formatearFecha(b.created_at)}
        </Text>
      </View>
    </View>
  );

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
            <Text style={styles.headerTitle}>Beneficios</Text>
            <Text style={styles.headerSubtitle}>
              Promociones y ventajas exclusivas para vos
            </Text>
          </View>
        </ImageBackground>


        <View style={styles.sheet}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9e2021" />
              <Text style={styles.loadingText}>Cargando beneficios...</Text>
            </View>
          ) : beneficios.length > 0 ? (
            beneficios.map(renderBeneficio)
          ) : (
            <Text style={styles.noDataText}>
              No hay beneficios disponibles.
            </Text>
          )}
        </View>
      </ScrollView>

      <BottomNav usuario={usuario} />
    </View>
  );
}
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
    paddingTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },

  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(10,124,255,0.15)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },

  iconColumn: {
    alignItems: 'center',
    marginRight: 14
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  verticalLine: {
    width: 2,
    height: 65,
    borderRadius: 2,
    opacity: 0.5
  },

  notificationContent: { flex: 1 },
  notificationTitle: {
    fontWeight: 'bold',
    color: '#bf0404',
    marginBottom: 4,
    fontSize: 15
  },
  notificationConcepto: {
    color: '#333',
    fontSize: 13,
    lineHeight: 18
  },

  notificationRight: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  notificationFecha: {
    color: '#777',
    fontSize: 12
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#6b5c5d',
    marginTop: 8
  },
  noDataText: {
    color: '#555',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14
  },
});
