import React, { Component } from 'react';
import {
    Text,
    SafeAreaView,
    View,
    Alert,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Divider } from 'react-native-paper';
import { ScrollView } from 'react-native-virtualized-view';
import * as global from '../global.js'


export default class DetaTC extends Component {
    constructor(props) {
        super(props);

        this.state = {
            url: 'https://api.progresarcorp.com.py/api/ConsultarActualTC',
            valid: global.valid_api_key,

            nombre: global.nombre,
            num_doc: global.num_doc,
            num_usu: global.num_usuario,
            cod_cliente: global.codigo_cliente,
            codtar: props.route.params.data,
            loadingTC: false,

            codvencActual: '',
            Pdesde: '',
            Phasta: '',
            vencimiento: '',
            fecha_cierre: '',
            linea_normal: '',
            deuda_normal: '',
            linea_especial: '',
            deuda_especial: '',
            pago_min: '',
            saldo_mora: '',
            dias_mora: '',
            deuda_total: '',
            saldo_ant: '',
            detalles: [],
            cierres_ant: [],
            selecP: '',
            mes: '',
            mesNom: '',
        }
        global.actRoute='Movimientos TC'
    }

    gotoScreen(routeName, item, cierre) {
        if (item == null) {
            this.props.navigation.navigate(routeName)
        } else {
            this.props.navigation.navigate(routeName, {
                data: item,
            })
        }
    }

    componentDidMount() {
        this.cargarTC();
    };

    cargarTC(cod_cierre, item, mesS) {
        if(cod_cierre == null ){

            this.setState({ loadingTC: true })

            var data = {
                valid: this.state.valid,
                cod_tar: this.state.codtar,
                num_usu: this.state.num_usu
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

                var saldoAnt = 0;

                this.setState({
                    codvencActual: data.venc_actual[0].cod_cierre,
                    Pdesde: data.periodo[0].anterior,
                    Phasta: data.periodo[0].actual,
                    vencimiento: data.periodo[0].vencimiento,
                    fecha_cierre: data.fecha_cierre[0].desde,
                    linea_normal: data.saldo[0].linea_normal,
                    deuda_normal: data.saldo[0].deuda_normal,
                    linea_especial: data.saldo[0].linea_especial,
                    deuda_especial: data.saldo[0].deuda_especial,
                    pago_min: data.saldo[0].pago_min,
                    saldo_mora: data.saldo[0].saldo_mora,
                    dias_mora: data.saldo[0].dias_mora,
                    deuda_total: data.saldo[0].deuda_normal,
                    detalles: data.detalles,
                    cierres_ant: data.cieeres_ant,
                    loadingTC: false,
                })
                if(data.saldo_ant != ''){
                    saldoAnt = data.saldo_ant[0].deuda_total;
                }else{
                    saldoAnt = 0;
                }

                this.setState({
                    saldo_ant: saldoAnt,
                })

                if(global.num_doc == '3211235'){
                    this.setState({
                        cierres_ant: null
                    })
                }
            })
            .catch((error) => {
                this.setState({
                    loadingTC: false
                })
                Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor. \nPor favor, inténtelo más tardeee')
            })
        }else{
            this.setState({ loadingTC: true, selecP: mesS})
            //console.log(this.state.selectP)
            var data = {
                valid: this.state.valid,
                cierre: cod_cierre,
                cod_tar: this.state.codtar
            };

            fetch('https://api.progresarcorp.com.py/api/ConsultarDetTC',{
                method: 'POST',
                body: JSON.stringify(data), 
                headers:{
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {

                if(data.saldo != ''){
                    this.setState({
                        Pdesde: data.periodo[0].anterior,
                        Phasta: data.periodo[0].actual,
                        vencimiento: data.periodo[0].vencimiento,
                        linea_normal: data.saldo[0].linea_normal,
                        deuda_normal: data.saldo[0].deuda_normal,
                        linea_especial: data.saldo[0].linea_especial,
                        deuda_especial: data.saldo[0].deuda_especial,
                        pago_min: data.saldo[0].pago_min,
                        saldo_mora: data.saldo[0].saldo_mora,
                        dias_mora: data.saldo[0].dias_mora,
                        deuda_total: data.saldo[0].deuda_normal,
    
    
                        saldo_ant: data.saldo_ant[0].deuda_total,
                        //ver error en consulta API -> saldo_ant no sale
    
                        detalles: data.detalles,
                        cierres_ant: data.cieeres_ant,
                        loadingTC: false,
                    })
                }else{
                    Alert.alert('Lo sentimos', 'No posee movimientos registrados en este periodo. \nSi cree que es un error por favor contáctenos.')
                    this.setState({loadingTC: false})
                }
            })
            .catch((error) => {
                console.log(error)
                this.setState({
                    loadingTC: false
                })
                Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor. \nPor favor, inténtelo más tarde')
            })
        }
    };

    render() {
        const {
            mesNom,
            loadingTC,
            vencimiento,
            detalles,
            Pdesde,
            Phasta,
            linea_normal,
            deuda_normal,
            linea_especial,
            deuda_especial,
            pago_min,
            saldo_mora,
            dias_mora,
            deuda_total,
            saldo_ant,
            cierres_ant,
            selecP,
            saldo
        } = this.state

        const IndicadorTC = () => {
            if (loadingTC == true) {
                return (
                    <ActivityIndicator size='large' color='#bf0404' />
                )
            }
            return null
        }

        const IndicadorTCMini = () => {
            if (loadingTC == true) {
                return (
                    <ActivityIndicator size='small' color='#bf0404' />
                )
            }
            return null
        }

        {/* detalles TC */ }
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

        const comprobarDET = (item) => {
            return (
                <View>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ width: '32%' }}>
                            <Text style={styles.textDetaTC}>{item.fecha}</Text>
                        </View>
                        <View style={{ width: '41%' }}>
                            <Text style={styles.textDetaTC}>{item.detalle_comercio}</Text>
                        </View>
                        <View style={{ width: '27%' }}>
                            <Text style={styles.textDetaTCImp}>{currencyFormat(item.importe)}</Text>
                        </View>
                    </View>
                    <Divider style={{ marginBottom: 4 }} />
                </View>
            )
        }

