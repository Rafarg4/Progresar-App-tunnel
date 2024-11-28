import React, { Component } from 'react';
import * as global from '../global.js'
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
} from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Divider } from 'react-native-elements';

export default class ElectroScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            url: 'https://api.progresarcorp.com.py/api/',
            valid: global.valid_api_key,

            nombre: global.nombre,
            num_doc: global.num_doc,
            num_usu: global.num_usuario,
            cod_cliente: global.codigo_cliente,
            loading: false,

            carrito: [],
            cart_total: '',
            cantidad:'0',
        }
        global.actRoute='Carrito'
    }

    componentDidMount() {
        setTimeout(() => {
            this.verCarrito();
        }, 1, this
        )
    };

    gotoScreen(routeName) {
        if(routeName=='Back'){
            this.props.navigation.goBack()
        }else{
            this.props.navigation.navigate(routeName)
        }
    }

    verCarrito(){
        this.setState({ loading: true })
        if(global.items_carrito != '0'){
            fetch(this.state.url + 'carritoVer' + '/' + global.cod_carrito + '/' + this.state.valid, {
                method: 'get',
            })
            .then(response => response.json())
            .then(data => {
    
                this.setState({
                    carrito: data.carrito,
                    cart_total: data.cart_tot,
                    cantidad: data.items_carrito,
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
                '😥',
                'Su carrito está vacio!'
            )
        }
    }

    sumCant(val, deta){
        val++
        this.modProducto(val, deta)
    }

    restCant(val, deta){
        val--
        if(val!=0){
            this.modProducto(val, deta)
        }else{
            Alert.alert('Error', 'La cantidad no puede ser 0')
        }
    }

    modProducto(value, deta){

        this.setState({ loading: true })

        var data = {
            valid: this.state.valid,
            cantidad: value,
            cod_deta: deta,
            cod_carrito: global.cod_carrito,
        };

        fetch('https://api.progresarcorp.com.py/api/modificarProd',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            this.setState({
                mensaje: data.mensaje,
                cant_carrito: data.items_carrito,
                tot_carrito: data.total_carrito,
                loading: false
            })

            Alert.alert('Éxito', 'Su carrito ha sido modificado!')
            this.verCarrito()
        })
        .catch((error) => {
            this.setState({
                loading: false
            })
            Alert.alert(
                'Error',
                'No pudimos modificar su carrito. \nIntentelo de nuevo más tarde'
            )
        })
    }

    eliminarProd(value, cod_articulo){
        this.setState({ loading: true })

        var data = {
            valid: this.state.valid,
            cod_deta: value,
            cod_carrito: global.cod_carrito,
        };

        fetch('https://api.progresarcorp.com.py/api/borrarProd',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            this.setState({
                mensaje: data.mensaje,
                cant_carrito: data.items_carrito,
                tot_carrito: data.total_carrito,
                loading: false
            })
            global.items_carrito=this.state.cant_carrito;
            global.total_carrito=this.state.tot_carrito;

            Alert.alert('Éxito', 'El producto fue eliminado de su carrito')
            this.gotoScreen('Back')
        })
        .catch((error) => {
            this.setState({
                loading: false
            })
            Alert.alert(
                'Error',
                'No pudimos eliminar el producto - '+ cod_articulo +'\nIntentelo de nuevo más tarde.'
            )
        })
    }


    render(){

        const {carrito, cart_total, cantidad, loading} = this.state;

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

        const Indicador=()=>{
            if(loading == true){
                return(
                    <ActivityIndicator size= 'small' color='#bf0404' />
                )
            }
            return(
                null
            )
        }

        /* Muestra el Carrito */
        const carritoVer = () =>{
            if(carrito != ''){
                return(
                    <View style= {{marginTop: 10, backgroundColor: 'white', padding: 8, borderRadius: 5}}>
                        <View style={{flexDirection: 'row', backgroundColor: '#9c9c9c', padding: 5, borderRadius: 5}}>
                            <View style={{width: '25%'}}>
                                <Text style={{fontSize: 11, textAlign: 'center', color: 'white'}} >Productos</Text>
                            </View>

                            <View style={{width: '25%'}}>
                                <Text style={{fontSize: 11, textAlign: 'center', color: 'white'}} >Cantidad</Text>
                            </View>

                            <View style={{width: '35%'}}>
                                <Text style={{fontSize: 11, textAlign: 'center', color: 'white'}} >Total</Text>
                            </View>

                            <View style={{width: '15%'}}>
                                <Text style={{fontSize: 11, textAlign: 'center', color: 'white'}} ></Text>
                            </View>
                        </View>

                        <Divider style={{marginBottom: 5, marginTop: 3}} />

                        {/* Lista de los articulos en el carrito */}
                        <FlatList
                            data={carrito}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item) => item.cod_deta}
                            renderItem={({ item, index }) => {
                                return (
                                    <View>
                                        <View style={{flexDirection: 'row'}}>
                                            <View style={{width: '25%', alignItems: 'center'}}>
                                                <View>
                                                    <TouchableOpacity 
                                                        onPress={()=> Alert.alert('Articulo', item.cod_articulo+' - '+item.descripcion)}
                                                    >
                                                        <Image 
                                                            style={{width: 50, height: 50, alignItems: 'center'}}
                                                            source={{uri: 'https://progresarelectrodomesticos.com/img/producto/'+item.ruta_foto}} 
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            <View style={{width: '25%', flexDirection:'row'}}>
                                                <View style={{width: '25%', alignItems:'center', paddingTop: 12}}>
                                                    <TouchableOpacity 
                                                        onPress={()=> this.restCant(item.cantidad, item.cod_deta)}
                                                    >
                                                        <Icon name='minus-square' size={25} color='#ff0000' />
                                                    </TouchableOpacity>
                                                </View>
                                            
                                                <View style={{width:'50%', paddingTop: 15, paddingHorizontal: 5}}>
                                                    <Text 
                                                        style={{fontSize: 11, textAlign: 'center', borderColor: '#bf0404', borderWidth: 1, borderRadius: 5, paddingTop: 2, paddingBottom: 2}}
                                                    >
                                                        {item.cantidad}
                                                    </Text>
                                                </View>

                                                <View style={{width: '25%', alignItems:'center', paddingTop: 12}}>
                                                    <TouchableOpacity 
                                                        onPress={()=> this.sumCant(item.cantidad, item.cod_deta)}
                                                    >
                                                        <Icon name='plus-square' size={25} color='#ff0000' />
                                                    </TouchableOpacity>
                                                </View>

                                            </View>

                                            <View style={{width: '35%'}}>
                                                <Text style={{fontSize: 11, textAlign: 'center', paddingTop: 15}} >{currencyFormat(item.total)}</Text>
                                            </View>

                                            {/*Boton de eliminar */}
                                            <View style={{width: '15%',  paddingTop: 12, }}>
                                                <TouchableOpacity
                                                    style={{alignItems: 'center'}}
                                                    onPress={()=> Alert.alert('Eliminar Articulo', 'Se eliminará del carrito el siguiente producto:'+' \n\n'+item.cod_articulo+' - '+item.descripcion,
                                                    [
                                                      {
                                                        text: "Cancelar",
                                                        onPress: null,
                                                        style: 'cancel'
                                                      },
                                                      { 
                                                        text: "Eliminar", 
                                                        onPress: () => this.eliminarProd(item.cod_deta, item.cod_articulo),
                                                      }
                                                    ]
                                                  )}
                                                >
                                                    <Icon name='trash' size={25} color='#ff0000' />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                    </View>
                                )
                            }
                            }
                        />

                        <Divider style={{marginBottom: 5, marginTop: 3}} />
                        
                        {/* Total Gral del carrito */}
                        <View style={{flexDirection: 'row', backgroundColor: '#bf0404', padding: 5, borderRadius: 5}}>
                            <View style={{width: '25%'}}>
                                <Text style={{fontSize: 11, textAlign: 'center'}} ></Text>
                            </View>

                            <View style={{width: '25%'}}>
                                <Text style={{fontSize: 11, textAlign: 'center'}} ></Text>
                            </View>

                            <View style={{width: '20%'}}>
                                <Text style={{fontSize: 11, textAlign: 'center', color:'white'}} >Total Carrito:</Text>
                            </View>

                            <View style={{width: '30%'}}>
                                <Text style={{fontSize: 11, textAlign: 'center', color:'white'}} >{currencyFormat(cart_total) }</Text>
                            </View>
                        </View>
                        
                        {/* Boton para realizar Compra */}
                        <View style={{flexDirection: 'row', marginTop: 15}}>

                            <View style={{width: '100%', padding: 5}}>
                                <TouchableOpacity
                                    onPress={()=> this.gotoScreen('Checkout')}
                                    style={[styles.botAddCart, styles.bgColorRed]}
                                >
                                    <Text style={{color: 'white'}}>Realizar Compra</Text>
                                </TouchableOpacity>
                            </View>

                            <View>

                            </View>
                        </View>

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

        return(
            <SafeAreaView style={styles.box1}>
                <View style={{marginTop: 15, padding: 8, backgroundColor: 'rgba(156, 156, 156, 0.8)', borderRadius: 5}}>
                    <Text style= {{textAlign: 'center', color: 'white'}}>Total Carrito: {currencyFormat(cart_total)}</Text>
                    <Text style= {{textAlign: 'center', color: 'white'}}>Total Productos: {cantidad}</Text>
                </View>
                <ScrollView>
                    {carritoVer()}
                </ScrollView>
            </SafeAreaView>
        )
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

    botAddCart:{
        padding: 8,
        borderRadius: 5, 
        width: '100%', 
        alignItems: 'center'
    },
})