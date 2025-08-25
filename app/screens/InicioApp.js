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
  Alert
  
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { ImageBackground } from 'react-native';
import { Linking, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
// Categorías fijas
const categories = [
  {
    id: 1,
    name: 'Tarjetas',
    icon: <FontAwesome name="credit-card" size={38} color="#fff" />,
    backgroundIcon: <FontAwesome name="credit-card" size={100} color="#fff" />,
    color: '#FF6B6B',
    description: 'Gestión de tarjetas'
  },
  {
    id: 2,
    name: 'Operaciones',
    icon: <MaterialIcons name="account-balance-wallet" size={38} color="#fff" />,
    backgroundIcon: <MaterialIcons name="account-balance-wallet" size={100} color="#fff" />,
    color: '#4DD0E1',
    description: 'Movimientos y pagos'
  },
  {
    id: 3,
    name: 'Seguros',
    icon: <Ionicons name="shield-checkmark" size={38} color="#fff" />,
    backgroundIcon: <Ionicons name="shield-checkmark" size={100} color="#fff" />,
    color: '#5C6BC0',
    description: 'Protegé tus bienes'
  },
  {
    id: 4,
    name: 'Electrodoméstico',
    icon: <MaterialIcons name="tv" size={38} color="#fff" />,
    backgroundIcon: <MaterialIcons name="tv" size={100} color="#fff" />,
    color: '#FFA726',
    description: 'Comprá con cuotas'
  }
];

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
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [flyers, setFlyers] = useState([]);
  const [historiaSeleccionada, setHistoriaSeleccionada] = useState(null);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const { width } = Dimensions.get('window');
  const [promos, setPromos] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [errorPromos, setErrorPromos] = useState(null);
  const [tarjetas, setTarjetas] = useState([]);
  const [openPendientes, setOpenPendientes] = useState(true); // abierto por defecto
  const togglePendientes = () => setOpenPendientes(v => !v);
 const formatMoney = (value, currency = '') => {
  if (isNaN(value)) return `${currency} 0`;
  return `${currency} ${Number(value).toLocaleString('es-PY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

// Acción del botón Pagar (stub)
const onPagar = (item) => {
  // Abrí tu flujo de pago aquí
  Alert.alert('Pagar', `Iniciar pago por ${formatMoney(item?.saldo_mora, '$')}`);
};

  const formatGs = (val) => {
  const n = Number(val) || 0;
  // evita dependencias; toLocaleString suele estar ok en RN
  return `Gs. ${Math.round(n).toLocaleString('es-PY')}`;
};

const toggleExpand = (idx) => {
  setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
};
  useEffect(() => {
    const MAX_RETRIES = 5;      // cantidad máxima de intentos
    const RETRY_DELAY = 2000;   // 2 segundos entre intentos

    const fetchPromos = async (retries = MAX_RETRIES) => {
      try {
        setLoadingPromos(true);
        setErrorPromos(null);

        const res = await fetch('https://api.progresarcorp.com.py/api/promos-app', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache'
          }
        });

        if (!res.ok) {
          if (res.status === 500 && retries > 0) {
            console.warn(`Error 500. Reintentando... (${MAX_RETRIES - retries + 1})`);
            setTimeout(() => fetchPromos(retries - 1), RETRY_DELAY);
            return;
          }
          throw new Error(`Error ${res.status}: No se pudo obtener promos`);
        }

        const data = await res.json();

        // Normalizo y filtro: solo activos y con imagen
        const items = (Array.isArray(data) ? data : [])
          .filter(p => (p.activo || '').toLowerCase() === 'si' && p.url_imagen)
          .map(p => ({
            id: String(p.id),
            title: p.title,
            url: p.url,
            image: p.url_imagen
          }));

        setPromos(items);
      } catch (e) {
        console.log('Error al obtener promos:', e?.message);

        if (retries > 0) {
          console.warn(`Reintentando... (${MAX_RETRIES - retries + 1})`);
          setTimeout(() => fetchPromos(retries - 1), RETRY_DELAY);
          return;
        }

        setErrorPromos('No se pudo obtener las promos.');
        setPromos([]);
      } finally {
        setLoadingPromos(false);
      }
    };

    fetchPromos();
  }, []);
    //Para consultar varias veces
    const MAX_RETRIES = 5; // cantidad máxima de intentos
    const RETRY_DELAY = 2000; // 2 segundos entre intentos

    const obtenerTarjetas = async (retries = MAX_RETRIES) => {
      try {
        setLoading(true);
        setError('');

        const usuario = await AsyncStorage.getItem('usuarioGuardado');
        if (!usuario) {
          setError('Usuario no encontrado en el almacenamiento.');
          setTarjetas([]);
          return;
        }

        const res = await fetch(
          `https://api.progresarcorp.com.py/api/ver_notificaciones/${encodeURIComponent(usuario)}`,
          { headers: { Accept: 'application/json' } }
        );

        if (!res.ok) {
          if (res.status === 500 && retries > 0) {
            console.warn(`Error 500. Reintentando... (${MAX_RETRIES - retries + 1})`);
            setTimeout(() => obtenerTarjetas(retries - 1), RETRY_DELAY);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setTarjetas(data);
        } else if (data && (data.dias_mora != null || data.saldo_mora != null)) {
          setTarjetas([data]);
        } else {
          setTarjetas([]);
        }

      } catch (e) {
        console.log('Error al obtener tarjetas:', e?.message);

        if (retries > 0) {
          console.warn(`Reintentando... (${MAX_RETRIES - retries + 1})`);
          setTimeout(() => obtenerTarjetas(retries - 1), RETRY_DELAY);
          return;
        }

        setError('No se pudo obtener las notificaciones.');
        setTarjetas([]);
      } finally {
        setLoading(false);
      }
    };
        // lo llamás dentro de useEffect
        useEffect(() => {
          obtenerTarjetas();
        }, []);
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
 
  obtenerDatos();
}, []);
const obtenerIniciales = (nombreCompleto) => {
  if (!nombreCompleto) return 'I|N'; // Por defecto: Invitado

  const partes = nombreCompleto.trim().split(' ');
  const primera = partes[0]?.charAt(0).toUpperCase() || '';
  const segunda = partes[1]?.charAt(0).toUpperCase() || '';

  return `${primera}|${segunda}`;
};

 useEffect(() => {
  const controller = new AbortController();
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const fetchFlyers = async () => { 
    setLoading(true);
    setError(null);

    const url = 'https://api.progresarcorp.com.py/api/ver_comercios_adheridos';
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal,
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
  };

  fetchFlyers();

  return () => controller.abort();
}, []);


  const mostrarHistoria = (item) => setHistoriaSeleccionada(item);
  const cerrarModal = () => setHistoriaSeleccionada(null);

  return (
    <View style={styles.container}>
  <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />


      {/* Encabezado tipo "Hola, Rafael + RE" */}
      <ImageBackground
              source={require('../assets/inicio.png')}  
          style={styles.headerBackground}
          imageStyle={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.hello}>Hola,</Text>
             <Text style={styles.name}>{nombre || 'Invitado'}</Text>
            </View>
           <TouchableOpacity
              style={styles.avatarCircle}
              onPress={() => {
                Alert.alert(
                  'Cerrar sesión',
                  '¿Estás seguro que deseas salir?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Aceptar',
                      onPress: () => {
                        if (navigation.canGoBack()) {
                          navigation.goBack();        // vuelve a la pantalla anterior
                        } else {
                          navigation.popToTop();      // fallback: vuelve al inicio del stack
                        }
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <FontAwesome5 name="sign-out-alt" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </ImageBackground>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Historias en círculos */}
        <Text style={{ fontSize: 20, fontWeight: 'bold', margin: 10, textAlign: 'left' }}>
                           ¡Descuentos de hoy!
          </Text>
        <View style={styles.storiesContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#bf0404" />
          ) : error ? (
            <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
          ) : (
            <FlatList
              data={flyers}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => mostrarHistoria(item)} style={styles.storyCircle}>
                  <Image source={{ uri: item.imagen }} style={styles.storyImage} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>

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
        {/* PENDIENTES */}
        {!loading && !error && tarjetas.length > 0 && (
          <View style={styles.card}>
            {/* Cabecera del acordeón */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={togglePendientes}
              style={[
                styles.groupHeader,
                { paddingHorizontal: 20, marginHorizontal: 15 } // aire interno y externo
              ]}
            >
              <Text style={styles.groupTitle}>
                <FontAwesome5 name="exclamation-circle" size={17} color="#d11f1fff" /> Pago vencido
              </Text>
              <Text style={styles.groupCount}>({tarjetas.length})</Text>
              <View style={{ flex: 1 }} />
              <FontAwesome5
                name={openPendientes ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#555"
              />
            </TouchableOpacity>

            {/* Contenido del acordeón */}
            {openPendientes && (
              <View style={styles.pendingContainer}>
                {tarjetas.map((item, idx) => {
                  const dias = Number(item?.dias_mora) || 0;
                  const saldo = Number(item?.saldo_mora) || 0;
                  return (
                    <View key={idx} style={styles.pendingCard}>
                      <View style={styles.pendingRow}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                          <View style={styles.pendingTitleRow}>
                            <FontAwesome5 name="exclamation-circle" size={14} color="#d32f2f" />
                            <Text style={styles.pendingTitle}>Vencido</Text>
                          </View>
                          <Text style={styles.pendingText}>
                            Tienes un saldo pendiente en tu tarjeta de crédito de{' '}
                            <Text style={{ fontWeight: 'bold' }}>{formatMoney(saldo, 'Gs')}</Text>
                            {dias > 0 && (
                              <Text style={{ fontWeight: 'bold' }}>
                                {` (${dias} día${dias === 1 ? '' : 's'} en mora)`}
                              </Text>
                            )}
                            . Pagar a tiempo te ayudará a mantener un buen historial y cuidar tu perfil crediticio.
                          </Text>
                        </View>
                      </View>
                      <View style={styles.leftStripe} />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginTop: 10, marginBottom: 5 }}>
          Categorias
        </Text>
        {/* Categorías */}
      <View style={styles.categoryContainer}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryBox, { backgroundColor: cat.color }]}
            onPress={() => {
              if (cat.name === 'Tarjetas') {
                navigation.navigate('MisTarjetas');
                } else if (cat.name === 'Seguros') {
                navigation.navigate('MisSeguros');
                } else if (cat.name === 'Operaciones') {
                navigation.navigate('MisOperaciones');
                } else if (cat.name === 'Electrodoméstico') {
                navigation.navigate('MisElectrodomesticos');
                } else {
                console.log(cat.name);
              }
            }}
          >
            <View style={styles.categoryBackgroundIcon}>
              {cat.backgroundIcon}
            </View>
            {cat.icon}
            <Text style={styles.categoryText}>{cat.name}</Text>
            <Text style={styles.categorySubText}>{cat.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Carrusel de Promos */}
       <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginTop: 20 }}>
          Promos
        </Text>
      {/* Carrusel de Promos */}
    <View style={styles.carouselWrapper}>
      <View style={styles.carouselContainer}>
        {loadingPromos ? (
          <ActivityIndicator size="large" color="#bf0404" />
        ) : errorPromos ? (
          <Text style={{ color: 'red', textAlign: 'center' }}>{errorPromos}</Text>
        ) : (
          <FlatList
            data={promos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => item.url && Linking.openURL(item.url)}
              >
               <Image
                source={{ uri: item.image }}
                style={[styles.carouselImage, { width: width * 0.9 }]} // mismo porcentaje que el contenedor
              />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>

      </ScrollView>
      {/* Opciones flotantes */}
      {showOptions && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptions(false);
              navigation.navigate('Electrodomesticos');
            }}
          >
            <Ionicons name="pricetag-outline" size={20} color="#fff" />
            <Text style={styles.optionText}>Electrodomésticos</Text>
          </TouchableOpacity>

         <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptions(false);
               navigation.navigate('Tarjetas');
            }}
          >
            <Ionicons name="card-outline" size={20} color="#fff" />
            <Text style={styles.optionText}>Tarjeta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptions(false);
               navigation.navigate('Financiero');
            }}
          >
            <Ionicons name="wallet" size={20} color="#fff" />
            <Text style={styles.optionText}>Financiero</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Barra de navegación inferior */}
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNavStyled}> 

         {/* Icono QR */}
       <TouchableOpacity
          onPress={() => {
            console.log('NAV -> Qr con params:', { num_doc: String(usuario) });
            navigation.navigate('Qr', { num_doc: String(usuario) });
          }}
        >
          <Ionicons name="qr-code" size={24} color="#fff" />
        </TouchableOpacity>


        {/* Icono University */}
        <TouchableOpacity onPress={() => navigation.navigate('AtmQr')}>
          <FontAwesome5 name="university" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Botón central */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => setShowOptions(!showOptions)}
        >
          <Ionicons name={showOptions ? 'close' : 'add'} size={28} color="#fff" />
        </TouchableOpacity>

        {/* Icono Usuario */}
        <TouchableOpacity onPress={() => navigation.navigate('PerfilUsuario')}>
          <FontAwesome5 name="user" size={24} color="#fff" />
        </TouchableOpacity>
        {/* Icono Documento */}
        <TouchableOpacity onPress={() => navigation.navigate('Extracto')}>
          <Ionicons name="document-text-outline" size={24} color="#fff" />
        </TouchableOpacity>

      </View>
    </View>
    </View>
    
  );
}
// Estilos
const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center'
  },
  bottomNavStyled: {
    flexDirection: 'row',
    backgroundColor: '#9e2021',
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    elevation: 8
  },
  centerButton: {
    backgroundColor: '#9e2021',
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    elevation: 10
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 100, // arriba de la barra
    alignSelf: 'center',
    alignItems: 'center',
    gap: 10
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9e2021',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    elevation: 5
  },
  optionText: {
    color: '#fff',
    marginLeft: 8
  }, 
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    backgroundColor: 'transparent'
  },
  card: {
    flex: 0.3,          // ocupa el 30% del alto
    width: '80%',       // 90% del ancho de pantalla
    backgroundColor: '#eee',
    borderRadius: 12,
    padding: 16,
  },
    carouselWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  carouselContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: '90%',    // o '85%' / '80%'
    maxWidth: 435,
  },
  carouselImage: {
    height: 160,
    resizeMode: 'cover',
  },
  scrollContainer: {
    paddingBottom: 140
  },
  headerBackground: {
  paddingTop: 95,
  paddingHorizontal: 20,
  paddingBottom: 20,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  overflow: 'hidden'
},
headerContent: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center'
},
  hello: {
    color: '#fff',
    fontSize: 22
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 19
  },
 avatarCircle: {
  width: 40,
  height: 40,
  borderRadius: 25,
  backgroundColor: '#9e2021',
  justifyContent: 'center',
  alignItems: 'center',
},

  avatarText: {
    color: '#0D47A1',
    fontWeight: 'bold'
  },
  storiesContainer: {
    paddingVertical: 15
  },
  storyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  storyImage: {
    width: 54,
    height: 54,
    borderRadius: 27
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 8
  },
 categoryBox: {
  width: '47%',
  aspectRatio: 1.7,
  borderRadius: 20,
  padding: 16,
  marginVertical: 10,
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  elevation: 6,
  overflow: 'hidden',         // ✅ importante para recortar el icono de fondo
  position: 'relative' 
},
categoryIcon: {
  marginBottom: 10
},
categoryText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 18,
  marginBottom: 4
},
categorySubText: {
  color: 'rgba(255,255,255,0.9)',
  fontSize: 12
},
categoryBackgroundIcon: {
  position: 'absolute',
  right: -20,
  bottom: -20,
  opacity: 0.15,
  zIndex: 0
},

  bottomNavContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center'
  },
  bottomNavStyled: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    elevation: 8
  },
  centerButton: {
    backgroundColor: '#9e2021',
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    elevation: 10
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
  width: '100%',
  height: '100%',
  backgroundColor: '#000', // Fondo oscuro tipo Instagram
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
sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginHorizontal: 20,
  marginTop: 10,
  marginBottom: 5,
  color: '#333'
},
productCard: {
  width: 220,
  backgroundColor: '#fff',
  borderRadius: 12,
  marginRight: 16,
  padding: 10,
  elevation: 3
},
productImage: {
  width: '100%',
  height: 120,
  borderRadius: 8,
  marginBottom: 10
},
productBrand: {
  fontSize: 10,
  color: '#888'
},
productName: {
  fontSize: 14,
  fontWeight: 'bold',
  marginVertical: 4
},
productPrice: {
  fontSize: 12,
  color: '#4CAF50'
},
productButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10
},
whatsappButton: {
  backgroundColor: '#25D366',
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 8
},
cartButton: {
  backgroundColor: '#bf0404',
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 8
},
cartButtonText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: 'bold'
},
badgeNuevo: {
  position: 'absolute',
  top: 10,
  left: 10,
  backgroundColor: 'red',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 6,
  zIndex: 1
},
badgeText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 10
},
imageProducto: {
  width: 120,
  height: 120,
  marginBottom: 10
},
marcaProducto: {
  fontWeight: 'bold',
  color: '#444',
  marginBottom: 4
},
nombreProducto: {
  textAlign: 'center',
  fontWeight: '600',
  marginBottom: 5
},
precioProducto: {
  color: '#c00',
  fontWeight: 'bold',
  marginBottom: 10
},
botonProducto: {
  borderWidth: 1,
  borderColor: '#c00',
  borderRadius: 5,
  paddingVertical: 5,
  paddingHorizontal: 10
},
botonTextoProducto: {
  color: '#c00',
  fontWeight: '600'
}, 
accordionTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#333',
  marginBottom: 8,
},

