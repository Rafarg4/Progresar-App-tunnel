import React, { useState, useEffect,useRef  } from 'react';
import { View, Text, ScrollView,StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute } from '@react-navigation/native';

const DetaProvard = () => {
  const route = useRoute();
  const { nro_doc, clase_tarjeta,nro_tarjeta } = route.params;
  const [saldoDisponible, setSaldoDisponible] = useState(0); 
  const [tarjetaData, setTarjetaData] = useState([]);
  const [cantidadTotal, setCantidadTotal] = useState(0);
  const [montoTotal, setMontoTotal] = useState(0);
 useEffect(() => {
    // API para obtener el saldo disponible
    const urlSaldo = `https://api.progresarcorp.com.py/api/obtener_saldo_actual/${nro_tarjeta}`;
    
    fetch(urlSaldo)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error de respuesta al obtener saldo');
        }
        return response.json();
      })
      .then((data) => {
        if (data.cuenta && data.cuenta.disponi_adelanto) {
          setSaldoDisponible(data.cuenta.disponi_adelanto);
        } else {
          setError(true);
        }
      })
      .catch((error) => {
        console.error('Error al obtener saldo:', error);
        setError(true);
      });
  }, [nro_tarjeta]); 
  const fetchData = (month, year) => {
    const monthNumber = getMonthNumber(month); // Convertimos el nombre del mes a número
    const url = `https://api.progresarcorp.com.py/api/ver_moviminetos_procard/${nro_tarjeta}?mes=${mes}`;
    console.log("URL solicitada:", url); // Verificar URL en consola y ver si manda la fecha correcta
  
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setTarjetaData(data.detalles || []);
        setCantidadTotal(data.cantidad_total || 0);
        setMontoTotal(data.monto_total || 0);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Selector de meses */}
        <View style={styles.monthSelector}>
          
        </View>

        {/* Card de Movimiento */}
               <View style={styles.movementCard}>
                 
                 <Text style={styles.movementTitle}>Movimientos</Text>
                 <Text style={styles.movementAmount}>{saldoDisponible !== null 
                 ? parseFloat(saldoDisponible).toLocaleString('es-ES') + ' ₲' 
                 : error 
                   ? 'Error al cargar el saldo' 
                   : 'Cargando...'}</Text>
                 <Text style={styles.availableMoney}>Saldo disponible</Text>
                 {/* Footer con el mensaje adicional */}
               </View>
                {/* Detalles de pagos individuales */}
                {tarjetaData.length === 0 ? (
                  <View style={styles.card}>
                    <View style={styles.detailsContainer}>
                      <Icon name="info-circle" size={30} color="grey" style={styles.icon} />
                      <Text style={styles.noMovementsText}>Sin movimientos</Text>
                    </View>
                  </View>
                ) : (
                  tarjetaData.map((item, index) => (
                    <View key={index} style={styles.card}>
                      <View style={styles.detailsContainer}>
                        <View style={styles.qrWrapper}>
                          <Icon name='qrcode' size={30} color='#000' style={styles.qrIcon} />
                        </View>
                        <View style={styles.infoContainer}>
                          <Text style={styles.qrType}>Tipo de QR: {item.tipoqr}</Text>
                          <Text style={styles.description}>{item.des_comercio}</Text>
                        </View>
                        <View style={styles.rightContainer}>
                          <Text style={styles.date}>Fecha: {item.fec_proceso}</Text>
                          <Text style={styles.amount}>-{parseFloat(item.imp_neto).toLocaleString('es-ES')} ₲</Text>
                        </View>
                      </View>
                      <View style={styles.footer}>
                        <Text style={styles.footerText}>Comercio: {item.nombrecomercio}</Text>
                      </View>
                    </View>
                  ))
                )}
       
    {/* Footer con el mensaje adicional */}

        {/* Detalles generales de los pagos */}
        <View style={styles.card}>
          <Text style={styles.generalHeader}>
          <Icon name="info" color="#bf0404" size={20} /> Detalles generales
          </Text>
          </View>
          <View style={styles.card}>
          <View style={styles.generalDetailsContainer}>
            <View style={styles.generalDetailsColumn}>
              <Text style={styles.label}>N° de pagos:</Text>
              <Text style={styles.label}>Monto total:</Text>
              <Text style={styles.label}>Saldo disponible:</Text>
            </View>
            <View style={styles.generalDetailsColumn}>
              <Text style={styles.value}>--</Text>
              <Text style={styles.value}>-- ₲</Text>
              <Text style={styles.value}>{parseFloat(saldoDisponible).toLocaleString('es-ES')} ₲</Text>
            </View>
          </View>
          <View style={styles.footer}>
        <Text style={styles.footerText_importante}><Icon name="info-circle" size={22} color="#000" style={styles.iconStylemov} /> IMPORTANTE: En este apartado solo aparecerán las operaciones por QR.</Text>
      </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
    color: 'red', // Cambia el color del monto a rojo
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
    flex: 1,
  },
  monthSelector: {
    marginBottom: 10,
  },
  monthButton: {
    backgroundColor: '#c00',
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
});

export default DetaProvard;
