import { Evento, ModeloContrato, CampoContrato } from '@/types';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { TemplateService } from './template-service';

export class ContratoService {
  static async preencherDadosDoEvento(evento: Evento, modelo: ModeloContrato): Promise<Record<string, any>> {
    const dados: Record<string, any> = {};
    
    dados.nome_contratante = evento.contratante || evento.cliente?.nome || '';
    dados.cpf_contratante = evento.cliente?.cpf || '';
    dados.email_contratante = evento.cliente?.email || '';
    dados.telefone_contratante = evento.cliente?.telefone || '';
    dados.endereco_contratante = evento.cliente?.endereco || '';
    dados.cep_contratante = evento.cliente?.cep || '';
    
    dados.nome_evento = evento.nomeEvento || evento.tipoEvento || 'Evento';
    dados.tipo_evento = evento.tipoEvento || '';
    dados.data_evento = evento.dataEvento ? new Date(evento.dataEvento).toLocaleDateString('pt-BR') : '';
    dados.local_evento = evento.local || '';
    dados.endereco_evento = evento.endereco || '';
    dados.numero_convidados = evento.numeroConvidados || 0;
    dados.valor_total = evento.valorTotal || 0;
    dados.valor_total_formatado = evento.valorTotal ? `R$ ${evento.valorTotal.toFixed(2).replace('.', ',')}` : 'R$ 0,00';
    dados.horario_inicio = evento.horarioInicio || '';
    dados.observacoes_evento = evento.observacoes || '';

    const configRepo = repositoryFactory.getConfiguracaoContratoRepository();
    const userId = (evento as any).userId || '';
    if (userId) {
      const camposFixos = await configRepo.getCamposFixos(userId);
      Object.assign(dados, camposFixos);
    }

    return dados;
  }

  static processarTemplate(template: string, dados: Record<string, any>): string {
    return TemplateService.processarPlaceholders(template, dados);
  }

  static validarDadosPreenchidos(dados: Record<string, any>, campos: CampoContrato[]): { valido: boolean; erros: string[] } {
    const erros: string[] = [];
    
    campos.forEach(campo => {
      if (campo.obrigatorio) {
        const valor = dados[campo.chave];
        if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
          erros.push(`Campo '${campo.label}' é obrigatório`);
        }
      }
    });

    return {
      valido: erros.length === 0,
      erros
    };
  }

  static async gerarNumeroContrato(userId: string): Promise<string> {
    const contratoRepo = repositoryFactory.getContratoRepository();
    return await contratoRepo.gerarNumeroContrato(userId);
  }
}

