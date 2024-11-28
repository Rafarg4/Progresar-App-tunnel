import React from 'react'
import { SafeAreaView, StyleSheet, Platform, View} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

const botones = (props) => {
    const {parametros} = props

    const items = () =>{
        const resultados = [];
        parametros.forEach((it, index) => {
            resultados.push(
            <Icon.Button key={index}
                name={it.name}
                onPress={it.onPress}
                backgroundColor={it.backgroundColor}
                iconStyle={it.style}
                color={it.color}
            />
            )
        });

        return resultados
    }

    return (
        <View style={styles.capa1}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15 }}>
                {
                    items()
                }
            </View>
        </View>
    )
}

let styleCapa2 = {
    flexDirection: 'row',
    padding: 10
};

if(Platform.OS == 'ios'){
    styleCapa2= {
        flexDirection: 'row',
        padding: 10,
        marginTop: 12,
    };
}

const styles = StyleSheet.create({
    capa1: {
        backgroundColor: '#bf0404',
        paddingHorizontal: 15,
        height: 70,
    },

    capa2: styleCapa2
})

export default botones;
