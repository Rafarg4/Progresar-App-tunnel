import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, ImageBackground, Modal, Alert 
} from 'react-native';

export default function SolicitarAcceso() {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    numeroCI: '',
    correo: '',
    celular: '',
    motivo: '',
  });

  const [modalMotivoVisible, setModalMotivoVisible] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const enviarSolicitud = async () => {
    try {
      const response = await fetch('https://api.progresarcorp.com.py/api/crear_solicitud_acceso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('¡Solicitud exitosa!','Su solicitud fue enviada correctamente.',[{ text: 'OK' }]);
        setFormData({ nombreCompleto: '', numeroCI: '', correo: '', celular: '', motivo: '' });
      } else {
        alert(`Error: ${data.message || 'Error al enviar solicitud'}`);
      }
    } catch (error) {
      alert(`Error de conexión: ${error.message}`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Cabecera con imagen */}
      <ImageBackground
        source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/08/inicio.png' }}
        style={styles.header}
        resizeMode="cover"
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <Text style={styles.headerTitle}>Solicitar acceso</Text>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.container}>
        {/* CARD del formulario */}
        <View style={styles.formCard}>
          <Text style={styles.formCardTitle}>Completa tus datos</Text>
          <View style={styles.formDivider} />

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
        </View>
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
  // Header
  header: { height: 160, justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 12 },
  headerImage: { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#fff', fontSize: 22, fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3
  },

  // Contenido
  container: { padding: 0 },

  // Card del formulario
  formCard: {
    width: '92%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    // sombra iOS
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    // sombra Android
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  formCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#bf0404',
    paddingLeft: 8,
  },
  formDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginBottom: 12 },

  // Inputs y botones
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
    backgroundColor: '#fff'
  },
  button: {
    backgroundColor: '#bf0404',
    padding: 15,
    borderRadius: 8,
    marginTop: 6,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center'
  },  
  modalContainer: {
    backgroundColor: 'white', borderRadius: 10, padding: 20, width: '80%'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  optionButton: {
    padding: 12, borderWidth: 1, borderColor: '#999', borderRadius: 6, marginBottom: 10, backgroundColor: '#fff'
  },
});
