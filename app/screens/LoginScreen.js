import React, {Component, useState, useEffect } from 'react'
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

const { width } = Dimensions.get('window');

const maxHeight = Dimensions.get("window").height;

export default class LoginScreen extends Component{

    constructor(props){
        super(props);
        
        this.state = {
            user:'',
            pass:'',
            url: 'https://api.progresarcorp.com.py/api/ver_clave',
            valid: global.valid_api_key,
            clave:'',
            num_usu:'',
            nombre:'',
            token: '',
            cod_cliente:'',
            mensaje:'',
            loading:false,
            disabledButton: true,
            buttonStyle: {
                backgroundColor: 'rgba(191, 4, 4, 1)', // 👈 Totalmente opaco
                padding: 15,
                borderRadius: 5,
                width: '90%',
                marginBottom: 15
              },
            actRuta: 'Login',
            onpress: '',
            optBio: '',
            secureText: true,
            metodoLogin: 'password',
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

      if(routeNameStack == 'InicioApp' || routeNameStack == 'Login'){
        if(routeNameStack == 'InicioApp'){
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
verificarBiometria = async () => {
  const tipos = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const disponible = await LocalAuthentication.hasHardwareAsync();
  const guardado = await LocalAuthentication.isEnrolledAsync();

  if (!disponible || !guardado) {
    Alert.alert('Biometría no disponible', 'No se detectó autenticación biométrica configurada.');
    return;
  }

  // Elegir tipo
  let tipoBiometria = 'biometría';
  if (tipos.includes(1)) tipoBiometria = 'Huella Digital';
  if (tipos.includes(2)) tipoBiometria = 'Reconocimiento Facial';

  Alert.alert(
    `¿Usar ${tipoBiometria}?`,
    `Se detectó ${tipoBiometria} en este dispositivo.`,
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sí',
        onPress: () => this.intentarLoginBiometrico(),
      },
    ]
  );
};
//Consulta para la api
  getUsuario = () => {
  this.setState({ loading: true });

  const data = {
    valid: this.state.valid,
    user: this.state.user,
    clave: this.state.pass,
  };

  console.log('📤 Enviando a la API:', data);

  fetch(this.state.url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((dataResponse) => {
      if (dataResponse.status === 'success') {
        this.setState(
          {
            clave: dataResponse.clave,
            pass: dataResponse.clave,
            num_usu: dataResponse.num_usu,
            cod_cliente: dataResponse.cod_cliente,
            mensaje: dataResponse.mensaje,
            nombre: dataResponse.nombre,
             token: dataResponse.token,
          },
          () => {
            if (this.state.pass === dataResponse.clave) {
              global.num_doc = this.state.user;
              global.nombre = dataResponse.nombre;
              global.token = dataResponse.token;
              global.num_usuario = dataResponse.num_usu;
              global.user_perfil = dataResponse.user_perfil;
 
              // Guardar datos en AsyncStorage, sin await ni callback
              AsyncStorage.setItem('usuarioGuardado', this.state.user)
                .catch((e) => console.log('Error guardando usuario:', e));
              AsyncStorage.setItem('claveGuardada', this.state.pass)
                .catch((e) => console.log('Error guardando clave:', e));
              AsyncStorage.setItem('nombreUsuario', dataResponse.nombre)
                .catch((e) => console.log('Error guardando nombre:', e));
              AsyncStorage.setItem('nombreToken', dataResponse.token)
                .catch((e) => console.log('Error guardando token:', e));

              // No limpiar pass acá, para evitar pérdida
               this.setState({ pass: '' });

              this.getEmailVerified();
            }
          }
        );
      } else {
        this.setState({ loading: false });
        Alert.alert('Error', dataResponse.mensaje);
      }
    })
    .catch((error) => {
      Alert.alert(
        'Error',
        'No pudimos conectarnos a nuestro servidor, \nPor favor, inténtelo más tarde'
      );
      this.setState({ loading: false });
    });
};

componentDidMount() {
this.cargarNombreGuardado(); // Solo el nombre
}
 
//Valida si esta configurado la contraseña 
intentarLoginBiometrico = async () => {
  try {
    // Aquí haces la llamada a tu método de autenticación biométrica
    const resultadoBiometrico = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentícate con biometría',
    });

    if (resultadoBiometrico.success) {
      // Si autenticación OK, cargo user y clave guardados
      const userGuardado = await AsyncStorage.getItem('usuarioGuardado');
      const claveGuardada = await AsyncStorage.getItem('claveGuardada');

      if (userGuardado && claveGuardada) {
        // Actualizo el estado con esos datos para usarlos en getUsuario
        this.setState(
          { user: userGuardado, pass: claveGuardada, valid: true },
          () => {
            // Llamo a getUsuario para validar en la API con esos datos
            this.getUsuario();
          }
        );
      } else {
        Alert.alert('Error', 'No se encontraron credenciales guardadas');
      }
    } else {
      Alert.alert('Error', 'Autenticación biométrica fallida');
    }
  } catch (error) {
    console.log('Error en autenticación biométrica:', error);
    Alert.alert('Error', 'Ocurrió un problema con la autenticación biométrica');
  }
};
//Para mostrar datos en el avatar
 cargarNombreGuardado = async () => {
  try {
    const nombreGuardado = await AsyncStorage.getItem('nombreUsuario');
    if (nombreGuardado) {
      this.setState({ nombre: nombreGuardado });
    }
  } catch (error) {
    console.log('Error al cargar el nombre:', error);
  }
};

//Para cargar los datos
cargarDatosBiometria = async () => {
  try {
    const usuarioGuardado = await AsyncStorage.getItem('usuarioGuardado');
    const claveGuardada = await AsyncStorage.getItem('claveGuardada');
    const nombreGuardado = await AsyncStorage.getItem('nombreUsuario'); // ⬅️ nuevo
    if (usuarioGuardado && claveGuardada) {
      this.setState({
        user: usuarioGuardado,
        pass: claveGuardada,
        nombre: nombreGuardado || '',
      });
    }
  } catch (error) {
    console.log('Error al cargar datos biométricos:', error);
  }
};
//Muestra la opcion para huella y demas
handleBiometria = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirma tu identidad',
      fallbackLabel: 'Usar contraseña',
    });

    if (result.success) {
      console.log('Biometría OK');
      
      // Aquí llama a getUsuario para enviar usuario y clave a la API
      this.getUsuario();
    } else {
      Alert.alert('Error', 'No se pudo autenticar con biometría');
    }
  } catch (error) {
    console.log('Error en autenticación biométrica:', error);
    Alert.alert('Error', 'Hubo un problema con la autenticación biométrica');
  }
};
//Para borrar lo del storage
 handleLogout = async () => {
  try {
    await AsyncStorage.removeItem('usuarioGuardado');
    await AsyncStorage.removeItem('claveGuardada');
    await AsyncStorage.removeItem('nombreUsuario');

    Alert.alert('Atención', 'Se ha cerrado sesión correctamente');

    this.props.navigation.replace('Login');
  } catch (error) {
    console.log('Error al cerrar sesión:', error);
    Alert.alert('Error', 'Ocurrió un problema al cerrar sesión');
  }
};

