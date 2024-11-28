const Parametros = () =>{ 
    return(
        [
            {
                name: 'shopping-cart',
                onPress: () => this.gotoScreen('Electrodomésticos'),
                backgroundColor: '#bf0404',
                style: { marginRight: 8, marginLeft: 8, fontSize: 20 },
                color: 'white',
            },

            {
                name: 'credit-card',
                onPress: () => this.gotoScreen('Tarjetas'),
                backgroundColor: '#bf0404',
                style: { marginRight: 8, marginLeft: 8, fontSize: 20 },
                color: 'white',
            },

            {
                name: 'usd',
                onPress: () => this.gotoScreen('Financiero'),
                backgroundColor: '#bf0404',
                style: { marginRight: 8, marginLeft: 8, fontSize: 20 },
                color: 'white',
            },

            {
                name: 'home',
                onPress: () => this.gotoScreen('Home'),
                backgroundColor: '#bf0404',
                style: { marginRight: 8, marginLeft: 8, fontSize: 20 },
                color: 'white',
            },

            {
                name: 'map',
                onPress: () => this.gotoScreen('Sucursales'),
                backgroundColor: '#bf0404',
                style: { marginRight: 8, marginLeft: 8, fontSize: 20 },
                color: 'white',
            },

            {
                name: 'comments',
                onPress: () => this.gotoScreen('Soporte'),
                backgroundColor: '#bf0404',
                style: { marginRight: 8, marginLeft: 8, fontSize: 20 },
                color: 'white',
            },

        ]
    )
}

export default Parametros