accordionItem: {
  borderWidth: 1,
  borderColor: '#eee',
  borderRadius: 10,
  marginBottom: 10,
  overflow: 'hidden',
  backgroundColor: '#fff',
},

accordionHeader: {
  paddingHorizontal: 12,
  paddingVertical: 12,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fafafa',
},

accordionHeaderTitle: {
  fontSize: 14,
  fontWeight: '700',
  color: '#333',
},

accordionHeaderSub: {
  fontSize: 12,
  color: '#666',
  marginTop: 2,
},

accordionContent: {
  paddingHorizontal: 12,
  paddingVertical: 10,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderTopColor: '#f0f0f0',
},

rowLine: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 6,
},

rowLabel: {
  fontSize: 13,
  color: '#666',
},

rowValue: {
  fontSize: 13,
  color: '#333',
  fontWeight: '600',
},

loadingBoxSm: {
  paddingVertical: 12,
  alignItems: 'center',
  justifyContent: 'center',
},

loadingText: {
  marginTop: 6,
  fontSize: 12,
  color: '#666',
},

emptyText: {
  fontSize: 12,
  color: '#666',
},
pendingHeaderText: {
  fontSize: 14,
  fontWeight: '700',
  color: '#222',
  marginBottom: 8,
},

pendingContainer: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 19, // 👈 antes era 29, ahora 15
},
pendingCard: {
  position: 'relative',
  backgroundColor: '#ffffffff',
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
  // sombra sutil
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  elevation: 2,
},

