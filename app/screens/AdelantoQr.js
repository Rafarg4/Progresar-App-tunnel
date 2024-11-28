import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native'; // Importar useNavigation
const AdelantoQr = ({ route, navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [tarjetaData, setTarjetaData] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [num_doc, setNum_doc] = useState(route.params?.num_doc || '');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [decodedData, setDecodedData] = useState(null);
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const fetchClientData = async (num_doc) => {
    setIsLoading(true);
    const dataUrl = `https://api.progresarcorp.com.py/api/getData?num_doc=${num_doc}`;
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`Error al obtener los datos del cliente: ${response.status} ${response.statusText}`);
      }
      const responseData = await response.json();
      console.log('Datos del cliente:', responseData);

      if (Array.isArray(responseData)) {
        setTarjetaData(responseData);
      } else if (responseData && typeof responseData === 'object') {
        setTarjetaData([responseData]);  // Convertir a array si es un solo objeto
      } else {
        throw new Error('Formato de datos inesperado');
      }
    } catch (error) {
      console.error('Error al obtener los datos del cliente:', error.message);
      Alert.alert('Error', `No se pudo obtener los datos del cliente: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientPassword = async (num_doc) => {
    setIsLoading(true);
    const dataUrl = `https://api.progresarcorp.com.py/api/clientes/${num_doc}`;
    try {
      console.log(`Fetching data from URL: ${dataUrl}`);
      const response = await fetch(dataUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener la contraseña: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (responseData && Array.isArray(responseData) && responseData.length > 0) {
        console.log('Client data:', responseData[0]);
        setClientPassword(responseData[0].clave);
      } else {
        throw new Error('No se encontró una contraseña para el cliente');
      }
    } catch (error) {
      console.error('Error al obtener la contraseña:', error.message);
      Alert.alert('Error', `No se pudo obtener la contraseña: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTarjetaData = async (qrCode) => {
    setIsLoading(true);
    try {
        const response = await fetch('https://api.progresarcorp.com.py/api/decodificarQr', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ qr: qrCode }),
        });

        if (!response.ok) {
            throw new Error(`Error al obtener los datos: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('Datos decodificados:', responseData);

        // Una vez que se decodifica el QR, obtén los datos del cliente
        await fetchClientData(num_doc);
        await fetchClientPassword(num_doc);

        // Guardar los datos decodificados en el estado
        setDecodedData(responseData);

    } catch (error) {
        console.error('Error al obtener los datos:', error.message);
        Alert.alert('Error', `No se pudo obtener los datos: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
};

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setQrCode(data);
    setPasswordModalVisible(false); // Cerrar el modal de contraseña si está abierto
    setModalVisible(true);

    // Primero, decodifica el QR
    await fetchTarjetaData(data);
  };

  const handleConfirmTransaction = () => {
    if (selectedCard) {
      setModalVisible(false); // Cerrar el modal de selección de tarjetas
      setPasswordModalVisible(true); // Mostrar el modal de contraseña
    } else {
      Alert.alert('Error', 'Por favor, seleccione una tarjeta.');
    }
  };

  const handlePasswordSubmit = async () => {
    if (password === clientPassword) {
        try {
            // Ocultar los modales
            setPasswordModalVisible(false);
            setModalVisible(false);

            // Mostrar un Alert de procesamiento
            Alert.alert(
                'Procesando⌛',
                'Por favor, espera mientras se procesa la transacción...',
                [],
                { cancelable: false }
            );

            // Datos a enviar a la API, usando los datos decodificados en vez de qrCode
            const postData = {
                num_doc: num_doc,
                qr_code: decodedData, // Datos decodificados del QR
                client_data: selectedCard, // Información completa de la tarjeta seleccionada
            };

            console.log('Datos enviados al servidor:', postData);

            // Realizar la solicitud a la API
            const response = await fetch('https://api.progresarcorp.com.py/api/obtener_datos_atm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            // Obtener el texto completo de la respuesta
            const text = await response.text();

            // Manejo de la respuesta, considerando posibles respuestas vacías
            let responseData = null;
            if (text) {
                try {
                    responseData = JSON.parse(text);
                } catch (parseError) {
                    console.error('Error al analizar la respuesta JSON:', parseError.message);
                    throw new Error('La respuesta de la API no es un JSON válido.');
                }
            }

            // Mapear códigos de respuesta a descripciones
            const responseCodeMap = {
              '1': 'VALIDACIÓN REALIZADA CON ÉXITO',
              
          };
            // Obtener el código de respuesta y su descripción
            const responseCode = responseData?.codigoRespuestaTransaccion || 'N/A';
            const responseDescription = responseCodeMap[responseCode] || 'Código de respuesta desconocido, hubo un error al realizar la transcaccion.';

            if (responseCode === '1') {
                // Formatear la respuesta JSON de manera amigable
                const formattedResponse = `
Código de Respuesta: 
${responseCode} - ${responseDescription}

                `;

                // Mostrar el resultado de la API en un Alert
                Alert.alert(
                    'Transacción Exitosa ✅',
                    `Tarjeta Seleccionada: ${selectedCard.numeroTarjeta}\n${formattedResponse}`,
                    [
                        {
                            text: 'Confirmar',
                            onPress: () => navigation.goBack() // Realiza un back al presionar OK
                        }
                    ]
                );
            } else {
                // Mostrar un error basado en el código de respuesta
                Alert.alert(
                    'Error en la Transacción ❌',
                    `Código de Respuesta: ${responseCode}\nDescripción: ${responseDescription}`,
                    [
                        {
                            text: 'Entendido',
                            onPress: () => navigation.goBack() // Realiza un back al presionar OK
                        }
                    ]
                );
            }

        } catch (error) {
            console.error('Error al enviar los datos:', error.message);
            Alert.alert('Error', `No se pudo enviar los datos: ${error.message}`);
        }
    } else {
        Alert.alert('Error', 'Contraseña incorrecta. Por favor, inténtelo de nuevo.');
    }
};
  const obtenerNombreClase = (clase) => {
    switch (clase) {
      case 'TR':
        return 'La Trinidad';
      case 'J7':
        return 'La Fep';
      case 'JM':
        return 'Clasica';
      case 'JW':
        return 'Clasica';
      default:
        return 'No definida';
    }
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso para la cámara</Text>;
  }
  if (hasPermission === false) {
    return <Text>No se ha concedido permiso para acceder a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
      
      </Text>

      {!scanned && !modalVisible && (
        <>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.frameContainer}>
            <View style={styles.frame}>
              <Text style={styles.frameText}>Alinea el QR dentro del marco</Text>
            </View>
          </View>
        </>
      )}
<Modal
  visible={modalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Detalles de Qr escaneado</Text>
                {qrCode && (
                    <Text style={{ fontSize: 18, color: 'green', marginTop: 10 }}>
                        Qr correcto ✅
                    </Text>
                )}
      <Text style={styles.modalTitle}>Seleccione una tarjeta</Text>
      {isLoading ? (
        <Text>Cargando tarjetas...</Text>
      ) : (
        <ScrollView style={styles.cardList}>
          {tarjetaData.length > 0 ? (
            tarjetaData.map((tarjeta, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.card,
                  selectedCard && selectedCard.numeroTarjeta === tarjeta.numeroTarjeta && styles.selectedCard,
                ]}
                onPress={() => setSelectedCard(tarjeta)}
              >
                <Text style={styles.cardText}>
                  {obtenerNombreClase(tarjeta.claseTarjeta)} - {tarjeta.numeroTarjeta}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>No se encontraron tarjetas disponibles</Text>
          )}
        </ScrollView>
      )}
      <View style={styles.modalButtonContainer}>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: 'red' }]}
          onPress={handleConfirmTransaction}
        >
          <Text style={styles.modalButtonText}>Seleccionar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: 'gray' }]}
          onPress={() => {
            setModalVisible(false);
            setScanned(false);
          }}
        >
          <Text style={styles.modalButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
      {/* Modal para ingresar la contraseña */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ingrese su contraseña</Text>
            <TextInput
              style={styles.input}
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: 'red' }]}
                onPress={handlePasswordSubmit}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: 'gray' }]}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
  },
  instructionText: {
    textAlign: 'center',
    margin: 20,
    fontSize: 30,
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 300,
    height: 300,
    borderWidth: 2,
    borderColor: '#bf0404',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameText: {
    color: 'white',
    fontSize: 18,
    position: 'absolute',
    top: -30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  cardList: {
    width: '100%',
    maxHeight: 200,
  },
  card: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedCard: {
    backgroundColor: '#d0f0c0',
  },
  cardText: {
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
});
export default AdelantoQr;