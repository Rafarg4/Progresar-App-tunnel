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
import Constants from 'expo-constants';
import axios from 'axios'; 
const { width, height } = Dimensions.get('window');

const maxHeight = Dimensions.get("window").height;
const isVersionOlder = (current, latest) => { 
  const c = current.split('.').map(Number);
  const l = latest.split('.').map(Number);

  for (let i = 0; i < Math.max(c.length, l.length); i++) {
    const cur = c[i] || 0;
    const lat = l[i] || 0;
    if (cur < lat) return true;   // versión actual es menor
    if (cur > lat) return false;  // versión actual es mayor
  }
  return false; // son iguales
};
 
axios
  .get('https://api.progresarcorp.com.py/api/actualizacion', { headers: { 'Cache-Control': 'no-cache' } })
  .then(response => {
    const latest = String(response.data).trim();   
    const current = Constants.expoConfig?.version || Constants.manifest?.version;

    console.log(`Versión actual: ${current}, disponible: ${latest}`);

    if (isVersionOlder(current, latest)) {
      Alert.alert(  
        '¡Aviso de actualización!',
        `Tienes la versión ${current}, pero hay una nueva versión ${latest} disponible.`,
        [
          { 
            text: 'Actualizar',
            onPress: () => 
              WebBrowser.openBrowserAsync(
                'https://play.google.com/store/apps/details?id=com.progresarcorporation.progresarmovil&hl=es'
              ),
          },
          { 
            text: 'Cerrar', 
            style: 'cancel'   // estilo de botón de cierre
          }
        ] 
      );
    }
  })
  .catch((err) => {
    console.log("Error al consultar actualización:", err.message);
  });
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
                backgroundColor: '#9e2021', // 👈 Totalmente opaco
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

        if(data.emailVerify == null){
          this.setState({loading: false})
          if(data.email != null){
           this.setState({loading: false})
          this.gotoSreen('InicioApp');
          }else{
           this.setState({loading: false})
          this.gotoSreen('InicioApp');
          }
        }else{
          this.setState({loading: false})
          this.gotoSreen('InicioApp');
        }
      
    } 

    changeSecureText(){

      if(this.state.secureText == true){
        this.setState({secureText: false, iconShow: 'eye'});
      }else{
        this.setState({secureText: true, iconShow: 'eye-slash'});
      }
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
                style={[
                  styles.botLogin,
                  { 
                    width: 200,           // ancho más compacto
                    paddingVertical: 10,  // 🔹 más alto que antes (era 8)
                    alignSelf: 'center',
                    borderRadius: 8,      // 🔹 bordes más suaves
                    elevation: 3,         // 🔹 sombra en Android
                    shadowColor: '#000',  // 🔹 sombra en iOS
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.5,
                  }
                ]}
                onPress={() => this.onPresComprob()}
              >
                <Text style={[styles.botText, { fontSize: 15, fontWeight: 'bold' }]}>
                  Ingresar
                </Text>
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
                trackColor={{ false: "#767577", true: "#9e2021" }}
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
          <View style={styles.container}>
            <View style={{ position: 'absolute', top: 240, left: 25, zIndex: 10 }}>
                <TouchableOpacity onPress={this.handleLogout}>
                  <Icon name="sign-out" size={28} color="#9e2021" />
                </TouchableOpacity>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={true}
              >
                {/* Logo de la empresa */}
                <View style={styles.container}>
                <Image  
                  style={styles.headerImage}
                  source={require('../assets/logo_login.png')} 
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
             <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginVertical: 6,
                  marginHorizontal: 20,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.selectorButton,
                    this.state.metodoLogin === 'password' && styles.selectorButtonSelected,
                  ]}
                  onPress={() => {
                    this.setState({ metodoLogin: 'password' }, () => {
                      this.setState({ user: '', pass: '' });
                    });
                  }}
                >
                  <Text
                    style={[
                      styles.selectorText,
                      this.state.metodoLogin === 'password' && styles.selectorTextSelected,
                    ]}
                  >
                    Contraseña
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.selectorButton,
                    this.state.metodoLogin === 'biometria' && styles.selectorButtonSelected,
                  ]}
                  onPress={() => {
                    this.setState({ metodoLogin: 'biometria' }, () => {
                      this.cargarDatosBiometria();
                    });
                  }}
                >
                  <Text
                    style={[
                      styles.selectorText,
                      this.state.metodoLogin === 'biometria' && styles.selectorTextSelected,
                    ]}
                  >
                    Biometría
                  </Text>
                </TouchableOpacity>
              </View>

              {this.state.metodoLogin === 'password' && (
                <>
                 {/* Campo Cédula */}
                <View style={{ paddingHorizontal: 15, marginTop: 10 }}>
                  <Text style={styles.loginText}>N° de Cédula</Text>
                </View>
                <View style={{ paddingHorizontal: 15, alignItems: 'center' }}>
                  <TextInput
                    value={this.state.user}
                     style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: '#ccc',
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    height: 55,
                     borderColor: "#9e2021",
                    width: '100%',
                    backgroundColor: 'white',
                  }}
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
                     borderColor: "#9e2021",
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
                <View style={{ alignItems: 'center', marginBottom: 5, paddingHorizontal: 15 }}>
                  <TouchableOpacity onPress={() => this.gotoSreen('RecuperarContraseña')}>
                    <Text style={[styles.botOlv, { fontSize: 14, textAlign: 'center' }]}>
                      ¿Olvidó su contraseña? 
                    </Text>
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
                  <TouchableOpacity onPress={this.handleBiometria} style={styles.botonAzul}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="lock" size={18} color="white" style={{ marginRight: 8 }} />
                      <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold', textAlign: 'center' }}>
                        Autenticarse con biometría
                      </Text>
                    </View>
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
                <View style={{ marginTop: 5, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text>¿No puedes ingresar? </Text>
                    <TouchableOpacity onPress={() => this.gotoSreen('SolicitarAcceso')}>
                      <Text style={styles.textAcces}>Solicitar acceso</Text>
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
            </View>
        ); 
    }
};
const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 260, // antes 300
  },

  box: {
    flex: 1,
    backgroundColor: 'white',
  },

  // estilos para los TextInput
  input: {
    height: 42, // antes 50
    width: '100%',
    marginBottom: 6, // antes 10
    marginTop: 6,
    paddingHorizontal: 8, // antes 10
    borderRadius: 4, // antes 5
    borderWidth: 0.8,
    borderColor: "#9e2021",
  },

  inputStyle: { fontSize: 13 },
  placeholderStyle: { fontSize: 13 },
  textErrorStyle: { fontSize: 13 },
  // termina el estilo del input

  loginText: {
    fontWeight: 'bold',
    fontSize: 14,
  },

  botText: {
    textAlign: "center",
    color: '#fff',
    fontSize: 14, // antes 16
  },

  botLogin: {
    backgroundColor: "#9e2021",
    padding: 6, // antes 8
    borderRadius: 5,
    width: 260, // antes 300
    marginBottom: 10,
  },

  textAcces: {
    color: '#000',
    fontSize: 13,
    fontWeight: 'bold',
  },

  logo: {
    width: 230, // antes 270
    height: 60, // antes 70
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  botOlv: {
    color: "black",
    marginBottom: 10,
    marginTop: 5,
    fontSize: 13,
  },

  botonInf: {
    marginTop: 15,
    width: '100%',
  },

  rowCol: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  copy: {
    position: 'absolute',
    bottom: 10,
  },

  contact: {
    position: 'absolute',
    bottom: 10,
  },

  contAct: {
    flex: 1,
    justifyContent: "center",
  },

  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  // estilo del Modal
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  headerImage: {
    width: width,
    height: 200, // antes 240
    resizeMode: 'cover',
  },

  curvedWhite: {
    position: 'absolute',
    top: 200 - 35,
    left: 0,
    right: 0,
    height: 35,
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    zIndex: 10,
  },

  formContainer: {
    flex: 1,
    paddingTop: 12, // antes 17
    paddingHorizontal: 15,
  },

  avatarContainer: {
    width: 70, // antes 80
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },

  avatarText: {
    fontSize: 22, // antes 26
    fontWeight: 'bold',
    color: '#333',
  },

  greetingText: {
    fontSize: 13, // antes 15
    textAlign: 'center',
    fontWeight: '900',
    color: '#333',
    marginBottom: 15,
  },

  biometricsButton: {
    marginTop: 15,
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 10, // antes 12
    borderRadius: 8,
    marginHorizontal: 35,
  },

  biometricsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

    selectorButton: {
    flex: 1,
    paddingVertical: 10,        // 🔹 altura agradable al tacto
    borderWidth: 1.3,
    borderColor: '#9e2021',     // 🔹 mantiene coherencia con tu paleta
    alignItems: 'center',
    borderRadius: 10,           // 🔹 bordes más redondeados
    marginHorizontal: 6,        // 🔹 separación entre botones
    backgroundColor: '#fff',    // 🔹 fondo claro por defecto
    elevation: 2,               // 🔹 sombra Android
    shadowColor: '#000',        // 🔹 sombra iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },

  selectorButtonSelected: {
  backgroundColor: '#9e2021', // 🔹 fondo rojo al estar activo
  borderColor: '#9e2021',
  elevation: 3,
  shadowOpacity: 0.25,
},

  selectorText: {
  color: '#000',              // 🔹 texto negro por defecto
  fontSize: 14,
  fontWeight: '500',
},
selectorTextSelected: {
  color: '#fff',              // 🔹 texto blanco cuando está activo
  fontSize: 14,
  fontWeight: 'bold',
},

  botonBiometrico: {
    backgroundColor: '#2e86de',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },

  button: {
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 7,
    alignItems: 'center',
  },
  botonAzul: {
  backgroundColor: '#007bff', // 🔹 Azul principal (puede ser #0056b3 si querés más oscuro)
  paddingVertical: 10,        // igual grosor que tu botón "Ingresar"
  paddingHorizontal: 20,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  width: 260,                 // opcional: podés ajustar a 220 si querés más compacto
  elevation: 3,               // 🔹 sombra en Android
  shadowColor: '#000',        // 🔹 sombra en iOS
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.5,
},

});