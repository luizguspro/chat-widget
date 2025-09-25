const fs = require('fs');
const path = require('path');

console.log('====================================');
console.log('  CORRIGINDO WIDGET PARA CORS      ');
console.log('====================================\n');

// 1. Atualizar CORS middleware para aceitar qualquer origem
const corsMiddlewareContent = `import cors from 'cors';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Para produção, você deve listar domínios específicos
    // Por enquanto, aceitar qualquer origem para testes
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Widget-Id'],
  exposedHeaders: ['Content-Type']
});

// Middleware específico para rotas do widget - mais permissivo
export const widgetCorsMiddleware = cors({
  origin: true, // Aceita qualquer origem
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Widget-Id'],
  exposedHeaders: ['Content-Type']
});`;

// 2. Atualizar server.ts para usar CORS específico nas rotas do widget
const serverContent = `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import widgetRoutes from './controllers/widget.controller';
import chatRoutes from './controllers/chat.controller';
import { corsMiddleware, widgetCorsMiddleware } from './middleware/cors.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS geral para admin
app.use('/admin', corsMiddleware);
app.use('/admin', express.static(path.join(__dirname, '../../frontend-admin')));

// CORS permissivo para widget e API do chat
app.use('/widget', widgetCorsMiddleware);
app.use('/widget', express.static(path.join(__dirname, '../../widget')));

app.use('/api/widgets', widgetCorsMiddleware);
app.use('/api/chat', widgetCorsMiddleware);

// Rotas da API
app.use('/api/widgets', widgetRoutes);
app.use('/api/chat', chatRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    mensagem: 'Chat Widget API',
    admin: '/admin',
    widget: '/widget',
    documentacao: '/api/docs'
  });
});

app.listen(PORT, () => {
  console.log(\`====================================\`);
  console.log(\`Servidor rodando em http://localhost:\${PORT}\`);
  console.log(\`Admin: http://localhost:\${PORT}/admin\`);
  console.log(\`====================================\`);
  console.log(\`\`);
  console.log(\`Para testar o widget em sites externos:\`);
  console.log(\`1. Crie um widget no admin\`);
  console.log(\`2. Copie o código de embed\`);
  console.log(\`3. Cole em qualquer site HTML\`);
  console.log(\`====================================\`);
});`;

