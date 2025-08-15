import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CANVAS = '#FCF9F2';
const SURFACE = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.06)';
const TEXT = '#2B1A12';
const TEXT_MUTED = 'rgba(43,26,18,0.6)';
const ACCENT = '#B66C2F';

export default function ProductsScreen() {
  const navigation = useNavigation();

  const products = [
    { id: '1', name: 'Gentle Cleanser', meta: 'AM • PM', img: 'https://i.postimg.cc/8kXq5sYh/sample-product.png' },
    { id: '2', name: 'Vitamin C Serum', meta: 'AM', img: 'https://i.postimg.cc/8kXq5sYh/sample-product.png' },
    { id: '3', name: 'Hydrating Moisturizer', meta: 'AM • PM', img: 'https://i.postimg.cc/8kXq5sYh/sample-product.png' },
    { id: '4', name: 'Daily SPF 50', meta: 'AM', img: 'https://i.postimg.cc/8kXq5sYh/sample-product.png' },
  ];

  const renderItem = ({ item }: { item: { id: string; name: string; meta: string; img: string } }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Results' as never)} activeOpacity={0.85}>
      <Image source={{ uri: item.img }} style={styles.thumb} resizeMode="cover" />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemMeta}>{item.meta}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={20} color={ACCENT} />
        </TouchableOpacity>
        <Text style={styles.title}>Products</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CANVAS },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  back: { padding: 8, marginRight: 8 },
  title: { fontSize: 18, fontWeight: '800', color: TEXT },
  list: { padding: 16, paddingBottom: 32 },
  item: { backgroundColor: SURFACE, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: BORDER },
  thumb: { width: 56, height: 56, borderRadius: 8, marginRight: 12, backgroundColor: '#EFEFEF' },
  itemTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  itemMeta: { fontSize: 12, color: TEXT_MUTED, marginTop: 4 },
  sep: { height: 12 },
});