import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletCard } from '../components/WalletCard';
import BottomNav from '../components/BottomNav';

export default function MisTarjetas() {
  const [tarjetas, setTarjetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const obtenerTarjetas = async () => {
      try {
        const doc = await AsyncStorage.getItem('usuarioGuardado');
        setUsuario(doc || '');
        if (!doc) {
          setError('Usuario no encontrado en el almacenamiento.');
          setLoading(false);
          return;
        }
        const response = await fetch(`https://api.progresarcorp.com.py/api/ver_tarjeta/${doc}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setTarjetas(data);
        } else if (data && data.nro_tarjeta) {
          setTarjetas([data]);
        }
      } catch (error) {
        console.log('Error al obtener tarjetas:', error);
        setError('No pudimos cargar tus tarjetas.');
      } finally {
        setLoading(false);
      }
    };

    obtenerTarjetas();
  }, []);

  // >>> AQUI la lógica para decidir la pantalla de movimientos
  const handleMovimientos = (t) => {
    const clase = String(t.clase_tarjeta || '');
    const routeName = clase === '1' ? 'DetaBepsa' : 'DetaProcard';
    navigation.navigate(routeName, { nro_tarjeta: t.nro_tarjeta });
  };

  const handleDetalle = (tarjeta) => {
    const clase = String(tarjeta.clase_tarjeta ?? '');
    if (clase === '1') {
      navigation.navigate('DetalleBepsa', { nro_tarjeta: tarjeta.nro_tarjeta, tarjeta });
    } else {
      navigation.navigate('DetalleTarjetas', { tarjeta });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.headerTitle}>Mis tarjetas</Text>
            <Text style={styles.headerSubtitle}>Visualizá tus tarjetas y accedé a sus movimientos</Text>
          </View>
        </ImageBackground>

        <View style={styles.sheet}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tus tarjetas</Text>
            {tarjetas.length > 0 && (
              <View style={styles.cardCountBadge}>
                <Text style={styles.cardCountText}>
                  {tarjetas.length} {tarjetas.length === 1 ? 'tarjeta' : 'tarjetas'}
                </Text>
              </View>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#9e2021" style={{ marginVertical: 30 }} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : tarjetas.length === 0 ? (
            <Text style={styles.errorText}>No tenés tarjetas activas.</Text>
          ) : (
            tarjetas.map((tarjeta) => (
              <View key={tarjeta.nro_tarjeta} style={styles.cardBlock}>
                <WalletCard
                  tarjeta={tarjeta}
                  active={false}
                  onPress={() => handleDetalle(tarjeta)}
                  onEnter={() => handleMovimientos(tarjeta)}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <BottomNav usuario={usuario} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  scrollContainer: {
    paddingBottom: 140,
  },

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

  // 🔹 Hoja de contenido, superpuesta a la foto
  sheet: {
    backgroundColor: '#faf6f5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 22,
    paddingHorizontal: 16,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#241a1a',
  },
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
  errorText: {
    color: '#9e2021',
    textAlign: 'center',
    marginVertical: 10,
  },

  cardBlock: {
    marginBottom: 16,
  },
});
