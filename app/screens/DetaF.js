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
            url: 'https://api.progresarcorp.com.py/api/Detalle',
            valid: global.valid_api_key,

            nombre: global.nombre,
            num_doc: global.num_doc,
            num_usu: global.num_usuario,
            cod_cliente: global.codigo_cliente,
            nro_comprobante: props.route.params.data,
            sum_monto: props.route.params.monto,
            sum_saldo: props.route.params.saldo,
            loadingTC: false,

            clienteFin: [],
            cod_sector: '',
            cod_motivo:'',
            num_op: '',
            tip_op: '',
            cant_cuotas: '',
        }
        global.actRoute='Detalle F'
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
        setTimeout(() => {
            this.cargarF();
        }, 1, this
        )
    };

    cargarF() {
        this.setState({ loadingTC: true })

        var data = {
            valid: this.state.valid,
            cod_cliente: global.codigo_cliente,
            comprob: this.state.nro_comprobante
        };

        fetch('https://api.progresarcorp.com.py/api/Detalle',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                this.setState({
                    clienteFin: data.cuotas,
                    cod_sector: data.detalle[0].cod_sector,
                    num_op: data.detalle[0].nro_comprobante_ref,
                    tip_op: data.detalle[0].tipo_comprobante,
                    cant_cuotas: data.detalle[0].nro_cuota,
                    total_pagado: data.detalle[0].total_pagado,
                    cod_motivo: data.detalle[0].cod_motivo,
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
        const { nro_comprobante, loadingTC, clienteFin, cod_sector, num_op, tip_op, cant_cuotas, sum_monto, sum_saldo, total_pagado, cod_motivo } = this.state


        const detTC = () => {
            if (nro_comprobante != null) {
                return (
                    <ClienteFin />
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

        const comprobSector = (value) =>{
            if(value == 'FRC'){
                value = 'Francés'
            }

            if(value == 'DIR'){
                value = 'Directo'
            }

            if(value == 'DCH'){
                value = 'DCH'
            }

            if(value == 'AME'){
                value = 'Americano'
            }

            if(value == 'FIS'){
                value = 'Fisalco'
            }

            if(value == 'CPG'){
                value = 'CPG'
            }

            return value
        }

        const comprobTipo = (value) =>{
            if(value == 'PRE'){
                value = 'Préstamo'
            }

            if(value == 'DCH'){
                value = 'Descuento de Cheque'
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

        const motivoPre = () =>{
            if(cod_motivo == '3'){
                return (<Text> Refinanciación </Text> )
            }else{
                return (<Text> {currencyFormat(total_pagado-sum_monto)} </Text> )
            }
        }

        const ClienteFin = () => {
            if (clienteFin != '') {
                return (
                    <View style={{borderRadius: 10, width: '100%', }}>
                        
                        {/* Detalles generales de la OP */}
                        <View style={styles.box3}>

                            <Text style={{textAlign: 'center', fontSize: 16}}> <Icon name='certificate' color='#bf0404' size={20} /> N° Préstamo: {num_op}</Text>

                            <View style={{ flexDirection: 'row', width: '100%', marginTop: 10}}>
                                
                                <View style={{width: '60%'}}>

                                    <Text>Tipo:</Text>
                                    <Divider style={{marginBottom: 5 }} />

                                    <Text>N° Cuotas:</Text>
                                    <Divider style={{marginBottom: 5 }} />

                                    <Text>Monto Cuota:</Text>
                                    <Divider style={{marginBottom: 5 }} />

                                    <Text>Total Préstamo:</Text>
                                    <Divider style={{marginBottom: 5 }} />

                                    <Text>Total a Pagar:</Text>
                                    <Divider style={{marginBottom: 5 }} />

                                    <Text>Total Intereses:</Text>
                                    <Divider style={{marginBottom: 5 }} />

                                    <Text>Saldo Total:</Text>
                                </View>

                                <View style={{width: '40%'}}>
                                    <Text> {comprobTipo(tip_op)} {comprobSector(cod_sector)}</Text>
                                    <Divider style={{marginBottom: 5 }} />
                                    
                                    <Text> {cant_cuotas}</Text>
                                    <Divider style={{marginBottom: 5 }} />

                                    <Text>{currencyFormat(clienteFin[0].monto_cuota)}</Text>
                                    <Divider style={{marginBottom: 5 }} />
                                    
                                    <Text>{currencyFormat(sum_monto)}</Text>                                    
                                    <Divider style={{marginBottom: 5 }} />

                                    <Text>{currencyFormat(total_pagado)}</Text>
                                    <Divider style={{marginBottom: 5 }} />

                                    <View>{motivoPre()}</View>
                                    <Divider style={{marginBottom: 5 }} />
                                    
                                    <Text style={{color: 'red'}}>{currencyFormat(sum_saldo)}</Text>
                                </View>
                            </View>

                            <Divider style={{marginBottom: 5, marginTop: 5 }} />
                            
                        </View>

                        {/* datos de las cuotas pendientes y pagadas */}
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
                            {detTC()}
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