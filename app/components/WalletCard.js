import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Mismo mapeo que usa la pantalla "Mis Tarjetas"
export const nombresTarjeta = {
  JM: 'CLÁSICA', '1': 'DINELCO', TR: 'LA TRINIDAD', M2: 'PROGAR', J5: 'EDT',
  J0: 'EMPRESARIAL', JW: 'MUJER', FR: 'AFUNI', J7: 'FEP', RC: 'ROTARY',
  RM: 'ROTARY', V6: 'VISA', TS: 'COMEDI', LE: 'LINALU', EV: 'EL VIAJERO', EI: 'VISA EMPRESARIAL'
};

export const formatGs = (val) => {
  const n = Number(val) || 0;
  return `Gs. ${Math.round(n).toLocaleString('es-PY')}`;
};

export const enmascararNumero = (numero) => {
  const str = String(numero || '');
  if (str.length < 4) return str;
  return '•••• ' + str.slice(-4);
};

export const WalletCard = ({ tarjeta, active, onPress, onEnter, disponibleOverride }) => {
  const [oculto, setOculto] = useState(false);
  const disponible = disponibleOverride != null
    ? Number(disponibleOverride)
    : Number(tarjeta.limite_credito || 0) - Number(tarjeta.deuda_total || 0);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, active && styles.cardActive]}
    >
      <View style={styles.topRow}>
        <Text style={styles.brand}>{nombresTarjeta[tarjeta.clase_tarjeta] || 'Tarjeta'}</Text>
        <FontAwesome5 name="credit-card" size={16} color="#9e2021" />
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Disponible</Text>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            setOculto((v) => !v);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FontAwesome5 name={oculto ? 'eye-slash' : 'eye'} size={13} color="#6b5c5d" />
        </TouchableOpacity>
      </View>
      <Text style={styles.amount}>{oculto ? '••••••••' : formatGs(disponible)}</Text>
      <View style={styles.bottomRow}>
        <View style={{ flex: 1, marginRight: onEnter ? 10 : 0 }}>
          <Text style={styles.number}>{enmascararNumero(tarjeta.nro_tarjeta)}</Text>
          <Text style={styles.holder} numberOfLines={1}>{tarjeta.nombre_usuario}</Text>
        </View>
        {onEnter && (
          <TouchableOpacity
            style={styles.enterButton}
            onPress={(e) => {
              e.stopPropagation();
              onEnter();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FontAwesome5 name="arrow-right" size={13} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#efe1e0',
    padding: 16,
  },
  cardActive: {
    borderColor: '#9e2021',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b5c5d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: '#6b5c5d',
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#241a1a',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  number: {
    fontSize: 13,
    color: '#6b5c5d',
    letterSpacing: 1,
  },
  holder: {
    fontSize: 12,
    color: '#6b5c5d',
    marginTop: 2,
  },
  enterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9e2021',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
