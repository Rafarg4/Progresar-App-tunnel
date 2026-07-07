import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ImageBackground,
  Linking,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
// use legacy FileSystem API to keep downloadAsync and getContentUriAsync without deprecation
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import * as IntentLauncher from "expo-intent-launcher";
import BottomNav from '../components/BottomNav';

const Extracto = () => {
  const route = useRoute();
  const navigation = useNavigation();

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
  const [usuario, setUsuario] = useState('');

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const usuarioGuardado = await AsyncStorage.getItem('usuarioGuardado');
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
      case "JM": return "Clásica";
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

      const safeName = nombreArchivo.replace(/[^\w.\-]/g, "_");
      const fileUri = FileSystem.documentDirectory + safeName;

      console.log("⬇️ Descargando:", url);
      const { uri: downloadedUri, status } = await FileSystem.downloadAsync(url, fileUri);
      if (status !== 200) {
        Alert.alert("Error", `No se pudo descargar (HTTP ${status}).`);
        return;
      }

      console.log("✅ PDF descargado temporalmente en:", downloadedUri);
      Alert.alert(
        "✅ Descargado",
        "El archivo fue guardado correctamente.",
        [
          { text: "Cerrar", style: "cancel" },
          {
            text: "Abrir",
            onPress: async () => {
              try {
                if (Platform.OS === "android") {
                  const cUri = await FileSystem.getContentUriAsync(downloadedUri);
                  await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
                    data: cUri,
                    flags: 1,
                    type: "application/pdf",
                  });
                } else {
                  await Linking.openURL(downloadedUri);
                }
              } catch (e) {
                console.log("⚠️ No se pudo abrir visor PDF:", e);
                try {
                  await Linking.openURL(url);
                } catch (err) {
                  console.log("⚠️ Tampoco se pudo abrir la URL remota:", err);
                  Alert.alert("Aviso", "No se pudo abrir el archivo ni en el dispositivo ni en el navegador.");
                }
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("❌ Error al descargar:", error);
      Alert.alert("Error", "No se pudo guardar o abrir el archivo.");
    }
  };

  // 🔹 función global para mapear clase_tarjeta a nombre de carpeta
  const nombreTipoTarjeta = (clase) => {
    switch (clase) {
      case "V6": return "Visa";
      case "1": return "Dinelco";
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
      default: return "Otros";
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

    const clase = tarjetaCompletaSeleccionada.clase_tarjeta || "";
    const tipoTarjeta = nombreTipoTarjeta(clase);
    const mes = obtenerNumeroMes(mesSeleccionado);
    const nombreMes = mesSeleccionado;
    const anho = anyoSeleccionado;
    const nroUsuario = tarjetaCompletaSeleccionada.nro_usuario;

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
                  data.url_pdf,
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.headerTitle}>Extractos</Text>
            <Text style={styles.headerSubtitle}>
              Descargá tus extractos mensuales de tarjeta de forma rápida y segura.
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.sheet}>
          <View style={styles.card}>
            <Text style={styles.fieldTitle}>Tarjeta</Text>
            <TouchableOpacity
              onPress={() => setModalTarjetaVisible(true)}
              style={styles.selectButton}
            >
              <Text style={styles.selectButtonText} numberOfLines={1}>
                {tarjetaSeleccionada || "Seleccione una tarjeta"}
              </Text>
              <FontAwesome5 name="chevron-down" size={12} color="#9e2021" />
            </TouchableOpacity>

            <Text style={styles.fieldTitle}>Año</Text>
            <TouchableOpacity
              onPress={() => setModalAnyoVisible(true)}
              style={styles.selectButton}
            >
              <Text style={styles.selectButtonText}>
                {anyoSeleccionado || "Seleccione un año"}
              </Text>
              <FontAwesome5 name="chevron-down" size={12} color="#9e2021" />
            </TouchableOpacity>

            <Text style={styles.fieldTitle}>Mes</Text>
            <TouchableOpacity
              onPress={() => setModalMesVisible(true)}
              style={styles.selectButton}
            >
              <Text style={styles.selectButtonText}>
                {mesSeleccionado || "Seleccione un mes"}
              </Text>
              <FontAwesome5 name="chevron-down" size={12} color="#9e2021" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDownload} style={styles.actionButton} activeOpacity={0.85}>
              <FontAwesome5 name="download" size={15} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Descargar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal Tarjeta */}
      <Modal visible={modalTarjetaVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Seleccione una tarjeta</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#9e2021" />
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
                      setTarjetaCompletaSeleccionada(tarjeta);
                      setModalTarjetaVisible(false);
                    }}
                    style={[styles.tarjetaItem, isSelected && styles.selectedItem]}
                  >
                    <Text style={[styles.tarjetaText, isSelected && styles.tarjetaTextSelected]}>{tarjetaText}</Text>
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
                <Text style={[styles.tarjetaText, anyoSeleccionado === anyo && styles.tarjetaTextSelected]}>{anyo}</Text>
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
              "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
              "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre",
            ].map((mes, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setMesSeleccionado(mes);
                  setModalMesVisible(false);
                }}
                style={[styles.tarjetaItem, mesSeleccionado === mes && styles.selectedItem]}
              >
                <Text style={[styles.tarjetaText, mesSeleccionado === mes && styles.tarjetaTextSelected]}>{mes}</Text>
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

      <BottomNav usuario={usuario} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  scrollView: { flex: 1 },
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
    backgroundColor: "rgba(36,16,18,0.25)",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.88)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    marginTop: 22,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: "#fff",
    fontSize: 13,
    marginTop: 4,
    opacity: 0.95,
    lineHeight: 18,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // 🔹 Hoja de contenido
  sheet: {
    backgroundColor: "#faf6f5",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 20,
    paddingHorizontal: 16,
  },

  // 🔹 Card principal
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#efe1e0",
    borderRadius: 18,
    padding: 16,
  },

  fieldTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b5c5d",
    marginBottom: 6,
  },

  // 🔹 Selectores de tarjeta, año y mes
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f7f2f1",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  selectButtonText: {
    flex: 1,
    color: "#241a1a",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 8,
  },

  // 🔹 Botón de descarga
  actionButton: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: "#9e2021",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: "#9e2021",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  // 🔹 Modal general
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(36,16,18,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14,
    textAlign: "center",
    color: "#241a1a",
  },
  tarjetaItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: "#f7f2f1",
  },
  selectedItem: {
    backgroundColor: "#9e2021",
  },
  tarjetaText: {
    fontSize: 14,
    textAlign: "center",
    color: "#241a1a",
    fontWeight: "600",
  },
  tarjetaTextSelected: {
    color: "#fff",
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 6,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#9e2021",
    fontWeight: "bold",
    fontSize: 14,
  },

  errorText: {
    color: "#9e2021",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
});

export default Extracto;
