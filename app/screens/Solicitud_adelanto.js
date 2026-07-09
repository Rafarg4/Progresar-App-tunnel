import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { nombresTarjeta, formatGs, enmascararNumero } from '../components/WalletCard';
import BottomNav from '../components/BottomNav';

const ESTADOS = {
  pendiente: { label: 'Pendiente', bg: 'rgba(217,164,65,0.14)', color: '#96731f' },
  aprobado: { label: 'Aprobado', bg: 'rgba(63,143,95,0.12)', color: '#3f8f5f' },
  desembolsado: { label: 'Desembolsado', bg: 'rgba(77,126,168,0.14)', color: '#4d7ea8' },
  rechazado: { label: 'Rechazado', bg: 'rgba(158,32,33,0.08)', color: '#9e2021' },
};

const estadoInfo = (estado) => {
  const key = String(estado || '').toLowerCase();
  return ESTADOS[key] || ESTADOS.pendiente;
};

const OPCIONES_CUOTAS = [1, 3, 6, 12];

// Bases y condiciones - Adelanto de Efectivo (Tarjeta de Crédito PROGRESAR CORPORATION SA)
const TERMINOS_INTRO =
  'Al solicitar un Adelanto de Efectivo con la Tarjeta de Crédito PROGRESAR CORPORATION SA, el titular declara haber leído, comprendido y aceptado las siguientes Bases y Condiciones:';

const TERMINOS_ADELANTO = [
  {
    titulo: '1. Objeto',
    texto:
      'El Adelanto de Efectivo consiste en la utilización de la línea de crédito disponible de la Tarjeta de Crédito PROGRESAR CORPORATION SA mediante la acreditación de fondos en una cuenta bancaria o billetera electrónica habilitada.',
  },
  {
    titulo: '2. Solicitud y autorización',
    texto: 'El titular solicita voluntariamente el Adelanto de Efectivo y autoriza de forma expresa e irrevocable a PROGRESAR CORPORATION SA a:',
    items: [
      'Debitar de la línea de crédito de su tarjeta el monto solicitado.',
      'Aplicar los intereses, comisiones, impuestos y demás cargos establecidos en el Contrato de Tarjeta de Crédito y en el Tarifario vigente.',
      'Procesar la operación conforme a sus políticas internas y a la normativa vigente.',
    ],
  },
  {
    titulo: '3. Acreditación de fondos',
    texto:
      'El importe será acreditado únicamente en una cuenta bancaria cuyo titular coincida con el titular de la Tarjeta de Crédito PROGRESAR CORPORATION S.A. PROGRESAR CORPORATION S.A. no realizará acreditaciones a cuentas de terceros bajo ninguna circunstancia.',
  },
  {
    titulo: '4. Verificación de identidad',
    texto:
      'El titular autoriza a PROGRESAR CORPORATION SA a realizar todas las validaciones de identidad, autenticación, biometría, consultas documentales y demás controles que considere necesarios para prevenir fraudes y garantizar la seguridad de la operación.',
  },
  {
    titulo: '5. Prevención de Lavado de Activos',
    texto: 'El titular declara que:',
    items: [
      'Los fondos obtenidos serán destinados exclusivamente a actividades lícitas.',
      'La información y documentación proporcionadas son verdaderas y actualizadas.',
      'Autoriza a PROGRESAR CORPORATION S.A. a realizar los controles establecidos por la normativa vigente en materia de prevención de lavado de activos, financiamiento del terrorismo y financiamiento de la proliferación de armas de destrucción masiva.',
      'Comprende que PROGRESAR CORPORATION S.A. podrá requerir documentación adicional o rechazar la operación cuando existan inconsistencias, alertas de riesgo o exigencias regulatorias.',
    ],
  },
  {
    titulo: '6. Disponibilidad y aprobación',
    texto: 'Toda solicitud estará sujeta a:',
    items: [
      'Disponibilidad de línea de crédito.',
      'Políticas internas de PROGRESAR CORPORATION SA.',
    ],
    nota: 'La recepción de la solicitud no implica la aprobación automática de la operación.',
  },
  {
    titulo: '7. Carácter definitivo',
    texto:
      'Una vez procesado el débito y realizada la acreditación, la operación tendrá carácter definitivo y no podrá ser anulada ni revertida, salvo error comprobable atribuible a PROGRESAR CORPORATION SA.',
  },
  {
    titulo: '8. Obligación de pago',
    texto:
      'El titular reconoce que el Adelanto de Efectivo constituye una utilización de su línea de crédito y se obliga a abonar el capital, intereses, comisiones (9% más IVA), impuestos y demás cargos por cada Operación de Adelanto realizada conforme al Contrato de Tarjeta de Crédito y al Tarifario vigente.',
  },
  {
    titulo: '9. Protección de datos',
    texto:
      'El titular autoriza a PROGRESAR CORPORATION SA a tratar, verificar y conservar sus datos personales y la información de la operación para fines de identificación, evaluación crediticia, prevención de fraude, cumplimiento normativo y demás finalidades relacionadas con la prestación del servicio.',
  },
  {
    titulo: '10. Aceptación',
    texto:
      'El titular manifiesta su conformidad plena con las presentes Bases y Condiciones y autoriza la ejecución del Adelanto de Efectivo.',
  },
];

