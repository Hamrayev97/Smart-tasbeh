import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useApp } from '../hooks/useAppContext';

export default function DhikrListScreen() {
  const { t, colors, dhikrs, addDhikrItem, updateDhikrItem, deleteDhikrItem } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('33');

  const openAdd = () => {
    setEditing(null);
    setName('');
    setTarget('33');
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name);
    setTarget(String(item.target));
    setModalVisible(true);
  };

  const submit = async () => {
    if (!name.trim()) return;
    const payload = { name: name.trim(), target: Number(target) || 33, colorTheme: 'emerald' };
    if (editing) await updateDhikrItem({ id: editing.id, ...payload });
    else await addDhikrItem(payload);
    setModalVisible(false);
  };

  const remove = (id) => Alert.alert(t.deleteDhikr, '...', [
    { text: t.cancel },
    { text: t.deleteDhikr, style: 'destructive', onPress: () => deleteDhikrItem(id) },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {dhikrs.map((item) => (
          <View key={item.id} style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{item.name}</Text>
            <Text style={{ color: colors.textMuted, marginTop: 4 }}>{t.defaultTarget}: {item.target}</Text>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Pressable onPress={() => openEdit(item)} style={{ backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 8 }}><Text style={{ color: '#fff' }}>{t.editDhikr}</Text></Pressable>
              <Pressable onPress={() => remove(item.id)} style={{ backgroundColor: '#b04040', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}><Text style={{ color: '#fff' }}>{t.deleteDhikr}</Text></Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable onPress={openAdd} style={{ position: 'absolute', right: 20, bottom: 20, backgroundColor: colors.accent, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 30, color: '#2e2814' }}>+</Text>
      </Pressable>

      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ width: '100%', backgroundColor: colors.surface, borderRadius: 12, padding: 16 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{editing ? t.editDhikr : t.addDhikr}</Text>
            <TextInput value={name} onChangeText={setName} placeholder={t.name} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.text, padding: 10, marginTop: 10 }} />
            <TextInput value={target} onChangeText={setTarget} keyboardType="numeric" placeholder={t.defaultTarget} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, color: colors.text, padding: 10, marginTop: 10 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <Pressable onPress={() => setModalVisible(false)} style={{ marginRight: 10 }}><Text style={{ color: colors.textMuted }}>{t.cancel}</Text></Pressable>
              <Pressable onPress={submit}><Text style={{ color: colors.primary, fontWeight: '700' }}>{t.save}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
