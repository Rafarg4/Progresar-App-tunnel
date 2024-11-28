import React, {Component, useState, useEffect} from 'react'
import {
  SafeAreaView,
  View, 
  Text, 
  Image, 
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
  BackHandler,
  ActivityIndicator,
  Modal,
  Dimensions, 
  Switch,
  ScrollView
}  from 'react-native'
import * as WebBrowser from 'expo-web-browser';
import * as global from '../global.js'
import NetInfo from '@react-native-community/netinfo';
import { TextInput } from 'react-native-element-textinput';
import Icon from 'react-native-vector-icons/FontAwesome';
import {expo} from '../../app.json'
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-elements';


const maxHeight = Dimensions.get("window").height;

export default class LoginScreen extends Component{

    constructor(props){
        super(props);
        
        this.state = {
            user:'',
            pass:'',
            url: 'https://api.progresarcorp.com.py/api/ConsultarAcceso',
            valid: global.valid_api_key,
            clave:'',
            num_usu:'',
            nombre:'',
            cod_cliente:'',
            mensaje:'',
            loading:false,
            disabledButton: true,
            buttonStyle: {backgroundColor: 'rgba(191, 4, 4, 0.5)', padding: 15, borderRadius: 5, width: '90%', marginBottom: 15},
            actRuta: 'Login',
            onpress: '',
            optBio: '',
            secureText: true,
            iconShow: 'eye-slash',
            bioAvaliable: false
        }
        global.actRoute = 'Login';
    }

    cerrarSesion(){
      global.nombre= null
      global.num_doc= null
      global.num_usuario= null
      global.codigo_cliente= null
      global.user_perfil=null
      global.cod_carrito= null
      global.items_carrito= '0'
      global.total_carrito= '0'
      this.props.navigation.navigate('Login');
    }

    backAction = () => {

      var index = this.props.navigation.getState().index;
      var routeNameStack = this.props.navigation.getState().routes[index].name;

      if(routeNameStack == 'Home' || routeNameStack == 'Login'){
        if(routeNameStack == 'Home'){
          Alert.alert("¡Aguarda!", "¿Estás seguro de que quieres salir de la aplicación?", [
            {
              text: "Cancelar",
              onPress: () => null,
              style: "cancel"
            },
            { text: "Salir", onPress: () => this.cerrarSesion() }
          ]);
          return true;
        }else{
          Alert.alert("¡Aguarda!", "¿Estás seguro de que quieres salir de la aplicación?", [
            {
              text: "Cancelar",
              onPress: () => null,
              style: "cancel"
            },
            { text: "Salir", onPress: () => BackHandler.exitApp() }
          ]);
          return true;
        }
      }
    };
  
