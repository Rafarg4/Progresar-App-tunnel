import React, { useState, useEffect } from 'react';
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
  ActivityIndicator
  
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

  useEffect(() => {
    const fetchPromos = async () => {
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

        if (!res.ok) throw new Error(`Error ${res.status}: No se pudo obtener promos`);

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
        setErrorPromos(e.message);
      } finally {
        setLoadingPromos(false);
      }
    };

    fetchPromos();
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
    const fetchFlyers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://api.progresarcorp.com.py/api/ver_comercios_adheridos', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo obtener los datos`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Formato inesperado de la respuesta');
        }

        const formattedFlyers = data.map((item, index) => ({
          id: index + 1,
          imagen: item.imagen ? `https://api.progresarcorp.com.py/imagenes/${item.imagen}` : null
        }));

        setFlyers(formattedFlyers);
      } catch (error) {
        setError(error.message);
        console.error('Error al obtener los datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlyers();
  }, []);

  const mostrarHistoria = (item) => setHistoriaSeleccionada(item);
  const cerrarModal = () => setHistoriaSeleccionada(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Encabezado tipo "Hola, Rafael + RE" */}
      <ImageBackground
           source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/08/inicio.png' }}
          style={styles.headerBackground}
          imageStyle={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.hello}>Hola,</Text>
             <Text style={styles.name}>{nombre || 'Invitado'}</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{obtenerIniciales(nombre)}</Text>
            </View>
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
       <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 20, marginTop: 10, marginBottom: 5 }}>
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
              navigation.navigate('Pagos');
            }}
          >
            <Ionicons name="card-outline" size={20} color="#fff" />
            <Text style={styles.optionText}>Solicitar Tarjeta</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Barra de navegación inferior */}
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNavStyled}>

         {/* Icono QR */}
        <TouchableOpacity>
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
        <TouchableOpacity onPress={() => navigation.navigate('Usuario')}>
          <FontAwesome5 name="user" size={24} color="#fff" />
        </TouchableOpacity>
        {/* Icono Documento */}
        <TouchableOpacity onPress={() => navigation.navigate('Extracto')}>
          <Ionicons name="document-text-outline" size={24} color="#fff" />
        </TouchableOpacity>

      </View>
    </View>
    </SafeAreaView>
    
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
    backgroundColor: '#F50057',
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
    backgroundColor: '#F50057',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    elevation: 5
  },
  optionText: {
    color: '#fff',
    marginLeft: 8
  },
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
    carouselWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    marginTop: -90,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
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
  width: '45%',
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
    backgroundColor: '#F50057',
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
}
});
