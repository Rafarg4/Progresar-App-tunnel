import React from 'react';
import { NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform  } from 'react-native';
import Usuario from '../components/headerRigth'
import ElectroHR from '../components/ElectroRigth'
import * as global from '../global'
import 'react-native-gesture-handler';

//screens
import SplashScreen from '../screens/SplashScreen'
import LoginScreen from '../screens/LoginScreen'
import HomeScreen from '../screens/ScreenHome'
import TarjetasScreen from '../screens/Tarjetas'
import FinancieroScreen from '../screens/Financiero';
import UsuarioScreen from '../screens/Usuario';
import SoporteScreen from '../screens/Soporte';
import ElectroScreen from '../screens/Electro';
import CarritoScreen from '../screens/Carrito';
import Sucursales from '../screens/MapsSuc';
import DetaTC from '../screens/DetaTC';
import MovTC from '../screens/MovTC'
import DetaF from '../screens/DetaF'
import DetaE from '../screens/DetaE'
import DetaPagoQr from '../screens/DetaPagoQr'
import DetaBepsa from '../screens/DetaBepsa'
import DetaProcard from '../screens/DetaProcard'
import AtmQr from '../screens/AtmQr'
import Extracto from '../screens/Extracto'
import ActualizarPerfil from '../screens/ActualizarPerfil'
import SolicitarAcceso from '../screens/SolicitarAcceso'
import Checkout from '../screens/Checkout';
import ConfirmarCompra from '../screens/ConfirmarCompra';
import ConfirmarVenta from '../screens/ConfirmarVenta';
import MediosdePago from '../screens/MediosdePago';
import MisPagos from '../screens/MisPagos';
import VerificarEmail from '../screens/VerificarEmail';
import PagoTC from '../screens/PagoTC';
import Qr from '../screens/Qr';

import AdelantoQr from '../screens/AdelantoQr';

const Stack = createNativeStackNavigator();

const compPlatform = () =>{
    if(Platform.OS == 'ios'){
        return (<Stack.Screen name="Login" component={LoginScreen}  options={{
            headerBackVisible: false, 
            headerTitle:"Iniciar Sesión",
            headerTintColor: "white",
            headerStyle: { backgroundColor: '#bf0404' },
            gestureEnabled: false
        }}/>)
    }else{
        return(<Stack.Screen name="Login" component={LoginScreen}  options={{
            headerShown: false,
            gestureEnabled: false
        }}/>)
    }
}


function App() {

    //throw new Error("Error en la libreria ndea xD");

    return (
        <NavigationContainer>
        <Stack.Navigator initialRouteName='Inicio'>
            <Stack.Screen name="Inicio" component={SplashScreen} options={{
                headerShown: false,
                gesturesEnabled: false
            }}/>
            
            {compPlatform()}

            <Stack.Screen name="Home" component={HomeScreen} options={
                {
                    headerBackVisible: false, 
                    headerTitle:"¡Bienvenido!",
                    headerTintColor: "white",
                    headerRight: () => <Usuario />,
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>
            <Stack.Screen name="Qr" component={Qr} options={
                {
                    headerBackVisible: false, 
                    headerTintColor: "white",
                    headerRight: () => <Usuario />,
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>

            <Stack.Screen name="Tarjetas" component={TarjetasScreen} options={
                {
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>

            <Stack.Screen name="Usuario" component={UsuarioScreen} options={
                {
                    headerTintColor: "white",
                    headerTitle:"Peril de Usuario",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>

            <Stack.Screen name="Financiero" component={FinancieroScreen} options={
                {
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>

            <Stack.Screen name="Soporte" component={SoporteScreen} options={
                {
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>

            <Stack.Screen name="Electrodomésticos" component={ElectroScreen} options={
                {
                    headerTintColor: "white",
                    headerRight: () => <ElectroHR cant_carrito={global.items_carrito} />,
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>

            <Stack.Screen name="Carrito" component={CarritoScreen} options={
                {
                    headerTintColor: "white",
                    headerRight: () => <ElectroHR cant_carrito={global.items_carrito}/>,
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>


            <Stack.Screen name="Sucursales" component={Sucursales} options={
                {
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/> 

            <Stack.Screen name="Detalle TC" component={DetaTC} options={
                {
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/> 

            <Stack.Screen name="Movimientos TC" component={MovTC} options={
                {
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/> 

            <Stack.Screen name="Extracto" component={Extracto} options={
                {
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/> 

            <Stack.Screen name="SolicitarAcceso" component={SolicitarAcceso} options={
                {
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/> 

             <Stack.Screen name="ActualizarPerfil" component={ActualizarPerfil} options={
                {
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/> 

            <Stack.Screen name="DetaF" component={DetaF} options={
                {
                    headerTintColor: "white",
                    headerTitle:"Detalle de Préstamo",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>
             <Stack.Screen name="DetaPagoQr" component={DetaPagoQr} options={
                {
                    headerTintColor: "white",
                    headerTitle:"Detalles de Pagos Qr",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>
            <Stack.Screen name="AtmQr" component={AtmQr} options={
                {
                    headerTintColor: "white",
                    headerTitle:"Adelantos Qr",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>
            <Stack.Screen name="AdelantoQr" component={AdelantoQr} options={
                {
                    headerTintColor: "white",
                    headerTitle:"Adelanto ATM",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>
            <Stack.Screen name="DetaBepsa" component={DetaBepsa} options={
                {
                    headerTintColor: "white",
                    headerTitle:"Movimientos Dinelco",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>
            <Stack.Screen name="DetaProcard" component={DetaProcard} options={
                {
                    headerTintColor: "white",
                    headerTitle:"Movimientos Credicard",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>
            <Stack.Screen name="DetaE" component={DetaE} options={
                {
                    headerTintColor: "white",
                    headerTitle:"Detalle de Electrodomésticos",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>

            <Stack.Screen name="Checkout" component={Checkout} options={
                {
                    headerTintColor: "white",
                    headerTitle:"Checkout",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>
            {/* 
             <Stack.Screen name="Medios de Pago" component={MediosdePago} options={
                {
                    headerTintColor: "white",
                    headerTitle:"Medios de Pago",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>
            */}
            <Stack.Screen name="Confirmar Compra" component={ConfirmarCompra} options={
                {
                    headerShown: false,
                    gestureEnabled: false
                }
            }/>

            <Stack.Screen name="Venta Confirmar" component={ConfirmarVenta} options={
                {
                    headerShown: false,
                    gestureEnabled: false
                }
            }/>
            {/*
            <Stack.Screen name="Mis Pagos" component={MisPagos} options={
                {
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>
            */}
            <Stack.Screen name="Verificar Email" component={VerificarEmail} options={
                {
                    headerShown: false,
                    gestureEnabled: false
                }
            }/>

            <Stack.Screen name="Pago de Tarjetas" component={PagoTC} options={
                {
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: '#bf0404' },
                }
            }/>
            
            
        </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;