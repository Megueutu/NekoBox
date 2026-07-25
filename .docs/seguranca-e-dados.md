# Segurança e dados

Segurança profunda não integra a rubrica obrigatória, mas o projeto trata dados de conta e precisa evitar falhas básicas durante a demonstração.

## Controles existentes

- senhas com BCrypt;
- tokens aleatórios persistidos apenas como hash;
- sessões com expiração;
- validação de usuário, e-mail, senha e URL de avatar;
- autorização administrativa e por proprietário;
- erros centralizados sem stack trace para o cliente;
- `.env` ignorado pelo Git;
- segredo Cloudinary restrito ao backend;
- constraints e transações no PostgreSQL.

## Riscos conhecidos

- token no `localStorage`, acessível em caso de XSS;
- uso frequente de `innerHTML` em templates;
- Spring Security está como dependência, mas a autenticação usa serviço próprio;
- ausência de rate limiting;
- ausência de trilha de auditoria centralizada;
- ausência de política de retenção e exclusão completa de conta.

## Cuidados na entrega

- nunca commitar `.env`;
- nunca colocar `CLOUDINARY_URL`, senha ou API secret em variável `VITE_*`;
- não exibir credenciais reais no pitch;
- usar somente contas e gift cards de demonstração;
- apagar dados pessoais inseridos por convidados após a apresentação;
- explicar que o gateway é simulado.

## Uso seguro do DOM

Dados externos devem entrar no DOM por `textContent` ou passar por escape. O avaliador valoriza `createElement`, `textContent` e event delegation; portanto, a redução de `innerHTML` também melhora a nota de qualidade.
