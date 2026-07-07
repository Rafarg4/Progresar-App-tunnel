import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ImageBackground, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletCard, formatGs, enmascararNumero } from '../components/WalletCard';
import BottomNav from '../components/BottomNav';

export default function DetalleTarjetas() {
  const route = useRoute();
  const navigation = useNavigation();
  const { tarjeta } = route.params;

  const [saldoDisponible, setSaldoDisponible] = useState(null);
  const [deudaTotal, setDeudaTotal] = useState(null);
  const [deudaNormal, setDeudaNormal] = useState(null);
  const [lineaCredito, setLineaCredito] = useState(null);
  const [saldoEnMora, setSaldoEnMora] = useState(null);
  const [pagoMinimoPendiente, setPagoMinimoPendiente] = useState(null);
  const [vencimiento, setVencimineto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [puntosMes, setPuntosMes] = useState(0);
  const [puntosUsados, setPuntosUsados] = useState(0);
  const [puntosTotal, setPuntosTotal] = useState(0);
  const [usuario, setUsuario] = useState('');

  // cada punto vale 500 ₲
  const valorPuntosMes = puntosTotal * 50;

  useEffect(() => {
    AsyncStorage.getItem('usuarioGuardado')
      .then((doc) => doc && setUsuario(doc))
      .catch((e) => console.log('Error al obtener usuario:', e));
  }, []);

  useEffect(() => {
    const fetchSaldo = async () => {
      try {
        const response = await fetch(`https://api.progresarcorp.com.py/api/obtener_saldo_actual/${tarjeta.nro_tarjeta}`);
        if (!response.ok) {
          throw new Error('Error en la respuesta');
        }

        const data = await response.json();

        if (data.cuenta) {
          setSaldoDisponible(data.cuenta.disponi_adelanto || 0);
          setDeudaTotal(data.cuenta.deuda_total_mas_pendiente || 0);
          setDeudaNormal(data.cuenta.saldo_ultimo_resultado || 0);
          setLineaCredito(data.cuenta.linea_de_credito || 0);
          setSaldoEnMora(data.cuenta.saldo_en_mora || 0);
          setPagoMinimoPendiente(data.cuenta.pago_minimo_pendiente || 0);
          setVencimineto(data.cuenta.venci_de_extracto_cuenta || 0);
        } else {
          setError(true);
        }
      } catch (e) {
        console.error('Error al obtener datos de la tarjeta:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (tarjeta?.nro_tarjeta) {
      fetchSaldo();
    }
  }, [tarjeta?.nro_tarjeta]);

  useEffect(() => {
    const fetchProgrePuntos = async () => {
      try {
        const response = await fetch(
          `https://api.progresarcorp.com.py/api/ver_progre_puntos/${tarjeta.nro_tarjeta}`
        );

        if (!response.ok) {
          throw new Error('Error al obtener progrepuntos');
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setPuntosMes(Number(data[0].puntos_mes) || 0);
          setPuntosUsados(Number(data[0].puntos_usados) || 0);
          setPuntosTotal(Number(data[0].puntos_total) || 0);
        } else {
          setPuntosMes(0);
          setPuntosUsados(0);
          setPuntosTotal(0);
        }
      } catch (error) {
        console.error('Error Progrepuntos:', error);
      }
    };

    if (tarjeta?.nro_tarjeta) {
      fetchProgrePuntos();
    }
  }, [tarjeta?.nro_tarjeta]);

  const tieneMora = Number(saldoEnMora) > 0;

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
            <Text style={styles.headerTitle}>Detalle de tarjeta</Text>
            <Text style={styles.headerSubtitle}>
              {enmascararNumero(tarjeta.nro_tarjeta)}
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.sheet}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9e2021" />
            </View>
          ) : error ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>No se pudo cargar los datos</Text>
            </View>
          ) : (
            <>
              <WalletCard
                tarjeta={tarjeta}
                active
                onPress={() => {}}
                disponibleOverride={saldoDisponible}
              />

              {/* Accesos rápidos */}
              <View style={styles.segmentedContainer}>
                <TouchableOpacity
                  style={styles.segment}
                  onPress={() => navigation.navigate('DetaProcard', { nro_tarjeta: tarjeta.nro_tarjeta })}
                  activeOpacity={0.7}
                >
                  <FontAwesome5 name="list-alt" size={16} color="#9e2021" />
                  <Text style={styles.segmentLabel}>Movimientos</Text>
                </TouchableOpacity>

                <View style={styles.segmentDivider} />

                <TouchableOpacity
                  style={styles.segment}
                  onPress={() => navigation.navigate('Extracto')}
                  activeOpacity={0.7}
                >
                  <FontAwesome5 name="file-alt" size={16} color="#9e2021" />
                  <Text style={styles.segmentLabel}>Extracto</Text>
                </TouchableOpacity>

                <View style={styles.segmentDivider} />

                <TouchableOpacity
                  style={styles.segment}
                  onPress={() => navigation.navigate('SolicitudAdelanto', { tarjeta })}
                  activeOpacity={0.7}
                >
                  <FontAwesome5 name="hand-holding-usd" size={16} color="#9e2021" />
                  <Text style={styles.segmentLabel}>Adelanto</Text>
                </TouchableOpacity>
              </View>

              {/* Aviso de mora (solo si hay saldo vencido) */}
              {tieneMora && (
                <View style={styles.moraBanner}>
                  <FontAwesome5 name="exclamation-triangle" size={14} color="#9e2021" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moraTitle}>Tenés un saldo en mora</Text>
                    <Text style={styles.moraAmount}>{formatGs(saldoEnMora)}</Text>
                  </View>
                </View>
              )}

              {/* Información financiera */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBadge}>
                    <FontAwesome5 name="chart-pie" size={13} color="#9e2021" />
                  </View>
                  <Text style={styles.sectionTitle}>Información financiera</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Línea de crédito</Text>
                  <Text style={styles.value}>{formatGs(lineaCredito)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Deuda total</Text>
                  <Text style={[styles.value, styles.valueNegative]}>{formatGs(deudaTotal)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Deuda normal</Text>
                  <Text style={[styles.value, styles.valueNegative]}>{formatGs(deudaNormal)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Pago mínimo pendiente</Text>
                  <Text style={styles.value}>{formatGs(pagoMinimoPendiente)}</Text>
                </View>
                <View style={[styles.row, { marginBottom: 0 }]}>
                  <View style={styles.labelWithIcon}>
                    <FontAwesome5 name="calendar-alt" size={11} color="#6b5c5d" style={{ marginRight: 6 }} />
                    <Text style={styles.label}>Vencimiento de extracto</Text>
                  </View>
                  <Text style={[styles.value, styles.valuePositive]}>{vencimiento}</Text>
                </View>
              </View>

              {/* ProgrePuntos */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconBadge}>
                    <FontAwesome5 name="star" size={12} color="#9e2021" />
                  </View>
                  <Text style={styles.sectionTitle}>ProgrePuntos</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Puntos del mes</Text>
                  <Text style={styles.value}>{puntosMes}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Valor equivalente</Text>
                  <Text style={[styles.value, styles.valuePositive]}>{formatGs(valorPuntosMes)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Puntos utilizados</Text>
                  <Text style={[styles.value, styles.valueNegative]}>{puntosUsados}</Text>
                </View>
                <View style={[styles.row, { marginBottom: 0 }]}>
                  <Text style={styles.label}>Total puntos acumulados</Text>
                  <Text style={[styles.value, styles.valuePositive]}>{puntosTotal}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <BottomNav usuario={usuario} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  loadingContainer: { paddingVertical: 60, justifyContent: 'center', alignItems: 'center' },
  errorText: { textAlign: 'center', fontSize: 15, color: '#9e2021' },

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
    letterSpacing: 1,
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

  // 🔹 Cards de sección
  sectionCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
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
    marginBottom: 12,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
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
  valuePositive: {
    color: '#3f8f5f',
  },
  valueNegative: {
    color: '#9e2021',
  },

  // 🔹 Aviso de mora
  moraBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(158,32,33,0.08)',
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  moraTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#9e2021',
  },
  moraAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9e2021',
    marginTop: 2,
  },

  // 🔹 Accesos rápidos (píldora segmentada)
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 18,
    marginTop: 16,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  segmentDivider: {
    width: 1,
    backgroundColor: '#efe1e0',
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#241a1a',
    marginTop: 6,
    textAlign: 'center',
  },
});
