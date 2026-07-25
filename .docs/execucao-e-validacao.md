# Execução e validação

## Iniciar o ambiente

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
```

Endereços:

- frontend: `http://localhost:5173`;
- API: `http://localhost:8080`;
- PostgreSQL: `localhost:5433`.

## Testes automatizados

Última execução em 24/07/2026:

- frontend: 26 arquivos e 113 testes aprovados;
- build Vite: aprovado;
- backend: suíte Spring/JUnit aprovada, incluindo carrinho e presentes.

Frontend:

```bash
cd frontend
npx vitest run
npm run build
```

Backend:

```bash
cd backend/api
./mvnw test
```

Em rede corporativa, o Maven pode depender do repositório configurado pela organização. A alternativa já validada é executar os testes durante o build da imagem Docker.

## Checklist funcional

### Catálogo

- [ ] Um clone limpo exibe pelo menos 8 produtos.
- [ ] Produtos vêm da API, não de mocks.
- [ ] Busca por nome funciona.
- [ ] Filtro por categoria funciona.
- [ ] Estado vazio aparece para busca sem resultados.

### Detalhe

- [ ] Imagem, descrição e preço estão presentes.
- [ ] A ação de adicionar ao carrinho funciona.
- [ ] Produto já comprado não pode ser comprado novamente.

### Carrinho

- [ ] Adicionar item.
- [ ] Remover item.
- [ ] Aumentar e diminuir quantidade.
- [ ] Recalcular total.
- [ ] Recarregar a página e manter o carrinho.

### Checkout

- [ ] Abrir formulário.
- [ ] Navegar pelo formulário sem mouse.
- [ ] Exibir labels associados.
- [ ] Bloquear envio inválido com mensagem acessível.
- [ ] Confirmar a compra no DOM.
- [ ] Não usar gateway real.

### Extras

- [ ] Sessão permanece após recarregar.
- [ ] Rotas privadas redirecionam sem autenticação.
- [ ] Admin cria, edita e exclui produto.
- [ ] Favoritos persistem.

## Responsividade

Validar manualmente em:

- 360 × 800;
- 768 × 1024;
- 1280 × 900;
- zoom de 200%.

Em cada largura, conferir menu, catálogo, detalhe, carrinho, checkout e ausência de overflow horizontal.

### Evidência executada em 24/07/2026

| Largura | Detalhe | Carrinho/checkout | Biblioteca/resgate | Erros de página | Overflow |
| ---: | --- | --- | --- | ---: | ---: |
| 360 px | ação de presente visível | modalidades, quantidade, validação e 2 códigos confirmados | label e erro com foco | 0 | não |
| 768 px | ação de presente visível | modalidades, quantidade, validação e 2 códigos confirmados | label e erro com foco | 0 | não |
| 1280 px | ação de presente visível | modalidades, quantidade, validação e 2 códigos confirmados | label e erro com foco | 0 | não |

O teste usou respostas autenticadas controladas apenas para isolar a interface. Banco e regras de negócio foram validados separadamente pela suíte Spring MockMvc e por migração real em PostgreSQL 16.

Resultados automatizados:

- frontend: 26 arquivos e 113 testes aprovados;
- backend: suíte Maven/JUnit aprovada em Java 21;
- build Vite: 2.183 módulos transformados;
- schema: clone novo com 8 produtos; migração do schema anterior preservou carrinho e criou as novas estruturas.

## Acessibilidade

1. usar Chrome anônimo, sem extensões;
2. operar catálogo, carrinho e checkout apenas com teclado;
3. confirmar foco visível;
4. inspecionar labels e mensagens de erro;
5. testar contraste no WebAIM;
6. executar Lighthouse conforme [`lighthouse-report.md`](./lighthouse-report.md);
7. testar pelo menos o checkout com VoiceOver ou NVDA.

## Congelamento da entrega

Quando os bloqueadores estiverem corrigidos:

1. rerodar testes e build;
2. concluir Lighthouse;
3. revisar README e documentos;
4. ensaiar pitch e arguição;
5. criar o commit final;
6. criar a tag `v1.0-pitch`;
7. enviar a tag ao GitHub;
8. confirmar acesso público em janela anônima.

Não crie a tag antes do congelamento: ela deve apontar exatamente para o commit apresentado.
