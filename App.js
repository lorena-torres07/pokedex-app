import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const API_URL = 'https://pokeapi.co/api/v2/pokemon';
const LIMIT = 100;

const getId = (url) => url.split('/').filter(Boolean).pop();
const getImage = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function App() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadPokemons = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}?limit=${LIMIT}`);
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
      const data = await response.json();
      setPokemons(
        data.results.map((p) => ({
          id: getId(p.url),
          name: p.name,
          url: p.url,
        }))
      );
    } catch (e) {
      setError(e.message || 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPokemons();
  }, [loadPokemons]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPokemons();
  };

  const openDetail = async (pokemon) => {
    setSelected(pokemon);
    setDetail(null);
    setDetailLoading(true);
    try {
      const response = await fetch(pokemon.url);
      const data = await response.json();
      setDetail({
        height: data.height / 10,
        weight: data.weight / 10,
        types: data.types.map((t) => t.type.name),
        abilities: data.abilities.map((a) => a.ability.name),
      });
    } catch (e) {
      setDetail({ error: true });
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      pokemons.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [pokemons, search]
  );

  const renderItem = ({ item }) => (
    <Pressable style={styles.card} onPress={() => openDetail(item)}>
      <Image source={{ uri: getImage(item.id) }} style={styles.image} />
      <Text style={styles.number}>#{String(item.id).padStart(3, '0')}</Text>
      <Text style={styles.name}>{capitalize(item.name)}</Text>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#e3350d" />
        <Text style={styles.message}>Carregando Pokémons...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
        <Text style={styles.message}>{error}</Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            setLoading(true);
            loadPokemons();
          }}
        >
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e3350d" />
      <View style={styles.header}>
        <Text style={styles.title}>Pokédex</Text>
        <TextInput
          style={styles.search}
          placeholder="Buscar Pokémon..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e3350d']}
          />
        }
        ListEmptyComponent={
          <Text style={styles.message}>Nenhum Pokémon encontrado.</Text>
        }
      />

      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {selected && (
              <>
                <Image
                  source={{ uri: getImage(selected.id) }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalTitle}>{capitalize(selected.name)}</Text>

                {detailLoading && (
                  <ActivityIndicator size="small" color="#e3350d" />
                )}

                {detail && !detail.error && (
                  <View style={styles.info}>
                    <Text style={styles.infoText}>
                      Tipo: {detail.types.map(capitalize).join(', ')}
                    </Text>
                    <Text style={styles.infoText}>
                      Altura: {detail.height} m
                    </Text>
                    <Text style={styles.infoText}>
                      Peso: {detail.weight} kg
                    </Text>
                    <Text style={styles.infoText}>
                      Habilidades: {detail.abilities.map(capitalize).join(', ')}
                    </Text>
                  </View>
                )}

                {detail?.error && (
                  <Text style={styles.message}>
                    Não foi possível carregar os detalhes.
                  </Text>
                )}

                <Pressable
                  style={styles.button}
                  onPress={() => setSelected(null)}
                >
                  <Text style={styles.buttonText}>Fechar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: '#e3350d',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  list: { padding: 12 },
  row: { justifyContent: 'space-between' },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: 110, height: 110 },
  number: { color: '#888', fontSize: 12, marginTop: 6 },
  name: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  message: { color: '#555', fontSize: 15, textAlign: 'center', marginTop: 12 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#e3350d' },
  button: {
    backgroundColor: '#e3350d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalImage: { width: 180, height: 180 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
  info: { alignSelf: 'stretch', marginTop: 8 },
  infoText: { fontSize: 16, marginVertical: 3, color: '#333' },
});
