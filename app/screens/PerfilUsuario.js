import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

const IMG_HEADER  = 'https://progresarcorp.com.py/wp-content/uploads/2025/08/inicio.png';
const API_GET     = 'https://api.progresarcorp.com.py/api/ver_datos_usuario';
const API_UPDATE  = 'https://api.progresarcorp.com.py/api/actualizar_datos_usuario';
const API_BLOCK   = 'https://api.progresarcorp.com.py/api/bloquear_acceso';
const API_PROFILE = 'https://api.progresarcorp.com.py/api/perfil_usuario';
const API_CHANGE  = 'https://api.progresarcorp.com.py/api/actualizar_clave';

const PLACEHOLDER_FOTO = 'https://secure.progresarcorp.com.py/images/2.0/hombre.png';
const BASE_FOTO        = 'https://secure.progresarcorp.com.py';

// arma URL final de la foto
const resolveFotoUrl = (path) => {
  if (!path) return PLACEHOLDER_FOTO;
  const p = String(path).trim();
  if (/^https?:\/\//i.test(p)) return p;
  return `${BASE_FOTO}${p.startsWith('/') ? p : `/${p}`}`;
};

function PerfilAvatar({ user_perfil, size = 90 }) {
  const [uri, setUri] = useState(user_perfil ? resolveFotoUrl(user_perfil) : PLACEHOLDER_FOTO);
  useEffect(() => { setUri(user_perfil ? resolveFotoUrl(user_perfil) : PLACEHOLDER_FOTO); }, [user_perfil]);
  return (
    <Image
      style={{ width: size, height: size, borderRadius: size / 2 }}
      source={{ uri }}
      onError={() => setUri(PLACEHOLDER_FOTO)}
    />
  );
}

export default function PerfilUsuario() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // formulario editable (siempre)
  const [form, setForm] = useState({
    lugar_trabajo: '',
    direccion_trabajo: '',
    direccion_casa: '',
    antiguedad: '',
  });
  const [savingForm, setSavingForm] = useState(false);

  // otros estados
  const [userPerfilPath, setUserPerfilPath] = useState(null);
  const [postingBlock, setPostingBlock] = useState(false);

  // refs para navegar entre inputs con "next"
  const refLugar = useRef(null);
  const refDirTrabajo = useRef(null);
  const refDirCasa = useRef(null);
  const refAntig = useRef(null);

  // ===== Modal cambiar contraseña =====
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const passRules = {
    length: (s) => s?.length >= 8,
    upper:  (s) => /[A-Z]/.test(s || ''),
    digit:  (s) => /[0-9]/.test(s || ''),
    special:(s) => /[^A-Za-z0-9]/.test(s || ''),
  };
  const passValid = (s) =>
    passRules.length(s) && passRules.upper(s) && passRules.digit(s) && passRules.special(s);

  const resetPassModal = () => {
    setNewPass(''); setNewPass2(''); setSavingPass(false); setShowPassModal(false);
  };

  const guardarNuevaClave = async () => {
    try {
      if (!passValid(newPass)) {
        Alert.alert('Contraseña inválida', 'Debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.');
        return;
      }
      if (newPass !== newPass2) {
        Alert.alert('No coincide', 'La confirmación de contraseña no coincide.');
        return;
      }

      setSavingPass(true);
      const num_doc = (await AsyncStorage.getItem('usuarioGuardado')) || '';

      const res = await fetch(API_CHANGE, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          num_doc,
          nueva_clave: newPass,
          nueva_clave_confirmation: newPass2,
        })
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && (json.success || json.status === 'ok')) {
        Alert.alert('Éxito', 'Contraseña actualizada.');
        resetPassModal();
      } else {
        Alert.alert('Error', json.message || 'No se pudo actualizar la contraseña.');
      }
    } catch (e) {
      Alert.alert('Error', 'Problema de conexión.');
    } finally {
      setSavingPass(false);
    }
  };
  // ====================================

  const fetchPerfil = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const usuario = await AsyncStorage.getItem('usuarioGuardado');
      if (!usuario) { setPerfil(null); Alert.alert('Atención', 'No se encontró el usuario.'); return; }

      const fotoLocal = await AsyncStorage.getItem('user_perfil');
      if (fotoLocal) setUserPerfilPath(fotoLocal);

      // datos generales
      let res = await fetch(`${API_GET}/${encodeURIComponent(usuario)}`, {
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Cache-Control': 'no-cache' },
      });
      if (!res.ok && res.status === 500 && !isRefresh) {
        await new Promise(r => setTimeout(r, 800));
        res = await fetch(`${API_GET}/${encodeURIComponent(usuario)}`);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const basePerfil = Array.isArray(data) && data.length ? data[0] : (data || null);

      // perfil con user_perfil
      let perfilRes;
      try {
        perfilRes = await fetch(`${API_PROFILE}/${encodeURIComponent(usuario)}`, { headers: { Accept: 'application/json' } });
      } catch {
        perfilRes = null;
      }

      let user_perfil = null;
      if (perfilRes && perfilRes.ok) {
        const j = await perfilRes.json().catch(() => ({}));
        user_perfil = j?.user_perfil ?? (Array.isArray(j) && j[0]?.user_perfil) ?? null;
      }

      if (user_perfil) {
        setUserPerfilPath(user_perfil);
        try { await AsyncStorage.setItem('user_perfil', String(user_perfil)); } catch {}
      }

      const merged = basePerfil ? { ...basePerfil, user_perfil: user_perfil ?? basePerfil.user_perfil ?? null } : null;
      setPerfil(merged);

      // inicializar formulario con valores actuales
      if (merged) {
        setForm({
          lugar_trabajo: merged.lugar_trabajo ?? '',
          direccion_trabajo: merged.direccion_trabajo ?? '',
          direccion_casa: merged.direccion_casa ?? '',
          antiguedad: merged.antiguedad != null ? String(merged.antiguedad) : '',
        });
      }
    } catch (e) {
      console.log('PerfilUsuario error:', e?.message);
      setPerfil(null);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  useEffect(() => { fetchPerfil(false); }, []);
  const onRefresh = async () => { setRefreshing(true); await fetchPerfil(true); setRefreshing(false); };

  const normalizarDoc = (s) => (s || '').toString().replace(/\D+/g, '');

  const guardarCampoEnServidor = async (fieldKey, value) => {
    const usuario = await AsyncStorage.getItem('usuarioGuardado');
    if (!usuario) throw new Error('Usuario no encontrado');

    const docReal = normalizarDoc(perfil?.numero || usuario);
    if (!docReal) throw new Error('Documento no disponible');

    const params = new URLSearchParams();
    params.append('campo', fieldKey);
    params.append('valor', value);
    params.append(fieldKey, value);

    const url = `${API_UPDATE}/${encodeURIComponent(docReal)}`;

    let res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok && res.status === 500) {
      await new Promise(r => setTimeout(r, 600));
      res = await fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
    }

    let json = {};
    try { json = await res.json(); } catch {}
    if (!res.ok || json?.success === false) {
      const msg = json?.message || `Error HTTP ${res.status}`;
      throw new Error(msg);
    }
    return json;
  };

  const saveAll = async () => {
    try {
      if (form.antiguedad && isNaN(Number(form.antiguedad))) {
        Alert.alert('Dato inválido', 'Antigüedad debe ser numérica.'); return;
      }

      // detectar cambios vs perfil
      const campos = ['lugar_trabajo', 'direccion_trabajo', 'direccion_casa', 'antiguedad'];
      const changes = {};
      campos.forEach(k => {
        const oldVal = perfil?.[k] != null ? String(perfil[k]) : '';
        const newVal = form[k] != null ? String(form[k]) : '';
        if (oldVal !== newVal) changes[k] = newVal;
      });

      if (Object.keys(changes).length === 0) {
        Alert.alert('Sin cambios', 'No modificaste ningún campo.'); return;
      }

      setSavingForm(true);
      // guardar uno por uno, respetando tu backend actual
      for (const [k, v] of Object.entries(changes)) {
        await guardarCampoEnServidor(k, v);
      }
      setPerfil(p => ({ ...p, ...changes }));
      Alert.alert('Éxito', 'Cambios guardados.');
    } catch (e) {
      Alert.alert('Error', e?.message || 'No se pudieron guardar los cambios.');
    } finally {
      setSavingForm(false);
    }
  };

  const resetForm = () => {
    setForm({
      lugar_trabajo: perfil?.lugar_trabajo ?? '',
      direccion_trabajo: perfil?.direccion_trabajo ?? '',
      direccion_casa: perfil?.direccion_casa ?? '',
      antiguedad: perfil?.antiguedad != null ? String(perfil.antiguedad) : '',
    });
  };

  const bloquearAccesoApp = async () => {
    Alert.alert('Confirmar bloqueo','¿Estás seguro que querés bloquear el acceso?',
      [{ text:'Cancelar', style:'cancel' },
       { text: postingBlock ? 'Bloqueando…' : 'Bloquear',
         onPress: async () => {
           try{
             setPostingBlock(true);
             const num_doc = (await AsyncStorage.getItem('usuarioGuardado')) || '';
             const res = await fetch(API_BLOCK, {
               method:'POST', headers:{ Accept:'application/json','Content-Type':'application/json' },
               body: JSON.stringify({ num_doc })
             });
             const json = await res.json().catch(()=> ({}));
             if(res.ok && (json.success || json.status==='ok')) Alert.alert('Éxito','Acceso bloqueado.');
             else Alert.alert('Error', json.message || 'No se pudo bloquear el acceso.');
           }catch(e){ Alert.alert('Error','Problema de conexión.'); }
           finally{ setPostingBlock(false); }
         }}]);
  };

  // Campo reusable (siempre editable)
  const InputField = ({ label, value, onChangeText, multiline=false, keyboardType='default', autoCapitalize='sentences', inputRef, onSubmitEditing }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, multiline && { height: 96, textAlignVertical: 'top' }]}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholder={`Editar ${label.toLowerCase()}`}
        editable={!savingForm}
        returnKeyType={multiline ? 'default' : 'next'}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={!multiline}
      />
    </View>
  );

  // Mini componente visual para reglas del password
  const Rule = ({ ok, text }) => (
    <View style={styles.ruleRow}>
      <FontAwesome5
        name={ok ? 'check-circle' : 'circle'}
        size={14}
        color={ok ? '#28a745' : '#bbb'}
        style={{ marginRight: 8 }}
      />
      <Text style={[styles.ruleText, ok && { color: '#28a745' }]}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Cabecera con imagen */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: IMG_HEADER }} style={styles.headerImage} resizeMode="cover" />
        <Text style={styles.headerText}>Mi Perfil</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}><ActivityIndicator size="large" /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#bf0404" colors={['#bf0404']} />}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {!perfil ? (
            <View style={styles.emptyCard}>
              <FontAwesome5 name="user-slash" size={36} color="#bf0404" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyTitle}>Sin datos de perfil</Text>
              <Text style={styles.emptyText}>No pudimos obtener la información del usuario.</Text>
            </View>
          ) : (
            <>
              {/* Card: Avatar + datos no editables + acciones */}
              <View style={styles.card}>
                <View style={styles.profileHeader}>
                  <View style={styles.avatarRingLarge}>
                    <PerfilAvatar user_perfil={perfil?.user_perfil ?? userPerfilPath} size={96} />
                  </View>

                  <View style={styles.profileInfo}>
                    <Text style={styles.nameText}>{perfil?.nombre || '-'}</Text>
                    <Text style={styles.docText}>{perfil?.numero || '-'}</Text>
                    <Text
                      style={styles.emailText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {perfil?.direc_electronica || '-'}
                    </Text>

                    {/* Acciones integradas (ghost) */}
                    <View style={styles.headerActions}>
                      <TouchableOpacity
                        onPress={() => setShowPassModal(true)}
                        style={[styles.headerBtn, styles.headerBtnGhost]}
                        activeOpacity={0.85}
                      >
                        <FontAwesome5 name="key" size={14} color="#9e2021" />
                        <Text style={styles.headerBtnGhostText}>Cambiar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={bloquearAccesoApp}
                        style={[styles.headerBtn, styles.headerBtnGhost]}
                        activeOpacity={0.85}
                      >
                        <FontAwesome5 name="lock" size={14} color="#9e2021" />
                        <Text style={styles.headerBtnGhostText}>{postingBlock ? '...' : 'Bloquear'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Card: Formulario (siempre editable) */}
              <View style={styles.card}>
                <InputField
                  label="Lugar de trabajo"
                  value={form.lugar_trabajo}
                  onChangeText={(v) => setForm(f => ({ ...f, lugar_trabajo: v }))}
                  inputRef={refLugar}
                  onSubmitEditing={() => refDirTrabajo.current?.focus()}
                />
                <InputField
                  label="Dirección trabajo"
                  value={form.direccion_trabajo}
                  onChangeText={(v) => setForm(f => ({ ...f, direccion_trabajo: v }))}
                  multiline
                  inputRef={refDirTrabajo}
                  onSubmitEditing={() => refDirCasa.current?.focus()}
                />
                <InputField
                  label="Dirección casa"
                  value={form.direccion_casa}
                  onChangeText={(v) => setForm(f => ({ ...f, direccion_casa: v }))}
                  multiline
                  inputRef={refDirCasa}
                  onSubmitEditing={() => refAntig.current?.focus()}
                />
                <InputField
                  label="Antigüedad (años)"
                  value={form.antiguedad}
                  onChangeText={(v) => setForm(f => ({ ...f, antiguedad: v }))}
                  keyboardType="numeric"
                  autoCapitalize="none"
                  inputRef={refAntig}
                  onSubmitEditing={saveAll}
                />

                {/* Acciones del formulario */}
                <View style={styles.formActions}>
                  <TouchableOpacity
                    onPress={resetForm}
                    style={[styles.formBtn, { backgroundColor: '#888' }]}
                    activeOpacity={0.85}
                    disabled={savingForm}
                  >
                    <FontAwesome5 name="undo" size={14} color="#fff" />
                    <Text style={styles.formBtnText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={saveAll}
                    style={[styles.formBtn, { backgroundColor: '#28a745' }]}
                    activeOpacity={0.85}
                    disabled={savingForm}
                  >
                    <FontAwesome5 name="save" size={14} color="#fff" />
                    <Text style={styles.formBtnText}>{savingForm ? 'Guardando...' : 'Guardar cambios'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ===== Modal Cambiar Contraseña ===== */}
              <Modal
                visible={showPassModal}
                animationType="slide"
                transparent
                onRequestClose={() => !savingPass && resetPassModal()}
              >
                <View style={styles.modalBackdrop}>
                  <KeyboardAvoidingView
                    behavior={Platform.select({ ios: 'padding', android: undefined })}
                    style={styles.modalWrapper}
                  >
                    <View style={styles.modalCard}>
                      <Text style={styles.modalTitle}>Cambiar contraseña</Text>
                      <Text style={styles.modalSubtitle}>
                        Mínimo 8 caracteres, con mayúscula, número y carácter especial.
                      </Text>

                      <Text style={styles.modalLabel}>Nueva contraseña</Text>
                      <TextInput
                        value={newPass}
                        onChangeText={setNewPass}
                        style={styles.modalInput}
                        placeholder="Nueva contraseña"
                        secureTextEntry
                        editable={!savingPass}
                        returnKeyType="next"
                      />

                      <Text style={styles.modalLabel}>Confirmar contraseña</Text>
                      <TextInput
                        value={newPass2}
                        onChangeText={setNewPass2}
                        style={styles.modalInput}
                        placeholder="Confirmar contraseña"
                        secureTextEntry
                        editable={!savingPass}
                        returnKeyType="done"
                        onSubmitEditing={guardarNuevaClave}
                      />

                      <View style={styles.rulesList}>
                        <Rule ok={passRules.length(newPass)} text="Al menos 8 caracteres" />
                        <Rule ok={passRules.upper(newPass)}  text="Una mayúscula (A-Z)" />
                        <Rule ok={passRules.digit(newPass)}  text="Un número (0-9)" />
                        <Rule ok={passRules.special(newPass)}text="Un carácter especial" />
                        <Rule ok={newPass && newPass === newPass2} text="Coincide la confirmación" />
                      </View>

                      <View style={styles.modalActions}>
                        <TouchableOpacity
                          onPress={resetPassModal}
                          style={[styles.modalBtn, { backgroundColor: '#888' }]}
                          disabled={savingPass}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.modalBtnText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={guardarNuevaClave}
                          style={[styles.modalBtn, { backgroundColor: passValid(newPass) && newPass===newPass2 ? '#28a745' : '#ccc' }]}
                          disabled={savingPass || !passValid(newPass) || newPass !== newPass2}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.modalBtnText}>{savingPass ? 'Guardando…' : 'Guardar'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </KeyboardAvoidingView>
                </View>
              </Modal>
              {/* ===================================== */}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Header
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerText: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerImage: {
    width: '100%',
    height: 170,
  },

  // Loading / content
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 16 },

  // Profile header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  docText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  emailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },

  // Acciones dentro del header
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    minHeight: 36,
  },
  headerBtnGhost: {
    borderWidth: 1,
    borderColor: '#9e2021',
    backgroundColor: 'transparent',
  },
  headerBtnGhostText: {
    color: '#9e2021',
    fontWeight: '700',
    fontSize: 13,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginBottom: 12,
  },

  // Rows & inputs
  row: { marginBottom: 14 },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  value: { fontSize: 16, fontWeight: '600', color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#dadada',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },

  // Form actions
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  formBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  formBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Empty state
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginTop: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center' },

  // ===== Modal styles =====
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    width: '100%',
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#dadada',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  rulesList: {
    marginTop: 10,
    marginBottom: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ruleText: {
    fontSize: 13,
    color: '#444',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  // ========================
  avatarRingLarge: {
    padding: 3,
    backgroundColor: '#fff',
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
});
