# RELATÓRIO TÉCNICO DE SOLUÇÃO: LIBERA FINTECH
**Hackathon Semana Ubíqua | Abril 2026**

---

## 1. RESUMO EXECUTIVO

A **Libera** é uma plataforma de crédito inteligente desenhada para preencher a lacuna de exclusão financeira que afeta milhões de trabalhadores autônomos e informais no Brasil. Através da tecnologia de **Open Finance**, transformamos dados transacionais brutos em indicadores de confiança, permitindo a concessão de crédito imediato com base no comportamento real, e não apenas no histórico burocrático.

---

## 2. IDENTIDADE E PROPÓSITO

### 2.1 Branding: A História da Logo
A marca Libera é fundamentada na liberdade financeira. Nossa identidade visual utiliza a simbologia do **cadeado em evolução**:
- **O Desbloqueio**: A transição de um cadeado fechado para uma forma fluida em 'L' representa a quebra de barreiras bancárias.
- **Inteligência (i)**: A junção das formas cria a letra 'i', simbolizando o motor de inteligência por trás do score.
- **Fluxo e Base**: As curvas representam o fluxo de caixa (S) e a base sólida de dados (U) que sustenta a fintech.

### 2.2 Público-Alvo
- Microempreendedores Individuais (MEI).
- Motoristas de aplicativo e entregadores.
- Freelancers e profissionais liberais.
- Trabalhadores informais com fluxo de caixa recorrente.

---

## 3. O PROBLEMA: A BARREIRA DO CRÉDITO TRADICIONAL

O sistema bancário convencional utiliza modelos de score estáticos (Credit Bureau) que penalizam o autônomo por:
1. **Falta de Holerite**: Inabilidade de comprovar renda fixa.
2. **Volatilidade**: Fluxos de caixa que variam mês a mês são vistos como "risco" em vez de "oportunidade".
3. **Inércia**: O score demora meses para refletir uma melhora na saúde financeira.

---

## 4. A SOLUÇÃO: SCORE UBÍQUO E OPEN FINANCE

### 4.1 Arquitetura Técnica
A solução foi construída sobre uma stack moderna e resiliente:
- **Frontend**: React + Vite com design system baseado em **Glassmorphism** e **Neon Aesthetics** para uma percepção de produto "High-End".
- **Backend-as-a-Service (BaaS)**: Integração com **Supabase** para persistência distribuída e segurança de dados.
- **Camada Real-time**: Sincronização instantânea via **WebSockets (Supabase Broadcast)** para o fluxo "Scan & Pay".

### 4.2 O Motor de Crédito (Behavioral Scoring)
Diferente dos bancos, o `creditEngine` do Libera analisa:
- **Consistência**: Não importa o valor bruto, mas a frequência e estabilidade das entradas.
- **Taxa de Poupança**: Capacidade do usuário de manter saldo positivo frente aos gastos.
- **Comprometimento de Renda**: Alertas automáticos quando os gastos ultrapassam 85% da renda identificada.

### 4.3 Segurança e Fraude
Para proteger o ecossistema, implementamos:
- **Detecção de Dinheiro Circular**: Identificação de algoritmos que tentam simular renda através de transferências espelhadas.
- **Prova de Vida Digital**: Validação cruzada de CPF via API de Open Finance.
- **RLS (Row Level Security)**: Isolamento total de dados no nível do banco de dados PostgreSQL.

---

## 5. PLANO DE SEGURANÇA FÍSICA (DATA CENTER)

Entendemos que a confiança digital depende de infraestrutura física sólida. Nossos parceiros de infraestrutura seguem rigorosos protocolos:
1. **Controle Biométrico**: Acesso aos servidores restrito a pessoal autorizado via biometria e cartões RFID.
2. **Resiliência Energética**: Sistemas de UPS (No-breaks) e geradores a diesel capazes de manter a operação por 48h em caso de blackout.
3. **Climatização de Precisão**: Controle de temperatura e umidade para evitar degradação de hardware.
4. **Proteção de Dados**: Backup geodistribuído para recuperação de desastres (Disaster Recovery).

---

## 6. JORNADA DO USUÁRIO (USER EXPERIENCE)

1. **Conexão**: O usuário autoriza o compartilhamento de dados via **Pluggy API**.
2. **Análise**: O sistema processa os dados e apresenta o **Score Libera** com justificativas claras (Explicabilidade Legal).
3. **Simulação**: O usuário ajusta o valor e as parcelas conforme sua necessidade real.
4. **Contratação**: Liberação via Pix simulada em segundos.
5. **Gestão**: Dashboard com acompanhamento de parcelas e saldo devedor em tempo real.

---

## 7. ROADMAP E ESCALABILIDADE

### Fase 1 (Hackathon)
- MVP Funcional com integração Pluggy + Supabase.
- Fluxo Scan & Pay real-time.
- Motor de score comportamental básico.

### Fase 2 (Próximos Passos)
- **Negociação Automatizada**: Chatbot para renegociação de parcelas em atraso.
- **Cashback Progressivo**: Redução de juros para usuários com 100% de pontualidade.
- **Integração Marketplace**: Ofertas de crédito direto em plataformas de delivery e transporte.

---

## 8. CONCLUSÃO

A Libera não é apenas um app de empréstimos; é uma ponte tecnológica. Ao utilizar dados que já pertencem ao usuário (Open Finance) de forma inteligente, transformamos o risco em oportunidade e a burocracia em liberdade.

---
**Equipe Libera**
*Crédito sem burocracia, futuro com liberdade.*
