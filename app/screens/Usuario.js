import React, { Component, useState } from 'react';
import { Text, SafeAreaView, StyleSheet, Image, View, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as global from '../global.js'
import { Divider } from 'react-native-elements';
import { TextInput } from 'react-native-element-textinput';

export default class UsuarioScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            valid: global.valid_api_key,
            num_doc: global.num_doc,
            user_perfil: global.user_perfil,
            ModalShow: false,
            clave: '',
            claveConfirm: null,
            claveActual:null,

            nombre: '',
            num_telef: '',
            fec_nac: '',
            direccion: '',
            direc_lab: '',
            lugar_trab: '',
            antiguedad: '',
            correo: '',
            loading: false,
            secureTextActual: true, 
            iconShowActual: 'eye-slash',
            secureTextConf1: true, 
            iconShowConf1: 'eye-slash',
            secureTextConf2: true, 
            iconShowConf2: 'eye-slash'
        }
    }

    gotoScreen(routeName) {
        this.props.navigation.navigate(routeName);
    }

    componentDidMount() {
        this.traerDatosCliente();
    }

    traerDatosCliente(){
        var data = {
            valid: this.state.valid,
            num_doc: global.num_doc
        };

        fetch('https://api.progresarcorp.com.py/api/verDatosUser',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(response =>{
            this.setState({
                nombre: response[0].nombre,
                num_telef: response[0].num_telefono,
                fec_nac: response[0].fec_nacimiento,
                direccion: response[0].direccion,
                direc_lab: response[0].direccion_trab,
                lugar_trab: response[0].lugar_trabajo,
                antiguedad: response[0].antiguedad,
                correo: response[0].direc_electronica
            })
        })
        .catch((error) => {
            Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPor favor, inténtelo más tarde')
        })
    }
    bloquearAccesoApp = () => {
    Alert.alert(
        'Confirmar bloqueo',
        '¿Estás seguro que querés bloquear el acceso? Esta acción encriptará tu contraseña.',
        [
            {
                text: 'Cancelar',
                style: 'cancel'
            },
            {
                text: 'Bloquear',
                onPress: () => {
                    const data = {
                        num_doc: global.num_doc
                    };

                    fetch('https://api.progresarcorp.com.py/api/bloquear_acceso', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(res => res.json())
                    .then(response => {
                        // Validación segura, en caso de que Laravel devuelva "status" o algún mensaje
                        if (response.success || response.status === 'ok') {
                            Alert.alert('Éxito', 'Tu acceso ha sido bloqueado correctamente.');
                        } else {
                            Alert.alert('Error', response.message || 'No se pudo bloquear el acceso.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Alert.alert('Error', 'Ocurrió un problema de conexión.');
                    });
                }
            }
        ]
    );
}

    //enviar clave nueva
    claveNuevo(ant, clave) {

        this.setState({loading: true});
        var data = {
            valid: this.state.valid,
            claveAnt: ant,
            clave: clave,
            num_doc: global.num_doc
        };

        fetch('https://api.progresarcorp.com.py/api/cambiarClaveApp',{
            method: 'POST',
            body: JSON.stringify(data), 
            headers:{
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(response =>{
            if(response.status=='success'){
                this.setState({
                    ModalShow: false, 
                    loading: false, 
                    clave: '',
                    claveConfirm: null,
                    claveActual:null
                })
                Alert.alert('Cambio del Clave', response.mensaje);
            }else{
                Alert.alert('Cambio del Clave', response.mensaje);
            }
        })

    }

    changeClaveActual(claveRec){
        this.setState({claveActual: claveRec})
    }

    changeClave(claveRec){
        this.setState({clave: claveRec})
    }

    changeClaveConfirm(claveRec){
        this.setState({claveConfirm: claveRec})
    }

    changeSecureTextActual(){
        if(this.state.secureTextActual == true){
            this.setState({secureTextActual: false, iconShowActual: 'eye'});
        }else{
            this.setState({secureTextActual: true, iconShowActual: 'eye-slash'});
        }
    }

    changeSecureTextConf1(){

        if(this.state.secureTextConf1 == true){
            this.setState({secureTextConf1: false, iconShowConf1: 'eye'});
        }else{
            this.setState({secureTextConf1: true, iconShowConf1: 'eye-slash'});
        }
    }

    changeSecureTextConf2(){

        if(this.state.secureTextConf2 == true){
            this.setState({secureTextConf2: false, iconShowConf2: 'eye'});
        }else{
            this.setState({secureTextConf2: true, iconShowConf2: 'eye-slash'});
        }
    }

    render() {
        const {
            num_doc,
            user_perfil,
            ModalShow,
            clave,
            claveConfirm,
            claveActual,

            nombre,
            num_telef,
            fec_nac,
            direccion,
            direc_lab,
            lugar_trab,
            antiguedad,
            correo,
            loading,
            secureTextActual, 
            iconShowActual,
            secureTextConf1, 
            iconShowConf1,
            secureTextConf2, 
            iconShowConf2
        } = this.state

        const cambioClave = () => {
            var mensajeNoIguales= null;
            var estiloMensajeNoIguales=null;

            var mensajeNoCoincide= null;
            var estiloMensajeNoCoincide=null;

            var mensajeMayus= null;
            var estiloMensajeMayus=null;

            var mensajeNumero= null;
            var estiloMensajeNumero=null;

            var mensajeLength= null;
            var estiloMensajeLength=null;

            var numValid=0;

            if(clave == claveActual){
                mensajeNoIguales = 'No puede ser igual a la contraseña Actual';
                estiloMensajeNoIguales = {fontSize: 11, color: '#FF0000', margin: 3}
                numValid--
            }else if(claveActual != null){
                mensajeNoIguales = 'No puede ser igual a la contraseña Actual';
                estiloMensajeNoIguales = {fontSize: 11, color: 'green', margin: 3}
                numValid++
            }

            /* Validar si coiniciden */
            if(clave != claveConfirm){
                mensajeNoCoincide = 'Las contraseñas deben coincidir';
                estiloMensajeNoCoincide= {fontSize: 11, color: '#ff0000', margin: 3}
                numValid--
            }else{
                mensajeNoCoincide = 'Las contraseñas deben coincidir';
                estiloMensajeNoCoincide= {fontSize: 11, color: 'green', margin: 3}
                numValid++
            }

            /* Validar si posee Mayusculas */
            if( clave.match(/[A-Z]/) ){
                mensajeMayus = 'Contiene por lo menos una mayúscula';
                estiloMensajeMayus= {fontSize: 11, color: 'green', margin: 3}
                numValid++
            }else{
                mensajeMayus = 'Contiene por lo menos una mayúscula';
                estiloMensajeMayus= {fontSize: 11, color: '#ff0000', margin: 3}
                numValid--
            }

            /* Validar si posee algun numero */
            if(clave.match(/\d/)){
                mensajeNumero = 'Contiene por lo menos un número';
                estiloMensajeNumero= {fontSize: 11, color: 'green', margin: 3}
                numValid++
            }else{
                mensajeNumero = 'Contiene por lo menos un número';
                estiloMensajeNumero= {fontSize: 11, color: '#ff0000', margin: 3}
                numValid--
            }

            /* Validar si posee 8 caracteres */
            if(clave.length > 7){
                mensajeLength = 'Contiene por lo menos 8 caracteres';
                estiloMensajeLength= {fontSize: 11, color: 'green', margin: 3}
                numValid++
            }else{
                mensajeLength = 'Contiene por lo menos 8 caracteres';
                estiloMensajeLength= {fontSize: 11, color: '#ff0000', margin: 3}
                numValid--
            }

            const TouchCase = () =>{
                if(numValid == 5 && clave == claveConfirm){
                    return(
                        <TouchableOpacity
                            onPress={() => this.claveNuevo(claveActual, clave)}
                            style={styles.buton}
                        >
                            <Text style={{textAlign: 'center'}}>Cambiar Clave</Text>
                        </TouchableOpacity>
                    )
                }
                else{
                    return(
                        <TouchableOpacity
                            onPress={() => null}
                            style={styles.butonDisabled}
                            disabled
                        >
                            <Text style={styles.textDisabled}>Cambiar Clave</Text>
                        </TouchableOpacity>
                    )
                }
            }

            return (
                <View style={styles.centeredView}>
                    <Modal
                        animationType='slide'
                        transparent
                        visible={ModalShow}
                    >
                        <View style={[styles.centeredView, {backgroundColor: 'rgba(255,255,255, 0.9)'}]}>
                            <View style={styles.modalView}>
                                <View>
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{width: '90%'}}>
                                            <Text style={styles.textTile}>Cambiar Clave</Text>
                                        </View>
                                        <View style={{width: '10%', padding: 10}}>
                                            <TouchableOpacity
                                                onPress={ () => this.setState({ModalShow: false}) }
                                            >
                                                <Icon name='times' size={15} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <Divider style={{ marginBottom: 10 }} />
                                </View>

                                <View>

                                    <Text style={styles.modalText}>Ingrese una nueva clave de acceso.</Text>
                                    <Text>Recuerde que la nueva contraseña debe contener números y letras</Text>

                                    {/* Ingresar Contraseña Actual */}
                                    <View style={{ marginTop: 15 }}>
                                        <TextInput
                                            value={claveActual}
                                            style={styles.input}
                                            inputStyle={styles.inputStyle}
                                            labelStyle={styles.labelStyle}
                                            placeholderStyle={styles.placeholderStyle}
                                            textErrorStyle={styles.textErrorStyle}
                                            label="Contraseña Actual"
                                            placeholder="********"
                                            secureTextEntry={secureTextActual}
                                            showIcon={true}
                                            placeholderTextColor="gray"
                                            selectionColor='rgba(156, 156, 156, 0.5)'
                                            onChangeText={text => {
                                                this.changeClaveActual(text);
                                            }}
                                            renderRightIcon={ () =>
                                                <TouchableOpacity
                                                    onPress={() => this.changeSecureTextActual()}
                                                >
                                                    <Icon
                                                    name={iconShowActual}
                                                    color={'black'}
                                                    size={16}
                                                    style={{padding: 5}}
                                                    />
                                                </TouchableOpacity>
                                            }
                                        />
                                    </View>
                                    
                                    {/* Ingresar nueva Contraseña */}
                                    <View style={{ marginTop: 15 }}>
                                        <TextInput
                                            value={clave}
                                            style={styles.input}
                                            inputStyle={styles.inputStyle}
                                            labelStyle={styles.labelStyle}
                                            placeholderStyle={styles.placeholderStyle}
                                            textErrorStyle={styles.textErrorStyle}
                                            label="Contraseña Nueva"
                                            placeholder="********"
                                            secureTextEntry={secureTextConf1}
                                            showIcon={true}
                                            placeholderTextColor="gray"
                                            selectionColor='rgba(156, 156, 156, 0.5)'
                                            onChangeText={text => {
                                                this.changeClave(text);
                                            }}
                                            renderRightIcon={ () =>
                                                <TouchableOpacity
                                                    onPress={() => this.changeSecureTextConf1()}
                                                >
                                                    <Icon
                                                    name={iconShowConf1}
                                                    color={'black'}
                                                    size={16}
                                                    style={{padding: 5}}
                                                    />
                                                </TouchableOpacity>
                                            }
                                        />
                                    </View>

                                    {/* Confirmar nueva Contraseña */}
                                    <View style={{ marginTop: 15 }}>
                                        <TextInput
                                            value={claveConfirm}
                                            style={styles.input}
                                            inputStyle={styles.inputStyle}
                                            labelStyle={styles.labelStyle}
                                            placeholderStyle={styles.placeholderStyle}
                                            textErrorStyle={styles.textErrorStyle}
                                            label="Confirmar Contraseña"
                                            placeholder="********"
                                            secureTextEntry={secureTextConf2}
                                            showIcon={true}
                                            placeholderTextColor="gray"
                                            selectionColor='rgba(156, 156, 156, 0.5)'
                                            onChangeText={text => {
                                                this.changeClaveConfirm(text);
                                            }}
                                            renderRightIcon={ () =>
                                                <TouchableOpacity
                                                    onPress={() => this.changeSecureTextConf2()}
                                                >
                                                    <Icon
                                                    name={iconShowConf2}
                                                    color={'black'}
                                                    size={16}
                                                    style={{padding: 5}}
                                                    />
                                                </TouchableOpacity>
                                            }
                                        />
                                    </View>

                                    <View style={{marginTop: 15}}>
                                        <Text style={{textAlign: 'center'}}>
                                            <Icon name="exclamation-triangle" size={14} color="#bf0404" style={{padding: 10}} />
                                        </Text>
                                        
                                        <Text style={{textAlign: 'center'}}>
                                            La contraseña debe cumplir estos requisitos
                                        </Text>

                                        <Divider/>
                                        <Text></Text>
                                        
                                        <Text style={estiloMensajeNoCoincide}>
                                            <Icon name="lock" size={14} color="green"/> 
                                            &nbsp;
                                            {mensajeNoCoincide}
                                        </Text>

                                        <Text style={estiloMensajeMayus}>
                                            <Icon name="font" size={14} color="green"/>
                                            &nbsp;
                                            {mensajeMayus}
                                        </Text>

                                        <Text style={estiloMensajeNumero}>
                                            <Icon name="sort-numeric-asc" size={14} color="green"/>
                                            &nbsp;
                                            {mensajeNumero}
                                        </Text>

                                        <Text style={estiloMensajeLength}>
                                            <Icon name="caret-right" size={14} color="green"/>
                                            &nbsp;
                                            {mensajeLength}
                                        </Text>

                                        <Text style={estiloMensajeNoIguales}>
                                            {mensajeNoIguales}
                                        </Text>
                                    </View>

                                </View>

                                <View style={styles.contButon}>
                                    <View style={styles.contTouch}>

                                        <TouchableOpacity
                                            onPress={() => this.setState({ ModalShow: false }) }
                                            style={[styles.buton, { backgroundColor: '#BF0404', borderColor: '#BF0404' }]}
                                        >
                                            <Text style={{ textAlign: 'center', color: 'white' }}>Cancelar</Text>
                                        </TouchableOpacity>

                                    </View>

                                    <View style={styles.contTouch}>

                                        <TouchCase />

                                    </View>
                                </View>
                            </View>
                        </View>

                    </Modal>
                </View>
            )
        }

        const pantCargando = () => {
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

        const PerfilUser = () => {
            if (user_perfil == null) {
                return (
                    <Image
                        style={{ width: 100, height: 100, borderRadius: 100, marginTop: 5, marginBottom: 15 }}
                        source={{ uri: 'https://secure.progresarcorp.com.py/images/2.0/hombre.png' }}
                    />

                )
            } else {
                return (
                    <Image
                        style={{ width: 100, height: 100, borderRadius: 100, marginTop: 5, marginBottom: 15 }}
                        source={{ uri: 'https://secure.progresarcorp.com.py' + user_perfil }}
                    />
                )
            }
        }

        return (
            <SafeAreaView style={styles.box1}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                >
                   <View style={styles.topSal}>
                        <PerfilUser />
                        <Text style={styles.textNom}>
                            {nombre}
                        </Text>

                        {/* Contenedor de los dos botones lado a lado */}
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            {/* Botón Cambiar Contraseña */}
                            <TouchableOpacity
                                onPress={() => this.setState({ ModalShow: true })}
                                style={{
                                    backgroundColor: '#bf0404',
                                    padding: 5,
                                    borderRadius: 5,
                                    flex: 1
                                }}
                            >
                                <Text style={{ color: 'white', textAlign: 'center' }}>
                                    <Icon name='key' color='white' /> Cambiar Contraseña
                                </Text>
                            </TouchableOpacity>

                            {/* Botón Bloquear acceso */}
                            <TouchableOpacity
                                onPress={() => this.bloquearAccesoApp()} // <-- definí esta función
                                style={{
                                    backgroundColor: '#bf0404',
                                    padding: 5,
                                    borderRadius: 5,
                                    flex: 1
                                }}
                            >
                                <Text style={{ color: 'white', textAlign: 'center' }}>
                                    <Icon name='lock' color='white' /> Bloquear acceso
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                    {cambioClave()}

                    {pantCargando()}

                    {/* Nombre */}
                    <View style={{ padding: 8, backgroundColor: '#bf0404', borderRadius: 5 }}>
                        <Text style={{ color: 'white' }}>Nombres:</Text>
                    </View>

                    <TextInput
                        style={styles.inputOne}
                        inputStyle={{fontSize: 14}}
                        value={nombre}
                        disabled={true}
                        editable={false}
                        showIcon={false}
                    />

                    {/* Nro Documento */}
                    <View style={{ padding: 8, backgroundColor: '#bf0404', borderRadius: 5 }}>
                        <Text style={{ color: 'white' }}>N° Documento:</Text>
                    </View>

                    <TextInput
                        style={styles.inputOne}
                        inputStyle={{fontSize: 14}}
                        value={num_doc}
                        disabled={true}
                        editable={false}
                        showIcon={false}
                    />

                    {/* email */}
                    <View style={{ padding: 8, backgroundColor: '#bf0404', borderRadius: 5 }}>
                        <Text style={{ color: 'white' }}>Email:</Text>
                    </View>

                    <TextInput
                        style={styles.inputOne}
                        inputStyle={{fontSize: 14}}
                        value={correo}
                        disabled={true}
                        editable={false}
                        showIcon={false}
                    />

                    {/* lugar de trabajo */}
                    <View style={{ padding: 8, backgroundColor: '#bf0404', borderRadius: 5 }}>
                        <Text style={{ color: 'white' }}>Lugar de trabajo:</Text>
                    </View>

                    <TextInput
                        style={styles.inputOne}
                        inputStyle={{fontSize: 14}}
                        value={lugar_trab}
                        disabled={true}
                        editable={false}
                        showIcon={false}
                    />

                    {/* Numero de telefono */}
                    <View style={{ padding: 8, backgroundColor: '#bf0404', borderRadius: 5 }}>
                        <Text style={{ color: 'white' }}>Número de Teléfono:</Text>
                    </View>

                    <TextInput
                        style={styles.inputOne}
                        inputStyle={{fontSize: 14}}
                        value={num_telef}
                        disabled={true}
                        editable={false}
                        showIcon={false}
                    />

                    {/* direccion laboral */}
                    <View style={{ padding: 8, backgroundColor: '#bf0404', borderRadius: 5 }}>
                        <Text style={{ color: 'white' }}>Dirección Laboral:</Text>
                    </View>

                    <TextInput
                        style={styles.inputOne}
                        inputStyle={{fontSize: 14}}
                        value={direc_lab}
                        disabled={true}
                        editable={false}
                        showIcon={false}
                    />

                    {/* direccion particular */}
                    <View style={{ padding: 8, backgroundColor: '#bf0404', borderRadius: 5 }}>
                        <Text style={{ color: 'white' }}>Dirección Particular:</Text>
                    </View>

                    <TextInput
                        style={styles.inputOne}
                        inputStyle={{fontSize: 14}}
                        value={direccion}
                        disabled={true}
                        editable={false}
                        showIcon={false}
                    />

                    {/* Antiguedad */}
                    <View style={{ padding: 8, backgroundColor: '#bf0404', borderRadius: 5 }}>
                        <Text style={{ color: 'white' }}>Antigüedad:</Text>
                    </View>

                    <TextInput
                        style={styles.inputOne}
                        inputStyle={{fontSize: 14}}
                        value={antiguedad}
                        disabled={true}
                        editable={false}
                        showIcon={false}
                    />
                    
                    <View style={styles.info}>
                        <Icon name="info-circle" size={30} color="#bf0404" style={{margin: 10}} />
                        <Text>Si desea cambiar su información, presione el siguiente botón.</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.boton, {marginBottom: 30} ]}
                        onPress={() => { WebBrowser.openBrowserAsync('https://secure.progresarcorp.com.py'); }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center' }}>Actualizar mis datos</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    topSal: {
        backgroundColor: 'rgba(156, 156, 156, 0.8)',
        marginTop: 15,
        marginBottom: 10,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center'
    },

    textSal: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 5
    },

    textNom: {
        color: 'white',
        marginBottom: 10,
        textAlign: 'center'
    },

    box1: {
        flex: 1,
        paddingHorizontal: 15,
        marginTop: 5,
        width: '100%',
        height: '100%',
    },

    inputOne: {
        textAlign: 'center',
        padding: 8,
        height: 35,
        width: '100%',
        marginBottom: 15,
        marginTop: 5,
        borderColor: "rgba(156, 156, 156, 0.2)",
        borderWidth: 1,
        borderRadius: 5,
        color: '#000'
    },
    boton: {
        backgroundColor: 'rgba(156, 156, 156, 1)', padding: 8,
        borderRadius: 5, width: 300, marginTop: 10, width: '100%'
    },
    info: { marginLeft: 8, flexDirection: 'row', alignItems: 'center', alignContent: 'center', width: '85%' },

    //input style
    container: {
        padding: 2,
    },
    input: {
        height: 48,
        paddingHorizontal: 15,
        borderRadius: 5,
        borderWidth: 0.8,
        borderColor: 'rgba(156, 156, 156, 0.8)',
    },
    inputStyle: { fontSize: 14 },
    labelStyle: {
        fontSize: 14,
        position: 'absolute',
        top: -10,
        backgroundColor: 'white',
        marginLeft: -4,
        color: 'rgba(156, 156, 156, 0.8)',
    },
    placeholderStyle: { fontSize: 14 },
    textErrorStyle: { fontSize: 14 },

    //estilo del Modal
    centeredView: {
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        flex: 1
    },
    modalView: {
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
    textTile: {
        color: 'black',
        textAlign: 'center',
        fontSize: 20,
        marginTop: 15,
        marginBottom: 15
    },
    okStyle: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
    },
    modalText: {
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

    contButon: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
        marginTop: 15
    },

    contTouch: {
        alignItems: 'center',
        width: '50%',
        padding: 5
    },

    buton: {
        width: '100%',
        borderRadius: 5,
        borderColor: '#9c9c9c',
        borderWidth: 1,
        padding: 5,
    },

    butonDisabled: {
        width: '100%',
        borderRadius: 5,
        borderColor: 'rgba(156, 156, 156, 0.5)',
        borderWidth: 1,
        padding: 5,
    },

    textDisabled: { 
        textAlign: 'center', 
        color: 'rgba(156, 156, 156, 0.7)', 
    },
})