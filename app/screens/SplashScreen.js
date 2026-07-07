import React, { Component } from 'react';
import { View, StatusBar, Image } from 'react-native';
import { imageBackgroundStyle } from '../styles/General';

export default class LoginScreen extends Component {

  gotoSreen(routeName) {
    this.props.navigation.navigate(routeName);
  }

  componentDidMount() {
    setTimeout(() => {
      this.gotoSreen('Login');
    }, 3000);
  }

  render() {
    return (
      <View style={imageBackgroundStyle.image}>
        <StatusBar
          barStyle="light-content"
          animated={true}
          backgroundColor="#bf0404"
        />

        <Image
          style={{
            margin: 100,
            width: 300,
            height: 100,
            resizeMode: 'contain'
          }}
          source={require('../assets/logo-progre.png')}
        />
      </View>
    );
  }
}
