import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CANVAS = '#FCF9F2';
const SURFACE = '#FFFFFF';
const TEXT = '#2B1A12';
const TEXT_MUTED = 'rgba(43,26,18,0.6)';
const ACCENT = '#B66C2F';

export default function ManualProductEntryScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState('');
  const [notes, setNotes] = useState('');

  const submit = () => {
    // In a future step, save to Convex then navigate
    navigation.navigate('ScanAnalyzing', {
      imageUri: undefined,
      source: 'manual',
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Enter product manually</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Product name" style={styles.input} placeholderTextColor={TEXT_MUTED} />
        <TextInput value={brand} onChangeText={setBrand} placeholder="Brand (optional)" style={styles.input} placeholderTextColor={TEXT_MUTED} />
        <TextInput value={barcode} onChangeText={setBarcode} placeholder="Barcode (optional)" style={styles.input} placeholderTextColor={TEXT_MUTED} />
        <TextInput value={notes} onChangeText={setNotes} placeholder="Notes (optional)" style={[styles.input, { height: 88 }]} multiline placeholderTextColor={TEXT_MUTED} />
        <TouchableOpacity onPress={submit} style={styles.btn}>
          <Text style={styles.btnText}>Analyze</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CANVAS, padding: 20 },
  card: { backgroundColor: SURFACE, borderRadius: 20, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: TEXT, marginBottom: 12 },
  input: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.08)', paddingHorizontal: 12, paddingVertical: 10, color: TEXT, marginBottom: 10, backgroundColor: '#fff' },
  btn: { marginTop: 6, backgroundColor: '#F2D9C3', borderRadius: 28, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: ACCENT, fontWeight: '800', fontSize: 14 },
});