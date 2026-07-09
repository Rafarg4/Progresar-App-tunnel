import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BottomNav({ usuario }) {
  const navigation = useNavigation();
  const [showOptions, setShowOptions] = useState(false);

  return (
    <>
      {showOptions && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptions(false);
              navigation.navigate('Beneficios');
            }}
          >
            <Ionicons name="gift-outline" size={20} color="#fff" />
            <Text style={styles.optionText}>Beneficios</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptions(false);
              navigation.navigate('Electrodomesticos');
            }}
          >
            <Ionicons name="pricetag-outline" size={20} color="#fff" />
            <Text style={styles.optionText}>Electrodomésticos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptions(false);
              navigation.navigate('Tarjetas');
            }}
          >
            <Ionicons name="card-outline" size={20} color="#fff" />
            <Text style={styles.optionText}>Tarjeta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptions(false);
              navigation.navigate('Financiero');
            }}
          >
            <Ionicons name="wallet" size={20} color="#fff" />
            <Text style={styles.optionText}>Financiero</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptions(false);
              navigation.navigate('AtmQr');
            }}
          >
            <FontAwesome5 name="university" size={18} color="#fff" />
            <Text style={styles.optionText}>Adelanto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              setShowOptions(false);
              navigation.navigate('Promociones');
            }}
          >
            <Ionicons name="megaphone-outline" size={20} color="#fff" />
            <Text style={styles.optionText}>Promociones</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavStyled}>
          <TouchableOpacity onPress={() => navigation.navigate('InicioApp')}>
            <FontAwesome5 name="home" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('PagoQr', { num_doc: String(usuario) })}
          >
            <Ionicons name="qr-code" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => setShowOptions(!showOptions)}
          >
            <Ionicons name={showOptions ? 'close' : 'add'} size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Notificaciones')}>
            <FontAwesome5 name="exchange-alt" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('PerfilUsuario')}>
            <FontAwesome5 name="user" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionText: {
    color: '#fff',
    marginLeft: 8,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bottomNavStyled: {
    flexDirection: 'row',
    backgroundColor: '#2c2c2c',
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  centerButton: {
    backgroundColor: '#9e2021',
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    elevation: 10,
    shadowColor: '#9e2021',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
});