    componentDidMount() {
      this.backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        this.backAction
      );
      this.comprobActualization();
      //this.getEnabledSwitch();
      //this.getUserDoc();
    }
  
    componentWillUnmount() {
      this.backHandler.remove();
    }
    
    gotoSreen(routeName, nombre, dominio, mail){
      if(routeName=='Back'){
        this.props.navigation.goBack()
      }else{
        if(nombre == null){
          this.props.navigation.navigate(routeName)
        }else{
          this.props.navigation.navigate(routeName,{
            name: nombre,
            domine: dominio,
            email: mail
          })
        }
      }
    }

    onPresComprob(){
      NetInfo.fetch().then(state => {

        if(state.isConnected == false){
            return (
              Alert.alert('Atención', 'No posee conexión a internet, conéctese a una red e inténtelo nuevamente')
            )
        }else{
          this.getUsuario()
        }
        
      });
    }

    getUsuario = () => {
        this.setState({loading: true})

        var data = {
          valid: this.state.valid,
          user: this.state.user,
          clave: this.state.pass,
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
            //ver si la respuesta del servidor es success
            if(data.status=='success'){

              this.setState({
                clave : data.clave,
                num_usu : data.num_usu,
                cod_cliente : data.cod_cliente,
                mensaje: data.mensaje,
                nombre: data.nombre,
              })
              //verificar si las contraseñas coinciden
              if(this.state.pass===data.clave){
                global.num_doc=this.state.user
                global.nombre=data.nombre
                global.num_usuario=data.num_usu
                global.user_perfil = data.user_perfil
                this.setState({
                  pass: '',
                })
                this.getEmailVerified();
              }
            }
            else{
              this.setState({loading: false,})
              Alert.alert('Error', data.mensaje)
            }
        })
        .catch((error)=>{
          Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPor favor, inténtelo más tarde')
          this.setState({loading: false})
        })
    };

    getUserBio = (value) => {
      this.setState({loading: true})

      var data = {
        valid: this.state.valid,
        user: this.state.user,
        success: value
      };

      fetch('https://api.progresarcorp.com.py/api/ConsultarBioAcceso',{
        method: 'POST',
        body: JSON.stringify(data), 
        headers:{
            'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
          //ver si la respuesta del servidor es success
          if(data.status=='success'){
            this.setState({
              num_usu : data.num_usu,
              cod_cliente : data.cod_cliente,
              mensaje: data.mensaje,
              nombre: data.nombre,
            })
            //verificar si las contraseñas coinciden
            global.num_doc=this.state.user
            global.nombre=data.nombre
            global.codigo_cliente=data.cod_cliente
            global.num_usuario=data.num_usu
            this.getEmailVerified();
          }
          else{
            this.setState({loading: false,})
            Alert.alert('Error', data.mensaje)
          }
      })
      .catch((error)=>{
        Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor, \nPor favor, inténtelo más tarde')
        this.setState({loading: false})
      })
    };
    
    changeUser(user){
      this.setState({user})

      const jsonValue = JSON.stringify(user)
      AsyncStorage.setItem('userDoc', jsonValue);
    }

    changePass(pass){
      this.setState({pass})
    }
    
    changeContra(pass){
        pass = pass.nativeEvent.text;
        
        if(pass == ''){
          this.setState({
            disabledButton: true, 
            buttonStyle: {backgroundColor: 'rgba(191, 4, 4, 0.5)', padding: 15, borderRadius: 5, width: '90%', marginBottom: 15}
          })
        }else{
          this.setState({
            disabledButton: false, 
            buttonStyle: {backgroundColor: '#bf0404', padding: 15, borderRadius: 5, width: '90%', marginBottom: 15} 
          })
        }
    }

    getEmailVerified(){
      var data = {
        valid: this.state.valid,
        num_doc: this.state.user,
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
          this.setState({loading: false})
          if(data.email != null){
            this.gotoSreen('Verificar Email', data.nombre, data.dominio, data.email);
          }else{
            Alert.alert('Atención', 'No cuenta con un email registrado en nuestro sistema \nContáctese con su oficial de negocios para actualizar sus datos')
          }
        }else{
          this.setState({loading: false})
          this.gotoSreen('Home');
        }
      })
    }

    changeSecureText(){

      if(this.state.secureText == true){
        this.setState({secureText: false, iconShow: 'eye'});
      }else{
        this.setState({secureText: true, iconShow: 'eye-slash'});
      }
    }

    comprobActualization(){
      fetch('https://api.progresarcorp.com.py/api/actualizacion')
      .then(response => response.json())
      .then(data => {
        if(data > expo.android.versionCode){
          return Alert.alert('¡Aviso de actualización!', 'Tenemos una nueva actualización disponible de la app',
          [
              { text: "Actualizar", onPress: () => {WebBrowser.openBrowserAsync('https://play.google.com/store/apps/details?id=com.progresarcorporation.progresarmovil');} }
          ]
          );
        }
        console.log(data, expo.android.versionCode)
      })
    }

    /* changeEnabledSwitch(value){
      if(!value == false){
        this.changeUser('');
      }
      const jsonValue = JSON.stringify(!value)
      AsyncStorage.setItem('isEnabledSwitch', jsonValue)
    }

    getEnabledSwitch = async () => {
    
      try {
        const jsonValue = await AsyncStorage.getItem('isEnabledSwitch');
        var opt = JSON.parse(jsonValue);
        console.log(opt);
        this.setState({optBio: opt});
      } catch(e) {
        console.log(e);
      }

    }

    getUserDoc = async () => {
    
      try {
        const jsonValue = await AsyncStorage.getItem('userDoc');
        var opt = JSON.parse(jsonValue);
        this.setState({user: opt});
      } catch(e) {
        console.log(e);
      }

    } */

    render(){
        const {buttonStyle, disabledButton, loading, bioAvaliable, optBio, secureText, iconShow} = this.state;

        const Buton = () => {
            return(
                <TouchableOpacity 
                  style={buttonStyle}
                  onPress={()=> this.onPresComprob()}
                  disabled = {disabledButton}
                >
                  <Text style={styles.botText}> Ingresar</Text>
                </TouchableOpacity>
            )
        }

        //ajustar aun falta -- touch id
      
        const ButLogin = () => {
          // wherever the useState is located 
          const [isBiometricSupported, setIsBiometricSupported] = useState(optBio);

          // Check if hardware supports biometrics
          useEffect(() => {
            (async () => {
              const compatible = await LocalAuthentication.hasHardwareAsync();
              setIsBiometricSupported(compatible);
            })();
          });

          if(isBiometricSupported == true){
            if(optBio == true){

              if(this.state.user == ''){
                return(
                  <View style={{padding: 20}}>
                    <TouchableOpacity
                      onPress={ () => Alert.alert('Atención', 'Debe ingresar su número de documento')}
                      disabled
                    >
                      <Image 
                        style={{width: 100, height: 100}}
                        source={ require("../assets/touch-id.png")}
                      />
                    </TouchableOpacity>
                  </View>
                )
              }else{
                return(
                  <View style={{padding: 20}}>
                    <TouchableOpacity
                      onPress={onAuthenticate}
                    >
                      <Image 
                        style={{width: 100, height: 100}}
                        source={ require("../assets/touch-id.png")}
                      />
                    </TouchableOpacity>
                  </View>
                )
              }
            }else{
              return(
                <Buton />
              )
            }
          }else{
            return(
              <Buton />
            )
          }
        }


        const SwitchNumDoc = () => {

          const [isEnabled, setIsEnabled] = useState( optBio );
          
          const toggleSwitch = () => this.state.user !== '' ? [setIsEnabled(previousState => !previousState), this.changeEnabledSwitch(isEnabled)] : null;
          
          return (
            <View>
              <Switch
                trackColor={{ false: "#767577", true: "#bf0404" }}
                thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
          );
        }

        function onAuthenticate () {
          const auth = LocalAuthentication.authenticateAsync({
            promptMessage: 'Escanee su huella digital',
            fallbackLabel: 'Ingrese su contraseña',
            cancelLabel: 'Cancelar'
          });
          auth.then(result => {
            
            if(result.success == true){
              getEm(result.success);
            }
          });
        }

        const getEm = (value) => {
          this.getUserBio(value);
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

        const getYear = () => {
          var year = new Date();

          return year.getFullYear();
        }

        return(
            <SafeAreaView style={styles.box}>
              <ScrollView
                showsVerticalScrollIndicator={false}
              >
                {/* Logo de la empresa */}
                <View style={{alignItems:'center'}}>
                  <Image 
                   style={{ width: 300, height: 100, resizeMode: 'contain' }}
                    source={ require("../assets/logo-progre.png")}
                  />
                </View>
                
        
                {/* Input del ci - user */ }
                <View style={{paddingHorizontal: 15}}>
                  <Text style={styles.loginText}>N° de Cédula</Text> 
                </View>
                <View style={{paddingHorizontal: 15, alignItems: 'center'}}>
                  <TextInput
                      value={this.state.user}
                      style={styles.input}
                      inputStyle={styles.inputStyle}
                      placeholderStyle={styles.placeholderStyle}
                      textErrorStyle={styles.textErrorStyle}
                      placeholder='1234567'
                      keyboardType="numeric"
                      placeholderTextColor="gray"
                      onChangeText={(user) => this.changeUser(user)}
                      selectionColor='rgba(156, 156, 156, 0.7)'
                      showIcon={false}
                  />
                </View>

                {/* Input del password*/ }
                {bioAvaliable ? null :<View><View style={{paddingHorizontal: 15, marginTop: 10}}>
                  <Text style={styles.loginText}>Contraseña</Text> 
                </View>
                
                <View style={{paddingHorizontal: 15, alignItems: 'center'}}>
                  <TextInput
                    value={this.state.pass}
                    style={styles.input}
                    inputStyle={styles.inputStyle}
                    textErrorStyle={styles.textErrorStyle}
                    onChangeText={(pass) => this.changePass(pass)}
                    onChange={ pass => this.changeContra(pass)}
                    selectionColor='rgba(156, 156, 156, 0.5)'
                    secureTextEntry={secureText}
                    renderRightIcon={ () =>
                      <TouchableOpacity
                        onPress={() => this.changeSecureText()}
                      >
                        <Icon
                          name={iconShow}
                          color={'black'}
                          size={16}
                          style={{padding: 5}}
                        />
                      </TouchableOpacity>
                    }
                  />
                </View></View>}

                {/* Switch para recorar contraseña */}
                {/* <View style={{flexDirection: 'row', paddingHorizontal: 15}}>
                  <View style={{width: '50%'}}>
                  </View>
                  <View style={{width: '40%', paddingVertical: 8}}>
                    <Text style={styles.botOlv}>Recordar Cédula</Text>
                  </View>
                  <View style={{width: '10%'}}>
                    <SwitchNumDoc/>
                  </View>
                </View> */}

                {/* Boton de ¿Olvidó su contraseña? */}
                <View style={{alignItems: 'center', marginBottom: 5, paddingHorizontal: 15}}>
                  <TouchableOpacity
                    onPress={() => {WebBrowser.openBrowserAsync('https://secure.progresarcorp.com.py/auth/forgot-password');}}
                  >
                    <Text style={styles.botOlv}>¿Olvidó su contraseña?</Text>
                  </TouchableOpacity>
                </View>
        
                {/* Aqui se agrega el boton de login*/}
                <View style={{alignItems: 'center'}}>
                  {/* bioAvaliable ? <ButLogin/> : <Buton /> */}
                  <Buton />
                </View>
                
                {/* Solicitar Accesso */}
                <View style={{marginTop: 10, alignItems: 'flex-end', marginRight: 20}}>
                  <View style={{flexDirection:'row'}}>
                    <Text>¿No puedes ingresar? </Text>
                    <TouchableOpacity 
                      onPress={() => {WebBrowser.openBrowserAsync('https://progresarcorp.com.py/tarjetas/#solicitud');}}
                    >
                      <Text style={styles.textAcces}>Solicitar Acceso</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* botones de info */}
                <View style={styles.botonInf}>

                  {/* Fila de Servicios */}
                  <View style={styles.rowCol}>
                    {/* nuestras tc */}
                    <View style={{flexDirection:'column'}}>
                      <TouchableOpacity
                        onPress={() => this.gotoSreen('Tarjetas')}
                        style={{padding: 10, width: 100, backgroundColor: 'rgba(155,155,155,0.2)', borderRadius:5, marginHorizontal: 5}}
                      >
                        <Text style={{textAlign: 'center'}}><Icon name='credit-card' size={24} /></Text>
                      </TouchableOpacity>
                      <Text style={{textAlign:'center'}}>Tarjetas</Text>
                    </View>

                    {/* nuestras sucursales */}
                    <View style={{flexDirection:'column'}}>
                      <TouchableOpacity
                        onPress={() => this.gotoSreen('Sucursales')}
                        style={{padding: 10, width: 100, backgroundColor: 'rgba(155,155,155,0.2)', borderRadius:5, marginHorizontal: 5}}
                      >
                        <Text style={{textAlign: 'center'}}><Icon name='map' size={24} /></Text>
                      </TouchableOpacity>
                      <Text style={{textAlign:'center'}}>Sucursales</Text>
                    </View>

                    {/* nuestros prestamos */}
                    <View style={{flexDirection:'column'}}>
                      <TouchableOpacity
                        onPress={() => this.gotoSreen('Financiero')}
                        style={{padding: 10, width: 100, backgroundColor: 'rgba(155,155,155,0.2)', borderRadius:5, marginHorizontal: 5}}
                      >
                        <Text style={{textAlign: 'center'}}><Icon name='usd' size={24} /></Text>
                      </TouchableOpacity>
                      <Text style={{textAlign:'center'}}>Préstamos</Text>
                    </View>
                  </View>

                  {/* Fila de contactos */}
                  <View style={styles.rowCol}>
                    {/* llamanos */}
                    <View style={{flexDirection:'column'}}>
                      <TouchableOpacity
                        onPress={() => {
                          Linking.openURL('tel:071204877');
                        }}
                        style={{padding: 10, width: 150, backgroundColor: 'rgba(155,155,155,0.2)', borderRadius:5, marginHorizontal: 5}}
                      >
                        <Text style={{textAlign: 'center'}}><Icon name='phone' size={24} /></Text>
                      </TouchableOpacity>
                      <Text style={{textAlign:'center'}}>Llámanos</Text>
                    </View>
                    
                    {/* contactanos */}
                    <View style={{flexDirection:'column'}}>
                      <TouchableOpacity
                        onPress={() => {
                          Linking.openURL('mailto:info.progresar@prorgresarcorp.com.py');
                        }}
                        style={{padding: 10, width: 150, backgroundColor: 'rgba(155,155,155,0.2)', borderRadius:5, marginHorizontal: 5}}
                      >
                        <Text style={{textAlign: 'center'}}> <Icon name='envelope' size={24} /></Text>
                      </TouchableOpacity>
                      <Text style={{textAlign:'center'}}>Contáctanos</Text>
                    </View>
                  </View>
                </View>
        
                <Text style={{textAlign: 'center', color: 'rgba(155,155,155,0.5)', marginTop: 20}}>{getYear()} © Progresar Corporation S.A.</Text>
                <Text style={{textAlign: 'center', color: 'rgba(155,155,155,0.5)', marginTop: 5}}>Versión: {expo.version}</Text>
              </ScrollView>
              {cargando()}
            </SafeAreaView>
        ); 
    }
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },

  box: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    paddingHorizontal: 15
  },

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

  loginText:{
    fontWeight: 'bold'
  }, 

  botText:{
    textAlign:"center",
    color: '#fff',
    fontSize:16
  },

  botLogin:{
    backgroundColor: "#bf0404",
    padding: 8,
    borderRadius: 5,
    width: 300,
    marginBottom: 15
  },

  textAcces:{
    color: '#000',
    fontSize:14,
    fontWeight: 'bold'
  },

  logo:{
    width:270,
    height: 70,
    marginTop: 15,
    marginBottom:25,
    paddingHorizontal: 15
  },

  botOlv:{
    color: "black", 
    marginBottom: 15,
    marginTop:5
  },

  botonInf:{
    marginTop: 20,
    width: '100%'
  },

  rowCol:{
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },

  copy:{
    position: 'absolute',
    bottom: 15,
  },

  contact:{
    position: 'absolute',
    bottom: 15,
  },

  contAct:{
    flex: 1,
    justifyContent: "center"
  },

  horizontal:{
    flexDirection: "row",
    justifyContent: "space-around",
  },

  //estilo del Modal
  centeredView:{
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    flex: 1
  },

});