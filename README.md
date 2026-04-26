<img width="837" height="194" alt="image" src="https://github.com/user-attachments/assets/8a27cf83-4483-4e51-938e-9751b5c7e3dd" />

# Libera • Crédito Sem Burocracia

> **Projeto Final - Hackathon Semana Ubíqua**  
> Uma solução de Open Finance focada em inclusão financeira e crédito comportamental.

---

## 1. Identidade Visual (Branding)

A marca **Libera** nasceu do conceito de "destrancar" oportunidades. 

<img width="1080" height="316" alt="image" src="https://github.com/user-attachments/assets/c1ce834f-29eb-4108-976d-37415000335c" />

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
<img width="1920" height="869" alt="image" src="https://github.com/user-attachments/assets/772c05e7-b924-4e50-a9de-f736d231f3c1" />

### B. Análise em Tempo Real
Nosso motor processa até 500 transações em segundos.
<img width="1920" height="868" alt="image" src="https://github.com/user-attachments/assets/aa74d697-83a9-4237-9128-3fc91c3a3448" />

### C. Resultado e Transparência (Legal Compliance)
Damos o score e explicamos o **porquê**.
- **Insights**: "Sua renda é consistente", "Seu comprometimento é alto". Isso cumpre a exigência jurídica de explicabilidade.
<img width="1920" height="875" alt="image" src="https://github.com/user-attachments/assets/c12ef3f2-893a-4bf4-8e67-949b8add6b93" />

### D. Simulação e Contratação
O usuário escolhe o valor (dentro do limite aprovado) e as parcelas.
- **Slider de Valor**: Ajuste fino do quanto precisa.
<img width="1920" height="874" alt="image" src="https://github.com/user-attachments/assets/4a777219-1684-485e-9c0c-da806101a057" />

### E. Painel de Controle (Dashboard)
Gestão total do crédito e saldo devedor.
- **Saldo Devedor**: Visão clara do quanto falta pagar.
- **Progresso de Parcelas**: Ex: "1 de 6".
<img width="1920" height="879" alt="image" src="https://github.com/user-attachments/assets/27c2ccb6-4d06-46f5-b5b9-3de588ed469d" />

### F. Pagamento Real-time (Scan & Pay)
Sincronização entre dispositivos via Supabase Realtime.
- **Botão "Pagar via Pix"**: Gera o QR Code e o link "Copia e Cola".
- **Confirmação no Celular**: Atualiza o dashboard no computador instantaneamente.
<img width="1920" height="874" alt="image" src="https://github.com/user-attachments/assets/91f89478-8afd-44ef-bb9c-c91e46db6c53" />

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
