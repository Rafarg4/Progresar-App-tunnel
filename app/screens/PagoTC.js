import React, { Component, useState } from 'react';
import { 
    Text, 
    SafeAreaView, 
    View, 
    Alert, 
    Modal, 
    StyleSheet, 
    Dimensions, 
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { TextInput } from 'react-native-element-textinput';
import * as global from '../global.js'
import { currencyFormat } from './ScreenHome.js';
import userCards from '../recursos/Vpos.js';


const width = Dimensions.get("window").width;
const CONTENEDOR = width;
var md5 = require('md5');

export default class PagoTC extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    componentDidMount(){
        userCards();

        Alert.alert('¡Atención!', 'Los pagos realizados de lunes a viernes hasta las 16:00 PM serán procesados en un plazo de 24 horas. Si se realizan después de este horario, se procesarán en un plazo de 48 horas hábiles. \n\nLos pagos realizados los sábados hasta las 11:00 AM serán procesados en un plazo de 24 horas. Si se realizan después de este horario, los pagos se aplicarán al siguiente día hábil. \n\nLos pagos realizados los domingos se aplicarán al siguiente día hábil.');
    }

    confirmarCompra(routeName, value, tipo, data) {
        this.props.navigation.navigate(routeName, {
            status : value,
            tipo: tipo,
            info: data
        }) 
    }

    gotoScreen(routeName) {
        this.props.navigation.navigate(routeName)
    }

    render() {

        const { loading }  = this.state;

        const grabarDatosTC = (item, monto, alias_token) =>{

            console.log(item);
            console.log(monto);
            console.log(alias_token);

            let alToken = alias_token;
            let ammount = monto;

            if(item == null || monto == null || alias_token == null){
                return Alert.alert('¡Atención!', 'Debe completar todos los campos para poder realizar el pago');
            }

            this.setState({loading: true});

            let valores = item.split('-');

            let nro_tarjeta = valores[0];
            let cod_tarjeta = valores[1];
        
            var data = {
                valid: global.valid_api_key,
                sector: "Tarjetas",
                num_doc: global.num_doc,
                cliente: global.nombre,
                cod_cliente: global.codigo_cliente,
                cod_carrito: global.cod_carrito_pagos,
                monto: monto,
                numtc: ""+nro_tarjeta+"",
                cod_tar: ""+cod_tarjeta+"",
                desc: "PAGO DE TARJETAS NRO: "+nro_tarjeta,
            };
        
            global.des_pago=data.desc;
        
            fetch('https://api.progresarcorp.com.py/api/pagosCuotas',{
                method: 'POST',
                body: JSON.stringify(data), 
                headers:{
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(response =>{
                if(response.status=='success'){
                    global.cod_carrito_pagos= response.cod_carrito;
                    pagarConToken(response.cod_carrito, alToken, "Tarjetas", ammount);
                }else{
                    Alert.alert('Error', 'Se produjo un error inesperado, vuelva a intentarlo en unos minutos');
                }
            })
            .catch((error) => {
                console.log(error);
            })
        }
        
        const pagarConToken = (cod_carrito, alias_token, sector, monto) =>{
            this.setState({loading: true});
            var vposDesc = '';
        
            if(sector == 'Tarjetas'){
                vposDesc = "Pago de "+sector+" de Progresar Corporation S.A.";
            }
        
            if(sector == 'Electrodomésticos' || sector == 'Préstamos'){
                vposDesc = "Pago de cuota de "+sector+" de Progresar Corporation S.A.";
            }
        
            var data={
                public_key: global.public_key_vpos,
                operation: {
                    token: md5(global.private_key_vpos+cod_carrito+"charge"+monto+'.00PYG'+alias_token),
                    shop_process_id: cod_carrito,
                    amount: monto+'.00',
                    number_of_payments: 1,
                    currency: "PYG",
                    additional_data: "",
                    description: vposDesc,
                    alias_token: alias_token
                },
            }
        
            fetch(global.url_environment_vpos+'/vpos/api/0.3/charge',{
                method: 'POST',
                body: JSON.stringify(data), 
                headers:{
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if(data.status == 'success'){
                    this.setState({
                        loading: false
                    })
                    global.cod_carrito_pagos=data.confirmation.shop_process_id;
                    global.total_carrito=data.confirmation.amount;
                    this.confirmarCompra('Confirmar Compra', data.status, 'pagos cuotas', data );
                }else{
                    this.setState({
                        loading: false
                    })
                    global.cod_carrito_pagos=0;
                    this.confirmarCompra('Confirmar Compra', data.status, 'pagos cuotas', data );
                    //Alert.alert('Error', 'Su pago no se pudo concretar \nRespusta del servidor: \n'+data.messages[0].dsc)
                }
            })
            .catch((error)=>{
                this.setState({loading: false});
                console.log(error)
            })
            
        }
        
        const TextInputComponent = () => {
            const [monto, setMonto] = useState(null);

            const [open, setOpen] = useState(false);
            const [valor, setValue] = useState(null);
            const [items, setItems] = useState(global.cards);

            global.tcValor = valor;

            let cardsUser = global.user_tc;

            let tarjetas = [];

            cardsUser.forEach(item => {
                if( item.deuda_total > 0 && item.deuda_total > 0 ){
                    tarjetas.push({'value': item.nro_tarjeta+'-'+item.cod_tarjeta, 'label': item.nro_tarjeta_1+' **** '+item.nro_tarjeta_4+' - '+item.clase_tarjeta+' - Minimo: '+currencyFormat(item.pago_min)+' - Total: '+currencyFormat(item.deuda_total)})
                }else{
                    tarjetas.push({'value': item.nro_tarjeta+'-'+item.cod_tarjeta, 'label': item.nro_tarjeta_1+' **** '+item.nro_tarjeta_4+' - '+item.clase_tarjeta+' - Minimo: '+currencyFormat(item.pago_min)+' - Total: '+currencyFormat(item.deuda_total), disabled: true, labelStyle: {
                        color: "rgba(156,156,156,0.5)"}})
                }
            });

            const [openTC, setOpenTC] = useState(false);
            const [valorTC, setValueTC] = useState(null);
            const [itemsTC, setItemsTC] = useState(tarjetas);

            if(global.cards === '' || global.cards === null){
                Alert.alert('Atención', 'No posee tarjetas de débito catastrada.',
                    [
                        { text: "Volver", onPress: () => this.props.navigation.pop(), style: "cancel"},
                        { text: "Catastrar una tarjeta", onPress: () => this.gotoScreen('Medios de Pago')}
                    ]
                )
            }

            return (
                <View style={styles.container}>
                    <TextInput
                        value={monto}
                        style={styles.input}
                        inputStyle={styles.inputStyle}
                        labelStyle={styles.labelStyle}
                        placeholderStyle={styles.placeholderStyle}
                        textErrorStyle={styles.textErrorStyle}
                        label="Monto a Pagar"
                        keyboardType="numeric"
                        numeric
                        selectionColor='rgba(156, 156, 156, 0.5)'
                        onChangeText={text => {
                            setMonto(text);
                        }}
                    />
        
                    <Text style={{marginBottom: 5, color:'black', marginTop: 20}}>Seleccione un medio de pago</Text>
                    <DropDownPicker
                        open={open}
                        value={valor}
                        items={items}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems}
                        language="ES"
                        zIndex={2000}
                        zIndexInverse={1000}
                        textStyle={{
                            fontSize: 12
                        }}
                        disabledStyle={{
                            opacity: 0.5,
                            color: 'rgba(156,156,156,0.5)'
                        }}
                        style={{
                            borderColor: "#bf0404"
                        }}
                        translation={{
                            PLACEHOLDER: "Medios de pago (Solo Tarjeta de Débito)"
                        }}
                        dropDownContainerStyle={{
                            borderColor: "#bf0404"
                        }}
                    />
        
                    
                    <Text style={{marginBottom: 5, color:'black', marginTop: 20}}>Seleccione la tarjeta que desea pagar</Text>
                    {/* las tarjetas del usuario */}
                    <DropDownPicker
                        open={openTC}
                        value={valorTC}
                        items={itemsTC}
                        setOpen={setOpenTC}
                        setValue={setValueTC}
                        setItems={setItemsTC}
                        language="ES"
                        zIndex={1000}
                        zIndexInverse={2000}
                        textStyle={{
                            fontSize: 12
                        }}
                        disabledStyle={{
                            opacity: 0.5,
                            color: 'rgba(156,156,156,0.5)'
                        }}
                        style={{
                            borderColor: "#bf0404",
                            zIndex: 9
                        }}
                        translation={{
                            PLACEHOLDER: "Selecionar tarjeta a pagar"
                        }}
                        dropDownContainerStyle={{
                            borderColor: "#bf0404",
                            zIndex: 9
                        }}
                    />

                    <View style={{marginTop: 25}}>
                        {
                            global.cards != '' ? 
                            <TouchableOpacity 
                                onPress={() => Alert.alert('Realizar Pago', '¿Esta segúro que desea realizar el pago?', [
                                    {
                                        text: 'Cancelar',
                                        onPress: () => null,
                                        style: 'cancel'
                                    },
                                    {
                                        text:'Pagar',
                                        onPress: () => grabarDatosTC(valorTC, monto, valor)
                                    }
                                ])}
                                style={[styles.buton, {backgroundColor: '#bf0404', borderColor: '#bf0404'}]}
                            >
                                <Text style={{textAlign: 'center', color: 'white'}}>Pagar</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity 
                                style={[styles.buton, {backgroundColor: 'rgba(191, 4, 4, 0.5)', borderColor: 'rgba(191, 4, 4, 0.5)'}]}
                            >
                                <Text style={{textAlign: 'center', color: 'white'}}>Pagar</Text>
                            </TouchableOpacity>
                        }
                    </View>

                </View>
            );
        };

        const cargando = () => {
            return (
                <View style={[styles.centeredView, {backgroundColor: 'rgba(255,255,255, 0.9)'}]}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={loading}
                    >
                        <View style={[styles.centeredView, {backgroundColor: 'rgba(255,255,255, 0.9)'}]}>
                            <ActivityIndicator size="large" color="#bf0404" />
                            <Text style={{color: 'black'}}>Cargando...</Text>
                        </View>
        
                    </Modal>
                </View>
            )
        }

        return (
            <SafeAreaView style={styles.contenedor}>
                <View style={{marginTop: 10}}>
                    <Text style={{marginBottom: 15, color:'black', textAlign: 'center', fontWeight: 'bold'}}>Complete todos los campos</Text>
                    <TextInputComponent />
                    {cargando()}
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({

    contenedor:{ 
        flex: 1, 
        paddingHorizontal: 15, 
        width: CONTENEDOR, 
        height: '100%', 
        backgroundColor: 'white'
    },

    centeredView:{
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        flex: 1
    },

    buton:{
        borderRadius: 5,
        borderColor: '#9c9c9c', 
        borderWidth: 1,
        padding: 5
    }, 

    //input style
    container: {
        padding: 2
    },
    input: {
        height: 48,
        paddingHorizontal: 15,
        borderRadius: 5,
        borderWidth: 0.8,
        borderColor: '#bf0404',
    },
    inputStyle: { fontSize: 14 },
    labelStyle: {
        fontSize: 14,
        position: 'absolute',
        top: -10,
        backgroundColor: 'white',
        marginLeft: -4,
        color: '#bf0404'
    },
    placeholderStyle: { fontSize: 14 },
    textErrorStyle: { fontSize: 14 },

})