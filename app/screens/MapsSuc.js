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
  Linking,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MapsSuc() {
  const navigation = useNavigation();
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagenesConError, setImagenesConError] = useState({});

  const cargarSucursales = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://api.progresarcorp.com.py/api/ConsultaSuc');
      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];
      setSucursales(lista);
      AsyncStorage.setItem('sucursal', JSON.stringify(lista)).catch(() => {});
    } catch (e) {
      console.log('Error al obtener sucursales:', e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSucursales();
  }, []);

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
          <Text style={styles.headerTitle}>Nuestras sucursales</Text>
          <Text style={styles.headerSubtitle}>Encontranos cerca tuyo</Text>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9e2021" />
            <Text style={styles.loadingText}>Cargando sucursales...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {sucursales.length === 0 ? (
              <View style={styles.emptyCard}>
                <FontAwesome5 name="map-marker-alt" size={36} color="#9e2021" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>Sin sucursales</Text>
                <Text style={styles.emptyText}>No pudimos cargar las sucursales por ahora.</Text>

                <TouchableOpacity style={styles.emptyButton} onPress={cargarSucursales}>
                  <FontAwesome5 name="redo" size={14} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.emptyButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              sucursales.map((item, index) => {
                const key = item.id ?? index;
                const mostrarLogo = !item.uri || imagenesConError[key];
                return (
                <View key={key} style={styles.sucCard}>
                  {mostrarLogo ? (
                    <View style={styles.sucImageLogoWrap}>
                      <Image
                        source={require('../assets/logo-progre.png')}
                        style={styles.sucImageLogo}
                        resizeMode="contain"
                      />
                    </View>
                  ) : (
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.sucImage}
                      resizeMode="cover"
                      onError={() => setImagenesConError((prev) => ({ ...prev, [key]: true }))}
                    />
                  )}

                  <View style={{ padding: 16 }}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionIconBadge}>
                        <FontAwesome5 name="store" size={13} color="#9e2021" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sucTitle}>{item.title}</Text>
                        {!!item.subtitle && <Text style={styles.sucSubtitle}>{item.subtitle}</Text>}
                      </View>
                    </View>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => Linking.openURL('tel:' + item.telef)}
                        activeOpacity={0.85}
                      >
                        <FontAwesome5 name="phone" size={14} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.actionButtonText}>{item.telef}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonSecondary]}
                        onPress={() =>
                          WebBrowser.openBrowserAsync(
                            'https://www.google.com/maps/d/embed?mid=19SIFGnUrWm6j809wMeJxOt0ho8bFo8jZ&ehbc=2E312F'
                          )
                        }
                        activeOpacity={0.85}
                      >
                        <FontAwesome5 name="map-marked-alt" size={14} color="#9e2021" style={{ marginRight: 8 }} />
                        <Text style={styles.actionButtonSecondaryText}>Ver ubicación</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
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
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9e2021', marginTop: 10, fontWeight: '500' },
  scrollContainer: { padding: 16 },

  // 🔹 Card de sucursal
  sucCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
  },
  sucImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0e4e3',
  },
  sucImageLogoWrap: {
    width: '100%',
    height: 150,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  sucImageLogo: {
    width: '60%',
    height: '60%',
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
  sucTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#241a1a',
  },
  sucSubtitle: {
    fontSize: 12,
    color: '#6b5c5d',
    marginTop: 1,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#9e2021',
    paddingVertical: 11,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12.5,
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(158,32,33,0.08)',
  },
  actionButtonSecondaryText: {
    color: '#9e2021',
    fontWeight: '700',
    fontSize: 12.5,
  },

  // 🔹 Estado vacío
  emptyCard: {
    borderRadius: 18,
    padding: 24,
    marginTop: 30,
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
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9e2021',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#9e2021',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  emptyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
