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
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';

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

  if (hasPermission === null) return <Text style={styles.center}>Solicitando permisos...</Text>;
  if (hasPermission === false) return <Text style={styles.center}>Permisos de cámara o galería no otorgados.</Text>;

  return (
    <View style={styles.container}>
      {/* Cabecera */}
      <ImageBackground
        source={require('../assets/inicio.png')}
        style={styles.headerBackground}
        imageStyle={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
      >
        <View style={styles.headerOverlay}>
          <Ionicons name="qr-code-outline" size={32} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.headerText}>Escanear Código QR</Text>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
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

            <TouchableOpacity style={styles.imageButton} onPress={pickImageAndScan}>
              <Ionicons name="image-outline" size={22} color="#fff" />
              <Text style={styles.imageButtonText}>Seleccionar imagen de QR</Text>
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
              <View style={styles.cardPickerBox}>
                <View style={styles.cardPickerHeader}>
                  <Ionicons name="card-outline" size={20} color="#9e2021" />
                  <Text style={styles.label}>Seleccione una tarjeta asociada</Text>
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
              <Text style={styles.noData}>No se encontraron tarjetas.</Text>
            )}

            {selectedTarjeta && (
              <>
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Detalles de la tarjeta:</Text>
                  <Text>Clase: {selectedTarjeta.claseTarjeta}</Text>
                  <Text>Número: {selectedTarjeta.numeroTarjeta}</Text>
                  <Text>Descripción: {selectedTarjeta.descripcionClaseTarjeta?.trim?.() || ''}</Text>
                  <Text>Cliente: {selectedTarjeta.nombreCliente}</Text>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton, (authLoading || isLoading) && { opacity: 0.6 }]}
                    disabled={authLoading || isLoading}
                    onPress={handleConfirmarPress}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.buttonText}>
                      {authLoading ? 'Autenticando...' : 'Confirmar'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => {
                      setScanned(false);
                      setClientes([]);
                      setSelectedTarjeta(null);
                      setAuthPassed(false);
                    }}
                  >
                    <Ionicons name="qr-code" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Escanear otro</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* 🔐 Modal contraseña */}
      <Modal
        visible={pwdModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPwdModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar con contraseña</Text>
            <Text style={styles.modalSubtitle}>Ingresa tu contraseña de la app para continuar.</Text>

            <TextInput
              value={pwdInput}
              onChangeText={setPwdInput}
              placeholder="Contraseña"
              secureTextEntry
              style={styles.modalInput}
              autoCapitalize="none"
            />

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => setPwdModalVisible(false)}
                disabled={authLoading}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalOk, authLoading && { opacity: 0.7 }]}
                onPress={handlePasswordOk}
                disabled={authLoading}
              >
                <Text style={styles.modalBtnText}>
                  {authLoading ? 'Validando...' : 'Confirmar'}
                </Text>
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
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cameraContainer: {
    height: 500,
    marginHorizontal: 20,
    marginTop: 50,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#9e2021',
  },
  imageButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9e2021',
    marginHorizontal: 80,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  imageButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  cardPickerBox: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: '#fff7f7',
    borderWidth: 1,
    borderColor: '#9e2021',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  cardPickerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { fontWeight: 'bold', color: '#333' },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  infoBox: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: '#fff2f2',
    borderWidth: 1,
    borderColor: '#9e2021',
    borderRadius: 10,
    padding: 15,
  },
  infoTitle: { fontWeight: 'bold', color: '#9e2021', marginBottom: 5 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 30,
    marginTop: 25,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalCard: {
  width: '85%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 18,
},
modalTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#333',
},
modalSubtitle: {
  marginTop: 6,
  color: '#666',
},
modalInput: {
  marginTop: 14,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
},
modalRow: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: 16,
},
modalBtn: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 8,
  marginLeft: 10,
},
modalCancel: { backgroundColor: '#888' },
modalOk: { backgroundColor: '#9e2021' },
modalBtnText: { color: '#fff', fontWeight: '600' },
  confirmButton: { backgroundColor: '#28a745', marginRight: 10 },
  secondaryButton: { backgroundColor: '#9e2021', marginLeft: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loadingBox: { alignItems: 'center', marginTop: 40 },
  loadingText: { color: '#9e2021', marginTop: 10, fontWeight: 'bold' },
  noData: { textAlign: 'center', color: '#9e2021', marginTop: 20 },
  center: { flex: 1, textAlign: 'center', textAlignVertical: 'center' },
});
