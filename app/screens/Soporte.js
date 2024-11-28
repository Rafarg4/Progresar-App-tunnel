import React, { Component} from 'react';
import { View} from 'react-native';
import * as global from '../global.js'
import { WebView } from 'react-native-webview';

export default class SoporteScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }
        global.actRoute='Soporte'
    }

    render(){
        return(
            <WebView source={{ uri: 'https://help-progresarcorp.tawk.help' }} />
        )
    }
}