//Verifica si tiene las opciones para el biometrico
verificarDatosBiometricos = async () => {
  try {
    const biometricoHabilitado = await AsyncStorage.getItem('biometricoHabilitado');
    const usuarioGuardado = await AsyncStorage.getItem('usuarioGuardado');
    const claveGuardada = await AsyncStorage.getItem('claveGuardada');
    const nombreUsuario = await AsyncStorage.getItem('nombreUsuario');
    const nombreToken = await AsyncStorage.getItem('nombreToken');

    const tieneHardware = await LocalAuthentication.hasHardwareAsync();
    const estaRegistrado = await LocalAuthentication.isEnrolledAsync();

    console.log('Tiene lector biométrico:', tieneHardware);
    console.log('Tiene huella/FaceID configurada:', estaRegistrado);

    if (
      biometricoHabilitado === 'true' &&
      usuarioGuardado &&
      claveGuardada &&
      tieneHardware &&
      estaRegistrado
    ) {
      this.setState({
        metodoLogin: 'biometria',
        user: usuarioGuardado,
        pass: claveGuardada,
        nombre: nombreUsuario,
        token: nombreToken,
        mostrarBotonBiometrico: true,
      });

      // Llamar directamente a la autenticación biométrica
      this.intentarLoginBiometrico();
    } else {
      this.setState({
        metodoLogin: 'password',
        mostrarBotonBiometrico: false,
      });
    }
  } catch (error) {
    console.log('Error al verificar datos biométricos:', error);
  }
};
//Para que complete los campos para mandar a la api
activarModoBiometrico = async () => {
  try {
    const usuarioGuardado = await AsyncStorage.getItem('usuarioGuardado');
    const claveGuardada = await AsyncStorage.getItem('claveGuardada');

    this.setState({
      metodoLogin: 'biometria',
      user: usuarioGuardado || '',
      pass: claveGuardada || '',
    });

    console.log('📥 Cargado desde storage:', usuarioGuardado, claveGuardada);
  } catch (error) {
    console.log('⚠️ Error al cargar datos del storage:', error);
  }
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
          this.gotoSreen('InicioApp');
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

      const verDatosGuardados = async () => {
        try {
          const usuario = await AsyncStorage.getItem('usuarioGuardado');
          const clave = await AsyncStorage.getItem('claveGuardada');
          const nombre = await AsyncStorage.getItem('nombreUsuario');
          const token = await AsyncStorage.getItem('nombreToken');
          const cliente = await AsyncStorage.getItem('cliente'); // si usaste autenticarCliente()

          console.log('📦 Usuario:', usuario);
          console.log('🔑 Clave:', clave);
          console.log('🙋‍♂️ Nombre:', nombre);
            console.log('🙋‍♂️ Token:', token);

          if (cliente) {
            const clienteParsed = JSON.parse(cliente);
            console.log('🧾 Cliente completo:', clienteParsed);
          } else {
            console.log('❌ No hay cliente guardado');
          }
        } catch (error) {
          console.error('❌ Error al leer AsyncStorage:', error);
        } 
      }; 
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
        const getIniciales = () => {
          const { nombre } = this.state;
          if (!nombre || nombre.trim() === '') return 'U'; 
          const nombres = this.state.nombre.trim().split(' ');
          if (nombres.length === 1) return nombres[0].charAt(0).toUpperCase();
          return nombres[0].charAt(0).toUpperCase() + '|' + nombres[1].charAt(0).toUpperCase();
        } 
        const saludoNombre = this.state.nombre ? this.state.nombre : 'Usuario';

        return(
            <SafeAreaView style={styles.box}>
            <View style={{ position: 'absolute', top: 240, left: 25, zIndex: 10 }}>
                <TouchableOpacity onPress={this.handleLogout}>
                  <Icon name="sign-out" size={28} color="#bf0404" />
                </TouchableOpacity>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
              >
                {/* Logo de la empresa */}
                <View style={styles.container}>
                <Image  
                  style={styles.headerImage}
                  source={{ uri: 'https://progresarcorp.com.py/wp-content/uploads/2025/04/logo-nuevo-3.png' }}
                />
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{getIniciales()}</Text>
                </View>

                {/* Texto de saludo debajo */}
                <Text style={styles.greetingText}>Hola, {saludoNombre}</Text>

                {/* Vista blanca con borde redondeado invertido para crear la curva hacia abajo */}
                <View style={styles.curvedWhite} />

                <View style={styles.formContainer}>
                  {/* Aquí iría tu formulario */}
                </View>

              </View>
             <View style={{flexDirection: 'row', justifyContent: 'center', marginVertical: 10}}>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  this.state.metodoLogin === 'password' && styles.selectorButtonSelected,
                ]}
                onPress={() => {
                  this.setState({ metodoLogin: 'password' }, () => {
                    this.setState({ user: '', pass: '' }); // Limpiar solo al cambiar a password
                  });
                }}
              >
                <Text style={styles.selectorText}>Contraseña</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  this.state.metodoLogin === 'biometria' && styles.selectorButtonSelected,
                ]}
                onPress={() => {
                  this.setState({ metodoLogin: 'biometria' }, () => {
                    this.cargarDatosBiometria(); // Cargar datos solo al cambiar a biometría
                  });
                }}
              >
                <Text style={styles.selectorText}>Biometría</Text>
              </TouchableOpacity>
              </View>
              {this.state.metodoLogin === 'password' && (
                <>
                 {/* Campo Cédula */}
                <View style={{ paddingHorizontal: 15 }}>
                  <Text style={styles.loginText}>N° de Cédula</Text>
                </View>
                <View style={{ paddingHorizontal: 15, alignItems: 'center' }}>
                  <TextInput
                    value={this.state.user}
                    style={styles.input}
                    placeholder='1234567'
                    keyboardType="numeric"
                    placeholderTextColor="gray"
                    onChangeText={(user) => this.changeUser(user)}
                  />
                </View>

                {/* Campo Contraseña */}
                <View style={{ paddingHorizontal: 15, marginTop: 10 }}>
                  <Text style={styles.loginText}>Contraseña</Text>
                </View>
                <View style={{ paddingHorizontal: 15, alignItems: 'center' }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: '#ccc',
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    height: 55,
                     borderColor: "#bf0404",
                    width: '100%',
                    backgroundColor: 'white',
                  }}>
                    <TextInput
                      value={this.state.pass}
                      style={{ flex: 1, color: '#000' }}
                      onChangeText={(pass) => this.changePass(pass)}
                      secureTextEntry={this.state.secureText}
                      placeholder="Contraseña"
                      placeholderTextColor="gray"
                    />
                    <TouchableOpacity onPress={() => this.setState({ secureText: !this.state.secureText })}>
                      <Text style={{ fontSize: 18, color: 'gray' }}>
                        {this.state.secureText ? '🔒' : '🔓'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
                </>
              )}
              
              {this.state.metodoLogin === 'biometria' && (
                <View style={{ padding: 20 }}>
                  <TouchableOpacity onPress={this.handleBiometria} style={styles.botonBiometrico}>
                    <Text style={{ color: 'white', textAlign: 'center' }}><Icon name="lock" size={18} color="white" style={{ marginRight: 8 }} /> Autenticarse con biometría</Text>
                  </TouchableOpacity>
                </View>
              )}

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
                
                {/* Solicitar Accesso */}
                <View style={{marginTop: 10, alignItems: 'flex-end', marginRight: 20}}>
                  <View style={{flexDirection:'row'}}>
                    <Text>¿No puedes ingresar? </Text>
                    <TouchableOpacity 
                      onPress={() => this.gotoSreen('SolicitarAcceso')}
                    >
                      <Text style={styles.textAcces}>Solicitar Acceso</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* botones de info */}
                <View style={styles.botonInf}>

                  {/* Fila de Servicios */}
                  <View style={styles.rowCol}>
                  

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

                    <View style={{flexDirection:'column'}}>
                      <TouchableOpacity
                        onPress={() => {
                          Linking.openURL('tel:071204877');
                        }}
                        style={{padding: 10, width: 100, backgroundColor: 'rgba(155,155,155,0.2)', borderRadius:5, marginHorizontal: 5}}
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
                        style={{padding: 10, width: 100, backgroundColor: 'rgba(155,155,155,0.2)', borderRadius:5, marginHorizontal: 5}}
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
  flex: 1,
  backgroundColor: 'white',
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
headerImage: {
    width: width,
    height: 240,
    resizeMode: 'cover',
  },
  curvedWhite: {
    position: 'absolute',
    top: 240 - 40, // 200
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    // Aseguramos que la vista esté por encima de la imagen
    zIndex: 10,
  },
  formContainer: {
    flex: 1,
    paddingTop: 17,
    paddingHorizontal: 20,
  },
avatarContainer: {
  width: 80,
  height: 80,
  borderRadius: 40, // círculo perfecto
  backgroundColor: '#e0e0e0',
  justifyContent: 'center',  // centra verticalmente
  alignItems: 'center',      // centra horizontalmente
  alignSelf: 'center',
  marginBottom: 10,
},
avatarText: {
  fontSize: 26,
  fontWeight: 'bold',
  color: '#333',
},
greetingText: {
  fontSize: 15,
  textAlign: 'center',
  fontWeight: '900',
  color: '#333',
  marginBottom: 20,
},
biometricsButton: {
  marginTop: 20,
  alignItems: 'center',
  backgroundColor: '#007bff',
  paddingVertical: 12,
  borderRadius: 10,
  marginHorizontal: 40,
},

biometricsButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
selectorButton: {
  flex: 1,
  padding: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  alignItems: 'center',
  borderRadius: 5,
  marginHorizontal: 5,
},
selectorButtonSelected: {
  backgroundColor: 'rgba(191, 4, 4, 1)',
},
selectorText: {
  color: '#000',
},
botonBiometrico: {
  backgroundColor: '#2e86de',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  marginTop: 10,
  alignItems: 'center',
},
button: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});