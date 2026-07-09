import React, { useState, useEffect,useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
  BackHandler,
  Alert

} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { ImageBackground } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { getToken } from '../recursos/Notificaciones.js';
import { WalletCard, formatGs } from '../components/WalletCard';
import BottomNav from '../components/BottomNav';
// Categorías fijas
const categories = [
  {
    id: 1,
    name: 'Tarjetas',
    icon: <FontAwesome name="credit-card" size={20} color="#fff" />,
    color: '#d9a441',
  },
  {
    id: 2,
    name: 'Operaciones',
    icon: <MaterialIcons name="account-balance-wallet" size={20} color="#fff" />,
    color: '#4d7ea8',
  },
  {
    id: 3,
    name: 'Seguros',
    icon: <Ionicons name="shield-checkmark" size={20} color="#fff" />,
    color: '#4a9b6e',
  },
  {
    id: 4,
    name: 'Extracto',
    icon: <FontAwesome5 name="file-invoice" size={18} color="#fff" />,
    color: '#8568ad',
  },
  {
    id: 5,
    name: 'Solicitud de Adelanto',
    icon: <FontAwesome5 name="hand-holding-usd" size={18} color="#fff" />,
    color: '#2f8f8a',
  },
  {
    id: 6,
    name: 'Pago QR',
    icon: <FontAwesome5 name="qrcode" size={18} color="#fff" />,
    color: '#c0577a',
  },
  {
    id: 7,
    name: 'Electrodoméstico',
    icon: <MaterialIcons name="tv" size={20} color="#fff" />,
    color: '#8568ad',
  },
  {
    id: 8,
    name: 'Transacciones',
    icon: <FontAwesome5 name="exchange-alt" size={18} color="#fff" />,
    color: '#4d7ea8',
  }
];


// Pasos del proceso de una solicitud de adelanto
const PASOS_ADELANTO = [
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'aprobado', label: 'Aprobado' },
  { key: 'desembolsado', label: 'Desembolsado' },
];

const pasoActualIndex = (estado) => {
  const key = String(estado || '').toLowerCase();
  return PASOS_ADELANTO.findIndex((p) => p.key === key);
};

const getGreeting = () => {
  const now = new Date();
  const hours = now.getHours();
  if (hours < 12) return '¡Buenos días';
  if (hours < 19) return '¡Buenas tardes';
  return '¡Buenas noches';
};

