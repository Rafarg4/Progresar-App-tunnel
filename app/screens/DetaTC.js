import React, { Component, useState } from 'react';
import {
    Text,
    SafeAreaView,
    View,
    Alert,
    StyleSheet,
    Image,
    Linking,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Modal
} from 'react-native';
import * as global from '../global.js'
import { ScrollView } from 'react-native-virtualized-view';
import { Divider} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import DropDownPicker from 'react-native-dropdown-picker';
import Toast from 'react-native-toast-message';
import { TextInput } from 'react-native-element-textinput';
import { imageTC } from './ScreenHome.js';

export default class DetaTC extends Component {
    constructor(props) {
        super(props);

        this.state = {
            url: 'https://api.progresarcorp.com.py/api/ConsultarTC',
            valid: global.valid_api_key,

            nombre: global.nombre,
            num_doc: global.num_doc,
            num_usu: global.num_usuario,
            cod_cliente: global.codigo_cliente,
            codtar: props.route.params.data,
            loadingTC: false,

            clientetar: [],
            vencimiento: '',
            ShowInfo: false,
            modalOptions: false,
            ShowAumento: false,
            montoAumento: 0,
            AumentoLoad: false,
            ShowDebito: false,
            puntos_total: 0, 
            puntos_mes: 0,
            puntos_ant: 0, 
            puntos_usados: 0,
            showCanje: false,
            montoCanje: 0,
            nro_tc:'',
            clase_tc: '',
            deuda_periodo: ''
        }
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
        this.cargarTC();
    };

    cargarTC() {
        this.setState({ loadingTC: true })

        var data = {
            valid: this.state.valid,
            num_doc: this.state.num_doc,
            num_usu: this.state.num_usu,
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
                    clientetar: data.clientetar,
                    vencimiento: data.vencimiento[0].vencimiento,
                    loadingTC: false
                })

