import React, { Component } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
import { WebView } from 'react-native-webview';
import botones from '../components/BotonesFoo';
import * as global from '../global';

export default class ConfirmarVenta extends Component {
	constructor(props) {
		super(props);

		this.state = {
			process_id: props.route.params.data,
			tipo: props.route.params.tipo,
			idCard: props.route.params.card_id,
			status1: "success",
			status2: "error",
			buscar: true,
			errorTiempo: false,
			comprobar: '',
			visible: true
		};
	}

	gotoScreen(routeName, status) {
		if(routeName == 'back'){
			this.props.navigation.goBack();
		}else{
			if(status != null){
				this.props.navigation.navigate(routeName, {
					data : status,
					time: this.state.errorTiempo
				})
			}else{
				this.props.navigation.navigate(routeName)
			}
		}
	}

	componentDidMount() {
		//comprobar el estado de la compra al ingresar
		if(this.state.tipo==='tarjeta' || this.state.tipo==='zimple'){
			this.comprobarBancard();
		}else{
			this.comprobStatusCardNew();
			this.setState({
				comprobar: 'si'
			})
		}

	};

	displaySpinner() {
		return (
			<ActivityIndicator size="large" color={"#bf0404"} />
		);
	}

	cancelarCatastro(){
		this.setState({
			comprobar: 'no'
		})
		this.gotoScreen('Medios de Pago')
	}

	cancelarPedido(){
		fetch('https://api.progresarcorp.com.py/api/cancelarVenta/'+global.cod_carrito+'/pzVRA52NdXyubxwBRYb4tA3WCqRgXi')
		.then(res => res.json())
		.catch((error) => {
			this.setState({
				loading: false
			})
			Alert.alert('Error', 'No pudimos conectarnos a nuestro servidor. \nPor favor, intente de nuevo más tarde')
		})
		.then(response => {
			if(response == 'success'){
				global.cod_carrito = '0';
				global.items_carrito= '0';
				global.total_carrito='0';
				this.gotoScreen('Electrodomésticos')
			}else{
				return Alert.alert('Error', 'No pudimos cancelar su compra. \nIntente de nuevo más tarde')
			}
		});
	}

	comprobarBancard(){
		fetch('https://api.progresarcorp.com.py/api/confirmBancard/'+global.cod_carrito)
		.then(res => res.json())
		.catch((error) => {
			this.gotoScreen('Confirmar Compra', this.state.status2);
		})
		.then(response => {
			if(response == "Transaccion aprobada" || response == "Transaccion Aprobada"){
				this.gotoScreen('Confirmar Compra', this.state.status1);
			}
			if(response == "Transaccion denegada"){
				this.gotoScreen('Confirmar Compra', this.state.status2);
			}
			if(response == "nada"){
				//comprobar de vuelta al transcurrir 5 segundos
				if( global.cod_carrito!=0){
					setTimeout(() => {
						this.comprobarBancard();
					}, 5000, this) 
				}
			}
		})
	}

	comprobStatusCardNew(){
		fetch('https://api.progresarcorp.com.py/api/card_new_status/'+global.codigo_cliente+'/'+this.state.idCard)
		.then(res => res.json())
		.catch((error) => {
			console.log(error)
			Alert.alert('Error', 'No pudimos conectarnos con nuestro servidor. \nIntentelo de nuevo más tarde', [
				{ text: "Ok", onPress: () => this.gotoScreen('Home')}
			])
		})
		.then(response => {
			if(response[0].res_bancard == "add_new_card_success"){
				Alert.alert('Operación Exitosa', 'Se agregó correctamente la Tarjeta');
				this.gotoScreen('back');
			}
			if(response[0].res_bancard == "add_new_card_fail"){
				Alert.alert('Error', response[0].response_desc, [
					{ text: "Ok", onPress: () => this.deleteFail()}
				])
			}
			if(response == "nada"){
				if(this.state.idCard!=null){
					if(this.state.comprobar == 'si'){
						setTimeout(() => {
							this.comprobStatusCardNew();
						}, 5000, this) 
					}
				}
			}
		})
	}

	deleteFail(){
		fetch('https://api.progresarcorp.com.py/api/deleteStatus/'+global.codigo_cliente+'/'+this.state.idCard)
		.catch((error) => {
			console.log(error);
		})
		this.gotoScreen('Medios de Pago')
	}

	render() {
		const {process_id, tipo, visible} = this.state;

		const ViewWeb = () => {
			if(tipo=='tarjeta'){
				return(
					<WebView style={{marginTop: 15}} source={{ uri: global.url_environment_vpos+'/checkout/new?process_id='+process_id}} />
				)
			}
			if(tipo=='zimple'){
				return(
					<WebView style={{marginTop: 15}} source={{ uri: global.url_environment_vpos+'/checkout/zimple/new?process_id='+process_id}} />
				)
			}
			if(tipo == 'Cards New'){
				let loading = true;

				function changeStatusLoadign (){
					loading = false;
					console.log(loading);
				}

				return(
					<WebView onLoad={ () => changeStatusLoadign () } style={{marginTop: 15}} source={{ uri: 'https://api.progresarcorp.com.py/api/cards_new?process_id='+process_id}} />
				)
			}
		}

		const botonCancelar = () =>{
			if(tipo === 'tarjeta' || tipo === 'zimple'){

				return(
					<TouchableOpacity
						onPress={()=> Alert.alert('Atención', '¿Está seguro que quiere cancelar el catastro de Tarjeta?', [
							{
							text: "No, Mantener Pedido",
							onPress: () => null,
							style: "cancel"
							},
							{ text: "Sí, Cancelar Pedido", onPress: () => this.cancelarPedido()}
						])
						}
						style={{alignItems: 'center', backgroundColor: '#bf0404', padding: 5, borderRadius: 5}}
					>
						<Text style={{color: 'white'}}>Cancelar Pedido</Text>
					</TouchableOpacity>
				)
			}else{
				return(
					<TouchableOpacity
						onPress={()=> Alert.alert('Atención', '¿Está seguro que quiere cancelar el catastro?', [
							{
							text: "No, continuar",
							onPress: () => null,
							style: "cancel"
							},
							{ text: "Sí, cancelar catastro", onPress: () => this.cancelarCatastro()}
						])
						}
						style={{alignItems: 'center', backgroundColor: '#bf0404', padding: 5, borderRadius: 5}}
					>
						<Text style={{color: 'white'}}>Cancelar Catastro</Text>
					</TouchableOpacity>
				)
			}
		}

		const title = () => {
			var value='';
			if(tipo=='tarjeta' || tipo=='zimple'){
				value = 'Realizar Compra'
			}else{
				value = 'Catastrar Tarjeta'
			}
			return value
		}
		return (
			<SafeAreaView style={{flex: 1, 
				paddingHorizontal: 15, 
				width: '100%', 
				height: '100%', 
				backgroundColor: 'white'
			}}>
					<View style={{marginTop: 70, alignItems: 'center', backgroundColor: 'rgba(156,156,156,0.7)', padding: 5, borderRadius: 5}}>
						<Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>{title()}</Text>
						<Text style={{color: 'white', fontSize: 14}}>Ingrese correctamente los datos de su tarjeta</Text>
					</View>

					<View style={{marginTop: 15}}>
						{botonCancelar()}
					</View>

					<WebView
						startInLoadingState={true}
						style={{marginTop: 15, marginBottom: 15}} 
						source={{ uri: 'https://api.progresarcorp.com.py/api/cards_new?process_id='+process_id}} 
						renderLoading={() => {
							return this.displaySpinner();
						}}
					/>
			</SafeAreaView>
		)
	}
}
