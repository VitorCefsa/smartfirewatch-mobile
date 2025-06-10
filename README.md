# SmartFireWatch Mobile

Aplicativo mobile do projeto **SmartFireWatch**, parte do Trabalho de Conclusão de Curso em Engenharia da Computação. O app permite visualizar alertas de incêndios detectados por câmeras conectadas ao sistema, marcá-los como resolvidos e registrar logs com imagem.

## 🔥 Funcionalidades

- Visualização de incidentes detectados por câmeras
- Emissão de alertas sonoros em tempo real
- Registro automático com imagem do incêndio
- Marcação de incidentes como resolvidos
- Integração com API e modelo YOLOv11 (via Roboflow)

## 📱 Tecnologias

- **React Native (Expo)**
- **Axios** para chamadas HTTP
- **Context API** para estado global
- **React Navigation** para navegação
- **YOLOv11** para inferência de fogo (via servidor externo)

## 🧪 Como rodar o app

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` com as variáveis necessárias:

```env
API_URL=https://seu-backend.com/api
```

3. Execute com Expo:

```bash
npx expo start
```

> Certifique-se de que o backend esteja rodando e que a câmera do dispositivo esteja disponível.

## 🗃️ Estrutura do Projeto

```
smartfirewatch-mobile/
├── assets/
├── components/
│   └── FireCard.tsx
├── contexts/
│   └── IncidentsContext.tsx
├── screens/
│   ├── HomeScreen.tsx
│   └── IncidentsScreen.tsx
├── services/
│   └── api.ts
├── hooks/
│   └── useLogIncident.ts
├── App.tsx
└── README.md
```

## 📦 Funcionalidades Futuras

- Autenticação de usuários
- Notificações push
- Histórico de incidentes por data
- Modo escuro


---

Este aplicativo faz parte do ecossistema **SmartFireWatch**, que visa a prevenção de incêndios utilizando inteligência artificial e monitoramento em tempo real.