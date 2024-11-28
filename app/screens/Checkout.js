import React, { Component, useState } from 'react';
import { 
    SafeAreaView, 
    Text, 
    View, 
    StyleSheet, 
    ActivityIndicator, 
    FlatList, 
    Image, 
    TouchableOpacity, 
    Alert, 
    Modal,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ScrollView } from 'react-native-virtualized-view';
import { Divider } from 'react-native-elements';
import * as global from '../global';
import DropDownPicker from 'react-native-dropdown-picker';
import { TextInput } from 'react-native-element-textinput';
import * as WebBrowser from 'expo-web-browser';

var md5 = require('md5');

class Checkout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: 'https://api.progresarcorp.com.py/api/',
            valid: global.valid_api_key,
            
            user:'',
            nombre: global.nombre,
            num_doc:'',
            num_usu: global.num_usuario,
            cod_cliente: global.codigo_cliente,
            cod_carrito: global.cod_carrito,

            loading: false,
            loadingTC: false,
            carrito: [],
            cart_total: '',
            responseBancard: [],
            process_id: '',
            status: '',

            visible:false,
            opcion:'NN',
            cuotas: '',
            ModalTCShow: false,
            ModalZimple: false,
            cuotas: '',
            Cargando: false,
        };
    }

    gotoScreen(routeName, status, type) {
        if(status != null){
            this.props.navigation.navigate(routeName, {
                data : status,
                tipo : type,
            })
        }else{
            this.props.navigation.navigate(routeName)
        }
    }

    componentDidMount() {
        this.verCarrito();
    };

    verCarrito(){
        this.setState({ loading: true })
        if(global.items_carrito != '0'){
            fetch(this.state.url + 'carritoVer' + '/' + this.state.cod_carrito + '/' + this.state.valid, {
                method: 'get',
            })
            .then(response => response.json())
            .then(data => {
    
                this.setState({
                    carrito: data.carrito,
                    cart_total: data.cart_tot,
                    loading: false
                })
                global.items_carrito=data.items_carrito;
                global.total_carrito=data.total_carrito;
            })
    
            .catch((error) => {
                this.setState({
                    loading: false
                })
                Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPorfavor intente de nuevo más tarde')
            })
        }else{
            this.setState({
                loading: false,
            })
            global.items_carrito= 0;
            Alert.alert(
                'Error',
                'Su carrito está vacio!'
            )
        }
    }

    grabarVenta(option, tipo, direc, ref, telef, cuota){

        this.setState({opcion: option, cuotas: cuota})
        var cant_cuota='';

        if(option == 'tarjeta-progre'){
            cant_cuota = cuota;
        }else{
            cant_cuota= 0;
        }
        var opcion= option;
        var url = 'https://api.progresarcorp.com.py/api/grabarVentaApp/';
        var data = JSON.stringify({
                cod_cliente: global.codigo_cliente,
                correo: 'troche20001@gmail.com',
                nombre: global.nombre,
                num_ci: global.num_doc,
                direccion: direc,
                telef: telef,
                tipoEnv: tipo,
                referencia: ref,
                cuotas: cant_cuota
            });
        
        fetch(url+opcion+'/'+this.state.valid+'/'+global.cod_carrito+'/'+data, {
            method: 'get'
        })
            .then(res => res.json())
            .catch((error) => {
                this.setState({
                    loading: false
                })
                Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPorfavor intente de nuevo más tarde')
            })
            .then(response => {

                if(response == "success"){

                    if(opcion=='tarjeta'){
                        this.pagarBancard();
                    }

                    if(opcion=='zimple'){
                        <pagoZimpleConfirm />
                        this.setState({ModalZimple: true})
                    }
                    
                    if(opcion=='tarjeta-progre'){
                       <pagarTCProgre />
                        this.setState({ModalTCShow: true})
                    }
                    if(opcion=='tigo'){
                        <pagoConfirm />
                        this.setState({visible: true})
                    }
                    if(opcion=='transf'){
                        <pagoConfirm />
                        this.setState({visible: true})
                    }
                    if(opcion=='contra'){
                        <pagoConfirm />
                        this.setState({visible: true})
                    }
                }else{
                    Alert.alert('Error','No pudimos guardar los datos de su carrito \nIntentelo de nuevo más tarde')
                } 
            });

    }

    confirmarVenta(item){
        if(Platform.OS!='ios'){
            this.setState({Cargando: true}) 
        }

        var opcion=this.state.opcion;
        var cuotas=this.state.cuotas;
        if(opcion=='tigo' || opcion=='transf' || opcion=='contra'){
            var cuota=0;

            fetch(this.state.url+'confirmarVenta/'+global.cod_carrito+'/'+opcion+'/'+this.state.valid+'/'+cuota)
            .then(res => res.json())
            .catch((error) => {
                this.setState({
                    loading: false
                })
                Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPorfavor intente de nuevo más tarde')
            })
            .then(response => {
                if(response == "success"){
                    this.setState({visible:false})
                    this.gotoScreen('Confirmar Compra', response);
                }else{
                    this.gotoScreen('Confirmar Compra', response);
                }
            });
        }else{
            this.setState({loadingTC: true})
            if(cuotas == null){
                cuotas=0;
            }
            fetch('https://progresarelectrodomesticos.com/envCorreoApp/'+item.nro_tarjeta+'/'+item.fecha+'/'+global.num_doc+'/'+global.total_carrito+'/'+cuotas+'/'+global.cod_carrito)
            .then(res => res.json())
            .catch((error) => {
                this.setState({
                    loading: false,
                    Cargando: false
                })
                Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPorfavor intente de nuevo más tarde')
            })
            .then(response => {
                if(response == "success"){
                    this.setState({ModalTCShow:false, loadingTC: false})
                    this.gotoScreen('Confirmar Compra', response);
                }else{
                    this.setState({ModalTCShow:false, loadingTC: false})
                    this.gotoScreen('Confirmar Compra', response);
                }
            });
        }
    }

    pagarBancard(){
        var url = global.url_environment_vpos+'/vpos/api/0.3/single_buy';
        var data = {
            public_key: 'V1ioH2Cf5znLRIrMDqlNh2Ruhw9YAuoE',
            operation: {
                token: md5('kIdWfqar6vMYEvPTR+i.oJF7GxT(MR(VVEwTX6qg'+global.cod_carrito+global.total_carrito+'.00PYG'),
                shop_process_id:global.cod_carrito,
                amount: global.total_carrito+'.00',
                currency:'PYG',
                additional_data: '',
                description: 'Compra en Progresar Móvil',
                return_url: 'http://progresarelectrodomesticos.com/confirmarventa'+global.cod_carrito,
                cancel_url: 'http://progresarelectrodomesticos.com/cancelarventa'+global.cod_carrito,
            }
        };

        fetch(url, {
        method: 'POST',
        body: JSON.stringify(data), 
        headers:{
            'Content-Type': 'application/json'
        }
        }).then(res => res.json())
        .catch((error) => {
            this.setState({
                Cargando: false,
                loading: false
            })
            Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPorfavor intente de nuevo más tarde')
        })
        .then(response => {
            if(response.status == "success"){
                this.setState({Cargando: true})
                this.gotoScreen('Venta Confirmar', response.process_id, 'tarjeta');
            }else{
                this.setState({Cargando: false})
                this.gotoScreen('Confirmar Compra', response.status);
            }
        });
    }

    pagarZimple(telefono){
        this.setState({loadingTC: true, Cargando: true})
        var url = global.url_environment_vpos+'/vpos/api/0.3/single_buy';
        var data = {
            public_key: public_key,
            operation: {
                token: md5(global.private_key_vpos+global.cod_carrito+global.total_carrito+'.00PYG'),
                shop_process_id:global.cod_carrito,
                amount: global.total_carrito+'.00',
                currency:'PYG',
                additional_data: telefono, //add num de telefono del cliente
                description: 'Compra en Progresar Móvil',
                return_url: 'http://progresarelectrodomesticos.com/confirmarventa'+global.cod_carrito,
                cancel_url: 'http://progresarelectrodomesticos.com/cancelarventa'+global.cod_carrito,
                zimple: "S"
            }
        };

        fetch(url, {
        method: 'POST',
        body: JSON.stringify(data), 
        headers:{
            'Content-Type': 'application/json'
        }
        }).then(res => res.json())
        .catch((error) => {
            this.setState({
                loading: false,
                Cargando: false,
            })
            Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPorfavor intente de nuevo más tarde')
        })
        .then(response => {
            this.setState({
                process_id: response.process_id,
                status: response.status,
            })
            if(response.status == "success"){
                this.setState({ModalZimple: false, loadingTC: false, Cargando: false})
                this.gotoScreen('Venta Confirmar', this.state.process_id, 'zimple');
            }else{
                this.gotoScreen('Confirmar Compra', response.status);
            }
        });
    }

    cancelarPedido(){
        fetch(this.state.url+'cancelarVenta/'+global.cod_carrito+'/'+this.state.valid)
        .then(res => res.json())
        .catch((error) => {
            this.setState({
                loading: false
            })
            Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPorfavor intente de nuevo más tarde')
        })
        .then(response => {
            if(response == 'success'){
                global.cod_carrito = '0';
                global.items_carrito= '0';
                global.total_carrito='0';
                this.gotoScreen('Electrodomésticos')
            }else{
                return Alert.alert('Error', 'No pudimos cancelar su compra \nPruebe de nuevo más tarde')
            }
        });
    }
    

    render() {
        const {loading, carrito, visible, opcion, ModalTCShow, loadingTC, ModalZimple, Cargando, cuotas} = this.state;

        const Indicador=()=>{
            if(loading == true){
                return(
                    <ActivityIndicator size= 'small' color='#bf0404' />
                )
            }
            if(loadingTC == true){
                return(
                    <ActivityIndicator size= 'small' color='#bf0404' />
                )
            }
            return(
                null
            )
        }

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

        const carritoVer = () =>{
            if(carrito != ''){
                return(
                    <View style= {{backgroundColor: 'white', padding: 8, borderRadius: 5}}>

                        <FlatList
                            data={carrito}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.cod_deta}
                            renderItem={({ item, index }) => {
                                return (
                                    <View>
                                        <View style={{alignItems: 'center', marginRight: 10}}>
                                            <View style={{backgroundColor: 'rgba(156, 156, 156, 0.7)', padding: 10, borderRadius: 5}}>
                                                <TouchableOpacity 
                                                    onPress={()=> Alert.alert('Articulo', item.cod_articulo+' - '+item.descripcion)}
                                                >
                                                    <Image 
                                                        style={{width: 100, height: 100, alignItems: 'center', borderRadius: 5}}
                                                        source={{uri: 'https://progresarelectrodomesticos.com/img/producto/'+item.ruta_foto}} 
                                                    />
                                                </TouchableOpacity>

                                                {/* total precio del productos */}
                                                <Text 
                                                    style={{fontSize: 14, textAlign: 'center', marginTop: 10, color: 'white', fontWeight: 'bold'}}
                                                >GS.{currencyFormat(item.total)}</Text>

                                                {/* total de productos */}
                                                <Text 
                                                    style={{fontSize: 10, textAlign: 'center', color: 'black', fontWeight: 'bold'}}
                                                >x {item.cantidad}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )
                            }
                            }
                        />
                    </View>
                )
            }
            else{
                return(
                    <View style={{alignItems: 'center', marginTop:15, backgroundColor: 'white', padding: 8, borderRadius: 5}}>
                        <Text>Su carrito está vacio!</Text>
                        <Indicador />
                    </View>
                )
            }
        }

        const TextInputComponent = () => {
            const [ref, setRef] = useState('');
            const [direc, setDirec] = useState('');
            const [telef, setTelef] = useState('');
            const [cuota, setCuota] = useState(null);

            const [open, setOpen] = useState(false);
            const [valor, setValue] = useState(null);
            const [items, setItems] = useState([
                {label: 'Retiro del Local', value: 'Retiro del Local'},
                {label: 'Enviar a mi Dirección', value: 'Enviar a mi Dirección'}
            ]);
            let spaceText = {marginTop: 15}

            if(open == true){
                spaceText = Platform.select({ios: {marginTop: 95}, default: {marginTop: 15}})
            }

            const formPagos = () => {
                if(ref != '' && direc != '' && telef != '' && valor != ''){
                    return(
                        <View style={{marginBottom: 15, marginTop: 15 }}>
                            <Text style={[styles.textCenter, styles.fontBold, {marginTop: 5, fontSize: 18}]}>Metodos de Pago</Text>
                            <Divider />

                            {/* methodos de pago */}
                            <View style={{marginTop: 10}}>
                                
                                {/* Fila 1 */}
                                <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                                    <View style={{width: '49%', marginRight: 5}}>
                                        <View style={{width: '100%'}}>
                                            <TouchableOpacity
                                                onPress={()=> [this.grabarVenta('tarjeta', valor, direc, ref, telef, cuota), this.setState({Cargando: true})]}
                                                style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                            >
                                                <Image 
                                                    style={{width: '100%', height: 50, borderRadius: 5}}
                                                    source={{uri: 'https://api.progresarcorp.com.py/images/pago-bancard-seguro.png'}}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={{width: '49%', marginRight: 5}}>
                                        <TouchableOpacity
                                            onPress={()=> this.grabarVenta('tarjeta-progre', valor, direc, ref, telef, cuota)}
                                            style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                        >
                                            <Image 
                                                style={{width: '100%', height: 50, borderRadius: 5}}
                                                source={{uri: 'https://api.progresarcorp.com.py/images/pago-tarjetas-progre.png'}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Fila 2 */}
                                <View style={{flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 20}}>
                                    {/* pago con zimple */}
                                    <View style={{width: '49%', marginRight: 5}}>
                                        <TouchableOpacity
                                            onPress={()=> this.grabarVenta('zimple', valor, direc, ref, telef, cuota)}
                                            style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                        >
                                            <Image 
                                                style={{width: '100%', height: 50, borderRadius: 5}}
                                                source={{uri: 'https://api.progresarcorp.com.py/images/pago-zimple.png'}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    {/* pago con giros tigo */}
                                    <View style={{width: '49%', marginRight: 5}}>
                                        <TouchableOpacity
                                            onPress={()=> this.grabarVenta('tigo', valor, direc, ref, telef, cuota)}
                                            style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                        >
                                            <Image 
                                                style={{width: '100%', height: 50, borderRadius: 5}}
                                                source={{uri: 'https://api.progresarcorp.com.py/images/pago-tigo.png'}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Fila 3 */}
                                <View style={{flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 20}}>
                                    <View style={{width: '49%', marginRight: 5}}>
                                        <TouchableOpacity
                                            onPress={()=> this.grabarVenta('contra', valor, direc, ref, telef, cuota)}
                                            style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                        >
                                            <Image 
                                                style={{width: '100%', height: 50, borderRadius: 5}}
                                                source={{uri: 'https://api.progresarcorp.com.py/images/pago-contra-entrega-fi.png'}}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{width: '49%', marginRight: 5}}>
                                        <TouchableOpacity
                                            onPress={()=> this.grabarVenta('transf', valor, direc, ref, telef, cuota)}
                                            style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                        >
                                            <Image 
                                                style={{width: '100%', height: 50, borderRadius: 5}}
                                                source={{uri: 'https://api.progresarcorp.com.py/images/pago-transferencia.png'}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </View>
                        </View>
                    )
                }else{
                    return(
                        <View style={{marginBottom: 15, marginTop: 15 }}>
                            <Text style={[styles.textCenter, styles.fontBold, {marginTop: 5, fontSize: 18}]}>Metodos de Pago</Text>
                            <Divider />

                            {/* methodos de pago */}
                            <View style={{marginTop: 10}}>
                                
                                {/* Fila 1 */}
                                <View style={{flexDirection: 'row', alignItems: 'center', width: '100%'}}>
                                    <View style={{width: '49%', marginRight: 5}}>
                                        <View style={{width: '100%'}}>
                                            <TouchableOpacity
                                                onPress={()=> Alert.alert('Atención', 'Debe completar los Datos solicitdados para continuar con su pedido')}
                                                style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                            >
                                                <Image 
                                                    style={{width: '100%', height: 50, borderRadius: 5}}
                                                    source={{uri: 'https://api.progresarcorp.com.py/images/pago-bancard-seguro.png'}}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={{width: '49%', marginRight: 5}}>
                                        <TouchableOpacity
                                            onPress={()=> Alert.alert('Atención', 'Debe completar los Datos solicitdados para continuar con su pedido')}
                                            style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                        >
                                            <Image 
                                                style={{width: '100%', height: 50, borderRadius: 5}}
                                                source={{uri: 'https://api.progresarcorp.com.py/images/pago-tarjetas-progre.png'}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Fila 2 */}
                                <View style={{flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 20}}>
                                    {/* pago con zimple */}
                                    <View style={{width: '49%', marginRight: 5}}>
                                        <TouchableOpacity
                                            onPress={()=> Alert.alert('Atención', 'Debe completar los Datos solicitdados para continuar con su pedido')}
                                            style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                        >
                                            <Image 
                                                style={{width: '100%', height: 50, borderRadius: 5}}
                                                source={{uri: 'https://api.progresarcorp.com.py/images/pago-zimple.png'}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    
                                    {/* pago con giros tigo */}
                                    <View style={{width: '49%', marginRight: 5}}>
                                        <TouchableOpacity
                                            onPress={()=> Alert.alert('Atención', 'Debe completar los Datos solicitdados para continuar con su pedido')}
                                            style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                        >
                                            <Image 
                                                style={{width: '100%', height: 50, borderRadius: 5}}
                                                source={{uri: 'https://api.progresarcorp.com.py/images/pago-tigo.png'}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Fila 3 */}
                                <View style={{flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 20}}>
                                    <View style={{width: '49%', marginRight: 5}}>
                                        <TouchableOpacity
                                            onPress={()=> Alert.alert('Atención', 'Debe completar los Datos solicitdados para continuar con su pedido')}
                                            style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                        >
                                            <Image 
                                                style={{width: '100%', height: 50, borderRadius: 5}}
                                                source={{uri: 'https://api.progresarcorp.com.py/images/pago-contra-entrega-fi.png'}}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{width: '49%', marginRight: 5}}>
                                        <TouchableOpacity
                                            onPress={()=> Alert.alert('Atención', 'Debe completar los Datos solicitdados para continuar con su pedido')}
                                            style={{backgroundColor: 'rgba(191,4,4,0.6)', alignItems: 'center', borderRadius: 5, padding: 2}}
                                        >
                                            <Image 
                                                style={{width: '100%', height: 50, borderRadius: 5}}
                                                source={{uri: 'https://api.progresarcorp.com.py/images/pago-transferencia.png'}}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </View>
                        </View>
                    )
                }
            }
        
            return (
                <View style={{marginBottom: 15}}>
                    <View>
                    <Text style={[styles.textCenter, styles.fontBold, {marginBottom: 5, fontSize: 18}]}>Datos para el Pedido</Text>
                    </View>
                    <Divider style={{marginBottom: 10}}/>
                    <View>
                        <DropDownPicker
                            open={open}
                            value={valor}
                            items={items}
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setItems}
                            language="ES"
                            style={{
                                borderColor: "#bf0404",
                            }}
                            translation={{
                                PLACEHOLDER: "Tipo de Envío"
                            }}
                            dropDownContainerStyle={{
                                borderColor: "#bf0404",
                                backgroundColor: 'white',
                            }}
                        />
                    </View>

                    {/* dirección */}
                    <View style={spaceText}>
                    <TextInput
                        value={direc}
                        style={styles.input}
                        inputStyle={styles.inputStyle}
                        labelStyle={styles.labelStyle}
                        placeholderStyle={styles.placeholderStyle}
                        textErrorStyle={styles.textErrorStyle}
                        label="Dirección de Envio"
                        placeholder="ej: 14 de mayo esquina tte. honorio gonzález"
                        placeholderTextColor="gray"
                        onChangeText={text => {
                            setDirec(text);
                        }}
                    />
                    </View>
                    
                    {/* referencia */}
                    <View style={{marginTop: 15}}>
                        <TextInput
                            value={ref}
                            style={styles.input}
                            inputStyle={styles.inputStyle}
                            labelStyle={styles.labelStyle}
                            placeholderStyle={styles.placeholderStyle}
                            textErrorStyle={styles.textErrorStyle}
                            label="Referencia para el Envio"
                            placeholder="ej: entregar a las 14:00 hs"
                            placeholderTextColor="gray"
                            selectionColor='rgba(156, 156, 156, 0.5)'
                            onChangeText={text => {
                                setRef(text);
                            }}
                        />
                    </View>
                    
                    {/* telefono */}
                    <View style={{marginTop: 15}}>
                        <TextInput
                            value={telef}
                            style={styles.input}
                            inputStyle={styles.inputStyle}
                            labelStyle={styles.labelStyle}
                            placeholderStyle={styles.placeholderStyle}
                            textErrorStyle={styles.textErrorStyle}
                            label="N° de Teléfono"
                            placeholder="0981 123456"
                            placeholderTextColor="gray"
                            selectionColor='rgba(156, 156, 156, 0.5)'
                            keyboardType="numeric"
                            onChangeText={text => {
                                setTelef(text);
                            }}
                        />
                    </View>

                    {/* cant_cuotas */}
                    <View style={{marginTop: 15}}>
                        <TextInput
                            value={cuota}
                            style={styles.input}
                            inputStyle={styles.inputStyle}
                            labelStyle={styles.labelStyle}
                            placeholderStyle={styles.placeholderStyle}
                            textErrorStyle={styles.textErrorStyle}
                            label="Cant. Cuotas"
                            placeholder="Máx. 15 cuotas"
                            placeholderTextColor="gray"
                            selectionColor='rgba(156, 156, 156, 0.5)'
                            keyboardType="numeric"
                            onChangeText={text => {
                                setCuota(text);
                            }}
                        />
                        <Text style={{fontSize: 10, fontStyle: 'italic', marginLeft: 5, marginTop: 5}}>Cuotas solo Válidas para pagos con TC - Progresar</Text>
                    </View>
                            
                    {/* formas de pago */}
                    {formPagos()}

                    {pagoZimpleConfirm()}
                </View>
            );
        };

        const pagoConfirm = (opcion) => {
            const PagoOp = () => {
                if(opcion=='transf'){
                    return(
                        <View>
                            <Text style={styles.modalText}>Realice su transacción a una de las cuentas mencionadas más abajo</Text>
                            
                            <Image 
                                source={{uri: 'https://api.progresarcorp.com.py/images/cuentas-progre.png'}}
                                style={{width: '100%', height: 230, borderRadius: 5, marginBottom: 10, marginTop: 10}}
                            />
                            
                            <Text>Una vez realizado la Transferencia enviar la foto de su comprobante presionando el botón de aquí abajo.</Text>
                            
                            {/* Boton de Whatsapp */}
                            <View style={{width: '100%', marginTop: 10}}>
                                <TouchableOpacity
                                    onPress={() => {WebBrowser.openBrowserAsync('https://progresarelectrodomesticos.com/whatsapp-giro');}}
                                    style={{backgroundColor: '#28a745', padding: 5, borderRadius: 5, alignItems: 'center'}}
                                >
                                    <Text style={{color: 'white', alignItems:'center'}}><Icon name='whatsapp' size={15} color='white' /> Enviar comprobante</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }else if(opcion=='tigo'){
                    return(
                        <View>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={styles.modalText}>Realice un Giro al siguiente número: </Text>
                                <Text style={[styles.modalText, {fontWeight: 'bold'}]}>"0981 789 189".</Text>
                            </View>
                            <Text>Una vez realizado el Giro enviar la foto de su comprobante presionando el botón de aquí abajo.</Text>
                            
                            {/* Boton de Whatsapp */}
                            <View style={{width: '100%', marginTop: 10}}>
                                <TouchableOpacity
                                    onPress={() => {WebBrowser.openBrowserAsync('https://progresarelectrodomesticos.com/whatsapp-giro');}}
                                    style={{backgroundColor: '#28a745', padding: 5, borderRadius: 5, alignItems: 'center'}}
                                >
                                    <Text style={{color: 'white', alignItems:'center'}}><Icon name='whatsapp' size={15} color='white' /> Enviar comprobante</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }else if(opcion=='contra'){
                    return(
                        <View>
                            <Text style={styles.modalText}>Pague en el momento de la entrega del producto</Text>
                            <Text>Su pedido se confirmará automáticamente al presionar el botón de Confirmar.</Text>
                        </View>
                    )
                }
            }

            return(
                <View style={styles.centeredView}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={visible}
                    >
                        <View style={styles.centeredView}>
                            <View style= {styles.modalView}>
                                <View>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.textTile}>Realizar Compra</Text>
                                        
                                        <TouchableOpacity
                                            onPress={()=> this.setState({visible:false})}
                                        >
                                            <Icon name='times' size={20} color='#bf0404' />
                                        </TouchableOpacity>
                                    </View>
                                    <Divider style={{marginBottom: 10}} />
                                </View>
        
                                <View>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.modalText}>Su número de pedido es: </Text>
                                        <Text style={[styles.modalText, {fontWeight: 'bold'}]}>"{global.cod_carrito}".</Text>
                                    </View>

                                    <PagoOp />
                                </View>
        
                                <View style={styles.contButon}>
                                    <View style={styles.contTouch}>
        
                                        <TouchableOpacity 
                                            onPress={()=> Alert.alert('Atención', 'Está seguro que quiere cancelar su pedido?', [
                                                {
                                                  text: "No, Mantener Pedido",
                                                  onPress: () => null,
                                                  style: "cancel"
                                                },
                                                { text: "Si, Cancelar Pedido", onPress: () => this.cancelarPedido()}
                                              ])
                                            }
                                            style={[styles.buton, {backgroundColor: '#BF0404', borderColor: '#BF0404'}]}
                                        >
                                            <Text style={{textAlign: 'center', color: 'white'}}>Cancelar Pedido</Text>
                                        </TouchableOpacity>
        
                                    </View>
        
                                    <View style={styles.contTouch}>
        
                                        <TouchableOpacity 
                                            onPress={()=> this.confirmarVenta()}
                                            style={styles.buton}
                                        >
                                            <Text style={{textAlign: 'center'}}>Confirmar Pedido</Text>
                                        </TouchableOpacity>
        
                                    </View>
                                </View>
                            </View>
                        </View>
        
                    </Modal>
                </View>
            )
        }

        const pagoZimpleConfirm = () => {
            const [telefZimple, setTelefZimple] = useState('');
            return(
                <View style={styles.centeredView}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={ModalZimple}
                    >
                        <View style={styles.centeredView}>
                            <View style= {styles.modalView}>
                                <View>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.textTile}>Realizar Compra</Text>
                                        
                                        <TouchableOpacity
                                            onPress={()=> this.setState({ModalZimple:false})}
                                        >
                                            <Icon name='times' size={20} color='#bf0404' />
                                        </TouchableOpacity>
                                    </View>
                                    <Divider style={{marginBottom: 10}} />
                                </View>
        
                                <View>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.modalText}>Su número de pedido es: </Text>
                                        <Text style={[styles.modalText, {fontWeight: 'bold'}]}>"{global.cod_carrito}".</Text>
                                    </View>

                                    {/* Add numero de celular Zimple */}
                                    <View style={{marginTop: 15}}>
                                        <Text style={[styles.modalText, {marginBottom: 10}]}>Ingrese el número de teléfono con cuenta en Billetera Zimple</Text>
                                        <TextInput
                                            value={telefZimple}
                                            style={styles.input}
                                            inputStyle={styles.inputStyle}
                                            labelStyle={styles.labelStyle}
                                            placeholderStyle={styles.placeholderStyle}
                                            textErrorStyle={styles.textErrorStyle}
                                            label="N° Zimple"
                                            placeholder="Número de Teléfono con cuenta Zimple"
                                            placeholderTextColor="gray"
                                            selectionColor='rgba(156, 156, 156, 0.5)'
                                            keyboardType="numeric"
                                            onChangeText={text => {
                                                setTelefZimple(text);
                                            }}
                                        />
                                    </View>
                                </View>
        
                                <View style={styles.contButon}>
                                    <View style={styles.contTouch}>
        
                                        <TouchableOpacity 
                                            onPress={()=> Alert.alert('Atención', 'Está seguro que quiere cancelar su pedido?', [
                                                {
                                                  text: "No, Mantener Pedido",
                                                  onPress: () => null,
                                                  style: "cancel"
                                                },
                                                { text: "Si, Cancelar Pedido", onPress: () => this.cancelarPedido()}
                                              ])
                                            }
                                            style={[styles.buton, {backgroundColor: '#BF0404', borderColor: '#BF0404'}]}
                                        >
                                            <Text style={{textAlign: 'center', color: 'white'}}>Cancelar Pedido</Text>
                                        </TouchableOpacity>
        
                                    </View>
        
                                    <View style={styles.contTouch}>
        
                                        <TouchableOpacity 
                                            onPress={()=> this.pagarZimple(telefZimple)}
                                            style={styles.buton}
                                        >
                                            <Text style={{textAlign: 'center'}}>Confirmar Pedido</Text>
                                        </TouchableOpacity>
        
                                    </View>
                                </View>
                            </View>
                        </View>
        
                    </Modal>
                </View>
            )
        }

        const comprobarTC = (value, item) => {
    
            const imageTC = (img) => {
                if(img == 'FR'){
                    return {uri: 'https://tarjetas.progresarcorp.com.py/images/TAFUNI.png'}
                }
    
                if(img == 'JM'){
                    return {uri: 'https://tarjetas.progresarcorp.com.py/images/tclasica.png'}
                }
    
                if(img == 'JW'){
                    return {uri: 'https://tarjetas.progresarcorp.com.py/images/tmujer.png'}
                }
    
                if(img == 'J0'){
                    return {uri: 'https://tarjetas.progresarcorp.com.py/images/tclasica.png'}
                }
    
                if(img == 'J5'){
                    return {uri: 'https://tarjetas.progresarcorp.com.py/images/tedt.png'}
                }
    
                if(img == 'J7'){
                    return {uri: 'https://tarjetas.progresarcorp.com.py/images/tcfep.png'}
                }
    
                if(img == 'M2'){
                    return {uri: 'https://tarjetas.progresarcorp.com.py/images/tprogar.png'}
                }
    
                if(img == 'TR'){
                    return {uri: 'https://tarjetas.progresarcorp.com.py/images/ttrin.png'}
                }
            }
    
            const comprobarEspecial = (esp) => {
                if(esp == 0){
                    return null
                }else{
                    return (
                        <Text style= {{fontSize: 12, color: 'white'}}>
                            Linea Especial: {currencyFormat(esp)}
                        </Text>
                    );
                }
            }
    
            const comprobarTCBloqueado = (bloq) => {
                if(bloq == 'A'){
                    return (
                        <Text style= {{fontSize: 12, backgroundColor: '#ff0000', color: 'white', padding: 5, borderRadius: 5, marginTop: 5}}>
                            BLOQUEO ADMINISTRATIVO
                        </Text>
                    );
                }
                if(bloq == 'U'){
                    return (
                        <Text style= {{fontSize: 12, backgroundColor: '#ff0000', color: 'white', padding: 5, borderRadius: 5, marginTop: 5}}>
                            BLOQUEADO POR EL USUARIO
                        </Text>
                    );
                }
            }
    
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
                                    onPress={() => this.confirmarVenta(item)}
                                    style= {{margin: 5, backgroundColor: 'rgba(156,156,156, 0.8)', padding: 5, borderRadius: 10}}
                                >
                                    <Image
                                        style={{ width: 170, height: 100, marginBottom: 5, alignItems: 'center' }}
                                        source= {(imageTC(item.clase_tarjeta))}
                                    />
                                    <Text style= {{fontSize: 12, color: 'white'}}>Tipo TC: {item.tipo_tarjeta}</Text>
                                    <Text style= {{fontSize: 12, color: 'white'}}>TC N°: {item.nro_tarjeta}</Text>
                                    <Text style= {{fontSize: 12, color: 'white'}}>Linea Normal: {currencyFormat(item.linea_normal)}</Text>
                                    <View>{comprobarEspecial(item.linea_especial)}</View>
                                    <View>{comprobarTCBloqueado(item.adm_usu)}</View>
                                </TouchableOpacity>
                            );    
                        }else{
                            return (
                                <TouchableOpacity 
                                    onPress={() => this.confirmarVenta(item)}
                                    style= {{margin: 5, backgroundColor: 'rgba(156,156,156, 0.8)', padding: 5, borderRadius: 10}}
                                >
                                    <Image
                                        style={{ width: 170, height: 100, marginBottom: 5, alignItems: 'center' }}
                                        source= {(imageTC(item.clase_tarjeta))}
                                    />
                                    <Text style= {{fontSize: 12, color: 'white'}}>Tipo TC: {item.tipo_tarjeta}</Text>
                                    <Text style= {{fontSize: 12, color: 'white'}}>TC N°: {item.nro_tarjeta}</Text>
                                    <Text style= {{fontSize: 12, color: 'white'}}>Linea Normal: {currencyFormat(item.linea_normal)}</Text>
                                    <View>{comprobarEspecial(item.linea_especial)}</View>
                                    <View>{comprobarTCBloqueado(item.adm_usu)}</View>
                                    <Indicador />
                                </TouchableOpacity>
                            );
                        }
                    }
                }
            }
        }

        //pagar con tc de progresar
        const pagarTCProgre = () => {
            return(
                <View style={styles.centeredView}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={ModalTCShow}
                    >
                        <View style={styles.centeredView}>
                            <View style= {styles.modalView}>
                                <View>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.textTile}>Realizar Compra</Text>
                                        
                                        <TouchableOpacity
                                            onPress={()=> this.setState({ModalTCShow:false})}
                                        >
                                            <Icon name='times' size={20} color='#bf0404' />
                                        </TouchableOpacity>
                                    </View>
                                    <Divider style={{marginBottom: 10}} />
                                </View>

                                <View>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.modalText}>Su número de pedido es: </Text>
                                        <Text style={[styles.modalText, {fontWeight: 'bold'}]}>"{global.cod_carrito}".</Text>
                                    </View>
                                </View>

                                {/* Add numero de celular Zimple */}
                                {/* <View style={{marginTop: 15, width: '100%', marginBottom: 10}}>
                                    <TextInput
                                        value={cuotas}
                                        style={styles.input}
                                        inputStyle={styles.inputStyle}
                                        labelStyle={styles.labelStyle}
                                        placeholderStyle={styles.placeholderStyle}
                                        textErrorStyle={styles.textErrorStyle}
                                        label="Cuotas"
                                        placeholder="Máximo 15"
                                        placeholderTextColor="gray"
                                        selectionColor='rgba(156, 156, 156, 0.5)'
                                        keyboardType="numeric"
                                        onChangeText={text => {
                                            this.setState({cuotas: text});
                                        }}
                                    />
                                </View> */}

                                <Text style={{marginBottom: 5}}>Seleccione una tarjeta para confirmar su pedido:</Text>

                                {/* las tarjetas del usuario */}
                                <View style={{height: 210}}>
                                    
                                    <FlatList 
                                        data={global.user_tc}
                                        horizontal= {true}
                                        showsHorizontalScrollIndicator= {false}
                                        keyExtractor={(item) => item.cod_tarjeta}
                                        renderItem={({item, index}) =>{
                                                return(
                                                    <View>{comprobarTC(item.cod_tarjeta, item)}</View>              
                                                )
                                            }
                                        }
                                    />
                                </View>
        
                                <View style={styles.contButon}>
                                    <View style={{alignItems: 'center', width: '100%', padding: 5}}>
        
                                        <TouchableOpacity 
                                            onPress={()=> Alert.alert('Atención', 'Está seguro que quiere cancelar su pedido?', [
                                                {
                                                    text: "No, Mantener Pedido",
                                                    onPress: () => null,
                                                    style: "cancel"
                                                },
                                                { text: "Si, Cancelar Pedido", onPress: () => this.cancelarPedido()}
                                                ])
                                            }
                                            style={[styles.buton, {backgroundColor: '#BF0404', borderColor: '#BF0404'}]}
                                        >
                                            <Text style={{textAlign: 'center', color: 'white'}}>Cancelar Pedido</Text>
                                        </TouchableOpacity>
        
                                    </View>
                                </View>
                            </View>
                        </View>
        
                    </Modal>
                </View>
            )
        }

        const cargando = () => {
            return (
                <View style={[styles.centeredView, {backgroundColor: 'rgba(156,156,156, 0.7)'}]}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={Cargando}
                    >
                        <View style={[styles.centeredView, {backgroundColor: 'rgba(156,156,156, 0.7)'}]}>
                            <ActivityIndicator size="large" color="#bf0404" />
                            <Text style={{color: 'white'}}>Aguarde un momento...</Text>
                        </View>
        
                    </Modal>
                </View>
            )
        }

        return (
            <SafeAreaView style={styles.box1}>
                <ScrollView
                    showsVerticalScrollIndicator= {false}
                >
                    <View style={{backgroundColor: 'white', borderRadius: 5, padding: 8, marginTop: 15, marginBottom: 15}}>

                        {/* Monto Total */}
                        <View style={{marginTop: 5}}>
                            <View style={{flexDirection: 'row', marginBottom: 10}}>
                                <View style={{width: '50%'}}>
                                    <View style={{paddingHorizontal: 15}}>
                                        <Text style={[styles.fontBold, styles.textCenter, {fontSize: 18}]}>Monto Total</Text>
                                        <Text style={styles.textCenter}>GS.{currencyFormat(global.total_carrito)}</Text>
                                    </View>
                                </View>

                                <View style={{width: '50%'}}>
                                    <View style={{paddingHorizontal: 15}}>
                                        <Text style={[styles.fontBold, styles.textCenter, {fontSize: 18}]}>Productos</Text>
                                        <Text style={styles.textCenter}>{global.items_carrito}</Text>
                                    </View>
                                </View>
                            </View>
                            <Divider />
                        </View>

                        {/* Datos del Carrito */}
                        <View style={{marginTop: 15}}>
                            <Text style={styles.textCenter}>Tu Productos</Text>
                            {carritoVer()}
                        </View>
                        
                        {/* Datos de entrega */}
                        <View style={{marginTop: 15}}>
                            <TextInputComponent />
                        </View>

                        {pagoConfirm(opcion)}

                        {pagarTCProgre()}
                        {cargando()}

                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    box1:{ 
        flex: 1, 
        paddingHorizontal: 15, 
        width: '100%', 
        height: '100%', 
    },

    textProd:{
        fontSize: 11, 
        textAlign: 'center', 
        paddingTop: 15
    },

    bgColorGrey:{
        backgroundColor: '#9c9c9c'
    },
    bgColorRed:{
        backgroundColor: '#bf0404'
    },
    textCenter:{
        textAlign: 'center',
    },
    fontBold:{
        fontWeight: 'bold', 
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

    //estilo del Modal
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
        shadowColor: 'black',
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
    }
});

export default Checkout;
