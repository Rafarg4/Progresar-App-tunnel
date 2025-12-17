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

export default function Beneficios() {
  const [beneficios, setBeneficios] = useState([]);
  const [loading, setLoading] = useState(true);

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
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/inicio.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerText}>Beneficios</Text>
          <Text style={styles.headerSubtitle}>
            Promociones y ventajas exclusivas para vos.
          </Text>
        </View>
      </View>

      {/* CONTENIDO */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7cff" />
          <Text style={styles.loadingText}>Cargando beneficios...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {beneficios.length > 0 ? (
            beneficios.map(renderBeneficio)
          ) : (
            <Text style={styles.noDataText}>
              No hay beneficios disponibles.
            </Text>
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
  headerImage: {
    width: Dimensions.get('window').width,
    height: 160
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16
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
    opacity: 0.9
  },

  scrollContainer: { padding: 12 },

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
    color: '#0a7cff',
    marginTop: 8
  },
  noDataText: {
    color: '#555',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14
  },
});
