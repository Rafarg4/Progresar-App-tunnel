import React, { Component } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, TouchableOpacity, ScrollView, RefreshControl, FlatList, ActivityIndicator} from 'react-native';
import * as global from '../global';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Divider } from 'react-native-elements';


var md5 = require('md5');

class MediosdePago extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardsUser: [],
      loading: false
    };
  }

  gotoScreen(routeName, status, type, id) {
    if(status != null){
        this.props.navigation.navigate(routeName, {
            data : status,
            tipo : type,
            card_id: id
        })
    }else{
        this.props.navigation.navigate(routeName)
    }
  }

  componentDidMount(){
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.userCard();
    }); 
    this.userCard();
  }

  userCard(){
    this.setState({loading: true})
    var data={
      public_key: global.public_key_vpos,
      operation: {
        token: md5(global.private_key_vpos+global.codigo_cliente+'request_user_cards'),
      }
    }

    fetch(global.url_environment_vpos+'/vpos/api/0.3/users/'+global.codigo_cliente+'/cards',{
      method: 'POST',
      body: JSON.stringify(data), 
      headers:{
          'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        //console.log(data)
        if(data.status=='success'){
          if(data.cards == ''){
            this.setState({
              cardsUser: 0,
              loading: false
            })
          }else{
            var i=0;
            for(i=0; i < data.cards.length; i++){
              this.setState({
                cardsUser: data.cards,
                loading: false
              })
              if(data.cards[i].card_type == "credit"){
                this.deleteCard(data.cards[i].alias_token, data.cards[i].card_id, true);
                Alert.alert("Error", "Por políticas de la empresa, solo puede agregar Tarjetas de Débito");
              }else{
                this.setState({
                  cardsUser: data.cards,
                  loading: false
                })
              }
            } 
          }
        }else{
          this.setState({
            loading: false
          })
          Alert.alert('Error', 'La respuesta del proveedor es: \n'+data.messages[0].dsc)
        }
      })
      .catch((error) => {
        console.log(error)  ;
          Alert.alert('Error', 'No pudimos conectarnos con el proveedor del servicio. \nPor favor, inténtelo más tarde')
      })

  }

  addNewCard(){
    var Vpos_card_id=0;

    var tarjtasC = this.state.cardsUser;
    var mayor=0;

    if(tarjtasC == 0){
      Vpos_card_id=1;
    }else{
      for(var i=0; i < tarjtasC.length; i++){
        if(tarjtasC[i].card_id>mayor){
          mayor =tarjtasC[i].card_id;
        }
      }
      Vpos_card_id=mayor+1;
    }
    
    var data={
      public_key: global.public_key_vpos,
      operation: {
        token: md5(global.private_key_vpos+Vpos_card_id+global.codigo_cliente+"request_new_card"),
        card_id: Vpos_card_id,
        user_id: global.codigo_cliente,
        user_cell_phone: global.user_phone,
        user_mail: global.user_mail,
        return_url: "https://api.progresarcorp.com.py/api/"+global.codigo_cliente+"/"+Vpos_card_id+"/result-catastro",
      }
    };

    fetch(global.url_environment_vpos+'/vpos/api/0.3/cards/new',{
      method: 'POST',
      body: JSON.stringify(data), 
      headers:{
          'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
          if(data.status=='success'){
            this.gotoScreen('Venta Confirmar', data.process_id, 'Cards New', Vpos_card_id);
          }else{
            Alert.alert('Error', 'Tuvimos un problema: '+data.status+'\n'+data.messages[0].dsc)
          }
      })
      .catch((error) => {
        Alert.alert('Error', 'No pudimos conectarnos con el proveedor del servicio. \nPor favor, inténtelo más tarde')
      })
  }

  deleteCard(token, id, value){
    
    const data ={
      public_key: global.public_key_vpos,
      operation: {
        token: md5(global.private_key_vpos + 'delete_card' + global.codigo_cliente + token),
        alias_token: token
      }
    }

    fetch(global.url_environment_vpos+'/vpos/api/0.3/users/'+global.codigo_cliente+'/cards',{
      method: 'DELETE',
      body: JSON.stringify(data), 
      headers:{
          'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
          if(data.status=='success'){
            if(value != true){
              Alert.alert('Operación Exitosa', 'Se eliminó correctamente la Tarjeta seleccionada', [
                { text: "Entendido", onPress: () => this.componentDidMount()}
            ]);
            }
            this.deleteFail(id);
            this.userCard();
          }else{
            Alert.alert('Error', 'No pudimos eliminar la Tarjeta seleccionada')
          }
      })
      .catch((error) => {
        Alert.alert('Error', 'No pudimos conectarnos con el proveedor del servicio. \nPor favor, inténtelo más tarde')
      })
  }

  deleteFail(id){
    fetch('https://api.progresarcorp.com.py/api/deleteStatus/'+global.codigo_cliente+'/'+id)
    .catch((error) => {
        console.log(error);
    })
  }

  render() {
    const {cardsUser, loading} = this.state;

    const verTcTipo = (value) =>{
      var tcTipo='';
      if(value=='credit'){
        tcTipo='Tarjeta de Crédito';
      }else{
        tcTipo='Tarjeta de Débito';
      }
      return tcTipo;
    }

    const IndicadorCarga = () => {
      if(loading == true){
          return(
              <ActivityIndicator size= 'large' color='#bf0404' />
          )
      }else{
        return null
      }
    }

    const tarjetasUsuario = () =>{
      if(cardsUser!=0){
        return(
          <FlatList 
            data={cardsUser}
            showsHorizontalScrollIndicator= {false}
            keyExtractor={(item) => item.card_id}
            renderItem={({item, index}) =>{
                    return(
                      <View style={{backgroundColor: 'white', borderRadius: 5, width: '100%', padding: 8, alignItems: 'center', alignContent: 'center', marginTop: 10, marginBottom: 10, flexDirection: 'row'}}>
                            <View style={{width: '15%'}}> 
                              <View style={{alignItems:'center'}}>
                                <Icon name='credit-card' color='#bf0404' size={25} style={{padding: 5, borderRadius: 5}}/>
                              </View>
                            </View>
                            
                            <View style={{width: '70%', paddingHorizontal: 5}}>
                              <Text style={{fontSize: 18, fontWeight: 'bold'}}>{verTcTipo(item.card_type)}</Text>
                                <Divider style={{marginBottom: 10}}/>
                              <Text style={{fontSize: 13, marginBottom: 5}}>{item.card_brand} </Text>
                              <Text style={{fontSize: 13, marginBottom: 5}}>{item.card_masked_number} </Text>
                            </View>
                            
                            <View style={{width: '15%'}}>
                              <View>
                                <TouchableOpacity
                                  onPress={()=> Alert.alert('Atención', '¿Está seguro que quiere eliminar la Tarjeta seleccionada?', [
                                    {
                                    text: "No, cancelar",
                                    onPress: () => null,
                                    style: "cancel"
                                    },
                                    { text: "Sí, eliminar Tarjeta", onPress: () => this.deleteCard(item.alias_token, item.card_id, false)}
                                ])
                                }
                                  style={{backgroundColor: 'red', padding: 8, borderRadius: 5, alignItems: 'center'}}
                                >
                                  <Icon name='trash-o' color='white' size={20} />
                                </TouchableOpacity>
                              </View>
                            </View>
                        </View>
                    )
                }
            }
        />
        )
      }else{
        return(
          <View style={{backgroundColor: 'white', borderRadius: 5, width: '100%', padding: 10, alignItems: 'center', alignContent: 'center', marginTop: 10, marginBottom: 10}}>
            <Text>No posee Tarjetas asociadas a su cuenta</Text>
          </View>
        )
      }
    }

    var Refreshing = false;
    const onRefresh = () => {
        Refreshing = true;
        this.componentDidMount();
        Refreshing = false;
    }

    return (
      <SafeAreaView style={styles.box1}>
        <Text style={{textAlign: 'center', fontSize: 10, marginTop: 5, color: '#9c9c9c'}}>⬇️ Deslice hacia abajo para actualizar ⬇️</Text>
        <View style={{marginTop: 15}}>
          <Text style={{textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>Añadir Medios de Pago</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl 
                    refreshing={ Refreshing }
                    onRefresh={ onRefresh }
                    colors={['#bf0404']}
                />
              }
          >
          <IndicadorCarga/>
          {/* Listar tarjetas del Usuario */}
          {tarjetasUsuario()}

          {/* Boton para aagregar nueva tarjeta */}
          <TouchableOpacity
            onPress={()=> Alert.alert('Atención', "A continuación usted pasará por única vez por un proceso de validación con preguntas de seguridad. \nPara iniciar favor tener en cuenta las siguientes recomendaciones: \n1- Verifique su número de cédula de identidad \n2- Tenga a mano sus tarjetas de crédito y débito activas \n3- Verifique el monto y lugar de sus últimas compras en comercios o extracciones en cajeros", [
              {
                text: "Cancelar",
                onPress: () => null,
                style: "cancel"
              },
              { text: "Continuar", onPress: () => this.addNewCard()}
            ])
          }
          style={{backgroundColor: '#bf0404', padding: 5, borderRadius: 5, marginTop: 10}}
          >
            <Text style={{textAlign: 'center', color:'white'}}>Agregar una Tarjeta <Icon name='plus' /></Text>
          </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.info}>
          <Icon name="info-circle" size={30} color="#bf0404" style={{margin: 10}} />
          <Text> Por políticas de la empresa solo se le permite catastrar Tarjetas de Débito</Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  box1:{ 
    flex: 1, 
    paddingHorizontal: 15, 
    width: '100%', 
    height: '100%', 
  },

  info: { marginLeft: 8, flexDirection: 'row', alignItems: 'center', alignContent: 'center', width: '85%', marginTop: 15},
})

export default MediosdePago;