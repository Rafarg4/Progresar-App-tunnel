// MisElectrodomesticos.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Image,
  TouchableOpacity, LayoutAnimation, Platform, UIManager, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function MisElectrodomesticos() {
  const route = useRoute();
  const [usuario, setUsuario] = useState(route?.params?.usuario || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos | pagados | pendientes
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [total, setTotal] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const { nro_comprobante, nro_cuota } = route.params;
  
    useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);

        // 1) usuario (si no está en state, lo leo de AsyncStorage)
        let u = usuario;
        if (!u) {
          u = await AsyncStorage.getItem('usuarioGuardado');
          setUsuario(u || '');
        }

        // 2) validaciones
        if (!nro_comprobante || !u) {
          setItems([]);
          return;
        }

        // 3) fetch con los DOS parámetros
        const url = `https://api.progresarcorp.com.py/api/detalle_electrodomesticos/${encodeURIComponent(
          nro_comprobante
        )}/${encodeURIComponent(u)}`;

        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data ? [data] : []);
        setItems(arr);
        calcularResumen(arr);   // tu función, si aplica
      } catch (e) {
        console.log('Error:', e.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [nro_comprobante, usuario]); 

  const calcularResumen = (arr) => {
    const t = arr.reduce((s, x) => s + Number(x.monto_cuota || 0), 0);
    const s = arr.reduce((s, x) => s + Number(x.saldo_cuota || 0), 0);
    setTotal(t);
    setSaldo(s);
  };

  const cuotasFiltradas = items.filter(x => {
    const pagado = Number(x.saldo_cuota) === 0;
    if (filtro === 'pagados') return pagado;
    if (filtro === 'pendientes') return !pagado;
    return true;
  });

  const toggleExpand = (idx) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Cargando…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header igual estilo */}
      <View style={styles.headerContainer}>
        <Image
             source={require('../assets/inicio.png')}  
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay}>
         <Text style={styles.headerText}>Detalle de Comprobante #{nro_comprobante}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Filtros */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filtro === 'todos' && styles.activeFilter]}
            onPress={() => setFiltro('todos')}
          >
            <Text style={styles.filterText}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filtro === 'pagados' && styles.activeFilter]}
            onPress={() => setFiltro('pagados')}
          >
            <Text style={styles.filterText}>Pagados</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filtro === 'pendientes' && styles.activeFilter]}
            onPress={() => setFiltro('pendientes')}
          >
            <Text style={styles.filterText}>Pendientes</Text>
          </TouchableOpacity>
        </View>

        {/* Lista tipo acordeón (similar a DetalleOperaciones) */}
        {cuotasFiltradas.length === 0 ? (
          <View style={[styles.center, { paddingVertical: 40 }]}>
            <Text>No hay operaciones para mostrar.</Text>
          </View>
        ) : (
          cuotasFiltradas.map((it, idx) => {
            const isPagado = Number(it.saldo_cuota) === 0;
            const badgeText = isPagado ? 'Pagado' : 'Pendiente';
            const badgeStyle = isPagado ? styles.badgePagado : styles.badgePendiente;

            return (
              <TouchableOpacity key={`${it.cod_cliente}-${it.nro_comprobante}-${idx}`} onPress={() => toggleExpand(idx)} activeOpacity={0.9}>
                <View style={styles.cuotaBox}>
                  <View style={styles.row}>
                    <Text style={styles.label}>
                      Cuota: {it.nro_cuota}/{nro_cuota}
                    </Text>
                    <View style={styles.statusRow}>
                      <View style={[styles.badge, badgeStyle]}>
                        <Text style={styles.badgeText}>{badgeText}</Text>
                      </View>
                      <FontAwesome5
                        name={expandedIndex === idx ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#555"
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  </View>

                  {expandedIndex === idx && (
                    <>
                      <Text style={styles.detail}>Tipo: {it.tipo_comprobante}</Text>
                      <Text style={styles.detail}>Fecha origen: {it.fec_origen}</Text>
                      <Text style={styles.detail}>Última cuota: {it.nro_cuota}</Text>
                      <Text style={styles.detail}>Monto: {Number(it.monto_cuota).toLocaleString()} Gs</Text>
                      <Text style={styles.detail}>Saldo: {Number(it.saldo_cuota).toLocaleString()} Gs</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Resumen (igual estructura) */}
        <View style={styles.resumenContainer}>
          <Text style={styles.resumenTitulo}>Resumen</Text>
          <View style={styles.resumenFila}>
            <Text style={styles.labelResumen}>Total operación:</Text>
            <Text style={styles.valorResumen}>{total.toLocaleString()} Gs</Text>
          </View>
          <View style={styles.resumenFila}>
            <Text style={styles.labelResumen}>Saldo pendiente:</Text>
            <Text style={styles.valorResumen}>{saldo.toLocaleString()} Gs</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // mismos estilos base que tu DetalleOperaciones
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25
  },
  headerImage: {
    width: Dimensions.get('window').width,
    height: 180
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },

  scrollContainer: { padding: 16 },

  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 10,
    gap: 8
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center'
  },
  activeFilter: { backgroundColor: '#cad1faff' },
  filterText: { color: '#333', fontWeight: 'bold' },

  cuotaBox: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3, // Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  detail: { marginTop: 4, fontSize: 13, color: '#444' },

  statusRow: { flexDirection: 'row', alignItems: 'center' },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  badgePagado: { backgroundColor: '#4CAF50' },
  badgePendiente: { backgroundColor: '#FFC107' },

  resumenContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.5,
  },
  resumenTitulo: {
    fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333', textAlign: 'center'
  },
  resumenFila: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  labelResumen: { fontWeight: '600', fontSize: 14, color: '#555' },
  valorResumen: { fontSize: 14, color: '#111', fontWeight: 'bold' }
});
