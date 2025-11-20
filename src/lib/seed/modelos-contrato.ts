import { ModeloContrato, CampoContrato } from '@/types';
import { repositoryFactory } from '@/lib/repositories/repository-factory';

export async function seedModelosContrato() {
  const modeloRepo = repositoryFactory.getModeloContratoRepository();
  
  const modelos: Omit<ModeloContrato, 'id' | 'dataCadastro' | 'dataAtualizacao'>[] = [
    {
      nome: 'Contrato de Prestação de Serviços - Eventos',
      descricao: 'Modelo completo para prestação de serviços em eventos',
      ativo: true,
      template: `
<h1 style="text-align: center; margin-bottom: 30px;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>

<p style="text-align: center; margin-bottom: 40px;">
  <strong>Nº {{numero_contrato}}</strong>
</p>

<h2>PARTES CONTRATANTES</h2>

<p>
  <strong>CONTRATANTE:</strong> {{nome_contratante}}<br>
  <strong>CPF/CNPJ:</strong> {{cpf_contratante}}<br>
  <strong>ENDEREÇO:</strong> {{endereco_contratante}}<br>
  <strong>CEP:</strong> {{cep_contratante}}<br>
  <strong>TELEFONE:</strong> {{telefone_contratante}}<br>
  <strong>E-MAIL:</strong> {{email_contratante}}
</p>

<p>
  <strong>CONTRATADO:</strong> {{razao_social}}<br>
  <strong>NOME FANTASIA:</strong> {{nome_fantasia}}<br>
  <strong>CNPJ:</strong> {{cnpj}}<br>
  <strong>INSCRIÇÃO ESTADUAL:</strong> {{inscricao_estadual}}<br>
  <strong>ENDEREÇO:</strong> {{endereco_empresa}}<br>
  <strong>BAIRRO:</strong> {{bairro_empresa}}<br>
  <strong>CIDADE:</strong> {{cidade_empresa}} - {{estado_empresa}}<br>
  <strong>CEP:</strong> {{cep_empresa}}<br>
  <strong>TELEFONE:</strong> {{telefone_empresa}}<br>
  <strong>E-MAIL:</strong> {{email_empresa}}
</p>

<h2>OBJETO</h2>
<p>
  O presente contrato tem por objeto a prestação de serviços de {{tipo_servico}} para o evento "{{nome_evento}}", a ser realizado em {{data_evento}}, no local {{local_evento}}, situado em {{endereco_evento}}.
</p>

<h2>VALOR E FORMA DE PAGAMENTO</h2>
<p>
  O valor total do contrato é de <strong>{{valor_total_formatado}}</strong>, que será pago da seguinte forma: {{forma_pagamento}}.
</p>

{{#if banco}}
<p>
  <strong>DADOS BANCÁRIOS PARA PAGAMENTO:</strong><br>
  Banco: {{banco}}<br>
  Agência: {{agencia}}<br>
  Conta: {{conta}}<br>
  Tipo: {{tipo_conta}}<br>
  {{#if pix}}PIX: {{pix}}{{/if}}
</p>
{{/if}}

<h2>CONDIÇÕES GERAIS</h2>
<p>
  {{condicoes_gerais}}
</p>

<h2>OBSERVAÇÕES</h2>
<p>
  {{observacoes}}
</p>

<div style="margin-top: 60px; display: flex; justify-content: space-between;">
  <div style="text-align: center;">
    <p>_________________________________</p>
    <p><strong>{{nome_contratante}}</strong></p>
    <p>CONTRATANTE</p>
  </div>
  <div style="text-align: center;">
    <p>_________________________________</p>
    <p><strong>{{razao_social}}</strong></p>
    <p>CONTRATADO</p>
  </div>
</div>

<p style="text-align: center; margin-top: 40px;">
  {{cidade_empresa}}, {{data_contrato}}
</p>
      `,
      campos: [
        { id: '1', chave: 'nome_contratante', label: 'Nome do Contratante', tipo: 'text', obrigatorio: true, ordem: 1 },
        { id: '2', chave: 'cpf_contratante', label: 'CPF/CNPJ do Contratante', tipo: 'text', obrigatorio: true, ordem: 2 },
        { id: '3', chave: 'endereco_contratante', label: 'Endereço do Contratante', tipo: 'text', obrigatorio: true, ordem: 3 },
        { id: '4', chave: 'cep_contratante', label: 'CEP do Contratante', tipo: 'text', obrigatorio: false, ordem: 4 },
        { id: '5', chave: 'telefone_contratante', label: 'Telefone do Contratante', tipo: 'text', obrigatorio: false, ordem: 5 },
        { id: '6', chave: 'email_contratante', label: 'E-mail do Contratante', tipo: 'text', obrigatorio: false, ordem: 6 },
        { id: '7', chave: 'tipo_servico', label: 'Tipo de Serviço', tipo: 'text', obrigatorio: true, ordem: 7 },
        { id: '8', chave: 'nome_evento', label: 'Nome do Evento', tipo: 'text', obrigatorio: true, ordem: 8 },
        { id: '9', chave: 'data_evento', label: 'Data do Evento', tipo: 'date', obrigatorio: true, ordem: 9 },
        { id: '10', chave: 'local_evento', label: 'Local do Evento', tipo: 'text', obrigatorio: true, ordem: 10 },
        { id: '11', chave: 'endereco_evento', label: 'Endereço do Evento', tipo: 'text', obrigatorio: true, ordem: 11 },
        { id: '12', chave: 'valor_total_formatado', label: 'Valor Total (Formatado)', tipo: 'currency', obrigatorio: true, ordem: 12 },
        { id: '13', chave: 'forma_pagamento', label: 'Forma de Pagamento', tipo: 'text', obrigatorio: true, ordem: 13 },
        { id: '14', chave: 'condicoes_gerais', label: 'Condições Gerais', tipo: 'textarea', obrigatorio: false, ordem: 14 },
        { id: '15', chave: 'observacoes', label: 'Observações', tipo: 'textarea', obrigatorio: false, ordem: 15 },
        { id: '16', chave: 'data_contrato', label: 'Data do Contrato', tipo: 'date', obrigatorio: true, ordem: 16 }
      ] as CampoContrato[]
    }
  ];

  for (const modelo of modelos) {
    const existente = await modeloRepo.findAll();
    const jaExiste = existente.some(m => m.nome === modelo.nome);
    
    if (!jaExiste) {
      await modeloRepo.create({
        ...modelo,
        dataCadastro: new Date(),
        dataAtualizacao: new Date()
      });
      console.log(`Modelo "${modelo.nome}" criado`);
    }
  }
}

