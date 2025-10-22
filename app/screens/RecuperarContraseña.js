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
      
      <View style={styles.headerOverlay}>
        <Text style={styles.headerText}>Recuperar contraseña</Text>
        <Text style={styles.headerSubText}>
          Ingrese su número de documento para solicitar el restablecimiento.
        </Text>
      </View>
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // 🔹 Cabecera con imagen de fondo
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

  // 🔹 Contenedor para los textos sobre la imagen
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
    marginBottom: 4, // espacio con la descripción
  },

  headerSubText: {
    color: "#f2f2f2",
    fontSize: 13,
    lineHeight: 18,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // 🔹 Contenido principal
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 15,
  },

  // 🔹 Botón principal (igual al de Ingresar)
  button: {
    backgroundColor: "#9e2021",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: 220,
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
});
export default RecuperarContrasena;
