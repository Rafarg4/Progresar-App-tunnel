import React, {Component, useRef} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as global from '../global';
import Icon from 'react-native-vector-icons/FontAwesome';
import ViewShot from "react-native-view-shot";
import * as Sharing from 'expo-sharing';

export default class ConfirmarCompra extends Component{

    constructor(props) {
        super(props);

        this.state = {
            value: props.route.params.status,
            tipo: props.route.params.tipo,
            data: props.route.params.info,
            imageForSharing:'',
        }
    }

    gotoScreen(routeName){
        global.cod_carrito = '0';
        global.items_carrito= '0';
        global.total_carrito='0';
        global.des_pago='';
        global.cod_carrito_pagos = '0';
        this.props.navigation.navigate(routeName)
    }

    terminarPedido(){
        global.cod_carrito = '0';
        global.items_carrito= '0';
        global.total_carrito='0';
        global.des_pago='';
        global.cod_carrito_pagos = '0';
        this.gotoScreen('Home')
    }

    volverAtras(){
        this.props.navigation.goBack();
    }

    onCapture = uri => {
        this.setState({imageForSharing: uri});
    }

    render(){
        const {value, tipo, data, imageForSharing} = this.state;

        const defaultOptions = {
            significantDigits: 2,
            thousandsSeparator: '.',
            decimalSeparator: ',',
            symbol: ''
        }

        const currencyFormat = (value, options) => {
            value = Number(value);
            if (typeof value !== 'number'){return value}
            options = { ...defaultOptions, ...options }
            value = value.toFixed(options.significantDigits)

            const [currency, decimal] = value.split('.')
            return `${options.symbol} ${currency.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                options.thousandsSeparator
            )}`
        }

        const comprobView = () =>{

            const sharingImage = () =>{
                Sharing.shareAsync(imageForSharing)
            }

            const getFecha = () => {
                var day = new Date().getDate();
                var month = new Date().getMonth()+1;
                var year = new Date().getFullYear();

                if(month < 10){
                    if(day <10){
                        var date = '0' + day + '/0' + month + '/' + year;
                    }else{
                        var date = day + '/0' + month + '/' + year;
                    }
                }else{
                    if(day <10){
                        var date = '0' + day + '/' + month + '/' + year;
                    }else{
                        var date = day + '/' + month + '/' + year;
                    }
                }
                return date;
            }

            if( value == 'review'){
                if(tipo.estado == 'APLICADO'){
                    return(
                        <View style={{backgroundColor: 'white', alignItems: 'center', padding: 10, borderRadius: 5, width: '95%'}}>
                            
                            {/* icono */}
                            <View style={{alignSelf: 'flex-start', marginBottom: 15}}>
                                <View>
                                    <TouchableOpacity
                                        onPress={()=> this.volverAtras()}
                                        style={{backgroundColor: '#9c9c9c', padding: 5, width: '100%', alignItems: 'flex-start', borderRadius: 5, marginTop:15}}
                                    >
                                        <Icon name = 'times' color = 'white' backgroundColor = '#bf0404' 
                                            style={{padding: 10}} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* vista que se podrá compartir */}
                            <ViewShot onCapture={this.onCapture} captureMode="mount" style={{backgroundColor: 'white', alignItems: 'center', padding: 5}}>
                                <View style={{marginTop:10, marginBottom:10, alignItems: 'center'}}>
                                    <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15}}>¡Su comprobante de pago!</Text>
                                    <Image 
                                        style={{
                                            width: 150,
                                            height: 150,
                                        }}
                                        source={ {uri: 'https://secure.progresarcorp.com.py/images/2.0/recursos/payment.jpg'}}
                                    />
                                    <Text style={{fontSize: 12, marginTop: 10}}>Se realizó con éxito su Pago.</Text>
            
                                    <Text style={{fontSize: 16, marginTop: 10}}>Cliente: </Text>
                                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>"{global.nombre.trim()}"</Text>

                                    <Text style={{fontSize: 16, marginTop: 10}}>Fecha: </Text>
                                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>"{tipo.fecha}"</Text>

                                    <Text style={{fontSize: 16, marginTop: 10}}>Recibo N°: </Text>
                                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>"{tipo.cod_venta}"</Text>

                                    <Text style={{fontSize: 16, marginTop: 10}}>Descripción:</Text>
                                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>{tipo.referencia}</Text>

                                    <Text style={{fontSize: 16, marginTop: 10}}>Monto pagado: </Text>
                                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>{currencyFormat(tipo.monto)} ₲ </Text>
                                </View>
                            </ViewShot>
                            
                            {/* Botón de compartir */}
                            <View style={{width: '100%', marginTop: 30}}>
                                <TouchableOpacity
                                    onPress={()=> sharingImage()}
                                    style={{backgroundColor: '#bf0404', padding: 5, width: '100%', alignItems: 'center', borderRadius: 5}}
                                >
                                    <Text style={{color: 'white'}}>Compartir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
            }
            
            if( value == 'success'){
                if(tipo == 'pagos cuotas'){
                    return(
                        <View style={{backgroundColor: 'white', alignItems: 'center', padding: 10, borderRadius: 5, width: '95%'}}>
                            
                            {/* icono */}
                            <View style={{alignSelf: 'flex-start', marginBottom: 15}}>
                                <View>
                                    <TouchableOpacity
                                        onPress={()=> this.terminarPedido()}
                                        style={{backgroundColor: '#9c9c9c', padding: 5, width: '100%', alignItems: 'flex-start', borderRadius: 5, marginTop:15}}
                                    >
                                        <Icon name = 'times' color = 'white' backgroundColor = '#bf0404' 
                                            style={{padding: 10}} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* vista que se podrá compartir */}
                            <ViewShot onCapture={this.onCapture} captureMode="mount" style={{backgroundColor: 'white', alignItems: 'center', padding: 5}}>
                                <View style={{marginTop:10, marginBottom:10, alignItems: 'center'}}>
                                    <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15}}>¡Gracias por su pago!</Text>
                                    <Image 
                                        style={{
                                            width: 150,
                                            height: 150,
                                        }}
                                        source={ {uri: 'https://secure.progresarcorp.com.py/images/2.0/recursos/payment.jpg'}}
                                    />
                                    <Text style={{fontSize: 12, marginTop: 10}}>Se realizó con éxito su Pago.</Text>
            
                                    <Text style={{fontSize: 16, marginTop: 10}}>Cliente: </Text>
                                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>"{global.nombre}"</Text>

                                    <Text style={{fontSize: 16, marginTop: 10}}>Fecha: </Text>
                                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>"{getFecha()}"</Text>

                                    <Text style={{fontSize: 16, marginTop: 10}}>Recibo N°: </Text>
                                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>"{global.cod_carrito_pagos}"</Text>

                                    <Text style={{fontSize: 16, marginTop: 10}}>Descripción:</Text>
                                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>{global.des_pago}</Text>

                                    <Text style={{fontSize: 16, marginTop: 10}}>Monto pagado: </Text>
                                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>{currencyFormat(global.total_carrito)} ₲ </Text>
                                </View>
                            </ViewShot>
                            
                            {/* Botón de compartir */}
                            <View style={{width: '100%', marginTop: 30}}>
                                <TouchableOpacity
                                    onPress={()=> sharingImage()}
                                    style={{backgroundColor: '#bf0404', padding: 5, width: '100%', alignItems: 'center', borderRadius: 5}}
                                >
                                    <Text style={{color: 'white'}}>Compartir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }else{
                    return(
                        <View style={{backgroundColor: 'white', alignItems: 'center', padding: 10, borderRadius: 5, width: '90%'}}>

                            <View style={{alignSelf: 'flex-start', marginBottom: 15}}>
                                <View>
                                    <TouchableOpacity
                                        onPress={()=> this.terminarPedido()}
                                        style={{backgroundColor: '#9c9c9c', padding: 5, width: '100%', alignItems: 'flex-start', borderRadius: 5, marginTop:15}}
                                    >
                                        <Icon name = 'times' color = 'white' backgroundColor = '#bf0404' 
                                            style={{padding: 10}} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* vista que se podrá compartir */}
                            <ViewShot onCapture={this.onCapture} captureMode="mount" style={{backgroundColor: 'white', alignItems: 'center', padding: 5}}>
                                <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15}}>Gracias por su compra, vuelva pronto...</Text>
                                <Image 
                                    style={{
                                        width: 100,
                                        height: 100,
                                    }}
                                    source={ {uri: 'https://progresarelectrodomesticos.com/img/confirmar.png'}}
                                />
                                <Text style={{fontSize: 12, marginTop: 10}}>Se realizó con éxito su compra.</Text>
        
                                <Text style={{fontSize: 16, marginTop: 10}}>Su número de pedido es: </Text>
                                <Text style={{fontSize: 16, fontWeight: 'bold'}}>"{global.cod_carrito}"</Text>
                            </ViewShot>
                            
                            {/* botón para compartir */}
                            <View style={{width: '100%', marginTop: 30}}>
                                <TouchableOpacity
                                    onPress={()=> sharingImage()}
                                    style={{backgroundColor: '#bf0404', padding: 5, width: '100%', alignItems: 'center', borderRadius: 5}}
                                >
                                    <Text style={{color: 'white'}}>Compartir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
            }else{
                if(tipo == 'pagos cuotas'){
                    return(
                        <View style={{backgroundColor: 'white', alignItems: 'center', padding: 10, borderRadius: 5, width: '90%'}}>
                            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15}}>No se pudo realizar el pago</Text>
                            <Animatable.Image 
                                animation="pulse"
                                easing="ease-in"
                                iterationCount={10}
                                style={{
                                    width: 100,
                                    height: 100,
                                }}
                                source={ {uri: 'https://progresarelectrodomesticos.com/img/error.png'}}
                            />
                            <Text style={{fontSize: 14, marginTop: 10}}>Ocurrio un error al intentar realizar su pago</Text>
    
                            <Text style={{fontSize: 16, marginTop: 15, marginBottom: 10 }}>Mensaje de error: {'\n"'+data.messages[0].dsc}"</Text>
                            <Text style={{fontSize: 16, marginTop: 10 }}>Por favor, vuelva a intentarlo.</Text>
                            <Text style={{fontSize: 16, marginTop: 10 }}>Si el problema persiste, contáctenos.</Text>
                            
                            <View style={{width: '100%', marginTop: 10}}>
                                <TouchableOpacity
                                    onPress={()=> this.terminarPedido()}
                                    style={{backgroundColor: '#bf0404', padding: 5, width: '100%', alignItems: 'center', borderRadius: 5}}
                                >
                                    <Text style={{color: 'white'}}>Volver al Inicio</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }else{
                    return(
                        <View style={{backgroundColor: 'white', alignItems: 'center', padding: 10, borderRadius: 5, width: '90%'}}>
                            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15}}>No se pudo realizar la compra</Text>
                            <Animatable.Image 
                                animation="pulse"
                                easing="ease-in"
                                iterationCount={10}
                                style={{
                                    width: 100,
                                    height: 100,
                                }}
                                source={ {uri: 'https://progresarelectrodomesticos.com/img/error.png'}}
                            />
                            <Text style={{fontSize: 14, marginTop: 10}}>Ocurrió un error al intentar realizar su compra</Text>
    
                            <Text style={{fontSize: 16, marginTop: 10}}>Por favor, presione el botón de aquí abajo y vuelva a intentarlo.</Text>
                            
                            <View style={{width: '100%', marginTop: 10}}>
                                <TouchableOpacity
                                    onPress={()=> this.terminarPedido()}
                                    style={{backgroundColor: '#bf0404', padding: 5, width: '100%', alignItems: 'center', borderRadius: 5}}
                                >
                                    <Text style={{color: 'white'}}>Volver al Inicio</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
            }
        }
        return(
            <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                {comprobView()}
            </View>
        )
    }
}