import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Linking,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from "expo-sharing";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
const Extracto = () => {
  const route = useRoute();
  const { num_doc } = route.params || {};

  const [modalMesVisible, setModalMesVisible] = useState(false);
  const [modalAnyoVisible, setModalAnyoVisible] = useState(false);
  const [modalTarjetaVisible, setModalTarjetaVisible] = useState(false);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState("Seleccione una tarjeta");
  const [tarjetaCompletaSeleccionada, setTarjetaCompletaSeleccionada] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState("Seleccione un mes");
  const [anyoSeleccionado, setAnyoSeleccionado] = useState("Seleccione un año");
  const [tarjetas, setTarjetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
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
  const fetchTarjetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://api.progresarcorp.com.py/api/ver_tarjetas_bepsa/${usuario}`
      );
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      const data = await response.json();
      setTarjetas(data);
    } catch (error) {
      setError("No se pudieron cargar las tarjetas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario) {
      fetchTarjetas();
    }
  }, [usuario]);

  const nombreClaseTarjeta = (clase) => {
    switch (clase) {
      case "TR": return "Trinidad";
      case "JM":return "Clásica"
      case "V6": return "Visa";
      case "RC":
      case "RM": return "Rotary";
      case "1": return "Dinelco";
      case "J7": return "Fep";
      case "EV": return "El viajero";
      case "TS": return "Comedi";
      case "JW": return "Mujer";
      case "FR": return "Afuni";
      case "J0": return "Empresarial";
      case "EI": return "Visa empresarial";
      default: return clase || "";
    }
  };

  const obtenerNumeroMes = (mes) => {
    const meses = {
      Enero: "01", Febrero: "02", Marzo: "03", Abril: "04",
      Mayo: "05", Junio: "06", Julio: "07", Agosto: "08",
      Septiembre: "09", Octubre: "10", Noviembre: "11", Diciembre: "12"
    };
    return meses[mes];
  };
const descargarPDF = async (url, nombreArchivo) => {
  try {
    const fileUri = FileSystem.documentDirectory + nombreArchivo;
    console.log("📦 URL a descargar:", url);
    console.log("📦 Nombre de archivo:", nombreArchivo);
    console.log("📁 Se guardará en:", fileUri);

    const download = await FileSystem.downloadAsync(url, fileUri);
    console.log('✅ Archivo descargado en:', download.uri);

    // Compartir o alertar ubicación
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(download.uri);
    } else {
      Alert.alert("Descargado", "El archivo se guardó en: " + download.uri);
    }
  } catch (error) {
    console.error("❌ Error al descargar:", error);
    Alert.alert("Error", "No se pudo descargar el archivo.");
  }
};

const handleDownload = async () => {
  if (
    !tarjetaCompletaSeleccionada ||
    mesSeleccionado === "Seleccione un mes" ||
    anyoSeleccionado === "Seleccione un año"
  ) {
    Alert.alert("¡Error!", "Debe seleccionar tarjeta, mes y año antes de continuar.");
    return;
  }

  const nroTarjeta = tarjetaCompletaSeleccionada.nro_tarjeta;
  const clase = tarjetaCompletaSeleccionada.clase_tarjeta || "";
  const tipo_tc = clase === "1" ? "Bepsa" : "Otra";
  const mes = obtenerNumeroMes(mesSeleccionado); // Ej: "05"
  const anho = anyoSeleccionado;

  try {
    const response = await fetch("https://api.progresarcorp.com.py/generar_extracto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nro_tarjeta: nroTarjeta,
        tipo_tc: tipo_tc,
        mes: mes,
        anho: anho,
      }),
    });

    const rawResponseText = await response.text();
    console.log("📄 Respuesta cruda del servidor:", rawResponseText);

    let data;
    try {
      data = JSON.parse(rawResponseText);
    } catch (parseError) {
      console.error("❌ Error al parsear JSON:", parseError);
      throw new Error("La respuesta no es un JSON válido.");
    }

    if (response.ok) {
      console.log("✅ Respuesta OK:", data);

      // Si Laravel no devuelve la URL, la armamos manualmente:
      const urlDescarga = data?.url_pdf || 
        `https://api.progresarcorp.com.py/extractos_generados/extracto_${nroTarjeta}_${mes}_${anho}.pdf`;

      Alert.alert(
        "¡Éxito!",
        "El extracto fue generado correctamente.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Descargar PDF",
            onPress: () => descargarPDF(urlDescarga, `extracto_${nroTarjeta}_${mes}_${anho}.pdf`),
          },
        ]
      );

    } else {
      console.log("❌ Error del servidor:", data);
      Alert.alert("Error", data.error || "No se pudo generar el extracto.");
    }

  } catch (error) {
    console.error("💥 Error general:", error);
    Alert.alert("Error", error.message || "Ocurrió un error inesperado.");
  }
};

