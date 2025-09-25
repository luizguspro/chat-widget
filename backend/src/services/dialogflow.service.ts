import { SessionsClient } from '@google-cloud/dialogflow-cx';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configurar credenciais
const correctPath = path.join(__dirname, '../../../dialogflow-key.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = correctPath;
console.log('[DialogflowService] Usando credenciais:', correctPath);

interface DialogflowConfig {
  projectId: string;
  location: string;
  agentId: string;
}

interface DialogflowResponse {
  resposta: string;
  intent?: string;
  parameters?: any;
  sessionId: string;
}

class DialogflowService {
  private sessionsClient: SessionsClient;
  
  constructor() {
    // IMPORTANTE: Usar o endpoint correto baseado na location
    this.sessionsClient = new SessionsClient({
      // Se for global, não precisa especificar apiEndpoint
      // Se for regional, especifica: apiEndpoint: 'us-central1-dialogflow.googleapis.com'
    });
    
    console.log('[DialogflowService] Inicializado');
  }
  
  private getApiEndpoint(location: string): string | undefined {
    // Se for global, retorna undefined (usa default)
    if (location === 'global') {
      return undefined;
    }
    // Se for regional, retorna o endpoint específico
    return `${location}-dialogflow.googleapis.com`;
  }
  
  async detectIntent(
    config: DialogflowConfig,
    mensagem: string,
    sessionId?: string
  ): Promise<DialogflowResponse> {
    try {
      const currentSessionId = sessionId || uuidv4();
      
      // Construir o caminho da sessão
      // IMPORTANTE: A location pode ser 'global' ou regional como 'us-central1'
      const sessionPath = this.sessionsClient.projectLocationAgentSessionPath(
        config.projectId,
        config.location,
        config.agentId,
        currentSessionId
      );
      
      console.log('[DialogflowService] Detectando intent:');
      console.log('  Project:', config.projectId);
      console.log('  Location:', config.location);
      console.log('  Agent:', config.agentId);
      console.log('  Session:', currentSessionId);
      console.log('  Session Path:', sessionPath);
      console.log('  Mensagem:', mensagem);
      
      // Criar requisição
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: mensagem
          },
          languageCode: 'pt-BR'
        }
      };
      
      // Se a location não for global, recriar o cliente com o endpoint correto
      if (config.location !== 'global') {
        const endpoint = this.getApiEndpoint(config.location);
        if (endpoint) {
          this.sessionsClient = new SessionsClient({
            apiEndpoint: endpoint
          });
        }
      }
      
      // Enviar para Dialogflow
      const [response] = await this.sessionsClient.detectIntent(request);
      
      console.log('[DialogflowService] Resposta recebida');
      
      // Processar resposta
      let respostaTexto = 'Desculpe, não entendi sua pergunta.';
      let intentName = '';
      let parameters = {};
      
      if (response.queryResult) {
        const messages = response.queryResult.responseMessages || [];
        
        for (const message of messages) {
          if (message.text && message.text.text) {
            respostaTexto = message.text.text.join(' ');
            break;
          }
        }
        
        if (response.queryResult.intent) {
          intentName = response.queryResult.intent.displayName || '';
        }
        
        if (response.queryResult.parameters) {
          parameters = response.queryResult.parameters.fields || {};
        }
        
        console.log('[DialogflowService] Intent:', intentName);
        console.log('[DialogflowService] Resposta:', respostaTexto);
      }
      
      return {
        resposta: respostaTexto,
        intent: intentName,
        parameters: parameters,
        sessionId: currentSessionId
      };
      
    } catch (erro: any) {
      console.error('[DialogflowService] Erro:', erro.message);
      console.error('[DialogflowService] Stack:', erro.stack);
      
      if (erro.message.includes('UNAUTHENTICATED')) {
        return {
          resposta: 'Erro de autenticação. Verifique as credenciais.',
          sessionId: sessionId || uuidv4()
        };
      }
      
      if (erro.message.includes('NOT_FOUND') || erro.code === 5) {
        console.error('[DialogflowService] Agente não encontrado.');
        console.error('  Verifique se o agente existe em location:', config.location);
        return {
          resposta: 'Agente não encontrado. Verifique as configurações.',
          sessionId: sessionId || uuidv4()
        };
      }
      
      return {
        resposta: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        sessionId: sessionId || uuidv4()
      };
    }
  }
  
  async testarConexao(config: DialogflowConfig): Promise<boolean> {
    try {
      console.log('[DialogflowService] Testando conexão...');
      
      const response = await this.detectIntent(
        config,
        'Olá',
        'test-session-' + Date.now()
      );
      
      if (response.resposta && !response.resposta.includes('Erro') && !response.resposta.includes('não encontrado')) {
        console.log('[DialogflowService] ✅ Conexão OK!');
        return true;
      }
      
      return false;
    } catch (erro) {
      console.error('[DialogflowService] ❌ Falha na conexão:', erro);
      return false;
    }
  }
}

export default new DialogflowService();