        const DetallesTC = () => {
            if(loadingTC == true){
                return(
                    <View style={styles.vistaCargando}>
                        <Text>Buscando datos</Text>
                        <Text>  <IndicadorTC /> </Text>
                    </View>
                )
            }
            if (detalles != '') {
                return (
                    <View style={{ margin: 5, padding: 5, borderRadius: 10, width: '100%', }}>

                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            <View style={styles.boxSuperior}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>{global.nombre}</Text>
                                <Text style={{ fontSize: 8, fontWeight: 'bold' }}>{global.user_dir}</Text>
                                <Text style={{ fontSize: 8, marginBottom: 4 }}>{global.user_city}</Text>
                                <Text style={{ fontSize: 10, marginBottom: 4 }}>{global.num_doc}</Text>
                                <Text style={{ fontSize: 10, marginBottom: 4 }}>{global.user_phone}</Text>
                            </View>

                            <View style={styles.boxSuperior}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5 }}>Periodo de Extracto:</Text>
                                <Text style={{ fontSize: 11, marginBottom: 5 }}>Desde: {Pdesde}</Text>
                                <Text style={{ fontSize: 11, marginBottom: 5 }}>Hasta: {Phasta}</Text>
                                <Text style={{ fontSize: 11, marginBottom: 5 }}>Nro. Usuario: {global.num_usuario}</Text>
                            </View>
                        </View>

                        <View style={styles.box3}>
                            <View style={{ flexDirection: 'row', width: '100%', marginBottom: 5 }}>
                                <View style={{ marginRight: 5, width: '25%' }}>
                                    <Text style={styles.textDetaTC}>Línea Normal</Text>
                                </View>

                                <View style={{ marginRight: 5, width: '25%' }}>
                                    <Text style={styles.textDetaTC}>Normal Disponible</Text>
                                </View>
                                <View style={{ marginRight: 5, width: '25%' }}>
                                    <Text style={styles.textDetaTC}>Línea Especial:</Text>
                                </View>
                                <View style={{ marginRight: 5, width: '25%' }}>
                                    <Text style={styles.textDetaTC}>Especial Disponible:</Text>
                                </View>
                            </View>
                            <Divider />
                            <View style={{ flexDirection: 'row', width: '100%', marginBottom: 5 }}>
                                <View style={{ marginRight: 5, width: '25%' }}>
                                    <Text style={styles.textDetaTC}>{currencyFormat(linea_normal)}</Text>
                                </View>

                                <View style={{ marginRight: 5, width: '25%' }}>
                                    <Text style={styles.textDetaTC}>{currencyFormat(linea_normal - deuda_normal)}</Text>
                                </View>
                                <View style={{ marginRight: 5, width: '25%' }}>
                                    <Text style={styles.textDetaTC}>{currencyFormat(linea_especial)}</Text>
                                </View>
                                <View style={{ marginRight: 5, width: '25%' }}>
                                    <Text style={styles.textDetaTC}>{currencyFormat(linea_especial - deuda_especial)}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.box3}>
                            <View style={{ flexDirection: 'row', width: '100%', }}>
                                <View style={{ marginRight: 15, width: '27%' }}>
                                    <Text>Fecha</Text>
                                </View>

                                <View style={{ marginRight: 15, width: '45%' }}>
                                    <Text>Detalle</Text>
                                </View>
                                <View style={{ marginRight: 15, width: '25%' }}>
                                    <Text>Importe</Text>
                                </View>
                            </View>
                            <Divider style={{ marginBottom: 3 }} />

                            <FlatList
                                data={detalles}
                                showsVerticalScrollIndicator={false}
                                decelerationRate={0}
                                keyExtractor={(item) => item.cod_deta}
                                renderItem={({ item, index }) => {
                                    return (
                                        <View>{comprobarDET(item)}</View>
                                    )
                                }
                                }
                            />
                        </View>

                        <View style={styles.box3}>
                            <View style={{ flexDirection: 'row', width: '100%', marginBottom: 5 }}>
                                <View style={{ marginRight: 5, width: '33%' }}>
                                    <Text style={styles.textDetaTC}>Pago Mínimo</Text>
                                </View>

