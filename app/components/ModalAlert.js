import React, {useState} from 'react'
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const AlertView = ({title, message, icon, color, salir, visible}) => {
    const [alertVisible, setAlertVisible] = useState(false)

    const nanvigation = useNavigation();
    console.log(salir)

    if(visible==true){
        setAlertVisible(alertVisible)
    }

    if(salir == true){
        return(
            <View style={styles.centeredView}>
                <Modal
                    animationType='slide'
                    transparent={true}
                    visible={alertVisible}
                >
                    <View style={styles.centeredView}>
                        <View style= {styles.modalView}>
                            <View>
                                <Text style={styles.textTile}>{title}</Text>
                            </View>
    
                            <View style={{marginBottom: 15}}>
                                <Text> <Icon name={icon} size={60} color={color}/> </Text>
                            </View>
    
                            <View>
                                <Text style={styles.modalText}>{message}</Text>
                            </View>
    
                            <View style={styles.contButon}>
                                <View style={styles.contTouch}>
    
                                    <TouchableOpacity 
                                        onPress={()=> {setAlertVisible(!alertVisible)} }
                                        style={styles.buton}
                                    >
                                        <Text style={{textAlign: 'center'}}>Cancelar</Text>
                                    </TouchableOpacity>
    
                                </View>
    
                                <View style={styles.contTouch}>
    
                                    <TouchableOpacity 
                                        onPress={()=> nanvigation.navigate('Login')}
                                        style={styles.buton}
                                    >
                                        <Text style={{textAlign: 'center'}}>Salir</Text>
                                    </TouchableOpacity>
    
                                </View>
                            </View>
                        </View>
                    </View>
    
                </Modal>
            </View>
        )
    }else{
        return(
            <View style={styles.centeredView}>
                <Modal
                    animationType='slide'
                    transparent={true}
                    visible={alertVisible}
                >
                    <View style={styles.centeredView}>
                        <View style= {styles.modalView}>
                            <View>
                                <Text style={styles.textTile}>{title}</Text>
                            </View>
    
                            <View style={{marginBottom: 15}}>
                                <Text> <Icon name={icon} size={60} color={color}/> </Text>
                            </View>
    
                            <View>
                                <Text style={styles.modalText}>{message}</Text>
                            </View>
    
                            <View style={styles.contButon}>
                                <View style={styles.contTouch}>
    
                                    <TouchableOpacity 
                                        onPress={()=> {setAlertVisible(!alertVisible)} }
                                        style={styles.buton}
                                    >
                                        <Text style={{textAlign: 'center'}}>Cancelar</Text>
                                    </TouchableOpacity>
    
                                </View>
    
                                <View style={styles.contTouch}>
    
                                    <TouchableOpacity 
                                        onPress={()=> {setAlertVisible(!alertVisible)}}
                                        style={styles.buton}
                                    >
                                        <Text style={{textAlign: 'center'}}>Ok</Text>
                                    </TouchableOpacity>
    
                                </View>
                            </View>
                        </View>
                    </View>
    
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    centeredView:{
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        flex: 1
    },
    modalView:{
        width: '80%',
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
    textTile:{
        color: 'black',
        textAlign: 'center',
        fontSize: 20,
        marginTop: 15,
        marginBottom: 15
    },
    okStyle:{
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
    },
    modalText:{
        textAlign: 'center',
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

    contButon:{
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '100%', 
        marginBottom: 10, 
        marginTop: 15
    },

    contTouch:{
        alignItems: 'center', 
        width: '50%',
        padding: 5
    },

    buton:{
        width: '100%', 
        borderRadius: 5,
        borderColor: '#9c9c9c', 
        borderWidth: 1, 
        padding: 5, 
    }
})

export default AlertView;