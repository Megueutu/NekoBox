BEGIN;

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    url_avatar TEXT,
    avatar_public_id TEXT,
    biografia TEXT,
    saldo NUMERIC(12,2) NOT NULL DEFAULT 1000.00 CHECK (saldo >= 0),
    papel VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (papel IN ('USER', 'ADMIN')),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS papel VARCHAR(20) NOT NULL DEFAULT 'USER';
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_papel_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_papel_check CHECK (papel IN ('USER', 'ADMIN'));
UPDATE usuarios SET papel = 'USER'
WHERE papel = 'ADMIN' AND email <> 'admin@nekobox.local';
CREATE UNIQUE INDEX IF NOT EXISTS uk_usuarios_unico_admin
    ON usuarios (papel)
    WHERE papel = 'ADMIN';

CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    descricao_curta TEXT,
    descricao_longa TEXT,
    preco NUMERIC(12,2) NOT NULL CHECK (preco >= 0),
    data_lancamento DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    tags_json TEXT NOT NULL DEFAULT '[]',
    requisitos_json TEXT NOT NULL DEFAULT '[]',
    idiomas_json TEXT NOT NULL DEFAULT '[]',
    atualizacoes_json TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_produtos_status ON produtos(status);
CREATE INDEX IF NOT EXISTS idx_produtos_titulo_lower ON produtos(LOWER(titulo));

CREATE TABLE IF NOT EXISTS fotos (
    id SERIAL PRIMARY KEY,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    public_id TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('cover', 'banner', 'screenshot')),
    posicao INT NOT NULL DEFAULT 1 CHECK (posicao > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_fotos_unicas
    ON fotos(produto_id, tipo)
    WHERE tipo IN ('cover', 'banner');

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS produtos_categorias (
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    PRIMARY KEY (produto_id, categoria_id)
);

CREATE TABLE IF NOT EXISTS carrinho (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carrinho_itens (
    id SERIAL PRIMARY KEY,
    carrinho_id INT NOT NULL REFERENCES carrinho(id) ON DELETE CASCADE,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (carrinho_id, produto_id)
);

CREATE TABLE IF NOT EXISTS wishlist_itens (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, produto_id)
);

CREATE TABLE IF NOT EXISTS pagamento (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    valor_pago NUMERIC(12,2) NOT NULL CHECK (valor_pago >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'cancelado')),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS biblioteca_usuarios (
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    tempo_jogo_minutos INT NOT NULL DEFAULT 0 CHECK (tempo_jogo_minutos >= 0),
    adicionado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, produto_id)
);

CREATE TABLE IF NOT EXISTS avaliacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    nota DOUBLE PRECISION NOT NULL CHECK (nota BETWEEN 1 AND 5),
    recomenda BOOLEAN NOT NULL,
    texto_avaliacao TEXT,
    votos_uteis INT NOT NULL DEFAULT 0 CHECK (votos_uteis >= 0),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, produto_id)
);

ALTER TABLE avaliacoes
    ALTER COLUMN nota TYPE DOUBLE PRECISION USING nota::DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS sessoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expira_em TIMESTAMP NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_expira_em ON sessoes(expira_em);

