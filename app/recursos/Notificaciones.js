import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import * as global from '../global';
import * as Device from 'expo-device';

const saveToken = (token) => {

	var dispositivo= Device.osName+' '+Device.brand+' '+Device.modelName;

	var data = {
		valid: global.valid_api_key,
		expo_token: token,
		num_doc: global.num_doc,
		cod_cliente: global.codigo_cliente,
		nombre: global.nombre,
		dispo: dispositivo
	}

	fetch('https://api.progresarcorp.com.py/api/saveToken',{
		method: 'POST',
		body: JSON.stringify(data), 
		headers:{
			'Content-Type': 'application/json'
		}
	})
	.then(res => res.json())
	.then(response =>{
		console.log(response);
	})
	.catch((error) => {
		console.log(error);
	})
}

export const getToken = async () => {

	try {

		let token;
		
		if(Device.isDevice){

			const { status: existingStatus } = await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;

			if (existingStatus !== 'granted') {
				const { status } = await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}
			if (finalStatus !== 'granted') {
				Alert.alert('Atención', 'Para utilizar las notificaciones, debes conceder permisos a la Aplicación');
				return;
			}

			token = (await Notifications.getExpoPushTokenAsync({projectId:'865fa322-e28d-47f1-8c9d-8c8c53e0b70e'})).data;

		}else{
			Alert.alert('Atención', 'Para utilizar las notificaciones, debes ejecutar la aplicación en un dispositivo fisico.');
			return;
		}
	
		if(Platform.OS == 'android'){
			Notifications.setNotificationChannelAsync("default", {
				name: "default",
				importance: Notifications.AndroidImportance.MAX,
				sound: true,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#FF231F7C"
			})
		}

		saveToken(token);
	
		return token;
	} catch (error) {
		alert(error)
	}

}

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true
	})
})

export const startNotifications = (notificationListener, responseListener) =>{
	notificationListener.current = Notifications.addNotificationReceivedListener(notification =>{
		console.log("notificationListener: ")
		console.log(notification);
		console.log(notification.request.content.data.action);
	})

	responseListener.current = Notifications.addNotificationReceivedListener(notification =>{
		console.log(notification);
	})

	return () =>{
		Notifications.removeNotificationSubscription(notificationListener);
		Notifications.removeNotificationSubscription(responseListener);
	}
}