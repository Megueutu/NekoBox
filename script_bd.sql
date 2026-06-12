-- ====================================================================
-- 1. USUARIO
-- ====================================================================

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    url_avatar TEXT,
    biografia TEXT,
    saldo NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (saldo >= 0)
);

-- ====================================================================
-- 2. Jogo + tabelas relacionadas
-- ====================================================================

CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    titulo VARCHAR(255) NOT NULL,
    descricao_curta TEXT,
    descricao_longa TEXT,
    preco NUMERIC(12,2) NOT NULL CHECK (preco >= 0)
);

CREATE TABLE fotos (
    id SERIAL PRIMARY KEY,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL 
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE produtos_categorias (
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    PRIMARY KEY (produto_id, categoria_id)
);

-- ====================================================================
-- 3. fluxo de compra carrinho + pagamento
-- ====================================================================

CREATE TABLE carrinho (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carrinho_itens (
    id SERIAL PRIMARY KEY,
    carrinho_id INT NOT NULL REFERENCES carrinho(id) ON DELETE CASCADE,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (carrinho_id, produto_id)
);

CREATE TABLE pagamento (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT, 
    valor_pago NUMERIC(12,2) NOT NULL CHECK (valor_pago >= 0),
    status VARCHAR(20) NOT NULL DEFAULT "pendente"
);

-- ====================================================================
-- 4. interação de usuario + posse de jogos
-- ====================================================================

CREATE TABLE biblioteca_usuarios (
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    tempo_jogo_minutos INT NOT NULL DEFAULT 0 CHECK (tempo_jogo_minutos >= 0),
    adicionado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, produto_id)
);

CREATE TABLE avaliacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    nota SMALLINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    recomenda BOOLEAN NOT NULL,
    texto_avaliacao TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, produto_id)
);

CREATE TABLE buscas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    produto_id INT REFERENCES produtos(id) ON DELETE SET NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);