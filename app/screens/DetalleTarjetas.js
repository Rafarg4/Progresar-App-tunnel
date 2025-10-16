import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function DetalleTarjetas() {
  const route = useRoute();
  const navigation = useNavigation();
  const { tarjeta } = route.params;
  const nro_tarjeta = tarjeta.nro_tarjeta;
  const [saldoDisponible, setSaldoDisponible] = useState(null);
  const [deudaTotal, setDeudaTotal] = useState(null);
  const [deudaNormal, setDeudaNormal] = useState(null);
  const [lineaCredito, setLineaCredito] = useState(null);
  const [saldoEnMora, setSaldoEnMora] = useState(null);
  const [pagoMinimoPendiente, setPagoMinimoPendiente] = useState(null);
  const [vencimiento, setVencimineto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [usuario, setUsuario] = useState('');
    const nombresTarjeta = {
        JM: 'CLÁSICA',
        '1': 'DINELCO',
        TR: 'LA TRINIDAD',
        M2: 'PROGAR',
        J5: 'EDT',
        J0: 'EMPRESARIAL',
        JW: 'MUJER',
        FR: 'AFUNI',
        J7: 'FEP',
        RC: 'ROTARY',
        RM: 'ROTARY',
        V6: 'VISA',
        TS: 'COMEDI',
        LE: 'LINALU',
        EV: 'EL VIAJERO',
        EI: 'VISA EMPRESARIAL'
    };
useEffect(() => {
  const obtenerDatos = async () => {
    try {
      const nombreGuardado = await AsyncStorage.getItem('nombreUsuario');
      const usuarioGuardado = await AsyncStorage.getItem('usuarioGuardado');

      if (nombreGuardado) setNombre(nombreGuardado);
      if (usuarioGuardado) setUsuario(usuarioGuardado);
    } catch (error) {
      console.log('Error al obtener datos de AsyncStorage:', error);
    }
  };

  obtenerDatos();
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

  const formatearNumero = (num) => {
    return num.toLocaleString('es-ES') + ' ₲';
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
            source={require('../assets/inicio.png')}  
          style={styles.headerImage}
        />
        <Text style={styles.headerText}>Detalle de Tarjeta # {tarjeta.nro_tarjeta?.slice(-4)}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>No se pudo cargar los datos</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Tarjeta visual */}
          <View style={[styles.cardContainer, { backgroundColor: '#9e2021' }]}>
            <FontAwesome5 name="credit-card" size={120} color="#fff" style={styles.cardBackgroundIcon} />
            <View style={styles.cardIconContainer}>
              <FontAwesome5 name="credit-card" size={28} color="#fff" />
            </View>
            <Text style={styles.cardBrand}> {nombresTarjeta[tarjeta.clase_tarjeta] || 'Desconocido'}</Text>
            <Text style={styles.cardNumber}>
                **** **** **** {tarjeta.nro_tarjeta?.slice(-4)}
            </Text>
            <Text style={styles.cardHolder}>{tarjeta.nombre_usuario}</Text>
          </View>

          {/* Información financiera */}
          <View style={styles.infoBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Línea de crédito:</Text>
              <Text style={styles.value}>{formatearNumero(lineaCredito)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Saldo disponible:</Text>
              <Text style={[styles.value, { color: 'green' }]}>{formatearNumero(saldoDisponible)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Deuda total:</Text>
              <Text style={[styles.value, { color: 'red' }]}>{formatearNumero(deudaTotal)}</Text>
            </View>
             <View style={styles.row}>
              <Text style={styles.label}>Deuda normal:</Text>
              <Text style={[styles.value, { color: 'red' }]}>{formatearNumero(deudaNormal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Saldo en mora:</Text>
              <Text style={[styles.value, { color: 'red' }]}>{formatearNumero(saldoEnMora)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Pago mínimo pendiente:</Text>
              <Text style={styles.value}>{formatearNumero(pagoMinimoPendiente)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Vencimiento de extracto:</Text>
              <Text style={[styles.value, { color: 'green' }]}>{vencimiento}</Text>
            </View>
            {/* Footer con botones */}
           <View style={styles.footerButtons}>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('DetaProcard', { nro_tarjeta: tarjeta.nro_tarjeta })}
            >
                <FontAwesome5 name="list-alt" size={18} color="#fff" style={styles.iconButton} />
                <Text style={styles.actionText}>Movimientos</Text>
            </TouchableOpacity>

           <TouchableOpacity
                style={styles.actionButton}
                onPress={() => 
                    navigation.navigate('Extracto')
                }
            >
                <FontAwesome5 name="file-alt" size={18} color="#fff" style={styles.iconButton} />
                <Text style={styles.actionText}>Extracto</Text>
            </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
 footerButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 10, // Espacio entre los botones (si tu versión de React Native no soporta 'gap', usar 'marginRight' en el primero)
  marginTop: 20,
},

actionButton: {
  flex: 1, // Mismo ancho para ambos
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#9e2021',
  paddingVertical: 12,
  borderRadius: 8,
},
actionText: {
  color: '#fff',
  fontWeight: 'bold',
},
iconButton: {
  marginRight: 8,
},
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25
  },
  headerImage: {
    width: Dimensions.get('window').width,
    height: 160,
  },
  headerText: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scrollContainer: {
    padding: 20,
  },
  cardContainer: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    position: 'relative',
  },
  cardIconContainer: {
    marginBottom: 12,
    zIndex: 2,
  },
  cardBackgroundIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.1,
    zIndex: 0,
  },
  cardBrand: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardNumber: {
    fontSize: 18,
    color: '#fff',
    letterSpacing: 2,
    marginVertical: 5,
  },
  cardHolder: {
    color: '#fff',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#444',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
  }
});