// 3. Atualizar widget.js para usar URLs absolutas
const widgetJsContent = `(function() {
  // Detectar URL base do script atual
  const scripts = document.getElementsByTagName('script');
  let baseUrl = 'http://localhost:3000';
  
  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src && scripts[i].src.includes('/widget/widget.js')) {
      const url = new URL(scripts[i].src);
      baseUrl = url.origin;
      break;
    }
  }
  
  const ChatWidget = {
    config: null,
    sessionId: null,
    isOpen: false,
    container: null,
    timeoutTimer: null,
    avisoTimer: null,
    ultimaAtividade: Date.now(),
    baseUrl: baseUrl, // URL base dinâmica
    
    async inicializar(opcoes) {
      if (!opcoes.widgetId) {
        console.error('Widget ID é obrigatório');
        return;
      }
      
      console.log('Inicializando widget com base URL:', this.baseUrl);
      
      // Buscar configuração
      try {
        const response = await fetch(\`\${this.baseUrl}/api/widgets/\${opcoes.widgetId}\`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!data.sucesso) {
          console.error('Widget não encontrado');
          return;
        }
        
        this.config = data.widget;
        this.criarWidget();
        this.iniciarSessao();
        this.configurarTimeout();
      } catch (erro) {
        console.error('Erro ao inicializar widget:', erro);
      }
    },
    
    async iniciarSessao() {
      try {
        const response = await fetch(\`\${this.baseUrl}/api/chat/sessao/\${this.config.widgetId}\`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        const data = await response.json();
        this.sessionId = data.sessionId;
      } catch (erro) {
        console.error('Erro ao iniciar sessão:', erro);
      }
    },
    
    configurarTimeout() {
      if (!this.config.recursos.timeoutHabilitado) return;
      
      const timeoutMs = this.config.recursos.timeoutMinutos * 60 * 1000;
      const avisoMs = Math.max(timeoutMs - 60000, timeoutMs * 0.8);
      
      this.resetarTimeout();
      
      document.addEventListener('mousemove', () => this.registrarAtividade());
      document.addEventListener('keypress', () => this.registrarAtividade());
    },
    
    registrarAtividade() {
      this.ultimaAtividade = Date.now();
      this.resetarTimeout();
    },
    
    resetarTimeout() {
      if (!this.config.recursos.timeoutHabilitado) return;
      
      clearTimeout(this.timeoutTimer);
      clearTimeout(this.avisoTimer);
      
      const timeoutMs = this.config.recursos.timeoutMinutos * 60 * 1000;
      const avisoMs = Math.max(timeoutMs - 60000, timeoutMs * 0.8);
      
      this.avisoTimer = setTimeout(() => {
        if (this.isOpen) {
          this.adicionarMensagem(this.config.mensagens.timeoutAviso, 'sistema');
        }
      }, avisoMs);
      
      this.timeoutTimer = setTimeout(() => {
        this.reiniciarPorTimeout();
      }, timeoutMs);
    },
    
    async reiniciarPorTimeout() {
      if (!this.isOpen) return;
      
      const container = document.getElementById('chatMensagens');
      container.innerHTML = '';
      
      await this.iniciarSessao();
      
      this.adicionarMensagem(this.config.mensagens.timeoutReinicio, 'bot');
      
      this.resetarTimeout();
    },
    
    async reiniciarConversa() {
      const container = document.getElementById('chatMensagens');
      container.innerHTML = '';
      
      await this.iniciarSessao();
      
      if (this.config.mensagens.boasVindas) {
        this.adicionarMensagem(this.config.mensagens.boasVindas, 'bot');
      }
      
      this.resetarTimeout();
    },
    
    criarWidget() {
      // Criar container
      this.container = document.createElement('div');
      this.container.id = 'chat-widget-container';
      this.container.innerHTML = this.gerarHTML();
      document.body.appendChild(this.container);
      
      // Adicionar estilos
      const style = document.createElement('style');
      style.textContent = this.gerarCSS();
      document.head.appendChild(style);
      
      // Adicionar event listeners
      this.configurarEventos();
      
      // Mostrar mensagem de boas-vindas
      if (this.config.mensagens.boasVindas) {
        this.adicionarMensagem(this.config.mensagens.boasVindas, 'bot');
      }
    },
    
    gerarHTML() {
      const imagemPerfil = this.config.visual.imagemPerfil || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IndoaXRlIj48cGF0aCBkPSJNMjAgNEMxMS4xNiA0IDQgMTEuMTYgNCAyMHM3LjE2IDE2IDE2IDE2IDE2LTcuMTYgMTYtMTZTMjguODQgNCAyMCA0em0wIDhjMi4yMSAwIDQgMS43OSA0IDRzLTEuNzkgNC00IDQtNC0xLjc5LTQtNCAxLjc5LTQgNC00em0wIDIwYy00LjQyIDAtOC4zMS0yLjI3LTEwLjU4LTUuN0MxMS43IDIzLjk0IDE1Ljg1IDIyLjUgMjAgMjIuNXM4LjMgMS40NCAxMC41OCAzLjhDMjguMzEgMjkuNzMgMjQuNDIgMzIgMjAgMzJ6Ii8+PC9zdmc+';
      
      return \`
        <div class="chat-widget-botao" id="chatBotao">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L1 23l6.71-1.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10s-4.48-10-10-10z"/>
          </svg>
        </div>
        <div class="chat-widget-janela" id="chatJanela" style="display:none;">
          <div class="chat-widget-header">
            <div class="chat-widget-header-info">
              <img src="\${imagemPerfil}" class="chat-widget-avatar" alt="Bot">
              <div>
                <span class="chat-widget-nome">\${this.config.visual.nomeBotVisivel || 'Assistente'}</span>
                <span class="chat-widget-status">Online</span>
              </div>
            </div>
            <div class="chat-widget-header-acoes">
              \${this.config.recursos.mostrarRefresh ? \`
              <button class="chat-widget-refresh" id="chatRefresh" title="Reiniciar conversa">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
              </button>
              \` : ''}
              <button class="chat-widget-fechar" id="chatFechar">×</button>
            </div>
          </div>
          <div class="chat-widget-mensagens" id="chatMensagens"></div>
          \${this.config.recursos.botoesRapidos?.length ? \`
          <div class="chat-widget-botoes-rapidos">
            \${this.config.recursos.botoesRapidos.map(texto => 
              \`<button class="chat-widget-botao-rapido" data-texto="\${texto}">\${texto}</button>\`
            ).join('')}
          </div>
          \` : ''}
          <div class="chat-widget-input-container">
            <input type="text" id="chatInput" placeholder="\${this.config.mensagens.placeholder}">
            <button id="chatEnviar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="\${this.config.visual.corPrimaria}">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      \`;
    },
    
    gerarCSS() {
      const pos = this.config.visual.posicao === 'bottom-left' ? 'left: 20px;' : 'right: 20px;';
      
      return \`
        #chat-widget-container {
          position: fixed;
          bottom: 20px;
          \${pos}
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .chat-widget-botao {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: \${this.config.visual.corPrimaria};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }
        
        .chat-widget-botao:hover {
          transform: scale(1.1);
        }
        
        .chat-widget-janela {
          position: absolute;
          bottom: 70px;
          \${this.config.visual.posicao === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
          width: \${this.config.visual.largura}px;
          height: \${this.config.visual.altura}px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .chat-widget-header {
          background: \${this.config.visual.corPrimaria};
          color: white;
          padding: 12px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .chat-widget-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .chat-widget-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          object-fit: cover;
        }
        
        .chat-widget-header-info > div {
          display: flex;
          flex-direction: column;
        }
        
        .chat-widget-nome {
          font-weight: 600;
          font-size: 14px;
        }
        
        .chat-widget-status {
          font-size: 11px;
          opacity: 0.9;
        }
        
        .chat-widget-header-acoes {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .chat-widget-refresh {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        
        .chat-widget-refresh:hover {
          opacity: 1;
        }
        
        .chat-widget-fechar {
          background: transparent;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
        }
        
        .chat-widget-mensagens {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          background: \${this.config.visual.corSecundaria};
        }
        
        .chat-widget-mensagem {
          margin-bottom: 10px;
          display: flex;
          animation: fadeIn 0.3s;
        }
        
        .chat-widget-mensagem-user {
          justify-content: flex-end;
        }
        
        .chat-widget-mensagem-sistema {
          justify-content: center;
        }
        
        .chat-widget-mensagem-conteudo {
          max-width: 70%;
          padding: 10px 15px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .chat-widget-mensagem-bot .chat-widget-mensagem-conteudo {
          background: white;
          color: #333;
          border-bottom-left-radius: 4px;
        }
        
        .chat-widget-mensagem-user .chat-widget-mensagem-conteudo {
          background: \${this.config.visual.corPrimaria};
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .chat-widget-mensagem-sistema .chat-widget-mensagem-conteudo {
          background: rgba(0, 0, 0, 0.05);
          color: #666;
          font-size: 12px;
          max-width: 90%;
          text-align: center;
        }
        
        .chat-widget-botoes-rapidos {
          padding: 10px;
          background: white;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .chat-widget-botao-rapido {
          padding: 6px 12px;
          background: white;
          border: 1px solid \${this.config.visual.corPrimaria};
          color: \${this.config.visual.corPrimaria};
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .chat-widget-botao-rapido:hover {
          background: \${this.config.visual.corPrimaria};
          color: white;
        }
        
        .chat-widget-input-container {
          padding: 15px;
          background: white;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 10px;
        }
        
        #chatInput {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 24px;
          outline: none;
          font-size: 14px;
        }
        
        #chatEnviar {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
        }
        
        .chat-widget-digitando {
          padding: 10px 15px;
          background: white;
          border-radius: 12px;
          display: inline-block;
          margin-bottom: 10px;
        }
        
        .chat-widget-digitando span {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          margin: 0 2px;
          animation: pulse 1.4s infinite;
        }
        
        .chat-widget-digitando span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .chat-widget-digitando span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
          30% { transform: scale(1.3); opacity: 1; }
        }
      \`;
    },
    
    configurarEventos() {
      // Abrir/fechar chat
      document.getElementById('chatBotao').addEventListener('click', () => this.toggle());
      document.getElementById('chatFechar').addEventListener('click', () => this.fechar());
      
      // Refresh
      const btnRefresh = document.getElementById('chatRefresh');
      if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
          if (confirm('Deseja reiniciar a conversa?')) {
            this.reiniciarConversa();
          }
        });
      }
      
      // Enviar mensagem
      document.getElementById('chatEnviar').addEventListener('click', () => this.enviarMensagem());
      document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.enviarMensagem();
      });
      
      // Botões rápidos
      document.querySelectorAll('.chat-widget-botao-rapido').forEach(btn => {
        btn.addEventListener('click', () => {
          this.enviarMensagem(btn.dataset.texto);
        });
      });
    },
    
    toggle() {
      this.isOpen ? this.fechar() : this.abrir();
    },
    
    abrir() {
      document.getElementById('chatJanela').style.display = 'flex';
      document.getElementById('chatBotao').style.display = 'none';
      this.isOpen = true;
      document.getElementById('chatInput').focus();
      this.registrarAtividade();
    },
    
    fechar() {
      document.getElementById('chatJanela').style.display = 'none';
      document.getElementById('chatBotao').style.display = 'flex';
      this.isOpen = false;
    },
    
    async enviarMensagem(texto) {
      const input = document.getElementById('chatInput');
      const mensagem = texto || input.value.trim();
      
      if (!mensagem) return;
      
      // Registrar atividade
      this.registrarAtividade();
      
      // Limpar input
      input.value = '';
      
      // Adicionar mensagem do usuário
      this.adicionarMensagem(mensagem, 'user');
      
      // Mostrar indicador de digitação
      this.mostrarDigitando();
      
      try {
        const response = await fetch(\`\${this.baseUrl}/api/chat/mensagem\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            widgetId: this.config.widgetId,
            sessionId: this.sessionId,
            mensagem: mensagem
          })
        });
        
        const data = await response.json();
        
        this.removerDigitando();
        
        if (data.tipo === 'timeout') {
          await this.reiniciarPorTimeout();
        } else if (data.sucesso) {
          this.adicionarMensagem(data.resposta.texto, 'bot');
          
          // Tocar som se habilitado
          if (this.config.recursos.som) {
            this.tocarSom();
          }
        } else {
          this.adicionarMensagem('Desculpe, ocorreu um erro.', 'bot');
        }
      } catch (erro) {
        this.removerDigitando();
        this.adicionarMensagem(this.config.mensagens.offline, 'bot');
      }
    },
    
    adicionarMensagem(texto, tipo) {
      const container = document.getElementById('chatMensagens');
      const mensagem = document.createElement('div');
      mensagem.className = \`chat-widget-mensagem chat-widget-mensagem-\${tipo}\`;
      mensagem.innerHTML = \`<div class="chat-widget-mensagem-conteudo">\${texto}</div>\`;
      container.appendChild(mensagem);
      container.scrollTop = container.scrollHeight;
    },
    
    mostrarDigitando() {
      const container = document.getElementById('chatMensagens');
      const digitando = document.createElement('div');
      digitando.id = 'digitandoIndicador';
      digitando.className = 'chat-widget-digitando';
      digitando.innerHTML = '<span></span><span></span><span></span>';
      container.appendChild(digitando);
      container.scrollTop = container.scrollHeight;
    },
    
    removerDigitando() {
      const digitando = document.getElementById('digitandoIndicador');
      if (digitando) digitando.remove();
    },
    
    tocarSom() {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF');
      audio.play().catch(() => {});
    }
  };
  
  window.ChatWidget = ChatWidget;
})();`;

