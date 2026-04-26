# Libera — Crédito sem Burocracia
**Visão Arquitetural, Modelo de Score e Decisões Técnicas**

## O Desafio e a Solução
A Libera nasceu para resolver a exclusão financeira de trabalhadores informais, autônomos e pessoas com renda variável que ganham dinheiro, mas não têm como comprovar através de meios tradicionais (como contracheques) e, portanto, têm dificuldade de conseguir crédito nos bancos convencionais.

Para resolver isso, utilizamos a tecnologia do **Open Finance (via Pluggy)**. Ao invés de pedir documentos, o usuário conecta sua conta bancária. Nosso motor analisa o comportamento financeiro bruto (transações, renda média, regularidade, gastos e padrões antifraude) para determinar a aprovação de crédito.

## O Modelo de Score e Gestão de Risco
O sistema foi projetado para ser **conservador e focado em controle de inadimplência**. A `creditEngine` processa os dados do MeuPluggy usando as seguintes diretrizes de negócio:

1. **Risco Antifraude Elevado**: Se o MeuPluggy (Edge Function) detectar CPF inconsistente com o banco de dados, múltiplos IPs ou movimentações artificiais, a requisição é negada automaticamente (Limite R$0).
2. **Histórico Insuficiente**: Exigimos o mínimo de transações (>= 30). Se não houver, o risco sobre para Alto.
3. **Renda Consistente vs Instável**: Avaliamos a Média Mensal e o Desvio Padrão. Variações muito altas (Desvio Padrão > 50% da Renda) impactam o score negativamente e reduzem o limite ofertado.
4. **Comprometimento de Renda**: Se os gastos identificados chegam próximos ou superam a renda (Ratio > 90%), o crédito é negado para proteger o usuário do superendividamento.
5. **Score Alternativo (Não depende da Serasa)**:
   - Baixo risco = Limite de até 35% da renda recorrente média.
   - Médio risco = Limite de até 15% (Conservador).
   - Alto risco = Crédito Negado (Limite 0).

A aprovação não exibe telas complexas, apenas "Insights" diretos e simples (**Explicabilidade**), para que o usuário entenda a decisão (Ex: "Seu padrão de renda não é consistente").

## O Sistema de Dívida e Limite Dinâmico
Na Libera, **crédito bem usado aumenta o limite**.

- **Simulação e Confirmação**: O sistema ajusta a oferta respeitando o teto de limite disponível do usuário calculado pela `creditEngine`.
- **Limites Dinâmicos**: Sempre que o usuário paga uma parcela em dia (ação simulada no Painel), o limite total disponível reestabelece proporcionalmente ao valor principal devolvido.
- **Bônus de Pagador**: Ao quitar integralmente a dívida, o usuário ganha um bônus vitalício em seu limite base, incentivando o relacionamento longo e adimplente.

## Arquitetura do MVP (Local) vs. Arquitetura de Produção

### Stack Atual
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Integração Open Finance**: Pluggy/MeuPluggy via Supabase Edge Functions
- **Persistência Temporária (MVP)**: `localStorage`

### Por que `localStorage` na Camada Interna do MVP?
Para focar agilidade na apresentação e teste contínuo sem gargalos, as requisições financeiras são reais e tratadas via backend (`get-financial-data`), porém, os contratos gerados (`libera_debt`) e a lógica de pagamentos estão mockados no `localStorage`. Isso simula perfeitamente o produto em telas interativas sem precisar subir bancos paralelos durante os testes. 

### Evolução para Produção
Ao ser levado a um ambiente real e produtivo, as seguintes camadas substituirão a abordagem provisória:
1. **Supabase PostgreSQL & RLS**: Tabelas seguras (`debts`, `installments`, `user_limits`). As regras de *Row Level Security (RLS)* garantirão que cada usuário acesse apenas seus boletos e suas simulações.
2. **Workers de Faturamento (Cron)**: Um servidor Node.js ou Edge Function (scheduled) rodaria todos os dias checando vencimentos, marcando parcelas como `late` (atrasada) ou `defaulted` (inadimplente), penalizando o score e limite dinâmico ativamente, bem como disparando e-mails/WhatsApp de cobrança.
3. **Webhooks da Pluggy**: Para reagir a atualizações assíncronas do banco (atualização de conexões e identificação de renda em tempo real).
4. **Gateway de Pagamento Real**: O botão "Pagar Fatura" deverá gerar um QRCode Pix real via provedor (ex: Stark Bank ou Asaas).

## Conclusão
O Libera Fintech não é apenas uma tela; é um sistema inteligente de controle de risco mascarado por uma UI simples e de baixa fricção. Ele entrega a agilidade de um Pix e a segurança de uma análise complexa em milissegundos.
