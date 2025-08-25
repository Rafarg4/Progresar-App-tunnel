import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet,TouchableOpacity,Linking,Image,Dimensions   } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute } from '@react-navigation/native';

const DetaBepsa = () => {
    const route = useRoute();
    const { nro_doc, clase_tarjeta, nro_tarjeta } = route.params;
    const [tarjetaData, setTarjetaData] = useState([]);
    const [cantidadTotal, setCantidadTotal] = useState(0);
    const [montoTotal, setMontoTotal] = useState(0);
    const [deudaTotal, setDeudaTotal] = useState(0); 
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(true);
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
  const [nroUsuario, setNroUsuario] = useState(null);

  // Para descargar el extracto
const handleDownload = () => {
  if (!nro_tarjeta) {
    console.warn('El nroUsuario aún no está disponible.');
    return;
  }

  const url = `https://api.progresarcorp.com.py/Extractos/Bepsa/2025/${mes}/${nro_tarjeta}.pdf`;

  console.log('Abriendo URL:', url);

  Linking.openURL(url).catch(err => console.error('Error al abrir el enlace:', err));
};

  useEffect(() => {
    fetchData();
}, [mes]);  // Se ejecuta cada vez que cambia el mes

const fetchData = async () => {
  setLoading(true);
  const url = `https://api.progresarcorp.com.py/api/ver_moviminetos_bepsa/${nro_tarjeta}?mes=${mes}`;  

  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setTarjetaData(data.movimientos);

      if (data.tarjeta && data.tarjeta[0] && data.tarjeta[0].saldo) {
          setMontoTotal(parseFloat(data.tarjeta[0].saldo) || 0);
          setDeudaTotal(parseFloat(data.tarjeta[0].deuda_total) || 0);
      } else {
          console.log('Saldo no disponible');
          setMontoTotal(0);
          setDeudaTotal(0);
      }

      setCantidadTotal(data.movimientos.length);
  } catch (error) {
      console.error('Error fetching data:', error);
  } finally {
      setLoading(false);
  }
};
   return (
  <View style={styles.container}>
    {/* Cabecera con imagen */}
    <View style={styles.headerContainer}>
      <Image
           source={require('../assets/inicio.png')}  
        style={styles.headerImage}
        resizeMode="cover"
      />
      <Text style={styles.headerText}>
        Mis Movimientos 
      </Text>
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

    <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
      >
      <View style={styles.movementCard}>
        <Text style={styles.movementTitle}>Movimientos</Text>
        <Text style={styles.movementAmount}>
          {montoTotal && !isNaN(montoTotal) ? montoTotal.toLocaleString('es-ES') : '0'} ₲
        </Text>
        <Text style={styles.availableMoney}>Saldo disponible</Text>
        {/* Botón para descargar extracto 
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Text style={styles.downloadButtonText}>
            <Icon name="file-pdf-o" color="#fff" size={18} /> Descargar Extracto
          </Text>
        </TouchableOpacity>*/}
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
              <Text style={{ fontWeight: 'bold' }}>
                {({
                  '1': 'Enero',
                  '2': 'Febrero',
                  '3': 'Marzo',
                  '4': 'Abril',
                  '05': 'Mayo',
                  '06': 'Junio',
                  '07': 'Julio',
                  '08': 'Agosto',
                  '09': 'Septiembre',
                  '10': 'Octubre',
                  '11': 'Noviembre',
                  '12': 'Diciembre'
                }[mes] || 'Mes desconocido')}
              </Text>
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
                <Text style={styles.date}>
                  Fecha: {new Date(item.fec_proceso).toLocaleDateString('es-ES')}
                </Text>
                <Text style={styles.amount}>
                  {parseFloat(item.imp_neto).toLocaleString('es-ES')} ₲
                </Text>
              </View>
            </View>
            <View style={styles.footer}>
              <Text style={styles.qrType}>Comercio: {item.desc_comercio}</Text>
            </View>
          </View>
        ))
      )}

      <View style={styles.card}>
        <Text style={styles.generalHeader}>
          <Icon name="info" color="#bf0404" size={20} /> Detalles generales
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.generalDetailsContainer}>
          <View style={styles.generalDetailsColumn}>
            <Text style={styles.label}>N° de transacciones:</Text>
            <Text style={styles.label}>Monto total:</Text>
            <Text style={styles.label}>Disponible:</Text>
          </View>
          <View style={styles.generalDetailsColumn}>
            <Text style={styles.value}>{cantidadTotal}</Text>
            <Text style={styles.value}>
              {deudaTotal && !isNaN(deudaTotal) ? deudaTotal.toLocaleString('es-ES') : '0'} ₲
            </Text>
            <Text style={styles.value}>
              {montoTotal && !isNaN(montoTotal) ? montoTotal.toLocaleString('es-ES') : '0'} ₲
            </Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText_importante}>
            <Icon name="info-circle" size={22} color="#000" style={styles.iconStylemov} />{' '}
            IMPORTANTE: Los movimientos visualizados son del día anterior.
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
    backgroundColor: '#9e2021',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedMonthButton: {
    backgroundColor: 'rgba(176, 161, 161, 1)',
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

export default DetaBepsa;
