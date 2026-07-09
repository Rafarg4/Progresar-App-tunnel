import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import BottomNav from '../components/BottomNav';

export default function PagoQr() {
  const route = useRoute();
  const navigation = useNavigation();
  const { num_doc } = route.params || {};

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [selectedTarjeta, setSelectedTarjeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [decodedData, setDecodedData] = useState(null);

  // 🔐 Autenticación
  const [bioEnabled, setBioEnabled] = useState(false);   // preferencia del usuario: 'biometricoHabilitado'
  const [bioCapable, setBioCapable] = useState(false);   // hardware + enrolado
  const [authPassed, setAuthPassed] = useState(false);   // ya autenticado en esta sesión
  const [authLoading, setAuthLoading] = useState(false);

  // 🔑 Modal de contraseña
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [pwdInput, setPwdInput] = useState('');

  // 📲 Permisos cámara/galería
 const [permission, requestPermission] = useCameraPermissions();

useEffect(() => {
  (async () => {
    await requestPermission();
    const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setHasPermission(galleryStatus.status === 'granted');
  })();
}, []);

  // 🔐 Cargar preferencia y capacidad biométrica
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('biometricoHabilitado'); // 'true' | 'false'
        setBioEnabled(saved === 'true');

        const hasHw = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setBioCapable(hasHw && enrolled);
      } catch {
        setBioCapable(false);
      }
    })();
  }, []);

  // 📷 Escaneo QR (cámara)
  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    await fetchTarjetaData(data);
  };

  // 🖼️ Escaneo QR (imagen)
  const pickImageAndScan = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) return;

    const imageUri = result.assets?.[0]?.uri;
    if (!imageUri) {
      Alert.alert('Error', 'No se pudo obtener la imagen seleccionada.');
      return;
    }

    // Opcional: muestra spinner mientras se procesa
    setIsLoading(true);

    // Decodifica QR desde la imagen local
    const scans = await BarCodeScanner.scanFromURLAsync(
      imageUri,
      [BarCodeScanner.Constants.BarCodeType.qr] // fuerza solo QR
    );

    if (!scans || scans.length === 0) {
      Alert.alert('Sin resultados', 'No se detectó ningún código QR en la imagen.');
      return;
    }

    // Si vienen varios, tomamos el primero (puedes listar/permitir elegir)
    const qrData = (scans[0]?.data || '').trim();
    if (!qrData) {
      Alert.alert('Error', 'El QR detectado no contiene datos.');
      return;
    }

    // Marca como “escaneado” y dispara tu flujo actual
    setScanned(true);
    await fetchTarjetaData(qrData);

  } catch (error) {
    console.error('❌ Error al escanear desde imagen:', error);
    Alert.alert('Error', 'Ocurrió un problema al procesar la imagen.');
  } finally {
    setIsLoading(false);
  }
};

  // 🔎 Decodificar QR y traer tarjetas del cliente
  const fetchTarjetaData = async (qrCode) => {
    setIsLoading(true);
    try {
      const resp = await fetch('https://api.progresarcorp.com.py/api/decodeQr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr: qrCode }),
      });
      if (!resp.ok) throw new Error(`Error al decodificar QR: ${resp.status}`);
      const responseData = await resp.json();
      setDecodedData(responseData);

      if (num_doc) {
        await fetchClientData(num_doc);
      } else {
        Alert.alert('Atención', 'No se recibió número de documento.');
      }
    } catch (error) {
      Alert.alert('Error', `No se pudo procesar el QR: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 👤 Traer tarjetas del cliente
  const fetchClientData = async (doc) => {
    const dataUrl = `https://api.progresarcorp.com.py/api/getData?num_doc=${doc}`;
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) throw new Error(`Error al obtener datos: ${response.status}`);
      const responseData = await response.json();
      setClientes(Array.isArray(responseData) ? responseData : [responseData]);
    } catch (error) {
      Alert.alert('Error', `No se pudo obtener los datos del cliente: ${error.message}`);
    }
  };

  // ✅ Confirmar pago (requiere auth previa)
  const handleConfirmarPress = async () => {
    const ok = await ensureAuthBeforePay();
    if (!ok) return; // si abrió modal, el pago se ejecuta al confirmar password
    await handleConfirmarPago();
  };

  // 🛡️ Asegurar autenticación antes de pagar
  const ensureAuthBeforePay = async () => {
    if (authPassed) return true;

    setAuthLoading(true);
    try {
      // si hay biometría habilitada + disponible → intentar
      if (bioEnabled && bioCapable) {
        try {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Confirma tu identidad',
            fallbackLabel: 'Usar contraseña',
            cancelLabel: 'Cancelar',
            disableDeviceFallback: false,
          });
          if (result.success) {
            setAuthPassed(true);
            return true;
          }
        } catch {
          // si falla, pasamos al modal
        }
      }
      // sin biometría o falló → password modal
      setPwdInput('');
      setPwdModalVisible(true);
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  // 🔑 Validar password del modal y luego pagar
  const handlePasswordOk = async () => {
    try {
      setAuthLoading(true);
      const stored = await AsyncStorage.getItem('claveGuardada');
      const ok = !!stored && pwdInput.trim() === stored.trim();
      if (!ok) {
        Alert.alert('Error', 'Contraseña incorrecta.');
        return;
      }
      setPwdModalVisible(false);
      setAuthPassed(true);
      await handleConfirmarPago();
    } finally {
      setAuthLoading(false);
    }
  };

  // 💳 Procesar pago (tu request actual)
  const handleConfirmarPago = async () => {
    if (!selectedTarjeta || !decodedData) {
      Alert.alert('Atención', 'Faltan datos del QR o de la tarjeta seleccionada.');
      return;
    }

    try {
      setIsLoading(true);

      const filteredTarjeta = {
        codigoEntidad: 240,
        codigoBCP: selectedTarjeta.codigoBCP,
        codigoMarca: selectedTarjeta.codigoMarca,
        descripcionMarca: selectedTarjeta.descripcionMarca?.trim() || null,
        codigoProducto: selectedTarjeta.codigoProducto,
        claseTarjeta: selectedTarjeta.claseTarjeta,
        descripcionClaseTarjeta: selectedTarjeta.descripcionClaseTarjeta?.trim() || null,
        cuentaPrincipal: selectedTarjeta.cuentaPrincipal,
        numeroTarjeta: selectedTarjeta.numeroTarjeta,
        binTarjeta: selectedTarjeta.binTarjeta,
        documentoCliente: selectedTarjeta.documentoCliente || num_doc,
        nombreCliente: selectedTarjeta.nombreCliente?.trim() || null,
        apellidoCliente: selectedTarjeta.apellidoCliente?.trim() || null,
        telefonoCliente: selectedTarjeta.telefonoCliente?.trim() || null,
      };

      const postData = {
        num_doc: num_doc,
        qr_code: decodedData,
        client_data: filteredTarjeta,
      };

      const response = await fetch('https://api.progresarcorp.com.py/api/obtener_datos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(postData),
});

const text = await response.text();

// 🔍 Mostrar SIEMPRE la respuesta cruda en consola
console.log('📥 Respuesta completa del servidor:', text);

let data;
try {
  data = JSON.parse(text);
} catch (e) {
  console.warn('⚠️ Respuesta no es JSON válido:', e.message);
  data = { error: 'Respuesta no válida del servidor', raw: text };
}

// 🔴 Si hubo error HTTP (por ejemplo 400, 401, 500)
if (!response.ok) {
  const mensajeError =
    data?.detalles?.messages?.[0] ||
    data?.detalles?.header ||
    data?.error ||
    data?.message ||
    text ||
    'Error al procesar el pago.';

  // Mostrar alerta (útil mientras debuggeás)
  Alert.alert('Error de servidor', mensajeError);

  // 🔹 Armar objeto para tu vista DetallePago
  const pagoDetalle = {
    codigo: data.codigo || response.status || 'ERR',
    descripcion: mensajeError,
    numeroTransaccion: data.numeroTransaccion || '—',
    numeroBoleta: data.numeroBoleta || '—',
    fechaTransaccion: data.fechaTransaccion || new Date().toLocaleString(),
    tarjeta: selectedTarjeta?.numeroTarjeta || '—',
    monto: decodedData?.monto || 0,
    comercio: decodedData?.nombreComercio || '—',
    esErrorHttp: true,
  };

  navigation.navigate('DetallePago', { pagoDetalle });
  return;
}


      const responseCode = data.codigoRespuestaTransaccion || 'Error!';
      const map = { '00': 'APROBADA', '99': 'TRANSACCIÓN EXTORNADA' };
      const desc = map[responseCode] || data.respuestaTransaccion || 'Error en la transacción.';

      const pagoDetalle = {
        codigo: responseCode,
        descripcion: desc,
        numeroTransaccion: data.numeroTransaccion || 'N/A',
        numeroBoleta: data.numeroBoleta || 'N/A',
        fechaTransaccion: data.fechaTransaccion || 'N/A',
        tarjeta: selectedTarjeta.numeroTarjeta || 'N/A',
        monto: data.montoTransaccion || decodedData.monto || 'N/A',
        comercio: data.nombreComercio || decodedData.nombreComercio || 'N/A',
      };

      navigation.navigate('DetallePago', { pagoDetalle });
    } catch (error) {
      Alert.alert('Error', `Error al procesar el pago: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.headerTitle}>Pago con QR</Text>
          <Text style={styles.headerSubtitle}>Escaneá el código para pagar</Text>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {hasPermission === null ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#9e2021" />
              <Text style={styles.loadingText}>Solicitando permisos...</Text>
            </View>
          ) : hasPermission === false ? (
            <View style={styles.emptyCard}>
              <FontAwesome5 name="camera" size={32} color="#9e2021" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>Permisos necesarios</Text>
              <Text style={styles.emptyText}>
                Necesitamos acceso a la cámara y a la galería para poder escanear el código QR.
              </Text>
            </View>
          ) : (
            <>
              {!scanned && (
                <>
                  <View style={styles.cameraContainer}>
                    <CameraView
                      style={StyleSheet.absoluteFillObject}
                      barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                      }}
                      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    />
                  </View>

                  <TouchableOpacity style={styles.submitButton} onPress={pickImageAndScan} activeOpacity={0.85}>
                    <Ionicons name="image-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>Seleccionar imagen de QR</Text>
                  </TouchableOpacity>
                </>
              )}

              {scanned && (
                <>
                  {isLoading ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator size="large" color="#9e2021" />
                      <Text style={styles.loadingText}>Procesando...</Text>
                    </View>
                  ) : clientes.length > 0 ? (
                    <View style={styles.sectionCard}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconBadge}>
                          <Ionicons name="card-outline" size={14} color="#9e2021" />
                        </View>
                        <Text style={styles.sectionTitle}>Seleccioná una tarjeta asociada</Text>
                      </View>
                      <Picker
                        selectedValue={selectedTarjeta}
                        onValueChange={(itemValue) => setSelectedTarjeta(itemValue)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Selecciona una opción" value={null} />
                        {clientes.map((cliente, index) => (
                          <Picker.Item
                            key={index}
                            label={`${cliente.claseTarjeta} - ${cliente.numeroTarjeta}`}
                            value={cliente}
                          />
                        ))}
                      </Picker>
                    </View>
                  ) : (
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyText}>No se encontraron tarjetas.</Text>
                    </View>
                  )}

                  {selectedTarjeta && (
                    <>
                      <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                          <View style={styles.sectionIconBadge}>
                            <Ionicons name="information-circle-outline" size={14} color="#9e2021" />
                          </View>
                          <Text style={styles.sectionTitle}>Detalles de la tarjeta</Text>
                        </View>

                        <View style={styles.row}>
                          <Text style={styles.label}>Clase</Text>
                          <Text style={styles.value}>{selectedTarjeta.claseTarjeta}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.label}>Número</Text>
                          <Text style={styles.value}>{selectedTarjeta.numeroTarjeta}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.label}>Descripción</Text>
                          <Text style={styles.value}>
                            {selectedTarjeta.descripcionClaseTarjeta?.trim?.() || '-'}
                          </Text>
                        </View>
                        <View style={[styles.row, { marginBottom: 0 }]}>
                          <Text style={styles.label}>Cliente</Text>
                          <Text style={styles.value}>{selectedTarjeta.nombreCliente}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[styles.submitButton, (authLoading || isLoading) && { opacity: 0.6 }]}
                        disabled={authLoading || isLoading}
                        onPress={handleConfirmarPress}
                        activeOpacity={0.85}
                      >
                        {authLoading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.submitButtonText}>Confirmar</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.botonSecundario}
                        onPress={() => {
                          setScanned(false);
                          setClientes([]);
                          setSelectedTarjeta(null);
                          setAuthPassed(false);
                        }}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="qr-code" size={18} color="#9e2021" style={{ marginRight: 8 }} />
                        <Text style={styles.botonSecundarioText}>Escanear otro</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </ScrollView>
      </View>

      <BottomNav usuario={num_doc} />

      {/* 🔐 Modal contraseña */}
      <Modal
        visible={pwdModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPwdModalVisible(false)}
      >
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <View style={styles.resultIconCircle}>
              <Ionicons name="lock-closed" size={20} color="#fff" />
            </View>
            <Text style={styles.resultTitle}>Confirmar con contraseña</Text>
            <Text style={styles.resultMessage}>Ingresá tu contraseña de la app para continuar.</Text>

            <View style={styles.inputField}>
              <TextInput
                value={pwdInput}
                onChangeText={setPwdInput}
                placeholder="Contraseña"
                placeholderTextColor="#8a7476"
                secureTextEntry
                autoCapitalize="none"
                style={styles.inputInner}
              />
            </View>

            <View style={styles.resultButtonsRow}>
              <TouchableOpacity
                style={[styles.resultButton, styles.resultButtonSecondary, { flex: 1 }]}
                onPress={() => setPwdModalVisible(false)}
                disabled={authLoading}
                activeOpacity={0.85}
              >
                <Text style={[styles.resultButtonSecondaryText, { textAlign: 'center' }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resultButton, { flex: 1 }, authLoading && { opacity: 0.7 }]}
                onPress={handlePasswordOk}
                disabled={authLoading}
                activeOpacity={0.85}
              >
                {authLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.resultButtonText, { textAlign: 'center' }]}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // 🔹 Encabezado
  headerBackground: {
    paddingTop: 60,
    paddingHorizontal: 0,
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
    marginLeft: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    marginTop: 22,
    paddingHorizontal: 20,
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
    flex: 1,
    backgroundColor: '#faf6f5',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 20,
  },
  scrollContainer: { padding: 16, paddingBottom: 140 },

  // 🔹 Cámara
  cameraContainer: {
    height: 420,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#efe1e0',
    marginBottom: 16,
  },

  // 🔹 Card de sección
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
    flex: 1,
    fontSize: 14.5,
    fontWeight: 'bold',
    color: '#241a1a',
  },
  picker: {
    backgroundColor: '#f7f2f1',
    borderRadius: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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

  // 🔹 Botones
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#9e2021',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
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
    flexDirection: 'row',
    backgroundColor: 'rgba(158,32,33,0.08)',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonSecundarioText: {
    color: '#9e2021',
    fontWeight: 'bold',
    fontSize: 14.5,
  },

  // 🔹 Loading / vacío
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { color: '#9e2021', marginTop: 10, fontWeight: '500' },
  emptyCard: {
    borderRadius: 18,
    padding: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe1e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#241a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#6b5c5d',
    textAlign: 'center',
  },

  // 🔹 Input (modal contraseña)
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f2f1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  inputInner: {
    flex: 1,
    fontSize: 14,
    color: '#241a1a',
  },

  // 🔹 Modal (mismo estilo que el resto de la app)
  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(36,16,18,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  resultCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  resultIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#9e2021',
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#241a1a',
    marginBottom: 6,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 13.5,
    color: '#6b5c5d',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  resultButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  resultButton: {
    backgroundColor: '#9e2021',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resultButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultButtonSecondary: {
    backgroundColor: 'rgba(158,32,33,0.08)',
  },
  resultButtonSecondaryText: {
    color: '#9e2021',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
