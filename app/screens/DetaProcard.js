import React, { useState, useEffect,useRef  } from 'react';
import { View, Text, ScrollView,StyleSheet, TouchableOpacity,Linking,Image,Dimensions  } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute } from '@react-navigation/native';

const DetaProcard = () => {
  const route = useRoute();
  const { nro_doc, clase_tarjeta, nro_tarjeta } = route.params;

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

  const [saldoDisponible, setSaldoDisponible] = useState(0);
  const [tarjetaData, setTarjetaData] = useState([]);
  const [cantidadTotal, setCantidadTotal] = useState(0);
  const [montoTotal, setMontoTotal] = useState(0);
  const [error, setError] = useState(false);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [deudaTotal, setDeudaTotal] = useState(0);
  useEffect(() => {
    const fetchData = async (month, year) => {
      setLoading(true); // Empieza la carga
      try {
        // Primero, obtenemos el saldo disponible
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
  
        // Luego, obtenemos los movimientos
        const urlMovimientos = `https://api.progresarcorp.com.py/api/ver_moviminetos_procard/${nro_tarjeta}?mes=${mes}&year=2025`;
        const movimientosResponse = await fetch(urlMovimientos);
  
        if (!movimientosResponse.ok) {
          throw new Error('Error de respuesta al obtener movimientos');
        }
        const movimientosData = await movimientosResponse.json();
  
        // Actualizamos el estado con los datos de la API
        setTarjetaData(movimientosData.movimientos || []);
        setCantidadTotal(movimientosData.cantidad_total || 0);
        setMontoTotal(movimientosData.monto_total || 0);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        setError(true);
      } finally {
        setLoading(false); // Esto se ejecuta independientemente del éxito o error de la carga
      }
    };
  
    fetchData(mes, 2025); // Usamos el mes seleccionado
  }, [nro_tarjeta, mes]);
  
  return (
    
  <View style={styles.container}>
      {/* Cabecera con imagen */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/08/inicio.png' }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <Text style={styles.headerText}>Mis Movimientos</Text>
      </View>

      {/* Selector de meses - fuera del ScrollView principal */}
      <View style={styles.monthSelectorWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthSelector}>
          {mesesArray.map((item) => (
            <TouchableOpacity
              key={item.numero}
              style={[styles.monthButton, mes === item.numero && styles.selectedMonthButton]}
              onPress={() => setMes(item.numero)}
            >
              <Text style={styles.monthButtonText}>{item.nombre} - 2025</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Scroll principal de contenido */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Card de Movimiento */}
        <View style={styles.movementCard}>
          <Text style={styles.movementTitle}>Movimientos</Text>
          <Text style={styles.movementAmount}>
            {saldoDisponible !== null
              ? parseFloat(saldoDisponible).toLocaleString('es-ES') + ' ₲'
              : error
              ? 'Error al cargar el saldo'
              : 'Cargando...'}
          </Text>
          <Text style={styles.availableMoney}>Saldo disponible</Text>
        </View>

        {/* Mostrar movimientos */}
        {loading ? (
          <View style={styles.card}>
            <Text style={styles.generalHeader}>
              <Icon name="refresh" color="#bf0404" size={20} /> Cargando...
            </Text>
          </View>
        ) : tarjetaData.length === 0 ? (
          <View style={styles.card}>
            <View style={styles.detailsContainer}>
              <Icon name="info-circle" size={30} color="grey" style={styles.icon} />
              <Text style={styles.noMovementsText}>
                Sin movimientos en{' '}
                <Text style={{ fontWeight: 'bold' }}>{mesesArray.find((m) => m.numero === mes)?.nombre || 'Mes'}</Text>
              </Text>
            </View>
          </View>
        ) : (
          tarjetaData.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.detailsContainer}>
                <View style={styles.qrWrapper}>
                  <Icon name="money" size={30} color="#000" style={styles.qrIcon} />
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.description}>{item.des_transaccion}</Text>
                </View>
                <View style={styles.rightContainer}>
                  <Text style={styles.date}>Fecha: {new Date(item.fec_proceso).toLocaleDateString('es-ES')}</Text>
                  <Text
                    style={[
                      styles.amount,
                      {
                        color: parseFloat(item.imp_cupon) < 0 ? 'green' : 'red',
                      },
                    ]}
                  >
                    {parseFloat(item.imp_cupon).toLocaleString('es-ES')} ₲
                  </Text>
                </View>
              </View>
              <View style={styles.footer}>
                <Text style={styles.qrType}>Comercio: {item.desc_comercio}</Text>
              </View>
            </View>
          ))
        )}

        {/* Detalles generales */}
        <View style={styles.card}>
          <Text style={styles.generalHeader}>
            <Icon name="info" color="#bf0404" size={20} /> Detalles generales
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.generalDetailsContainer}>
            <View style={styles.generalDetailsColumn}>
              <Text style={styles.label}>N° de transacciones:</Text>
              <Text style={styles.label}>Deuda total:</Text>
              <Text style={styles.label}>Saldo disponible:</Text>
            </View>
            <View style={styles.generalDetailsColumn}>
              <Text style={styles.value}>{cantidadTotal}</Text>
              <Text style={styles.value}>
                  {deudaTotal !== null ? parseFloat(deudaTotal).toLocaleString('es-ES') + ' ₲' : '—'}
              </Text>
              <Text style={styles.value}>
                {saldoDisponible !== null ? parseFloat(saldoDisponible).toLocaleString('es-ES') + ' ₲' : '—'}
              </Text>
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText_importante}>
              <Icon name="info-circle" size={22} color="#000" style={styles.iconStylemov} /> IMPORTANTE: Los movimientos
              visualizados son del día anterior.
            </Text>
          </View>
        </View>
      </ScrollView>
