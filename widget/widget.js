(function() {
  'use strict';
  
  // Detectar URL base automaticamente
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const scriptSrc = currentScript.src;
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/widget/widget.js'));
  
  console.log('Widget carregando de:', baseUrl);
  
  // Estilos corrigidos e aprimorados
  const estilos = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    .chat-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .chat-widget-container.position-left {
      right: auto;
      left: 20px;
    }
    
    /* Botão flutuante com avatar */
    .chat-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cor-primaria, #3b82f6) 0%, var(--cor-secundaria, #1e40af) 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      padding: 3px;
    }
    
    .chat-widget-button:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }
    
    .chat-widget-button:active {
      transform: scale(0.95);
    }
    
    .chat-widget-button-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    .chat-widget-button-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .chat-widget-button-avatar svg {
      width: 65%;
      height: 65%;
      fill: var(--cor-primaria, #3b82f6);
    }
    
    /* Badge de notificação */
    .chat-widget-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: white;
      border-radius: 10px;
      min-width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
      font-size: 11px;
      font-weight: 600;
      animation: pulse 2s infinite;
      border: 2px solid white;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    /* Janela do chat */
    .chat-widget-window {
      position: absolute;
      bottom: 75px;
      right: 0;
      width: 380px;
      height: 600px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.16);
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .chat-widget-window.active {
      display: flex;
    }
    
    /* Header aprimorado */
    .chat-widget-header {
      background: linear-gradient(135deg, var(--cor-primaria, #3b82f6) 0%, var(--cor-secundaria, #1e40af) 100%);
      color: white;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .chat-widget-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .chat-widget-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .chat-widget-avatar svg {
      width: 60%;
      height: 60%;
      fill: var(--cor-primaria, #3b82f6);
    }
    
    .chat-widget-info {
      flex: 1;
    }
    
    .chat-widget-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .chat-widget-status {
      font-size: 12px;
      opacity: 0.95;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: blink 2s infinite;
      box-shadow: 0 0 4px rgba(16, 185, 129, 0.5);
    }
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    
    .chat-widget-actions {
      display: flex;
      gap: 8px;
    }
    
    .chat-action-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .chat-action-btn:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .chat-action-btn svg {
      width: 16px;
      height: 16px;
      fill: white;
    }
    
    /* Área de mensagens */
    .chat-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f8f9fa;
      scroll-behavior: smooth;
    }
    
    .chat-widget-messages::-webkit-scrollbar {
      width: 6px;
    }
    
    .chat-widget-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .chat-widget-messages::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.15);
      border-radius: 3px;
    }
    
    /* Mensagens com avatares */
    .chat-message {
      margin-bottom: 16px;
      display: flex;
      align-items: flex-end;
      gap: 8px;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .chat-message.user {
      flex-direction: row-reverse;
    }
    
    /* Avatar da mensagem */
    .chat-message-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .chat-message-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .chat-message-avatar svg {
      width: 16px;
      height: 16px;
      fill: #9ca3af;
    }
    
    .chat-message.user .chat-message-avatar {
      background: var(--cor-primaria, #3b82f6);
    }
    
    .chat-message.user .chat-message-avatar svg {
      fill: white;
    }
    
    .chat-message-bubble {
      max-width: 70%;
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      position: relative;
      word-wrap: break-word;
    }
    
    .chat-message.bot .chat-message-bubble {
      background: white;
      color: #1f2937;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    
    .chat-message.user .chat-message-bubble {
      background: linear-gradient(135deg, var(--cor-primaria, #3b82f6) 0%, var(--cor-secundaria, #1e40af) 100%);
      color: white;
      border-bottom-right-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    /* Indicador de digitação */
    .chat-typing {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .chat-typing-bubble {
      padding: 10px 14px;
      background: white;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      display: inline-flex;
      gap: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    
    .chat-typing-bubble span {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }
    
    .chat-typing-bubble span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .chat-typing-bubble span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.5;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }
    
    /* Botões rápidos */
    .chat-quick-replies {
      padding: 12px 20px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    
    .chat-quick-replies::-webkit-scrollbar {
      display: none;
    }
    
    .quick-reply-btn {
      padding: 8px 16px;
      background: white;
      border: 1.5px solid var(--cor-primaria, #3b82f6);
      color: var(--cor-primaria, #3b82f6);
      border-radius: 18px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    
    .quick-reply-btn:hover {
      background: var(--cor-primaria, #3b82f6);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }
    
    /* Área de input */
    .chat-widget-input {
      padding: 12px 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    
    .chat-input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      background: #f3f4f6;
      border-radius: 20px;
      padding: 4px 12px;
      transition: all 0.2s;
    }
    
    .chat-input-wrapper:focus-within {
      background: #e5e7eb;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
    
    .chat-input-field {
      flex: 1;
      background: transparent;
      border: none;
      padding: 8px 0;
      font-size: 14px;
      font-family: inherit;
      resize: none;
      outline: none;
      max-height: 100px;
      line-height: 1.4;
    }
    
    .chat-input-field::placeholder {
      color: #9ca3af;
    }
    
    /* Botões de ação */
    .chat-input-actions {
      display: flex;
      gap: 4px;
    }
    
    .chat-action-button {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .chat-action-button:hover {
      background: rgba(0,0,0,0.05);
    }
    
    .chat-action-button svg {
      width: 20px;
      height: 20px;
      fill: #6b7280;
    }
    
    /* Botão de enviar */
    .chat-send-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cor-primaria, #3b82f6) 0%, var(--cor-secundaria, #1e40af) 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    }
    
    .chat-send-button:hover {
      transform: scale(1.05);
      box-shadow: 0 3px 10px rgba(59, 130, 246, 0.4);
    }
    
    .chat-send-button:active {
      transform: scale(0.95);
    }
    
    .chat-send-button svg {
      width: 20px;
      height: 20px;
      fill: white;
      margin-left: 2px;
    }
    
    /* Botão de áudio */
    .chat-audio-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cor-primaria, #3b82f6) 0%, var(--cor-secundaria, #1e40af) 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    }
    
    .chat-audio-button:hover {
      transform: scale(1.05);
      box-shadow: 0 3px 10px rgba(59, 130, 246, 0.4);
    }
    
    .chat-audio-button.recording {
      animation: recordPulse 1.5s infinite;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    
    @keyframes recordPulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5);
      }
      50% {
        box-shadow: 0 0 0 12px rgba(239, 68, 68, 0);
      }
    }
    
    .chat-audio-button svg {
      width: 22px;
      height: 22px;
      fill: white;
    }
    
    /* Overlay de gravação */
    .audio-recording-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 15px;
      border-top: 2px solid #ef4444;
      display: none;
      align-items: center;
      gap: 15px;
      animation: slideUp 0.2s ease;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    }
    
    .audio-recording-overlay.active {
      display: flex;
    }
    
    .audio-wave {
      flex: 1;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
    }
    
    .audio-bar {
      width: 3px;
      background: #ef4444;
      border-radius: 3px;
      animation: wave 0.5s infinite ease-in-out;
    }
    
    .audio-bar:nth-child(1) { animation-delay: 0s; height: 10px; }
    .audio-bar:nth-child(2) { animation-delay: 0.1s; height: 20px; }
    .audio-bar:nth-child(3) { animation-delay: 0.2s; height: 15px; }
    .audio-bar:nth-child(4) { animation-delay: 0.3s; height: 25px; }
    .audio-bar:nth-child(5) { animation-delay: 0.4s; height: 18px; }
    .audio-bar:nth-child(6) { animation-delay: 0.5s; height: 30px; }
    .audio-bar:nth-child(7) { animation-delay: 0.6s; height: 22px; }
    .audio-bar:nth-child(8) { animation-delay: 0.7s; height: 28px; }
    
    @keyframes wave {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(1.5); }
    }
    
    .audio-timer {
      font-size: 14px;
      font-weight: 600;
      color: #ef4444;
      min-width: 50px;
      text-align: center;
    }
    
    .audio-cancel {
      padding: 8px 16px;
      background: #fee2e2;
      color: #ef4444;
      border: none;
      border-radius: 18px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .audio-cancel:hover {
      background: #ef4444;
      color: white;
    }
    
    /* Responsividade */
    @media (max-width: 480px) {
      .chat-widget-window {
        width: 100vw;
        height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
        max-width: none;
      }
      
      .chat-widget-button {
        width: 56px;
        height: 56px;
      }
    }
  `;
  
  // HTML do Widget corrigido
  function criarHTML(config) {
    // Valores padrão
    const defaultConfig = {
      visual: {
        posicao: 'right',
        corPrimaria: '#3b82f6',
        corSecundaria: '#1e40af',
        imagemPerfil: '',
        nomeBotVisivel: 'Assistente Virtual'
      },
      mensagens: {
        boasVindas: 'Olá! Como posso ajudar você hoje?',
        placeholder: 'Digite sua mensagem...',
        offline: 'Desculpe, estamos offline no momento.'
      },
      recursos: {
        botoesRapidos: ['Ajuda', 'Falar com atendente', 'Informações'],
        mostrarRefresh: true,
        upload: true,
        historico: true,
        som: true
      }
    };
    
    // Mesclar configurações
    config = { ...defaultConfig, ...config };
    
    // Garantir que a imagem seja usada em todos os lugares
    const avatarHTML = config.visual.imagemPerfil ? 
      `<img src="${config.visual.imagemPerfil}" alt="Avatar">` : 
      `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
    
    return `
      <div class="chat-widget-container position-${config.visual.posicao}" style="--cor-primaria: ${config.visual.corPrimaria}; --cor-secundaria: ${config.visual.corSecundaria};">
        <!-- Botão flutuante com avatar -->
        <button class="chat-widget-button" onclick="ChatWidget.toggle()">
          <div class="chat-widget-button-avatar">
            ${avatarHTML}
          </div>
          <span class="chat-widget-badge" id="chatBadge" style="display: none;">0</span>
        </button>
        
        <!-- Janela do chat -->
        <div class="chat-widget-window" id="chatWindow">
          <!-- Header -->
          <div class="chat-widget-header">
            <div class="chat-widget-avatar">
              ${avatarHTML}
            </div>
            <div class="chat-widget-info">
              <div class="chat-widget-name">${config.visual.nomeBotVisivel}</div>
              <div class="chat-widget-status">
                <span class="status-dot"></span>
                <span>Online</span>
              </div>
            </div>
            <div class="chat-widget-actions">
              ${config.recursos.mostrarRefresh ? `
                <button class="chat-action-btn" onclick="ChatWidget.limparChat()" title="Limpar conversa">
                  <svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                </button>
              ` : ''}
              <button class="chat-action-btn" onclick="ChatWidget.minimizar()" title="Minimizar">
                <svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
              </button>
              <button class="chat-action-btn" onclick="ChatWidget.fechar()" title="Fechar">
                <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
          </div>
          
          <!-- Área de mensagens -->
          <div class="chat-widget-messages" id="chatMessages">
            <!-- Mensagem inicial será adicionada via JS -->
          </div>
          
          <!-- Botões rápidos -->
          ${config.recursos.botoesRapidos && config.recursos.botoesRapidos.length > 0 ? `
            <div class="chat-quick-replies" id="quickReplies">
              ${config.recursos.botoesRapidos.map(botao => `
                <button class="quick-reply-btn" onclick="ChatWidget.enviarBotaoRapido('${botao}')">${botao}</button>
              `).join('')}
            </div>
          ` : ''}
          
          <!-- Overlay de gravação -->
          <div class="audio-recording-overlay" id="audioRecording">
            <div class="audio-wave">
              <div class="audio-bar"></div>
              <div class="audio-bar"></div>
              <div class="audio-bar"></div>
              <div class="audio-bar"></div>
              <div class="audio-bar"></div>
              <div class="audio-bar"></div>
              <div class="audio-bar"></div>
              <div class="audio-bar"></div>
            </div>
            <div class="audio-timer" id="audioTimer">00:00</div>
            <button class="audio-cancel" onclick="ChatWidget.cancelarAudio()">Cancelar</button>
          </div>
          
          <!-- Área de input -->
          <div class="chat-widget-input">
            <div class="chat-input-wrapper">
              <textarea 
                class="chat-input-field" 
                id="chatInput" 
                placeholder="${config.mensagens.placeholder}"
                rows="1"
                onkeypress="ChatWidget.handleKeyPress(event)"
                oninput="ChatWidget.adjustTextarea(this)"
              ></textarea>
              <div class="chat-input-actions">
                ${config.recursos.upload ? `
                  <button class="chat-action-button" onclick="ChatWidget.abrirUpload()" title="Anexar arquivo">
                    <svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
                  </button>
                ` : ''}
                <button class="chat-action-button" onclick="ChatWidget.abrirEmoji()" title="Emoji">
                  <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                </button>
              </div>
            </div>
            
            <button 
              class="chat-send-button" 
              id="sendButton" 
              onclick="ChatWidget.enviar()"
              style="display: none;"
            >
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
            
            <button 
              class="chat-audio-button" 
              id="audioButton"
              onmousedown="ChatWidget.iniciarAudio()"
              onmouseup="ChatWidget.pararAudio()"
              onmouseleave="ChatWidget.pararAudio()"
              ontouchstart="ChatWidget.iniciarAudio()"
              ontouchend="ChatWidget.pararAudio()"
            >
              <svg viewBox="0 0 24 24"><path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  // JavaScript do Widget
  const ChatWidget = {
    config: null,
    isOpen: false,
    sessionId: null,
    audioRecorder: null,
    audioChunks: [],
    isRecording: false,
    recordingTimer: null,
    recordingStartTime: null,
    
    inicializar(opcoes) {
      const { widgetId } = opcoes;
      
      console.log('Inicializando widget:', widgetId);
      
      // Buscar configurações
      fetch(`${baseUrl}/api/widgets/${widgetId}`)
        .then(r => {
          if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
          return r.json();
        })
        .then(config => {
          console.log('Configuração recebida:', config);
          this.setupWidget(config);
        })
        .catch(erro => {
          console.error('Erro ao carregar config, usando padrão:', erro);
          this.setupWidget({}); // Usar config padrão
        });
    },
    
    setupWidget(config) {
      this.config = config;
      this.sessionId = this.gerarSessionId();
      
      // Adicionar estilos
      const style = document.createElement('style');
      style.textContent = estilos;
      document.head.appendChild(style);
      
      // Adicionar HTML
      const container = document.createElement('div');
      container.innerHTML = criarHTML(config);
      document.body.appendChild(container.firstElementChild);
      
      // Adicionar mensagem inicial
      this.adicionarMensagem(
        (config.mensagens && config.mensagens.boasVindas) || 'Olá! Como posso ajudar você hoje?',
        'bot'
      );
      
      // Inicializar eventos
      this.inicializarEventos();
      
      // Carregar histórico se habilitado
      if (config.recursos && config.recursos.historico) {
        this.carregarHistorico();
      }
      
      // Inicializar áudio
      this.inicializarAudio();
      
      console.log('Widget carregado com sucesso!');
    },
    
    inicializarEventos() {
      const input = document.getElementById('chatInput');
      const sendBtn = document.getElementById('sendButton');
      const audioBtn = document.getElementById('audioButton');
      
      if (input) {
        input.addEventListener('input', () => {
          if (input.value.trim()) {
            sendBtn.style.display = 'flex';
            audioBtn.style.display = 'none';
          } else {
            sendBtn.style.display = 'none';
            audioBtn.style.display = 'flex';
          }
        });
      }
    },
    
    inicializarAudio() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('API de áudio disponível');
      }
    },
    
    async iniciarAudio() {
      if (this.isRecording) return;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        
        this.audioRecorder.ondataavailable = event => {
          this.audioChunks.push(event.data);
        };
        
        this.audioRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.enviarAudio(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };
        
        this.audioRecorder.start();
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        
        // UI feedback
        document.getElementById('audioButton').classList.add('recording');
        document.getElementById('audioRecording').classList.add('active');
        
        // Timer
        this.recordingTimer = setInterval(() => {
          const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
          const minutes = Math.floor(elapsed / 60);
          const seconds = elapsed % 60;
          document.getElementById('audioTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          if (elapsed >= 60) this.pararAudio();
        }, 100);
        
        if (navigator.vibrate) navigator.vibrate(50);
        
      } catch (erro) {
        console.error('Erro ao iniciar gravação:', erro);
        alert('Por favor, permita o acesso ao microfone');
      }
    },
    
    pararAudio() {
      if (!this.isRecording) return;
      
      this.isRecording = false;
      this.audioRecorder.stop();
      
      document.getElementById('audioButton').classList.remove('recording');
      document.getElementById('audioRecording').classList.remove('active');
      
      clearInterval(this.recordingTimer);
      document.getElementById('audioTimer').textContent = '00:00';
    },
    
    cancelarAudio() {
      if (this.isRecording) {
        this.isRecording = false;
        this.audioRecorder.stop();
        this.audioChunks = [];
        
        document.getElementById('audioButton').classList.remove('recording');
        document.getElementById('audioRecording').classList.remove('active');
        clearInterval(this.recordingTimer);
        document.getElementById('audioTimer').textContent = '00:00';
      }
    },
    
    async enviarAudio(audioBlob) {
      this.adicionarMensagem('🎤 Mensagem de voz', 'user');
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        
        this.mostrarDigitando();
        
        try {
          const response = await fetch(`${baseUrl}/api/chat/audio`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Widget-Id': this.config.widgetId || 'default'
            },
            body: JSON.stringify({
              widgetId: this.config.widgetId || 'default',
              sessionId: this.sessionId,
              audioData: base64Audio,
              duration: duration
            })
          });
          
          const data = await response.json();
          this.removerDigitando();
          
          if (data.resposta) {
            this.adicionarMensagem(data.resposta, 'bot');
            if (this.config.recursos && this.config.recursos.som) {
              this.tocarSom();
            }
          }
        } catch (erro) {
          this.removerDigitando();
          this.adicionarMensagem('Desculpe, não consegui processar o áudio.', 'bot');
        }
      };
    },
    
    toggle() {
      const window = document.getElementById('chatWindow');
      const button = document.querySelector('.chat-widget-button');
      
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        window.classList.add('active');
        button.classList.add('active');
        document.getElementById('chatInput').focus();
        
        const badge = document.getElementById('chatBadge');
        badge.style.display = 'none';
        badge.textContent = '0';
      } else {
        window.classList.remove('active');
        button.classList.remove('active');
      }
    },
    
    fechar() {
      this.isOpen = false;
      document.getElementById('chatWindow').classList.remove('active');
      document.querySelector('.chat-widget-button').classList.remove('active');
    },
    
    minimizar() {
      this.fechar();
    },
    
    limparChat() {
      const messages = document.getElementById('chatMessages');
      messages.innerHTML = '';
      
      const boasVindas = (this.config && this.config.mensagens && this.config.mensagens.boasVindas) || 
                         'Olá! Como posso ajudar você hoje?';
      
      this.adicionarMensagem(boasVindas, 'bot');
      
      if (this.config && this.config.recursos && this.config.recursos.historico) {
        localStorage.removeItem('chat_history_' + (this.config.widgetId || 'default'));
      }
      
      this.sessionId = this.gerarSessionId();
    },
    
    adjustTextarea(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    },
    
    handleKeyPress(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.enviar();
      }
    },
    
    async enviar() {
      const input = document.getElementById('chatInput');
      const mensagem = input.value.trim();
      
      if (!mensagem) return;
      
      this.adicionarMensagem(mensagem, 'user');
      
      input.value = '';
      input.style.height = 'auto';
      document.getElementById('sendButton').style.display = 'none';
      document.getElementById('audioButton').style.display = 'flex';
      
      this.mostrarDigitando();
      
      try {
        const response = await fetch(`${baseUrl}/api/chat/enviar`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Widget-Id': this.config.widgetId || 'default'
          },
          body: JSON.stringify({
            widgetId: this.config.widgetId || 'default',
            sessionId: this.sessionId,
            mensagem: mensagem
          })
        });
        
        const data = await response.json();
        this.removerDigitando();
        
        if (data.resposta) {
          this.adicionarMensagem(data.resposta, 'bot');
          if (this.config.recursos && this.config.recursos.som) {
            this.tocarSom();
          }
        }
      } catch (erro) {
        this.removerDigitando();
        const msgOffline = (this.config && this.config.mensagens && this.config.mensagens.offline) || 
                          'Desculpe, estamos offline no momento.';
        this.adicionarMensagem(msgOffline, 'bot');
      }
      
      if (this.config && this.config.recursos && this.config.recursos.historico) {
        this.salvarHistorico();
      }
    },
    
    enviarBotaoRapido(texto) {
      document.getElementById('chatInput').value = texto;
      this.enviar();
    },
    
    adicionarMensagem(texto, tipo) {
      const container = document.getElementById('chatMessages');
      const mensagem = document.createElement('div');
      mensagem.className = `chat-message ${tipo}`;
      
      // Avatar HTML - usar a mesma imagem para bot e usuário
      const avatarImg = this.config && this.config.visual && this.config.visual.imagemPerfil;
      
      let avatarHTML = '';
      if (tipo === 'bot') {
        avatarHTML = avatarImg ? 
          `<div class="chat-message-avatar"><img src="${avatarImg}" alt="Bot"></div>` :
          `<div class="chat-message-avatar"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg></div>`;
      } else {
        // Para usuário, usar avatar diferente ou o mesmo conforme preferência
        avatarHTML = `<div class="chat-message-avatar"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`;
      }
      
      mensagem.innerHTML = `
        ${avatarHTML}
        <div class="chat-message-bubble">${texto}</div>
      `;
      
      container.appendChild(mensagem);
      container.scrollTop = container.scrollHeight;
      
      // Notificação se janela fechada
      if (!this.isOpen && tipo === 'bot') {
        const badge = document.getElementById('chatBadge');
        const count = parseInt(badge.textContent || '0') + 1;
        badge.textContent = count;
        badge.style.display = 'flex';
        
        if (this.config && this.config.recursos && this.config.recursos.som) {
          this.tocarSom();
        }
      }
    },
    
    mostrarDigitando() {
      const container = document.getElementById('chatMessages');
      const typing = document.createElement('div');
      typing.id = 'typingIndicator';
      typing.className = 'chat-typing';
      
      // Avatar do bot no indicador de digitação
      const avatarImg = this.config && this.config.visual && this.config.visual.imagemPerfil;
      const avatarHTML = avatarImg ? 
        `<div class="chat-message-avatar"><img src="${avatarImg}" alt="Bot"></div>` :
        `<div class="chat-message-avatar"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg></div>`;
      
      typing.innerHTML = `
        ${avatarHTML}
        <div class="chat-typing-bubble">
          <span></span><span></span><span></span>
        </div>
      `;
      
      container.appendChild(typing);
      container.scrollTop = container.scrollHeight;
    },
    
    removerDigitando() {
      const typing = document.getElementById('typingIndicator');
      if (typing) typing.remove();
    },
    
    tocarSom() {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF');
      audio.play().catch(() => {});
    },
    
    salvarHistorico() {
      const messages = document.querySelectorAll('.chat-message');
      const history = Array.from(messages).map(msg => ({
        tipo: msg.classList.contains('user') ? 'user' : 'bot',
        texto: msg.querySelector('.chat-message-bubble').textContent
      }));
      const widgetId = (this.config && this.config.widgetId) || 'default';
      localStorage.setItem('chat_history_' + widgetId, JSON.stringify(history));
    },
    
    carregarHistorico() {
      const widgetId = (this.config && this.config.widgetId) || 'default';
      const history = localStorage.getItem('chat_history_' + widgetId);
      if (history) {
        const messages = JSON.parse(history);
        const container = document.getElementById('chatMessages');
        container.innerHTML = '';
        messages.forEach(msg => {
          this.adicionarMensagem(msg.texto, msg.tipo);
        });
      }
    },
    
    gerarSessionId() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    abrirUpload() {
      alert('Upload em desenvolvimento');
    },
    
    abrirEmoji() {
      alert('Emojis em desenvolvimento');
    }
  };
  
  window.ChatWidget = ChatWidget;
})();