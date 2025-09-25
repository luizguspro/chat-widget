import { Router, Request, Response } from 'express';
import widgetService from '../services/widget.service';
import { WidgetConfig } from '../types/widget.types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Listar todos os widgets (útil para debug)
router.get('/', async (req: Request, res: Response) => {
  try {
    const widgets = await widgetService.listar();
    res.json({
      total: widgets.length,
      widgets: widgets.map(w => ({
        widgetId: w.widgetId,
        cliente: w.cliente,
        nomeBotVisivel: w.visual?.nomeBotVisivel
      }))
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao listar widgets' });
  }
});

// Buscar widget por ID
router.get('/:widgetId', async (req: Request, res: Response) => {
  try {
    const { widgetId } = req.params;
    console.log(`[API] Buscando widget: ${widgetId}`);
    
    const widget = await widgetService.buscar(widgetId);
    
    if (!widget) {
      console.log(`[API] Widget não encontrado: ${widgetId}`);
      
      // Listar widgets disponíveis para debug
      const todosWidgets = await widgetService.listar();
      console.log('[API] Widgets disponíveis:');
      todosWidgets.forEach(w => {
        console.log(`  - ${w.widgetId}: ${w.cliente}`);
      });
      
      return res.status(404).json({ 
        erro: 'Widget não encontrado',
        widgetId: widgetId,
        widgetsDisponiveis: todosWidgets.map(w => w.widgetId)
      });
    }
    
    console.log(`[API] Widget encontrado: ${widget.cliente}`);
    res.json(widget);
  } catch (erro) {
    console.error('[API] Erro ao buscar widget:', erro);
    res.status(500).json({ erro: 'Erro ao buscar widget' });
  }
});

// Criar novo widget
router.post('/criar', async (req: Request, res: Response) => {
  try {
    const widgetData: WidgetConfig = {
      ...req.body,
      widgetId: uuidv4(),
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };
    
    console.log(`[API] Criando widget: ${widgetData.widgetId}`);
    const widget = await widgetService.criar(widgetData);
    
    res.json({ 
      sucesso: true, 
      widget,
      mensagem: `Widget criado com ID: ${widget.widgetId}`
    });
  } catch (erro) {
    console.error('[API] Erro ao criar widget:', erro);
    res.status(500).json({ erro: 'Erro ao criar widget' });
  }
});

// Atualizar widget
router.put('/:widgetId', async (req: Request, res: Response) => {
  try {
    const { widgetId } = req.params;
    console.log(`[API] Atualizando widget: ${widgetId}`);
    
    const widget = await widgetService.atualizar(widgetId, req.body);
    
    if (!widget) {
      return res.status(404).json({ erro: 'Widget não encontrado' });
    }
    
    res.json({ sucesso: true, widget });
  } catch (erro) {
    console.error('[API] Erro ao atualizar widget:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar widget' });
  }
});

// Deletar widget
router.delete('/:widgetId', async (req: Request, res: Response) => {
  try {
    const { widgetId } = req.params;
    console.log(`[API] Deletando widget: ${widgetId}`);
    
    const deleted = await widgetService.deletar(widgetId);
    
    if (!deleted) {
      return res.status(404).json({ erro: 'Widget não encontrado' });
    }
    
    res.json({ sucesso: true, mensagem: 'Widget deletado' });
  } catch (erro) {
    console.error('[API] Erro ao deletar widget:', erro);
    res.status(500).json({ erro: 'Erro ao deletar widget' });
  }
});

export default router;