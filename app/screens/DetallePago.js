import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function DetallePago() {
  const route = useRoute();
  const navigation = useNavigation();
  const { pagoDetalle } = route.params || {};

  // 🧩 Detectar tipo de respuesta
  const codigo = pagoDetalle?.codigo || pagoDetalle?.codigoRespuestaTransaccion;
  const esExitoso = codigo === '00';
  const esErrorHttp = pagoDetalle?.codigo === 400;

  // 🔹 Diccionario de códigos conocidos
  const codigosDescripcion = {
    '00': 'APROBADA',
    '1': 'LLAME CENTRO AUTORIZACION',
    '2': 'CONSULTE SU EMISOR - CONDICION ESPECIAL',
    '3': 'NEGOCIO INVALIDO',
    '4': 'RETENGA TARJETA',
    '5': 'NO APROBADO',
    '6': 'ERROR DE SISTEMA',
    '7': 'RECHAZO POR CONTROL DE SEGURIDAD',
    '8': 'TRANSACCION FALLBACK RECHAZADA',
    '9': 'SOLICITUD EN PROCESO',
    '10': 'NO APROBADO MINIMO 25000',
    '11': 'NO APROBADO CLIENTE - V.I.P',
    '12': 'TRANSACCION INVALIDA',
    '13': 'MONTO INVALIDO',
    '14': 'TARJETA INEXISTENTE',
    '15': 'EMISOR INEXISTENTE, NO HABILITADO P/NEGOC',
    '16': 'APROBADO - PISTA 3 ACTUALIZADA',
    '17': 'CANCELADO POR EL CLIENTE',
    '18': 'EL CLIENTE CONTESTA LA OPERACION',
    '19': 'INTENTE OTRA VEZ',
    '20': 'RESPUESTA INVALIDA O NO GARANTIZADO',
    '21': 'NINGUNA ACCION A TOMAR',
    '22': 'SOSPECHA DE MAL FUNCIONAMIENTO',
    '23': 'NO APROBADO - TASA NO ACEPTABLE',
    '24': 'ACTUALIZACION DE ARCHIVO NO SOPORTADA',
    '25': 'NO ES POSIBLE LOCALIZAR REGISTRO ARCHIVO',
    '26': 'ACTUALIZACION DE REGISTRO DUPLICADA',
    '27': 'ERROR EN ACTUALIZAR CAMPO DE REGISTRO',
    '28': 'ACTUALIZACION DE FICHERO FUERA DE RANGO',
    '29': 'NO PUDO ACTUALIZAR FICHERO / CONSULTE ADQ.',
    '30': 'ERROR DE FORMATO DE PAQUETE',
    '31': 'BANCO NO ADHERIDO AL SISTEMA',
    '32': 'OPERACION COMPLETADA PARCIALMENTE',
    '33': 'TARJETA VENCIDA',
    '34': 'POSIBLE FRAUDE - RETENGA TARJETA',
    '35': 'LLAME PROCESADOR / ADQUIRENTE',
    '36': 'TARJETA / CUENTA BLOQUEADA POR LA ENTIDAD',
    '37': 'MES NACIMIENTO INCORRECTO - TARJ. BLOQUEADA',
    '38': '3 CLAVES EQUIVOCADAS - TARJETA BLOQUEADA',
    '39': 'NO EXISTE CUENTA DE TARJETA DE CREDITO',
    '40': 'TIPO DE TRANSACCION NO SOPORTADA',
    '41': 'TARJETA PERDIDA - RETENGA TARJETA',
    '42': 'NO APROBADO - NO EXISTE CUENTA UNIVERSAL',
    '43': 'TARJETA ROBADA - RETENGA TARJETA',
    '44': 'NO APROBADO - NO EXISTE CUENTA INVERSION',
    '45': 'NO EXISTE LA CUENTA',
    '46': 'EMISOR/BANCO NO RESPONDIO EN 49 SEGUNDOS',
    '47': 'BCO. NEGOCIO O ATM NO RESPONDIO EN 49 SEG.',
    '48': 'BCO PAGADOR DE TARJETA FUERA DE SERVICIO',
    '49': 'OPERACION NO ACEPTADA EN CUOTAS',
    '50': 'MES NACIMIENTO INCORRECTO',
    '51': 'NO APROBADA - INSUF. DE FONDOS',
    '52': 'NO APROBADA - NO EXISTE CUENTA CORRIENTE',
    '53': 'NO APROBADA - NO EXISTE CUENTA AHORRO',
    '54': 'TARJETA VENCIDA',
    '55': 'CLAVE INVALIDA',
    '56': 'NO EXISTE DATOS EN MAGNETIZADO DE TARJETA',
    '57': 'NO APROBADA - TARJETA INADECUADA',
    '58': 'NO HABILITADA PARA ESTA TERMINAL',
    '59': 'NO APROBADO - POSIBLE FRAUDE',
    '60': 'NO APROBADO - CONSULTE PROCESADOR ADQUIR.',
    '61': 'EXCEDE MONTO LIMITE',
    '62': 'NO APROBADA - TARJETA RESTRINGIDA',
    '63': 'VIOLACION DE SEGURIDAD',
    '64': 'MONTO ORIGINAL INCORRECTO - NO APROBADO',
    '65': 'EXCEDE CANTIDAD DE OPERACIONES',
    '66': 'LLAMAR SEGURIDAD DEL PROCESADOR ADQUIR.',
    '67': 'RETENCION DE TARJETAS POR ATM',
    '68': 'RESPUESTA LLEGO MUY TARDE',
    '69': 'ERROR EN EL MAGNETIZADO DE LA TARJETA',
    '70': 'NEGOCIO INHABILITADO POR FALTA DE PAGO',
    '71': 'OPERACION YA EXTORNADA',
    '72': 'FECHA INVALIDA',
    '73': 'CODIGO DE SEGURIDAD INVALIDO',
    '74': 'HORARIO DE NO ATENCION A PUBLICO',
    '75': 'EXCEDE LIMITE DE INTENTOS DE PIN - NO AP',
    '76': 'CLAVE YA EXISTE',
    '77': 'EL CLIENTE NO TIENE CLAVE TODAVIA',
    '78': 'CLAVE ACTIVADA',
    '79': 'CLAVE CAMBIADA',
    '80': 'CLAVE ACTIVADA O CAMBIADA',
    '81': 'ERROR CRIPTOGRAFICO EN EL PIN',
    '82': 'CLIENTE OLVIDO TARJETA - RETENGA Y BLOQUEE',
    '83': 'SOBREPASA CANTIDAD DE BILLETES P/EL ATM',
    '84': 'PRE-AUTORIZACION DECLINADA',
    '85': 'NINGUN MOTIVO PARA NO ACEPTAR DIRECCION',
    '86': 'IMPOSSIBLE VERIFICAR PIN',
    '87': 'TERMINADA LA RECONCILIACION DEL DIA',
    '88': 'NO ES POSIBLE VERIFICAR TOTALES DEL DIA',
    '89': 'POSICION FINANCIERA NO VERIFICABLE',
    '90': 'SWITCHER EN CIERRE - INTENTE EN 5 MINS.',
    '91': 'EMISOR EN CIERRE - INTENTE OTRA VEZ',
    '92': 'EMISOR DESCONECTADO - PROBLEMAS EN LINEA',
    '93': 'NO APROBADO - VIOLACION DE LEY',
    '94': 'TRANSACCION DUPLICADA - NO APROBADO',
    '95': 'VERIFIQUE ERROR',
    '96': 'EMISOR DE LA TARJETA FUERA DE SERVICIO',
    '97': 'ATM IMPOSIBILITADO PARA ESTA OPERACION',
    '98': 'BANCO DEL NEGOCIO/ATM FUERA DE SERVICIO',
    '99': 'TRANSACCION EXTORNADA',
  };

  // 🧠 Prioridad de mensaje de error
let mensaje = 'Transacción desconocida.';

// Aseguramos que código sea número
const codigoNum = Number(pagoDetalle?.codigo);

// 🟥 Caso error HTTP 400 → mostrar mensaje textual del backend
if (codigoNum === 400 || pagoDetalle?.error === 'Error al procesar el pago') {
  const detalles = pagoDetalle?.detalles;
  if (detalles) {
    mensaje =
      (Array.isArray(detalles.messages) && detalles.messages[0]) ||
      detalles.header ||
      detalles.type ||
      pagoDetalle.error ||
      'Error al procesar el pago.';
  } else {
    mensaje = pagoDetalle.error || 'Error al procesar el pago.';
  }
}
// ⚠️ Caso error transaccional (código != 00)
else if (!esExitoso) {
  mensaje =
    codigosDescripcion[codigo] ||
    pagoDetalle?.respuestaTransaccion ||
    pagoDetalle?.descripcion ||
    'Transacción rechazada.';
}
// ✅ Caso exitoso
else {
  mensaje = codigosDescripcion[codigo] || 'APROBADA';
}

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/inicio.png')}
        style={styles.headerBackground}
        imageStyle={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
      >
        <View style={styles.headerOverlay}>
          <Text style={styles.headerText}>Detalle del Pago</Text>
        </View>
      </ImageBackground>

      <View style={styles.content}>
        {esExitoso ? (
          <>
           
          <View style={styles.successContainer}>
          <View style={styles.card}>
            <View style={styles.headerCheck}>
              <Ionicons
                name="checkmark-circle"
                size={55}          // 🔹 tamaño ajustado (más proporcionado)
                color="#28a745"
                style={{ marginBottom: 6 }}
              />
              <Text style={styles.title}>Transacción Aprobada</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="card-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.label}>Tarjeta:</Text>
              <Text style={styles.value}> {pagoDetalle?.tarjeta || '—'}</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="storefront-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.label}>Comercio:</Text>
              <Text style={styles.value}> {pagoDetalle?.comercio || '—'}</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="receipt-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.label}>N° Boleta:</Text>
              <Text style={styles.value}> {pagoDetalle?.numeroBoleta || '—'}</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}> {pagoDetalle?.fechaTransaccion || '—'}</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="swap-horizontal-outline" size={20} color="#555" style={styles.icon} />
              <Text style={styles.label}>Transacción:</Text>
              <Text style={styles.value}> {pagoDetalle?.numeroTransaccion || '—'}</Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#28a745" style={styles.icon} />
              <Text style={styles.label}>Estado:</Text>
              <Text style={[styles.estado, styles.estadoOk]}> {mensaje}</Text>
            </View>
          </View>
        </View>

          </>
        ) : (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={32} color="#dc3545" style={{ marginBottom: 10 }} />
            <Text style={styles.errorText}>{mensaje}</Text>
            {!esErrorHttp && (
              <Text style={styles.errorHint}>
                Si el problema persiste, contacte con soporte.
              </Text>
            )}
          </View>
        )}

       <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('InicioApp')}
        >
          <Ionicons name="arrow-back-circle" size={20} color="#fff" />
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerBackground: {
    paddingTop: 95,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  headerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 20,
    paddingTop: 10,
  },
  successContainer: {
  alignItems: 'center',
},
successContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 10,
},

