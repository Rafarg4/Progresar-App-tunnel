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
      {/* 🔹 Cabecera con imagen y descripción */}
      <ImageBackground
        source={require('../assets/inicio.png')}
        style={styles.header}
        resizeMode="cover"
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Solicitar acceso</Text>
          <Text style={styles.headerSubText}>
            Complete el siguiente formulario para solicitar acceso o restablecer su cuenta.
          </Text>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.container}>
        {/* CARD del formulario */}
        <View style={styles.formCard}>
          <Text style={styles.formCardTitle}>Completa tus datos</Text>
          <View style={styles.formDivider} />

          <Text style={styles.label}>Nombre completo:</Text>
          <TextInput
            style={styles.input}
            value={formData.nombreCompleto}
            onChangeText={text => handleChange('nombreCompleto', text)}
            placeholder="Nombre completo"
          />

          <Text style={styles.label}>Número de documento:</Text>
          <TextInput
            style={styles.input}
            value={formData.numeroCI}
            onChangeText={text => handleChange('numeroCI', text)}
            placeholder="Número de documento"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Correo electrónico:</Text>
          <TextInput
            style={styles.input}
            value={formData.correo}
            onChangeText={text => handleChange('correo', text)}
            placeholder="Correo electrónico"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Número de celular:</Text>
          <TextInput
            style={styles.input}
            value={formData.celular}
            onChangeText={text => handleChange('celular', text)}
            placeholder="Número de celular"
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { marginTop: 10 }]}>Motivo de la solicitud:</Text>
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
  // 🔹 Header
  header: {
    height: 150,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerImage: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  headerSubText: {
    color: '#f2f2f2',
    fontSize: 13,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // 🔹 Contenido general
  container: {
    padding: 0,
  },

  // 🔹 Card del formulario
  formCard: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  formCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#bf0404',
    paddingLeft: 8,
  },
  formDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginBottom: 10 },

  label: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  // 🔹 Botón igual al de "Ingresar"
  button: {
    backgroundColor: '#9e2021',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 220,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // 🔹 Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});
