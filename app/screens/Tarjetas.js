import React, { Component} from 'react';
import { Text, View, SafeAreaView, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
import * as global from '../global.js'
import { Divider } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView } from 'react-native-virtualized-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class TarjetasScreen extends Component{
    constructor(props) {
        super(props);

        this.state = {
            url: 'https://api.progresarcorp.com.py/api/NuestrasTC',
            valid: global.valid_api_key,

            nombre: global.nombre,
            num_doc: global.num_doc,
            num_usu: global.num_usuario,
            cod_cliente: global.codigo_cliente,

            tarjetas: [],
            loading: false,
        }
    }

    componentDidMount(){
        setTimeout(() => {
            this.cargarTCs();
        }, 1, this)

        setTimeout(() => {
            AsyncStorage.getItem('tarjetas')
            .then((res)=>{
                this.setState({
                    tarjetas: JSON.parse(res),
                })
                this.setState({ loading: false })
            })
        }, 1000, this)
    }

    cargarTCs(){
        this.setState({loading: true})
        fetch(this.state.url, {
            method: 'get',
        })
        .then(response => response.json())
            .then(data => {
                AsyncStorage.setItem('tarjetas', JSON.stringify(data))
            })
    }

    render(){
        const {tarjetas, loading} = this.state;

        const Indicador = () => {
            if(loading == true){
                return ( 
                    <ActivityIndicator color="#bf0404" />
                )
            }else{
                return null
            }
        }

        return(
            <SafeAreaView style={styles.box1}>
                <ScrollView
                    showsVerticalScrollIndicator= {false}
                >
                    <View style={{marginTop: 15, marginBottom: 10}}>
                        <Text style= {{textAlign: 'center', marginBottom: 5}}>Progresar Corporation S.A. ofrece a sus clientes variedad de tarjetas de crédito. ¡Qué esperas para elegir el tuyo!</Text>
                        <Indicador />
                        <FlatList
                            data={tarjetas}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item, index }) => {
                                return (
                                    <View>
                                        <View>
                                            <View
                                                style={styles.item}
                                            >
                                                <Image
                                                    style={{ width: '100%', height: 180, marginBottom: 15, borderRadius: 5 }}
                                                    source={{ uri: item.uri }}
                                                />

                                                <View style={{ width: '100%', backgroundColor: 'rgba(156, 156, 156, 0.7)', padding: 10, borderRadius: 5 }}>
                                                    <Text style={[styles.title, styles.textColor]}>{item.title}</Text>

                                                    <Text style={[styles.title2, styles.textColor]}>Beneficios:</Text>

                                                    <Divider style={{marginBottom: 5, backgroundColor: '#fff'}}/>

                                                    <Text style={[styles.subtitle, styles.textColor]}>{item.subtitle}</Text>

                                                    <Text style={[styles.title2, styles.textColor]}>Cobertura:</Text>

                                                    <Divider style={{marginBottom: 5, backgroundColor: '#fff'}}/>

                                                    <Text style={[styles.subtitle, styles.textColor]}>{item.cobertura}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                )
                            }}
                        />
                    </View>
                    <View style={{marginBottom: 10}}>
                        <TouchableOpacity
                            onPress={() => {WebBrowser.openBrowserAsync('https://progresarcorp.com.py/solicitud-de-tarjeta/');}}
                            style={{width: '100%', borderRadius: 5, padding: 5, backgroundColor: '#bf0404'}}
                        >
                            <Text style= {{color: 'white', textAlign: 'center'}}>Solicitar Tarjeta</Text>
                        </TouchableOpacity>
                    </View>
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

    item: {
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 15,
        borderRadius: 12,
        backgroundColor: '#fff'
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5
    },

    title2: {
        fontSize: 14,
        fontWeight: 'bold',
    },

    textColor: {
        color: 'white'
    },

    subtitle: {
        fontSize: 14,
    },
})