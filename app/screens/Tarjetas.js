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

export default class TarjetasScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: 'https://api.progresarcorp.com.py/api/NuestrasTC',
      valid: global.valid_api_key,

      nombre: global.nombre,
      num_doc: global.num_doc,
      num_usu: global.num_usuario,
      cod_cliente: global.codigo_cliente,

      tarjetas: [],
      loading: false,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.cargarTCs();
    }, 1, this);

    setTimeout(() => {
      AsyncStorage.getItem('tarjetas').then((res) => {
        this.setState({
          tarjetas: JSON.parse(res || '[]'),
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
        AsyncStorage.setItem('tarjetas', JSON.stringify(data || []));
      })
      .catch(() => {})
      .finally(() => this.setState({ loading: false }));
  }

  openSolicitud = () => {
    WebBrowser.openBrowserAsync('https://progresarcorp.com.py/solicitud-de-tarjeta/');
  };

  renderItem = ({ item, index }) => {
    return (
      <View style={styles.card}>
        {/* Franja roja lateral */}
        <View style={styles.leftStripe} />

        {/* Header del item con icono */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrap}>
            <FontAwesome5 name="credit-card" size={16} color="#fff" />
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item?.title || 'Tarjeta de crédito'}
          </Text>
        </View>

        {/* Cuerpo */}
        <View style={styles.cardBody}>
          {/* Beneficios */}
          {!!item?.subtitle && (
            <>
              <Text style={styles.sectionTitle}>Beneficios</Text>
              <Text style={styles.bodyText}>{item.subtitle}</Text>
              <View style={styles.separator} />
            </>
          )}

          {/* Cobertura */}
          <Text style={styles.sectionTitle}>Cobertura</Text>
          {!!item?.cobertura ? (
            <Text style={styles.bodyText}>{item.cobertura}</Text>
          ) : (
            <Text style={styles.bodyTextMuted}>No especificado.</Text>
          )}
        </View>

        {/* Footer con CTA */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.footerBtn}
            activeOpacity={0.9}
            onPress={this.openSolicitud}
          >
            <FontAwesome5 name="file-signature" size={14} color="#fff" />
            <Text style={styles.footerBtnText}>Solicitar tarjeta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    const { tarjetas, loading } = this.state;

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* CABECERA GENERAL con ImageBackground */}
          <ImageBackground
            source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/08/inicio.png' }}
            style={styles.headerBackground}
            imageStyle={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
          >
            <View style={styles.headerOverlay} />
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Nuestras Tarjetas</Text>
              <Text style={styles.headerSubtitle}>
                Elegí la tarjeta que va con vos
              </Text>
            </View>
          </ImageBackground>

          {/* Loader */}
          {loading && (
            <View style={styles.loaderBox}>
              <ActivityIndicator color="#bf0404" />
              <Text style={styles.loaderText}>Cargando…</Text>
            </View>
          )}

          {/* Lista */}
          {!loading && (
            <FlatList
              data={tarjetas}
              keyExtractor={(item, idx) => String(item?.id ?? idx)}
              renderItem={this.renderItem}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={{ paddingTop: 10 }}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <FontAwesome5 name="bell-slash" size={18} color="#999" />
                  <Text style={styles.emptyText}>
                    No hay tarjetas disponibles por el momento.
                  </Text>
                </View>
              }
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },

  /* ===== Header general ===== */
  headerBackground: {
    width: '100%',
    height: 160,
    justifyContent: 'flex-end',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(191,4,4,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },

  /* ===== Loader / vacío ===== */
  loaderBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  loaderText: { marginTop: 6, fontSize: 12, color: '#6b7280' },
  emptyBox: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 12, color: '#6b7280' },

  /* ===== Card ===== */
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    // sombra
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  leftStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    zIndex: 1,
  },

  /* Header de cada card */
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  cardIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e88e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  /* Cuerpo */
  cardBody: {
    padding: 14,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bodyText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
  },
  bodyTextMuted: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 19,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f2f4',
    marginVertical: 10,
  },

  /* Footer */
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f2f4',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  footerBtn: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e88e5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    minWidth: 200,
    gap: 8,
  },
  footerBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },

  /* CTA global */
  globalCta: {
    marginTop: 6,
    marginHorizontal: 16,
    backgroundColor: '#bf0404',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globalCtaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
  },
});
