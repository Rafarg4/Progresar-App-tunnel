import React, {Component} from 'react'
import {View, StatusBar} from 'react-native'
import * as Animatable from 'react-native-animatable'
import {imageBackgroundStyle} from '../styles/General'

export default class LoginScreen extends Component{

    gotoSreen(routeName){
        this.props.navigation.navigate(routeName)
    }

    componentDidMount(){
        setTimeout( ()=>{
                this.gotoSreen('Login')
            }, 3000, this
        )
    }

    render(){
        return(
            <View style={imageBackgroundStyle.image}>
                <StatusBar
                    barStyle='light-content'
                    animated={true}
                    backgroundColor="#bf0404"
                />
                <Animatable.Image 
                    animation="pulse"
                    easing="ease-in"
                    iterationCount={2}
                    style={{
                        width: 270,
                        height: 70,
                        margin: 100,
                        width: 300, height: 100, resizeMode: 'contain'
                    }}
                    source={ require("../assets/logo-progre.png")}
                />
            </View>
        )
    }
}