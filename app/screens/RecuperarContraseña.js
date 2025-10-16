import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert, // 👈 importar esto
} from "react-native";

const RecuperarContrasena = () => {
  const [documento, setDocumento] = useState("");

  const handleSolicitarRestablecer = async () => {
    if (!documento) {
      Alert.alert("Error", "Por favor ingrese un número de documento.");
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
    // 👇 Aquí mostramos el mensaje que viene del backend
    Alert.alert("Éxito", data.message || "Contraseña restablecida.");
  } else {
    Alert.alert("Error", data.message || "El documento ingresado no existe.");
  }
} catch (error) {
  console.error("💥 Error:", error);
  Alert.alert("Error", "Hubo un problema al consultar el servidor.");
}
  };

  return (
    <View style={styles.container}>
      {/* Cabecera */}
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/inicio.png")}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <Text style={styles.headerText}>Recuperar contraseña</Text>
      </View>

      {/* Contenido */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Número de documento</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su documento"
            value={documento}
            onChangeText={setDocumento}
            keyboardType="numeric"
          />

          {/* Aquí va el onPress */}
          <TouchableOpacity style={styles.button} onPress={handleSolicitarRestablecer}>
            <Text style={styles.buttonText}>Solicitar restablecimiento</Text>
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
    backgroundColor: "#fff",
  },
  headerContainer: {
    position: "relative",
    overflow: "hidden",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 20,
  },
  headerImage: {
    width: Dimensions.get("window").width,
    height: 160,
  },
  headerText: {
    position: "absolute",
    bottom: 20,
    left: 20,
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#9e2021",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default RecuperarContrasena;
