import React, { Component } from 'react';
import { 
    SafeAreaView, 
    Text, 
    View, 
    StyleSheet, 
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    FlatList,
    Alert, 
    TouchableOpacity,
    Modal,
} from 'react-native';
import * as global from '../global';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Divider } from 'react-native-elements';

export default class MisPagos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pagos:[],
            pag_tot:1,
            pag_act:0,
            loading: false,
            valid: global.valid_api_key,
        };
    }
    
    componentDidMount(){
        this.cargarPagos(this.state.pag_act);
    }

    cargarPagos(pagina){
        this.setState({loading:true})
        var data={
            'valid': this.state.valid,
            'cod_cliente': global.codigo_cliente,
            'pagina': pagina
        }

        fetch('https://api.progresarcorp.com.py/api/verPagosCli', {
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(resp => resp.json())
        .then(data =>{
            this.setState({
                pag_act:data.pag_act,
                pag_tot:data.pag_tot,
                pagos:data.pagos,
                loading:false
            })
        })
    }

    masUno(pagina){
        var page = pagina+1;
        if(pagina < this.state.pag_tot ){
            this.cargarPagos(page);
        }
    }

    menosUno(pagina){
        var page = pagina-1;
        if(pagina > 1 ){
            this.cargarPagos(page);
        }
    }

    gotoScreen(routeName, item) {
        this.props.navigation.navigate(routeName, {
            status : 'review',
            tipo: item
        })
    }

    verifyItem(item){
        if(item.estado == 'APLICADO'){
            this.gotoScreen('Confirmar Compra', item);
        }else if(item.estado != 'PENDIENTE'){
            return Alert.alert('Comprobante: '+item.cod_venta, 'Su comprobante ha sido '+item.estado.toLowerCase()+'\nConsulte el motivo con su oficial de negocios');
        }else{
            return Alert.alert('Pendiente', 'Recibo '+item.cod_venta+' aun se encuentra en estado pendiente');
        }
    }

    render() {
    const {pagos, pag_act, pag_tot, loading} = this.state;

    const comprobEstado = (item) =>{
        var color='';
        switch (item.estado) {
            case 'APLICADO':
                color='rgba(71, 164, 71, 1)'
            break;
            case 'RECHAZADO':
                color='#BF0404'
            break;
            case 'REEMBOLSADO':
                color='rgba(237, 156, 40, 1)'
            break;
            case 'PENDIENTE':
                color='grey'
            break;
        }
        return color;
    }

    const comprobEstadoIcon = (item) =>{
        var icon='';
        switch (item.estado) {
            case 'APLICADO':
                icon='check-square'
            break;
            case 'RECHAZADO':
                icon='ban'
            break;
            case 'REEMBOLSADO':
                icon='refresh'
            break;
            case 'PENDIENTE':
                icon='bell'
            break;
        }
        return icon;
    }

    const verPagosCli = () =>{
        if(pagos != ''){
            return(
                <FlatList 
                    data={pagos}
                    showsHorizontalScrollIndicator= {false}
                    keyExtractor={(item) => item.linea}
                    renderItem={({item, index}) =>{
                            return(
                                <View>
                                    <TouchableOpacity
                                        onPress={() => this.verifyItem(item)}
                                    >    
                                        <View style={{backgroundColor: comprobEstado(item), borderRadius: 5, width: '100%', padding: 8, alignItems: 'center', alignContent: 'center', marginTop: 10, marginBottom: 10, flexDirection: 'row'}}>
                                            <View style={{width: '20%'}}> 
                                                <View style={{alignItems:'center'}}>
                                                    <Icon name= {comprobEstadoIcon(item)} color='white' size={25} style={{padding: 5, borderRadius: 5}}/>
                                                </View>
                                            </View>

                                            <View style={{width: '80%', paddingHorizontal: 5}}>
                                                <View style={{flexDirection: 'row'}}>
                                                    <View style={{width: '50%'}}>
                                                        <Text style={{fontSize: 16, fontWeight: 'bold', color: 'white'}}>{item.estado}</Text>
                                                    </View>

                                                    <View style={{width: '50%'}}>
                                                        <Text style={{fontSize: 13, marginBottom: 5, color: 'white'}}>{item.fecha} </Text>
                                                    </View>
                                                </View>
                                                    <Divider style={{marginBottom: 10}}/>
                                                <Text style={{fontSize: 13, marginBottom: 5, color: 'white'}}>N° Recibo: {item.cod_venta} </Text>
                                                <Text style={{fontSize: 13, marginBottom: 5, color: 'white'}}>{item.referencia} </Text>
                                                <Text style={{fontSize: 13, marginBottom: 5, color: 'white'}}>Monto: {currencyFormat(item.monto)} </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    }
                />
            )
        }else{
            return(
                <View style={{backgroundColor: 'white', borderRadius: 5, width: '100%', padding: 10, alignItems: 'center', alignContent: 'center', marginTop: 10, marginBottom: 10}}>
                    <Text>No ha realizado ningún pago desde su cuenta</Text>
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

    return (
        <SafeAreaView style={styles.box1}>
            <ScrollView
                style={{marginBottom: 25}}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={ Refreshing }
                        onRefresh={ onRefresh }
                        colors={['#bf0404']}
                    />
                }
            >
                <Text style={{textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Mis Pagos</Text>
                <View style={{marginTop: 5}}>
                    {cargando()}
                    {verPagosCli()}
                </View>
            </ScrollView>

            <View style={{flexDirection: 'row', marginBottom: 20}}>
                <View style={{width: '25%'}}>
                    <TouchableOpacity 
                        onPress={()=> this.menosUno(pag_act)}
                        style={[styles.boxBtnAntSgt, styles.bgColorGrey]}
                    >
                        <Text style={{color: 'white'}}>Anterior</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{width: '50%', alignItems: 'center'}}>
                    <View style={{padding: 8, backgroundColor: '#fff', borderRadius: 5, width: '80%', alignItems: 'center'}}>
                        <Text>{pag_act} de {Math.round(pag_tot)}</Text>
                    </View>
                </View>

                <View style={{width: '25%', alignItems: 'flex-end'}}>
                    <TouchableOpacity 
                        onPress={()=> this.masUno(pag_act)}
                        style={[styles.boxBtnAntSgt, styles.bgColorRed]}
                    >
                        <Text style={{color: 'white'}}>Siguiente</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    );
    }
}

const styles = StyleSheet.create({
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
    box1:{ 
        flex: 1, 
        paddingHorizontal: 15, 
        width: '100%', 
        height: '100%',
        marginTop: 15
    },
    centeredView:{
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        flex: 1
    },
})
