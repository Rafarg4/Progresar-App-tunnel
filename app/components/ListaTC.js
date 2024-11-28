import React, {Component} from 'react'
import {View, Text} from 'react-native'

const ListaTC = ({ item }) =>{

    const {
        cod_tarjeta,
        nro_tarjeta,
        clase_tarjeta,
        linea_normal,
        linea_especial,
        deuda_total,
        pago_minimo,
        saldo_mora,
        dias_mora,
        fecha,
        emision,
        deuda_normal,
        deuda_especial,
        inab,
        activo,
        adm_usu,
    } = item

    return(
        <View>
            <Text>Numero de TC: {nro_tarjeta}</Text>
        </View>
    )
}

export default ListaTC