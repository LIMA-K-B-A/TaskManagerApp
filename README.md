# TaskUp - Gerenciador de Tarefas

O TaskUp é um aplicativo móvel desenvolvido para ajudar você a gerenciar suas tarefas de forma eficiente e organizada. Com uma interface moderna e intuitiva, você pode criar, acompanhar e completar suas tarefas com facilidade.

## Funcionalidades

- 🔐 Autenticação de usuários
- 📝 Criação de tarefas com título e descrição
- ⏰ Definição de tempo limite para cada tarefa
- 📸 Upload de imagens para as tarefas
- ✅ Marcação de tarefas como concluídas
- 📊 Contagem de tarefas ativas e concluídas
- ⏱️ Timer para acompanhamento do tempo
- 🎨 Interface moderna e responsiva

## Tecnologias Utilizadas

- [React Native](https://reactnative.dev/) - Framework para desenvolvimento mobile
- [Expo](https://expo.dev/) - Plataforma de desenvolvimento
- [Firebase](https://firebase.google.com/) - Backend e autenticação
  - Firebase Authentication
  - Cloud Firestore
  - Firebase Storage
- [TypeScript](https://www.typescriptlang.org/) - Linguagem de programação
- [Expo Router](https://docs.expo.dev/router/introduction/) - Navegação
- [React Native Paper](https://callstack.github.io/react-native-paper/) - Componentes UI
- [date-fns](https://date-fns.org/) - Manipulação de datas

## Pré-requisitos

- Node.js 16 ou superior
- npm ou yarn
- Expo CLI
- Conta no Firebase

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/taskup.git
cd taskup
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure o Firebase:
   - Crie um projeto no Firebase Console
   - Ative Authentication, Firestore e Storage
   - Copie as credenciais do seu projeto
   - Substitua as credenciais no arquivo `app/config/firebase.ts`

4. Inicie o projeto:
```bash
npx expo start
```

5. Execute no seu dispositivo:
   - Instale o app Expo Go no seu celular
   - Escaneie o QR Code que aparece no terminal
   - Ou use um emulador Android/iOS

## Estrutura do Projeto

```
app/
├── (auth)/           # Telas de autenticação
├── (tabs)/           # Telas principais
├── components/       # Componentes reutilizáveis
├── config/          # Configurações
├── services/        # Serviços
└── types/           # Tipos TypeScript
```

## Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter) - email@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/taskup](https://github.com/seu-usuario/taskup)
