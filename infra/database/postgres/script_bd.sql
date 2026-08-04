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

CREATE UNIQUE INDEX IF NOT EXISTS uk_usuarios_unico_admin
    ON usuarios (papel)
    WHERE papel = 'ADMIN';

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

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
    quantidade INT NOT NULL DEFAULT 1 CHECK (quantidade BETWEEN 1 AND 10),
    para_presente BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_carrinho_itens_modalidade
    ON carrinho_itens(carrinho_id, produto_id, para_presente);

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
    quantidade INT NOT NULL DEFAULT 1 CHECK (quantidade BETWEEN 1 AND 10),
    para_presente BOOLEAN NOT NULL DEFAULT FALSE,
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

CREATE TABLE IF NOT EXISTS codigos_jogo_presente (
    id BIGSERIAL PRIMARY KEY,
    codigo_hash VARCHAR(64) NOT NULL UNIQUE,
    codigo_criptografado TEXT,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    comprador_usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    resgatado_por_usuario_id INT REFERENCES usuarios(id) ON DELETE RESTRICT,
    resgatado_em TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (resgatado_por_usuario_id IS NULL AND resgatado_em IS NULL) OR
        (resgatado_por_usuario_id IS NOT NULL AND resgatado_em IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_codigos_jogo_presente_produto
    ON codigos_jogo_presente(produto_id);
CREATE INDEX IF NOT EXISTS idx_codigos_jogo_presente_comprador
    ON codigos_jogo_presente(comprador_usuario_id);
CREATE INDEX IF NOT EXISTS idx_codigos_jogo_presente_resgatado_por
    ON codigos_jogo_presente(resgatado_por_usuario_id)
    WHERE resgatado_por_usuario_id IS NOT NULL;

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
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (nome_usuario, email, senha, saldo, biografia)
VALUES ('usert', 'usert@nekobox.local', '$2a$10$8dEs/3fiXxxXeuZaGjQsj.UwAafS5dLc7hD6wKS9bfKQ6ACMUkdjW', 1000.00, 'Usuário root local para testes do NekoBox.')
ON CONFLICT (email) DO NOTHING;

INSERT INTO usuarios (nome_usuario, email, senha, saldo, biografia, papel)
VALUES ('admin', 'admin@admin.com', '$2y$10$RKA40E2CClFo.IgVor2lh.NrDtUGtHEZ6YP2uN1hUL6GVpXCUvZoa', 0.00, 'Administrador único do NexusPlay.', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

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
SELECT
    u.id, g.titulo, g.slug, g.descricao_curta, g.descricao_longa, g.preco, g.data_lancamento,
    'published'::VARCHAR, g.tags_json, g.requisitos_json, g.idiomas_json, g.atualizacoes_json
FROM usuarios u
CROSS JOIN (VALUES
    (
        'Cyberpunk 2077',
        'cyberpunk-2077',
        'Navegue pelas ruas de Night City como V, um mercenário fora da lei em busca de um implante cibernético único que carrega a chave para a imortalidade.',
        'Cyberpunk 2077 é um RPG de ação e aventura em mundo aberto ambientado na megalópole de Night City, onde poder, glamour e modificações corporais são obsessões locais. Você joga como V, um mercenário fora da lei atrás de um implante único que carrega a chave para a imortalidade.' || E'\n\n' ||
        'Personalize o cibernético, o conjunto de habilidades e o estilo de jogo do seu personagem e explore uma cidade vasta, onde as escolhas moldam a história e o mundo ao seu redor. Interaja com personagens marcantes como Johnny Silverhand e mergulhe em conspirações corporativas intensas.' || E'\n\n' ||
        'Com gráficos de última geração, um sistema complexo de combate que combina tiro em primeira pessoa e habilidades hackers, o jogo oferece centenas de horas de exploração dinâmica e narrativa imersiva.',
        199.90, DATE '2020-12-10',
        '["RPG", "Ação", "Ficção Científica", "Cyberpunk", "Mundo Aberto", "Primeira Pessoa", "Narrativa"]',
        '[{"type":"minimum","os":"Windows 10 64-bit","cpu":"Core i7-6700 ou Ryzen 5 1600","ram":"12 GB","gpu":"GTX 1060 6GB ou RX 580","storage":"70 GB SSD"},{"type":"recommended","os":"Windows 10 64-bit","cpu":"Core i7-12700K ou Ryzen 7 7800X3D","ram":"16 GB","gpu":"RTX 2060 SUPER ou RX 5700 XT","storage":"70 GB SSD"}]',
        '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":true},{"name":"Inglês","interface":true,"subtitles":true,"audio":true},{"name":"Espanhol","interface":true,"subtitles":true,"audio":true}]',
        '[{"id":"cp-21","version":"2.12","title":"Atualização de Desempenho e Ajustes de Gameplay","content":"Aprimoramentos de estabilidade, suporte a novas tecnologias de upscaling e ajustes no sistema de combate cibernético.","created_at":"2024-02-29"}]'
    ),
    (
        'The Witcher 3: Wild Hunt',
        'the-witcher-3',
        'Embarque em uma jornada épica como Geralt de Rívia, um caçador de monstros em busca da Criança da Profecia em um vasto mundo devastado pela guerra.',
        'The Witcher 3: Wild Hunt é um RPG de ação focado em história e ambientado num universo de fantasia sombria e impressionante. Você é Geralt de Rívia, um mercenário caçador de monstros treinado desde a infância para destruir criaturas lendárias.' || E'\n\n' ||
        'Explore um vasto mundo aberto composto por cidades mercantis, ilhas piratas, passagens de montanha perigosas e cavernas esquecidas. Confronte inimigos usando espadas de aço e prata, feitiços de sinais mágicos, poções alquímicas e bombas devastadoras.' || E'\n\n' ||
        'Tome decisões difíceis onde não há uma escolha moralmente simples e vivencie uma das narrativas mais aclamadas da história dos videogames, repleta de personagens complexos e missões secundárias inesquecíveis.',
        129.90, DATE '2015-05-19',
        '["RPG", "Mundo Aberto", "Fantasia", "Aventura", "História Rica", "Single Player"]',
        '[{"type":"minimum","os":"Windows 7/8/10 64-bit","cpu":"Core i5-2500K ou Phenom II X4 940","ram":"6 GB","gpu":"GTX 660 ou HD 7870","storage":"50 GB"},{"type":"recommended","os":"Windows 10/11 64-bit","cpu":"Core i7-3770 ou FX-8350","ram":"16 GB","gpu":"GTX 1060 ou RX 580","storage":"50 GB SSD"}]',
        '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":true},{"name":"Inglês","interface":true,"subtitles":true,"audio":true}]',
        '[{"id":"tw3-nextgen","version":"4.04","title":"Atualização da Nova Geração","content":"Melhorias visuais com Ray Tracing, novos modos de câmera, correções de missões e integração com itens inspirados na série da Netflix.","created_at":"2023-07-19"}]'
    ),
    (
        'Red Dead Redemption 2',
        'red-dead-redemption-2',
        'Acompanhe Arthur Morgan e a gangue Van der Linde no fim da era do Velho Oeste, fugindo de agentes federais e caçadores de recompensa pelos EUA.',
        'Estados Unidos, 1899. O fim da era do Velho Oeste começou. Depois de um assalto dar errado na cidade de Blackwater, Arthur Morgan e a gangue Van der Linde são forçados a fugir.' || E'\n\n' ||
        'Com agentes federais e os melhores caçadores de recompensas no seu encalço, a gangue precisa roubar, assaltar e lutar para sobreviver no coração terrestre da América. Conforme divisões internas profundas ameaçam despedaçar a gangue, Arthur deve escolher entre seus próprios ideais e a lealdade à gangue que o criou.' || E'\n\n' ||
        'Oferecendo um nível sem precedentes de detalhe no ecossistema, simulação de mundo vivo, sistema de honra e combate realista com armas da época, RDR2 é um marco absoluto nos jogos de mundo aberto.',
        199.90, DATE '2018-10-26',
        '["Ação", "Aventura", "Mundo Aberto", "Faroeste", "Narrativa", "Single Player"]',
        '[{"type":"minimum","os":"Windows 10 64-bit","cpu":"Core i5-2500K ou FX-6300","ram":"8 GB","gpu":"GTX 770 2GB ou R9 280 3GB","storage":"150 GB"},{"type":"recommended","os":"Windows 10/11 64-bit","cpu":"Core i7-4770K ou Ryzen 5 1500X","ram":"12 GB","gpu":"GTX 1060 6GB ou RX 480 4GB","storage":"150 GB SSD"}]',
        '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":false},{"name":"Inglês","interface":true,"subtitles":true,"audio":true}]',
        '[{"id":"rdr2-1.32","version":"1.32","title":"Melhorias de Estabilidade e Correções","content":"Aprimoramentos de desempenho no DirectX 12 e Vulkan, além de correções para suporte a monitores ultra-wide.","created_at":"2024-03-19"}]'
    ),
    (
        'Elden Ring',
        'elden-ring',
        'Levante-se, Maculado, e seja guiado pela graça para empunhar o poder do Anel de Elden e se tornar um Lorde Prístino nas vastas Terras Intermédias.',
        'A ORDEM DESTRUÍDA. Levante-se, Maculado, e seja guiado pela graça para empunhar o poder do Anel de Elden e se tornar um Lorde Prístino nas Terras Intermédias.' || E'\n\n' ||
        'Um vasto mundo onde campos abertos com uma variedade de situações e masmorras gigantescas com complexos designs 3D se conectam perfeitamente. Conforme explora, a alegria de descobrir ameaças desconhecidas e esmagadoras te aguarda, criando uma grande sensação de conquista.' || E'\n\n' ||
        'Além de personalizar a aparência do seu personagem, você pode combinar livremente as armas, armaduras e magias que equipar. Desenvolva seu personagem de acordo com seu estilo de jogo e enfrente chefes memoráveis criados em colaboração com Hidetaka Miyazaki e George R. R. Martin.',
        229.90, DATE '2022-02-25',
        '["RPG", "Ação", "Souls-like", "Mundo Aberto", "Fantasia", "Difícil"]',
        '[{"type":"minimum","os":"Windows 10 64-bit","cpu":"Core i5-8400 ou Ryzen 3 3300X","ram":"12 GB","gpu":"GTX 1060 3GB ou RX 580 4GB","storage":"60 GB"},{"type":"recommended","os":"Windows 10/11 64-bit","cpu":"Core i7-8700K ou Ryzen 5 3600X","ram":"16 GB","gpu":"GTX 1070 8GB ou RX Vega 56 8GB","storage":"60 GB SSD"}]',
        '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":false},{"name":"Inglês","interface":true,"subtitles":true,"audio":true}]',
        '[{"id":"er-1.12","version":"1.12","title":"Ajustes de Balanceamento e Suporte ao DLC","content":"Ajustes de balanceamento de armas em PvP/PvE, correções de bugs em habilidades e preparação para Shadow of the Erdtree.","created_at":"2024-06-20"}]'
    ),
    (
        'Hollow Knight',
        'hollow-knight',
        'Forje seu próprio caminho em Hollow Knight, uma aventura épica de ação em 2D por um vasto reino arruinado de insetos, heróis e mistérios antigos.',
        'Enfrente as profundezas de um reino esquecido. Abaixo da cidade desvanecida de Dirtmouth jaz um antigo reino arruinado. Muitos são atraídos para o subterrâneo em busca de riquezas, glória ou respostas para segredos antigos.' || E'\n\n' ||
        'Hollow Knight é uma aventura de ação em estilo Metroidvania clássico em 2D, ambientada num vasto mundo interconectado. Explore cavernas sinuosas, vilas antigas e resíduos mortais; lute contra criaturas bizarras e faça amizade com insetos peculiares.' || E'\n\n' ||
        'Com arte desenhada à mão impressionante, controles incrivelmente precisos e uma trilha sonora orquestral envolvente, desvende os mistérios no coração deste império caído.',
        46.99, DATE '2017-02-24',
        '["Metroidvania", "Plataforma", "Ação", "Indie", "2D", "Exploração"]',
        '[{"type":"minimum","os":"Windows 7 64-bit","cpu":"Core 2 Duo E5200","ram":"4 GB","gpu":"GeForce 9800GTX+ (1GB)","storage":"9 GB"},{"type":"recommended","os":"Windows 10 64-bit","cpu":"Core i5","ram":"8 GB","gpu":"GeForce GTX 560","storage":"9 GB SSD"}]',
        '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":false},{"name":"Inglês","interface":true,"subtitles":true,"audio":false}]',
        '[{"id":"hk-1.5","version":"1.5.78","title":"Godmaster & Ajustes Finais","content":"Edição final contendo todos os 4 pacotes de conteúdo gratuitos integrados nativamente.","created_at":"2021-05-26"}]'
    ),
    (
        'Hades',
        'hades',
        'Desafie o deus dos mortos enquanto você batalha para escapar do Submundo neste emocionante roguelike de ação com narrativa rica e combate ágil.',
        'Hades é um roguelike de ação onde você empunha o poder e as armas místicas do Olimpo para escapar das garras do Deus dos Mortos em cada tentativa única e cada vez mais desafiadora.' || E'\n\n' ||
        'Como o Príncipe do Submundo, Zagreus, você vai se fortalecer e desvendar mais da história com cada tentativa única de fuga. Os olimpianos estão ao seu lado! Conheça Zeus, Atena, Poseidon e muitos outros, e escolha entre dezenas de bênçãos poderosas.' || E'\n\n' ||
        'Com personagens cativantes e dublagem soberba, combinação procedural de ambientes e um ritmo acelerado, Hades combina o melhor dos jogos de ação com uma narrativa ramificada inesquecível.',
        73.99, DATE '2020-09-17',
        '["Roguelike", "Ação", "Mitologia", "Indie", "Hack and Slash", "Single Player"]',
        '[{"type":"minimum","os":"Windows 7 SP1 64-bit","cpu":"Dual Core 2.4 GHz","ram":"4 GB","gpu":"1GB VRAM / DirectX 10+","storage":"15 GB"},{"type":"recommended","os":"Windows 10 64-bit","cpu":"Dual Core 3.0 GHz+","ram":"8 GB","gpu":"2GB VRAM / DirectX 11+","storage":"15 GB SSD"}]',
        '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":false},{"name":"Inglês","interface":true,"subtitles":true,"audio":true}]',
        '[{"id":"hades-1.0","version":"1.036","title":"Patch de Compatibilidade e Correções","content":"Otimização para resoluções ultra-wide, correções no comportamento dos chefes e localização aprimorada.","created_at":"2021-01-15"}]'
    ),
    (
        'Stardew Valley',
        'stardew-valley',
        'Herde a antiga fazenda do seu avô em Stardew Valley. Aprenda a viver da terra, crie animais, explore cavernas e transforme este campo em seu lar.',
        'Você herdou a antiga fazenda do seu avô em Stardew Valley. Armado com ferramentas de segunda mão e algumas moedas, você parte para começar sua nova vida!' || E'\n\n' ||
        'Transforme seu campo num terreno produtivo e vibrante, crie animais, cultive plantações sazonais, projete sua casa e celeiros. Explore cavernas profundas e misteriosas para encontrar minérios preciosos e enfrentar monstros perigosos.' || E'\n\n' ||
        'Participe de festivais sazonais, faça amizade com mais de 30 moradores da Vila dos Pelicanos e aproveite o suporte completo para modo cooperativo online com até 8 jogadores.',
        24.99, DATE '2016-02-26',
        '["Simulação", "Sandbox", "RPG", "Farming", "Coop", "Relaxante"]',
        '[{"type":"minimum","os":"Windows 7 ou superior","cpu":"2 GHz","ram":"2 GB","gpu":"256 MB VRAM / Shader Model 3.0+","storage":"500 MB"},{"type":"recommended","os":"Windows 10 64-bit","cpu":"2.5 GHz+","ram":"4 GB","gpu":"512 MB VRAM","storage":"1 GB SSD"}]',
        '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":false},{"name":"Inglês","interface":true,"subtitles":true,"audio":false}]',
        '[{"id":"sv-1.6","version":"1.6.8","title":"Grande Atualização 1.6","content":"Novos festivais, novo tipo de fazenda, novas linhas de diálogo, itens inéditos e coop para até 8 jogadores no PC.","created_at":"2024-04-18"}]'
    ),
    (
        'Celeste',
        'celeste',
        'Ajude Madeline a enfrentar seus demônios internos em sua jornada até o topo da Montanha Celeste neste jogo de plataforma preciso e emocionante.',
        'Ajude Madeline a sobreviver aos seus demônios internos em sua jornada até o topo da Montanha Celeste neste jogo de plataforma superafiado dos criadores de TowerFall.' || E'\n\n' ||
        'Uma aventura solo movida por uma história emocionante, com um elenco de personagens cativantes e uma busca comovente de autodescoberta. Uma montanha gigantesca com mais de 700 telas de desafios de plataforma e segredos devassadores.' || E'\n\n' ||
        'Controles simples e acessíveis — pular, impulsionar e escalar — com profundidade para que cada morte seja uma lição aprendida. Renascimentos relâmpago mantêm você na ação enquanto escala a montanha.',
        36.99, DATE '2018-01-25',
        '["Plataforma", "Indie", "Difícil", "Narrativa", "2D", "Trilha Sonora Excelente"]',
        '[{"type":"minimum","os":"Windows 7 ou superior","cpu":"Intel Core i3 M380","ram":"2 GB","gpu":"Intel HD 4000","storage":"1200 MB"},{"type":"recommended","os":"Windows 10 64-bit","cpu":"Intel Core i5","ram":"4 GB","gpu":"GeForce GTX 650","storage":"2 GB SSD"}]',
        '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":false},{"name":"Inglês","interface":true,"subtitles":true,"audio":false}]',
        '[{"id":"celeste-1.4","version":"1.4.0.0","title":"Capítulo Farewell e Ajustes Gerais","content":"Inclusão do Capítulo 9 (Farewell) gratuito e várias melhorias de acessibilidade.","created_at":"2021-09-20"}]'
    ),
    (
        'Marvel Rivals', 'marvel-rivals',
        'Monte sua equipe de super-heróis e vilões da Marvel neste eletrizante hero shooter de ação 6v6.',
        'Marvel Rivals é um jogo de tiro em equipe (hero shooter) rápido e dinâmico, onde você reúne seus personagens favoritos do universo Marvel. Lute em batalhas 6v6 intensas usando habilidades únicas e combinações de equipe.' || E'\n\n' ||
        'O jogo foca em sinergia dinâmica: heróis podem combinar seus poderes para criar ataques devastadores, como Rocket Raccoon subindo nos ombros do Groot. Os mapas são ambientes icônicos e totalmente destrutíveis, moldando o campo de batalha em tempo real.' || E'\n\n' ||
        'Com atualizações sazonais, novos heróis e modos de jogo constantes, você viverá o ápice do multiverso em partidas altamente competitivas e estratégicas.',
        0.00, DATE '2024-12-06',
        '["Ação", "Hero Shooter", "Multiplayer", "Marvel"]',
        '[{"type":"minimum","os":"Windows 10 64-bit","cpu":"Intel Core i5-6600K","ram":"12 GB","gpu":"GTX 1060","storage":"70 GB"},{"type":"recommended","os":"Windows 10 64-bit","cpu":"Intel Core i5-10400","ram":"16 GB","gpu":"RTX 2060","storage":"70 GB SSD"}]',
        '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":true},{"name":"Inglês","interface":true,"subtitles":true,"audio":true}]',
        '[]'
    ),
    (
        'Halo: Combat Evolved Anniversary', 'halo',
        'Reviva a campanha lendária do Master Chief com gráficos totalmente remasterizados.',
        'A edição de aniversário do jogo que definiu uma geração. Halo: Combat Evolved Anniversary é uma versão espetacularmente remasterizada da campanha original, criada para celebrar um dos jogos de tiro em primeira pessoa mais amados de todos os tempos.' || E'\n\n' ||
        'Caia no misterioso anel de Halo, enfrente a aliança alienígena Covenant e descubra os segredos obscuros do Flood. O jogo permite alternar instantaneamente entre os gráficos clássicos e a nova versão remasterizada com o toque de um botão.' || E'\n\n' ||
        'Além do visual refeito, aproveite suporte completo a multiplayer cooperativo, conquistas modernas e mecânicas que cimentaram o legado do Spartan John-117.',
        199.00, DATE '2011-11-15',
        '["Ação", "Ficção Científica", "FPS", "Multiplayer"]',
        '[{"type":"minimum","os":"Windows 10","cpu":"Intel Core i7-975","ram":"8 GB","gpu":"GeForce GTS 450","storage":"55 GB"},{"type":"recommended","os":"Windows 10","cpu":"Intel Core i7-870","ram":"8 GB","gpu":"GeForce GTX 560 Ti","storage":"55 GB"}]',
        '[{"name":"Inglês","interface":true,"subtitles":true,"audio":true}]',
        '[]'
    ),
    (
        'Demon''s Souls', 'demons-souls',
        'Descubra onde a jornada brutal começou neste remake impressionante do clássico cult de ação e fantasia.',
        'Totalmente reconstruído do zero e aprimorado magistralmente, este remake apresenta os horrores de uma terra de fantasia sombria e enevoada para toda uma nova geração de jogadores.' || E'\n\n' ||
        'O rei Allant canalizou as artes da alma, despertando O Ancião. Com isso, uma névoa incolor varreu a terra, libertando criaturas que se alimentam das almas dos mortais. Como um guerreiro solitário, você deve enfrentar os desafios mais difíceis para ganhar o título de Matador de Demônios.' || E'\n\n' ||
        'Experimente o combate original que definiu o gênero Souls-like com gráficos impressionantes, tempos de carregamento instantâneos e suporte a recursos hápticos avançados.',
        349.90, DATE '2020-11-12',
        '["RPG", "Ação", "Fantasia", "Souls-like"]',
        '[{"type":"minimum","os":"Exclusivo de Console","cpu":"-","ram":"-","gpu":"-","storage":"66 GB"}]',
        '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":true},{"name":"Inglês","interface":true,"subtitles":true,"audio":true}]',
        '[]'
    ),
    (
        'Dark Souls Saga', 'dark-souls-saga',
        'A trilogia épica que definiu o gênero. Prepare-se para morrer e renascer em Lothric e Lordran.',
        'A Dark Souls Saga reúne a aclamada trilogia de RPGs de ação da FromSoftware que revolucionou o design de videogames modernos, incluindo o primeiro jogo remasterizado, sua sequência brutal e a épica conclusão.' || E'\n\n' ||
        'Explore mundos decrépitos maravilhosamente sombrios, cheios de masmorras interconectadas, segredos escondidos e lore contada através de ambientes e itens. Enfrente chefes colossais em combates que exigem paciência, estratégia e reflexos precisos.' || E'\n\n' ||
        'Construa seu personagem exatamente como quiser, escolha entre feitiçaria, milagres ou força bruta com espadas gigantescas, e deixe sua marca em um universo onde a chama está sempre prestes a se apagar.',
        299.90, DATE '2018-10-19',
        '["RPG", "Ação", "Fantasia", "Souls-like"]',
        '[{"type":"minimum","os":"Windows 10","cpu":"Intel Core i3-2100","ram":"4 GB","gpu":"GeForce GTX 750 Ti","storage":"50 GB"}]',
        '[{"name":"Português (Brasil)","interface":true,"subtitles":true,"audio":false},{"name":"Inglês","interface":true,"subtitles":true,"audio":true}]',
        '[]'
    )
) AS g(titulo, slug, descricao_curta, descricao_longa, preco, data_lancamento, tags_json, requisitos_json, idiomas_json, atualizacoes_json)
WHERE u.email = 'catalog@nekobox.local'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO fotos (produto_id, url, tipo, posicao)
SELECT p.id, f.url, f.tipo, f.posicao
FROM produtos p
JOIN (VALUES
    ('cyberpunk-2077', 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_600x900_2x.jpg', 'cover', 1),
    ('cyberpunk-2077', 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg', 'banner', 1),
    ('cyberpunk-2077', 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_e15c3245ed78c8e104f7d45cf58f5bc6515f22e8.1920x1080.jpg', 'screenshot', 1),
    ('cyberpunk-2077', 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_e0653f58a361ef563f6ee8eb1a92ec2fb947a1d1.1920x1080.jpg', 'screenshot', 2),
    ('cyberpunk-2077', 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_49540b68dc34be6ca1caebaa1e02cd092e039bfd.1920x1080.jpg', 'screenshot', 3),

    ('the-witcher-3', 'https://cdn.akamai.steamstatic.com/steam/apps/292030/library_600x900_2x.jpg', 'cover', 1),
    ('the-witcher-3', 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg', 'banner', 1),
    ('the-witcher-3', 'https://cdn.akamai.steamstatic.com/steam/apps/292030/ss_107600742f1025251a37c95b6cb2f2eb67a42b10.1920x1080.jpg', 'screenshot', 1),
    ('the-witcher-3', 'https://cdn.akamai.steamstatic.com/steam/apps/292030/ss_3e21544464ea9885e33d2f9b1716270e5b7c02b9.1920x1080.jpg', 'screenshot', 2),
    ('the-witcher-3', 'https://cdn.akamai.steamstatic.com/steam/apps/292030/ss_26e8573ef8204618e7c00e12e7534d0b13cfb2e6.1920x1080.jpg', 'screenshot', 3),

    ('red-dead-redemption-2', 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/library_600x900_2x.jpg', 'cover', 1),
    ('red-dead-redemption-2', 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg', 'banner', 1),
    ('red-dead-redemption-2', 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/ss_017be71a6202e8eb065b7417537db387ae4fb21a.1920x1080.jpg', 'screenshot', 1),
    ('red-dead-redemption-2', 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/ss_8217d84a7e8006b5d9be253fef1c9b60b2df7e8f.1920x1080.jpg', 'screenshot', 2),
    ('red-dead-redemption-2', 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/ss_b834bb9ec8df20b0ddf5caebf3e2e28329b31278.1920x1080.jpg', 'screenshot', 3),

    ('elden-ring', 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_600x900_2x.jpg', 'cover', 1),
    ('elden-ring', 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg', 'banner', 1),
    ('elden-ring', 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_f8e65839b2cc068d83a152d12e6900a30b053229.1920x1080.jpg', 'screenshot', 1),
    ('elden-ring', 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_37a1e0bfa900f089601a4e12e7534d0b13cfb2e6.1920x1080.jpg', 'screenshot', 2),
    ('elden-ring', 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_81e3a109a909477038e6e5a0be5bb105e9a4e0c3.1920x1080.jpg', 'screenshot', 3),

    ('hollow-knight', 'https://cdn.akamai.steamstatic.com/steam/apps/367520/library_600x900_2x.jpg', 'cover', 1),
    ('hollow-knight', 'https://cdn.akamai.steamstatic.com/steam/apps/367520/header.jpg', 'banner', 1),
    ('hollow-knight', 'https://cdn.akamai.steamstatic.com/steam/apps/367520/ss_07a049d562148ed163e9c402b8b98e854d1d91a9.1920x1080.jpg', 'screenshot', 1),
    ('hollow-knight', 'https://cdn.akamai.steamstatic.com/steam/apps/367520/ss_bb93dc45ed442488a031e6783d81b953d100fb6a.1920x1080.jpg', 'screenshot', 2),
    ('hollow-knight', 'https://cdn.akamai.steamstatic.com/steam/apps/367520/ss_30d2ed12852656ef45f28a38c238b693bc2f2165.1920x1080.jpg', 'screenshot', 3),

    ('hades', 'https://cdn.akamai.steamstatic.com/steam/apps/1145360/library_600x900_2x.jpg', 'cover', 1),
    ('hades', 'https://cdn.akamai.steamstatic.com/steam/apps/1145360/header.jpg', 'banner', 1),
    ('hades', 'https://cdn.akamai.steamstatic.com/steam/apps/1145360/ss_d36cb2d2c1e4c7604eb806c92d5be30dbca9418e.1920x1080.jpg', 'screenshot', 1),
    ('hades', 'https://cdn.akamai.steamstatic.com/steam/apps/1145360/ss_e1f5744cbbf13101bf89bb8e2efad7c6f0daebf2.1920x1080.jpg', 'screenshot', 2),
    ('hades', 'https://cdn.akamai.steamstatic.com/steam/apps/1145360/ss_5d4d3851b3cdacccb40f2521c7bb39682522bdc4.1920x1080.jpg', 'screenshot', 3),

    ('stardew-valley', 'https://cdn.akamai.steamstatic.com/steam/apps/413150/library_600x900_2x.jpg', 'cover', 1),
    ('stardew-valley', 'https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg', 'banner', 1),
    ('stardew-valley', 'https://cdn.akamai.steamstatic.com/steam/apps/413150/ss_a5a92cfb9d4dfb5dbd0a4aa44b7d08c5067a922d.1920x1080.jpg', 'screenshot', 1),
    ('stardew-valley', 'https://cdn.akamai.steamstatic.com/steam/apps/413150/ss_75e01eb4a68285910efc60f4c39faeb88f91307b.1920x1080.jpg', 'screenshot', 2),
    ('stardew-valley', 'https://cdn.akamai.steamstatic.com/steam/apps/413150/ss_51996f0ee405391a32a673067f9d501c51859bfd.1920x1080.jpg', 'screenshot', 3),

    ('celeste', 'https://cdn.akamai.steamstatic.com/steam/apps/504230/library_600x900_2x.jpg', 'cover', 1),
    ('celeste', 'https://cdn.akamai.steamstatic.com/steam/apps/504230/header.jpg', 'banner', 1),
    ('celeste', 'https://cdn.akamai.steamstatic.com/steam/apps/504230/ss_0dfbd2ee4dc3500d0752e25d2b3efaa5bd16382f.1920x1080.jpg', 'screenshot', 1),
    ('celeste', 'https://cdn.akamai.steamstatic.com/steam/apps/504230/ss_cc873df14bc91ae0bf3fbc4da5c8291583cdd1db.1920x1080.jpg', 'screenshot', 2),
    ('celeste', 'https://cdn.akamai.steamstatic.com/steam/apps/504230/ss_602c3dc8c2a3b0dbda460cae84f50f2aaedc4091.1920x1080.jpg', 'screenshot', 3),

    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805994/aeb816655b966f6e96a0fc4929afba02da754badf872f10f_zzjj6k.avif', 'cover', 1),
    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/907bba0da07662df166e58a65ef6fff1c23439ae11c31db7_vecwuu.avif', 'banner', 1),
    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/7ca0dd31fecc5a0263171dc1ac1ea6befc8c68a65cbf6ed1_xzjqag.avif', 'screenshot', 1),
    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805989/034f754b52a25a00736af4b882a9c6d26246dc634b36c62d_n6njhn.avif', 'screenshot', 2),
    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/1497203e1cb92ca05a9aba5f9f945123509dbe98bbc319b3_vtgs7z.avif', 'screenshot', 3),
    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805994/beca58d8d8c64b5f874bf722b0852eb91844fc165a740402_h8rufp.avif', 'screenshot', 4),

    ('halo', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805993/a0d52445fcb5d96d66a361b6759d1b8b959c4644cea70714_zvkgj3.avif', 'cover', 1),
    ('halo', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/5102f2929b3357cb4af79022f4fc2234fc5756710947e91a_edmtif.avif', 'banner', 1),
    ('halo', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/7f525c8831b83edd4443bab95a5daae307ef2da814d7b398_ainlx7.avif', 'screenshot', 1),
    ('halo', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805993/7808104862aafa9eede3c8eaacc204b5ac8245d97cf90668_mgdr2d.avif', 'screenshot', 2),
    ('halo', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/afba6274e85aa8de25cbb7f07409bab9f87e37d61ffc08c0_cpvtdj.avif', 'screenshot', 3),
    ('halo', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805996/e3cf56087f2010c33bde8a30b68f57948f2bc8e1dc819980_z6svhv.avif', 'screenshot', 4),

    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/lEQQ9AXMadW1BN8kruQbSy8S_ftno18.avif', 'cover', 1),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/brIXKBE5BqYgBSrsDn6Wo18O_gv8k0f.avif', 'banner', 1),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/lK4tpxDNLfOxHly1yE5ceKNt_aule4d.avif', 'screenshot', 1),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/NE92EYZjGR8hU8ZcNDgEYEX1_dfe44s.avif', 'screenshot', 2),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/p3BNVCDOeLpb3bWAptk2Hi2t_xzqj7q.avif', 'screenshot', 3),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/OtTU8V9BfVqiy4jp0QhHp8ad_m7hywr.avif', 'screenshot', 4),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806002/s1gIFpXqw8t18gzshEHkv8r2_x4msa4.avif', 'screenshot', 5),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806002/sYFQ266gczqGyso9d8PjJ1Al_xxozqy.avif', 'screenshot', 6),

    ('dark-souls-saga', 'https://picsum.photos/seed/darksouls-cover/400/600', 'cover', 1),
    ('dark-souls-saga', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806003/zA0pyOR4JXOtGGIY7Jp2FJZP_p8ismg.avif', 'banner', 1),
    ('dark-souls-saga', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/PREVIEW_SCREENSHOT1_77921_ayuygk.avif', 'screenshot', 1),
    ('dark-souls-saga', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/PREVIEW_SCREENSHOT2_77921_cmp1ja.avif', 'screenshot', 2),
    ('dark-souls-saga', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/PREVIEW_SCREENSHOT1_109885_q6jtln.avif', 'screenshot', 3),
    ('dark-souls-saga', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/PREVIEW_SCREENSHOT2_109885_jrb8ao.avif', 'screenshot', 4),
    ('dark-souls-saga', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806000/PREVIEW_SCREENSHOT3_77921_naxrf1.avif', 'screenshot', 5),
    ('dark-souls-saga', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806000/PREVIEW_SCREENSHOT3_109885_fhkz2m.avif', 'screenshot', 6),
    ('dark-souls-saga', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT4_77921_kmqse4.avif', 'screenshot', 7),
    ('dark-souls-saga', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT5_77921_twukh5.avif', 'screenshot', 8),
    ('dark-souls-saga', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806000/PREVIEW_SCREENSHOT4_109885_h1vtbg.avif', 'screenshot', 9),
    ('dark-souls-saga', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT6_77921_oxg56e.avif', 'screenshot', 10)
) AS f(slug, url, tipo, posicao) ON p.slug = f.slug
WHERE NOT EXISTS (
    SELECT 1 FROM fotos existente
    WHERE existente.produto_id = p.id AND existente.tipo = f.tipo AND existente.posicao = f.posicao
);

INSERT INTO produtos_categorias (produto_id, categoria_id)
SELECT p.id, c.id
FROM produtos p
JOIN categorias c ON (
    (p.slug = 'cyberpunk-2077' AND c.nome IN ('RPG', 'Ação', 'Ficção Científica', 'Mundo Aberto')) OR
    (p.slug = 'the-witcher-3' AND c.nome IN ('RPG', 'Ação', 'Aventura', 'Mundo Aberto', 'Fantasia')) OR
    (p.slug = 'red-dead-redemption-2' AND c.nome IN ('Ação', 'Aventura', 'Mundo Aberto')) OR
    (p.slug = 'elden-ring' AND c.nome IN ('RPG', 'Ação', 'Fantasia', 'Mundo Aberto')) OR
    (p.slug = 'hollow-knight' AND c.nome IN ('Ação', 'Aventura', 'Metroidvania', 'Plataforma')) OR
    (p.slug = 'hades' AND c.nome IN ('Ação', 'Roguelike', 'Fantasia')) OR
    (p.slug = 'stardew-valley' AND c.nome IN ('RPG', 'Simulação', 'Sandbox')) OR
    (p.slug = 'celeste' AND c.nome IN ('Aventura', 'Plataforma')) OR
    (p.slug = 'marvel-rivals' AND c.nome IN ('Ação')) OR
    (p.slug = 'halo' AND c.nome IN ('Ação', 'Ficção Científica')) OR
    (p.slug = 'demons-souls' AND c.nome IN ('RPG', 'Ação', 'Fantasia')) OR
    (p.slug = 'dark-souls-saga' AND c.nome IN ('RPG', 'Ação', 'Fantasia'))
)
ON CONFLICT (produto_id, categoria_id) DO NOTHING;

COMMIT;