import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { View, Alert, TouchableOpacity, Text, Image} from 'react-native';
import * as Animatable from 'react-native-animatable'
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import { useNavigation } from '@react-navigation/native';
import * as global from '../global'

const Salir = () => {
  const menuRef = React.useRef(null);
  const navigate = useNavigation();
  const showMenu = () => menuRef.current.show();
  const hideMenu = () => menuRef.current.hide();

  const gotoScreen = routeName =>{
    if(routeName == 'Login'){
      global.nombre= null
      global.num_doc= null
      global.num_usuario= null
      global.codigo_cliente= null
      global.user_perfil=null
      global.cod_carrito= null
      global.items_carrito= '0'
      global.total_carrito= '0'
    }
    navigate.navigate(routeName);
  }

  

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
      
      {/* NOTIFICACIONES 
      <TouchableOpacity
        onPress={()=> gotoScreen('Usuario')} //cambiar a promociones
      >
        <Animatable.Text
          animation="bounceIn"
          easing="linear"
          iterationCount={1}
          style={{marginRight: 10}}
        >
          <Icon name="bell" size={20} color='white' />
          <View style={{paddingBottom: 10, alignItems: 'center'}}>
            <View style={{borderRadius: 100, backgroundColor: 'white', width: 16}}>
              <Text style={{fontSize: 11, color: 'black', textAlign: 'center',}}>0</Text>
            </View>
          </View>
        </Animatable.Text>
      </TouchableOpacity> */}

      <Menu
        ref={menuRef}
        //anchor={ <Icon onPress={showMenu} name="ellipsis-v" size={25} color='white' style={{padding: 10, marginRight: 10}} />}
        anchor={ <TouchableOpacity
          onPress={showMenu}
        >
          {global.user_perfil 
            ?
            <Image style={{ width: 40, height: 40, borderRadius: 100}} source={{ uri: 'https://secure.progresarcorp.com.py'+ global.user_perfil }} />
            :
            <Image style={{ width: 40, height: 40, borderRadius: 100}} source={{ uri: 'https://secure.progresarcorp.com.py/images/2.0/hombre.png' }} />
          }
        </TouchableOpacity> }
        onRequestClose={hideMenu}
      >
        <MenuItem onPress={ () => gotoScreen('Usuario')}><Icon name="user-circle" size={20} color='#bf0404' /> Mi Perfil</MenuItem>
        {/*<MenuItem onPress={ () => Alert.alert('Próximamente', 'Esta opción estará habilitada en versiones posteriores.')}><Icon name="money" size={20} color='#bf040450' /> <Text style={{color:'#00000050'}}> Mis pagos</Text></MenuItem> */}
        <MenuItem onPress={ () => gotoScreen('Mis Pagos')}><Icon name="money" size={20} color='#bf0404' /> Mis pagos</MenuItem>
        {/* <MenuItem onPress={ () => Alert.alert('Próximamente', 'Esta opción estará habilitada en versiones posteriores.')}><Icon name="credit-card" size={20} color='#bf040450' /><Text style={{color:'#00000050'}}> Medios de Pago </Text></MenuItem> */}
        <MenuItem onPress={ () => gotoScreen('Medios de Pago')}><Icon name="credit-card" size={20} color='#bf0404' /> Medios de Pago</MenuItem>
        <MenuDivider />
        <MenuItem onPress={ ()=> Alert.alert('Cerrar Sesión', 'Está seguro que desea cerrar sesión?',
            [
              {
                text: "Cancelar",
                onPress: hideMenu,
                style: 'cancel'
              },
              { 
                text: "Salir", 
                onPress: () => gotoScreen('Login'),
              }
            ]
          )}> 
          
          <Icon name="sign-out" size={20} color='#bf0404' /> Cerrar Sesión
        </MenuItem>

      </Menu>
    </View>
  );
}

export default Salir;