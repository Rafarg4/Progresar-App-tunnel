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
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from "expo-sharing";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import * as MediaLibrary from "expo-media-library";
import * as IntentLauncher from "expo-intent-launcher";
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
      Setiembre: "09", Octubre: "10", Noviembre: "11", Diciembre: "12"
    };
    return meses[mes];
  };

const descargarPDF = async (url, nombreArchivo) => {
  try {
    if (!url) {
      Alert.alert("Error", "No se recibió una URL válida.");
      return;
    }

    // Asegurar nombre limpio
    const safeName = nombreArchivo.replace(/[^\w.\-]/g, "_");

    // 📥 Descargar primero en caché
    const tempPath = FileSystem.cacheDirectory + safeName;
    console.log("⬇️ Descargando:", url);
    const { uri: downloadedUri, status } = await FileSystem.downloadAsync(url, tempPath);
    if (status !== 200) {
      Alert.alert("Error", `No se pudo descargar (HTTP ${status}).`);
      return;
    }

    console.log("✅ PDF descargado temporalmente en:", downloadedUri);

    // 🔐 Pedir permiso de escritura
    const { status: permStatus } = await MediaLibrary.requestPermissionsAsync(true);
    if (permStatus !== "granted") {
      Alert.alert("Permiso requerido", "Debe permitir acceso al almacenamiento.");
      return;
    }

    // 🗂️ Crear o usar álbum “ProgresarPDFs” dentro de Descargas
    const asset = await MediaLibrary.createAssetAsync(downloadedUri);
    await MediaLibrary.createAlbumAsync("ProgresarPDFs", asset, false);

    Alert.alert("✅ Descargado", `Guardado en carpeta: Descargas/ProgresarPDFs\n\nNombre: ${safeName}`);

    // 🔹 Abrir el PDF automáticamente si hay visor instalado
    if (Platform.OS === "android") {
      try {
        const intent = await import("expo-intent-launcher");
        await intent.startActivityAsync("android.intent.action.VIEW", {
          data: asset.uri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: "application/pdf",
        });
      } catch (e) {
        console.log("⚠️ No se pudo abrir visor PDF:", e);
      }
    } else {
      await Linking.openURL(asset.uri);
    }
  } catch (error) {
    console.error("❌ Error al descargar:", error);
    Alert.alert("Error", "No se pudo guardar el archivo.");
  }
};

// 🔹 función global para mapear clase_tarjeta a nombre de carpeta
const nombreTipoTarjeta = (clase) => {
  switch (clase) {
    case "V6": return "Visa";
    case "1":  return "Dinelco";
    case "JM": return "Credicard";
    case "TR": return "Credicard";
    case "RC": return "Credicard";
    case "RM": return "Credicard";
    case "J7": return "Credicard";
    case "EV": return "Credicard";
    case "TS": return "Credicard";
    case "JW": return "Credicard";
    case "FR": return "Credicard";
    case "J0": return "Credicard";
    case "EI": return "Visa";
    default:   return "Otros"; // fallback
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

  // 🔹 Datos necesarios
  const clase = tarjetaCompletaSeleccionada.clase_tarjeta || "";
  const tipoTarjeta = nombreTipoTarjeta(clase);  // ej: "Visa", "Dinelco"
  const mes = obtenerNumeroMes(mesSeleccionado); // ej: "09"
  const nombreMes = mesSeleccionado;             // ej: "Setiembre"
  const anho = anyoSeleccionado;
  const nroUsuario = tarjetaCompletaSeleccionada.nro_usuario; // de tu API

  try {
    const response = await fetch("https://api.progresarcorp.com.py/generar_extracto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nro_usuario: nroUsuario,
        anho,
        mes,
        nombreMes,
        tipo_tarjeta: tipoTarjeta,
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

    if (response.ok && data.success) {
      console.log("✅ URL recibida:", data.url_pdf);

      Alert.alert(
        "¡Éxito!",
        "El extracto está disponible.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Descargar PDF",
            onPress: () =>
              descargarPDF(
                data.url_pdf, // 👈 usamos la URL del backend
                data.filename || `Extracto_${tipoTarjeta}_${mes}_${anho}_${nroUsuario}.pdf`
              ),
          },
        ]
      );
    } else {
      console.log("❌ Error del servidor:", data);
      Alert.alert("Error", data.error || "No se pudo obtener el extracto.");
    }
  } catch (error) {
    console.error("💥 Error general:", error);
    Alert.alert("Error", error.message || "Ocurrió un error inesperado.");
  }
};

  return (
    
    <View style={styles.container}>
    {/* Cabecera con imagen */}
       <View style={styles.headerContainer}>
        <Image
          source={require('../assets/inicio.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerText}>Extractos</Text>
          <Text style={styles.headerSubText}>
            Descargue sus extractos mensuales de tarjeta de forma rápida y segura.
          </Text>
        </View>
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
              "Setiembre",
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
    backgroundColor: "#fff",
    width: "100%",
  },

  // 🔹 Cabecera con imagen y texto
  headerContainer: {
    position: "relative",
    overflow: "hidden",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
  },
  headerImage: {
    width: Dimensions.get("window").width,
    height: 150,
  },
  headerOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  headerSubText: {
    color: "#f2f2f2",
    fontSize: 13,
    lineHeight: 18,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  scrollView: {
    flex: 1,
  },

  // 🔹 Tarjeta principal
  card: {
    width: "92%",
    maxWidth: 520,
    alignSelf: "center",
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  fieldTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },

  // 🔹 Selectores de tarjeta, año y mes
  selectButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#9e2021",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#9e2021",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },

  // 🔹 Pie de botones (descargar, etc.)
  footerButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  actionButton: {
    width: 220,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#9e2021",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  // 🔹 Modal general
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  tarjetaItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  selectedItem: {
    borderColor: "#9e2021",
    backgroundColor: "#ffeaea",
  },
  tarjetaText: {
    fontSize: 14,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#9e2021",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
});


export default Extracto;