const TERMINOS_AUTORIZACION =
  'Autorizo expresamente a PROGRESAR CORPORATION SA a verificar mi identidad, validar la titularidad de la cuenta bancaria informada, consultar la información necesaria para el procesamiento de esta operación y conservar el registro electrónico de mi solicitud, conforme a la normativa vigente y a las políticas internas de la entidad.';

export default function SolicitudAdelanto() {
  const route = useRoute();
  const navigation = useNavigation();
  const tarjetaPreseleccionada = route.params?.tarjeta || null;

  const [usuario, setUsuario] = useState('');

  const [aceptaAdelanto, setAceptaAdelanto] = useState(null); // null = cargando, 'SI' | 'NO'
  const [loadingAceptaAdelanto, setLoadingAceptaAdelanto] = useState(true);
  const [aceptando, setAceptando] = useState(false);

  // Confirmación de identidad (contraseña o biometría) antes de aceptar los términos
  const [modalPassVisible, setModalPassVisible] = useState(false);
  const [passConfirmacion, setPassConfirmacion] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [errorConfirmacion, setErrorConfirmacion] = useState(null);
  const [biometriaDisponible, setBiometriaDisponible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const tieneHardware = await LocalAuthentication.hasHardwareAsync();
        const estaRegistrado = await LocalAuthentication.isEnrolledAsync();
        setBiometriaDisponible(tieneHardware && estaRegistrado);
      } catch (e) {
        setBiometriaDisponible(false);
      }
    })();
  }, []);

  const [tarjetas, setTarjetas] = useState([]);
  const [loadingTarjetas, setLoadingTarjetas] = useState(true);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(tarjetaPreseleccionada);

  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [nroCuenta, setNroCuenta] = useState('');
  const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [errorSolicitudes, setErrorSolicitudes] = useState(null);

  const [resultModal, setResultModal] = useState({ visible: false, success: true, title: '', message: '' });
  const mostrarResultado = (success, title, message) =>
    setResultModal({ visible: true, success, title, message });
  const cerrarResultado = () => setResultModal((r) => ({ ...r, visible: false }));

  useEffect(() => {
    AsyncStorage.getItem('usuarioGuardado')
      .then((doc) => doc && setUsuario(doc))
      .catch((e) => console.log('Error al obtener usuario:', e));
  }, []);

  // Verifica si el usuario ya aceptó los términos del servicio de adelantos
  useEffect(() => {
    if (!usuario) return;

    const verificarAceptaAdelanto = async () => {
      try {
        setLoadingAceptaAdelanto(true);
        const res = await fetch(`https://api.progresarcorp.com.py/api/ver_usuarios/${usuario}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = Array.isArray(json) ? json[0] : Array.isArray(json?.data) ? json.data[0] : json;
        setAceptaAdelanto(String(data?.acepta_adelanto || 'NO').toUpperCase());
      } catch (e) {
        console.log('Error al verificar aceptación de adelanto:', e?.message);
        setAceptaAdelanto('NO');
      } finally {
        setLoadingAceptaAdelanto(false);
      }
    };

    verificarAceptaAdelanto();
  }, [usuario]);

  // Opción 1: confirmar con contraseña (abre el modal)
  const abrirConfirmacionPassword = () => {
    setPassConfirmacion('');
    setErrorConfirmacion(null);
    setModalPassVisible(true);
  };

  // Opción 2: confirmar con biometría (huella, Face ID, patrón o PIN del dispositivo)
  const handleBiometricConfirm = async () => {
    try {
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirmá tu identidad',
        disableDeviceFallback: false, // permite patrón/PIN si el dispositivo no tiene huella/Face ID
      });
      if (resultado.success) {
        handleAceptarAdelanto();
      } else {
        Alert.alert('Error', 'No se pudo confirmar tu identidad.');
      }
    } catch (e) {
      console.log('Error en autenticación biométrica:', e?.message);
      Alert.alert('Error', 'Hubo un problema con la autenticación biométrica.');
    }
  };

  const confirmarConPassword = async () => {
    if (!passConfirmacion) {
      setErrorConfirmacion('Ingresá tu contraseña.');
      return;
    }
    try {
      setConfirmando(true);
      setErrorConfirmacion(null);
      const res = await fetch(`https://api.progresarcorp.com.py/api/ver_usuarios/${usuario}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const data = Array.isArray(json) ? json[0] : Array.isArray(json?.data) ? json.data[0] : json;

      if (data?.clave && data.clave === passConfirmacion) {
        setModalPassVisible(false);
        setPassConfirmacion('');
        handleAceptarAdelanto();
      } else {
        setErrorConfirmacion('Contraseña incorrecta.');
      }
    } catch (e) {
      console.log('Error al confirmar contraseña:', e?.message);
      setErrorConfirmacion('No pudimos verificar tu contraseña. Intentá nuevamente.');
    } finally {
      setConfirmando(false);
    }
  };

  const handleAceptarAdelanto = async () => {
    const url = `https://api.progresarcorp.com.py/api/tildar_adelantado/${usuario}`;
    console.log('[tildar_adelantado] request ->', { url, method: 'PUT' });
    try {
      setAceptando(true);
      const res = await fetch(url, { method: 'PUT' });
      const texto = await res.text();
      console.log('[tildar_adelantado] response <-', { status: res.status, body: texto });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${texto}`);
      setAceptaAdelanto('SI');
      mostrarResultado(true, '¡Listo!', 'Aceptaste los términos y condiciones. Ya podés solicitar tu adelanto.');
    } catch (e) {
      console.log('Error al aceptar términos de adelanto:', e?.message);
      mostrarResultado(false, 'No se pudo continuar', 'No pudimos registrar tu aceptación. Intentá nuevamente.');
    } finally {
      setAceptando(false);
    }
  };

  useEffect(() => {
    if (!usuario) return;

    const obtenerTarjetas = async () => {
      try {
        setLoadingTarjetas(true);
        const res = await fetch(`https://api.progresarcorp.com.py/api/ver_tarjeta/${usuario}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const lista = Array.isArray(data) ? data : [];
        setTarjetas(lista);
        if (!tarjetaSeleccionada && lista.length > 0) {
          setTarjetaSeleccionada(lista[0]);
        }
      } catch (e) {
        console.log('Error al obtener tarjetas:', e?.message);
      } finally {
        setLoadingTarjetas(false);
      }
    };

    obtenerTarjetas();
  }, [usuario]);

  // Disponible real (ver_tarjeta no viene en tiempo real: usamos el mismo
  // endpoint que "Detalle de tarjeta" para saber cuánto se puede pedir).
  const [disponibleSeleccionada, setDisponibleSeleccionada] = useState(0);
  const [loadingDisponible, setLoadingDisponible] = useState(false);

  useEffect(() => {
    if (!tarjetaSeleccionada?.nro_tarjeta) {
      setDisponibleSeleccionada(0);
      return;
    }

    const obtenerDisponible = async () => {
      try {
        setLoadingDisponible(true);
        const res = await fetch(
          `https://api.progresarcorp.com.py/api/obtener_saldo_actual/${tarjetaSeleccionada.nro_tarjeta}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDisponibleSeleccionada(Number(data?.cuenta?.disponi_adelanto) || 0);
      } catch (e) {
        console.log('Error al obtener disponible de la tarjeta:', e?.message);
        setDisponibleSeleccionada(0);
      } finally {
        setLoadingDisponible(false);
      }
    };

    obtenerDisponible();
  }, [tarjetaSeleccionada?.nro_tarjeta]);

  const obtenerSolicitudes = async () => {
    if (!usuario) return;
    const url = `https://api.progresarcorp.com.py/api/ver_solicitudes_adelanto/${usuario}`;
    console.log('📤 usuario (nro_doc):', usuario);
    console.log('📤 URL solicitudes:', url);
    try {
      setLoadingSolicitudes(true);
      setErrorSolicitudes(null);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('📥 Respuesta solicitudes:', json);
      const lista = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
      setSolicitudes(lista);
    } catch (e) {
      console.log('Error al obtener solicitudes:', e?.message);
      setErrorSolicitudes('No pudimos cargar tus solicitudes.');
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  useEffect(() => {
    obtenerSolicitudes();
  }, [usuario]);

  // Vuelve a cargar la lista cada vez que la pantalla toma foco
  // (por ejemplo, al volver desde Detalle de tarjeta sin desmontar la pantalla)
  useFocusEffect(
    useCallback(() => {
      if (usuario) obtenerSolicitudes();
    }, [usuario])
  );

  const handleSolicitar = async () => {
    if (!tarjetaSeleccionada) {
      Alert.alert('Falta la tarjeta', 'Seleccioná la tarjeta contra la que querés pedir el adelanto.');
      return;
    }
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      Alert.alert('Monto inválido', 'Ingresá un monto válido.');
      return;
    }
    if (loadingDisponible) {
      Alert.alert('Un momento', 'Estamos verificando tu disponible, esperá un segundo e intentá de nuevo.');
      return;
    }
    if (Number(monto) > disponibleSeleccionada) {
      mostrarResultado(
        false,
        'Monto excede tu disponible',
        `Tu disponible en esta tarjeta es ${formatGs(disponibleSeleccionada)}. Ingresá un monto menor o igual.`
      );
      return;
    }
    if (!nroCuenta.trim()) {
      Alert.alert('Falta la cuenta', 'Ingresá la cuenta a la que se transferirá el adelanto.');
      return;
    }
    if (!cuotasSeleccionadas) {
      Alert.alert('Faltan las cuotas', 'Seleccioná en cuántas cuotas querés pagar el adelanto.');
      return;
    }

    try {
      setEnviando(true);
      const res = await fetch('https://api.progresarcorp.com.py/api/crear_solicitud_adelanto', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nro_doc: usuario,
          nro_usuario: tarjetaSeleccionada.nro_usuario,
          nro_tarjeta: tarjetaSeleccionada.nro_tarjeta,
          clase_tarjeta: tarjetaSeleccionada.clase_tarjeta,
          monto: Number(monto),
          descripcion: descripcion.trim(),
          nro_cuenta: nroCuenta.trim(),
          cantidad_cuotas: cuotasSeleccionadas,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && (json.success || json.status === true || json.status === 'ok')) {
        mostrarResultado(true, '¡Listo!', json.message || 'Tu solicitud de adelanto fue enviada.');
        setMonto('');
        setDescripcion('');
        setNroCuenta('');
        setCuotasSeleccionadas(null);
        obtenerSolicitudes();
      } else {
        mostrarResultado(false, 'No se pudo enviar', json.message || 'Ocurrió un error al enviar tu solicitud.');
      }
    } catch (e) {
      mostrarResultado(false, 'Sin conexión', 'Revisá tu conexión a internet e intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

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
            <Text style={styles.headerTitle}>Adelanto en efectivo</Text>
            <Text style={styles.headerSubtitle}>Solicitá un adelanto contra tu tarjeta</Text>
          </View>
        </ImageBackground>

        <View style={styles.sheet}>
          {loadingAceptaAdelanto ? (
            <View style={styles.sectionCard}>
              <ActivityIndicator size="large" color="#9e2021" style={{ marginVertical: 20 }} />
            </View>
          ) : aceptaAdelanto !== 'SI' ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBadge}>
                  <FontAwesome5 name="file-signature" size={13} color="#9e2021" />
                </View>
                <Text style={styles.sectionTitle}>Términos y condiciones</Text>
              </View>

              <Text style={styles.termIntro}>{TERMINOS_INTRO}</Text>

              {TERMINOS_ADELANTO.map((seccion) => (
                <View key={seccion.titulo} style={styles.termSection}>
                  <Text style={styles.termSectionTitle}>{seccion.titulo}</Text>
                  <Text style={styles.termParagraph}>{seccion.texto}</Text>

                  {seccion.items?.map((item, idx) => (
                    <View key={idx} style={styles.termBulletRow}>
                      <Text style={styles.termBulletDot}>•</Text>
                      <Text style={styles.termBulletText}>{item}</Text>
                    </View>
                  ))}

                  {!!seccion.nota && <Text style={styles.termNote}>{seccion.nota}</Text>}
                </View>
              ))}

              <View style={styles.termAuthBox}>
                <Text style={styles.termAuthText}>{TERMINOS_AUTORIZACION}</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, aceptando && { opacity: 0.6 }]}
                onPress={abrirConfirmacionPassword}
                disabled={aceptando}
                activeOpacity={0.85}
              >
                {aceptando ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Aceptar y continuar</Text>
                )}
              </TouchableOpacity>

              {biometriaDisponible && (
                <TouchableOpacity
                  style={[styles.botonSecundario, aceptando && { opacity: 0.6 }]}
                  onPress={handleBiometricConfirm}
                  disabled={aceptando}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesome5 name="fingerprint" size={16} color="#9e2021" style={{ marginRight: 8 }} />
                    <Text style={styles.botonSecundarioText}>
                      Usar biometría / patrón
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
          {/* Nueva solicitud */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <FontAwesome5 name="hand-holding-usd" size={13} color="#9e2021" />
              </View>
              <Text style={styles.sectionTitle}>Nueva solicitud</Text>
            </View>

            <Text style={styles.label}>Tarjeta</Text>
            {loadingTarjetas ? (
              <ActivityIndicator size="small" color="#9e2021" style={{ marginVertical: 10 }} />
            ) : tarjetas.length === 0 ? (
              <Text style={styles.emptyText}>No encontramos tarjetas activas.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 14 }}
                contentContainerStyle={{ paddingRight: 8 }}
              >
                {tarjetas.map((t) => {
                  const selected = tarjetaSeleccionada?.nro_tarjeta === t.nro_tarjeta;
                  return (
                    <TouchableOpacity
                      key={t.nro_tarjeta}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => setTarjetaSeleccionada(t)}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {(nombresTarjeta[t.clase_tarjeta] || 'Tarjeta')} {enmascararNumero(t.nro_tarjeta)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <Text style={styles.label}>Monto a solicitar</Text>
            <View style={[styles.inputField, { marginBottom: 4 }]}>
              <Text style={styles.inputPrefix}>Gs.</Text>
              <TextInput
                style={styles.inputInner}
                value={monto}
                onChangeText={(v) => setMonto(v.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor="#8a7476"
                keyboardType="numeric"
              />
            </View>
            {tarjetaSeleccionada && (
              <Text
                style={[
                  styles.disponibleHint,
                  !loadingDisponible && Number(monto) > disponibleSeleccionada && styles.disponibleHintError,
                ]}
              >
                {loadingDisponible ? 'Consultando disponible...' : `Disponible: ${formatGs(disponibleSeleccionada)}`}
              </Text>
            )}

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={styles.textarea}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Ej: Gastos médicos imprevistos"
              placeholderTextColor="#8a7476"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Cuenta a transferir</Text>
            <View style={styles.inputField}>
              <TextInput
                style={styles.inputInner}
                value={nroCuenta}
                onChangeText={setNroCuenta}
                placeholder="Nro. de cuenta"
                placeholderTextColor="#8a7476"
              />
            </View>

            <Text style={styles.label}>Cantidad de cuotas</Text>
            <View style={[styles.chiprow, { marginBottom: 14 }]}>
              {OPCIONES_CUOTAS.map((n) => {
                const selected = cuotasSeleccionadas === n;
                return (
                  <TouchableOpacity
                    key={n}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setCuotasSeleccionadas(n)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {n} {n === 1 ? 'cuota' : 'cuotas'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, enviando && { opacity: 0.6 }]}
              onPress={handleSolicitar}
              disabled={enviando}
              activeOpacity={0.85}
            >
              {enviando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <FontAwesome5 name="arrow-right" size={14} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Solicitar adelanto</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Historial de solicitudes */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <FontAwesome5 name="history" size={13} color="#9e2021" />
              </View>
              <Text style={styles.sectionTitle}>Tus solicitudes</Text>
            </View>

            {loadingSolicitudes ? (
              <ActivityIndicator size="large" color="#9e2021" style={{ marginVertical: 20 }} />
            ) : errorSolicitudes ? (
              <Text style={styles.emptyText}>{errorSolicitudes}</Text>
            ) : solicitudes.length === 0 ? (
              <Text style={styles.emptyText}>Todavía no solicitaste ningún adelanto.</Text>
            ) : (
              solicitudes.map((s, idx) => {
                const estado = estadoInfo(s.estado);
                const esRechazado = String(s.estado || '').toLowerCase() === 'rechazado';
                return (
                  <View
                    key={s.cod_solicitud_adelanto ?? idx}
                    style={[styles.reqItem, idx === solicitudes.length - 1 && { marginBottom: 0 }]}
                  >
                    <View style={styles.reqTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqAmount}>{formatGs(s.monto)}</Text>
                        <Text style={styles.reqMeta}>
                          {s.fecha_solicitud} · {nombresTarjeta[s.clase_tarjeta] || 'Tarjeta'} {enmascararNumero(s.nro_tarjeta)}
                        </Text>
                        {!!s.cantidad_cuotas && (
                          <Text style={styles.reqMeta}>
                            {s.cantidad_cuotas} {Number(s.cantidad_cuotas) === 1 ? 'cuota' : 'cuotas'}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.pill, { backgroundColor: estado.bg }]}>
                        <Text style={[styles.pillText, { color: estado.color }]}>{estado.label}</Text>
                      </View>
                    </View>
                    {!!s.descripcion && <Text style={styles.reqDesc}>{s.descripcion}</Text>}
                    {esRechazado && (
                      <View style={styles.reqRechazoBox}>
                        <Text style={styles.reqRechazoText}>
                          {s.motivo_rechazo || 'Tu solicitud de adelanto fue rechazada.'}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
            </>
          )}
        </View>
      </ScrollView>

      <BottomNav usuario={usuario} />

      <Modal
        visible={resultModal.visible}
        transparent
        animationType="fade"
        onRequestClose={cerrarResultado}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={[
                styles.modalIconCircle,
                resultModal.success ? styles.modalIconSuccess : styles.modalIconError,
              ]}
            >
              <FontAwesome5
                name={resultModal.success ? 'check' : 'exclamation'}
                size={20}
                color="#fff"
              />
            </View>
            <Text style={styles.modalTitle}>{resultModal.title}</Text>
            <Text style={styles.modalMessage}>{resultModal.message}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={cerrarResultado} activeOpacity={0.85}>
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalPassVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalPassVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconCircle, styles.modalIconError]}>
              <FontAwesome5 name="lock" size={20} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>Confirmá tu identidad</Text>
            <Text style={styles.modalMessage}>Ingresá tu contraseña para continuar.</Text>

            <View style={styles.inputField}>
              <TextInput
                style={styles.inputInner}
                value={passConfirmacion}
                onChangeText={setPassConfirmacion}
                placeholder="Contraseña"
                placeholderTextColor="#8a7476"
                secureTextEntry
                autoFocus
              />
            </View>
            {!!errorConfirmacion && (
              <Text style={[styles.emptyText, { color: '#9e2021', marginTop: -6 }]}>
                {errorConfirmacion}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.modalButton, confirmando && { opacity: 0.6 }]}
              onPress={confirmarConPassword}
              disabled={confirmando}
              activeOpacity={0.85}
            >
              {confirmando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 12 }}
              onPress={() => setModalPassVisible(false)}
              disabled={confirmando}
            >
              <Text style={{ color: '#9e2021', fontSize: 13, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  scrollContainer: { paddingBottom: 140 },

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

  // 🔹 Hoja de contenido
  sheet: {
    backgroundColor: '#faf6f5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 20,
    paddingHorizontal: 16,
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

  label: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6b5c5d',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#6b5c5d',
    marginBottom: 8,
  },

  // 🔹 Bases y condiciones del adelanto
  termIntro: {
    fontSize: 13,
    color: '#6b5c5d',
    lineHeight: 19,
    marginBottom: 16,
  },
  termSection: {
    marginBottom: 14,
  },
  termSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#241a1a',
    marginBottom: 4,
  },
  termParagraph: {
    fontSize: 12.5,
    color: '#6b5c5d',
    lineHeight: 18,
  },
  termBulletRow: {
    flexDirection: 'row',
    marginTop: 6,
    paddingLeft: 4,
  },
  termBulletDot: {
    fontSize: 12.5,
    color: '#9e2021',
    marginRight: 8,
    lineHeight: 18,
  },
  termBulletText: {
    flex: 1,
    fontSize: 12.5,
    color: '#6b5c5d',
    lineHeight: 18,
  },
  termNote: {
    fontSize: 12,
    color: '#9e2021',
    fontStyle: 'italic',
    marginTop: 6,
  },
  termAuthBox: {
    backgroundColor: 'rgba(158,32,33,0.06)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  termAuthText: {
    fontSize: 12.5,
    color: '#241a1a',
    lineHeight: 18,
    fontWeight: '600',
  },

  // 🔹 Chips de tarjeta / cuotas
  chiprow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#efe1e0',
    backgroundColor: '#faf6f5',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    borderColor: '#9e2021',
    backgroundColor: 'rgba(158,32,33,0.08)',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#241a1a',
  },
  chipTextSelected: {
    color: '#9e2021',
  },

  // 🔹 Inputs
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f2f1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
  },
  inputPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b5c5d',
    marginRight: 6,
  },
  inputInner: {
    flex: 1,
    fontSize: 14,
    color: '#241a1a',
  },
  disponibleHint: {
    fontSize: 12,
    color: '#6b5c5d',
    marginBottom: 14,
  },
  disponibleHintError: {
    color: '#9e2021',
    fontWeight: '700',
  },
  textarea: {
    backgroundColor: '#f7f2f1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#241a1a',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 14,
  },

  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#9e2021',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9e2021',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14.5,
  },
  botonSecundario: {
    backgroundColor: 'rgba(158,32,33,0.08)',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  botonSecundarioText: {
    color: '#9e2021',
    fontWeight: 'bold',
    fontSize: 14.5,
  },

  // 🔹 Historial de solicitudes
  reqItem: {
    borderWidth: 1,
    borderColor: '#efe1e0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  reqTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reqAmount: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#241a1a',
  },
  reqMeta: {
    fontSize: 12,
    color: '#6b5c5d',
    marginTop: 2,
  },
  reqDesc: {
    fontSize: 12.5,
    color: '#6b5c5d',
    marginTop: 8,
  },
  reqRechazoBox: {
    backgroundColor: 'rgba(158,32,33,0.08)',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  reqRechazoText: {
    fontSize: 12,
    color: '#9e2021',
    lineHeight: 17,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // 🔹 Modal de resultado (éxito / error al enviar)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(36,16,18,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalIconSuccess: {
    backgroundColor: '#3f8f5f',
  },
  modalIconError: {
    backgroundColor: '#9e2021',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#241a1a',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 13.5,
    color: '#6b5c5d',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#9e2021',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