                                <View style={{ marginRight: 5, width: '33%' }}>
                                    <Text style={styles.textDetaTC}>Importe en Mora:</Text>
                                </View>
                                <View style={{ marginRight: 5, width: '33%' }}>
                                    <Text style={styles.textDetaTC}>Días de Mora:</Text>
                                </View>
                            </View>
                            <Divider />
                            <View style={{ flexDirection: 'row', width: '100%', marginBottom: 5 }}>
                                <View style={{ marginRight: 5, width: '33%' }}>
                                    <Text style={styles.textDetaTC}>{currencyFormat(pago_min)}</Text>
                                </View>

                                <View style={{ marginRight: 5, width: '33%' }}>
                                    <Text style={styles.textDetaTC}>{currencyFormat(saldo_mora)}</Text>
                                </View>
                                <View style={{ marginRight: 5, width: '33%' }}>
                                    <Text style={styles.textDetaTC}>{dias_mora}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.box3}>
                            <Text style={{ fontSize: 12 }}>Saldo anterior: {currencyFormat(saldo_ant)}</Text>
                        </View>

                        <View style={styles.box3}>
                            <Text style={{ textAlign: 'center' }}>Deuda Total: {currencyFormat(deuda_total)}</Text>
                        </View>

                    </View>
                )
            }
            else {
                return (
                    <View style={styles.vistaCargando}>
                        <Text>No posee movimientos</Text>
                    </View>
                )
            }
        }

        const comprobarAnio =(value, item)=>{
            const compMes = (item) =>{
                if(item.mes == '1'){
                    
                    return ( <Text>Enero</Text>)
                }
                if(item.mes == '2'){
                    
                    return ( <Text>Febrero</Text>)
                }
                if(item.mes == '3'){
                    
                    return ( <Text>Marzo</Text>)
                }
                if(item.mes == '4'){
                    
                    return ( <Text>Abril</Text>)
                }
                if(item.mes == '5'){
                    return ( <Text>Mayo</Text>)
                }
                if(item.mes == '6'){
                    
                    return ( <Text>Junio</Text>)
                }
                if(item.mes == '7'){
                    
                    return ( <Text>Julio</Text>)
                }
                if(item.mes == '8'){
                    
                    return ( <Text>Agosto</Text>)
                }
                if(item.mes == '9'){
                    
                    return ( <Text>Septiembre</Text>)
                }
                if(item.mes == '10'){
                    
                    return ( <Text>Octubre</Text>)
                }
                if(item.mes == '11'){
                    
                    return ( <Text>Noviembre</Text>)
                }
                if(item.mes == '12'){
                    
                    return ( <Text>Diciembre</Text>)
                }
            }
            
            if(selecP == item.mes){
                return(
                    <View style={styles.boxTouch}>
                        <TouchableOpacity
                            onPress={() => this.cargarTC(item.cod_cierre, item, item.mes)}
                            style={{padding: 10, width: '100%', backgroundColor: '#9c9c9c', borderRadius:5}}
                        >
                            <Text style={{color: 'white', textAlign: 'center'}}>{compMes(item)} - {item.anio}</Text>    
                        </TouchableOpacity>
                    </View>
                )
            }else{
                return(
                    <View style={styles.boxTouch}>
                        <TouchableOpacity
                            onPress={() => this.cargarTC(item.cod_cierre, item, item.mes)}
                            style={{padding: 10, width: '100%', backgroundColor: '#bf0404', borderRadius:5}}
                        >
                            <Text style={{color: 'white', textAlign: 'center'}}>{compMes(item)} - {item.anio}</Text>    
                        </TouchableOpacity>
                    </View>
                )
            }
        }

        return (
            <SafeAreaView style={styles.box1}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ marginBottom: 20 }}>
                        <View style={styles.box2}>
                            <Text style={styles.textVenc}>Próximo Vencimiento: {vencimiento}<IndicadorTCMini /> </Text>
                            {DetallesTC()}
                        </View>

                        <View styles={styles.box2}>
                            <Text>Ver Movimientos Anteriores</Text>
                            <FlatList 
                                data={cierres_ant}
                                horizontal= {true}
                                snapToInterval={190}
                                showsHorizontalScrollIndicator= {false}
                                decelerationRate={0}
                                keyExtractor={(item) => item.cod_cierre}
                                renderItem={({item, index}) =>{
                                        return(
                                            <View>
                                                {comprobarAnio(item.cod_cierre, item)}
                                            </View>
                                        )
                                    }
                                }
                            />

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

    boxTouch: {
        marginTop: 15,
        alignItems: 'center',
        alignContent: 'center',
        marginRight: 10,
    },

    box3: {
        margin: 5,
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 10,
        width: '100%',
    },

    boxSuperior: {
        marginRight: 5,
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 10,
        width: '50%',
        marginBottom: 5
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

    textDetaTC: {
        fontSize: 11,
        marginBottom: 5
    },

    textDetaTCImp: {
        fontSize: 11,
        textAlign: 'right',
        marginBottom: 5,
        marginRight: 5
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