export default function HomeScreen() {
  const dateStr = new Date().toLocaleDateString('es-ES');
  const timeStr = new Date().toLocaleTimeString('es-ES');
  const greeting = getGreeting();
  const [loading, setLoading] = useState(true);
  const [flyers, setFlyers] = useState([]);
  const [historiaSeleccionada, setHistoriaSeleccionada] = useState(null);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [misTarjetas, setMisTarjetas] = useState([]);
  const [loadingTarjetas, setLoadingTarjetas] = useState(true);
  const [errorTarjetas, setErrorTarjetas] = useState(null);
  const [saldosDisponibles, setSaldosDisponibles] = useState({});
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cardsExpanded, setCardsExpanded] = useState(false);
  const [adelantoActivo, setAdelantoActivo] = useState(null);
  const [loadingAdelanto, setLoadingAdelanto] = useState(true);
  const [modalSalirVisible, setModalSalirVisible] = useState(false);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const nombreGuardado = await AsyncStorage.getItem('nombreUsuario');
        const usuarioGuardado = await AsyncStorage.getItem('usuarioGuardado');

        if (nombreGuardado) setNombre(nombreGuardado);
        if (usuarioGuardado) setUsuario(usuarioGuardado);
      } catch (error) {
        console.log('Error al obtener datos de AsyncStorage:', error);
      }
    };
    getToken();
    obtenerDatos();
  }, []);

  // Tarjetas del usuario (mismo endpoint que usa la pantalla "Mis Tarjetas")
  const obtenerMisTarjetas = useCallback(async () => {
    if (!usuario) return;
    try {
      setLoadingTarjetas(true);
      setErrorTarjetas(null);

      const res = await fetch(`https://api.progresarcorp.com.py/api/ver_tarjeta/${usuario}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];
      setMisTarjetas(lista);
      setActiveCardIndex(0);
      await cargarSaldosDisponibles(lista);
    } catch (e) {
      console.log('Error al obtener tarjetas:', e?.message);
      setErrorTarjetas('No pudimos cargar tus tarjetas.');
    } finally {
      setLoadingTarjetas(false);
    }
  }, [usuario]);

  useEffect(() => {
    obtenerMisTarjetas();
  }, [obtenerMisTarjetas]);

  // Saldo disponible en tiempo real por tarjeta (mismo endpoint que usa "Detalle de tarjeta")
  const cargarSaldosDisponibles = async (lista) => {
    const entradas = await Promise.all(
      lista.map(async (t) => {
        try {
          const res = await fetch(`https://api.progresarcorp.com.py/api/obtener_saldo_actual/${t.nro_tarjeta}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return [t.nro_tarjeta, data?.cuenta?.disponi_adelanto ?? null];
        } catch (e) {
          console.log('Error al obtener saldo de la tarjeta', t.nro_tarjeta, ':', e?.message);
          return [t.nro_tarjeta, null];
        }
      })
    );
    setSaldosDisponibles(Object.fromEntries(entradas));
  };

  // Última solicitud de adelanto, para mostrar su estado en el inicio
  const obtenerAdelantoActivo = useCallback(async () => {
    if (!usuario) return;
    try {
      setLoadingAdelanto(true);
      const res = await fetch(`https://api.progresarcorp.com.py/api/ver_solicitudes_adelanto/${usuario}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const lista = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
      const visibles = lista.filter(
        (item) => String(item.visible ?? 'SI').toUpperCase() !== 'NO'
      );
      const ordenadas = [...visibles].sort(
        (a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud)
      );
      setAdelantoActivo(ordenadas[0] || null);
    } catch (e) {
      console.log('Error al obtener el adelanto activo:', e?.message);
    } finally {
      setLoadingAdelanto(false);
    }
  }, [usuario]);

  useEffect(() => {
    obtenerAdelantoActivo();
  }, [obtenerAdelantoActivo]);

  useFocusEffect(
    useCallback(() => {
      obtenerAdelantoActivo();
    }, [obtenerAdelantoActivo])
  );

const obtenerIniciales = (nombreCompleto) => {
  if (!nombreCompleto) return 'I|N'; // Por defecto: Invitado

  const partes = nombreCompleto.trim().split(' ');
  const primera = partes[0]?.charAt(0).toUpperCase() || '';
  const segunda = partes[1]?.charAt(0).toUpperCase() || '';

  return `${primera}|${segunda}`;
};

 const fetchFlyers = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const url = 'https://api.progresarcorp.com.py/api/ver_comercios_adheridos';
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache'
      },
      signal,
    };

    const maxRetries = 1;     // reintenta 1 vez extra si es 500
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          // Si es 500 y aún podemos reintentar, espera (backoff) y reintenta
          if (response.status === 500 && attempt < maxRetries) {
            attempt++;
            await sleep(800 * attempt); // backoff simple
            continue;
          }
          throw new Error(`Error ${response.status}: No se pudo obtener los datos`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Formato inesperado de la respuesta');
        }

        const formattedFlyers = data.map((item, index) => ({
          id: String(item.id ?? index + 1),
          imagen: item.imagen ? `https://api.progresarcorp.com.py/imagenes/${item.imagen}` : null
        }));

        setFlyers(formattedFlyers);
        break; // éxito: salimos del while
      } catch (error) {
        // Si fue cancelado por unmount, salimos silenciosamente
        if (error?.name === 'AbortError') return;

        // Si no es 500, o ya no quedan reintentos, setea el error y corta
        if (!String(error?.message || '').includes('Error 500') || attempt >= maxRetries) {
          setError(error.message);
          console.error('Error al obtener los datos:', error);
          break;
        }
        // Si llegó acá es porque es 500 y aún hay reintento: el loop continúa
        attempt++;
        await sleep(800 * attempt);
      } finally {
        // setLoading(false) se hace al salir del bucle (éxito o error final)
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchFlyers(controller.signal);
    return () => controller.abort();
  }, [fetchFlyers]);

  // Pull-to-refresh: recarga todo lo del inicio
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        obtenerMisTarjetas(),
        obtenerAdelantoActivo(),
        fetchFlyers(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [obtenerMisTarjetas, obtenerAdelantoActivo, fetchFlyers]);


  const mostrarHistoria = (item) => setHistoriaSeleccionada(item);
  const cerrarModal = () => setHistoriaSeleccionada(null);

  const confirmarSalir = () => {
    setModalSalirVisible(false);
    if (navigation.canGoBack()) {
      navigation.goBack();        // vuelve a la pantalla anterior
    } else {
      BackHandler.exitApp();      // no hay a dónde volver: cierra la app
    }
  };

  // Botón físico de "atrás": mostrar el mismo aviso en vez de salir directo
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setModalSalirVisible(true);
        return true; // evita el comportamiento por defecto (salir sin avisar)
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const handleDetalleTarjeta = (tarjeta) => {
    const clase = String(tarjeta.clase_tarjeta ?? '');
    if (clase === '1') {
      navigation.navigate('DetalleBepsa', { nro_tarjeta: tarjeta.nro_tarjeta, tarjeta });
    } else {
      navigation.navigate('DetalleTarjetas', { tarjeta });
    }
  };

  const estadoAdelanto = String(adelantoActivo?.estado || '').toLowerCase();
  const adelantoRechazado = estadoAdelanto === 'rechazado';
  const pasoAdelantoIdx = pasoActualIndex(estadoAdelanto);

  const ocultarAdelanto = async () => {
    const cod = adelantoActivo?.cod_solicitud_adelanto;
    if (!cod) return;
    if (estadoAdelanto !== 'desembolsado' && estadoAdelanto !== 'rechazado') return; // solo se oculta al finalizar (desembolsado o rechazado)
    const url = `https://api.progresarcorp.com.py/api/ocultar_solicitud_adelanto/${cod}`;
    try {
      const res = await fetch(url, { method: 'PUT' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      console.log('Error al ocultar el adelanto:', e?.message);
    } finally {
      setAdelantoActivo(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9e2021']}
            tintColor="#9e2021"
          />
        }
      >
        {/* Encabezado */}
        <ImageBackground
          source={require('../assets/inicio_nuevo.png')}
          style={styles.headerBackground}
          imageStyle={styles.headerImage}
        >
          <View style={styles.headerOverlay} />
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.hello}>{greeting}</Text>
              <Text style={styles.name}>{nombre || 'Invitado'}</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => setModalSalirVisible(true)}
            >
              <FontAwesome5 name="sign-out-alt" size={18} color="#9e2021" />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Hoja blanca superpuesta a la foto, con todo el contenido */}
        <View style={styles.sheet}>

          {/* Tus tarjetas */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBadge}>
                  <FontAwesome5 name="credit-card" size={13} color="#9e2021" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Tus tarjetas</Text>
                  <Text style={styles.sectionSubtitle}>Tocá una tarjeta para ver las demás</Text>
                </View>
              </View>
              {misTarjetas.length > 0 && (
                <View style={styles.cardCountBadge}>
                  <Text style={styles.cardCountText}>
                    {misTarjetas.length} {misTarjetas.length === 1 ? 'tarjeta' : 'tarjetas'}
                  </Text>
                </View>
              )}
            </View>

            {loadingTarjetas ? (
              <ActivityIndicator size="large" color="#9e2021" style={{ marginVertical: 20 }} />
            ) : errorTarjetas ? (
              <Text style={styles.errorText}>{errorTarjetas}</Text>
            ) : misTarjetas.length === 0 ? (
              <Text style={styles.errorText}>No tenés tarjetas activas.</Text>
            ) : cardsExpanded ? (
              <View>
                {misTarjetas.map((t, idx) => (
                  <View key={t.nro_tarjeta} style={{ marginBottom: idx === misTarjetas.length - 1 ? 0 : 10 }}>
                    <WalletCard
                      tarjeta={t}
                      active={idx === activeCardIndex}
                      disponibleOverride={saldosDisponibles[t.nro_tarjeta]}
                      onPress={() => {
                        setActiveCardIndex(idx);
                        setCardsExpanded(false);
                      }}
                      onEnter={() => handleDetalleTarjeta(t)}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.cardStackWrapper}>
                {misTarjetas.length > 2 && <View style={[styles.cardPeek, styles.cardPeekBack]} />}
                {misTarjetas.length > 1 && <View style={[styles.cardPeek, styles.cardPeekMid]} />}
                <WalletCard
                  tarjeta={misTarjetas[activeCardIndex] || misTarjetas[0]}
                  active={false}
                  disponibleOverride={
                    saldosDisponibles[(misTarjetas[activeCardIndex] || misTarjetas[0])?.nro_tarjeta]
                  }
                  onPress={() => {
                    if (misTarjetas.length > 1) setCardsExpanded(true);
                  }}
                  onEnter={() => handleDetalleTarjeta(misTarjetas[activeCardIndex] || misTarjetas[0])}
                />
              </View>
            )}
          </View>

          {/* Estado de la solicitud de adelanto (no se muestra si fue rechazada) */}
          {!loadingAdelanto && adelantoActivo && (
            <TouchableOpacity
              style={styles.sectionCard}
              activeOpacity={0.85}
              onPress={() => {
                navigation.navigate('SolicitudAdelanto');
                ocultarAdelanto();
              }}
            >
              <TouchableOpacity
                style={styles.closeAdelantoButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={ocultarAdelanto}
              >
                <FontAwesome5 name="times" size={12} color="#6b5c5d" />
              </TouchableOpacity>

              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBadge}>
                    <FontAwesome5
                      name={adelantoRechazado ? 'exclamation-circle' : 'hand-holding-usd'}
                      size={13}
                      color="#9e2021"
                    />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Tu adelanto</Text>
                    <Text style={styles.sectionSubtitle}>
                      {adelantoRechazado ? 'Solicitud rechazada' : formatGs(adelantoActivo.monto)}
                    </Text>
                  </View>
                </View>
                <FontAwesome5 name="chevron-right" size={13} color="#6b5c5d" />
              </View>

              {adelantoRechazado ? (
                <View style={styles.rechazoBox}>
                  <Text style={styles.rechazoText}>
                    {adelantoActivo.motivo_rechazo || 'Tu solicitud de adelanto fue rechazada.'}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.stepperCirclesRow}>
                    {PASOS_ADELANTO.map((paso, idx) => {
                      const esUltimoPaso = idx === PASOS_ADELANTO.length - 1;
                      const isActive = idx <= pasoAdelantoIdx;
                      const isDone = idx < pasoAdelantoIdx || (idx === pasoAdelantoIdx && esUltimoPaso);
                      return (
                        <React.Fragment key={paso.key}>
                          <View style={[styles.stepperCircle, isActive && styles.stepperCircleActive]}>
                            {isDone ? (
                              <FontAwesome5 name="check" size={10} color="#fff" />
                            ) : (
                              <Text style={[styles.stepperNumber, isActive && styles.stepperNumberActive]}>
                                {idx + 1}
                              </Text>
                            )}
                          </View>
                          {!esUltimoPaso && (
                            <View style={[styles.stepperLine, idx < pasoAdelantoIdx && styles.stepperLineActive]} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </View>
                  <View style={styles.stepperLabelsRow}>
                    {PASOS_ADELANTO.map((paso, idx) => (
                      <Text
                        key={paso.key}
                        style={[styles.stepperLabel, idx <= pasoAdelantoIdx && styles.stepperLabelActive]}
                      >
                        {paso.label}
                      </Text>
                    ))}
                  </View>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Accesos rápidos */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <FontAwesome5 name="th-large" size={13} color="#9e2021" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Accesos rápidos</Text>
                <Text style={styles.sectionSubtitle}>Todo lo que necesitás en un solo lugar</Text>
              </View>
            </View>

            <View style={styles.categoryContainer}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (cat.name === 'Tarjetas') {
                      navigation.navigate('MisTarjetas');
                      } else if (cat.name === 'Seguros') {
                      navigation.navigate('MisSeguros');
                      } else if (cat.name === 'Operaciones') {
                      navigation.navigate('MisOperaciones');
                      } else if (cat.name === 'Extracto') {
                      navigation.navigate('Extracto');
                      } else if (cat.name === 'Solicitud de Adelanto') {
                      navigation.navigate('SolicitudAdelanto');
                      } else if (cat.name === 'Pago QR') {
                      navigation.navigate('PagoQr', { num_doc: String(usuario) });
                      } else if (cat.name === 'Electrodoméstico') {
                      navigation.navigate('MisElectrodomesticos');
                      } else if (cat.name === 'Transacciones') {
                      navigation.navigate('Notificaciones');
                      } else {
                      console.log(cat.name);
                    }
                  }}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: cat.color }]}>
                    {cat.icon}
                  </View>
                  <Text style={styles.categoryLabel}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Descuentos de hoy */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBadge}>
                  <FontAwesome5 name="tags" size={13} color="#9e2021" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Descuentos de hoy</Text>
                  <Text style={styles.sectionSubtitle}>Aprovechá las mejores ofertas</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Promociones')}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#9e2021" style={{ marginVertical: 20 }} />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <FlatList
                data={flyers}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingRight: 4 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => mostrarHistoria(item)}
                    style={styles.discountCard}
                    activeOpacity={0.85}
                  >
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>Click aquí!</Text>
                    </View>
                    <Image source={{ uri: item.imagen }} style={styles.discountImage} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de historia */}
      {historiaSeleccionada && (
        <Modal visible animationType="fade" transparent onRequestClose={cerrarModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={cerrarModal} style={styles.closeButton}>
                <Text style={styles.closeText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={cerrarModal} style={styles.modalImageContainer}>
                <Image source={{ uri: historiaSeleccionada.imagen }} style={styles.modalImage} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal de confirmación para cerrar sesión */}
      <Modal
        visible={modalSalirVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSalirVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={[styles.confirmIconCircle, styles.confirmIconWarning]}>
              <FontAwesome5 name="sign-out-alt" size={20} color="#fff" />
            </View>
            <Text style={styles.confirmTitle}>Cerrar sesión</Text>
            <Text style={styles.confirmMessage}>¿Estás seguro que deseas salir?</Text>

            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonSecondary]}
                onPress={() => setModalSalirVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmButtonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmarSalir}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav usuario={usuario} />
    </View>

  );
}
// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  scrollContainer: {
    paddingBottom: 140
  },

  // 🔹 Encabezado
  headerBackground: {
    paddingTop: 95,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerImage: {},
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(36,16,18,0.25)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hello: {
    color: '#fff',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 21,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  logoutButton: {
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

  // 🔹 Hoja de contenido, superpuesta a la foto
  sheet: {
    backgroundColor: '#faf6f5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 22,
    paddingHorizontal: 16,
  },

  // 🔹 Card de sección, con borde visible (Descuentos / Accesos / Promos)
  sectionCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(158,32,33,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#241a1a',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b5c5d',
    marginTop: 1,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9e2021',
  },
  errorText: {
    color: '#9e2021',
    textAlign: 'center',
    marginVertical: 10,
  },

  // 🔹 Seguimiento de la solicitud de adelanto
  closeAdelantoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 4,
  },
  stepperCirclesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0e4e3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperCircleActive: {
    backgroundColor: '#9e2021',
  },
  stepperNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b5c5d',
  },
  stepperNumberActive: {
    color: '#fff',
  },
  stepperLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#f0e4e3',
    marginHorizontal: 4,
  },
  stepperLineActive: {
    backgroundColor: '#9e2021',
  },
  stepperLabelsRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  stepperLabel: {
    flex: 1,
    fontSize: 10.5,
    color: '#6b5c5d',
    textAlign: 'center',
  },
  stepperLabelActive: {
    color: '#241a1a',
    fontWeight: '700',
  },
  rechazoBox: {
    backgroundColor: 'rgba(158,32,33,0.08)',
    borderRadius: 12,
    padding: 12,
  },
  rechazoText: {
    fontSize: 12.5,
    color: '#9e2021',
    lineHeight: 18,
  },

  // 🔹 Tus tarjetas
  cardCountBadge: {
    backgroundColor: 'rgba(158,32,33,0.1)',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cardCountText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#9e2021',
  },
  cardStackWrapper: {
    position: 'relative',
  },
  cardPeek: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(158,32,33,0.08)',
  },
  cardPeekMid: {
    bottom: -7,
  },
  cardPeekBack: {
    bottom: -12,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(158,32,33,0.05)',
  },

  // 🔹 Descuentos de hoy
  discountCard: {
    width: 100,
    marginRight: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 1,
    backgroundColor: '#9e2021',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  discountImage: {
    width: 100,
    height: 90,
    borderRadius: 14,
    backgroundColor: '#f0e4e3',
  },

  // 🔹 Carrusel de promos
  carouselImage: {
    height: 170,
    borderRadius: 16,
    resizeMode: 'cover',
  },

  // 🔹 Modal de confirmación (cerrar sesión)
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(36,16,18,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  confirmIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  confirmIconWarning: {
    backgroundColor: '#9e2021',
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#241a1a',
    marginBottom: 6,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 13.5,
    color: '#6b5c5d',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#9e2021',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  confirmButtonSecondary: {
    backgroundColor: 'rgba(158,32,33,0.08)',
  },
  confirmButtonSecondaryText: {
    color: '#9e2021',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // 🔹 Modal de historia
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 20,
    zIndex: 1
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  modalImageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // 🔹 Categorías
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: '21%',
  },
  categoryIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#241a1a',
    textAlign: 'center',
  },
});