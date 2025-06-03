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
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";

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

  const fetchTarjetas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://api.progresarcorp.com.py/api/ver_tarjetas_bepsa/${num_doc}`
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
    if (num_doc) {
      fetchTarjetas();
    }
  }, [num_doc]);

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

  const handleDownload = () => {
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
  const mes = obtenerNumeroMes(mesSeleccionado);
  const anho = anyoSeleccionado;

  const params = new URLSearchParams({
    nro_tarjeta: nroTarjeta,
    mes,
    anho,
    tipo_tc,
  });

  const url = `https://api.progresarcorp.com.py/descargar_extracto_app?${params.toString()}`;

  console.log("URL generada:", url); // <-- útil para debug

  Linking.openURL(url).catch(err => {
    console.error("Error al abrir la URL:", err);
    Alert.alert("Error", "No se pudo abrir el enlace para descargar el extracto.");
  });
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
      num_doc,
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
      <ScrollView style={styles.scrollView}>
        {/* Imagen de encabezado */}
        <View style={styles.card}>
          <Image
            style={styles.headerImage}
            source={{
              uri:
                "https://progresarcorp.com.py/wp-content/uploads/2025/05/extracto.png",
            }}
            resizeMode="cover"
          />
        </View>

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
              <Text style={styles.buttonText}>Descargar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRequestByEmail} style={styles.actionButton}>
              <Text style={styles.buttonText}>Solicitar por correo</Text>
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
    padding: 10,
    backgroundColor: "#f8f8f8",
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
  borderColor: '#bf0404',
  padding: 12,
  borderRadius: 10,
  marginBottom: 10,
},
selectButtonText: {
  color: '#bf0404',
  fontWeight: 'bold',
  textAlign: 'center',
},
closeButton: { 
  backgroundColor: '#bf0404',
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
  backgroundColor: '#bf0404',
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
