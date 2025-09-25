import fs from 'fs';
import path from 'path';
import { WidgetConfig } from '../types/widget.types';

const caminhoArquivo = path.join(__dirname, '../data/widgets.json');

// Garantir que o diretório existe
const dataDir = path.dirname(caminhoArquivo);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar arquivo se não existir
if (!fs.existsSync(caminhoArquivo)) {
  fs.writeFileSync(caminhoArquivo, JSON.stringify([]), 'utf-8');
}

class WidgetService {
  private widgets: Map<string, WidgetConfig> = new Map();
  
  constructor() {
    this.carregarWidgets();
  }
  
  private carregarWidgets() {
    try {
      console.log('[WidgetService] Carregando widgets de:', caminhoArquivo);
      
      if (fs.existsSync(caminhoArquivo)) {
        const dados = fs.readFileSync(caminhoArquivo, 'utf-8');
        const widgets = JSON.parse(dados);
        
        console.log(`[WidgetService] ${widgets.length} widgets encontrados`);
        
        widgets.forEach((w: WidgetConfig) => {
          this.widgets.set(w.widgetId, w);
          console.log(`[WidgetService] Widget carregado: ${w.widgetId} - ${w.cliente}`);
        });
      }
    } catch (erro) {
      console.error('[WidgetService] Erro ao carregar widgets:', erro);
    }
  }
  
  private salvarWidgets() {
    try {
      const widgets = Array.from(this.widgets.values());
      fs.writeFileSync(caminhoArquivo, JSON.stringify(widgets, null, 2));
      console.log(`[WidgetService] ${widgets.length} widgets salvos`);
    } catch (erro) {
      console.error('[WidgetService] Erro ao salvar widgets:', erro);
    }
  }
  
  async criar(widget: WidgetConfig): Promise<WidgetConfig> {
    this.widgets.set(widget.widgetId, widget);
    this.salvarWidgets();
    console.log(`[WidgetService] Widget criado: ${widget.widgetId}`);
    return widget;
  }
  
  async buscar(widgetId: string): Promise<WidgetConfig | undefined> {
    // Recarregar widgets do arquivo para garantir que pega o mais recente
    this.carregarWidgets();
    
    const widget = this.widgets.get(widgetId);
    
    if (widget) {
      console.log(`[WidgetService] Widget encontrado: ${widgetId}`);
    } else {
      console.log(`[WidgetService] Widget NÃO encontrado: ${widgetId}`);
      console.log('[WidgetService] Widgets disponíveis:', Array.from(this.widgets.keys()));
    }
    
    return widget;
  }
  
  async listar(): Promise<WidgetConfig[]> {
    this.carregarWidgets();
    return Array.from(this.widgets.values());
  }
  
  async atualizar(widgetId: string, dados: Partial<WidgetConfig>): Promise<WidgetConfig | undefined> {
    const widget = this.widgets.get(widgetId);
    if (!widget) return undefined;
    
    const widgetAtualizado = {
      ...widget,
      ...dados,
      widgetId,
      atualizadoEm: new Date()
    };
    
    this.widgets.set(widgetId, widgetAtualizado);
    this.salvarWidgets();
    console.log(`[WidgetService] Widget atualizado: ${widgetId}`);
    return widgetAtualizado;
  }
  
  async deletar(widgetId: string): Promise<boolean> {
    const deleted = this.widgets.delete(widgetId);
    if (deleted) {
      this.salvarWidgets();
      console.log(`[WidgetService] Widget deletado: ${widgetId}`);
    }
    return deleted;
  }
}

export default new WidgetService();