const handleRequestByEmail = async () => {
  if (!tarjetaCompletaSeleccionada || !mesSeleccionado || !anyoSeleccionado) {
    Alert.alert("Faltan datos", "Debe seleccionar tarjeta, mes y año antes de continuar.");
    return;
  }

  const nroTarjeta = tarjetaCompletaSeleccionada.nro_tarjeta;
  const tipoTC = tarjetaCompletaSeleccionada.clase_tarjeta === '1' ? 'Bepsa' : 'Procard';
  const mes = obtenerNumeroMes(mesSeleccionado);
  const anio = anyoSeleccionado;

 try {
  const response = await fetch('https://api.progresarcorp.com.py/api/guardar_solicitud_extracto', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      num_doc: usuario,
      nro_tarjeta: nroTarjeta,
      mes,
      anho: anio,
      tipo_tc: tipoTC,
    }),
  });

  const contentType = response.headers.get('content-type');

  if (!response.ok) {
    // Si no es JSON, lo tratamos como texto plano (puede ser HTML)
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      console.error('Error del servidor:', errorData);
    } else {
      const errorText = await response.text();
      console.error('Respuesta inesperada (no JSON):', errorText);
    }

    Alert.alert("Error", "No se pudo enviar la solicitud.");
    return;
  }

  // Si todo va bien:
  const result = await response.json();
  console.log('Respuesta exitosa:', result);
  Alert.alert("Éxito", "La solicitud fue enviada por correo.");

} catch (error) {
  console.error('Error en la petición:', error.message || error);
  Alert.alert("Error", "Hubo un problema al enviar la solicitud.");
}
};

  return (
    
    <View style={styles.container}>
    {/* Cabecera con imagen */}
        <View style={[styles.headerContainer, { width: '100%' }]}>
          <Image
                source={require('../assets/inicio.png')}  
            style={styles.headerImage}
            resizeMode="cover"
          /> 
          <Text style={styles.headerText}>Extractos</Text>
        </View> 
      <ScrollView style={styles.scrollView}>
          <View style={{ height: 10 }} /> 
        {/* Card de campos y botones */}
        <View style={styles.card}>
          {/* Campo: Tarjeta */}
          <Text style={styles.fieldTitle}>Tarjeta</Text>
          <TouchableOpacity
            onPress={() => setModalTarjetaVisible(true)}
            style={styles.selectButton}
          >
            <Text style={styles.selectButtonText}>
              {tarjetaSeleccionada || "Seleccione una tarjeta"}
            </Text>
          </TouchableOpacity>

          {/* Campo: Año */}
          <Text style={styles.fieldTitle}>Año</Text>
          <TouchableOpacity
            onPress={() => setModalAnyoVisible(true)}
            style={styles.selectButton}
          >
            <Text style={styles.selectButtonText}>
              {anyoSeleccionado || "Seleccione un año"}
            </Text>
          </TouchableOpacity>

          {/* Campo: Mes */}
          <Text style={styles.fieldTitle}>Mes</Text>
          <TouchableOpacity
            onPress={() => setModalMesVisible(true)}
            style={styles.selectButton}
          >
            <Text style={styles.selectButtonText}>
              {mesSeleccionado || "Seleccione un mes"}
            </Text>
          </TouchableOpacity>

          {/* Footer de botones dentro del mismo card */}
          <View style={{ borderTopWidth: 1, borderTopColor: "#ccc", marginTop: 20 }} />
          <View style={styles.footerButtons}>
            <TouchableOpacity onPress={handleDownload} style={styles.actionButton}>
              <Text style={styles.buttonText}>  <FontAwesome5 name="download" size={16} color="#fff" style={styles.icon} /> Descargar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRequestByEmail} style={styles.actionButton}>
              <Text style={styles.buttonText}>  <FontAwesome5 name="envelope" size={16} color="#fff" style={styles.icon} /> Correo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modales */}

      {/* Modal Tarjeta */}
      <Modal visible={modalTarjetaVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Seleccione una tarjeta</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : tarjetas.length === 0 ? (
              <Text style={styles.errorText}>No hay tarjetas disponibles.</Text>
            ) : (
              tarjetas.map((tarjeta, index) => {
                const terminacion = tarjeta.nro_tarjeta?.slice(-4);
                const tarjetaText = `${nombreClaseTarjeta(
                  tarjeta.clase_tarjeta
                )} - **** ${terminacion}`;

                const isSelected = tarjetaSeleccionada.includes(terminacion);

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setTarjetaSeleccionada(tarjetaText);
                      setTarjetaCompletaSeleccionada(tarjeta); // Guarda el objeto completo
                      setModalTarjetaVisible(false);
                    }}
                    style={[styles.tarjetaItem, isSelected && styles.selectedItem]}
                  >
                    <Text style={styles.tarjetaText}>{tarjetaText}</Text>
                  </TouchableOpacity>
                );
              })
            )}
            <TouchableOpacity
              onPress={() => setModalTarjetaVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Año */}
      <Modal visible={modalAnyoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Seleccione un año</Text>
            {["2025", "2026"].map((anyo, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setAnyoSeleccionado(anyo);
                  setModalAnyoVisible(false);
                }}
                style={[styles.tarjetaItem, anyoSeleccionado === anyo && styles.selectedItem]}
              >
                <Text style={styles.tarjetaText}>{anyo}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setModalAnyoVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Mes */}
      <Modal visible={modalMesVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Seleccione un mes</Text>
            {[
              "Enero",
              "Febrero",
              "Marzo",
              "Abril",
              "Mayo",
              "Junio",
              "Julio",
              "Agosto",
              "Septiembre",
              "Octubre",
              "Noviembre",
              "Diciembre",
            ].map((mes, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setMesSeleccionado(mes);
                  setModalMesVisible(false);
                }}
                style={[styles.tarjetaItem, mesSeleccionado === mes && styles.selectedItem]}
              >
                <Text style={styles.tarjetaText}>{mes}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setModalMesVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // si querés color de fondo
    paddingHorizontal: 0,    // evita que el padding lo achique
    margin: 0,
    width: '100%'            // asegura que ocupe todo el ancho de pantalla
  },
  scrollView: {
    
    flex: 1,
  },
  fieldTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 8,
}, 
 // ✅ deja SOLO una versión de estos estilos
headerContainer: {
  position: 'relative',
  overflow: 'hidden',
  borderBottomLeftRadius: 25,
  borderBottomRightRadius: 25,
  marginBottom: 10,
},
headerImage: {
  width: Dimensions.get('window').width, // ancho real de pantalla
  height: 180,
},
headerText: {
  position: 'absolute',
  bottom: 20,
  left: 20,
  color: '#fff',
  fontSize: 26,
  fontWeight: 'bold',
  textShadowColor: 'rgba(0,0,0,0.6)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
},

   scrollContainer: {
      padding: 20
    },
  card: {
  width: '92%',          // 👈 no ocupa 100%
  maxWidth: 520,         // 👈 tope lindo en tablets
  alignSelf: 'center',   // 👈 centrado
  padding: 20,           // (puedes bajar de 30 a 20 para que respire)
  marginBottom: 20,
  backgroundColor: '#fff',
  borderRadius: 12,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
},
  generalHeader: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 5,
    fontWeight: "bold",
  },
  selectButton: {
    padding: 10,
    backgroundColor: "lightgray",
    alignItems: "center",
    borderRadius: 5,
  },
  selectButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  tarjetaItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  tarjetaText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#bf0404",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  footerText_importante: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#bf0404",
    textAlign: "center",
    marginTop: 10,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  downloadButton: {
    padding: 10,
    backgroundColor: "#bf0404",
    alignItems: "center",
    borderRadius: 5,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  headerImage: {
  width: '100%',
  height: 150,
  borderRadius: 10,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  backgroundColor: 'white',
  width: '80%',
  borderRadius: 15,
  padding: 20,
  elevation: 5,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 15,
  textAlign: 'center',
},
tarjetaItem: {
  paddingVertical: 12,
  paddingHorizontal: 15,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  marginBottom: 10,
  backgroundColor: '#f9f9f9',
},
selectedItem: {
  borderColor: '#bf0404',
  backgroundColor: '#ffeaea',
},
tarjetaText: {
  fontSize: 16,
  textAlign: 'center',
},
selectButton: {
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: '#9e2021',
  padding: 12,
  borderRadius: 10,
  marginBottom: 10,
},
selectButtonText: {
  color: '#9e2021',
  fontWeight: 'bold',
  textAlign: 'center',
},
closeButton: { 
  backgroundColor: '#9e2021',
  padding: 10,
  borderRadius: 8,
  marginTop: 10,
},
closeButtonText: {
  color: 'white',
  textAlign: 'center',
  fontWeight: 'bold',
},
footerButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
  gap: 10, // Espacio entre botones (si usas React Native 0.71+)
},
actionButton: {
  flex: 1,
  padding: 12,
  backgroundColor: '#9e2021',
  borderRadius: 8,
  alignItems: 'center',
},
buttonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 13,
},

});

export default Extracto;