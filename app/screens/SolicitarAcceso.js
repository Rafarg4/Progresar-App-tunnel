import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Image, Modal 
} from 'react-native';
import { Alert } from 'react-native';
export default function SolicitarAcceso() {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    numeroCI: '',
    correo: '',
    celular: '',
    motivo: '',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMotivoVisible, setModalMotivoVisible] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setModalVisible(true);
  };

  const enviarSolicitud = async () => {
  try {
    // Aquí se envían los datos al servidor
    const response = await fetch('https://api.progresarcorp.com.py/api/crear_solicitud_acceso', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Si usás auth tipo Bearer:
        // 'Authorization': `Bearer TU_TOKEN`
      },
      body: JSON.stringify({
        nombreCompleto: formData.nombreCompleto,
        numeroCI: formData.numeroCI,
        correo: formData.correo,
        celular: formData.celular,
        motivo: formData.motivo,
      }),
    });

    const data = await response.json();

    if (response.ok) {
     Alert.alert(
        '¡Solicitud exitosa!',
        'Su solicitud fue enviada correctamente.',
        [{ text: 'OK' }]
      );
      // Limpia el formulario si querés
      setFormData({
        nombreCompleto: '',
        numeroCI: '',
        correo: '',
        celular: '',
        motivo: '',
      });
   } else {
      console.log("Respuesta con error:", data);
      alert(`Error: ${data.message || 'Error al enviar solicitud'}`);
    }
  } catch (error) {
    console.log("Error de red o fetch:", error);
    alert(`Error de conexión: ${error.message}`);
  } finally {
    setModalVisible(false);
  }
};

  return (
   <View style={{ flex: 1 }}>
  <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.card}>
      <Image
        style={styles.headerImage}
        source={{
          uri: "https://progresarcorp.com.py/wp-content/uploads/2025/06/solicitar-acceso.png",
        }}
        resizeMode="cover"
      />
    </View>

    <Text>Nombre completo:</Text>
    <TextInput
      style={styles.input}
      value={formData.nombreCompleto}
      onChangeText={text => handleChange('nombreCompleto', text)}
      placeholder="Nombre completo"
    />

    <Text>Número de documento:</Text>
    <TextInput
      style={styles.input}
      value={formData.numeroCI}
      onChangeText={text => handleChange('numeroCI', text)}
      placeholder="Número de documento"
      keyboardType="number-pad"
    />

    <Text>Correo electrónico:</Text>
    <TextInput
      style={styles.input}
      value={formData.correo}
      onChangeText={text => handleChange('correo', text)}
      placeholder="Correo electrónico"
      keyboardType="email-address"
    />

    <Text>Número de celular:</Text>
    <TextInput
      style={styles.input}
      value={formData.celular}
      onChangeText={text => handleChange('celular', text)}
      placeholder="Número de celular"
      keyboardType="phone-pad"
    />

    <Text style={{ marginBottom: 10, marginTop: 15 }}>Motivo de la solicitud:</Text>

    <TouchableOpacity
      style={styles.input}
      onPress={() => setModalMotivoVisible(true)}
    >
      <Text style={{ color: formData.motivo ? '#000' : '#999' }}>
        {formData.motivo === 'extracto'
          ? 'Solicito acceso para ver el extracto de mi tarjeta'
          : formData.motivo === 'restablecer'
            ? 'Solicito restablecer mi contraseña de acceso'
            : 'Seleccionar motivo'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.button} onPress={enviarSolicitud}>
      <Text style={styles.buttonText}>Enviar solicitud</Text>
    </TouchableOpacity>
  </ScrollView>

  {/* Modal de selección de motivo */}
  <Modal
    visible={modalMotivoVisible}
    transparent
    animationType="slide"
    onRequestClose={() => setModalMotivoVisible(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Seleccione el motivo</Text>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            handleChange('motivo', 'extracto');
            setModalMotivoVisible(false);
          }}
        >
          <Text>Solicito acceso para ver el extracto de mi tarjeta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            handleChange('motivo', 'restablecer');
            setModalMotivoVisible(false);
          }}
        >
          <Text>Solicito restablecer mi contraseña de acceso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: '#999', alignItems: 'center' }]}
          onPress={() => setModalMotivoVisible(false)}
        >
          <Text style={{ color: '#fff' }}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
</View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
  },
  headerImage: {
    width: '100%',
    height: 150,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#bf0404',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#bf0404',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
});
