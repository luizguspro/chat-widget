# Chat Widget com Dialogflow CX

Sistema de chat widget configurável integrado com Google Dialogflow CX.

## 📋 Pré-requisitos

- Node.js v14+
- Conta no Google Cloud Platform
- Agente configurado no Dialogflow CX
- Arquivo de credenciais (service account)

## 🚀 Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   cd backend
   npm install
   ```

3. Configure as credenciais:
   - Coloque o arquivo `dialogflow-key.json` na raiz do projeto
   - Este arquivo contém as credenciais da service account do Google Cloud

4. Configure o arquivo `.env` (opcional):
   ```
   PORT=3000
   GOOGLE_APPLICATION_CREDENTIALS=./dialogflow-key.json
   ```

## 💻 Executando o Projeto

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

O servidor estará disponível em http://localhost:3000

## 🛠️ Administração

Acesse http://localhost:3000/admin para:
- Criar novos widgets
- Configurar aparência
- Definir agente do Dialogflow
- Personalizar mensagens

## 📦 Estrutura do Projeto

```
chat_widget/
├── backend/              # Servidor Node.js/TypeScript
│   ├── src/
│   │   ├── controllers/  # Rotas da API
│   │   ├── services/     # Lógica de negócio
│   │   ├── types/        # Tipos TypeScript
│   │   └── server.ts     # Entrada do servidor
│   └── package.json
├── frontend-admin/       # Interface de administração
│   ├── index.html
│   ├── css/
│   └── js/
├── widget/              # Widget do chat
│   └── widget.js
└── dialogflow-key.json  # Credenciais (não commitar!)
```

## 🔧 Configuração do Widget

Para usar o widget em um site:

```html
<script src="http://seu-dominio.com/widget/widget.js"></script>
<script>
  ChatWidget.inicializar({
    widgetId: 'SEU_WIDGET_ID_AQUI'
  });
</script>
```

## 📝 Configuração do Dialogflow CX

No admin do widget, configure:
- **Project ID**: ID do projeto no Google Cloud
- **Agent ID**: ID do agente no Dialogflow CX  
- **Location**: Região do agente (ex: global, us-central1)

## 🎨 Personalização

No admin você pode personalizar:
- Cores do chat
- Avatar/imagem do bot
- Mensagens de boas-vindas
- Placeholder do input
- Botões rápidos
- Posição na tela

## 🔐 Segurança

- Não commite o arquivo `dialogflow-key.json`
- Use HTTPS em produção
- Configure CORS adequadamente
- Valide domínios autorizados

## 📄 Licença

[Sua licença aqui]
