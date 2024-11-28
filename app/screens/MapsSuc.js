import React, { Component, useState } from "react";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Linking } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import * as global from '../global'
import Icon from 'react-native-vector-icons/FontAwesome';
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class Suc extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nombre: global.nombre,
            num_doc: global.num_doc,
            sucursales: [],
            loading: false,
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.cargarSuc();
        }, 100, this)

        setTimeout(() => {
            AsyncStorage.getItem('sucursal')
            .then((res)=>{
                this.setState({
                    sucursales: JSON.parse(res),
                })
            })
        }, 1000, this)
    };

    cargarSuc() {
        this.setState({loading: true})
        fetch('https://api.progresarcorp.com.py/api/ConsultaSuc', {
            method: 'get',
        })
            .then(response => response.json())
            .then(data => {
                AsyncStorage.setItem('sucursal', JSON.stringify(data))
                this.setState({ loadingTC: false })
            })
    };


    render() {
        const { sucursales, loading } = this.state;

        const Indicador = () => {
            if(loading == true){
                return ( 
                    <ActivityIndicator color="#bf0404" />
                )
            }else{
                return null
            }
        }
        const Sucursales = () => {
            if (sucursales == '') {
                return (
                    <View>
                        <Text style={{ textAlign: 'center' }}>No se encontró ninguna sucursal</Text>
                        <Indicador />
                    </View>
                )
            } else {
                return (
                    <View style={{ marginBottom: 30 }}>
                        <FlatList
                            data={sucursales}
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

                                                <View style={{ width: '100%', backgroundColor: '#bf0404', padding: 10, borderRadius: 5 }}>
                                                    <Text style={[styles.title, styles.textColor]}>{item.title}</Text>
                                                    <Text style={[styles.subtitle, styles.textColor]}>{item.subtitle}</Text>

                                                    <View style={{ marginTop: 15, alignItems: 'center'}}>
                                                        <View style={{flexDirection: 'row', width: '100%'}}>
                                                            <View style={styles.botAction}>
                                                                <TouchableOpacity
                                                                    style={{ backgroundColor: '#00D879', padding: 8, borderRadius: 5, width: '100%' }}
                                                                    onPress={() => Linking.openURL('tel:' + item.telef)}
                                                                >
                                                                    <Text
                                                                        style={[styles.subtitle, styles.textColor]}
                                                                    > <Icon name='phone' color={'white'} size={20} /> {item.telef}</Text>
                                                                </TouchableOpacity>
                                                            </View>

                                                            <View style={styles.botAction}>
                                                                <TouchableOpacity
                                                                    style={{ backgroundColor: '#ABABAB', padding: 8, borderRadius: 5 , width: '100%'}}
                                                                    onPress={() => WebBrowser.openBrowserAsync('https://www.google.com/maps/d/embed?mid=19SIFGnUrWm6j809wMeJxOt0ho8bFo8jZ&ehbc=2E312F')}
                                                                >
                                                                    <Text
                                                                        style={[styles.subtitle, styles.textColor]}
                                                                    >
                                                                        <Icon name='map' color={'white'} size={20} /> Ver Ubicación
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
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
        }

        return (
            <SafeAreaView style={styles.container}>
                <View style={{ marginBottom: 60 }}>
                    <Text style={styles.textPrinci}>¡Nuestras Sucursales!</Text>
                    <Sucursales />
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 15,
    },
    item: {
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 15,
        borderRadius: 12,
        backgroundColor: 'rgba(156, 156, 156, 0.8)'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    textColor: {
        color: 'white'
    },
    subtitle: {
        fontSize: 14,
    },

    logo: {
        width: 40,
        height: 40,
        margin: 5,
    },

    contLogo: {
        backgroundColor: '#fff',
        padding: 7,
        borderRadius: 5,
        alignContent: 'center',
        alignItems: 'center'
    },

    textPrinci: {
        textAlign: 'center',
        fontSize: 24,
        marginBottom: 5
    },
    botAction: { alignContent: 'center', alignItems: 'center', width: '47%', margin: 5 }
});