// 4. Atualizar configurador.js para mostrar URL completa
const configuradorJsUpdate = `let widgetIdAtual = null;

document.getElementById('formWidget').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const dados = {
    cliente: document.getElementById('cliente').value,
    dominioAutorizado: document.getElementById('dominio').value,
    dialogflow: {
      agentId: document.getElementById('agentId').value,
      projectId: document.getElementById('projectId').value,
      location: document.getElementById('location').value
    },
    visual: {
      corPrimaria: document.getElementById('corPrimaria').value,
      corSecundaria: document.getElementById('corSecundaria').value,
      posicao: document.getElementById('posicao').value,
      largura: parseInt(document.getElementById('largura').value),
      altura: parseInt(document.getElementById('altura').value),
      imagemPerfil: getImagemPerfil(),
      nomeBotVisivel: document.getElementById('nomeBotVisivel').value
    },
    mensagens: {
      boasVindas: document.getElementById('boasVindas').value,
      placeholder: document.getElementById('placeholder').value,
      offline: document.getElementById('offline').value,
      timeoutAviso: document.getElementById('timeoutAviso').value,
      timeoutReinicio: document.getElementById('timeoutReinicio').value
    },
    recursos: {
      upload: document.getElementById('upload').checked,
      botoesRapidos: document.getElementById('botoesRapidos').value.split('\\n').filter(b => b.trim()),
      som: document.getElementById('som').checked,
      historico: document.getElementById('historico').checked,
      mostrarRefresh: document.getElementById('mostrarRefresh').checked,
      timeoutHabilitado: document.getElementById('timeoutHabilitado').checked,
      timeoutMinutos: parseInt(document.getElementById('timeoutMinutos').value)
    }
  };
  
  try {
    const resultado = await api.criarWidget(dados);
    if (resultado.sucesso) {
      widgetIdAtual = resultado.widget.widgetId;
      mostrarCodigoEmbed(widgetIdAtual);
      atualizarPreview(resultado.widget);
      alert('Widget criado com sucesso!');
    }
  } catch (erro) {
    alert('Erro ao criar widget');
    console.error(erro);
  }
});

function mostrarCodigoEmbed(widgetId) {
  // Detectar se está em localhost ou produção
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseUrl = isLocal ? window.location.origin : 'https://SEU-DOMINIO.COM';
  
  const codigo = \`<!-- Chat Widget - Cole este código antes do </body> -->
<script src="\${baseUrl}/widget/widget.js"></script>
<script>
  ChatWidget.inicializar({
    widgetId: '\${widgetId}'
  });
</script>\`;
  
  document.getElementById('codigo').textContent = codigo;
  document.getElementById('codigoEmbed').style.display = 'block';
  
  // Adicionar nota sobre CORS
  if (!document.getElementById('notaCors')) {
    const nota = document.createElement('div');
    nota.id = 'notaCors';
    nota.style.cssText = 'background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 5px; margin-top: 10px; font-size: 12px;';
    nota.innerHTML = '<strong>Nota:</strong> Este widget pode ser usado em qualquer site. O servidor está configurado para aceitar requisições de qualquer origem (CORS habilitado).';
    document.getElementById('codigoEmbed').appendChild(nota);
  }
}

function copiarCodigo() {
  const codigo = document.getElementById('codigo').textContent;
  navigator.clipboard.writeText(codigo).then(() => {
    alert('Código copiado! Cole em qualquer site HTML.');
  });
}

// Atualizar preview em tempo real
document.querySelectorAll('input, select, textarea').forEach(campo => {
  campo.addEventListener('input', () => {
    if (widgetIdAtual) {
      atualizarPreviewLocal();
    }
  });
});`;

