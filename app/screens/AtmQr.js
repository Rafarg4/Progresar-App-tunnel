import React from 'react';
import { View, Text, TouchableOpacity,Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 
import { useNavigation } from '@react-navigation/native'; 

const AtmQr = ({ route }) => {
  //Para obtener numero de documento
  const { num_doc } = route.params;
  const navigation = useNavigation(); // Use navigation
  //Le pasamos el numero documento a la otra vista para poder filtrar las tarjetas
  const handleStart = () => {
    navigation.navigate('AdelantoQr', { num_doc });
  };

  return (
    <View style={styles.container}>
     <View style={styles.card}>
        <Image
          source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/06/adelantos.png' }}
          style={styles.image}
          resizeMode="cover" // Opcional: puedes usar "cover" para llenar sin distorsionar
        />
      </View>
      <View style={styles.stepsContainer}>
        <View style={styles.step}>
          <FontAwesome name="qrcode" size={39} color="#bf0404" />
          <Text style={styles.stepText}>
            <Text style={styles.stepBold}>Paso 1:</Text> Escanear QR generado por el cajero
          </Text>
        </View>
        <View style={styles.step}>
          <FontAwesome name="credit-card" size={30} color="#bf0404" />
          <Text style={styles.stepText}>
            <Text style={styles.stepBold}>Paso 2:</Text> Seleccionar la cuenta de la cual quiera realizar el adelanto
          </Text>
        </View>
        <View style={styles.step}>
          <FontAwesome name="money" size={30} color="#bf0404" />
          <Text style={styles.stepText}>
            <Text style={styles.stepBold}>Paso 3:</Text> Seleccionar el monto en el ATM
          </Text>
        </View>
        <View style={styles.step}>
          <FontAwesome name="check" size={30} color="#bf0404" />
          <Text style={styles.stepText}>
            <Text style={styles.stepBold}>Paso 4:</Text> Retirar el dinero
          </Text>
        </View>
        <View style={styles.step}>
          <FontAwesome name="exclamation-triangle" size={30} color="#bf0404" />
          <Text style={styles.stepText}>
            <Text style={styles.stepBold}>Nota:</Text> Este aparatado solo realiza la autenticación al ATM; no quedarán registrados los movimientos.
          </Text>
        </View>
        <View style={styles.separator} />
      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <FontAwesome name="qrcode" size={24} color="white" />
        <Text style={styles.buttonText}>Iniciar</Text>
      </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  alignItems: 'center',
  padding: 18,
  backgroundColor: '#f8f8f8',
},
separator: {
  height: 1,
  backgroundColor: '#ccc',
  marginVertical: 10, // Espacio arriba y abajo
  width: '100%',
},
  card: {
    width: '100%',
    backgroundColor: '#fff', // Fondo blanco para la tarjeta
    borderRadius: 10,
    padding: 0,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginTop: 0,            // Evitar espacio superior
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  numDoc: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignSelf: 'center', 
    alignItems: 'center',
    backgroundColor: '#bf0404', // Color rojo
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  stepsContainer: {
    width: '100%',
    backgroundColor: '#fff', // Fondo blanco para el contenedor de pasos
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepText: {
    marginLeft: 10,
    fontSize: 14, 
  },
  stepBold: {
    fontWeight: 'bold',
    fontSize: 12, 
  },
  image: {
  width: '100%',
  height: 150,             // Ajustá a la altura deseada
  borderRadius: 0,         // Eliminar bordes individuales
},
});
export default AtmQr;
