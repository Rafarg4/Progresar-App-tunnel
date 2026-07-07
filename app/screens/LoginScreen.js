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
const HEADER_HEIGHT = 235;
const SHEET_OVERLAP = 30; // cuánto se superpone la hoja blanca sobre la imagen
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
            bioAvaliable: false,
            errorModal: { visible: false, success: false, title: '', message: '', onClose: null }
        }
       global.currentRouteName = 'Login';
    }

    mostrarError(title, message, onClose){
      this.setState({ errorModal: { visible: true, success: false, title, message, onClose } });
    }

    mostrarExito(title, message, onClose){
      this.setState({ errorModal: { visible: true, success: true, title, message, onClose } });
    }

    cerrarError = () => {
      const { onClose } = this.state.errorModal;
      this.setState(
        { errorModal: { visible: false, success: false, title: '', message: '', onClose: null } },
        () => { if (typeof onClose === 'function') onClose(); }
      );
    }

    cerrarSesion(){
      global.nombre= null
     global.currentUserDoc = null;

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
              global.currentUserDoc = this.state.user;
              global.appUserNombre   = dataResponse.nombre;
              global.appAuthToken    = dataResponse.token;
              global.appNumUsuario   = dataResponse.num_usu;
              global.appUserPerfil   = dataResponse.user_perfil;
 
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
        this.mostrarError('Error', dataResponse.mensaje);
      }
    })
    .catch((error) => {
      this.mostrarError(
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

    this.mostrarExito('Atención', 'Se ha cerrado sesión correctamente', () => {
      this.props.navigation.replace('Login');
    });
  } catch (error) {
    console.log('Error al cerrar sesión:', error);
    this.mostrarError('Error', 'Ocurrió un problema al cerrar sesión');
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
        const {buttonStyle, disabledButton, loading, bioAvaliable, optBio, secureText, iconShow, errorModal} = this.state;

        const puedeIngresar = this.state.user !== '' && this.state.pass !== '';

        const Buton = () => {
            return(
               <TouchableOpacity
                style={[
                  styles.botLogin,
                  {
                    paddingVertical: 14,
                    backgroundColor: puedeIngresar ? '#9e2021' : 'rgba(158, 32, 33, 0.4)',
                    elevation: puedeIngresar ? 3 : 0,   // 🔹 sombra en Android
                    shadowColor: '#9e2021',             // 🔹 sombra con el color de marca
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: puedeIngresar ? 0.3 : 0,
                    shadowRadius: 5,
                  }
                ]}
                disabled={!puedeIngresar}
                onPress={() => this.onPresComprob()}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="sign-in" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={[styles.botText, { fontSize: 15, fontWeight: 'bold' }]}>
                    Ingresar
                  </Text>
                </View>
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
              <ScrollView
                showsVerticalScrollIndicator={true}
                bounces={false}
              >
                {/* Cabecera con imagen de marca */}
                <View style={styles.hero}>
                  <Image
                    style={styles.headerImage}
                    source={require('../assets/logo_login.png')}
                  />
                  <TouchableOpacity onPress={this.handleLogout} style={styles.logoutButton}>
                    <Icon name="sign-out" size={20} color="#9e2021" />
                  </TouchableOpacity>
                </View>

                {/* Avatar superpuesto entre la imagen y la hoja blanca */}
                <View style={styles.avatarFloating} pointerEvents="none">
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{getIniciales()}</Text>
                  </View>
                </View>

                {/* Hoja blanca redondeada que contiene el formulario */}
                <View style={styles.sheet}>

                  <Text style={styles.greetingText}>Hola, {saludoNombre}</Text>

                  {/* Selector de método de login */}
                  <View style={styles.selectorTrack}>
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
                      <View style={styles.inputField}>
                        <Icon name="id-card" size={16} color="#9e2021" style={styles.inputIcon} />
                        <TextInput
                          value={this.state.user}
                          style={styles.inputInner}
                          placeholder='N° de Cédula'
                          keyboardType="numeric"
                          placeholderTextColor="#8a7476"
                          onChangeText={(user) => this.changeUser(user)}
                        />
                      </View>

                      {/* Campo Contraseña */}
                      <View style={styles.inputField}>
                        <Icon name="lock" size={17} color="#9e2021" style={styles.inputIcon} />
                        <TextInput
                          value={this.state.pass}
                          style={[styles.inputInner, { flex: 1 }]}
                          onChangeText={(pass) => this.changePass(pass)}
                          secureTextEntry={this.state.secureText}
                          placeholder="Contraseña"
                          placeholderTextColor="#8a7476"
                        />
                        <TouchableOpacity onPress={() => this.changeSecureText()}>
                          <Icon name={iconShow} size={17} color="#8a7476" />
                        </TouchableOpacity>
                      </View>

                      {/* Boton de ¿Olvidó su contraseña? */}
                      <TouchableOpacity onPress={() => this.gotoSreen('RecuperarContraseña')} style={styles.forgotWrap}>
                        <Text style={styles.botOlv}>¿Olvidó su contraseña?</Text>
                      </TouchableOpacity>

                      {/* Aqui se agrega el boton de login*/}
                      <View style={{ alignItems: 'center', marginTop: 8 }}>
                        <Buton />
                      </View>
                    </>
                  )}

                  {this.state.metodoLogin === 'biometria' && (
                    <View style={{ marginTop: 8 }}>
                      <TouchableOpacity onPress={this.handleBiometria} style={styles.botonSecundario}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="lock" size={18} color="#fff" style={{ marginRight: 8 }} />
                          <Text style={styles.botonSecundarioText}>
                            Autenticarse con biometría
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Solicitar Accesso */}
                  <View style={{ marginTop: 18, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={styles.mutedText}>¿No puedes ingresar? </Text>
                      <TouchableOpacity onPress={() => this.gotoSreen('SolicitarAcceso')}>
                        <Text style={styles.textAcces}>Solicitar acceso</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Accesos rápidos */}
                  <View style={styles.rowCol}>
                    <TouchableOpacity onPress={() => this.gotoSreen('Sucursales')} style={styles.accesoRapido}>
                      <Icon name='map' size={17} color="#9e2021" />
                      <Text style={styles.accesoRapidoText}>Sucursales</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => Linking.openURL('tel:071204877')} style={styles.accesoRapido}>
                      <Icon name='phone' size={17} color="#9e2021" />
                      <Text style={styles.accesoRapidoText}>Llámanos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => Linking.openURL('mailto:info.progresar@prorgresarcorp.com.py')} style={styles.accesoRapido}>
                      <Icon name='envelope' size={17} color="#9e2021" />
                      <Text style={styles.accesoRapidoText}>Contáctanos</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.footerText}>{getYear()} © Progresar Corporation S.A.</Text>
                  <Text style={[styles.footerText, { marginTop: 2 }]}>Versión: {expo.version}</Text>
                </View>
              </ScrollView>
              {cargando()}

              <Modal
                visible={errorModal.visible}
                transparent
                animationType="fade"
                onRequestClose={this.cerrarError}
              >
                <View style={styles.errorOverlay}>
                  <View style={styles.errorCard}>
                    <View
                      style={[
                        styles.errorIconCircle,
                        errorModal.success && styles.errorIconCircleSuccess,
                      ]}
                    >
                      <Icon name={errorModal.success ? 'check' : 'exclamation'} size={20} color="#fff" />
                    </View>
                    <Text style={styles.errorTitle}>{errorModal.title}</Text>
                    <Text style={styles.errorMessage}>{errorModal.message}</Text>
                    <TouchableOpacity
                      style={styles.errorButton}
                      onPress={this.cerrarError}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.errorButtonText}>Aceptar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
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
    borderRadius: 8, // antes 5
    borderWidth: 0.8,
    borderColor: "#9e2021",
  },

  inputStyle: { fontSize: 13 },
  placeholderStyle: { fontSize: 13 },
  textErrorStyle: { fontSize: 13 },
  // termina el estilo del input

  botText: {
    textAlign: "center",
    color: '#fff',
    fontSize: 14, // antes 16
  },

  botLogin: {
    backgroundColor: "#9e2021",
    padding: 6, // antes 8
    borderRadius: 28,
    width: '100%',
    marginBottom: 10,
  },

  textAcces: {
    color: '#9e2021',
    fontSize: 13,
    fontWeight: 'bold',
  },

  mutedText: {
    color: '#6b5c5d',
    fontSize: 13,
  },

  logo: {
    width: 230, // antes 270
    height: 60, // antes 70
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  botOlv: {
    color: "#9e2021",
    fontSize: 13,
    fontWeight: '600',
  },

  rowCol: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
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
    height: HEADER_HEIGHT,
    resizeMode: 'cover',
  },

  hero: {
    width: '100%',
  },

  logoutButton: {
    position: 'absolute',
    top: 50,
    left: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },

  avatarFloating: {
    position: 'absolute',
    top: HEADER_HEIGHT - SHEET_OVERLAP - 35,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -SHEET_OVERLAP,
    paddingTop: 45,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f1e4e3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#9e2021',
  },

  greetingText: {
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '800',
    color: '#241a1a',
    marginBottom: 20,
  },

  selectorTrack: {
    flexDirection: 'row',
    backgroundColor: '#f4eeed',
    borderRadius: 999,
    padding: 4,
    marginBottom: 18,
  },

  selectorButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 999,
  },

  selectorButtonSelected: {
    backgroundColor: '#9e2021',
    elevation: 2,
    shadowColor: '#9e2021',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  selectorText: {
    color: '#6b5c5d',
    fontSize: 14,
    fontWeight: '600',
  },

  selectorTextSelected: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f2f1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
  },

  inputIcon: {
    marginRight: 10,
  },

  inputInner: {
    flex: 1,
    color: '#241a1a',
    fontSize: 14,
  },

  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },

  botonSecundario: {
    backgroundColor: '#9e2021',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 3,
    shadowColor: '#9e2021',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  botonSecundarioText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  accesoRapido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(158, 32, 33, 0.08)',
    borderRadius: 999,
    flex: 1,
    marginHorizontal: 4,
  },

  accesoRapidoText: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: '600',
    color: '#6b5c5d',
  },

  footerText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 12,
  },

  // 🔹 Modal de error (login)
  errorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(36,16,18,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  errorIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#9e2021',
  },
  errorIconCircleSuccess: {
    backgroundColor: '#3f8f5f',
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#241a1a',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 13.5,
    color: '#6b5c5d',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#9e2021',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

});