leftStripe: {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 4,
  borderTopLeftRadius: 12,
  borderBottomLeftRadius: 12,
  backgroundColor: '#e53935', // rojo
},

pendingRow: {
  flexDirection: 'row',
  alignItems: 'center',
},

pendingTitleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginBottom: 6,
},

pendingTitle: {
  fontSize: 14,
  fontWeight: '800',
  color: '#d32f2f', // rojo título
},

pendingText: {
  fontSize: 13,
  color: '#444',
  lineHeight: 18,
},

payBtn: {
  backgroundColor: '#1e88e5', // azul
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 16,
  alignSelf: 'flex-start',
},
payBtnText: {
  color: '#ffffffff',
  fontWeight: '700',
  fontSize: 13,
},
groupHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 12,
  paddingVertical: 10,
  paddingHorizontal: 0,
  borderWidth: 1,
  borderColor: '#fff',
  marginBottom: 8,
  width: '92%',        // 👈 ancho controlado
  alignSelf: 'center', // 👈 centrado
},

groupHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center', // Centra horizontalmente todo el contenido
  backgroundColor: '#ffffffff',
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderWidth: 1,
  borderColor: '#ffe0e0',
  marginBottom: 8,
},

groupTitle: {
  fontSize: 15,
  fontWeight: '800',
  color: '#b40303',
  textAlign: 'center', // Asegura que el texto esté centrado
},

groupCount: {
  marginLeft: 6,
  fontSize: 13,
  color: '#b40303',
  fontWeight: '700',
},
pendingCard: {
  position: 'relative',
  backgroundColor: '#ffffffff',
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  elevation: 2,
},
leftStripe: {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 4,
  borderTopLeftRadius: 12,
  borderBottomLeftRadius: 12,
  backgroundColor: '#e53935',
},

pendingRow: { flexDirection: 'row', alignItems: 'center' },
pendingTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
pendingTitle: { fontSize: 14, fontWeight: '800', color: '#d32f2f' },
pendingText: { fontSize: 13, color: '#444', lineHeight: 18 },

payBtn: {
  backgroundColor: '#1e88e5',
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 16,
  alignSelf: 'flex-start',
},
payBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

loadingBoxSm: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
loadingText: { marginTop: 6, fontSize: 12, color: '#666' },
emptyBox: { paddingVertical: 12, alignItems: 'center', gap: 6 },
emptyText: { fontSize: 12, color: '#666' },
});
