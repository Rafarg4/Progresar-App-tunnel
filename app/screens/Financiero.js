import React, { Component } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import * as global from '../global.js';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView } from 'react-native-virtualized-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

export default class TarjetasScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: 'https://api.progresarcorp.com.py/api/NuestrosServ',
      valid: global.valid_api_key,

      nombre: global.nombre,
      num_doc: global.num_doc,
      num_usu: global.num_usuario,
      cod_cliente: global.codigo_cliente,

      financiero: [],
      loading: false,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.cargarTCs();
    }, 1, this);

    setTimeout(() => {
      AsyncStorage.getItem('financiero').then((res) => {
        this.setState({
          financiero: JSON.parse(res || '[]'),
          loading: false,
        });
      });
    }, 1000, this);
  }

  cargarTCs() {
    this.setState({ loading: true });
    fetch(this.state.url, { method: 'get' })
      .then((response) => response.json())
      .then((data) => {
        AsyncStorage.setItem('financiero', JSON.stringify(data || []));
      })
      .catch(() => {})
      .finally(() => this.setState({ loading: false }));
  }

  openSolicitud = () => {
    WebBrowser.openBrowserAsync('https://progresarcorp.com.py/prestamos#solicitar-prestamo');
  };

  renderItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={this.openSolicitud}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <FontAwesome5 name="hand-holding-usd" size={15} color="#9e2021" />
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item?.title || 'Crédito'}
          </Text>
          <FontAwesome5 name="chevron-right" size={13} color="#6b5c5d" />
        </View>

        {!!item?.subtitle && (
          <Text style={styles.cardSectionText}>{item.subtitle}</Text>
        )}

        {!!item?.cobertura && (
          <View style={styles.cardSection}>
            <Text style={styles.cardSectionLabel}>Requisitos</Text>
            <Text style={styles.cardSectionText}>{item.cobertura}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  render() {
    const { financiero, loading, num_doc } = this.state;

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
          <ImageBackground
            source={require('../assets/inicio_nuevo.png')}
            style={styles.headerBackground}
            imageStyle={styles.headerImage}
          >
            <View style={styles.headerOverlay} />
            <TouchableOpacity style={styles.backButton} onPress={() => this.props.navigation?.goBack()}>
              <FontAwesome5 name="arrow-left" size={16} color="#9e2021" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Nuestros servicios</Text>
              <Text style={styles.headerSubtitle}>Elegí la mejor opción para vos</Text>
            </View>
          </ImageBackground>

          <View style={styles.sheet}>
            {loading && (
              <View style={styles.loaderBox}>
                <ActivityIndicator color="#9e2021" />
                <Text style={styles.loaderText}>Cargando…</Text>
              </View>
            )}

            {!loading && (
              <FlatList
                data={financiero}
                keyExtractor={(item, idx) => String(item?.id ?? idx)}
                renderItem={this.renderItem}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyBox}>
                    <FontAwesome5 name="bell-slash" size={18} color="#6b5c5d" />
                    <Text style={styles.emptyText}>No hay productos disponibles por el momento.</Text>
                  </View>
                }
              />
            )}
          </View>
        </ScrollView>

        <BottomNav usuario={num_doc} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // 🔹 Encabezado
  headerBackground: {
    width: '100%',
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
    backgroundColor: '#faf6f5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 16,
    paddingBottom: 10,
  },

  // 🔹 Loader / vacío
  loaderBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  loaderText: { marginTop: 6, fontSize: 12, color: '#6b5c5d' },
  emptyBox: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 12, color: '#6b5c5d' },

  // 🔹 Card (tocable, con toda la info)
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(158,32,33,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#241a1a',
    marginRight: 8,
  },
  cardSection: {
    marginTop: 8,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9e2021',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  cardSectionText: {
    fontSize: 13,
    color: '#6b5c5d',
    lineHeight: 18,
  },
});
