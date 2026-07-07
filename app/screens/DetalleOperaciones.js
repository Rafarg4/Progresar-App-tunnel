import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatGs } from '../components/WalletCard';
import BottomNav from '../components/BottomNav';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function DetalleOperaciones() {
  const route = useRoute();
  const navigation = useNavigation();
  const { cod_cliente, nro_comprobante } = route.params;

  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [total, setTotal] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [diasAtraso, setDiasAtraso] = useState(0);
  const [filtro, setFiltro] = useState('todos');
  const [usuario, setUsuario] = useState('');

  const cuotasFiltradas = cuotas.filter(cuota => {
    const pagado = Number(cuota.saldo_cuota) === 0;
    if (filtro === 'pagados') return pagado;
    if (filtro === 'pendientes') return !pagado;
    return true;
  });

  useEffect(() => {
    AsyncStorage.getItem('usuarioGuardado')
      .then((doc) => doc && setUsuario(doc))
      .catch((e) => console.log('Error al obtener usuario:', e));
  }, []);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const url = `https://api.progresarcorp.com.py/api/detalles_operaciones?cod_cliente=${cod_cliente}&nro_comprobante=${nro_comprobante}`;
        const response = await fetch(url);
        const data = await response.json();

        if (Array.isArray(data)) {
          setCuotas(data);
          calcularResumen(data);
        } else if (data && data.nro_cuota) {
          setCuotas([data]);
          calcularResumen([data]);
        }
      } catch (error) {
        console.log('Error al obtener detalles de operación:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [cod_cliente, nro_comprobante]);

  const calcularResumen = (cuotas) => {
    const total = cuotas.reduce((sum, c) => sum + Number(c.monto_cuota || 0), 0);
    const saldo = cuotas.reduce((sum, c) => sum + Number(c.saldo_cuota || 0), 0);

    const hoy = new Date();
    const cuotasVencidas = cuotas.filter(c => {
      const venc = new Date(c.fec_vencimiento.split('/').reverse().join('-'));
      return venc < hoy && Number(c.saldo_cuota) > 0;
    });

    let diasAtraso = 0;
    if (cuotasVencidas.length > 0) {
      const primeraVencida = new Date(cuotasVencidas[0].fec_vencimiento.split('/').reverse().join('-'));
      const diferencia = hoy - primeraVencida;
      diasAtraso = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    }

    setTotal(total);
    setSaldo(saldo);
    setDiasAtraso(diasAtraso);
  };

  const toggleExpand = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
          <Text style={styles.headerTitle}>Detalle de operación</Text>
          <Text style={styles.headerSubtitle}>Comprobante #{nro_comprobante}</Text>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9e2021" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Filtro de cuotas */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, filtro === 'todos' && styles.filterButtonActive]}
                onPress={() => setFiltro('todos')}
              >
                <Text style={[styles.filterText, filtro === 'todos' && styles.filterTextActive]}>Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filtro === 'pagados' && styles.filterButtonActive]}
                onPress={() => setFiltro('pagados')}
              >
                <Text style={[styles.filterText, filtro === 'pagados' && styles.filterTextActive]}>Pagados</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filtro === 'pendientes' && styles.filterButtonActive]}
                onPress={() => setFiltro('pendientes')}
              >
                <Text style={[styles.filterText, filtro === 'pendientes' && styles.filterTextActive]}>Pendientes</Text>
              </TouchableOpacity>
            </View>

            {/* Acordeón de cuotas */}
            {cuotasFiltradas.map((cuota, index) => {
              const isPagado = Number(cuota.saldo_cuota) === 0;
              const expanded = expandedIndex === index;

              return (
                <TouchableOpacity key={index} onPress={() => toggleExpand(index)} activeOpacity={0.85}>
                  <View style={styles.cuotaCard}>
                    <View style={styles.row}>
                      <Text style={styles.cuotaTitle}>
                        Cuota {cuota.nro_cuota}/{cuota.nro_cuota_cab}
                      </Text>
                      <View style={styles.statusRow}>
                        <View style={[styles.badge, isPagado ? styles.badgePagado : styles.badgePendiente]}>
                          <Text style={styles.badgeText}>{isPagado ? 'Pagado' : 'Pendiente'}</Text>
                        </View>
                        <FontAwesome5
                          name={expanded ? 'chevron-up' : 'chevron-down'}
                          size={13}
                          color="#6b5c5d"
                          style={{ marginLeft: 10 }}
                        />
                      </View>
                    </View>

                    {expanded && (
                      <View style={styles.cuotaDetails}>
                        <View style={styles.row}>
                          <Text style={styles.label}>Fecha de cuota</Text>
                          <Text style={styles.value}>{cuota.fec_origen}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.label}>Fecha de vencimiento</Text>
                          <Text style={styles.value}>{cuota.fec_vencimiento}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.label}>Monto cuota</Text>
                          <Text style={styles.value}>{formatGs(cuota.monto_cuota)}</Text>
                        </View>
                        <View style={[styles.row, { marginBottom: 0 }]}>
                          <Text style={styles.label}>Saldo cuota</Text>
                          <Text style={[styles.value, !isPagado && styles.valueNegative]}>
                            {formatGs(cuota.saldo_cuota)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Resumen */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBadge}>
                  <FontAwesome5 name="file-invoice" size={13} color="#9e2021" />
                </View>
                <Text style={styles.sectionTitle}>Resumen de la operación</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Total operación</Text>
                <Text style={styles.value}>{formatGs(total)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Saldo pendiente</Text>
                <Text style={[styles.value, styles.valueNegative]}>{formatGs(saldo)}</Text>
              </View>
              <View style={[styles.row, { marginBottom: 0 }]}>
                <Text style={styles.label}>Días de atraso</Text>
                <Text style={[styles.value, diasAtraso > 0 && styles.valueNegative]}>
                  {diasAtraso} día{diasAtraso === 1 ? '' : 's'}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      <BottomNav usuario={usuario} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

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

  scrollContainer: { padding: 16, paddingBottom: 140 },

  // 🔹 Filtro de cuotas
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(158,32,33,0.08)',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 16,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#9e2021',
  },
  filterText: {
    color: '#9e2021',
    fontWeight: '600',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#fff',
  },

  // 🔹 Cuotas
  cuotaCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#fff',
  },
  badgePagado: {
    backgroundColor: '#3f8f5f',
  },
  badgePendiente: {
    backgroundColor: '#d9a441',
  },
  cuotaTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#241a1a',
  },
  cuotaDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5eceb',
  },

  // 🔹 Resumen
  sectionCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 18,
    padding: 16,
    marginTop: 6,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#241a1a',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#6b5c5d',
  },
  value: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#241a1a',
  },
  valueNegative: {
    color: '#9e2021',
  },
});