</View>
                
          );
        };

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#fff', // si querés color de fondo
    paddingHorizontal: 0,    // evita que el padding lo achique
    margin: 0,
    width: '100%'            // asegura que ocupe todo el ancho de pantalla
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribuye la etiqueta y el valor a cada lado
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  titlemov: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centra el título y el ícono horizontalmente

  },
  iconStylemov: {
    marginRight: 8, // Espacio entre el ícono y el texto
  },
  titleTextmov: {
    fontSize: 17, // Tamaño de texto aumentado para mayor visibilidad
    fontWeight: 'bold',
    color: '#000',
  },
  card: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  movementCard: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    alignItems: 'center',
  },
  movementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 5,
  },
  movementAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  availableMoney: {
    fontSize: 14,
    color: '#555',
  },
  generalHeader: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  generalDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  generalDetailsColumn: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  qrWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  qrIcon: {
    marginTop: 5,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 2,
    marginRight: 10,
  },
  qrType: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  date: {
    fontSize: 14,
    color: '#555',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    //color: 'red', // Cambia el color del monto a rojo
  },
  footer: {
    marginTop: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerText_importante: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'red',  // Establecer el color a rojo
    textAlign: 'center',  // Centrar el texto
  },
  noMovementsText: {
    // Estilos para el texto "Sin movimientos"
    textAlign: 'center',
    fontSize: 16,
    color: 'grey',
  },
  icon: {
    marginRight: 10,
  },
  scrollView: {
    flexGrow: 120,
  },
  monthSelector: {
    marginBottom: 10,
  },
  monthButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedMonthButton: {
    backgroundColor: '#900',
  },
  monthButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noMovementsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginVertical: 10,
  },
  detailsmovimiento: {
    flexDirection: 'column',
    paddingVertical: 5,
  },
  downloadButton: {
    backgroundColor: '#F40000', // Rojo brillante
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    alignItems: 'center',
  },  
  downloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
 headerContainer: {
  position: 'relative',
  overflow: 'hidden',
  borderBottomLeftRadius: 25,
  borderBottomRightRadius: 25,
  marginBottom: 10, // 👈 agrega este espacio entre imagen y lo demás
},

  cardBackgroundIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.08,
    zIndex: 0
  },
    headerImage: {
      width: Dimensions.get('window').width,
      height: 180,
    },
    headerText: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      color: '#fff',
      fontSize: 26,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0,0,0,0.6)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3
    },
    scrollContainer: {
      padding: 20
    },
});

export default DetaProcard;
