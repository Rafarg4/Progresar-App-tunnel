import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const RecuperarContrasena = () => {
  const navigation = useNavigation();
  const [documento, setDocumento] = useState("");
  const [resultModal, setResultModal] = useState({ visible: false, success: true, title: "", message: "" });
  const mostrarResultado = (success, title, message) =>
    setResultModal({ visible: true, success, title, message });
  const cerrarResultado = () => setResultModal((r) => ({ ...r, visible: false }));

  const handleSolicitarRestablecer = async () => {
    if (!documento) {
      mostrarResultado(false, "Error", "Por favor ingrese un número de documento.");
      return;
    }

    try {
      const response = await fetch("https://api.progresarcorp.com.py/api/verificar_usuario_app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num_doc: documento }),
      });

      const data = await response.json();
      console.log("📄 Respuesta de la API:", data);

      if (response.ok && data.exists) {
        mostrarResultado(true, "Éxito", data.message || "Contraseña restablecida.");
      } else {
        mostrarResultado(false, "Error", data.message || "El documento ingresado no existe.");
      }
    } catch (error) {
      console.error("💥 Error:", error);
      mostrarResultado(false, "Error", "Hubo un problema al consultar el servidor.");
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/inicio_nuevo.png")}
        style={styles.headerBackground}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={16} color="#9e2021" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Recuperar contraseña</Text>
          <Text style={styles.headerSubtitle}>
            Ingresá tu número de documento para solicitar el restablecimiento
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <FontAwesome5 name="key" size={13} color="#9e2021" />
              </View>
              <Text style={styles.sectionTitle}>Restablecer contraseña</Text>
            </View>

            <Text style={styles.label}>Número de documento</Text>
            <View style={styles.inputField}>
              <FontAwesome5 name="id-card" size={16} color="#9e2021" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.inputInner}
                placeholder="Ingresá tu documento"
                placeholderTextColor="#8a7476"
                value={documento}
                onChangeText={setDocumento}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSolicitarRestablecer}
              activeOpacity={0.85}
            >
              <FontAwesome5 name="paper-plane" size={14} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitButtonText}>Solicitar restablecimiento</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

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
                name={resultModal.success ? "check" : "exclamation"}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // 🔹 Encabezado
  headerBackground: {
    paddingTop: 60,
    paddingHorizontal: 0,
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
    marginLeft: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    marginTop: 22,
    paddingHorizontal: 20,
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
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // 🔹 Hoja de contenido
  sheet: {
    flex: 1,
    backgroundColor: "#faf6f5",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 20,
  },
  scrollContainer: { padding: 16 },

  // 🔹 Card de sección
  sectionCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#efe1e0",
    borderRadius: 18,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(158,32,33,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#241a1a",
  },

  label: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#6b5c5d",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 6,
  },

  // 🔹 Input
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f2f1",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 18,
  },
  inputInner: {
    flex: 1,
    fontSize: 14,
    color: "#241a1a",
  },

  // 🔹 Botón principal
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#9e2021",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#9e2021",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14.5,
  },

  // 🔹 Modal de resultado (éxito / error)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(36,16,18,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  modalIconSuccess: {
    backgroundColor: "#3f8f5f",
  },
  modalIconError: {
    backgroundColor: "#9e2021",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#241a1a",
    marginBottom: 6,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 13.5,
    color: "#6b5c5d",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#9e2021",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
export default RecuperarContrasena;
