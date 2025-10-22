import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('transacciones'); // pestaña activa
  const obtenerNombreClase = (clase) => {
    switch (clase) {
      case 'TR':
        return 'La Trinidad';
      case 'V6':
        return 'Visa';
      case 'J7':
        return 'La Fep';
      case 'JM':
        return 'Clásica';
      case 'J0':
        return 'Empresarial';
      case 'RM':
        return 'Rotary';
      case 'EV':
        return 'El Viajero';
      case 'JW':
        return 'Mujer';
      case 'RC':
        return 'Rotary';
      case 'TS':
        return 'Comedi';
      default:
        return 'No definida';
    }
  };
  const tabs = [
    { id: 'transacciones', nombre: 'Transacciones' },
    { id: 'pagos', nombre: 'Débitos' },
    { id: 'adelantos', nombre: 'Adelantos' },
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuario = await AsyncStorage.getItem('usuarioGuardado');
        if (!usuario) return;

        const response = await fetch(`https://api.progresarcorp.com.py/api/notificaciones/${usuario}`);
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

  // ✅ Formatear hora tipo 181515 → 18:15:15
  const formatearHora = (horaStr) => {
    if (!horaStr) return '';
    horaStr = String(horaStr).padStart(6, '0');
    const hh = horaStr.substring(0, 2);
    const mm = horaStr.substring(2, 4);
    const ss = horaStr.substring(4, 6);
    return `${hh}:${mm}:${ss}`;
  };

  // ✅ Filtrar según la categoría seleccionada
  const filtrarNotificaciones = () => {
    if (categoria === 'pagos') {
      return notificaciones.filter((n) => String(n.tipotransaccion) === '0');
    }
    if (categoria === 'adelantos') {
      return notificaciones.filter((n) => String(n.tipotransaccion) === '1');
    }
    return notificaciones; // todas
  };

  const renderTab = (tab) => (
    <TouchableOpacity
      key={tab.id}
      style={[styles.tabButton, categoria === tab.id && styles.tabButtonActive]}
      onPress={() => setCategoria(tab.id)}
    >
      <Text style={[styles.tabText, categoria === tab.id && styles.tabTextActive]}>
        {tab.nombre}
      </Text>
    </TouchableOpacity>
  );

  const renderNotificacion = (n, i) => {
    const esAdelanto = String(n.tipotransaccion) === '1';
    const iconName = esAdelanto ? 'university' : 'money-bill-wave';
    const titulo = esAdelanto ? 'Adelanto en efectivo' : 'Débito en Tarjeta';
    const colorIcono = esAdelanto ? '#004d99' : '#9e2021';
    const colorLinea = esAdelanto ? '#004d99' : '#d10000';

    return (
      <View key={i} style={styles.notificationCard}>
        {/* Columna del ícono y línea */}
        <View style={styles.iconColumn}>
          <View style={[styles.iconCircle, { backgroundColor: colorIcono }]}>
            <FontAwesome5 name={iconName} size={16} color="#fff" />
          </View>
          <View style={[styles.verticalLine, { backgroundColor: colorLinea }]} />
        </View>

        {/* Contenido principal */}
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{titulo} - {obtenerNombreClase(n.clasetarjeta)}</Text>
          <Text numberOfLines={1} style={styles.notificationConcepto}>
            {n.descripcion}
          </Text>
          <Text numberOfLines={1} style={styles.notificationSubtext}>
            {n.nombrecomercio}
          </Text>
          <Text style={styles.notificationMonto}>
            - {parseInt(n.importe).toLocaleString('es-PY')} Gs.
          </Text>
        </View>

        {/* Fecha y hora */}
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
      {/* Cabecera */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/inicio.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerText}>Notificaciones</Text>
          <Text style={styles.headerSubtitle}>
            Visualizá tus últimos pagos y adelantos de manera rápida y ordenada.
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>{tabs.map(renderTab)}</View>

      {/* Contenido */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9e2021" />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {notificacionesFiltradas.length > 0 ? (
            notificacionesFiltradas.map(renderNotificacion)
          ) : (
            <Text style={styles.noDataText}>No hay notificaciones disponibles.</Text>
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
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerImage: { width: Dimensions.get('window').width, height: 160 },
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
    marginTop: 4,
    opacity: 0.9,
  },

  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#f5f6f8',
    paddingVertical: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 6,
    backgroundColor: '#e6e6e6',
  },
  tabButtonActive: {
    backgroundColor: '#9e2021',
  },
  tabText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },

  scrollContainer: { padding: 12 },

  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(158,32,33,0.15)',
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
    marginRight: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  verticalLine: {
    width: 2,
    height: 65,
    borderRadius: 2,
    opacity: 0.6,
  },

  notificationContent: { flex: 1 },
  notificationTitle: { fontWeight: 'bold', color: '#9e2021', marginBottom: 3, fontSize: 15 },
  notificationConcepto: { color: '#333', fontSize: 13 },
  notificationSubtext: { color: '#666', fontSize: 12.5 },
  notificationMonto: {
    color: '#d10000',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 6,
  },

  notificationRight: { alignItems: 'flex-end', justifyContent: 'center' },
  notificationFecha: { color: '#777', fontSize: 12 },
  notificationHora: { color: '#777', fontSize: 12, marginTop: 2 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9e2021', marginTop: 8 },
  noDataText: {
    color: '#555',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14,
  },
});