                data.clientetar.forEach((e) => {
                    if (e.cod_tarjeta == this.state.codtar) {
                        this.getProgrePuntos(e.nro_tarjeta, e.nombre);
                        this.getDeudaPeriodo(e.nro_tarjeta);
                        this.setState({
                            nro_tc: e.nro_tarjeta,
                            clase_tc: e.clase_tarjeta
                        });

                        // Nueva llamada a la API externa
                        this.getSaldoActualTarjeta(e.nro_tarjeta);
                    }
                });
            })
            .catch((error) => {
                this.setState({
                    loadingTC: false
                })
                Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPor favor, inténtelo más tarde')
            })
    };
    getSaldoActualTarjeta(nroTarjeta) {
    const url = `https://api.progresarcorp.com.py/api/obtener_saldo_actual/${nroTarjeta}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Respuesta no OK");
            return response.json();
        })
        .then(data => {
            const cuenta = data.cuenta;

            const resultado = {
                saldo_en_mora: cuenta.saldo_en_mora,
                disponible_contado: cuenta.disponible_contado,
                linea_de_credito: cuenta.linea_de_credito,
            };

            console.log("Datos filtrados:", resultado);

            // Si querés guardarlo en el estado:
            this.setState({ saldoTC: resultado });
        })
        .catch(error => {
            console.error("Error al obtener saldo actual:", error);
        });
}

    //traer deuda del periodo
    getDeudaPeriodo(numtc){

        var data={
            'num_doc': global.num_doc,
            'num_tar': numtc,
            'valid': global.valid_api_key
        };

        fetch('https://api.progresarcorp.com.py/api/get_deuda_periodo',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            
            if(data.status == 'success'){
                this.setState({
                    deuda_periodo: data.deuda
                })
            }else{
                this.setState({
                    deuda_periodo: 0
                })
            }
            
        })
    }

    //traer progrepuntos
    getProgrePuntos(numtc, nombre){
        
        var numTc = numtc.toString();

        var data={
            'num_doc': global.num_doc,
            'num_tar': numTc.substring(numTc.length - 4),
            'nombre': nombre
        };

        fetch('https://api.progresarcorp.com.py/api/get_user_puntos',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {

            //console.log(data);
            
            if(data != ''){
                this.setState({
                    puntos_total : data[0].puntos_total,
                    puntos_mes: data[0].puntos_mes,
                    puntos_ant: data[0].puntos_ant,
                    puntos_usados: data[0].puntos_usados
                })
            }
            
        })
    }

    //enviar solicitud de regrabacion
    envRegrabacion(item, tipo, motivo){
        this.setState({ShowInfo: false});

        if(tipo == '02'){
            motivo = null;
        }
        
        var data = {
            'valid': global.valid_api_key,
            'tipo': tipo,
            'motivo': motivo,
            'cliente': item[0].nombre, 
            'num_tc': item[0].nro_tarjeta,
            'emision': item[0].emision,
            'cod_cliente': global.codigo_cliente,
            'num_doc': global.num_doc
        };

        fetch('https://api.progresarcorp.com.py/api/solicitud-de-regrabacion',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(resp => resp.json())
        .then(data => {
            if (data == 'success'){
                Toast.show({
                    type: 'success',
                    text1: 'Éxito',
                    text2: 'Su solicitud a sido enviada ✅'
                });
            }else{
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'En este momento no podemos enviar su solicitud'
                });
            }
        })
    }

    //enviar monto de aumento de linea
    envAumento(monto, item){
        this.setState({ShowAumento: false, AumentoLoad: true});

        var data = {
            'valid': global.valid_api_key,
            'monto': monto,
            'cliente': item[0].nombre, 
            'num_tc': item[0].nro_tarjeta,
            'cod_cliente': global.codigo_cliente,
            'num_doc': global.num_doc,
            'linea': item[0].linea_normal
        };

        fetch('https://api.progresarcorp.com.py/api/solicitud-de-aumento',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(resp => resp.json())
        .then(data => {
            this.setState({AumentoLoad: false});
            if (data == 'success'){
                Toast.show({
                    type: 'success',
                    text1: 'Éxito',
                    text2: 'Su solicitud a sido enviada ✅'
                });
            }else{
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'En este momento no podemos enviar su solicitud'
                });
            }
        })
    }

    //enviar debito automatico
    envDebito(servicio, detalle, item){
        
        this.setState({ShowDebito: false, AumentoLoad: true});

        console.log(servicio, detalle);

        var data = {
            'valid': global.valid_api_key,
            'servicio': servicio,
            'detalle': detalle,
            'num_tc': item[0].nro_tarjeta,
            'linea': item[0].linea_normal,
            'cod_cliente': global.codigo_cliente,
            'cliente': item[0].nombre, 
            'num_doc': global.num_doc
        };

        console.log(data);

        fetch('https://api.progresarcorp.com.py/api/solicitud-debito',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(resp => resp.json())
        .then(data => {
            this.setState({AumentoLoad: false});
            if (data == 'success'){
                Toast.show({
                    type: 'success',
                    text1: 'Éxito',
                    text2: 'Su solicitud a sido enviada ✅'
                });
            }else{
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'En este momento no podemos enviar su solicitud'
                });
            }
        })
    }

    //enviar canje de puntos
    envCanje(monto, total){
        
        this.setState({showCanje: false, AumentoLoad: true});

        console.log(monto, total);

        var data = {
            'valid': global.valid_api_key,
            'montocanje': monto,
            'puntos_total': total,
            'num_tc': this.state.nro_tc,
            'cod_cliente': global.codigo_cliente,
            'cliente': global.nombre, 
            'num_doc': global.num_doc
        };

        console.log(data);

        fetch('https://api.progresarcorp.com.py/api/solicitudCanje',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(resp => resp.json())
        .then(data => {
            this.setState({AumentoLoad: false});
            if (data == 'success'){
                Toast.show({
                    type: 'success',
                    text1: 'Éxito',
                    text2: 'Su solicitud a sido enviada ✅'
                });
            }else{
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'En este momento no podemos enviar su solicitud'
                });
            }
        })
    }

    render() {
        const { codtar, loadingTC, clientetar, vencimiento, detalles, ShowInfo, modalOptions, ShowAumento, AumentoLoad, ShowDebito, puntos_total, puntos_mes, puntos_ant, puntos_usados, showCanje, montoCanje, clase_tc, deuda_periodo} = this.state


        const detTC = () => {
            if (codtar != null) {
                return (
                    <ClienteTar />
                )
            }
            else {
                return (
                    <Text style= {{textAlign: 'center', marginTop: 15}}> No encontramos ningún dato</Text>
                )
            }
        }

        const cargando = () => {
            return (
                <View style={[{justifyContent: 'center', alignItems: 'center', alignContent: 'center', flex: 1}, {backgroundColor: 'rgba(255,255,255, 0.9)'}]}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={AumentoLoad}
                    >
                        <View style={[{justifyContent: 'center', alignItems: 'center', alignContent: 'center', flex: 1}, {backgroundColor: 'rgba(255,255,255, 0.9)'}]}>
                            <ActivityIndicator size="large" color="#bf0404" />
                            <Text style={{color: 'black'}}>Cargando...</Text>
                        </View>
        
                    </Modal>
                </View>
            )
        }

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

        const comprobarEspecial = (value) => {
            if (value == 0) {
                return null
            } else {
                return (
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.textDeta}>Línea Especial:</Text>
                        <Text style={[styles.textDeta, styles.colorGreen]} >{currencyFormat(value)}</Text>
                    </View>
                );
            }
        }

        const comprobarDeudaEspecial = (value, deuda) => {
            if (value == 0) {
                return null
            } else {
                return (
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.textDeta}>Deuda Especial: </Text>
                        <Text style={[styles.textDeta, styles.colorRed]}>{currencyFormat(deuda)}</Text>
                    </View>
                );
            }
        }

        const comprobarTCBloqueado = (value) => {
            if (value == 'A') {
                return (
                    <Text style={{ fontSize: 12, backgroundColor: '#ff0000', color: 'white', padding: 5, borderRadius: 5, marginTop: 5 }}>
                        BLOQUEO ADMINISTRATIVO
                    </Text>
                );
            }
            if (value == 'U') {
                return (
                    <Text style={{ fontSize: 12, backgroundColor: '#ff0000', color: 'white', padding: 5, borderRadius: 5, marginTop: 5 }}>
                        BLOQUEADO POR EL USUARIO
                    </Text>
                );
            }
        }

        const comprobarTC = (value, item) => {

            if(value == codtar){
                return (
                    
                    <View
                        style={{  width: '100%' }}
                    >
                        <Image
                            style={styles.cardImage}
                            source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/05/Tarjetas.png' }}
                            resizeMode="cover"
                            />
                       <View style={styles.card}>
                        <Text style={styles.cardTitle}>Tarjeta: **** {item.nro_tarjeta_4}</Text>
                        <Text style={styles.subText}>Tipo: {item.tipo_tarjeta}</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Línea Normal:</Text>
                            <Text style={styles.green}>
                                {this.state.saldoTC
                                    ? currencyFormat(this.state.saldoTC.linea_de_credito)
                                    : currencyFormat(item.linea_normal)}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Disponible:</Text>
                            <Text style={styles.green}>
                                {this.state.saldoTC
                                    ? currencyFormat(this.state.saldoTC.disponible_contado)
                                    : currencyFormat(item.linea_normal - item.deuda_normal)}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Días de Mora:</Text>
                            <Text style={styles.orange}>{item.dias_mora}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Saldo en Mora:</Text>
                            <Text style={styles.red}>
                                {this.state.saldoTC
                                    ? currencyFormat(this.state.saldoTC.saldo_en_mora)
                                    : currencyFormat(item.saldo_mora)}
                            </Text>
                        </View>
                           {/* Footer visual para vencimiento */}
                        <View style={styles.footer}>
                        <Text style={styles.footerLabel}>Próximo Vencimiento:</Text>
                        <Text style={styles.footerValue}>{vencimiento}</Text>
                        </View>
                           {/* Footer visual para vencimiento */}
                        <View style={styles.footer}>
                        </View>

                       {/* Botones lado a lado */}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 10 }}>
                        <TouchableOpacity
                            onPress={() => this.gotoScreen('Movimientos TC', codtar)}
                            style={{
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            backgroundColor: '#bf0404',
                            borderRadius: 8,
                            flex: 1,
                            marginRight: 5
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Ver Movimientos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.setState({ modalOptions: true })}
                            style={{
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            backgroundColor: '#9c9c9c',
                            borderRadius: 8,
                            flex: 1,
                            marginLeft: 5
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Más opciones</Text>
                        </TouchableOpacity>
                        </View>

                    </View>
                        <View>{comprobarTCBloqueado(item.adm_usu)}</View>
                    </View>
                );
            }
            else{
                return null
            }
        }

        const ClienteTar = () => {
            if (clientetar != '') {
                return (
                    <View style={{width: '100%'}}>
                        <FlatList
                            data={clientetar}
                            snapToInterval={190}
                            showsHorizontalScrollIndicator={false}
                            decelerationRate={0}
                            keyExtractor={(item) => item.cod_tarjeta}
                            renderItem={({ item, index }) => {
                                return (
                                    <View>{comprobarTC(item.cod_tarjeta, item)}</View>
                                )
                            }
                            }
                        />
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

        //Modal de opciones 
        const options = () => {

            return(
                <View style={styles.centeredView}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={modalOptions}
                    >
                        <View style={[styles.centeredView, {backgroundColor: 'rgba(255,255,255, 0.9)'}]}>
                            <View style={styles.centeredView}>
                                <View style= {styles.modalView}>
                                    
                                    <View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={{width: '90%'}}>
                                                <Text style={styles.textTile}>Opciones</Text>
                                            </View>
                                            <View style={{width: '10%'}}>
                                                <TouchableOpacity
                                                    style={{padding: 10}}
                                                    onPress={ () => this.setState({modalOptions: false}) }
                                                >
                                                    <Icon name='times' size={15} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Divider style={{marginBottom: 10}} />
                                    </View>

                                    <View style={styles.box3}>
                                        <TouchableOpacity
                                            onPress={() => {Linking.openURL('tel:+595214167777');}}
                                            style={{padding: 10, width: '100%', backgroundColor: '#bf0404', borderRadius:5, marginBottom:10}}
                                        >
                                            <Text style={{color: 'white', textAlign: 'center'}}>Solicitud de Bloqueo Preventivo</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.box3}>
                                        <TouchableOpacity
                                            onPress={() => this.setState({modalOptions: false, ShowInfo: true})}
                                            style={{padding: 10, width: '100%', backgroundColor: '#bf0404', borderRadius:5, marginBottom:10}}
                                        >
                                            <Text style={{color: 'white', textAlign: 'center'}}>Solicitud de Regrabación</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.box3}>
                                        <TouchableOpacity
                                            onPress={() => this.setState({modalOptions: false, ShowAumento: true})}
                                            style={{padding: 10, width: '100%', backgroundColor: '#bf0404', borderRadius:5, marginBottom:10}}
                                        >
                                            <Text style={{color: 'white', textAlign: 'center'}}>Solicitud de Aumento de Línea</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.box3}>
                                        <TouchableOpacity
                                            onPress={() => this.setState({modalOptions: false, ShowDebito: true})}
                                            style={{padding: 10, width: '100%', backgroundColor: '#bf0404', borderRadius:5, marginBottom:10}}
                                        >
                                            <Text style={{color: 'white', textAlign: 'center'}}>Débito de Servicios Públicos</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            );
        }
        
        //dropdown del formulario de regrabacion
        const DropFormRegrab = () => {
            //para el tipo de regrabacion
            const [openTipo, setOpenTipo] = useState(false);
            const [tipo, setTipo] = useState(null);
            const [itemsTipo, setItemsTipo] = useState([
                {'value': '01', 'label': 'Regrabación de TC'},
                {'value': '02', 'label': 'Regrabación de PIN'}
            ]);

            //para el motivo de la regrabacion
            const [openMotivo, setOpenMotivo] = useState(false);
            const [motivo, setMotivo] = useState(null);
            const [itemsMotivo, setItemsMotivo] = useState([
                {'value': '01', 'label': 'Pérdida o Robo'},
                {'value': '02', 'label': 'Rotura'},
                {'value': '03', 'label': 'Reimpresión Fuera de Fecha'}
            ]);

            const comprobValue = (val) => {
                if(val == '01'){
                    return(
                        <Text>Por favor, haga su denuncia para agilizar el proceso</Text>
                    )
                }
            }
            
            return (
                <View style={{width: '100%'}}>
                    <View style={{marginBottom: 15}}>
                        <Text style={[styles.modalText, {fontWeight: 'bold'}]}>Tipo</Text>
                        <DropDownPicker
                            open={openTipo}
                            value={tipo}
                            items={itemsTipo}
                            setOpen={setOpenTipo}
                            setValue={setTipo}
                            setItems={setItemsTipo}
                            language="ES"
                            style={{
                                borderColor: "#bf0404"
                            }}
                            translation={{
                                PLACEHOLDER: "-- seleccione una opción --"
                            }}
                            dropDownContainerStyle={{
                                borderColor: "#bf0404",
                                zIndex: 2, // works on ios
                                elevation: 2, // works on android
                            }}
                        />
                    </View>

                    {tipo == '02' ? null : 
                    <View style={{marginBottom: 15}}>
                        <Text style={[styles.modalText, {fontWeight: 'bold'}]}>Motivo</Text>
                        <DropDownPicker
                            open={openMotivo}
                            value={motivo}
                            items={itemsMotivo}
                            setOpen={setOpenMotivo}
                            setValue={setMotivo}
                            setItems={setItemsMotivo}
                            language="ES"
                            style={{
                                borderColor: "#bf0404",
                                zIndex: 1, // works on ios
                                elevation: 1, // works on android
                            }}
                            translation={{
                                PLACEHOLDER: "-- seleccione una opción --"
                            }}
                            dropDownContainerStyle={{
                                borderColor: "#bf0404",
                                zIndex: 1, // works on ios
                                elevation: 1, // works on android
                            }}
                        />
                        {comprobValue(motivo)}
                    </View>}

                    <View style={styles.contButon}>
                        <View style={{alignItems: 'center', width: '100%', padding: 5}}>

                            {tipo == null || motivo == null && tipo != '02' ? 
                                <TouchableOpacity 
                                    onPress={()=> Alert.alert('Atención', 'Debe completar todos los datos solicitados')}
                                    style={[styles.buton, {backgroundColor: '#bf0404', borderColor: '#bf0404'}]}
                                >
                                    <Text style={{textAlign: 'center', color: 'white'}}>Enviar</Text>
                                </TouchableOpacity> 
                            : 
                                <TouchableOpacity 
                                    onPress={()=> Alert.alert('Aviso', 'Las regrabaciones tienen un costo adicional que se aplicará en su extracto. \n\n¿Desea continuar?', [
                                        { text: "Cancelar", onPress: () => null, style: "cancel"},
                                        { text: "Continuar", onPress: () => this.envRegrabacion(clientetar, tipo, motivo)}
                                    ])
                                    }
                                    style={[styles.buton, {backgroundColor: '#bf0404', borderColor: '#bf0404'}]}
                                >
                                    <Text style={{textAlign: 'center', color: 'white'}}>Enviar</Text>
                                </TouchableOpacity>
                            }

                        </View>
                    </View>
                </View>
            );
        }

        const modalRegrab = () => {

            return(
                <View style={styles.centeredView}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={ShowInfo}
                    >
                        <View style={[styles.centeredView, {backgroundColor: 'rgba(255,255,255, 0.9)'}]}>
                            <View style={styles.centeredView}>
                                <View style= {styles.modalView}>
                                    <View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={{width: '90%'}}>
                                                <Text style={styles.textTile}>Solicitud de Regrabación</Text>
                                            </View>
                                            <View style={{width: '10%', padding: 10}}>
                                                <TouchableOpacity
                                                    onPress={ () => this.setState({ShowInfo: false}) }
                                                >
                                                    <Icon name='times' size={15} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Divider style={{marginBottom: 10}} />
                                    </View>
                                    
                                    <DropFormRegrab />

                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            );
        }

        //modal para aumento de linea
        const InputModalAumento = () => {
            const [monto, setMonto] = useState(0);

            const botEnv = () => {
                if(monto > 0 && monto > clientetar[0].linea_normal){
                    return(
                        <View style={styles.contButon}>
                            <View style={{alignItems: 'center', width: '100%', padding: 5}}>
                                <TouchableOpacity 
                                    onPress={()=> this.envAumento(monto, clientetar)}
                                    style={[styles.buton, {backgroundColor: '#bf0404', borderColor: '#bf0404'}]}
                                >
                                    <Text style={{textAlign: 'center', color: 'white'}}>Enviar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }else{
                    return(
                        <View style={styles.contButon}>
                            <View style={{alignItems: 'center', width: '100%', padding: 5}}>
                                <TouchableOpacity 
                                    onPress={()=> Alert.alert('Atención', 'El monto debe ser mayor a su línea actual')}
                                    style={[styles.buton, {backgroundColor: '#bf0404', borderColor: '#bf0404'}]}
                                >
                                    <Text style={{textAlign: 'center', color: 'white'}}>Enviar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
            }

            return (
                <View>
                    <View>
                        {/* Input del ci - user */ }
                        <Text style={styles.loginText}>Monto solicitado</Text>
                        <TextInput
                            value={monto}
                            style={styles.input}
                            inputStyle={styles.inputStyle}
                            placeholderStyle={styles.placeholderStyle}
                            textErrorStyle={styles.textErrorStyle}
                            keyboardType="numeric"
                            numeric
                            selectionColor='rgba(156, 156, 156, 0.7)'
                            onChangeText={
                                text => setMonto(text)
                            }
                            showIcon={true}
                        />
                    </View>

                    {botEnv()}
                </View>
            )
            
        }

        const modalAumento = () => {
            return(
                <View style={styles.centeredView}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={ShowAumento}
                    >
                        <View style={[styles.centeredView, {backgroundColor: 'rgba(255,255,255, 0.9)'}]}>
                            <View style={styles.centeredView}>
                                <View style= {styles.modalView}>
                                    <View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={{width: '90%'}}>
                                                <Text style={styles.textTile}>Solicitud de Aumento de Línea</Text>
                                            </View>
                                            <View style={{width: '10%', padding: 10}}>
                                                <TouchableOpacity
                                                    onPress={ () => this.setState({ShowAumento: false}) }
                                                >
                                                    <Icon name='times' size={15} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Divider style={{marginBottom: 10}} />
                                    </View>
                                    
                                    <InputModalAumento />

                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            );
        }

        const SelectDebito = () => {
            const [detalle, setDetalle] = useState('');

            const [openServicio, setOpenServicio] = useState(false);
            const [servicio, setServicio] = useState('');
            const [itemsServicio, setItemsServicio] = useState([
                {'value': 'ANDE', 'label': 'ANDE'},
                {'value': 'COPACO', 'label': 'COPACO'},
                {'value': 'ESSAP', 'label': 'ESSAP'},
                {'value': 'CENADE', 'label': 'CENADE'},
                {'value': 'LAZOS', 'label': 'Lazos del Sur'}
            ]);

            const comprobServicio = (servicio) => {
                var titulo = '';
                var isNumeric = false;
                var keyBoard = 'default';

                if(servicio == 'ANDE' || servicio == 'ESSAP' || servicio == 'COPACO'){
                    isNumeric = false;
                    keyBoard = 'default';
                }else{
                    isNumeric = true;
                    keyBoard = 'numeric';
                }
                
                switch (servicio) {
                    case 'ANDE':
                        titulo = 'NIS:';
                        break;
                    case 'COPACO':
                        titulo = 'N° de Teléfono:';
                        break;
                    case 'ESSAP':
                        titulo = 'ISSAN:';
                        break;
                    case 'LAZOS':
                    case 'CENADE':
                        titulo = 'Monto mensual:';
                        break;
                }

                if(servicio != ''){
                    return(
                        <View style={{marginTop: 15}}>
                            <Text style={[styles.modalText, {fontWeight: 'bold'}]}>{titulo}</Text>
                            <TextInput
                                value={detalle}
                                style={styles.input}
                                inputStyle={styles.inputStyle}
                                placeholderStyle={styles.placeholderStyle}
                                numeric={isNumeric}
                                keyboardType={keyBoard}
                                textErrorStyle={styles.textErrorStyle}
                                selectionColor='rgba(156, 156, 156, 0.7)'
                                onChangeText={
                                    text => setDetalle(text)
                                }
                                showIcon={true}
                            />
                        </View>
                    )
                }
            }

            const validateButon = () => {
                if(servicio != 'CENADE' && servicio != 'LAZOS'){
                    if(detalle == ''){
                        return(
                            <View style={styles.contButon}>
                                <View style={{alignItems: 'center', width: '100%', padding: 5}}>
                                    <TouchableOpacity 
                                        onPress={()=> Alert.alert('Atención', 'Debe completar todos los campos solicitados')}
                                        style={[styles.buton, {backgroundColor: '#bf0404', borderColor: '#bf0404'}]}
                                    >
                                        <Text style={{textAlign: 'center', color: 'white'}}>Enviar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    }else{
                        return(
                            <View style={styles.contButon}>
                                <View style={{alignItems: 'center', width: '100%', padding: 5}}>
                                    <TouchableOpacity 
                                        onPress={()=> this.envDebito(servicio, detalle, clientetar)}
                                        style={[styles.buton, {backgroundColor: '#bf0404', borderColor: '#bf0404'}]}
                                    >
                                        <Text style={{textAlign: 'center', color: 'white'}}>Enviar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    }
                }else{
                    if(detalle >= 10000){
                        return(
                            <View style={styles.contButon}>
                                <View style={{alignItems: 'center', width: '100%', padding: 5}}>
                                    <TouchableOpacity 
                                        onPress={()=> this.envDebito(servicio, detalle, clientetar)}
                                        style={[styles.buton, {backgroundColor: '#bf0404', borderColor: '#bf0404'}]}
                                    >
                                        <Text style={{textAlign: 'center', color: 'white'}}>Enviar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    }else{
                        return(
                            <View style={styles.contButon}>
                                <View style={{alignItems: 'center', width: '100%', padding: 5}}>
                                    <TouchableOpacity 
                                        onPress={()=> Alert.alert('Atención', 'El monto debe ser mayor a 10.000 gs')}
                                        style={[styles.buton, {backgroundColor: '#bf0404', borderColor: '#bf0404'}]}
                                    >
                                        <Text style={{textAlign: 'center', color: 'white'}}>Enviar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    }
                }
            }

            return(
                <View style={{marginBottom: 15}}>
                        <Text style={[styles.modalText, {fontWeight: 'bold'}]}>Servicio</Text>
                        <DropDownPicker
                            open={openServicio}
                            value={servicio}
                            items={itemsServicio}
                            setOpen={setOpenServicio}
                            setValue={setServicio}
                            setItems={setItemsServicio}
                            language="ES"
                            style={{
                                borderColor: "#bf0404",
                                zIndex: 1, // works on ios
                                elevation: 1, // works on android
                            }}
                            translation={{
                                PLACEHOLDER: "-- seleccione una opción --"
                            }}
                            dropDownContainerStyle={{
                                borderColor: "#bf0404",
                                zIndex: 1, // works on ios
                                elevation: 1, // works on android
                            }}
                        />

                        {comprobServicio(servicio)}
                        {validateButon()}
                    </View>
            )
        }

        const modalDebito = () => {
            return(
                <View style={styles.centeredView}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={ShowDebito}
                    >
                        <View style={[styles.centeredView, {backgroundColor: 'rgba(255,255,255, 0.9)'}]}>
                            <View style={styles.centeredView}>
                                <View style= {styles.modalView}>
                                    <View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={{width: '90%'}}>
                                                <Text style={styles.textTile}>Solicitud de Débito Automático de Servicios Públicos</Text>
                                            </View>
                                            <View style={{width: '10%', padding: 10}}>
                                                <TouchableOpacity
                                                    onPress={ () => this.setState({ShowDebito: false}) }
                                                >
                                                    <Icon name='times' size={15} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Divider style={{marginBottom: 10}} />
                                    </View>
                                    
                                    <SelectDebito />

                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            );
        }

        const InputModalCanje = () => {
            const [montoCanje, setMontoCanje] = useState(0);

            const botEnvCanje = () => {
                if(montoCanje > 0 && montoCanje <= puntos_total){
                    return(
                        <View style={styles.contButon}>
                            <View style={{alignItems: 'center', width: '100%', padding: 5}}>
                                <TouchableOpacity 
                                    onPress={()=> this.envCanje(montoCanje, puntos_total)}
                                    style={[styles.buton, {backgroundColor: '#bf0404', borderColor: '#bf0404'}]}
                                >
                                    <Text style={{textAlign: 'center', color: 'white'}}>Enviar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }else{
                    return(
                        <View style={styles.contButon}>
                            <View style={{alignItems: 'center', width: '100%', padding: 5}}>
                                <TouchableOpacity 
                                    onPress={()=> Alert.alert('Atención', 'El monto a canjear no puede superar su total de puntos actual')}
                                    style={[styles.buton, {backgroundColor: '#bf0404', borderColor: '#bf0404'}]}
                                >
                                    <Text style={{textAlign: 'center', color: 'white'}}>Enviar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
            }

            return (
                <View>
                    <View>
                        {/* Input del ci - user */ }
                        <Text style={styles.loginText}>Puntos Canje</Text>
                        <TextInput
                            value={montoCanje}
                            style={styles.input}
                            inputStyle={styles.inputStyle}
                            placeholderStyle={styles.placeholderStyle}
                            textErrorStyle={styles.textErrorStyle}
                            keyboardType="numeric"
                            numeric
                            selectionColor='rgba(156, 156, 156, 0.7)'
                            onChangeText={
                                text => setMontoCanje(text)
                            }
                            showIcon={true}
                        />
                        {montoCanje > 0 ? <Text style={{color: '#9c9c9c'}}>Equivalentes a: {currencyFormat(montoCanje*50)} gs</Text> : null}
                        <Text style={{color: '#9c9c9c'}}>Total de puntos actual: {puntos_total}</Text>
                    </View>

                    {botEnvCanje()}
                </View>
            )
            
        }

        const modalCanje = () => {
            return(
                <View style={styles.centeredView}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={showCanje}
                    >
                        <View style={[styles.centeredView, {backgroundColor: 'rgba(255,255,255, 0.9)'}]}>
                            <View style={styles.centeredView}>
                                <View style= {styles.modalView}>
                                    <View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={{width: '90%'}}>
                                                <Text style={styles.textTile}>Solicitud de Canje de Puntos</Text>
                                            </View>
                                            <View style={{width: '10%', padding: 10}}>
                                                <TouchableOpacity
                                                    onPress={ () => this.setState({showCanje: false}) }
                                                >
                                                    <Icon name='times' size={15} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Divider style={{marginBottom: 10}} />
                                    </View>
                                    
                                    <InputModalCanje />

                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            );
        }

        return (
            <SafeAreaView style={styles.box1}>
                <View style={{marginBottom: 20 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.box2}>
                          
                            {detTC()}

                            {puntos_total > 0 ? 
                                <View
                                   style={{  width: '100%' }}
                                >
                                <Image
                                    style={styles.cardImage}
                                    source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/05/progrepuntos.png' }}
                                    resizeMode="cover"
                                />

                                   <View style={styles.pointsCard}>
                                    <Text style={styles.cardTitle}>Resumen de Puntos</Text>

                                    <View style={styles.row}>
                                        <Text style={styles.label}>Puntos Anteriores:</Text>
                                        <Text style={styles.value}>{puntos_ant}</Text>
                                    </View>

                                    <View style={styles.row}>
                                        <Text style={styles.label}>Puntos del Mes:</Text>
                                        <Text style={styles.value}>{puntos_mes}</Text>
                                    </View>

                                    <View style={styles.row}>
                                        <Text style={styles.label}>Puntos Usados:</Text>
                                        <Text style={styles.value}>{puntos_usados}</Text>
                                    </View>

                                    <View style={styles.row}>
                                        <Text style={styles.label}>Total Puntos:</Text>
                                        <Text style={styles.value}>{puntos_total}</Text>
                                    </View>

                                   <View style={styles.footer}>
                                        <Text style={styles.footerLabel}>Equivalentes a:</Text>
                                        <Text style={[styles.value, styles.green]}>{currencyFormat(puntos_total * 50)} Gs</Text>
                                    </View>
                                     {/* Footer visual para canje de puntos */}
                                    <View style={[styles.footer, { alignItems: 'center', marginTop: 10 }]}>
                                    <View style={{ width: '100%', alignItems: 'center' }}>
                                        <TouchableOpacity
                                        onPress={() => this.setState({ showCanje: true })}
                                        style={{
                                            backgroundColor: '#bf0404',
                                            paddingVertical: 10,
                                            paddingHorizontal: 25,
                                            borderRadius: 8,
                                        }}
                                        >
                                        <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>
                                            Canjear puntos
                                        </Text>
                                        </TouchableOpacity>
                                    </View>
                                    </View>
                                    </View>
                                    {clase_tc == 'LE' ?
                                        <View style={{ flexDirection: 'row', marginBottom:5, marginTop: 10}}>
                                            <TouchableOpacity
                                                onPress={()=> {Linking.openURL('https://progresarcorp.com.py/canje-de-puntos-linalu');}}
                                                style={{backgroundColor: '#9c9c9c', width: '50%', padding:5, borderRadius: 5}}
                                            >
                                                <Text style={{textAlign: 'center', color: 'white'}}>Canje de puntos LINALU</Text>
                                            </TouchableOpacity>
                                        </View>
                                    : null }

                                </View>
                            : null}
                        </View>

                        {loadingTC ? 
                            null 
                        : 
                            <View>
                                <View style={styles.box2}>
                                   
                                </View>
                                {clientetar != '' ? 
                                    <View style={styles.box3}>
                                
                                    </View>
                                : null }
                            </View>
                        }

                        {modalRegrab()}
                        {options()}
                        {modalAumento()}
                        {modalDebito()}
                        {cargando()}
                        {modalCanje()}
                        <Toast />
                    </ScrollView>
                </View>
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
        padding: 5,
    },

    box3: {
        marginTop: 5,
        alignItems: 'center',
        alignContent: 'center',
        padding: 5,
        width: '100%'
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
        marginBottom: 5
    },

    textDetaTCImp:{
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

    centeredView:{
        justifyContent: 'center',
        flex: 1
    },
    modalView:{
        width: '95%',
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.85,
        elevation: 5
    },
    textTile:{
        color: 'black',
        textAlign: 'center',
        fontSize: 20,
        marginTop: 15,
        marginBottom: 15
    },
    okStyle:{
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
    },
    modalText:{
        fontSize: 14,
        shadowColor: 'white',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 5
    },

    contButon:{
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '100%', 
        marginBottom: 10, 
        marginTop: 15
    },

    contTouch:{
        alignItems: 'center', 
        width: '50%',
        padding: 5
    },

    buton:{
        width: '100%', 
        borderRadius: 5,
        borderColor: '#9c9c9c', 
        borderWidth: 1, 
        padding: 5, 
    }, 
    cardImage: {
  width: '100%',
  height: 150,
  borderRadius: 10,
},

    card: {
  backgroundColor: '#fff',
  padding: 15,
  marginVertical: 8,
  borderRadius: 10,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 3,
},
pointsCard: {
  backgroundColor: '#fff',
  padding: 12,
  marginTop: 10,
  marginBottom: 15,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},

cardTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 10,
  color: '#333',
},
footer: {
  borderTopWidth: 1,
  borderTopColor: '#eee',
  marginTop: 10,
  paddingTop: 8,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

footerLabel: {
  fontSize: 13,
  color: '#888',
  fontWeight: 'bold',
},

footerValue: {
  fontSize: 13,
  fontWeight: '600',
  color: '#444',
},
row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 6,
},

label: {
  fontSize: 14,
  color: '#555',
},

value: {
  fontSize: 14,
  fontWeight: '600',
  color: '#111',
},

green: {
  color: 'green',
},

cardTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 6,
},
row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: 2,
},
label: { color: '#555' },
green: { color: 'green', fontWeight: 'bold' },
red: { color: 'red', fontWeight: 'bold' },
orange: { color: 'orange', fontWeight: 'bold' },


    //estilos para los TextInput
    input: {
        height: 50,
        width: '100%',
        marginBottom: 10,
        marginTop: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        borderWidth: 0.8,
        borderColor: "#bf0404",
    },
    
    
    inputStyle: { fontSize: 14 },

    placeholderStyle: { fontSize: 14 },
    textErrorStyle: { fontSize: 14 },
    //termina el estilo del input
})