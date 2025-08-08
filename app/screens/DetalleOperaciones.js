import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function DetalleOperaciones() {
  const route = useRoute();
  const { cod_cliente, nro_comprobante } = route.params;

  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [total, setTotal] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [diasAtraso, setDiasAtraso] = useState(0);
  const [filtro, setFiltro] = useState('todos'); 
  const cuotasFiltradas = cuotas.filter(cuota => {
  const pagado = Number(cuota.saldo_cuota) === 0;
  if (filtro === 'pagados') return pagado;
  if (filtro === 'pendientes') return !pagado;
  return true;
  });  



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
    const cuotasVencidas = cuotas
      .filter(c => {
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
      {/* Cabecera con imagen */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/08/inicio.png' }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay}>
          <FontAwesome5 name="file-invoice" size={24} color="#fff" />
          <Text style={styles.headerText}>Detalle de Operación #{nro_comprobante}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.resumenContainer}>
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
            </View>
          {/* Acordeón de cuotas */}
            {cuotasFiltradas.map((cuota, index) => {
            const isPagado = Number(cuota.saldo_cuota) === 0;
            const badgeText = isPagado ? 'Pagado' : 'Pendiente';
            const badgeStyle = isPagado ? styles.badgePagado : styles.badgePendiente;

            return (
                <TouchableOpacity key={index} onPress={() => toggleExpand(index)} activeOpacity={0.9}>
                <View style={styles.cuotaBox}>
                    <View style={styles.row}>
                    <Text style={styles.label}>
                        Cuota {cuota.nro_cuota}/{cuota.nro_cuota_cab}
                    </Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.badge, badgeStyle]}>
                        <Text style={styles.badgeText}>{badgeText}</Text>
                        </View>
                        <FontAwesome5
                        name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#555"
                        style={{ marginLeft: 8 }}
                        />
                    </View>
                    </View>

                    {expandedIndex === index && (
                    <>
                        <Text style={styles.detail}>Fecha de cuota: {cuota.fec_origen}</Text>
                        <Text style={styles.detail}>Fecha de Vencimiento: {cuota.fec_vencimiento}</Text>
                        <Text style={styles.detail}>Monto cuota: {Number(cuota.monto_cuota).toLocaleString()} Gs</Text>
                        <Text style={styles.detail}>Saldo cuota: {Number(cuota.saldo_cuota).toLocaleString()} Gs</Text>
                    </>
                    )}
                </View>
                </TouchableOpacity>
            );
            })}
            {/* Resumen */}
          <View style={styles.resumenContainer}>
            <Text style={styles.resumenTitulo}>Resumen de la operación</Text>

            <View style={styles.resumenFila}>
                <Text style={styles.labelResumen}>Total operación:</Text>
                <Text style={styles.valorResumen}>{total.toLocaleString()} Gs</Text>
            </View>

            <View style={styles.resumenFila}>
                <Text style={styles.labelResumen}>Saldo pendiente:</Text>
                <Text style={styles.valorResumen}>{saldo.toLocaleString()} Gs</Text>
            </View>

            <View style={styles.resumenFila}>
                <Text style={styles.labelResumen}>Días de atraso:</Text>
                <Text style={styles.valorResumen}>{diasAtraso} día(s)</Text>
            </View>

            <View style={styles.resumenFila}>
                <Text style={styles.labelResumen}>Total saldo:</Text>
                <Text style={styles.valorResumen}>{saldo.toLocaleString()} Gs</Text>
            </View>
            </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25
  },
  statusRow: {
  flexDirection: 'row',
  alignItems: 'center'
},
badge: {
  borderRadius: 12,
  paddingHorizontal: 10,
  paddingVertical: 4,
},
badgeText: {
  fontSize: 12,
  fontWeight: 'bold',
  color: '#fff'
},
badgePagado: {
  backgroundColor: '#4CAF50' // verde
},
badgePendiente: {
  backgroundColor: '#FFC107' // amarillo
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
  summaryBox: {
    padding: 16,
    backgroundColor: '#e3f2fd',
    marginBottom: 16,
    borderRadius: 10
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  cuotaBox: {
    backgroundColor: '#ffffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333'
  },
  detail: {
    marginTop: 4,
    fontSize: 13,
    color: '#444'
  },
  footerBox: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fafafa'
  },
  footerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333'
  },
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
activeFilter: {
  backgroundColor: '#cad1faff'
},
filterText: {
  color: '#333',
  fontWeight: 'bold'
},
resumenContainer: {
  backgroundColor: '#ffffffff',
  padding: 16,
  borderRadius: 12,
  marginBottom: 20,
  elevation: 2
},
resumenTitulo: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 12,
  color: '#333',
  textAlign: 'center'
},
resumenFila: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 8
},
labelResumen: {
  fontWeight: '600',
  fontSize: 14,
  color: '#555'
},
valorResumen: {
  fontSize: 14,
  color: '#111',
  fontWeight: 'bold'
}

});
