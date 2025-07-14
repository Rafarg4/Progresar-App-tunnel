import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';

export default function ActualizarPerfil() {
  const [formData, setFormData] = useState({
    lugarTrabajo: '',
    telefono: '',
    direccionLaboral: '',
    direccionParticular: '',
    antiguedad: '',
  });

  const handleSubmit = () => {
    Alert.alert('¡Atención!', 'Esta opción estará disponible próximamente.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        style={styles.cardImage}
        source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/07/actualizar-datos.png' }}
        resizeMode="cover"
      />

      <Text style={styles.label}>Lugar de trabajo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su lugar de trabajo"
        value={formData.lugarTrabajo}
        editable={false}
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su teléfono"
        value={formData.telefono}
        keyboardType="phone-pad"
        editable={false}
      />

      <Text style={styles.label}>Dirección laboral</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su dirección laboral"
        value={formData.direccionLaboral}
        editable={false}
      />

      <Text style={styles.label}>Dirección particular</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su dirección particular"
        value={formData.direccionParticular}
        editable={false}
      />

      <Text style={styles.label}>Antigüedad</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su antigüedad (en años)"
        value={formData.antiguedad}
        keyboardType="numeric"
        editable={false}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>¡Próximamente!</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#f0f0f0', // para mostrar visualmente que está deshabilitado
  },
  button: {
    backgroundColor: '#bf0404',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cardImage: {
    width: '100%',
    height: 150,
    marginBottom: 20,
    borderRadius: 10,
  },
});
