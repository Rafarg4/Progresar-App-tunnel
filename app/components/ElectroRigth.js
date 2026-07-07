import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { View, Alert, TouchableOpacity, Text} from 'react-native';
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import { useNavigation } from '@react-navigation/native';
import * as global from '../global.js'


const Salir = (props) => {

  var {cant_carrito} = props
  
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
      
     <TouchableOpacity onPress={() => gotoScreen('Carrito')}>
      <View style={{ marginRight: 10 }}>
        <Icon name="shopping-cart" size={20} color="white" />
        <View style={{ paddingBottom: 10, alignItems: 'center' }}>
          <View style={{ borderRadius: 100, backgroundColor: 'white', width: 16 }}>
            <Text style={{ fontSize: 11, color: 'black', textAlign: 'center' }}>
              {cant_carrito}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>

      <Menu
        ref={menuRef}
        anchor={ <Icon onPress={showMenu} name="ellipsis-v" size={25} color='white' style={{padding: 10, marginRight: 10}} />}
        onRequestClose={hideMenu}
      >
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