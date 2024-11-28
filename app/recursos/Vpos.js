import React from 'react';
import { Alert } from 'react-native';
import * as global from '../global';

var md5 = require('md5');

export default function userCards () {

	global.cards = [];

	var data = {
		public_key: global.public_key_vpos,
		operation: {
			token: md5(
				global.private_key_vpos + global.codigo_cliente + "request_user_cards"
			),
		},
	};

	fetch(global.url_environment_vpos + "/vpos/api/0.3/users/" + global.codigo_cliente + "/cards",
		{
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
			},
		}
	)
	.then((response) => response.json())
	.then((data) => {
		
		if (data.status == "success") {
			if (data.cards == "") {
				global.cards = [];
			} else {
				var i = 0;
				for (i = 0; i < data.cards.length; i++) {

					if (data.cards[i].card_type === "debit") {
						global.cards.push(
							{ value: data.cards[i].alias_token, label: data.cards[i].card_masked_number +" - " +data.cards[i].card_brand,}
						);
					}

				}
			}
		} else {
			Alert.alert("Error", "La respuesta del proveedor es: \n" + data.messages[0].dsc);
		}
	})
	.catch((error) => {
		Alert.alert("Error","No pudimos conectarnos con el proveedor del servicio. \nPor favor, inténtelo más tarde");
	});
};