import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ImageBackground, Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

export default function SolicitarAcceso() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    numeroCI: '',
    correo: '',
    celular: '',
    motivo: '',
  });

  const [modalMotivoVisible, setModalMotivoVisible] = useState(false);
  const [resultModal, setResultModal] = useState({ visible: false, success: true, title: '', message: '' });
  const mostrarResultado = (success, title, message) =>
    setResultModal({ visible: true, success, title, message });
  const cerrarResultado = () => setResultModal((r) => ({ ...r, visible: false }));

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
        mostrarResultado(true, '¡Solicitud exitosa!', 'Su solicitud fue enviada correctamente.');
        setFormData({ nombreCompleto: '', numeroCI: '', correo: '', celular: '', motivo: '' });
      } else {
        mostrarResultado(false, 'Error', data.message || 'Error al enviar solicitud');
      }
    } catch (error) {
      mostrarResultado(false, 'Error de conexión', error.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔹 Cabecera con imagen y descripción */}
        <ImageBackground
          source={require('../assets/inicio_nuevo.png')}
          style={styles.header}
          imageStyle={styles.headerImage}
        >
          <View style={styles.headerOverlay} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color="#9e2021" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Solicitar acceso</Text>
            <Text style={styles.headerSubText}>
              Complete el siguiente formulario para solicitar acceso o restablecer su cuenta.
            </Text>
          </View>
        </ImageBackground>

        {/* CARD del formulario */}
        <View style={styles.formCard}>
          <Text style={styles.formCardTitle}>Completa tus datos</Text>
          <View style={styles.formDivider} />

          <Text style={styles.label}>Nombre completo</Text>
          <View style={styles.inputField}>
            <Icon name="user" size={16} color="#9e2021" style={styles.inputIcon} />
            <TextInput
              style={styles.inputInner}
              value={formData.nombreCompleto}
              onChangeText={text => handleChange('nombreCompleto', text)}
              placeholder="Nombre completo"
              placeholderTextColor="#8a7476"
            />
          </View>

          <Text style={styles.label}>Número de documento</Text>
          <View style={styles.inputField}>
            <Icon name="id-card" size={16} color="#9e2021" style={styles.inputIcon} />
            <TextInput
              style={styles.inputInner}
              value={formData.numeroCI}
              onChangeText={text => handleChange('numeroCI', text)}
              placeholder="Número de documento"
              placeholderTextColor="#8a7476"
              keyboardType="number-pad"
            />
          </View>

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputField}>
            <Icon name="envelope" size={15} color="#9e2021" style={styles.inputIcon} />
            <TextInput
              style={styles.inputInner}
              value={formData.correo}
              onChangeText={text => handleChange('correo', text)}
              placeholder="Correo electrónico"
              placeholderTextColor="#8a7476"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>Número de celular</Text>
          <View style={styles.inputField}>
            <Icon name="phone" size={16} color="#9e2021" style={styles.inputIcon} />
            <TextInput
              style={styles.inputInner}
              value={formData.celular}
              onChangeText={text => handleChange('celular', text)}
              placeholder="Número de celular"
              placeholderTextColor="#8a7476"
              keyboardType="phone-pad"
            />
          </View>

          <Text style={[styles.label, { marginTop: 6 }]}>Motivo de la solicitud</Text>
          <TouchableOpacity
            style={styles.inputField}
            onPress={() => setModalMotivoVisible(true)}
          >
            <Icon name="question-circle" size={16} color="#9e2021" style={styles.inputIcon} />
            <Text
              style={[styles.inputInner, { color: formData.motivo ? '#241a1a' : '#8a7476' }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {formData.motivo === 'extracto'
                ? 'Solicito acceso para ver el extracto de mi tarjeta'
                : formData.motivo === 'restablecer'
                  ? 'Solicito restablecer mi contraseña de acceso'
                  : 'Seleccionar motivo'}
            </Text>
            <Icon name="angle-down" size={16} color="#8a7476" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={enviarSolicitud}>
            <Icon name="paper-plane" size={15} color="#fff" style={{ marginRight: 8 }} />
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
              <Text style={styles.optionButtonText}>Solicito acceso para ver el extracto de mi tarjeta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                handleChange('motivo', 'restablecer');
                setModalMotivoVisible(false);
              }}
            >
              <Text style={styles.optionButtonText}>Solicito restablecer mi contraseña de acceso</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalMotivoVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de resultado (éxito / error) */}
      <Modal
        visible={resultModal.visible}
        transparent
        animationType="fade"
        onRequestClose={cerrarResultado}
      >
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <View
              style={[
                styles.resultIconCircle,
                resultModal.success ? styles.resultIconSuccess : styles.resultIconError,
              ]}
            >
              <Icon
                name={resultModal.success ? 'check' : 'exclamation'}
                size={20}
                color="#fff"
              />
            </View>
            <Text style={styles.resultTitle}>{resultModal.title}</Text>
            <Text style={styles.resultMessage}>{resultModal.message}</Text>
            <TouchableOpacity style={styles.resultButton} onPress={cerrarResultado} activeOpacity={0.85}>
              <Text style={styles.resultButtonText}>Aceptar</Text>
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
    paddingTop: 60,
    paddingHorizontal: 0,
    paddingBottom: 32,
  },
  headerImage: {},
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(36,16,18,0.28)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTextContainer: {
    marginTop: 22,
    paddingHorizontal: 20,
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
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 24,
    marginTop: -14,
  },
  formCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#241a1a',
    marginBottom: 6,
  },
  formDivider: { height: 1, backgroundColor: '#f0e4e3', marginBottom: 14 },

  label: {
    fontSize: 12,
    color: '#6b5c5d',
    fontWeight: '600',
    marginBottom: 6,
  },

  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f2f1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputInner: {
    flex: 1,
    color: '#241a1a',
    fontSize: 14,
  },

  // 🔹 Botón igual al de "Ingresar"
  button: {
    flexDirection: 'row',
    backgroundColor: '#9e2021',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    marginTop: 4,
    elevation: 3,
    shadowColor: '#9e2021',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // 🔹 Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(36,16,18,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
    color: '#241a1a',
  },
  optionButton: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: 'rgba(158, 32, 33, 0.08)',
  },
  optionButtonText: {
    color: '#241a1a',
    fontSize: 13,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  cancelButtonText: {
    color: '#9e2021',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // 🔹 Modal de resultado (éxito / error)
  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(36,16,18,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  resultCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  resultIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultIconSuccess: {
    backgroundColor: '#3f8f5f',
  },
  resultIconError: {
    backgroundColor: '#9e2021',
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#241a1a',
    marginBottom: 6,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 13.5,
    color: '#6b5c5d',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  resultButton: {
    backgroundColor: '#9e2021',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  resultButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
