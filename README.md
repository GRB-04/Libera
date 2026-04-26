# Libera • Crédito Sem Burocracia

> **Projeto Final - Hackathon Semana Ubíqua**  
> Uma solução de Open Finance focada em inclusão financeira e crédito comportamental.

---

## 1. Identidade Visual (Branding)

A marca **Libera** nasceu do conceito de "destrancar" oportunidades. 

### O Conceito da Logo
Nossa logo é uma evolução minimalista de um cadeado:
- **Cadeado Fechado → Aberto → Acesso Liberado**: Representa a jornada do autônomo que antes era excluído e agora tem acesso ao crédito.
- **Formato em 'L' e 'i'**: Alusão ao nome Libera e à inteligência (i) do nosso motor de score.
- **Curva em 'S'**: Representa o fluxo financeiro inteligente.
- **Base em 'U'**: Uma base sólida e segura para o crescimento do usuário.
- **O Ponto**: Simboliza a evolução constante e o progresso do score.

---

## 2. Visão Geral da Solução

### O Problema
Trabalhadores autônomos possuem renda, mas não possuem "papelada". O sistema bancário tradicional os ignora por não entenderem seu fluxo de caixa volátil.

### A Solução
O Libera utiliza o **Open Finance** para transformar transações brutas em um **Score Ubíquo**. Analisamos o comportamento real em vez de apenas o histórico de crédito passado.

---

## 3. Guia de Funcionalidades (User Journey)

Nesta seção, detalhamos como o sistema opera de ponta a ponta.

### A. Conexão de Dados (Onboarding)
O usuário conecta sua conta bancária via Pluggy. É aqui que o consentimento é dado.
- **Botão "Conectar Banco"**: Inicia o fluxo seguro de compartilhamento.
`[PRINT: Tela de Conexão com lista de bancos]`

### B. Análise em Tempo Real
Nosso motor processa até 500 transações em segundos.
`[PRINT: Tela de "Analisando seus dados" com barra de progresso]`

### C. Resultado e Transparência (Legal Compliance)
Damos o score e explicamos o **porquê**.
- **Insights**: "Sua renda é consistente", "Seu comprometimento é alto". Isso cumpre a exigência jurídica de explicabilidade.
`[PRINT: Tela de Resultado com Score e Insights]`

### D. Simulação e Contratação
O usuário escolhe o valor (dentro do limite aprovado) e as parcelas.
- **Slider de Valor**: Ajuste fino do quanto precisa.
`[PRINT: Tela de Simulação com Sliders]`

### E. Painel de Controle (Dashboard)
Gestão total do crédito e saldo devedor.
- **Saldo Devedor**: Visão clara do quanto falta pagar.
- **Progresso de Parcelas**: Ex: "1 de 6".
`[PRINT: Dashboard principal com Score e Próximo Vencimento]`

### F. Pagamento Real-time (Scan & Pay)
Sincronização entre dispositivos via Supabase Realtime.
- **Botão "Pagar via Pix"**: Gera o QR Code e o link "Copia e Cola".
- **Confirmação no Celular**: Atualiza o dashboard no computador instantaneamente.
`[PRINT: Tela de Pagamento Pix com QR Code]`

---

## 4. Arquitetura e Segurança

### Segurança Lógica
- **Autenticação**: Supabase Auth (JWT).
- **Banco de Dados**: PostgreSQL com RLS (Row Level Security) — cada usuário só acessa seus próprios dados.
- **Realtime**: Supabase Broadcast para comunicação segura entre abas/dispositivos.

### Segurança Física (Data Center - Roteiro 4)
Seguindo as melhores práticas para proteção da infraestrutura:
- **Controle de Acesso**: Biometria e cartões para entrada restrita.
- **Monitoramento**: CFTV 24h e sensores de temperatura.
- **Energia**: UPS (No-break) e geradores de backup.
- **Prevenção de Incêndio**: Sistemas de gás que não danificam o hardware.

---

## 5. Modelo de Score Ubíquo

Nosso algoritmo (`creditEngine.ts`) prioriza a **sustentabilidade**:
- **Conservadorismo**: Multiplicadores de limite menores para perfis voláteis.
- **Anti-Fraude**: Detecção de "Dinheiro Circular" e inconsistência de IP/Dispositivo.
- **Fatores Comportamentais**: Estabilidade de renda e taxa de poupança.

---

## 6. Tecnologias Utilizadas

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Shadcn/UI.
- **Backend/BaaS**: Supabase (Database, Auth, Realtime).
- **Open Finance**: Pluggy API (Sandbox).
- **Deployment**: Vercel.

---
**Equipe Libera** - *Crédito sem burocracia, futuro com liberdade.*
