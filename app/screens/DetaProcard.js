import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatGs } from '../components/WalletCard';
import BottomNav from '../components/BottomNav';

const mesesArray = [
  { nombre: 'Enero', numero: 1 },
  { nombre: 'Febrero', numero: 2 },
  { nombre: 'Marzo', numero: 3 },
  { nombre: 'Abril', numero: 4 },
  { nombre: 'Mayo', numero: 5 },
  { nombre: 'Junio', numero: 6 },
  { nombre: 'Julio', numero: 7 },
  { nombre: 'Agosto', numero: 8 },
  { nombre: 'Septiembre', numero: 9 },
  { nombre: 'Octubre', numero: 10 },
  { nombre: 'Noviembre', numero: 11 },
  { nombre: 'Diciembre', numero: 12 },
];

const DetaProcard = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { nro_tarjeta } = route.params;

  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();

  const generarMesesVisibles = () => {
    const resultado = [];
    resultado.push({ nombre: 'Diciembre', numero: 12, anio: anioActual - 1 });
    for (let m = 1; m <= mesActual; m++) {
      const mesObj = mesesArray.find(x => x.numero === m);
      if (mesObj) resultado.push({ nombre: mesObj.nombre, numero: m, anio: anioActual });
    }
    return resultado;
  };

  const [anio, setAnio] = useState(anioActual);
  const [saldoDisponible, setSaldoDisponible] = useState(0);
  const [tarjetaData, setTarjetaData] = useState([]);
  const [cantidadTotal, setCantidadTotal] = useState(0);
  const [montoTotal, setMontoTotal] = useState(0);
  const [error, setError] = useState(false);
  const [mes, setMes] = useState(mesActual);
  const [loading, setLoading] = useState(true);
  const [deudaTotal, setDeudaTotal] = useState(0);
  const [usuario, setUsuario] = useState('');
  const monthScrollRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem('usuarioGuardado')
      .then((doc) => doc && setUsuario(doc))
      .catch((e) => console.log('Error al obtener usuario:', e));
  }, []);

  // El mes actual siempre queda al final de la lista: llevamos el scroll ahí
  // para que se vea seleccionado sin que el usuario tenga que desplazarse.
  useEffect(() => {
    requestAnimationFrame(() => {
      monthScrollRef.current?.scrollToEnd({ animated: false });
    });
  }, []);

  useEffect(() => {
    const fetchData = async (month, year) => {
      setLoading(true);
      try {
        const urlSaldo = `https://api.progresarcorp.com.py/api/obtener_saldo_actual/${nro_tarjeta}`;
        const saldoResponse = await fetch(urlSaldo);

        if (!saldoResponse.ok) {
          throw new Error('Error de respuesta al obtener saldo');
        }
        const saldoData = await saldoResponse.json();
        if (saldoData.cuenta && saldoData.cuenta.disponi_adelanto) {
          setSaldoDisponible(saldoData.cuenta.disponi_adelanto);
          setDeudaTotal(saldoData.cuenta.deuda_total_mas_pendiente || 0);
        } else {
          setError(true);
        }

        const urlMovimientos = `https://api.progresarcorp.com.py/api/ver_moviminetos_procard/${nro_tarjeta}?mes=${month}&year=${year}`;
        const movimientosResponse = await fetch(urlMovimientos);

        if (!movimientosResponse.ok) {
          throw new Error('Error de respuesta al obtener movimientos');
        }
        const movimientosData = await movimientosResponse.json();

        setTarjetaData(movimientosData.movimientos || []);
        setCantidadTotal(movimientosData.cantidad_total || 0);
        setMontoTotal(movimientosData.monto_total || 0);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData(mes, anio);
  }, [nro_tarjeta, mes, anio]);

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
            <Icon name="arrow-left" size={16} color="#9e2021" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Mis movimientos</Text>
            <Text style={styles.headerSubtitle}>Revisá el detalle de tus consumos</Text>
          </View>
        </ImageBackground>

        <View style={styles.sheet}>
          {/* Resumen de saldo */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponible</Text>
            <Text style={styles.balanceAmount}>
              {error ? 'No disponible' : formatGs(saldoDisponible)}
            </Text>
          </View>

          {/* Selector de meses */}
          <ScrollView
            ref={monthScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.monthSelectorWrapper}
            contentContainerStyle={{ paddingRight: 8 }}
          >
            {generarMesesVisibles().map((item) => {
              const selected = mes === item.numero && anio === item.anio;
              return (
                <TouchableOpacity
                  key={`${item.numero}-${item.anio}`}
                  style={[styles.monthButton, selected && styles.monthButtonSelected]}
                  onPress={() => {
                    setMes(item.numero);
                    setAnio(item.anio);
                  }}
                >
                  <Text style={[styles.monthButtonText, selected && styles.monthButtonTextSelected]}>
                    {item.nombre} {item.anio}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Movimientos */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <Icon name="exchange" size={13} color="#9e2021" />
              </View>
              <Text style={styles.sectionTitle}>Movimientos</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#9e2021" style={{ marginVertical: 20 }} />
            ) : tarjetaData.length === 0 ? (
              <Text style={styles.emptyText}>
                Sin movimientos en{' '}
                {mesesArray.find((m) => m.numero === mes)?.nombre || 'este mes'}
              </Text>
            ) : (
              tarjetaData.map((item, index) => {
                const esCredito = parseFloat(item.imp_cupon) < 0;
                return (
                  <View
                    key={index}
                    style={[styles.movementRow, index === tarjetaData.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <View style={styles.movementIconCircle}>
                      <Icon name="money" size={16} color="#9e2021" />
                    </View>
                    <View style={styles.movementInfo}>
                      <Text style={styles.movementDescription} numberOfLines={1}>
                        {item.des_transaccion}
                      </Text>
                      <Text style={styles.movementComercio} numberOfLines={1}>
                        {item.desc_comercio}
                      </Text>
                    </View>
                    <View style={styles.movementRight}>
                      <Text style={[styles.movementAmount, esCredito ? styles.valuePositive : styles.valueNegative]}>
                        {formatGs(item.imp_cupon)}
                      </Text>
                      <Text style={styles.movementDate}>
                        {new Date(item.fec_proceso).toLocaleDateString('es-ES')}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Detalles generales */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <Icon name="info" size={13} color="#9e2021" />
              </View>
              <Text style={styles.sectionTitle}>Detalles generales</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>N° de transacciones</Text>
              <Text style={styles.value}>{cantidadTotal}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Monto total del período</Text>
              <Text style={styles.value}>{formatGs(montoTotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Deuda total</Text>
              <Text style={[styles.value, styles.valueNegative]}>{formatGs(deudaTotal)}</Text>
            </View>
            <View style={[styles.row, { marginBottom: 0 }]}>
              <Text style={styles.label}>Saldo disponible</Text>
              <Text style={[styles.value, styles.valuePositive]}>{formatGs(saldoDisponible)}</Text>
            </View>
          </View>

          {/* Nota informativa */}
          <View style={styles.infoNote}>
            <Icon name="info-circle" size={16} color="#9e2021" style={{ marginRight: 8 }} />
            <Text style={styles.infoNoteText}>
              Los movimientos visualizados son del día anterior.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNav usuario={usuario} />
    </View>
  );
};

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

  // 🔹 Resumen de saldo
  balanceCard: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#efe1e0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#6b5c5d',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#241a1a',
    marginTop: 4,
  },

  // 🔹 Selector de meses
  monthSelectorWrapper: {
    marginBottom: 16,
  },
  monthButton: {
    backgroundColor: 'rgba(158,32,33,0.08)',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  monthButtonSelected: {
    backgroundColor: '#9e2021',
  },
  monthButtonText: {
    color: '#9e2021',
    fontWeight: '600',
    fontSize: 13,
  },
  monthButtonTextSelected: {
    color: '#fff',
  },

  // 🔹 Cards de sección
  sectionCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
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
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b5c5d',
    marginVertical: 10,
  },

  // 🔹 Fila de movimiento
  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5eceb',
  },
  movementIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(158,32,33,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  movementInfo: {
    flex: 1,
    marginRight: 8,
  },
  movementDescription: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#241a1a',
  },
  movementComercio: {
    fontSize: 12,
    color: '#6b5c5d',
    marginTop: 2,
  },
  movementRight: {
    alignItems: 'flex-end',
  },
  movementAmount: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  movementDate: {
    fontSize: 11,
    color: '#6b5c5d',
    marginTop: 2,
  },

  // 🔹 Filas de detalle
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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

  // 🔹 Nota informativa
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(158,32,33,0.06)',
    borderRadius: 14,
    padding: 12,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#6b5c5d',
  },
});

export default DetaProcard;
