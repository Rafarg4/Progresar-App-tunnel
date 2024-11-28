import React, { Component } from 'react';
import {
    Text,
    SafeAreaView,
    View,
    Alert,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import * as global from '../global.js'
import { Divider } from 'react-native-paper';
import { ScrollView } from 'react-native-virtualized-view';
import Icon from 'react-native-vector-icons/FontAwesome';


export default class DetaTC extends Component {
    constructor(props) {
        super(props);

        this.state = {
            url: 'https://api.progresarcorp.com.py/api/ConsultarDetElectro',
            valid: global.valid_api_key,

            nombre: global.nombre,
            num_doc: global.num_doc,
            num_usu: global.num_usuario,
            cod_cliente: global.codigo_cliente,
            nro_comprobante: props.route.params.data,
            sum_monto: props.route.params.monto,
            sum_saldo: props.route.params.saldo,
            cant_cuotas: props.route.params.cuota,
            loadingTC: false,

            clienteFin: [],
            detalleCompra: [],
            cod_sector: '',
            num_op: '',
            tip_op: '',
        }
        global.actRoute='Detalle E'
    }

    gotoScreen(routeName, item) {
        if(item == null){
            this.props.navigation.navigate(routeName)
        }else{
            this.props.navigation.navigate(routeName, {
                data : item,
            })
        }
    }

    componentDidMount() {
        this.cargarF();
    };

    cargarF() {
        this.setState({ loadingTC: true })

        var data = {
            valid: this.state.valid,
            cod_cliente: global.codigo_cliente,
            comprob: this.state.nro_comprobante
        };

        fetch(this.state.url,{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                this.setState({
                    clienteFin: data.saldo,
                    detalleCompra: data.detalles,
                    cod_sector: data.saldo[0].cod_sector,
                    num_op: data.detalles[0].nro_comprobante,
                    tip_op: data.detalles[0].tip_comprobante,
                    loadingTC: false
                })
            })
            .catch((error) => {
                this.setState({
                    loadingTC: false
                })
                Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPor favor, inténtelo más tarde')
            })
    };

    render() {
        const { nro_comprobante, loadingTC, clienteFin, num_op, tip_op, cant_cuotas, sum_monto, sum_saldo, detalleCompra } = this.state


        const detalleElectro = () => {
            if (nro_comprobante != null) {
                return (
                    <ClienteElectro />
                )
            }
            else {
                return (
                    <Text style= {{textAlign: 'center', marginTop: 15}}> No encontramos ningún dato</Text>
                )
            }
        }

        const IndicadorTC = () => {
            if (loadingTC == true) {
                return (
                    <ActivityIndicator size='large' color='#bf0404' />
                )
            }
            return null
        }

        const defaultOptions = {
            significantDigits: 2,
            thousandsSeparator: '.',
            decimalSeparator: ',',
            symbol: ''
        }

        const currencyFormat = (value, options) => {
            value = Number(value);
            if (typeof value !== 'number') { return value }
            options = { ...defaultOptions, ...options }
            value = value.toFixed(options.significantDigits)

            const [currency, decimal] = value.split('.')
            return `${options.symbol} ${currency.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                options.thousandsSeparator
            )}`
        }

        const comprobTipo = (value) =>{
            if(value == 'PRE'){
                value = 'Préstamo'
            }

            if(value == 'DCH'){
                value = 'Descuento de Cheque'
            }

            if(value == 'FCR'){
                value = 'Factura Crédito'
            }

            return value
        }

        const cuotasF = (item) =>{

            const comprobSaldo = (item) => {
                if(item.saldo_cuota == 0){
                    return(
                        <Text style={[styles.textDetaTC, {color: 'green'}]}>{currencyFormat(item.monto_cuota)}</Text>
                    )
                }else{
                    return(
                        <Text style={[styles.textDetaTC, {color: 'red'}]}>{currencyFormat(item.monto_cuota)}</Text>
                    )
                }
            }
            
            return(
                <View style={{ flexDirection: 'row', width: '100%'}}>
                    <View style={{ marginRight: 5, width: '10%',  alignItems: 'center'}}>
                        <Text style={styles.textDetaTC}>{item.nro_cuota}</Text>
                    </View>

                    <View style={{ marginRight: 5, width: '30%',  alignItems: 'center' }}>
                        <Text style={styles.textDetaTC}>{item.fec_vencimiento}</Text>
                    </View>
                    <View style={{ marginRight: 5, width: '30%',  alignItems: 'center' }}>
                        {comprobSaldo(item)}
                    </View>

                    <View style={{ marginRight: 5, width: '30%',  alignItems: 'center' }}>
                        <Text style={styles.textDetaTC }>{currencyFormat(item.saldo_cuota)}</Text>
                    </View>
                </View>
            )
        }

        const detProducto = (item) =>{
            
            return(
                <View>
                <View style={{ flexDirection: 'row', width: '100%'}}>
                    <View style={{ marginRight: 5, width: '25%',  alignItems: 'center'}}>
                        <Text style={styles.textDetaTC}>{item.desc_articulo}</Text>
                    </View>

                    <View style={{ marginRight: 5, width: '25%',  alignItems: 'center', justifyContent:'center' }}>
                        <Image
                            style={{ width: 80, height: 80, marginBottom: 5, alignItems: 'center', justifyContent:'center' }}
                            source= {{uri: 'https://progresarelectrodomesticos.com/img/producto/'+item.ruta_foto}}
                        />
                    </View>
                    
                    <View style={{ marginRight: 5, width: '25%',  alignItems: 'center', justifyContent:'center' }}>
                        <Text style={styles.textDetaTC }>{currencyFormat(item.precio_unitario_coniva)} x {item.cantidad}</Text>
                    </View>

                    <View style={{ marginRight: 5, width: '25%',  alignItems: 'center', justifyContent:'center' }}>
                        <Text style={styles.textDetaTC }>{currencyFormat(item.precio_unitario_coniva*item.cantidad)}</Text>
                    </View>
                </View>
                <Divider style={{marginBottom: 5 }}/>
                </View>
            )
        }

        const ClienteElectro = () => {
            if (clienteFin != '') {
                return (
                    <View style={{borderRadius: 10, width: '100%', }}>
                        {/* DETALLE DE LA FACTURA */}
                        <View style={styles.box3}>

                            <Text style={{textAlign: 'center', fontSize: 16}}> <Icon name='certificate' color='#bf0404' size={20} /> Factura N° {num_op}</Text>

                            <View style={{ flexDirection: 'row', width: '100%', marginTop: 10}}>
                                
                                <View style={{width: '60%'}}>
                                    <Text>Tipo:</Text>
                                    <Divider style={{marginBottom: 5 }} />
                                    <Text>Cantidad de Cuotas:</Text>
                                    <Divider style={{marginBottom: 5 }} />
                                    <Text>Monto Factura:</Text>
                                    <Divider style={{marginBottom: 5 }} />
                                    <Text>Saldo Total:</Text>
                                </View>

                                <View style={{width: '40%'}}>
                                    <Text> {comprobTipo(tip_op)}</Text>
                                    <Divider style={{marginBottom: 5 }} />
                                    <Text> {cant_cuotas}</Text>
                                    <Divider style={{marginBottom: 5 }} />
                                    <Text>{currencyFormat(sum_monto)}</Text>
                                    <Divider style={{marginBottom: 5 }} />
                                    <Text style={{color: 'red'}}>{currencyFormat(sum_saldo)}</Text>
                                </View>
                            </View>

                            <Divider style={{marginBottom: 5, marginTop: 5 }} />
                            
                        </View>

                        {/* PRODUCTOS */}
                        <View style={styles.box3}>
                            <Text style={{textAlign: 'center', fontSize: 16, marginBottom: 5}}> <Icon name='shopping-cart' color='#bf0404' size={20} /> Productos</Text>

                            <View style={{ flexDirection: 'row', width: '100%'}}>
                                <View style={{ marginRight: 5, width: '25%',  alignItems: 'center'}}>
                                    <Text style={styles.textDetaTC}>Artículo</Text>
                                </View>

                                <View style={{ marginRight: 5, width: '25%',  alignItems: 'center' }}>
                                    <Text style={styles.textDetaTC}>Imagen</Text>
                                </View>
                                <View style={{ marginRight: 5, width: '25%',  alignItems: 'center' }}>
                                    <Text style={styles.textDetaTC}>Precio Unitario</Text>
                                </View>

                                <View style={{ marginRight: 5, width: '25%',  alignItems: 'center' }}>
                                    <Text style={styles.textDetaTC}>Total</Text>
                                </View>
                            </View>

                            <Divider style={{marginBottom: 5 }}/>

                            <FlatList
                                data={detalleCompra}
                                keyExtractor={(item) => item.cod_articulo}
                                renderItem={({ item, index }) => {
                                    return (
                                        <View>{detProducto(item)}</View>
                                    )
                                }
                                }
                            />

                        </View>
                        
                        {/* CUOTAS */}
                        <View style={styles.box3}>

                            <Text style={{textAlign: 'center', fontSize: 16, marginBottom: 5}}> <Icon name='info-circle' color='#bf0404' size={20} /> Detalles</Text>

                            <View style={{ flexDirection: 'row', width: '100%'}}>
                                <View style={{ marginRight: 5, width: '10%',  alignItems: 'center'}}>
                                    <Text style={styles.textDetaTC}>N°</Text>
                                </View>

                                <View style={{ marginRight: 5, width: '30%',  alignItems: 'center' }}>
                                    <Text style={styles.textDetaTC}>Vencimiento</Text>
                                </View>
                                <View style={{ marginRight: 5, width: '30%',  alignItems: 'center' }}>
                                    <Text style={styles.textDetaTC}>Monto Cuota</Text>
                                </View>
                                <View style={{ marginRight: 5, width: '30%',  alignItems: 'center' }}>
                                    <Text style={styles.textDetaTC}>Saldo Cuota</Text>
                                </View>
                            </View>

                            <Divider style={{marginBottom: 5 }}/>

                            <FlatList
                                data={clienteFin}
                                keyExtractor={(item) => item.nro_cuota}
                                renderItem={({ item, index }) => {
                                    return (
                                        <View>{cuotasF(item)}</View>
                                    )
                                }
                                }
                            />
                        </View>
                        
                        {/* TOTALES */}
                        <View style={styles.box3}>
                            <View style={{ flexDirection: 'row', width: '100%'}}>
                                
                                <View style={{ marginRight: 5, width: '10%',  alignItems: 'center'}}>
                                    <Text style={styles.textDetaTC}></Text>
                                </View>

                                <View style={{ marginRight: 5, width: '30%',  alignItems: 'center'}}>
                                    <Text style={styles.textDetaTC}>Total:</Text>
                                </View>

                                <View style={{ marginRight: 5, width: '30%',  alignItems: 'center' }}>
                                    <Text style={styles.textDetaTC}>{currencyFormat(sum_monto)}</Text>
                                </View>
                                
                                <View style={{ marginRight: 5, width: '30%',  alignItems: 'center' }}>
                                    <Text style={[styles.textDetaTC, {color: 'red'}]}>{currencyFormat(sum_saldo)}</Text>
                                </View>

                            </View>
                        </View>

                    </View>
                )
            }
            else {
                return (
                    <View style={styles.vistaCargando}>
                        <Text>Buscando datos</Text>
                        <Text>  <IndicadorTC /> </Text>
                    </View>
                )
            }
        }

        return (
            <SafeAreaView style={styles.box1}>
                <ScrollView 
                    showsVerticalScrollIndicator= {false}
                >
                    <View style={{marginBottom: 20 }}>
                        <View style={styles.box2}>
                            {detalleElectro()}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    box1: {
        flex: 1,
        paddingHorizontal: 15,
        width: '100%',
        height: '100%',
    },

    box2: {
        marginTop: 15,
        alignItems: 'center',
        alignContent: 'center',
    },

    box3: {
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 10,
        width: '100%',
        marginBottom: 10
    },

    vistaCargando: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 10,
        width: '100%',
        height: 80,
        alignItems: 'center',
        alignContent: 'center'
    },

    textDeta: {
        fontSize: 14,
        marginTop: 5
    },

    textDetaTC:{
        fontSize: 11,
        marginBottom: 5,
        textAlign: 'center',
    },

    textVenc: {
        fontSize: 16,
        marginBottom: 5,
        
    },

    colorGreen: {
        color: 'green',
        fontWeight: 'bold',
    },

    colorRed: {
        color: 'red',
        fontWeight: 'bold',
    },

    colorOr: {
        color: 'orange',
        fontWeight: 'bold',
    },
})