import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';

const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  const f = new Date(String(fecha).replace(' ', 'T'));
  if (isNaN(f.getTime())) return fecha;
  return f.toLocaleDateString('es-PY');
};

export default function Promociones() {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState('');
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [imagenesConError, setImagenesConError] = useState({});
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  const cargarPromociones = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('https://api.progresarcorp.com.py/api/ver_comercios_adheridos');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPromociones(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Error al obtener promociones:', e?.message);
      setError('No pudimos cargar las promociones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('usuarioGuardado')
      .then((doc) => doc && setUsuario(doc))
      .catch((e) => console.log('Error al obtener usuario:', e));

    cargarPromociones();
  }, []);

  const texto = busqueda.trim().toLowerCase();
  const promocionesFiltradas = texto
    ? promociones.filter((p) =>
        [p.dia_promocion, p.estado, formatearFecha(p.fecha_creacion)]
          .filter(Boolean)
          .some((campo) => String(campo).toLowerCase().includes(texto))
      )
    : promociones;

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
          <Text style={styles.headerTitle}>Promociones</Text>
          <Text style={styles.headerSubtitle}>Descuentos y beneficios de comercios adheridos</Text>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        <View style={styles.searchField}>
          <FontAwesome5 name="search" size={14} color="#9e2021" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por día o estado..."
            placeholderTextColor="#8a7476"
          />
          {!!busqueda && (
            <TouchableOpacity onPress={() => setBusqueda('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome5 name="times-circle" size={16} color="#8a7476" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9e2021" />
            <Text style={styles.loadingText}>Cargando promociones...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : promocionesFiltradas.length === 0 ? (
              <View style={styles.emptyCard}>
                <FontAwesome5 name="tags" size={36} color="#9e2021" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>Sin promociones</Text>
                <Text style={styles.emptyText}>
                  {busqueda ? 'No encontramos promociones para tu búsqueda.' : 'No hay promociones disponibles por ahora.'}
                </Text>
              </View>
            ) : (
              promocionesFiltradas.map((item, index) => {
                const activo = String(item.estado || '').toLowerCase() === 'activo';
                const key = item.rn ?? index;
                const imagenUrl = item.imagen
                  ? `https://api.progresarcorp.com.py/imagenes/${item.imagen}`
                  : null;
                const conError = !imagenUrl || imagenesConError[key];

                return (
                  <View key={key} style={styles.promoCard}>
                    {conError ? (
                      <View style={[styles.promoImage, styles.promoImageFallback]}>
                        <FontAwesome5 name="image" size={26} color="#c9b5b3" />
                        <Text style={styles.promoImageFallbackText}>Imagen no disponible</Text>
                      </View>
                    ) : (
                      <TouchableOpacity activeOpacity={0.9} onPress={() => setImagenSeleccionada(imagenUrl)}>
                        <Image
                          source={{ uri: imagenUrl }}
                          style={styles.promoImage}
                          resizeMode="cover"
                          onError={(e) => {
                            console.log('Error al cargar imagen de promoción:', item.imagen, e?.nativeEvent?.error);
                            setImagenesConError((prev) => ({ ...prev, [key]: true }));
                          }}
                        />
                      </TouchableOpacity>
                    )}

                    <View style={{ padding: 14 }}>
                      <View style={styles.promoTopRow}>
                        <View style={styles.promoDiaRow}>
                          <FontAwesome5 name="calendar-alt" size={12} color="#9e2021" style={{ marginRight: 6 }} />
                          <Text style={styles.promoDia}>{item.dia_promocion || 'Todos los días'}</Text>
                        </View>
                        <View style={[styles.estadoBadge, activo ? styles.estadoBadgeActivo : styles.estadoBadgeInactivo]}>
                          <Text style={[styles.estadoBadgeText, activo ? styles.estadoBadgeTextActivo : styles.estadoBadgeTextInactivo]}>
                            {item.estado || '-'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.promoFecha}>
                        Publicado el {formatearFecha(item.fecha_creacion)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      <BottomNav usuario={usuario} />

      {/* Imagen a pantalla completa */}
      {imagenSeleccionada && (
        <Modal visible animationType="fade" transparent onRequestClose={() => setImagenSeleccionada(null)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setImagenSeleccionada(null)}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalImageContainer}
              activeOpacity={1}
              onPress={() => setImagenSeleccionada(null)}
            >
              <Image source={{ uri: imagenSeleccionada }} style={styles.modalImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // 🔹 Encabezado
  headerBackground: {
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
    flex: 1,
    backgroundColor: '#faf6f5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 20,
    paddingHorizontal: 16,
  },

  // 🔹 Buscador
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#241a1a',
  },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9e2021', marginTop: 10, fontWeight: '500' },

  scrollContainer: { paddingBottom: 140 },

  // 🔹 Card de promoción
  promoCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
  },
  promoImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0e4e3',
  },
  promoImageFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoImageFallbackText: {
    fontSize: 12,
    color: '#8a7476',
    marginTop: 6,
  },
  promoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoDiaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  promoDia: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#241a1a',
  },
  promoFecha: {
    fontSize: 12,
    color: '#6b5c5d',
    marginTop: 8,
  },
  estadoBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  estadoBadgeActivo: {
    backgroundColor: 'rgba(63,143,95,0.12)',
  },
  estadoBadgeInactivo: {
    backgroundColor: 'rgba(158,32,33,0.08)',
  },
  estadoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  estadoBadgeTextActivo: {
    color: '#3f8f5f',
  },
  estadoBadgeTextInactivo: {
    color: '#9e2021',
  },

  // 🔹 Estado vacío
  emptyCard: {
    borderRadius: 18,
    padding: 24,
    marginTop: 20,
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
    paddingHorizontal: 10,
  },
  errorText: {
    color: '#9e2021',
    textAlign: 'center',
    marginTop: 20,
  },

  // 🔹 Modal de imagen a pantalla completa
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