CREATE TABLE IF NOT EXISTS gift_cards (
    id BIGSERIAL PRIMARY KEY,
    codigo_hash VARCHAR(64) NOT NULL UNIQUE,
    valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
    resgatado_por_usuario_id INT REFERENCES usuarios(id) ON DELETE RESTRICT,
    resgatado_em TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (resgatado_por_usuario_id IS NULL AND resgatado_em IS NULL) OR
        (resgatado_por_usuario_id IS NOT NULL AND resgatado_em IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_gift_cards_resgatado_por
    ON gift_cards(resgatado_por_usuario_id)
    WHERE resgatado_por_usuario_id IS NOT NULL;

INSERT INTO usuarios (nome_usuario, email, senha, saldo, biografia)
VALUES ('NekoBox Studios', 'catalog@nekobox.local', '$2a$10$catalogUserCannotAuthenticate000000000000000000000', 0.00, 'Publicadora do catálogo de demonstração do NekoBox.')
ON CONFLICT (email) DO UPDATE SET
    nome_usuario = EXCLUDED.nome_usuario,
    senha = EXCLUDED.senha,
    saldo = EXCLUDED.saldo,
    biografia = EXCLUDED.biografia;

INSERT INTO usuarios (nome_usuario, email, senha, saldo, biografia)
VALUES ('usert', 'usert@nekobox.local', '$2a$10$8dEs/3fiXxxXeuZaGjQsj.UwAafS5dLc7hD6wKS9bfKQ6ACMUkdjW', 1000.00, 'Usuário root local para testes do NekoBox.')
ON CONFLICT (email) DO UPDATE SET
    nome_usuario = EXCLUDED.nome_usuario,
    senha = EXCLUDED.senha,
    saldo = EXCLUDED.saldo,
    biografia = EXCLUDED.biografia,
    atualizado_em = CURRENT_TIMESTAMP;

INSERT INTO usuarios (nome_usuario, email, senha, saldo, biografia, papel)
VALUES ('admin', 'admin@nekobox.local', '$2y$10$cwUtHF0/aFE5nYgzqxs/t.mCRZMgjnPk2TKA/KH/cW600/kdiUhru', 0.00, 'Administrador único do NexusPlay.', 'ADMIN')
ON CONFLICT (email) DO UPDATE SET
    nome_usuario = EXCLUDED.nome_usuario,
    senha = EXCLUDED.senha,
    saldo = EXCLUDED.saldo,
    biografia = EXCLUDED.biografia,
    papel = 'ADMIN',
    atualizado_em = CURRENT_TIMESTAMP;

INSERT INTO gift_cards (codigo_hash, valor) VALUES
('42bf332b84b2ad22d565e4e7dda570ba9cf60d329e33bd3bd3786d3f8bb29e31', 25.00),
('f4fe29a26149fb23426bfebc9d427e2b5bac90b59fd6eaaa8bbcb02df10fe76b', 50.00),
('52e4992ae188ea6a2a64a6b9f4b526a3bd146b86e3426ea2bca2e1b70ddd76a6', 100.00)
ON CONFLICT (codigo_hash) DO NOTHING;

INSERT INTO categorias (nome) VALUES
('RPG'), ('Ação'), ('Aventura'), ('Mundo Aberto'), ('Fantasia'), ('Ficção Científica'),
('Roguelike'), ('Sandbox'), ('Simulação'), ('Metroidvania'), ('Plataforma')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO produtos (
    usuario_id, titulo, slug, descricao_curta, descricao_longa, preco, data_lancamento, status,
    tags_json, requisitos_json, idiomas_json, atualizacoes_json
)
SELECT id, 'Cyberpunk 2077', 'cyberpunk-2077',
       'Uma aventura de ação em mundo aberto na megalópole de Night City.',
       'Você joga como V, um mercenário em busca de um implante único que carrega a chave da imortalidade.',
       199.90, DATE '2020-12-10', 'published',
       '["Cyberpunk","Primeira Pessoa","Narrativa"]',
       '[{"type":"minimum","os":"Windows 10 64-bit","cpu":"Core i5-3570K","ram":"12 GB","gpu":"GTX 780","storage":"70 GB SSD"},{"type":"recommended","os":"Windows 10 64-bit","cpu":"Core i7-4790","ram":"16 GB","gpu":"GTX 1060 6GB","storage":"70 GB SSD"}]',
       '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":true},{"name":"Inglês","interface":true,"subtitles":true,"audio":true}]',
       '[{"id":"cp-update-1","version":"2.12","title":"Patch de estabilidade","content":"Correções e otimizações gerais.","created_at":"2024-02-20"}]'
FROM usuarios WHERE email = 'catalog@nekobox.local'
ON CONFLICT (slug) DO UPDATE SET
    usuario_id = EXCLUDED.usuario_id,
    titulo = EXCLUDED.titulo,
    descricao_curta = EXCLUDED.descricao_curta,
    descricao_longa = EXCLUDED.descricao_longa,
    preco = EXCLUDED.preco,
    data_lancamento = EXCLUDED.data_lancamento,
    status = EXCLUDED.status,
    tags_json = EXCLUDED.tags_json,
    requisitos_json = EXCLUDED.requisitos_json,
    idiomas_json = EXCLUDED.idiomas_json,
    atualizacoes_json = EXCLUDED.atualizacoes_json;

INSERT INTO produtos (usuario_id, titulo, slug, descricao_curta, descricao_longa, preco, data_lancamento, status, tags_json, requisitos_json, idiomas_json, atualizacoes_json)
SELECT id, titulo, slug, curta, longa, preco, lancamento, 'published', tags, '[]', '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":false},{"name":"Inglês","interface":true,"subtitles":true,"audio":true}]', '[]'
FROM usuarios CROSS JOIN (VALUES
    ('The Witcher 3: Wild Hunt', 'the-witcher-3', 'Torne-se um caçador de monstros profissional em uma aventura épica.', 'Explore um continente devastado pela guerra como Geralt de Rívia.', 129.90, DATE '2015-05-19', '["Fantasia","História Rica"]'),
    ('Red Dead Redemption 2', 'red-dead-redemption-2', 'Uma aventura no coração da América do fim do século XIX.', 'Arthur Morgan e a gangue Van der Linde lutam para sobreviver.', 179.90, DATE '2018-10-26', '["Faroeste","Narrativa"]'),
    ('Elden Ring', 'elden-ring', 'Levante, Maculado, e que a graça guie seu caminho.', 'Um vasto RPG de ação e fantasia criado pela FromSoftware.', 249.90, DATE '2022-02-25', '["Souls-like","Fantasia"]'),
    ('Hollow Knight', 'hollow-knight', 'Explore um vasto reino subterrâneo de insetos e heróis.', 'Forje seu caminho por cavernas, vilas antigas e ruínas mortais.', 49.90, DATE '2017-02-24', '["Indie","Metroidvania","2D"]'),
    ('Hades', 'hades', 'Desafie o deus da morte e escape do submundo.', 'Um roguelike de ação inspirado na mitologia grega.', 69.90, DATE '2020-09-17', '["Roguelike","Mitologia Grega","Indie"]')
) AS game(titulo, slug, curta, longa, preco, lancamento, tags)
WHERE usuarios.email = 'catalog@nekobox.local'
ON CONFLICT (slug) DO UPDATE SET
    usuario_id = EXCLUDED.usuario_id,
    titulo = EXCLUDED.titulo,
    descricao_curta = EXCLUDED.descricao_curta,
    descricao_longa = EXCLUDED.descricao_longa,
    preco = EXCLUDED.preco,
    data_lancamento = EXCLUDED.data_lancamento,
    status = EXCLUDED.status,
    tags_json = EXCLUDED.tags_json,
    requisitos_json = EXCLUDED.requisitos_json,
    idiomas_json = EXCLUDED.idiomas_json,
    atualizacoes_json = EXCLUDED.atualizacoes_json;

DELETE FROM fotos
WHERE produto_id IN (
    SELECT id FROM produtos
    WHERE slug IN ('cyberpunk-2077', 'the-witcher-3', 'red-dead-redemption-2', 'elden-ring', 'hollow-knight', 'hades')
);

INSERT INTO fotos (produto_id, url, tipo, posicao)
SELECT id, 'https://picsum.photos/seed/' || slug || '/400/600', 'cover', 1 FROM produtos;
INSERT INTO fotos (produto_id, url, tipo, posicao)
SELECT id, 'https://picsum.photos/seed/' || slug || '-banner/1920/1080', 'banner', 1 FROM produtos;
INSERT INTO fotos (produto_id, url, tipo, posicao)
SELECT id, 'https://picsum.photos/seed/' || slug || '-shot/800/450', 'screenshot', 1 FROM produtos;

DELETE FROM produtos_categorias
WHERE produto_id IN (
    SELECT id FROM produtos
    WHERE slug IN ('cyberpunk-2077', 'the-witcher-3', 'red-dead-redemption-2', 'elden-ring', 'hollow-knight', 'hades')
);

INSERT INTO produtos_categorias (produto_id, categoria_id)
SELECT p.id, c.id
FROM produtos p
JOIN categorias c ON
    (p.slug IN ('cyberpunk-2077', 'the-witcher-3', 'elden-ring') AND c.nome = 'RPG') OR
    (p.slug IN ('cyberpunk-2077', 'red-dead-redemption-2', 'elden-ring', 'hades') AND c.nome = 'Ação') OR
    (p.slug IN ('the-witcher-3', 'red-dead-redemption-2') AND c.nome = 'Mundo Aberto') OR
    (p.slug = 'hollow-knight' AND c.nome IN ('Metroidvania', 'Plataforma')) OR
    (p.slug = 'hades' AND c.nome = 'Roguelike');

COMMIT;
