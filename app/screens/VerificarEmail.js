import React, { Component } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ActivityIndicator} from 'react-native';
import * as global from '../global';
import Toast from 'react-native-toast-message';

export default class VerificarEmail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nombre: props.route.params.name,
            dominio: props.route.params.domine,
            email: props.route.params.email,
            valid: global.valid_api_key,
            disabledButton: false,
            styleButton: {backgroundColor: '#bf0404', padding: 5, width: '100%', alignItems: 'center', borderRadius: 5},
            verify: false
        }
    }

    componentDidMount() {
        this.enviarMail();
        this.verifyMail();
    }

    enviarMail(){
        var data = {
            valid : this.state.valid,
            email: this.state.email,
            nombre: global.nombre,
            num_doc: global.num_doc,
            cod_cliente: global.codigo_cliente
        }

        fetch('https://secure.progresarcorp.com.py/api/env-mail-Verificar', {
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                'Content-Type': 'application/json'
            }
        })
    }

    verifyMail(){
        var data = {
            valid: this.state.valid,
            num_doc: global.num_doc,
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
                setTimeout(()=>{
                    this.verifyMail()
                }, 5000, this)
            }else{
                
                this.setState({verify: true})
                setTimeout(() => {
                    this.gotoScreen('Home');
                    this.setState({verify: false})
                }, 4000, this)
            }
        })
    }

    gotoScreen(routeName){
        if(routeName == 'Login'){
                global.nombre= null
                global.num_doc= null
                global.num_usuario= null
                global.codigo_cliente= null
                global.user_perfil=null
                global.cod_carrito= null
                global.items_carrito= '0'
                global.total_carrito= '0'
                this.props.navigation.navigate(routeName)
        }else{
            this.props.navigation.navigate(routeName)
        }
    }

    render() {

        const {disabledButton, styleButton, verify} = this.state;

        const buttonEnvMail = () => {
            if(verify == true){
                return(
                    <TouchableOpacity
                        disabled = {disabledButton}
                        style={styleButton}
                    >
                        <ActivityIndicator size='small' color='white' />
                    </TouchableOpacity>
                )
            }else{
                return(
                    <TouchableOpacity
                        disabled = {disabledButton}
                        onPress={()=> [this.enviarMail(), showToast()]}
                        style={styleButton}
                    >
                        <Text style={{color: 'white'}}>Volver a enviar email</Text>
                    </TouchableOpacity>
                )
            }
        }

        const showToast = () => {
            this.setState({
                disabledButton: true,
                styleButton: {backgroundColor: 'rgba(191, 4, 4, 0.5)', padding: 5, width: '100%', alignItems: 'center', borderRadius: 5}
            });
            Toast.show({
                type: 'success',
                text1: 'Email enviado',
                text2: 'Por favor, verifique su email 😁'
            });

            setTimeout(() => {
                this.setState({
                    disabledButton: false,
                    styleButton: {backgroundColor: '#bf0404', padding: 5, width: '100%', alignItems: 'center', borderRadius: 5}
                });
            }, 10000, this)
        }

        return (
            <SafeAreaView style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Toast />

                <View style={{backgroundColor: 'white', alignItems: 'center', padding: 10, borderRadius: 5, width: '95%'}}>          

                    <View style={{backgroundColor: 'white', alignItems: 'center', padding: 5}}>
                        <View style={{marginTop:10, marginBottom:10, alignItems: 'center'}}>
                            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15}}>¡Gracias por ingresar a nuestro Sistema!</Text>
                            <Image 
                                style={{
                                    width: 60,
                                    height: 60,
                                }}
                                source={ {uri: 'https://secure.progresarcorp.com.py/images/2.0/recursos/email.png'}}
                            />
                            <Text style={{fontSize: 12, marginTop: 10}}>Para continuar debe verificar su email.</Text>
                            <Text></Text>
                            <Text style={{fontSize: 14, marginTop: 10, textAlign: 'center'}}>Le hemos enviado un email de verificación a su correo </Text>
                            <Text style={{fontSize: 14, textAlign: 'center', fontWeight: 'bold'}}>{this.state.nombre}@{this.state.dominio}</Text>
                            <Text style={{fontSize: 14, textAlign: 'center'}}> registrado en nuestro sistema </Text>
                        </View>
                    </View>
                    
                    <View style={{width: '100%', marginTop: 15, marginBottom: 15}}>
                        {buttonEnvMail()}
                    </View>

                    <View style={{width: '90%', marginTop: 15, marginBottom: 10}}>
                        <TouchableOpacity
                            onPress={ () => this.gotoScreen('Login')}
                            style={{backgroundColor: '#9c9c9c', padding: 5, width: '100%', alignItems: 'center', borderRadius: 5}}
                        >
                            <Text style={{color: 'white'}}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}