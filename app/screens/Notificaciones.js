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
import { formatGs } from '../components/WalletCard';
import BottomNav from '../components/BottomNav';

const tabs = [
  { id: 'transacciones', nombre: 'Transacciones' },
  { id: 'pagos', nombre: 'Débitos' },
  { id: 'adelantos', nombre: 'Adelantos' },
];

export default function Notificaciones() {
  const navigation = useNavigation();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('transacciones');
  const [usuario, setUsuario] = useState('');

  const obtenerNombreClase = (clase) => {
    switch (clase) {
      case 'TR': return 'La Trinidad';
      case 'V6': return 'Visa';
      case 'J7': return 'La Fep';
      case 'JM': return 'Clásica';
      case 'J0': return 'Empresarial';
      case 'RM': return 'Rotary';
      case 'EV': return 'El Viajero';
      case 'JW': return 'Mujer';
      case 'RC': return 'Rotary';
      case 'TS': return 'Comedi';
      default: return 'No definida';
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const doc = await AsyncStorage.getItem('usuarioGuardado');
        if (!doc) return;
        setUsuario(doc);

        const response = await fetch(`https://api.progresarcorp.com.py/api/notificaciones/${doc}`);
        const data = await response.json();
        setNotificaciones(data);
      } catch (error) {
        console.log('Error al cargar notificaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const formatearHora = (horaStr) => {
    if (!horaStr) return '';
    horaStr = String(horaStr).padStart(6, '0');
    return `${horaStr.substring(0, 2)}:${horaStr.substring(2, 4)}:${horaStr.substring(4, 6)}`;
  };

  const filtrarNotificaciones = () => {
    if (categoria === 'pagos') return notificaciones.filter((n) => String(n.tipotransaccion) === '0');
    if (categoria === 'adelantos') return notificaciones.filter((n) => String(n.tipotransaccion) === '1');
    return notificaciones;
  };

  const renderNotificacion = (n, i) => {
    const tipo = String(n.tipotransaccion);

    // Caso especial: tipo 50 (Crédito / Operación exitosa)
    if (tipo === '50') {
      return (
        <View key={i} style={styles.notificationCard}>
          <View style={styles.iconColumn}>
            <View style={[styles.iconCircle, { backgroundColor: '#3f8f5f' }]}>
              <FontAwesome5 name="check-circle" size={16} color="#fff" />
            </View>
            <View style={[styles.verticalLine, { backgroundColor: '#3f8f5f' }]} />
          </View>

          <View style={styles.notificationContent}>
            <Text style={[styles.notificationTitle, { color: '#3f8f5f' }]}>
              Su pago, Gracias - {obtenerNombreClase(n.clasetarjeta)}
            </Text>
            <Text numberOfLines={1} style={styles.notificationConcepto}>
              {n.descripcion}
            </Text>
            <Text numberOfLines={1} style={styles.notificationSubtext}>
              {n.nombrecomercio}
            </Text>
            <Text style={[styles.notificationMonto, { color: '#3f8f5f' }]}>
              {formatGs(n.importe)}
            </Text>
          </View>

          <View style={styles.notificationRight}>
            <Text style={styles.notificationFecha}>{n.fecha}</Text>
            <Text style={styles.notificationHora}>{formatearHora(n.hora)}</Text>
          </View>
        </View>
      );
    }

    // Débitos & Adelantos
    const esAdelanto = tipo === '1';
    const iconName = esAdelanto ? 'university' : 'credit-card';
    const titulo = esAdelanto ? 'Adelanto en efectivo' : 'Débito en Tarjeta';
    const colorIcono = esAdelanto ? '#4d7ea8' : '#9e2021';

    return (
      <View key={i} style={styles.notificationCard}>
        <View style={styles.iconColumn}>
          <View style={[styles.iconCircle, { backgroundColor: colorIcono }]}>
            <FontAwesome5 name={iconName} size={16} color="#fff" />
          </View>
          <View style={[styles.verticalLine, { backgroundColor: colorIcono }]} />
        </View>

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{titulo} - {obtenerNombreClase(n.clasetarjeta)}</Text>
          <Text numberOfLines={1} style={styles.notificationConcepto}>{n.descripcion}</Text>
          <Text numberOfLines={1} style={styles.notificationSubtext}>{n.nombrecomercio}</Text>
          <Text style={styles.notificationMonto}>-{formatGs(n.importe)}</Text>
        </View>

        <View style={styles.notificationRight}>
          <Text style={styles.notificationFecha}>{n.fecha}</Text>
          <Text style={styles.notificationHora}>{formatearHora(n.hora)}</Text>
        </View>
      </View>
    );
  };

  const notificacionesFiltradas = filtrarNotificaciones();

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
          <Text style={styles.headerTitle}>Transacciones</Text>
          <Text style={styles.headerSubtitle}>
            Visualizá tus últimos movimientos de manera rápida y ordenada.
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, categoria === tab.id && styles.tabButtonActive]}
              onPress={() => setCategoria(tab.id)}
            >
              <Text style={[styles.tabText, categoria === tab.id && styles.tabTextActive]}>
                {tab.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9e2021" />
            <Text style={styles.loadingText}>Cargando notificaciones...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {notificacionesFiltradas.length > 0 ? (
              notificacionesFiltradas.map(renderNotificacion)
            ) : (
              <Text style={styles.noDataText}>No hay notificaciones disponibles.</Text>
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
    paddingTop: 18,
  },

  // 🔹 Tabs
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  tabButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: 'rgba(158,32,33,0.08)',
  },
  tabButtonActive: { backgroundColor: '#9e2021' },
  tabText: { color: '#9e2021', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  scrollContainer: { paddingHorizontal: 16, paddingBottom: 140 },

  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#efe1e0',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconColumn: { alignItems: 'center', marginRight: 14 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  verticalLine: { width: 2, height: 65, borderRadius: 2, opacity: 0.3 },

  notificationContent: { flex: 1 },
  notificationTitle: { fontWeight: 'bold', color: '#9e2021', marginBottom: 3, fontSize: 14.5 },
  notificationConcepto: { color: '#241a1a', fontSize: 13 },
  notificationSubtext: { color: '#6b5c5d', fontSize: 12.5 },
  notificationMonto: { color: '#9e2021', fontWeight: 'bold', fontSize: 14, marginTop: 6 },

  notificationRight: { alignItems: 'flex-end', justifyContent: 'center' },
  notificationFecha: { color: '#6b5c5d', fontSize: 12 },
  notificationHora: { color: '#6b5c5d', fontSize: 12, marginTop: 2 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9e2021', marginTop: 8 },
  noDataText: { color: '#6b5c5d', textAlign: 'center', marginTop: 30, fontSize: 14 },
});