headerCheck: {
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 15,
},

title: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#28a745',
},

row: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},

icon: {
  marginRight: 8,
  width: 26,
  textAlign: 'center',
},

label: {
  flex: 1,
  fontWeight: '600',
  color: '#333',
  fontSize: 15,
},

value: {
  flex: 1,
  textAlign: 'right',
  fontSize: 15,
  color: '#555',
},

estado: {
  fontSize: 15,
  fontWeight: 'bold',
},

estadoOk: {
  color: '#28a745',
},
row: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
  flexWrap: 'wrap',
},

icon: {
  marginRight: 8,
},

label: {
  fontWeight: 'bold',
  color: '#333',
  fontSize: 15,
  width: 100,
},

value: {
  fontSize: 15,
  color: '#555',
  flexShrink: 1,
},

amount: {
  color: '#9e2021',
  fontWeight: 'bold',
  fontSize: 16,
},

estado: {
  fontSize: 15,
  fontWeight: 'bold',
},

estadoOk: {
  color: '#28a745',
},
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
  label: { fontWeight: 'bold', color: '#333', marginTop: 10 },
  value: { fontSize: 16, color: '#555' },
  amount: { color: '#9e2021', fontWeight: 'bold', fontSize: 18, marginTop: 4 },
  estado: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  estadoOk: { color: '#28a745' },
  estadoError: { color: '#dc3545' },
  errorBox: {
    backgroundColor: '#fff1f0',
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 10,
    padding: 20,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 6,
  },
  errorHint: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#9e2021',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 16 },
});
