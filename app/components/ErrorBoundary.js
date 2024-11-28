import React from "react";
import {View, SafeAreaView, Text, StatusBar, Image, TouchableOpacity, BackHandler} from "react-native";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto
      return { hasError: true };
    }
  
    render() {
      //throw new Error('Test');
      if (this.state.hasError) {
        // Puedes renderizar cualquier interfaz de repuesto
        return (
            <SafeAreaView style={{color: 'white', marginBottom: 10, textAlign: 'center'}}>
                <StatusBar
                    style='light'
                    animated={true}
                    backgroundColor="#bf0404"
                />
                <View style={{marginHorizontal: 15, marginTop: 15}}>
                    
                    <Text style={{fontSize: 22, fontWeight: 'bold', color: '#bf0404'}}>Error Inesperado</Text>

                    <Text style={{fontSize: 14, marginTop: 25}}>Lo sentimos, tuvimos un error inesperado, intente cerrar la aplicación y volver a ejecutarla, si el error persiste por favor contáctenos.</Text>
                </View>
                    
                <Image style={{width: '100%', height: 370, alignItems: 'center', marginTop: 15}} source={{uri: 'https://api.progresarcorp.com.py/images/errorApp.jpg'}}/>

                <View style={{marginHorizontal: 15, marginTop: 35}}>
                    <TouchableOpacity
                            onPress={()=> BackHandler.exitApp()}
                            style={{width: '100%', backgroundColor: '#bf0404', padding: 5, borderRadius: 5}}
                        >
                            <Text style={{color: 'white', textAlign: 'center'}}>Cerrar App</Text>
                        </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
      }
  
      return this.props.children; 
    }
  }