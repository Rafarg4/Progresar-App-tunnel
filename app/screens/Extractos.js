import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ImageBackground, Alert, Linking
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';


// Datos simulados
const extractosMock = [
  {
    anio: '2025',
    categorias: [
      {
        nombre: 'Visa',
        subcategorias: [
          {
            nombre: 'Credicard',
            subcategorias: [
              {
                nombre: 'Dinelco',
                meses: [
                  {
                    mes: 'Septiembre 2025',
                    archivos: [
                      {
                        id: 1,
                        nombre: 'Extracto_Mes_Septiembre_240038469.pdf',
                        url: 'https://api.progresarcorp.com.py/extractos/Extracto_Mes_Septiembre_240038469.pdf',
                      },
                    ],
                  },
                  {
                    mes: 'Agosto 2025',
                    archivos: [
                      {
                        id: 2,
                        nombre: 'Extracto Visa 05-08-2025.pdf',
                        url: 'https://...',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function Extractos() {
  const [extractos, setExtractos] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setExtractos(extractosMock);
  }, []);

  const toggleAccordion = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const abrirArchivo = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se puede abrir el archivo');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const descargarArchivo = async (url) => {
    try {
      const nombreArchivo = url.split('/').pop();
      const destino = FileSystem.documentDirectory + nombreArchivo;

      const { uri } = await FileSystem.downloadAsync(url, destino);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'No se puede guardar el archivo en Descargas');
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);

      Alert.alert('Descarga completa', 'El archivo está en tu carpeta Descargas 📂');
    } catch (error) {
      Alert.alert('Error', 'No se pudo descargar el archivo: ' + error.message);
    }
  };

  // 🔹 Renderiza acordeón de forma recursiva
  const renderAccordion = (item, idPrefix) => {
    const id = idPrefix;
    const isExpanded = expanded === id;

    // Caso 1: Año o categoría con subcategorías
    if (item.categorias || item.subcategorias) {
      const children = item.categorias || item.subcategorias;
      return (
        <View key={id} style={styles.section}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion(id)}>
            <FontAwesome name={isExpanded ? 'folder-open' : 'folder'} size={20} color="#bf0404" />
            <Text style={styles.sectionTitle}>{item.anio || item.nombre}</Text>
            <FontAwesome name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#333" />
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.filesContainer}>
              {children.map((child, index) =>
                renderAccordion(child, `${id}-${index}`)
              )}
            </View>
          )}
        </View>
      );
    }

    // Caso 2: Nivel Mes con archivos
    if (item.mes) {
      return (
        <View key={id} style={styles.section}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion(id)}>
            <FontAwesome name={isExpanded ? 'folder-open' : 'folder'} size={20} color="#bf0404" />
            <Text style={styles.sectionTitle}>{item.mes}</Text>
            <FontAwesome name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#333" />
          </TouchableOpacity>

          {isExpanded &&
            item.archivos.map((file) => (
              <View key={file.id} style={styles.fileRow}>
                <TouchableOpacity
                  style={[styles.fileItem, { flex: 1 }]}
                  onPress={() => abrirArchivo(file.url)}
                >
                  <FontAwesome name="file-pdf-o" size={18} color="#bf0404" style={{ marginRight: 8 }} />
                  <Text style={styles.fileName}>{file.nombre}</Text>
                </TouchableOpacity>

                {/* Botón descarga */}
                <TouchableOpacity style={styles.downloadButton} onPress={() => descargarArchivo(file.url)}>
                  <FontAwesome name="download" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Cabecera */}
      <ImageBackground
        source={require('../assets/inicio.png')}
        style={styles.header}
        resizeMode="cover"
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <Text style={styles.headerTitle}>Mis Extractos</Text>
        <Text style={styles.headerSubtitle}>
          Accede fácilmente a tus extractos mensuales de tarjeta en un solo lugar
        </Text>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.container}>
        {extractos.map((anio, i) => renderAccordion(anio, `anio-${i}`))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 160,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerImage: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  container: { paddingBottom: 20 },
  section: {
    width: '92%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  filesContainer: { paddingHorizontal: 12, paddingBottom: 12 },
  fileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  fileName: { flex: 1, fontSize: 14, color: '#333' },
  downloadButton: {
    backgroundColor: '#bf0404',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
});
