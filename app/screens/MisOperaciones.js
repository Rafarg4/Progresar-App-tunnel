import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
export default function MisOperaciones() {
  const [operaciones, setOperaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const coloresTarjetas = ['#FF6F61', '#26A69A', '#5C6BC0', '#FFA726', '#8D6E63'];
    const sectores = {
    FRC: 'Francés',
    AME: 'Americano',
    FIS: 'Fisalco',
    DIR: 'Directo'
    };

  useEffect(() => {
    const obtenerOperaciones = async () => {
      try {
        const usuario = await AsyncStorage.getItem('usuarioGuardado');
        if (!usuario) {
          console.log('Usuario no encontrado');
          setLoading(false);
          return;
        }

        const response = await fetch(`https://api.progresarcorp.com.py/api/ver_operaciones/${usuario}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setOperaciones(data);
        } else if (data && data.nro_comprobante) {
          setOperaciones([data]);
        }

      } catch (error) {
        console.log('Error al obtener operaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerOperaciones();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/08/inicio.png' }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <Text style={styles.headerText}>Mis Operaciones</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {operaciones.map((op, index) => {
            const colorTarjeta = coloresTarjetas[index % coloresTarjetas.length];

            return (
              <TouchableOpacity
                key={index}
                style={[styles.cardContainer, { backgroundColor: colorTarjeta }]}
                onPress={() =>
                    navigation.navigate('DetalleOperaciones', {
                    cod_cliente: op.cod_cliente,
                    nro_comprobante: op.nro_comprobante
                    })
                }
                >
                <FontAwesome5
                    name="file-invoice-dollar"
                    size={120}
                    color="#fff"
                    style={styles.cardBackgroundIcon}
                />
                <View style={styles.cardIconContainer}>
                    <FontAwesome5 name="file-invoice-dollar" size={28} color="#fff" />
                </View>
                <Text style={styles.cardBrand}>Operación #{op.nro_comprobante}</Text>
                <Text style={styles.cardDetail}>Metodo: {sectores[op.cod_sector] || op.cod_sector}</Text>
                <Text style={styles.cardDetail}>Cantidad de cuota: {op.nro_cuota}</Text>
                <Text style={styles.cardDetail}>Fecha de operación: {op.fec_origen}</Text>
                <Text style={styles.cardDetail}>Total operación: {Number(op.monto_cuota).toLocaleString()} Gs</Text>
                <Text style={styles.cardDetail}>Saldo pendiente: {Number(op.saldo_cuota).toLocaleString()} Gs</Text>
                </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25
  },
  headerImage: {
    width: Dimensions.get('window').width,
    height: 180,
  },
  headerText: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  scrollContainer: {
    padding: 20
  },
  cardContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: 'relative'
  },
  cardIconContainer: {
    marginBottom: 12,
    zIndex: 2
  },
  cardBackgroundIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.08,
    zIndex: 0
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10
  },
  cardDetail: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4
  }
});