// Função para atualizar arquivos
function atualizarArquivo(caminho, conteudo) {
  const caminhoCompleto = path.join(process.cwd(), caminho);
  
  try {
    fs.writeFileSync(caminhoCompleto, conteudo);
    console.log('    [OK] ' + caminho);
  } catch (erro) {
    console.error('    [ERRO] ' + caminho + ': ' + erro.message);
  }
}

// Executar atualizações
console.log('[1] Atualizando CORS middleware...');
atualizarArquivo('backend/src/middleware/cors.middleware.ts', corsMiddlewareContent);

console.log('[2] Atualizando server.ts...');
atualizarArquivo('backend/src/server.ts', serverContent);

console.log('[3] Atualizando widget.js com URL dinâmica...');
atualizarArquivo('widget/widget.js', widgetJsContent);

console.log('[4] Atualizando configurador.js...');
atualizarArquivo('frontend-admin/js/configurador.js', configuradorJsUpdate);

console.log('\n====================================');
console.log('[OK] Correções aplicadas!');
console.log('====================================\n');
console.log('MUDANÇAS APLICADAS:');
console.log('');
console.log('1. CORS totalmente aberto para o widget');
console.log('2. Widget detecta automaticamente a URL base');
console.log('3. Todas as requisições usam URLs absolutas');
console.log('4. Funciona em qualquer site externo');
console.log('');
console.log('PARA TESTAR:');
console.log('1. Reinicie o servidor: npm run dev');
console.log('2. Crie um widget no admin');
console.log('3. Copie o código gerado');
console.log('4. Cole em QUALQUER site HTML');
console.log('5. O widget vai funcionar!');
console.log('');
console.log('IMPORTANTE PARA PRODUÇÃO:');
console.log('- Configure domínios específicos no CORS');
console.log('- Use HTTPS em produção');
console.log('- Valide o domínio autorizado no backend');
console.log('====================================');