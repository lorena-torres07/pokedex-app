# Pokédex App

Atividade Individual 04 — App em **React Native + Expo** que consome a [PokéAPI](https://pokeapi.co/) e exibe os dados em tela.

## Funcionalidades

- Lista de 100 Pokémons com imagem, número e nome (grade de 2 colunas)
- Busca por nome
- Detalhes (tipo, altura, peso, habilidades) em modal ao tocar no card
- Indicador de carregamento, tratamento de erro com botão "Tentar novamente"
- Pull-to-refresh

## Tecnologias

- React Native
- Expo
- `fetch` para consumo da API (sem bibliotecas extras)

## Como executar

```bash
npm install
npx expo start
```

Escaneie o QR Code com o app **Expo Go** (Android/iOS) ou pressione `w` para abrir no navegador.

## API utilizada

- `GET https://pokeapi.co/api/v2/pokemon?limit=100` — lista
- `GET https://pokeapi.co/api/v2/pokemon/{id}` — detalhes
