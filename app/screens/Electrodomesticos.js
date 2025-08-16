import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, FlatList,
  Image, TouchableOpacity, Dimensions, Linking, TextInput
} from 'react-native';
import { ImageBackground } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const H_PADDING = 16;

export default function Electrodomesticos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

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
    const imageUrl = item.ruta_foto
      ? `https://progresarelectrodomesticos.com/img/producto/${item.ruta_foto}`
      : 'https://progresarcorp.com.py/wp-content/uploads/2025/04/Logo_nuevo_P-2.png';

    return (
      <View style={styles.cardRow}>
        {/* Badge NUEVO (si querés condicionar, usá item.nuevo === 'S') */}
        <View style={styles.badgeNuevo}>
          <Text style={styles.badgeText}>NUEVO</Text>
        </View>

        <Image source={{ uri: imageUrl }} style={styles.imageLeft} resizeMode="contain" />

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
              <Text style={styles.btnCarritoText}> <FontAwesome5 name="whatsapp" size={14} color="#fff" /> WhatsApp </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnCarrito}
              onPress={() =>
                Linking.openURL(`https://progresarelectrodomesticos.com/detalles/${item.cod_articulo}`)
              }
            >
              <Text style={styles.btnCarritoText}><FontAwesome5 name="shopping-cart" size={12} color="#558B2F" style={{ marginRight: 6 }} /> Añadir al carrito</Text>
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
        source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/08/Electro.png' }}
        style={styles.header}
        imageStyle={styles.headerImage}
        resizeMode="cover"
      >
        <Text style={styles.headerTitle}>Electrodomésticos</Text>
      </ImageBackground>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Cargando…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: 'red' }}>No se pudo cargar la lista.</Text>
        </View>
      ) : (
        <>
          {/* Buscador */}
          <View style={styles.searchContainer}>
            <FontAwesome5 name="search" size={14} color="#666" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar productos…"
              placeholderTextColor="#999"
              style={styles.searchInput}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <FontAwesome5 name="times-circle" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={productosFiltrados}
            keyExtractor={(item, idx) => String(item.cod_articulo ?? idx)}
            contentContainerStyle={{ paddingHorizontal: H_PADDING, paddingBottom: 20, paddingTop: 14 }}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={
              <View style={{ paddingHorizontal: H_PADDING, paddingVertical: 20 }}>
                <Text style={{ textAlign: 'center', color: '#666' }}>
                  {query ? 'No hay resultados para tu búsqueda.' : 'No hay productos para mostrar.'}
                </Text>
              </View>
            }
          />
          {/* Botón final "Conocer más" */}
          <View style={{ paddingHorizontal: H_PADDING, paddingBottom: 18 }}>
            <TouchableOpacity
              style={styles.btnMas}
              onPress={() => Linking.openURL('https://progresarelectrodomesticos.com/')}
            >
              <Text style={styles.btnMasText}>
                <FontAwesome5 name="plus" size={16} color="#fafafaff" /> Ver más
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: { width: '100%', height: 160, justifyContent: 'flex-end' },
  headerImage: { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    padding: 16,
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Buscador
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: H_PADDING,
    marginTop: 14,
    marginBottom: 4,
    height: 44,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 8
  },

  // Card en fila
  cardRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffffff',
    borderRadius: 16,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: 'center',
    position: 'relative'
  },
  badgeNuevo: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E53935',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },

  imageLeft: { width: 90, height: 90, borderRadius: 10, marginRight: 12 },
  infoRight: { flex: 1 },

  marca: { fontSize: 10, color: '#6B7A40' },
  nombre: { fontSize: 13, fontWeight: '700', color: '#354421', marginVertical: 4 },
  precio: { fontSize: 12, color: '#2E7D32', fontWeight: 'bold' },

  buttonsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  btnWhatsapp: { backgroundColor: '#25D366', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10 },
  btnCarrito: {
    borderWidth: 1, borderColor: '#8BC34A', paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 10, flex: 1, alignItems: 'center'
  },
  btnCarritoText: { color: '#558B2F', fontWeight: 'bold', fontSize: 12 },

  btnMas: {
    backgroundColor: '#9e2021',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
  },
  btnMasText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
