import React, { Component} from 'react';
import * as global from '../global.js'
import { SafeAreaView, Text, View, StyleSheet, ActivityIndicator, FlatList, Image, TextInput, TouchableOpacity, Alert, RefreshControl} from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Divider } from 'react-native-elements';

export default class ElectroScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            url: 'https://api.progresarcorp.com.py/api/verProds',
            valid: global.valid_api_key,

            nombre: global.nombre,
            num_doc: global.num_doc,
            num_usu: global.num_usuario,
            cod_cliente: global.codigo_cliente,
            loading: false,

            cat: 'TODOS',
            search: 'TODOS',
            pagina: '0',
            page: '0',

            articulos: [],
            categorias: [],
            paginas: '',

            catego: '',
            cate: '',

            mensaje: '',
            cant_carrito: '0',
            tot_carrito: '0',
        }
        global.actRoute='Electro'
    }

    gotoScreen(routeName) {
        this.props.navigation.navigate(routeName)
    }

    componentDidMount() {
        setTimeout(() => {
            this.cargarElectro();
        }, 1, this
        )
    };

    cargarElectro(){
        
        this.setState({ loading: true })

        fetch(this.state.url + '/' + this.state.cat + '/' + this.state.search + '/' + this.state.page + '/' + this.state.valid, {
            method: 'get',
        })
        .then(response => response.json())
        .then(data => {
            this.setState({
                cate: data.categ,
                search: data.busqueda,
                articulos: data.articulos,
                paginas: data.paginas,
                pagina: data.pagina,
                categorias: data.categorias,
                loading: false
            })
        })
        .catch((error) => {
            this.setState({
                loading: false
            })
            Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPorfavor intente de nuevo más tarde')
        })
    };

    changeBusqueda(search){
        this.setState({search})
    }

    borrarBusqueda(){
        this.setState({
            search: 'TODOS'
        })
        this.componentDidMount();
    }

    actualizarCat(id){
        this.setState({
            cat: id,
            page: 0,
            catego: id,
        })
        this.componentDidMount();
    }

    masUno(pagina){

        if(pagina < this.state.paginas ){
            this.setState({
                page: pagina+1
            })
            this.componentDidMount();
        }
    }

    menosUno(pagina){

        if(pagina > 1 ){
            this.setState({
                page: pagina-1
            })
            this.componentDidMount();
        }
    }

    addProducto(value){

        this.setState({ loading: true })

        /* fetch('https://api.progresarcorp.com.py/api/agregarProd' + '/' + value + '/' + global.cod_carrito + '/' + this.state.valid, {
            method: 'get',
        }) */

        var data = {
            valid: this.state.valid,
            cod_articulo: value,
            cod_carrito: global.cod_carrito,
        };

        fetch('https://api.progresarcorp.com.py/api/agregarProd',{
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
            global.cod_carrito=data.cod_carrito;
            global.items_carrito=data.items_carrito;
            global.total_carrito=data.total_carrito;

            Alert.alert('Éxito', 'El producto fue agregado a su carrito')
            this.gotoScreen('Carrito')
        })
        .catch((error) => {
            this.setState({
                loading: false
            })
            Alert.alert(
                'Error',
                'No pudimos añadir el producto a su carrito. \nIntentelo de nuevo más tarde'
            )
        })
    }


    render(){
        const {loading, catego, cate, articulos, cat, pagina, search, paginas, categorias} = this.state;

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

        const comprobImage = (value, item) =>{
            if(value != 'https://progresarelectrodomesticos.com/img/producto/'){
                value = item.ruta_foto
            }else{
                value = 'https://progresarelectrodomesticos.com/img/mantenimiento.png'
            }

            return value
        }

        const comprobProd = (item) =>{
            if(articulos != null){
                return(
                    <View style={styles.boxArticulo}>
                        {/* Imagen */}
                        <View style={{marginBottom: 10}}>
                            <Image 
                                style={styles.imgProd}
                                source={ {uri: comprobImage(item.ruta_foto, item)}} 
                            />
                        </View>

                        {/* Datos de los productos */}
                        <View style= {{marginBottom: 15}}>
                            <Divider color='#bf0404' />
                            <Text style={{width:'100%'}}></Text>
                            <Text style={{textAlign: 'center', padding: 1}}>{item.producto}</Text>
                            <Text style={styles.textCurrency}> Gs. {currencyFormat(item.precio)}</Text>  
                        </View>

                        {/* Botones */}
                        <View style={{flexDirection: 'row', marginBottom: 10}}>
                            <View style= {styles.boxAddCart}>
                                <TouchableOpacity 
                                    onPress={()=> this.addProducto(item.cod_articulo)}
                                    style={[styles.botAddCart, styles.bgColorRed]}
                                >
                                    <Text style={{color: 'white'}}><Icon name='shopping-cart' size={15} color='#fff' /> Añadir al carrito</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )
            }else{
                return null
            }
        }

        const Productos = (values) =>{
            if(values==''){
                return(
                    <View style={styles.boxNull}>
                        <Text/>
                        <Text style={{textAlign: 'center', marginBottom: 5}}>Su busqueda no ha arrojado ningun resultado</Text>
                        <Indicador />
                        <Text style={{textAlign: 'center', marginBottom: 5}} />
                    </View>
                )
            }else{
                return(
                    <FlatList
                        data={articulos}
                        showsVerticalScrollIndicator={false}
                        decelerationRate={0}
                        keyExtractor={(item) => item.cod_articulo}
                        renderItem={({ item, index }) => {
                            return (
                                <View >

                                    {comprobProd(item)}

                                </View>
                            )
                        }
                        }
                    />
                )
            }
        }

        const selectCateg = (item) => {
            if(item.cod_cat == catego){
                return(
                    <View style={styles.boxTouch}>
                        <TouchableOpacity
                            onPress={() => this.actualizarCat(item.id)}
                            style={{padding: 10, width: '100%', backgroundColor: '#9c9c9c', borderRadius:5}}
                        >
                            <Text style={{color: 'white', textAlign: 'center'}}>{item.categoria}</Text>    
                        </TouchableOpacity>
                    </View>
                )
            }
            else{
                return(
                    <View style={styles.boxTouch}>
                        <TouchableOpacity
                            onPress={() => this.actualizarCat(item.cod_cat)}
                            style={{padding: 10, width: '100%', backgroundColor: '#bf0404', borderRadius:5}}
                        >
                            <Text style={{color: 'white', textAlign: 'center'}}>{item.categoria}</Text>    
                        </TouchableOpacity>
                    </View>
                )
            }
        }

        var Refreshing = false;
        const onRefresh = () => {
            Refreshing = true;
            this.componentDidMount();
            Refreshing = false;
        }

        return(
            <SafeAreaView style={styles.box1}>
                <View style={{marginTop: 10, marginBottom: 15}}>
                    <Text>Buscar productos</Text>
                    <View style={{flexDirection: 'row'}}>
                        <View style={styles.busqueda}>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{width: '85%'}} >
                                    <TextInput 
                                        style={styles.input}
                                        placeholder='Buscar'
                                        value={this.state.search}
                                        selectionColor='rgba(156, 156, 156, 0.5)'
                                        onChangeText={(search) => this.changeBusqueda(search)}
                                    />
                                </View>

                                <View style={{width: '15%'}} >
                                    <TouchableOpacity
                                        onPress={()=>this.borrarBusqueda()}
                                        style={{alignItems: 'center', padding: 4}}
                                    >
                                        <Text><Icon name='times' size={20} color='#bf0404' /></Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.boxSearch}>
                            <TouchableOpacity
                                onPress={()=>this.componentDidMount()}
                                style={{width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'black',backgroundColor: 'white', padding: 4, borderRadius: 5,}}
                            >
                                <Text><Icon name='search' size={25} color='#bf0404' /></Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* categorias */}
                    <View style={{marginTop: 10}}>
                        <Text>Categorias:</Text>
                        <FlatList
                            data={categorias}
                            horizontal= {true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.cod_cat}
                            renderItem={({ item, index }) => {
                                return(
                                    <View style={styles.boxTouch}>
                                        {selectCateg(item)}
                                    </View>
                                )
                            }
                            }
                        />
                    </View>
                </View>
                <Text style={{marginBottom: 5}}>{cate} <Indicador/> - Página: {pagina}</Text>
                <ScrollView 
                    style={{marginBottom: 10}}
                    showsVerticalScrollIndicator= {false}
                    refreshControl={
                        <RefreshControl 
                            refreshing={ Refreshing }
                            onRefresh={ onRefresh }
                            colors={['#bf0404']}
                        />
                    }
                >
                    <View>
                        {Productos(articulos)}
                    </View>

                </ScrollView>

                <View style={{flexDirection: 'row', marginBottom: 20}}>
                        <View style={{width: '25%'}}>
                            <TouchableOpacity 
                                onPress={()=> this.menosUno(pagina)}
                                style={[styles.boxBtnAntSgt, styles.bgColorGrey]}
                            >
                                <Text style={{color: 'white'}}>Anterior</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={{width: '50%', alignItems: 'center'}}>
                            <View style={{padding: 8, backgroundColor: '#fff', borderRadius: 5, width: '80%', alignItems: 'center'}}>
                                <Text>{pagina} de {paginas}</Text>
                            </View>
                        </View>

                        <View style={{width: '25%', alignItems: 'flex-end'}}>
                            <TouchableOpacity 
                                onPress={()=> this.masUno(pagina)}
                                style={[styles.boxBtnAntSgt, styles.bgColorRed]}
                            >
                                <Text style={{color: 'white'}}>Siguiente</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    boxArticulo:{
        marginBottom: 15, 
        alignContent: 'center', 
        alignItems: 'center', 
        padding: 8, 
        backgroundColor: '#fff', 
        borderRadius: 5
    },
    boxTouch: {
        marginTop: 5,
        alignItems: 'center',
        alignContent: 'center',
        marginRight: 10,
    },
    boxAddCart:{
        width: '50%', 
        alignContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 5
    },
    botAddCart:{
        padding: 8,
        borderRadius: 5, 
        width: '100%', 
        alignItems: 'center'
    },
    imgProd:{
        width: 250, 
        height: 250, 
        borderRadius: 5
    },
    textCurrency:{
        textAlign: 'center', 
        fontSize: 20, 
        marginTop: 10, 
        color: '#bf0404'
    },

    boxNull:{
        margin: 5, 
        alignItems: 'center', 
        backgroundColor: 'white',
        borderRadius: 5
    },

    busqueda:{
        width: '80%', 
        alignItems: 'center', 
        borderWidth:1, 
        borderColor: 'black', 
        backgroundColor: 'white', 
        padding: 2, 
        borderRadius: 5, 
        paddingHorizontal:5
    },
    input:{
        fontSize: 12, 
        textAlign: 'center', 
        width: '100%',
        flex: 1
    },

    boxSearch:{
        width: '20%', 
        paddingHorizontal:5, 
        alignItems: 'center'
    },
    bgColorGrey:{
        backgroundColor: '#9c9c9c'
    },
    bgColorRed:{
        backgroundColor: '#bf0404'
    },
    boxBtnAntSgt:{
        padding: 8, 
        borderRadius: 5, 
        width: '100%', 
        alignItems: 'center'
    },

})