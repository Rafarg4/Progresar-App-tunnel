import React, { Component, useState,useEffect } from 'react';
import { 
    Text, 
    SafeAreaView, 
    View, 
    Alert, 
    ScrollView, 
    StyleSheet, 
    Dimensions, 
    Image, 
    FlatList, 
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ImageBackground,
    Modal,
    Platform
} from 'react-native';
import * as global from '../global.js'
import BotFoo from '../components/BotonesFoo';
import * as WebBrowser from 'expo-web-browser';
import {Collapse, CollapseHeader, CollapseBody} from 'accordion-collapse-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getToken } from '../recursos/Notificaciones.js';
import { useNavigation } from '@react-navigation/native';
import userCards from "../recursos/Vpos.js";
import { Divider } from 'react-native-paper';

var md5 = require('md5');

const width = Dimensions.get("window").width;
const CONTENEDOR = width;

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            url: 'https://api.progresarcorp.com.py/api/ConsultarTC',
            valid: global.valid_api_key,

            nombre: global.nombre,
            num_doc: global.num_doc,
            num_usu: global.num_usuario,
            cod_cliente: '',
            clientetar: [],
            vencimiento: '',
            clientefinanciero: [],
            clienteElectro : [],
            clienteSeguro: [],
            user_perfil: global.user_perfil,
            loadingTC: false,
            loadingF: false,
            loading: false,
            saludo: 'Bienvenido',
            imageSal: '',
            suma_e:'',
            suma_f: '',
            ShowInfo: false,
            monto:0,
            cardsUser:[],
            valorCard: null,
            sector: '',
            listaPromo: []
        }
    }
    
    componentDidMount() {
        this.cargarTC();
        this.cargarFinanciero();
        this.cargarElectro();
        this.cargarSeguros();
        setTimeout(() => {
            //this.userCard();
            userCards();
        }, 5000, this);
        this.mostrarSaludo();
        this.mostrarPromos();
        this.verifyEmail();
        
        fetch('https://api.progresarcorp.com.py/api/getImageTC')
        .then(response => response.json())
        .then(data => {
            global.listaTcImage = data
        })
    }
    //Se verifica si es qr para mandar los parametros el otro es para los prestamos y TC
    gotoScreen = (screenName, item = null, saldo = null, monto = null, cuota = null) => {
        if (screenName === 'Qr') {
          this.props.navigation.navigate(screenName, { 
            num_doc: item, // número de documento lo otro no es nesesario
            saldo: saldo,
            monto: monto,
            cuota: cuota
          });
          //Pasamos el nro de cedula por la ruta jeje
         }else if (screenName === 'AtmQr') {
            this.props.navigation.navigate(screenName, { 
              num_doc: item, // número de documento lo otro no es nesesario
              saldo: saldo,
              monto: monto,
              cuota: cuota
            });
        } else {
          // Lógica para otras pantallas si es necesario
          if (item === null) {
            this.props.navigation.navigate(screenName);
          } else {
            this.props.navigation.navigate(screenName, {
              data: item,
              saldo: saldo,
              monto: monto,
              cuota: cuota
            });
          }
        }
      };
    
    //ver datos de la TC del cliente
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
                    user_perfil: data.cliente[0].user_perfil,
                    loadingTC: false
                })
                global.primer_ingreso = data.cliente[0].prim_ingreso;
                global.user_city = data.cliente[0].ciudad;
                global.user_dir = data.cliente[0].direccion;
                global.user_phone = data.cliente[0].telefono;
                global.user_perfil = data.cliente[0].user_perfil;
                global.user_tc = data.clientetar;
                global.email_verified = data.email_verify;
                if(global.primer_ingreso == '1'){
                    Alert.alert('¡Bienvenido!', 'Para continuar por favor cambie su contraseña de acceso',
                        [
                            { text: "Cambiar Contraseña", onPress: () => this.gotoScreen('Usuario') }
                        ]
                    );
                }
                if(global.primer_ingreso == '3'){
                    Alert.alert('¡Atención!', 'Detectamos que su contraseña de acceso es muy débil, por favor cámbiela',
                        [
                            { text: "Cambiar Contraseña", onPress: () => this.gotoScreen('Usuario') }
                        ]
                    );
                }
            })
            .catch((error) => {
                this.setState({
                    loadingTC: false
                })
                Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPor favor, inténtelo más tarde')
            })
    };

    verificarEmail(routeName, nombre, dominio, mail){
        this.props.navigation.navigate(routeName,{
            name: nombre,
            domine: dominio,
            email: mail
        })
    }

    verifyEmail(){
        var data = {
            valid: this.state.valid,
            num_doc: this.state.num_doc,
            cod_cliente: global.codigo_cliente
        };
    
        fetch('https://api.progresarcorp.com.py/api/email-verified', {
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {       
            if(data.emailVerify == null){
                this.verificarEmail('Verificar Email', data.nombre, data.dominio, data.email);
            }else{
                global.user_mail=data.email;
            }

        })
    }

    //ver saldos de electro
    cargarElectro() {
        this.setState({ loadingTC: true })

        var data = {
            valid: this.state.valid,
            num_doc: this.state.num_doc,
        };

        fetch('https://api.progresarcorp.com.py/api/ConsultarElectro',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            this.setState({
                suma_e: data.suma,
                clienteElectro: data.saldos,
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

    //cargar seguros
    cargarSeguros() {
        this.setState({ loadingTC: true })

        var data = {
            valid: this.state.valid,
            num_doc: this.state.num_doc,
        };

        fetch('https://api.progresarcorp.com.py/api/ConsultarSeguros',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            this.setState({
                clienteSeguro: data,
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

    //ver saldos fiancieros del cliente
    cargarFinanciero() {
        this.setState({ loadingF: true })
        var data = {
            valid: this.state.valid,
            num_doc: this.state.num_doc,
        };

        fetch('https://api.progresarcorp.com.py/api/ConsultarUser',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                this.setState({
                    suma_f: data.suma_f,
                    clientefinanciero: data.financiero,
                    cod_cliente: data.cod_cliente,
                    loadingF: false
                })
                global.codigo_cliente= data.cod_cliente;
                global.user_mail=data.email;

                getToken();
            })
            .catch((error) => {
                this.setState({
                    loadingF: false
                })
                Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPor favor, inténtelo más tarde')
            })
    };

    //cargar seguros
    mostrarPromos() {

        fetch('https://api.progresarcorp.com.py/api/promos-app')
        .then(response => response.json())
        .then(data => {
            this.setState({
                listaPromo: data,
            })
        })
        .catch((error) => {
            Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPor favor, inténtelo más tarde')
        })
    };

    mostrarSaludo(){

        var fecha = new Date(); 
        var hora = fecha.getHours();
        var texto = '';
        var imageSaludo='';
        var styleBox= '';

        if(hora >= 0 && hora < 4){
            texto = "Buenas noches";
            imageSaludo= 'noche.webp'
            styleBox= {
                width: '110%',
                padding: 5,
                borderRadius: 5,
                backgroundColor: 'rgba(0,0,0,0.3)'
            }
        }
        
        if(hora >= 4 && hora < 12){
            texto = "Buenos días";
            imageSaludo= 'mañana.webp'
            styleBox= {
                width: '110%',
                padding: 5,
                borderRadius: 5,
                backgroundColor: 'rgba(0,0,0,0.3)'
            }
        }

        if(hora >= 12 && hora < 18){
            texto = "Buenas tardes";
            imageSaludo= 'tarde.webp'
            styleBox= {
                width: '110%',
                padding: 5,
                borderRadius: 5,
                backgroundColor: 'rgba(0,0,0,0.3)'
            }
        }

        if(hora >= 18 && hora < 24){
            texto = "Buenas noches";
            imageSaludo= 'noche.webp'
            styleBox= {
                width: '110%',
                padding: 5,
                borderRadius: 5,
            }

        }

        this.setState({saludo: texto, imageSal: imageSaludo, estiloBoxTex: styleBox})
    }

    /*userCard(){
        var data={
            public_key: global.public_key_vpos,
            operation: {
                token: md5(global.private_key_vpos+global.codigo_cliente+'request_user_cards'),
            }
        }
    
        fetch(global.url_environment_vpos+'/vpos/api/0.3/users/'+global.codigo_cliente+'/cards',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.status=='success'){
                if(data.cards == ''){
                    this.setState({
                        cardsUser: 0,
                    })
                }else{
                    //console.log(data.cards)
                    this.setState({
                        cardsUser: data.cards,
                    })

                    var i = 0;
                    for(i = 0; i < data.cards.length; i++){
                        global.cards.push({'value': data.cards[i].alias_token, 'label': data.cards[i].card_masked_number+' - '+data.cards[i].card_brand})
                        if(data.cards[i].card_type === 'debit'){
                            //aqui debe ir el this.statecard.push
                        }
                    }
                }
            }else{
                Alert.alert('Error', 'La respuesta del proveedor es: \n'+data.messages[0].dsc)
            }
        })
        .catch((error) => {
            console.log(error)  ;
                Alert.alert('Error', 'No pudimos conectarnos con el proveedor del servicio. \nPor favor, inténtelo más tarde')
        })
    }*/

    changeMonto(montoRec){
        this.setState({monto: montoRec})
    }

    render() {
        const { 
            nombre, 
            clientetar, 
            clientefinanciero, 
            loadingTC, 
            loadingF, 
            clienteElectro, 
            clienteSeguro, 
            saludo,
            imageSal,
            suma_e,
            suma_f,
            ShowInfo,
            monto,
            cardsUser,
            loading,
            sector,
            listaPromo
        } = this.state;

        //comprobar si la TC posee línea Especial
        const comprobarEspecial = (value) => {
            if(value == 0){
                return null
            }else{
                return (
                    <Text style= {{fontSize: 12}}>
                        Línea Especial: {currencyFormat(value)}
                    </Text>
                );
            }
        }
        const TarjetaInfo = () => {
            const navigation = useNavigation();
            const [tarjetaData, setTarjetaData] = useState([]);
            const [saldos, setSaldos] = useState({}); // Estado para almacenar saldos por tarjeta
            const [error, setError] = useState(false);
        
            useEffect(() => {
                const num_doc = global.num_doc;
        
                // Primer API para obtener los datos de las tarjetas
                const urlTarjetas = `https://api.progresarcorp.com.py/api/ver_tarjeta/${num_doc}`;
                fetch(urlTarjetas)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Error de respuesta en ver_tarjeta');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        if (Array.isArray(data) && data.length > 0) {
                            setTarjetaData(data);
        
                            // Hacer la consulta de saldo para cada tarjeta
                            data.forEach((item) => {
                                const numeroTarjeta = item.nro_tarjeta;
                                const urlSaldo = `https://api.progresarcorp.com.py/api/obtener_saldo_actual/${numeroTarjeta}`;
                                
                                fetch(urlSaldo)
                                    .then((response) => {
                                        if (!response.ok) {
                                            throw new Error('Error de respuesta en obtener_saldo_actual');
                                        }
                                        return response.json();
                                    })
                                    .then((data) => {
                                        if (data.cuenta && data.cuenta.disponi_adelanto) {
                                            setSaldos((prevSaldos) => ({
                                                ...prevSaldos,
                                                [numeroTarjeta]: data.cuenta.disponi_adelanto, // Asociar saldo con el nro_tarjeta
                                            }));
                                        } else {
                                            setSaldos((prevSaldos) => ({
                                                ...prevSaldos,
                                                [numeroTarjeta]: 'No disponible', // Si no hay saldo disponible
                                            }));
                                        }
                                    })
                                    .catch((error) => {
                                        console.error('Error fetching saldo data:', error);
                                        setSaldos((prevSaldos) => ({
                                            ...prevSaldos,
                                            [numeroTarjeta]: 'Error al cargar saldo', // Manejo de error
                                        }));
                                    });
                            });
                        } else {
                            setError(true);
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching tarjeta data:', error);
                        setError(true);
                    });
            }, []);

            const enmascararTarjeta = (numero) => {
                if (numero.length <= 8) return numero;
                const masked = '*'.repeat(numero.length - 4) + numero.slice(-4);
                return masked.match(/.{1,4}/g).join(' ');
            };
            const [showSaldo, setShowSaldo] = useState(true)
            const renderItem = ({ item }) => (
                <TouchableOpacity
                    onPress={() => {
                        if (item.tipo_tarjeta === '1') {
                        navigation.navigate('DetaBepsa', {
                            nro_doc: item.nro_doc,
                            clase_tarjeta: item.clase_tarjeta,
                            nro_tarjeta: item.nro_tarjeta,
                        });
                        } else {
                        navigation.navigate('DetaProcard', {
                            nro_doc: item.nro_doc,
                            clase_tarjeta: item.clase_tarjeta,
                            nro_tarjeta: item.nro_tarjeta,
                        });
                        }
                    }}
                    >
                <View style={styles.card}>
                  <View style={styles.contentContainer}>
                    <View style={styles.infoContainer}>
                      <Text style={styles.tipoCuenta}>
                        {item.clase_tarjeta === 'JM' ? 'Clásica' :
                         item.clase_tarjeta === 'V6' ? 'Visa' :
                         item.clase_tarjeta === '1' ? 'Dinelco' :
                         item.clase_tarjeta === 'J7' ? 'Fep' :
                         item.clase_tarjeta === 'RM' ? 'Rotary' :
                         item.clase_tarjeta === 'EV' ? 'El viajero' :
                         item.clase_tarjeta === 'TS' ? 'Comedi' :
                         item.clase_tarjeta === 'JW' ? 'Mujer' :
                         item.clase_tarjeta === 'FR' ? 'Afuni' :
                         item.clase_tarjeta === 'J0' ? 'Empresarial' :
                         item.clase_tarjeta === 'EI' ? 'Visa Empresarial' :
                         item.clase_tarjeta === 'TR' ? 'La Trinidad' : item.clase_tarjeta}
                      </Text>
                      <Text style={styles.numeroCuenta}>{enmascararTarjeta(item.nro_tarjeta)}</Text>
                      <Text style={styles.nombre}>{item.nombre_usuario}</Text>
                    </View>
                    <View style={styles.iconContainer}>
                    <Icon name="credit-card" size={30} color="#FF0000" />
                    </View>
                  </View>
                  <View style={styles.footer1}>
                    <Text style={styles.saldoLabel}>Saldo disponible:</Text>
                    {/* Verifica si el tipo de tarjeta es '1' */}
                    {item.tipo_tarjeta === '1' ? ( // Para tarjetas de tipo '1'
                        <Text style={styles.saldo_dinelco}>
                        {showSaldo // Verifica si showSaldo es true o false
                            ? (item.limite_credito && item.deuda_total // Si existen limite_credito y deuda_total
                                ? `${currencyFormat(item.limite_credito - item.deuda_total)} Gs.` // Realiza la resta
                                : 'No disponible') // Si no hay valores para limite_credito o deuda_total
                            : '******' // Si showSaldo es false, muestra '******'
                        }
                        </Text>
                    ) : (
                        <Text style={styles.saldo}>
                        {showSaldo ? (
                          saldos[item.nro_tarjeta] === null || saldos[item.nro_tarjeta] === undefined ? ( // Verifica si el saldo es null o undefined
                            'Cargando...' // Muestra 'Cargando...' si el saldo es null o undefined
                          ) : (
                            `${currencyFormat(saldos[item.nro_tarjeta])} Gs.` // Muestra el saldo formateado
                          )
                        ) : (
                          '******' // Si showSaldo es false, muestra '******'
                        )}
                      </Text>                      
                    )}
                    </View>
                </View>
              </TouchableOpacity>
            );
            const handleRequestCard = () => {
              WebBrowser.openBrowserAsync('https://progresarcorp.com.py/solicitud-de-tarjeta/');
            };
            return (
              <View style={styles.containertitulo}>
                {/* Título y botón para mostrar/ocultar saldo */}
                <View style={styles.headerContainertitulo}>
                  <Text style={styles.headerTitletitulo}>Tarjetas</Text>
                  <TouchableOpacity onPress={() => setShowSaldo(!showSaldo)}>
                    <Icon name={showSaldo ? 'eye-slash' : 'eye'} size={20} color="black" />
                  </TouchableOpacity>
                </View>
                {error ? (
                  <View style={styles.card}>
                    <View style={styles.noDataContainer}>
                      <Icon name="info-circle" size={30} color="grey" style={styles.icon} />
                      <Text style={styles.noDataText}>¡Sin tarjetas disponibles!</Text>
                      <TouchableOpacity style={styles.requestButton} onPress={handleRequestCard}>
                        <Icon name="plus" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.requestButtonText}>Solicitar Tarjeta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <FlatList
                    data={tarjetaData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    pagingEnabled
                  />
                )}
              </View>
            );
          };
        //comprobar si la TC está bloqueada
        const comprobarTCBloqueado = (value) => {
            if(value == 'A'){
                return (
                    <Text style= {{fontSize: 12, backgroundColor: '#ff0000', color: 'white', padding: 5, borderRadius: 5, marginTop: 5}}>
                        BLOQUEO ADMINISTRATIVO
                    </Text>
                );
            }
            if(value == 'U'){
                return (
                    <Text style= {{fontSize: 12, backgroundColor: '#ff0000', color: 'white', padding: 5, borderRadius: 5, marginTop: 5}}>
                        BLOQUEADO POR EL USUARIO
                    </Text>
                );
            }
        }

        //verificar la TC
        const comprobarTC = (value, item) => {
            if(value == 0){
                return null
            }else{
                if(item.venc == 'V'){
                    return null
                }
                else{
                    if(item.inab == 'I'){
                        return null
                    }else{
                        if(item.tipo_tarjeta == 'ADICIONAL'){
                            return (
                                <TouchableOpacity 
                                    style= {{margin: 5, backgroundColor: 'white', padding: 5, borderRadius: 10}}
                                >
                                    <Image
                                        style={{ width: 170, height: 100, marginBottom: 5, alignItems: 'center' }}
                                        source= {(imageTC(item.clase_tarjeta))}
                                    />
                                    <Text style= {{fontSize: 12}}>Tipo TC: {item.tipo_tarjeta}</Text>
                                    <Text style= {{fontSize: 12}}>TC N°: **** **** **** {item.nro_tarjeta_4}</Text>
                                    <Text style= {{fontSize: 12}}>Línea Normal: {currencyFormat(item.linea_normal)}</Text>
                                    <View>{comprobarEspecial(item.linea_especial)}</View>
                                    <View>{comprobarTCBloqueado(item.adm_usu)}</View>
                                </TouchableOpacity>
                            );    
                        }else{
                            return (
                                <TouchableOpacity 
                                    onPress={() => this.gotoScreen('Detalle TC', item.cod_tarjeta)}
                                    style= {{margin: 5, backgroundColor: 'white', padding: 5, borderRadius: 10}}
                                >
                                    <Image
                                        style={{ width: 170, height: 100, marginBottom: 5, alignItems: 'center' }}
                                        source= {(imageTC(item.clase_tarjeta))}
                                    />
                                    <Text style= {{fontSize: 12}}>Tipo TC: {item.tipo_tarjeta}</Text>
                                    <Text style= {{fontSize: 12}}>TC N°: **** **** **** {item.nro_tarjeta_4}</Text>
                                    <Text style= {{fontSize: 12}}>Línea Normal: {currencyFormat(item.linea_normal)}</Text>
                                    <View>{comprobarEspecial(item.linea_especial)}</View>
                                    <View>{comprobarTCBloqueado(item.adm_usu)}</View>
                                </TouchableOpacity>
                            );
                        }
                    }
                }
            }
        }

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

        var Refreshing = false;
        const onRefresh = () => {
            Refreshing = true;
            this.componentDidMount();
            Refreshing = false;
        }
        
        //indicadores de carga
        const IndicadorF=()=>{
            if(loadingF == true){
                return(
                    <ActivityIndicator size= 'small' color='#fff' />
                )
            }
            return null
        }

        const IndicadorTC=()=>{
            if(loadingTC == true){
                return(
                    <ActivityIndicator size= 'small' color='#fff' />
                )
            }
            return null
        }

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

        //ver tarjetas
        const ClienteTar = () =>{
            if(clientetar != ''){
                return(
                    <FlatList 
                        data={clientetar}
                        horizontal= {true}
                        snapToInterval={190}
                        showsHorizontalScrollIndicator= {false}
                        decelerationRate={0}
                        keyExtractor={(item) => item.cod_tarjeta}
                        renderItem={({item, index}) =>{
                                return(
                                    <View>{comprobarTC(item.cod_tarjeta, item)}</View>              
                                )
                            }
                        }
                    />
                )
            }
            else{
                return(
                    <View style={{backgroundColor: 'white', padding: 5, borderRadius: 10, width: '100%', padding: 10, alignItems: 'center', alignContent: 'center'}}>
                        <Text>No posee ninguna Tarjeta</Text>
                    </View>
                )
            }
        }
        /*ver Pagos QR
        const PagoQr = () => {
            const navigation = useNavigation();
          
            return (
              <TouchableOpacity 
                onPress={() => navigation.navigate('DetaPagoQr')}
                style= {{alignContent: 'center', margin: 5, backgroundColor: 'white', padding: 5, borderRadius: 10}}
              >
                <Image 
                style={{ width: 170, height: 100, marginBottom: 6, alignItems: 'center' }}
                source={ require("../assets/tc-pagorq.png") }
                 />
                <Text style={styles.text}>Tipo TC: Clásica</Text>
                <Text style={styles.text}>Total pagado: 340.000 Gs</Text>
                <Text style={styles.text}>Total de pagos Qr: 20</Text>
              </TouchableOpacity>
            );
          };*/
        //ver los movimientos de ATM
        {/* const ATM = () =>{
            return(
                    <View style={{backgroundColor: 'white', padding: 5, borderRadius: 10, width: '100%', padding: 10, alignItems: 'center', alignContent: 'center'}}>
                        <Text>Proximamente...</Text>
                    </View>
                )
            }*/}
        
        //comprobar el saldo del prestamos
        const comprobarSaldoFinanciero = (value, item) => {
            if(value > 0){
                return (
                    <TouchableOpacity 
                        onPress={() => this.gotoScreen('DetaF', item.nro_comprobante, item.saldo_cuota, item.monto_cuota)}
                        style= {{alignContent: 'center', margin: 5, backgroundColor: 'white', padding: 5, borderRadius: 10}}
                    >
                        <Image 
                            style={{width: 170, height: 100, alignItems: 'center'}}
                            source={ require("../assets/recursos/financiero.jpg") }
                        />
                        <Text style= {{fontSize: 12}}>N° de operación: {item.nro_comprobante_ref}</Text>
                        <Text style= {{fontSize: 12}}>Fec. operación: {item.fec_origen}</Text>
                        <Text style= {{fontSize: 12}}>Total operación: {currencyFormat(item.monto_cuota)}</Text>
                        <Text style= {{fontSize: 12}}>Saldo: {currencyFormat(item.saldo_cuota)}</Text>

                    </TouchableOpacity>
                );
            }else{
                return null
            }
        }

        //ver prestamos
        const ClienteFin = () => {

            if(clientefinanciero != ''){
                if(suma_f==0){
                    return(
                        <View style={{backgroundColor: 'white', padding: 5, borderRadius: 10, width: '100%', padding: 10, alignItems: 'center', alignContent: 'center'}}>
                            <Text>No posee ningún saldo de Préstamo</Text>
                        </View>
                    )
                }else{
                    return(
                        <FlatList 
                            data={clientefinanciero}
                            horizontal= {true}
                            showsHorizontalScrollIndicator= {false}
                            snapToInterval={190}
                            decelerationRate={0}
                            scrollEventThrottle={15}
                            keyExtractor={(item) => item.nro_comprobante}
                            renderItem={({item, index}) =>{
                                    return(
                                        <View>
                                            {comprobarSaldoFinanciero(item.saldo_cuota, item)}
                                        </View>
                                    )
                                }
                            }
                        />
                    )
                }
            }
            else{
                return(
                    <View style={{backgroundColor: 'white', padding: 5, borderRadius: 10, width: '100%', padding: 10, alignItems: 'center', alignContent: 'center'}}>
                        <Text>No posee ningún Préstamo</Text>
                    </View>
                )
            }
        }

        //comprobar el saldo de la factura del electrodomestico
        const comprobarSaldoElectro = (value, item) => {
            if(value == 0){
                return null
            }else{
                return (
                    <TouchableOpacity 
                        onPress={() => this.gotoScreen('DetaE', item.nro_comprobante, item.saldo_cuota, item.monto_cuota, item.nro_cuota)}
                        style= {{alignContent: 'center', margin: 5, backgroundColor: 'white', padding: 5, borderRadius: 10}}
                    >
                        <Image 
                            style={{width: 170, height: 100, alignItems: 'center'}}
                            source={ require("../assets/recursos/electro_app.jpg") }
                        />
                        <Text style= {{fontSize: 12}}>N° Factura: {item.nro_comprobante}</Text>
                        <Text style= {{fontSize: 12}}>Fec. Factura: {item.fec_origen}</Text>
                        <Text style= {{fontSize: 12}}>Total Factura: {currencyFormat(item.monto_cuota)}</Text>
                        <Text style= {{fontSize: 12}}>Saldo: {currencyFormat(item.saldo_cuota)}</Text>

                    </TouchableOpacity>
                );
            }
        }

        //ver electrodomesticos
        const ClienteElectro = () => {
            
            if(clienteElectro != ''){
                if(suma_e==0){
                    return(
                        <View style={{backgroundColor: 'white', padding: 5, borderRadius: 10, width: '100%', padding: 10, alignItems: 'center', alignContent: 'center'}}>
                            <Text>No posee ningún saldo de Electrodomésticos</Text>
                        </View>
                    )
                }else{
                    return(
                        <FlatList 
                            data={clienteElectro}
                            horizontal= {true}
                            showsHorizontalScrollIndicator= {false}
                            snapToInterval={190}
                            decelerationRate={0}
                            scrollEventThrottle={15}
                            keyExtractor={(item) => item.nro_comprobante}
                            renderItem={({item, index}) =>{
                                    return(
                                        <View>
                                            {comprobarSaldoElectro(item.saldo_cuota, item)}
                                        </View>
                                    )
                                }
                            }
                        />
                    )
                }
            }
            else{
                return(
                    <View style={{backgroundColor: 'white', padding: 5, borderRadius: 10, width: '100%', padding: 10, alignItems: 'center', alignContent: 'center'}}>
                        <Text>No posee ningún Electrodméstico</Text>
                    </View>
                )
            }
        }

        //ver seguros
        const comprobarVencimientoSeguro = (item) => {
            if(item.vencido != 'V'){
                return (
                    <View
                        style= {{alignContent: 'center', margin: 5, backgroundColor: 'white', padding: 5, borderRadius: 10, width: 180 }}
                    >
                        <Image 
                            style={{width: 170, height: 100, alignItems: 'center'}}
                            source={{ uri: 'https://api.progresarcorp.com.py/images/seguross.jpg' }}
                        />
                        <Text style= {{fontSize: 12}}>Tipo Seguro: {item.tipo_seguro}</Text>
                        <Text style= {{fontSize: 12}}>Aseguradora: {item.aseguradora}</Text>
                        <Text style= {{fontSize: 12}}>Expedición: {item.fec_inicial}</Text>
                        <Text style= {{fontSize: 12}}>Vencimiento: {item.vencimiento}</Text>
                        <Text style= {{fontSize: 12}}>Monto Asegurado: {currencyFormat(item.monto_seguro)}</Text>
                        <Text></Text>
                        <Text style= {{borderRadius: 5, fontSize: 12, backgroundColor:'green', padding: 5, color:'white'}}>Activo</Text>

                    </View>
                );
            }
        }

        const ClienteSeguros = () => {
            if(clienteSeguro != ''){
                return(
                    <FlatList 
                        data={clienteSeguro}
                        horizontal= {true}
                        showsHorizontalScrollIndicator= {false}
                        snapToInterval={190}
                        decelerationRate={0}
                        scrollEventThrottle={15}
                        keyExtractor={(item) => item.id}
                        renderItem={({item, index}) =>{
                                return(
                                    <View>
                                        {comprobarVencimientoSeguro(item)}
                                    </View>
                                )
                            }
                        }
                    />
                )
            }
            else{
                return(
                    <View style={{backgroundColor: 'white', padding: 5, borderRadius: 10, width: '100%', padding: 10, alignItems: 'center', alignContent: 'center'}}>
                        <Text>No posee ningún Seguro Activo</Text>
                    </View>
                )
            }
        }

        //promos de la APP
        const comprobarItemPromo = (item) => {
            if(listaPromo != ''){
                if(item.activo != 'no'){
                    return (
                        <TouchableOpacity onPress={()=>{WebBrowser.openBrowserAsync(item.url)}} >
                            <Image source={{uri: item.url_imagen}} style={styles.image}/>
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>{item.title}</Text>
                                <Text style={styles.footerText}>{item.promo}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }
            }
        }

        const shortName = (value) => {
            
            let nValue = value.split(" ");

            value = nValue[0].trim().toLowerCase();

            return value;
        }

        const getFecha = () => {
            var fecha = new Date();
            var day = fecha.getDate();
            var month = fecha.getMonth()+1;
            var year = fecha.getFullYear();
            var hour = fecha.getHours();
            var minutes = fecha.getMinutes();
            var seconds = fecha.getSeconds();

            if(hour < 10){
                hour = '0'+hour;
            }

            if(minutes < 10){
                minutes = '0'+minutes;
            }

            if(seconds < 10){
                seconds = '0'+seconds;
            }

            if(month < 10){
                if(day < 10){
                    var date = '0' + day + '/0' + month + '/' + year + ' '+ hour + ':' + minutes + ':' + seconds;
                }else{
                    var date = day + '/0' + month + '/' + year + ' '+ hour + ':' + minutes + ':' + seconds;
                }
            }else{
                if(day < 10){
                    var date = '0' + day + '/' + month + '/' + year + ' '+ hour + ':' + minutes + ':' + seconds;
                }else{
                    var date = day + '/' + month + '/' + year + ' '+ hour + ':' + minutes + ':' + seconds;
                }
            }
            return date;
        }

        let styleBot = { marginRight: 8, marginLeft: 8, fontSize: 20 };

        const styleBotFo = () => {
            if(Platform.OS == 'ios'){
                styleBot={ marginRight: 8, marginLeft: 8, fontSize: 20 };
            }
        }

        return (
            <SafeAreaView style={{flex: 1, width: CONTENEDOR}}>
                <Text style={{textAlign: 'center', fontSize: 10, marginTop: 5, color: '#9c9c9c'}}>⬇️ Deslice hacia abajo para actualizar ⬇️</Text>
                <View style={styles.box1}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl 
                                refreshing={ Refreshing }
                                onRefresh={ onRefresh }
                                colors={['#bf0404']}
                            />
                        }
                    >
                        {cargando()}

                        {/* Bienvenida */}
                        <ImageBackground 
                            source={{uri: 'https://api.progresarcorp.com.py/images/'+imageSal}}
                            resizeMode="cover" 
                            imageStyle={{width: '100%', borderRadius: 5}}
                            style={[styles.topSal, {width: '100%', height: 70, justifyContent: "center", borderRadius: 5}]}
                        >
                                <View style={{width: '100%', padding: 5, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.2)', height: 70}} >
                                    <Text
                                        style={styles.textSal}
                                    >
                                        ¡{saludo} {shortName(nombre)}!
                                    </Text>
                                    <Text
                                        style={styles.textNom}
                                    >
                                        {getFecha()}
                                    </Text>
                                </View>
                        </ImageBackground>
                         {/* Vista para obtener datos del cliente */}
                         <View>
                        <TarjetaInfo  />
                            </View>
                            <Divider style={{ marginBottom: 10 }} />

                        {/* TC */}
                        <Collapse>
                            {/* Cabecera de las TC */}
                            <CollapseHeader>
                                <View style= {{padding: 10, backgroundColor: '#bf0404', borderRadius: 10}}> 
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{ width: '80%'}}>
                                            <Text style={{color: 'white'}}>Mis Tarjetas <Icon name='credit-card' /> </Text>
                                        </View>
                                        <View style={{ width: '10%', alignItems: 'center'}}>
                                            <IndicadorTC/>
                                        </View>
                                        <View style={{ width: '10%', alignItems: 'center'}}>
                                            <Icon name = 'chevron-down' color = 'white' backgroundColor = '#bf0404' style={{padding: 5}} />
                                        </View>
                                    </View>
                                </View>
                            </CollapseHeader>

                            {/* Detalle de las TC */}
                            <CollapseBody>
                                <View>
                                    <View style={{marginTop: 10, alignItems: 'center'}}>
                                        <ClienteTar />
                                    </View>
                                    <View style={{marginTop: 15, alignItems: 'center', width: '100%'}}>
                                        <View style={{alignItems: 'center', width: '100%'}}>
                                            <TouchableOpacity
                                                onPress={()=> {WebBrowser.openBrowserAsync('https://progresarcorp.com.py/solicitud-de-tarjeta/')}}
                                                style={{width: '100%', backgroundColor: '#9c9c9c', padding: 5, borderRadius: 5}}
                                            >
                                                <Text style={{color: 'white', textAlign: 'center'}}>Solicitar Tarjeta</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </CollapseBody>
                        </Collapse>

                        {/* Financiero */}
                        <Collapse style={{marginTop: 15}}>
                            <CollapseHeader>
                                <View style= {{padding: 10, backgroundColor: '#bf0404', borderRadius: 10}}> 
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{ width: '80%'}}>
                                            <Text style={{color: 'white'}}>Mis Préstamos <Icon name='money' /></Text>
                                        </View>
                                        <View style={{ width: '10%', alignItems: 'center'}}>
                                            <IndicadorF />
                                        </View>
                                        <View style={{ width: '10%', alignItems: 'center'}}>
                                            <Icon name = 'chevron-down' color = 'white' backgroundColor = '#bf0404' style={{padding: 5}} />
                                        </View>
                                    </View>
                                </View>
                            </CollapseHeader>

                            <CollapseBody>
                                <View>
                                    <View style={{marginTop: 10, alignItems: 'center'}}>
                                        <ClienteFin />
                                    </View>

                                    {/* Boton de Soliciud de Préstamo */}
                                    <View style={{marginTop: 15, alignItems: 'center', width: '100%'}}>
                                        <View style={{alignItems: 'center', width: '100%'}}>
                                            <TouchableOpacity
                                                onPress={()=> {WebBrowser.openBrowserAsync('https://progresarcorp.com.py/solicitud-de-credito/')}}
                                                style={{width: '100%', backgroundColor: '#9c9c9c', padding: 5, borderRadius: 5}}
                                            >
                                                <Text style={{color: 'white', textAlign: 'center'}}>Solicitar Préstamo</Text>
                                            </TouchableOpacity>

                                            {/* {botPagarFin()} */}
                                        </View>
                                    </View>
                                </View>
                            </CollapseBody>
                        </Collapse>

                         {/* Movimiento ATM 
                         <Collapse style={{marginTop: 15}}>
                            <CollapseHeader>
                                <View style= {{padding: 10, backgroundColor: '#bf0404', borderRadius: 10}}> 
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{ width: '80%'}}>
                                            <Text style={{color: 'white'}}>Utimo movimiento <Icon name='exchange' /></Text>
                                        </View>
                                        <View style={{ width: '10%', alignItems: 'center'}}>
                                            <IndicadorF />
                                        </View>
                                        <View style={{ width: '10%', alignItems: 'center'}}>
                                            <Icon name = 'chevron-down' color = 'white' backgroundColor = '#bf0404' style={{padding: 5}} />
                                        </View>
                                    </View>
                                </View>
                            </CollapseHeader>

                            <CollapseBody>
                                    <View style={{marginTop: 10, alignItems: 'center'}}>
                                        <ATM />
                                    </View>
                            </CollapseBody>
                        </Collapse>*/}

                        {/* Electrodomesticos */}
                        <Collapse style={{marginTop: 15}}>
                            <CollapseHeader>
                                <View style= {{padding: 10, backgroundColor: '#bf0404', borderRadius: 10}}> 
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{ width: '80%'}}>
                                            <Text style={{color: 'white'}}>Saldos Electrodomésticos <Icon name='shopping-cart' /></Text>
                                        </View>
                                        <View style={{ width: '10%', alignItems: 'center'}}>
                                            <IndicadorTC/>
                                        </View>
                                        <View style={{ width: '10%', alignItems: 'center'}}>
                                            <Icon name = 'chevron-down' color = 'white' backgroundColor = '#bf0404' style={{padding: 5}} />
                                        </View>
                                    </View>
                                </View>
                            </CollapseHeader>

                            <CollapseBody>
                                <View>
                                    <View style={{marginTop: 10, alignItems: 'center'}}>
                                        <ClienteElectro />
                                    </View>

                                    <View style={{marginTop: 15, alignItems: 'center', width: '100%'}}>
                                        <View style={{alignItems: 'center', width: '100%'}}>
                                            <TouchableOpacity
                                                onPress={()=> {WebBrowser.openBrowserAsync('https://progresarelectrodomesticos.com')}}
                                                style={{width: '100%', backgroundColor: '#9c9c9c', padding: 5, borderRadius: 5}}
                                            >
                                                <Text style={{color: 'white', textAlign: 'center'}}>Comprar Electrodomésticos</Text>
                                            </TouchableOpacity>

                                            {/* {botPagarElectro()} */}
                                        </View>
                                    </View>
                                </View>
                            </CollapseBody>
                        </Collapse>

                        {/* Seguros */}
                        <Collapse style={{marginTop: 15}}>
                            <CollapseHeader>
                                <View style= {{padding: 10, backgroundColor: '#bf0404', borderRadius: 10}}> 
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{ width: '80%'}}>
                                            <Text style={{color: 'white'}}>Seguros <Icon name='shield' /></Text>
                                        </View>
                                        <View style={{ width: '10%', alignItems: 'center'}}>
                                            <IndicadorTC/>
                                        </View>
                                        <View style={{ width: '10%', alignItems: 'center'}}>
                                            <Icon name = 'chevron-down' color = 'white' backgroundColor = '#bf0404' style={{padding: 5}} />
                                        </View>
                                    </View>
                                </View>
                            </CollapseHeader>

                            <CollapseBody>
                                <View>
                                    <View style={{marginTop: 10, alignItems: 'center'}}>
                                        <ClienteSeguros />
                                    </View>

                                    <View style={{marginTop: 15, alignItems: 'center', width: '100%'}}>
                                        <View style={{alignItems: 'center', width: '100%'}}>
                                            <TouchableOpacity
                                                onPress={()=> {WebBrowser.openBrowserAsync('https://api.whatsapp.com/send/?phone=595984923079&text=Hola,%20estoy%20interesado%20en%20solicitar%20un%20Seguro!!&type=phone_number&app_absent=0');}}
                                                style={{width: '100%', backgroundColor: '#9c9c9c', padding: 5, borderRadius: 5}}
                                            >
                                                <Text style={{color: 'white', textAlign: 'center'}}>Contratar Seguro</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </CollapseBody>
                        </Collapse>

                        <View style={{marginTop: 25, justifyContent: 'center'}}> 
                            <Text style={{textAlign: 'center', fontWeight: 'bold', fontSize: 18}}>Informaciones</Text>
                            <FlatList 
                                data={listaPromo}
                                horizontal= {true}
                                showsHorizontalScrollIndicator= {false}
                                style={styles.carousel}
                                snapToInterval={CONTENEDOR-30}
                                decelerationRate={0}
                                scrollEventThrottle={15}
                                pagingEnabled
                                keyExtractor={(item) => item.id}
                                renderItem={({item, index}) =>{
                                        return(
                                            <View>
                                                {comprobarItemPromo(item)}
                                            </View>
                                        )
                                    }
                                }
                            />

                            {listaPromo ? <View style={styles.dotView}>
                                {listaPromo.map(({}, index) => (
                                    <TouchableOpacity key={index.toString()} style={styles.circle} />
                                ))}
                            </View> : <View style={styles.dotView}><Text>No hay informaciones actualmente</Text></View>}
                        </View>
                    </ScrollView>

                    {styleBotFo()}
                </View>

                <View style={{marginTop: 15 }}>
                    <BotFoo 
                        parametros={[
                        /* Opcion para pagar TC 
                           clientetar != '' ? 
                            {
                                name: 'money',
                                onPress: () => this.gotoScreen('Pago de Tarjetas'),
                                backgroundColor: '#bf0404',
                                style: styleBot,
                                color: 'white',
                            }
                            :
                            {
                                name: 'money',
                                onPress: () => Alert.alert('Aguarde', 'Estamos cargando los recursos necesarios, por favor aguarde un momento.'),
                                backgroundColor: '#bf0404',
                                style: styleBot,
                                color: 'white',
                            },*/

                            {
                                name: 'home',
                                onPress: () => this.gotoScreen('Home'),
                                backgroundColor: '#9c9c9c',
                                style: styleBot,
                                color: 'white',
                            },

                            {
                                name: 'comments',
                                onPress: () => this.gotoScreen('Soporte'),
                                backgroundColor: '#bf0404',
                                style: styleBot,
                                color: 'white',
                            },
                            //Menu inferior para mostrar opcion de pago 
                            // Opción de pago QR le pasamos el parametro con el nro de documento
                            {  
                                name: 'qrcode',
                                onPress: () => this.gotoScreen('Qr', this.state.num_doc), // Pasar num_doc aquí
                                backgroundColor: '#bf0404',
                                style: styleBot,
                                color: 'white',
                            },
                            {  
                                name: 'university',
                                onPress: () => this.gotoScreen('AtmQr', this.state.num_doc), // Pasar num_doc aquí
                                backgroundColor: '#bf0404',
                                style: styleBot,
                                color: 'white',
                            }
                                  
                        ]}
                    />
                </View>

            </SafeAreaView>
        )
    }
}

//retorna la imagen de la TC correspondiente
export const imageTC = (value) => {
    var image;
    for(var i = 0; i < global.listaTcImage.length; i++){
        if(global.listaTcImage[i].code == value){
            image = global.listaTcImage[i].uri;
        }
    }
    return {uri: image}
}

const defaultOptions = {
    significantDigits: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbol: ''
}

//dar formato de monto
export const currencyFormat = (value, options) => {
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

const styles = StyleSheet.create({
    
    card: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 17,
        width: 360,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative', // Necesario para el posicionamiento absoluto del pie

      },
      contentContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 30, // Espacio para el pie de página
      },
      infoContainer: {
        flex: 1,
        justifyContent: 'space-between',
      },
      tipoCuenta: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
      },
      numeroCuenta: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
      },
      nombre: {
        fontSize: 14,
        color: '#333',
      },
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      footer1: {
        position: 'absolute',
        bottom: 16,
        left: 17,
        right: 17,
        alignItems: 'flex-end',
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      saldoLabel: {
        fontSize: 14,
        color: '#555',
      },
      saldo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
      },
      saldo_dinelco: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
      },
    carousel: {
        maxHeight:250
    },

    circle: {
        width: 10,
        height: 10,
        backgroundColor: 'grey',
        borderRadius: 50,
        marginHorizontal: 5
    },

    dotView:{
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 15
    },

    image: {
        width:CONTENEDOR-30,
        height: 120,
        resizeMode: 'cover',
        marginTop: 10
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 40,
        paddingHorizontal:15,
        alignItems: 'center',
        backgroundColor: '#bf0404',
        width: CONTENEDOR-30
    },

    footerText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold'
    },

    topSal: { 
        backgroundColor: 'rgba(156, 156, 156, 0.8)', 
        marginTop: 15, 
        marginBottom: 10,
        alignItems: 'center',
        borderRadius: 5
    },

    textSal:{
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    textNom:{
        color: 'white',
        textAlign: 'center',
        marginTop: 5
    },

    box1:{ 
        flex: 1, 
        paddingHorizontal: 15, 
        width: CONTENEDOR, 
        height: '100%', 
    },
    
    //estilos del modal
    centeredView:{
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
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

    //input style
    container: {
        padding: 2,
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
    noDataContainer: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      noDataText: {
        fontSize: 16,
        color: 'grey',
        marginTop: 8,
        textAlign: 'center',
      },
      icon: {
        textAlign: 'center',
      },
      requestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dc3545',
        borderRadius: 5,
        padding: 10,
        marginTop: 18,
      },
      buttonIcon: {
        marginRight: 10,
      },
      requestButtonText: {
        color: '#fff',
        fontSize: 12,
      },
      containertitulo: {
        flex: 1,
        padding: 10,
      },
      headerContainertitulo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
      },
      headerTitletitulo: {
        fontSize: 18,
        fontWeight: 'bold',
      },

})