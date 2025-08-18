import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DetalleTarjetas() {
  const route = useRoute();
  const navigation = useNavigation();
  const { tarjeta } = route.params;
  const nro_tarjeta = tarjeta.nro_tarjeta;

  const [saldoDisponible, setSaldoDisponible] = useState(0);
  const [deudaTotal, setDeudaTotal] = useState(0);
  const [lineaCredito, setLineaCredito] = useState(0);
  const [saldoEnMora, setSaldoEnMora] = useState(0);
  const [pagoMinimoPendiente, setPagoMinimoPendiente] = useState(0);
  const [vencimiento, setVencimiento] = useState('-');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [usuario, setUsuario] = useState('');

  // helper: número seguro
  const toNumber = (v) => {
    if (v === null || v === undefined) return 0;
    const s = String(v).replace(/[^\d.-]/g, ''); // limpia separadores si vinieran
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  };

  useEffect(() => {
    (async () => {
      try {
        const usuarioGuardado = await AsyncStorage.getItem('usuarioGuardado');
        if (usuarioGuardado) setUsuario(usuarioGuardado);
      } catch (e) {
        console.log('AsyncStorage error:', e);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchSaldo = async () => {
      try {
        // >>> Usa el usuario del storage (ajusta el endpoint si fuera por tarjeta)
        const url = `https://api.progresarcorp.com.py/api/ver_tc/${encodeURIComponent(usuario)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('HTTP ' + response.status);

        const data = await response.json();

        // Soporta 3 formas: array, objeto único o el viejo formato {cuenta:{...}}
        let item = null;

        if (Array.isArray(data)) {
          // Si viene un array, busco la tarjeta actual
          item = data.find(x => String(x.nro_tarjeta) === String(nro_tarjeta)) || data[0];
        } else if (data && data.cuenta) {
          // Formato viejo (por si reaparece)
          const c = data.cuenta;
          const linea = toNumber(c.linea_de_credito);
          const deuda = toNumber(c.deuda_total_mas_pendiente);
          setLineaCredito(linea);
          setDeudaTotal(deuda);
          setSaldoDisponible(Math.max(linea - deuda, 0));
          setSaldoEnMora(toNumber(c.saldo_en_mora));
          setPagoMinimoPendiente(toNumber(c.pago_minimo_pendiente));
          setVencimiento(c.venci_de_extracto_cuenta || '-');
          setError(false);
          return;
        } else if (data && data.nro_tarjeta) {
          item = data;
        }

        if (!item) throw new Error('Sin item');

        // Nuevo formato (el que mostraste)
        const linea = toNumber(item.limite_credito);
        const deuda = toNumber(item.deuda_total);
        setLineaCredito(linea);
        setDeudaTotal(deuda);
        setSaldoDisponible(Math.max(linea - deuda, 0));
        setSaldoEnMora(toNumber(item.saldo_mora));
        setPagoMinimoPendiente(toNumber(item.pago_min));
        setVencimiento(item.vencimiento || '-'); // si algún día llega
        setError(false);
      } catch (e) {
        console.error('Error al obtener datos de la tarjeta:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (usuario) fetchSaldo();
  }, [usuario, nro_tarjeta]);

  const formatearNumero = (num) => `${toNumber(num).toLocaleString('es-ES')} ₲`;

  const irMovimientos = () => {
    const clase = String(tarjeta?.clase_tarjeta || '');
    if (clase === '1') {
      navigation.navigate('DetaBepsa', { nro_tarjeta });
    } else {
      navigation.navigate('DetaProcard', { nro_tarjeta });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/08/inicio.png' }}
          style={styles.headerImage}
        />
        <Text style={styles.headerText}>Detalle de Tarjeta # {String(nro_tarjeta).slice(-4)}</Text>
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
            <Text style={styles.cardBrand}>Dinelco</Text>
            <Text style={styles.cardNumber}>**** **** **** {String(nro_tarjeta).slice(-4)}</Text>
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
              <Text style={styles.label}>Saldo en mora:</Text>
              <Text style={[styles.value, { color: 'red' }]}>{formatearNumero(saldoEnMora)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Pago mínimo pendiente:</Text>
              <Text style={styles.value}>{formatearNumero(pagoMinimoPendiente)}</Text>
            </View>

            {/* Footer con botones */}
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('DetaBepsa', { nro_tarjeta: String(tarjeta?.nro_tarjeta) })}
                >
                <FontAwesome5 name="list-alt" size={18} color="#fff" style={styles.iconButton} />
                <Text style={styles.actionText}>Movimientos</Text>
                </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Extracto', { nro_tarjeta })}
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
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  footerButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 20 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#9e2021', paddingVertical: 12, borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: 'bold' },
  iconButton: { marginRight: 8 },
  headerContainer: { position: 'relative', overflow: 'hidden', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  headerImage: { width: Dimensions.get('window').width, height: 160 },
  headerText: { position: 'absolute', bottom: 10, left: 20, color: '#fff', fontSize: 24, fontWeight: 'bold', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  scrollContainer: { padding: 20 },
  cardContainer: { padding: 20, borderRadius: 15, marginBottom: 20, position: 'relative' },
  cardIconContainer: { marginBottom: 12, zIndex: 2 },
  cardBackgroundIcon: { position: 'absolute', top: 20, right: 20, opacity: 0.1, zIndex: 0 },
  cardBrand: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  cardNumber: { fontSize: 18, color: '#fff', letterSpacing: 2, marginVertical: 5 },
  cardHolder: { color: '#fff', fontSize: 14 },
  infoBox: { backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 14, color: '#444' },
  value: { fontSize: 14, fontWeight: 'bold' },
  errorText: { marginTop: 40, textAlign: 'center', fontSize: 16, color: 'red' }
});
