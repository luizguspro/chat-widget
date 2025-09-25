import { Router, Request, Response } from 'express';
import dialogflowService from '../services/dialogflow.service';
import widgetService from '../services/widget.service';

const router = Router();

// Processar mensagem de chat
router.post('/enviar', async (req: Request, res: Response) => {
  try {
    const { widgetId, sessionId, mensagem } = req.body;
    
    console.log('[ChatController] Nova mensagem:');
    console.log('  Widget:', widgetId);
    console.log('  Session:', sessionId);
    console.log('  Mensagem:', mensagem);
    
    // Buscar configurações do widget
    const widget = await widgetService.buscar(widgetId);
    
    if (!widget || !widget.dialogflow) {
      console.log('[ChatController] Widget não encontrado ou sem config Dialogflow');
      
      // Resposta padrão se não houver configuração
      return res.json({
        resposta: 'Olá! Como posso ajudar você hoje?',
        sessionId: sessionId
      });
    }
    
    // Verificar se tem configuração do Dialogflow
    const { projectId, agentId, location } = widget.dialogflow;
    
    if (!projectId || !agentId) {
      console.log('[ChatController] Configuração do Dialogflow incompleta');
      
      // Resposta padrão
      return res.json({
        resposta: 'Desculpe, o chat não está configurado corretamente.',
        sessionId: sessionId
      });
    }
    
    // Enviar para Dialogflow
    const response = await dialogflowService.detectIntent(
      {
        projectId,
        location: location || 'us-central1',
        agentId
      },
      mensagem,
      sessionId
    );
    
    console.log('[ChatController] Resposta do Dialogflow:', response.resposta);
    
    res.json(response);
    
  } catch (erro: any) {
    console.error('[ChatController] Erro:', erro);
    
    res.status(500).json({
      erro: 'Erro ao processar mensagem',
      detalhes: erro.message
    });
  }
});

// Endpoint para processar áudio (futuro)
router.post('/audio', async (req: Request, res: Response) => {
  try {
    const { widgetId, sessionId, audioData, duration } = req.body;
    
    console.log('[ChatController] Áudio recebido:');
    console.log('  Widget:', widgetId);
    console.log('  Duração:', duration, 'segundos');
    
    // Por enquanto, retornar mensagem padrão
    // TODO: Implementar speech-to-text
    
    res.json({
      resposta: 'Recurso de áudio em desenvolvimento. Por favor, digite sua mensagem.',
      sessionId: sessionId
    });
    
  } catch (erro: any) {
    console.error('[ChatController] Erro no áudio:', erro);
    res.status(500).json({ erro: 'Erro ao processar áudio' });
  }
});

// Testar conexão com Dialogflow
router.post('/testar-dialogflow', async (req: Request, res: Response) => {
  try {
    const { projectId, agentId, location } = req.body;
    
    console.log('[ChatController] Testando Dialogflow:');
    console.log('  Project:', projectId);
    console.log('  Agent:', agentId);
    console.log('  Location:', location);
    
    const sucesso = await dialogflowService.testarConexao({
      projectId,
      agentId,
      location: location || 'us-central1'
    });
    
    res.json({
      sucesso,
      mensagem: sucesso ? 
        'Conexão com Dialogflow estabelecida com sucesso!' :
        'Falha ao conectar com Dialogflow. Verifique as configurações.'
    });
    
  } catch (erro: any) {
    console.error('[ChatController] Erro ao testar:', erro);
    res.status(500).json({
      sucesso: false,
      erro: erro.message
    });
  }
});

export default router;
