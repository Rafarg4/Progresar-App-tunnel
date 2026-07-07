import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, FlatList,
  Image, TouchableOpacity, Dimensions, Linking, TextInput
} from 'react-native';
import { ImageBackground } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';

const { width } = Dimensions.get('window');
const H_PADDING = 16;

// Imagen del producto con respaldo local si no hay foto o si la remota falla al cargar
const ProductImage = ({ rutaFoto }) => {
  const [fallo, setFallo] = useState(false);
  const usarRespaldo = !rutaFoto || fallo;

  return (
    <Image
      source={
        usarRespaldo
          ? require('../assets/isologo.png')
          : { uri: `https://progresarelectrodomesticos.com/img/producto/${rutaFoto}` }
      }
      style={styles.imageLeft}
      resizeMode="contain"
      onError={() => setFallo(true)}
    />
  );
};

export default function Electrodomesticos() {
  const navigation = useNavigation();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [usuario, setUsuario] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('usuarioGuardado')
      .then((doc) => doc && setUsuario(doc))
      .catch((e) => console.log('Error al obtener usuario:', e));
  }, []);

  useEffect(() => {
    const cargar = async () => {
      try {
        setError(false);
        setLoading(true);
        const res = await fetch('https://api.progresarcorp.com.py/api/ver_productos');
        const data = await res.json();
        setProductos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.log('Error al obtener productos', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const productosFiltrados = productos.filter(p =>
    (p.producto || '').toLowerCase().includes(query.trim().toLowerCase())
  );

  const renderItem = ({ item }) => {
    return (
      <View style={styles.cardRow}>
        {/* Badge NUEVO (si querés condicionar, usá item.nuevo === 'S') */}
        <View style={styles.badgeNuevo}>
          <Text style={styles.badgeText}>NUEVO</Text>
        </View>

        <ProductImage rutaFoto={item.ruta_foto} />

        <View style={styles.infoRight}>
          <Text style={styles.marca}>Progresar Electrodomésticos</Text>
          <Text numberOfLines={2} style={styles.nombre}>{item.producto}</Text>
          <Text style={styles.precio}>Gs. {parseInt(item.precio_fijo || 0).toLocaleString()}</Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  `https://api.whatsapp.com/send?phone=595984995582&text=${encodeURIComponent(
                    `Hola, estoy interesado en el producto ${item.producto}`
                  )}`
                )
              }
              style={styles.btnWhatsapp}
            >
              <Text style={styles.btnWhatsappText}> <FontAwesome5 name="whatsapp" size={14} color="#fff" /> WhatsApp </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnCarrito}
              onPress={() =>
                Linking.openURL(`https://progresarelectrodomesticos.com.py/`)
              }
            >
              <Text style={styles.btnCarritoText}><FontAwesome5 name="shopping-cart" size={12} color="#3f8f5f" style={{ marginRight: 6 }} /> Añadir al carrito</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con imagen */}
      <ImageBackground
         source={require('../assets/Electro.png')}
        style={styles.header}
        imageStyle={styles.headerImage}
        resizeMode="cover"
      >
        <View style={styles.headerOverlay} />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={16} color="#9e2021" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Electrodomésticos</Text>
          <Text style={styles.headerSubtitle}>Comprá con cuotas y a un clic de distancia</Text>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#9e2021" />
            <Text style={{ marginTop: 8, color: '#6b5c5d' }}>Cargando…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={{ color: '#9e2021' }}>No se pudo cargar la lista.</Text>
          </View>
        ) : (
          <>
            {/* Buscador */}
            <View style={styles.searchContainer}>
              <FontAwesome5 name="search" size={14} color="#6b5c5d" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar productos…"
                placeholderTextColor="#8a7476"
                style={styles.searchInput}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <FontAwesome5 name="times-circle" size={16} color="#6b5c5d" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              style={{ flex: 1 }}
              data={productosFiltrados}
              keyExtractor={(item, idx) => String(item.cod_articulo ?? idx)}
              contentContainerStyle={{ paddingHorizontal: H_PADDING, paddingBottom: 140, paddingTop: 14 }}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              ListEmptyComponent={
                <View style={{ paddingHorizontal: H_PADDING, paddingVertical: 20 }}>
                  <Text style={{ textAlign: 'center', color: '#6b5c5d' }}>
                    {query ? 'No hay resultados para tu búsqueda.' : 'No hay productos para mostrar.'}
                  </Text>
                </View>
              }
            />
            {/* Botón final "Conocer más" */}
            <View style={{ paddingHorizontal: H_PADDING, paddingBottom: 18 }}>
              <TouchableOpacity
                style={styles.btnMas}
                onPress={() => Linking.openURL('https://progresarelectrodomesticos.com.py/')}
              >
                <Text style={styles.btnMasText}>
                  <FontAwesome5 name="plus" size={16} color="#fafafaff" /> Ver más
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <BottomNav usuario={usuario} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: { width: '100%', height: 160, justifyContent: 'flex-end' },
  headerImage: {},
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(36,16,18,0.25)',
  },
  backButton: {
    position: 'absolute',
    top: 18,
    left: 18,
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
    padding: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
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

  // 🔹 Hoja de contenido, superpuesta a la foto
  sheet: {
    flex: 1,
    backgroundColor: '#faf6f5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -10,
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Buscador
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f2f1',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginHorizontal: H_PADDING,
    marginTop: 20,
    marginBottom: 4,
    height: 48,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#241a1a',
    paddingVertical: 8
  },

  // Card en fila
  cardRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#efe1e0',
    padding: 10,
    alignItems: 'center',
    position: 'relative'
  },
  badgeNuevo: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#9e2021',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },

  imageLeft: { width: 90, height: 90, borderRadius: 10, marginRight: 12 },
  infoRight: { flex: 1 },

  marca: { fontSize: 10, color: '#6b5c5d' },
  nombre: { fontSize: 13, fontWeight: '700', color: '#241a1a', marginVertical: 4 },
  precio: { fontSize: 12, color: '#3f8f5f', fontWeight: 'bold' },

  buttonsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  btnWhatsapp: { backgroundColor: '#25D366', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  btnCarrito: {
    borderWidth: 1, borderColor: '#3f8f5f', paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 10, flex: 1, alignItems: 'center'
  },
  btnWhatsappText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  btnCarritoText: { color: '#3f8f5f', fontWeight: 'bold', fontSize: 12 },

  btnMas: {
    backgroundColor: '#9e2021',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
  },
  btnMasText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
