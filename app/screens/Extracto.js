import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRoute } from "@react-navigation/native";

const Extracto = () => {
  const route = useRoute();
  const { num_doc } = route.params || {};
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMesVisible, setModalMesVisible] = useState(false);
  const [modalAnyoVisible, setModalAnyoVisible] = useState(false);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState("Seleccione una tarjeta");
  const [mesSeleccionado, setMesSeleccionado] = useState("Seleccione un mes");
  const [anyoSeleccionado, setAnyoSeleccionado] = useState("Seleccione un año");
  const [tarjetas, setTarjetas] = useState([]); // Estado para guardar las tarjetas
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error

  // Función para obtener las tarjetas de la API
  const fetchTarjetas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.progresarcorp.com.py/api/ver_tarjetas_bepsa/${num_doc}`);
      const data = await response.json();
      setTarjetas(data); // Guardamos las tarjetas obtenidas
    } catch (error) {
      console.error("Error al obtener las tarjetas:", error);
      setError("No se pudieron cargar las tarjetas.");
    } finally {
      setLoading(false);
    }
  };

  // Llamar a la API cuando el componente se monta
  useEffect(() => {
    console.log("Número de documento recibido:", num_doc);
    fetchTarjetas();
  }, []);

  // Función de descarga
  const handleDownload = () => {
    alert("¡Funcion aún no disponible!");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Detalles generales de los pagos */}
        <View style={styles.card}>
          <Text style={styles.generalHeader}>
            <Icon name="file-pdf-o" color="#bf0404" size={20} /> Descargar Extracto de tarjetas
          </Text>
        </View>

        <View style={styles.card}>
          {/* Botón para abrir el modal de tarjeta */}
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.selectButton}>
            <Text style={styles.selectButtonText}>{tarjetaSeleccionada}</Text>
          </TouchableOpacity>

          {/* Modal de selección de tarjeta */}
          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Seleccione una tarjeta</Text>

                {loading ? (
                  <ActivityIndicator size="large" color="#bf0404" />
                ) : error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : (
                  tarjetas.map((tarjeta, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setTarjetaSeleccionada(`**** ${tarjeta.nro_tarjeta.slice(-4)} - ${tarjeta.nombre_usuario}`);
                        setModalVisible(false);
                      }}
                      style={styles.tarjetaItem}
                    >
                      <Text style={styles.tarjetaText}>
                        **** {tarjeta.nro_tarjeta.slice(-4)} - {tarjeta.nombre_usuario}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}

                {/* Botón para cerrar el modal */}
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* Botón para abrir el modal de meses */}
        <View style={styles.card}>
          <TouchableOpacity onPress={() => setModalAnyoVisible(true)} style={styles.selectButton}>
            <Text style={styles.selectButtonText}>{anyoSeleccionado}</Text>
          </TouchableOpacity>

          {/* Modal de selección de año */}
          <Modal visible={modalAnyoVisible} transparent animationType="slide">
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
                    style={styles.tarjetaItem}
                  >
                    <Text style={styles.tarjetaText}>{anyo}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity onPress={() => setModalAnyoVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.card}>
          <TouchableOpacity onPress={() => setModalMesVisible(true)} style={styles.selectButton}>
            <Text style={styles.selectButtonText}>{mesSeleccionado}</Text>
          </TouchableOpacity>

          {/* Modal de selección de mes */}
          <Modal visible={modalMesVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Seleccione un mes</Text>

                {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((mes, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setMesSeleccionado(mes);
                      setModalMesVisible(false);
                    }}
                    style={styles.tarjetaItem}
                  >
                    <Text style={styles.tarjetaText}>{mes}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity onPress={() => setModalMesVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
        {/* Botón para descargar el extracto */}
        <View style={styles.card}>
          <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
            <Text style={styles.downloadButtonText}>¡Proximamente!</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f8f8",
  },
  scrollView: {
    flex: 1,
  },
  card: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    shadowColor: "#000",
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
});

export default Extracto;
