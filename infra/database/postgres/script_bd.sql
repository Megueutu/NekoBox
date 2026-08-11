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
    atualizacoes_json TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_produtos_status ON produtos(status);
CREATE INDEX IF NOT EXISTS idx_produtos_titulo_lower ON produtos(LOWER(titulo));

CREATE TABLE IF NOT EXISTS fotos (
    id SERIAL PRIMARY KEY,
    produto_id INT NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    public_id TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('cover', 'banner', 'poster', 'screenshot')),
    posicao INT NOT NULL DEFAULT 1 CHECK (posicao > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_fotos_unicas
    ON fotos(produto_id, tipo)
    WHERE tipo IN ('cover', 'banner', 'poster');

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
('Roguelike'), ('Sandbox'), ('Simulação'), ('Metroidvania'), ('Plataforma'),
('Turnos'), ('FPS'), ('Hack and Slash'), ('Festa'), ('Multijogador'), ('Furtividade'), ('Sobrevivência'), ('Luta'),
('Terror'), ('MOBA'), ('Battle Royale')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO produtos (
    usuario_id, titulo, slug, descricao_curta, descricao_longa, preco, data_lancamento, status,
    tags_json, atualizacoes_json
)
SELECT
    u.id, g.titulo, g.slug, g.descricao_curta, g.descricao_longa, g.preco, g.data_lancamento,
    'published'::VARCHAR, g.tags_json, g.atualizacoes_json
FROM usuarios u
CROSS JOIN (VALUES
    (
        'Cyberpunk 2077',
        'cyberpunk-2077',
        'Navegue pelas ruas de Night City como V, um mercenário fora da lei em busca de um implante cibernético único que carrega a chave para a imortalidade.',
        'Cyberpunk 2077 é um RPG de ação e aventura em mundo aberto ambientado na megalópole de Night City, onde você vive, rouba, implanta chips em si mesmo e mata para sobreviver. Você joga como V, um mercenário fora da lei atrás de um implante único que carrega a chave da imortalidade. Personalize o corpo e as habilidades do seu personagem enquanto você escolhe o seu caminho por uma cidade implacável.' || E'\n\n' ||
        'A trama gira em torno da parceria entre V e Johnny Silverhand, um rebelde digitalizado interpretado por Keanu Reeves, cuja personalidade está gravada no biochip que ameaça sobrepor a mente do protagonista. Entre gangues, corporações e fixers, Night City se revela um organismo vivo, dividido em distritos com identidades e conflitos próprios, onde cada escolha de diálogo pode redefinir alianças e o destino final da história.' || E'\n\n' ||
        'O combate mistura tiro em primeira pessoa, hackeamento e habilidades cibernéticas (cyberware) que transformam braços em lâminas ou olhos em scanners táticos. A build do personagem é moldada por uma árvore de perícias flexível, permitindo abordagens furtivas, técnicas ou de confronto direto, enquanto veículos e uma cidade vertical incentivam a exploração livre entre missões principais e contratos paralelos ricos em detalhes.' || E'\n\n' ||
        'Desenvolvido pela CD Projekt RED, o jogo passou por um ciclo extenso de correções desde o lançamento, culminando na expansão Phantom Liberty e em uma reformulação completa dos sistemas de habilidade, veículos e inteligência artificial policial, elevando a direção de arte cyberpunk e a trilha sonora licenciada a um dos pontos altos da produção.',
        199.90, DATE '2020-12-10',
        '["RPG", "Ação", "Ficção Científica", "Cyberpunk", "Mundo Aberto", "Primeira Pessoa", "Narrativa"]',
        '[{"id":"cp-21","version":"2.12","title":"Atualização de Desempenho e Ajustes de Gameplay","content":"Aprimoramentos de estabilidade, suporte a novas tecnologias de upscaling e ajustes no sistema de combate cibernético.","created_at":"2024-02-29"}]'
    ),
    (
        'The Witcher 3: Wild Hunt',
        'the-witcher-3',
        'Embarque em uma jornada épica como Geralt de Rívia, um caçador de monstros em busca da Criança da Profecia em um vasto mundo devastado pela guerra.',
        'O RPG de mundo aberto mais premiado de uma geração está refinado e aprimorado. Você é Geralt de Rívia, um caçador de monstros mercenário, em um continente devastado pela guerra e infestado de monstros que você pode explorar à vontade. Conclua contratos de caçador de monstros, tome decisões difíceis para coletar enormes recompensas.' || E'\n\n' ||
        'No centro da trama está a busca de Geralt por Ciri, sua filha adotiva perseguida pela Wild Hunt, uma horda espectral vinda de outro mundo. A jornada atravessa reinos em guerra, vilarejos amaldiçoados e cortes políticas, tecendo uma narrativa adulta sobre escolhas morais ambíguas, onde poucas decisões têm resposta certa.' || E'\n\n' ||
        'O combate combina espadas de aço e prata, sinais mágicos e alquimia de poções e óleos, exigindo preparo contra cada tipo de criatura do bestiário. Fora das batalhas, Gwent, corridas de cavalo, contratos de caça e uma economia de crafting robusta preenchem um mundo aberto denso, onde cada região carrega sua própria identidade visual e folclore.' || E'\n\n' ||
        'Desenvolvido pela CD Projekt RED, o jogo é aclamado por sua escrita madura e pelas expansões Hearts of Stone e Blood and Wine, consideradas referências do gênero. A direção de arte inspirada no folclore eslavo, aliada a uma trilha sonora atmosférica, consolidou Wild Hunt como um marco na narrativa de RPGs.',
        129.90, DATE '2015-05-19',
        '["RPG", "Mundo Aberto", "Fantasia", "Aventura", "História Rica", "Single Player"]',
        '[{"id":"tw3-nextgen","version":"4.04","title":"Atualização da Nova Geração","content":"Melhorias visuais com Ray Tracing, novos modos de câmera, correções de missões e integração com itens inspirados na série da Netflix.","created_at":"2023-07-19"}]'
    ),
    (
        'Red Dead Redemption 2',
        'red-dead-redemption-2',
        'Acompanhe Arthur Morgan e a gangue Van der Linde no fim da era do Velho Oeste, fugindo de agentes federais e caçadores de recompensa pelos EUA.',
        'America, 1899. O fim da era dos foragidos chegou. Arthur Morgan e a gangue Van der Linde são forçados a fugir depois de um roubo que deu errado na cidade de Blackwater. Com autoridades federais e os melhores caçadores de recompensas do país em seus calcanhares, a gangue deve roubar, roubar e brigar para sobreviver.' || E'\n\n' ||
        'A narrativa acompanha o declínio da gangue Van der Linde em uma América que industrializa rapidamente e não tem mais espaço para foras da lei. Arthur Morgan, tenente leal ao líder Dutch, é o fio condutor de uma história sobre lealdade, redenção e as consequências morais de uma vida de crime, contada com um elenco de personagens profundamente humanos.' || E'\n\n' ||
        'O mundo aberto reage ao comportamento do jogador através do sistema de Honra, que influencia diálogos, reputação e finais possíveis. Caça, pesca, acampamento, tiroteios táticos e a criação de vínculo com o cavalo compõem uma simulação de sobrevivência minuciosa, onde o ritmo lento reforça a imersão em vez de pressa.' || E'\n\n' ||
        'Produzido pela Rockstar Games, o título é reconhecido pela reconstrução detalhada do Velho Oeste, com ciclos climáticos, fauna e economia simulados em escala raramente vista. A direção de Dan Houser e a atuação de Roger Clark como Arthur renderam um dos roteiros mais elogiados da indústria.',
        199.90, DATE '2018-10-26',
        '["Ação", "Aventura", "Mundo Aberto", "Faroeste", "Narrativa", "Single Player"]',
        '[{"id":"rdr2-1.32","version":"1.32","title":"Melhorias de Estabilidade e Correções","content":"Aprimoramentos de desempenho no DirectX 12 e Vulkan, além de correções para suporte a monitores ultra-wide.","created_at":"2024-03-19"}]'
    ),
    (
        'Elden Ring',
        'elden-ring',
        'Levante-se, Maculado, e seja guiado pela graça para empunhar o poder do Anel de Elden e se tornar um Lorde Prístino nas vastas Terras Intermédias.',
        'Uma nova fantasia épica criada por Hidetaka Miyazaki e o grande novelista George R. R. Martin. ELDEN RING é um RPG de ação e fantasia set em um mundo criado pela colaboração dessas duas mentes criativas. Um vasto mundo onde florestas abertas e campos animados são conectados a masmorras sombrias.' || E'\n\n' ||
        'As Terras Intermédias mergulharam no caos após o estilhaçamento do Anel Prezado, e cabe ao Sem-Luz reunir os fragmentos perdidos para se tornar o novo Lorde Prezado. A mitologia obscura de Martin se manifesta em ruínas, semideuses corrompidos e uma lore fragmentada, contada por itens e diálogos em vez de cutscenes explicativas.' || E'\n\n' ||
        'Diferente dos jogos Souls anteriores, o mundo é totalmente aberto e navegável a cavalo em Torrente, permitindo abordar masmorras, castelos e chefes opcionais na ordem que o jogador preferir. Armas, feitiços e cinzas de guerra oferecem builds altamente variadas, mantendo o combate punitivo e recompensador que caracteriza a FromSoftware.' || E'\n\n' ||
        'Sob a direção de Hidetaka Miyazaki, com worldbuilding de George R. R. Martin, o jogo venceu múltiplos prêmios de Jogo do Ano e recebeu a expansão Shadow of the Erdtree, expandindo ainda mais seu já vasto universo de fantasia sombria.',
        229.90, DATE '2022-02-25',
        '["RPG", "Ação", "Souls-like", "Mundo Aberto", "Fantasia", "Difícil"]',
        '[{"id":"er-1.12","version":"1.12","title":"Ajustes de Balanceamento e Suporte ao DLC","content":"Ajustes de balanceamento de armas em PvP/PvE, correções de bugs em habilidades e preparação para Shadow of the Erdtree.","created_at":"2024-06-20"}]'
    ),
    (
        'Hollow Knight',
        'hollow-knight',
        'Forje seu próprio caminho em Hollow Knight, uma aventura épica de ação em 2D por um vasto reino arruinado de insetos, heróis e mistérios antigos.',
        'Forje seu caminho por um vasto reino em ruínas de insetos e heróis. Explore cavernas tortuosas, vilas antigas e ruínas mortais. Enfrente inimigos mortais, faça amizade com criaturas estranhas e resolva mistérios ancestrais no coração do continente.' || E'\n\n' ||
        'Hallownest é um reino subterrâneo em ruínas, devastado por uma praga que corrompeu seus habitantes insetóides. Como o Cavaleiro, um pequeno guerreiro silencioso, você desvenda aos poucos uma história trágica de reis caídos, irmãs guardiãs e um mal ancestral, contada quase inteiramente através de ambientes e encontros opcionais.' || E'\n\n' ||
        'A exploração não linear recompensa curiosidade e memorização de mapas, com habilidades de movimento (double jump, dash, wall jump) que abrem caminhos previamente inacessíveis, no estilo clássico de metroidvania. Os combates contra chefes exigem precisão e paciência, com uma dificuldade que cresce de forma justa conforme novos amuletos e talismãs são equipados.' || E'\n\n' ||
        'Criado por uma equipe pequena na Team Cherry, o jogo se destaca pela direção de arte desenhada à mão e por uma trilha sonora orquestral melancólica, tornando-se referência do gênero indie e abrindo caminho para a aguardada sequência Silksong.',
        46.99, DATE '2017-02-24',
        '["Metroidvania", "Plataforma", "Ação", "Indie", "2D", "Exploração"]',
        '[{"id":"hk-1.5","version":"1.5.78","title":"Godmaster & Ajustes Finais","content":"Edição final contendo todos os 4 pacotes de conteúdo gratuitos integrados nativamente.","created_at":"2021-05-26"}]'
    ),
    (
        'Hades',
        'hades',
        'Desafie o deus dos mortos enquanto você batalha para escapar do Submundo neste emocionante roguelike de ação com narrativa rica e combate ágil.',
        'Desafie o deus da morte lutando para escapar do submundo da mitologia grega neste aclamado roguelike de Supergiant Games. Cada vez que você sai, o mundo se expande e novos segredos são revelados. Use uma combinação de armas, habilidades e bençãos dos deuses do Olimpo para triunfar.' || E'\n\n' ||
        'Zagreu, filho do deus Hades, tenta repetidamente escapar do Submundo para encontrar sua verdadeira mãe na superfície. Cada fuga fracassada revela mais sobre a família disfuncional do Olimpo através de diálogos que evoluem a cada nova tentativa, transformando a repetição roguelike em uma ferramenta narrativa em vez de um obstáculo.' || E'\n\n' ||
        'Cada uma das Salas do Submundo apresenta combinações aleatórias de inimigos e recompensas, enquanto Bênçãos concedidas por deuses do Olimpo, como Zeus e Ares, alteram drasticamente as armas e habilidades do jogador em cada corrida. Seis armas com estilos distintos garantem builds variadas mesmo depois de dezenas de tentativas.' || E'\n\n' ||
        'Desenvolvido pela Supergiant Games, o jogo se destaca por sua direção de arte vibrante inspirada em cerâmica grega antiga e por uma trilha sonora de rock composta por Darren Korb, sendo um dos roguelikes mais premiados e o primeiro do gênero indicado ao prêmio Hugo.',
        73.99, DATE '2020-09-17',
        '["Roguelike", "Ação", "Mitologia", "Indie", "Hack and Slash", "Single Player"]',
        '[{"id":"hades-1.0","version":"1.036","title":"Patch de Compatibilidade e Correções","content":"Otimização para resoluções ultra-wide, correções no comportamento dos chefes e localização aprimorada.","created_at":"2021-01-15"}]'
    ),
    (
        'Stardew Valley',
        'stardew-valley',
        'Herde a antiga fazenda do seu avô em Stardew Valley. Aprenda a viver da terra, crie animais, explore cavernas e transforme este campo em seu lar.',
        'Você herdou a antiga fazenda do seu avô e se mudou para o interior para recomeçar. Com algumas ferramentas antigas e algumas moedas, você dá início a uma nova vida. Cultive colheitas, crie animais, pesque, minere, faça amizades com os moradores da cidade e talvez encontre o amor.' || E'\n\n' ||
        'O ciclo de dias é dividido entre plantio e colheita sazonal, cuidado com animais, mineração em cavernas geradas proceduralmente e pesca em lagos, rios e no mar. A gestão de tempo e energia adiciona uma camada estratégica sutil, incentivando o jogador a planejar rotas e prioridades a cada manhã.' || E'\n\n' ||
        'Pelican Town abriga dezenas de moradores com rotinas, diálogos e arcos pessoais próprios, permitindo amizades, rivalidades e casamentos. Restaurar o Centro Comunitário abandonado em oposição à cadeia JojaMart adiciona um tema sutil sobre comunidade versus consumismo corporativo.' || E'\n\n' ||
        'Desenvolvido quase inteiramente por uma única pessoa, Eric "ConcernedApe" Barone, o jogo levou cerca de quatro anos para ficar pronto e recebeu atualizações gratuitas contínuas por quase uma década, incluindo multiplayer, novas áreas e o modo Terreno Ancestral, mantendo uma das comunidades mais fiéis do gênero indie.',
        24.99, DATE '2016-02-26',
        '["Simulação", "Sandbox", "RPG", "Farming", "Coop", "Relaxante"]',
        '[{"id":"sv-1.6","version":"1.6.8","title":"Grande Atualização 1.6","content":"Novos festivais, novo tipo de fazenda, novas linhas de diálogo, itens inéditos e coop para até 8 jogadores no PC.","created_at":"2024-04-18"}]'
    ),
    (
        'Celeste',
        'celeste',
        'Ajude Madeline a enfrentar seus demônios internos em sua jornada até o topo da Montanha Celeste neste jogo de plataforma preciso e emocionante.',
        'Ajude Madeline a escalar a Montanha Celeste em uma aventura de plataforma precisa e emocional.' || E'\n\n' ||
        'Por trás da escalada está uma metáfora sensível sobre ansiedade e saúde mental: Madeline confronta um reflexo sombrio de si mesma, Part Madeline, em uma jornada de autoaceitação tão importante quanto os desafios de plataforma que ela enfrenta.' || E'\n\n' ||
        'O design de fases é preciso ao milímetro, com pulo, dash aéreo único e escalada de paredes formando uma linguagem de movimento que se expande constantemente com novas mecânicas por capítulo, culminando em níveis B-Side e C-Side extremamente desafiadores para veteranos.' || E'\n\n' ||
        'Criado por uma pequena equipe liderada por Maddy Thorson, o jogo é aclamado pela trilha sonora eletrônica de Lena Raine e pela forma como a dificuldade acessível (com modo assistido opcional) convive com um design de precisão hardcore.',
        36.99, DATE '2018-01-25',
        '["Plataforma", "Indie", "Difícil", "Narrativa", "2D", "Trilha Sonora Excelente"]',
        '[{"id":"celeste-1.4","version":"1.4.0.0","title":"Capítulo Farewell e Ajustes Gerais","content":"Inclusão do Capítulo 9 (Farewell) gratuito e várias melhorias de acessibilidade.","created_at":"2021-09-20"}]'
    ),
    (
        'Marvel Rivals', 'marvel-rivals',
        'Monte sua equipe de super-heróis e vilões da Marvel neste eletrizante hero shooter de ação 6v6.',
        'Monte sua equipe de super-heróis e vilões da Marvel neste eletrizante hero shooter de ação 6v6.' || E'\n\n' ||
        'Cada herói pertence a uma equipe temática do universo Marvel, e a formação de duplas ou trios de personagens específicos ativa sinergias de equipe que concedem habilidades combinadas exclusivas, incentivando composições estratégicas além da escolha individual de personagem.' || E'\n\n' ||
        'Os mapas incorporam elementos icônicos do universo Marvel, como Tóquio 2099 e a Torre Stark, com estruturas destrutíveis e verticalidade que abrem espaço para jogadas criativas de heróis voadores ou com mobilidade elevada.' || E'\n\n' ||
        'Publicado pela NetEase Games em parceria com a Marvel Games, o título gratuito recebe atualizações sazonais com novos heróis, mapas e eventos, buscando espaço em um gênero dominado por hero shooters consolidados.',
        0.00, DATE '2024-12-06',
        '["Ação", "Hero Shooter", "Multiplayer", "Marvel"]',
        '[]'
    ),
    (
        'Halo: Campaign Evolved', 'halo-campaign-evolved',
        'Remake expandido da campanha que iniciou Halo, reconstruído com visuais modernos, três missões inéditas e co-op.',
        'Remake expandido da campanha que iniciou Halo, reconstruído com visuais modernos, três missões inéditas e co-op.' || E'\n\n' ||
        'A campanha revive o primeiro contato entre a UNSC e o Covenant no anel-mundo Halo, seguindo o Master Chief e a IA Cortana em uma luta pela sobrevivência da humanidade, agora enriquecida por três missões inéditas que preenchem lacunas da história original.' || E'\n\n' ||
        'O combate mantém a tríade clássica de arma, granada e melee que definiu os shooters em console, reconstruída com física, iluminação e IA de combate modernizadas, além de suporte completo a cooperativo para revisitar o anel-mundo ao lado de outros Spartans.' || E'\n\n' ||
        'Sob responsabilidade da Halo Studios, o remake busca equilibrar fidelidade nostálgica com padrões técnicos atuais, reafirmando a importância histórica do título que ajudou a consolidar o gênero FPS em consoles.',
        249.90, DATE '2026-07-28',
        '["Ação", "Ficção Científica", "FPS", "Campanha", "Co-op", "Master Chief"]',
        '[]'
    ),
    (
        'Demon''s Souls', 'demons-souls',
        'Descubra onde a jornada brutal começou neste remake impressionante do clássico cult de ação e fantasia.',
        'Remake do clássico de fantasia sombria que estabeleceu as bases do gênero Souls.' || E'\n\n' ||
        'No reino amaldiçoado de Boletaria, uma névoa profunda desperta demônios antigos e aprisiona almas dos vivos. Como um dos poucos capazes de entrar e sair da névoa, o jogador precisa restaurar a ordem enfrentando os Arquidemônios que corromperam cada região.' || E'\n\n' ||
        'O sistema de tendência de mundo, que alterna entre pureza e negrume conforme as ações do jogador, altera a dificuldade e a aparência dos níveis, uma mecânica pioneira que antecipou muitos dos elementos hoje associados ao gênero Souls-like.' || E'\n\n' ||
        'Refeito pela Bluepoint Games para PlayStation 5, o remake reconstrói integralmente os visuais e a trilha sonora original da FromSoftware, sendo aclamado como uma das recriações gráficas mais impressionantes da geração.',
        349.90, DATE '2020-11-12',
        '["RPG", "Ação", "Fantasia", "Souls-like"]',
        '[]'
    ),
    (
        'Baldur''s Gate 3', 'baldurs-gate-3',
        'Reúna seus companheiros e retorne às Terras Esquecidas em uma história de amizade, traição, sacrifício e sobrevivência contra a Aberração Mental.',
        'Reúna seus companheiros e retorne às Terras Esquecidas em uma história de amizade, traição, sacrifício e sobrevivência. Uma doença chamada Aberração Mental está se espalhando pela cidade. Você é um dos poucos que pode parar isso — se não se tornar um monstro antes.' || E'\n\n' ||
        'Infectado por um parasita mental ilítida, o grupo de sobreviventes precisa encontrar uma cura antes de se transformar em uma aberração mental. A jornada atravessa a Costa da Espada em uma trama repleta de reviravoltas políticas, dilemas morais e romances possíveis, moldada quase inteiramente pelas escolhas do jogador.' || E'\n\n' ||
        'Baseado nas regras de Dungeons & Dragons 5ª edição, o combate por turnos valoriza posicionamento, vantagem tática e uso criativo do ambiente, como empurrar inimigos de penhascos ou incendiar óleo derramado. A liberdade narrativa é notável: praticamente qualquer ação pode ser tentada, com resultados determinados por testes de dados e pelas consequências de longo prazo.' || E'\n\n' ||
        'Desenvolvido pela Larian Studios ao longo de mais de seis anos, incluindo um extenso período de acesso antecipado, o jogo é elogiado pela quantidade de conteúdo reativo e pela qualidade das atuações em captura de performance, tendo vencido o prêmio de Jogo do Ano em 2023.',
        219.90, DATE '2023-08-03',
        '["RPG", "Fantasia", "D&D", "Turnos", "Larian Studios", "Co-op"]',
        '[{"id":"bg3-patch7","version":"Patch 7","title":"Epílogos e Melhorias","content":"Novos epílogos, melhorias de performance e correções de bugs.","created_at":"2024-01-10"}]'
    ),
    (
        'Grand Theft Auto V', 'gta-5',
        'Quando um golpista das ruas, um ladrão de bancos aposentado e um psicopata perigoso se unem, eles arriscam tudo em uma série de assaltos ousados em Los Santos.',
        'Quando um jovem golpista das ruas, um ladrão de bancos aposentado e um psicopata aterrorizante se envolvem com a facção mais assustadora e lunática do governo criminal dos EUA, eles devem arriscar tudo em uma série de golpes ousados e perigosos que representam sua única saída.' || E'\n\n' ||
        'A trama alterna entre três protagonistas jogáveis — Michael, Franklin e Trevor — cujas histórias se cruzam em uma série de assaltos cada vez mais ambiciosos em Los Santos, uma sátira da Califórnia moderna. A alternância de perspectivas permite abordar cada missão de múltiplos ângulos, aprofundando a caracterização de cada personagem.' || E'\n\n' ||
        'Além da campanha, GTA Online oferece um mundo persistente com missões cooperativas, corridas, negócios criminosos e atualizações contínuas de conteúdo há mais de uma década. A liberdade de explorar Los Santos e o condado de Blaine a pé, de carro, avião ou submarino continua sendo um dos maiores atrativos da série.' || E'\n\n' ||
        'Desenvolvido pela Rockstar North, o jogo é um dos produtos de entretenimento mais lucrativos já criados, sustentado por uma direção de mundo aberto minuciosa, humor satírico afiado e uma trilha sonora com rádios licenciadas que definiram a cultura pop da década de 2010.',
        99.90, DATE '2013-09-17',
        '["Ação", "Mundo Aberto", "Aventura", "Rockstar", "Los Santos", "Crime"]',
        '[{"id":"gta5-1.68","version":"v1.68","title":"Bottom Dollar Bounties","content":"Nova atividade de recompensas no GTA Online com missões de caça.","created_at":"2024-07-10"}]'
    ),
    (
        'Grand Theft Auto VI', 'grand-theft-auto-vi',
        'Jason e Lucia tentam sobreviver ao submundo criminoso de Leonida, um estado ensolarado inspirado na Flórida.',
        'Jason e Lucia tentam sobreviver ao submundo criminoso de Leonida, um estado inspirado na Flórida.' || E'\n\n' ||
        'Ambientado no estado fictício de Leonida, o jogo acompanha a dupla romântica formada por Jason e Lucia em uma trama de crime, traição e sobrevivência que marca a primeira protagonista jogável de destaque na história principal da série.' || E'\n\n' ||
        'Vice City e seus arredores prometem o mundo aberto mais detalhado já construído pela Rockstar, com um ecossistema urbano vivo, IA de NPCs aprimorada e a alternância entre os dois protagonistas influenciando diretamente missões e estratégias de assalto.' || E'\n\n' ||
        'Desenvolvido pela Rockstar Games como sucessor de um dos jogos mais influentes da indústria, o título carrega a expectativa de redefinir os padrões técnicos e narrativos do gênero mundo aberto.',
        0.00, DATE '2026-11-19',
        '["Ação", "Aventura", "Mundo Aberto", "Crime", "Vice City", "Rockstar"]',
        '[]'
    ),
    (
        'Call of Duty: Modern Warfare 4', 'call-of-duty-modern-warfare-4',
        'Shooter militar de ritmo acelerado da série Modern Warfare, com campanha, multiplayer e modos cooperativos.',
        'Shooter militar de ritmo acelerado da série Modern Warfare, com campanha, multiplayer e modos cooperativos.' || E'\n\n' ||
        'A campanha aposta em missões cinematográficas de ritmo acelerado, infiltrações táticas e sequências set-piece de grande escala, enquanto o multiplayer oferece mapas variados, progressão de armas profunda e modos que vão de Team Deathmatch a operações em grande escala.' || E'\n\n' ||
        'Como parte da sublinha Modern Warfare, o jogo aposta em realismo militar contemporâneo, com motion capture detalhado e um modo cooperativo que expande a narrativa além da campanha solo, mantendo a fórmula consagrada da franquia.' || E'\n\n' ||
        'O suporte pós-lançamento inclui temporadas de conteúdo gratuito, eventos ao vivo e integração com o modo battle royale da série, sustentando uma base ativa de jogadores ao longo de todo o ciclo de vida do título.',
        0.00, NULL,
        '["Ação", "FPS", "Call of Duty", "Multiplayer", "Shooter"]',
        '[]'
    ),
    (
        'Elden Ring Nightreign', 'elden-ring-nightreign',
        'Ação de sobrevivência cooperativa para até três jogadores, com personagens próprios e ciclos de três dias e noites.',
        'Ação de sobrevivência cooperativa para até três jogadores, com personagens próprios e ciclos de três dias e noites.' || E'\n\n' ||
        'Cada partida ocorre em um mapa que se reconfigura a cada ciclo, forçando os jogadores a escalarem seus personagens rapidamente através de saques, chefes de campo e eventos ambientais antes de enfrentar o Senhor da Noite ao final do terceiro dia.' || E'\n\n' ||
        'Personagens exclusivos, cada um com uma classe e habilidades únicas, substituem a criação de personagem tradicional da série, aproximando a experiência de um roguelike cooperativo sem abrir mão da atmosfera sombria e do combate técnico característicos da FromSoftware.' || E'\n\n' ||
        'Ao adaptar a fórmula Souls para sessões mais curtas e cooperativas, a FromSoftware experimenta um formato inédito dentro do universo de Elden Ring, mantendo a direção de Hidetaka Miyazaki como supervisor do projeto.',
        199.90, DATE '2025-05-30',
        '["Ação", "RPG", "Roguelike", "Soulslike", "Co-op", "FromSoftware"]',
        '[]'
    ),
    (
        'Eldest Souls', 'eldest-souls',
        'Boss rush soulslike em pixel art: enfrente os deuses antigos e salve a cidadela de uma desolação iminente.',
        'Boss rush soulslike em pixel art: enfrente os deuses antigos e salve a cidadela de uma desolação iminente.' || E'\n\n' ||
        'Os Antigos, deuses outrora adorados, se voltaram contra a humanidade e foram aprisionados na Cidadela. Como último remanescente da Ordem, cabe ao jogador enfrentar cada divindade em batalhas individuais para conter a desolação que ameaça consumir o que restou do mundo.' || E'\n\n' ||
        'Cada chefe funciona como um quebra-cabeça de padrões e janelas de ataque, exigindo leitura precisa de telegraphs e gerenciamento de uma barra de fúria que intensifica o dano em troca de maior risco, em um design de boss rush direto e sem enrolação.' || E'\n\n' ||
        'Com pixel art detalhada e chefes de escala monumental, a United Label entrega uma experiência compacta que homenageia o design de Souls-likes clássicos sem depender de um mundo aberto extenso.',
        49.90, DATE '2021-07-29',
        '["Ação", "RPG", "Soulslike", "Boss Rush", "Pixel Art", "Indie"]',
        '[]'
    ),
    (
        'Hades II', 'hades-2',
        'Como a Princesa imortal do Submundo, use feitiçaria sombria contra o Titã do Tempo em um roguelike de ação.',
        'Como a Princesa imortal do Submundo, use feitiçaria sombria contra o Titã do Tempo em um roguelike de ação.' || E'\n\n' ||
        'Como Melinoë, princesa imortal do Submundo, a protagonista enfrenta Cronos, o Titã do Tempo que escapou do Tártaro e ameaça consumir a linhagem dos deuses gregos, expandindo a mitologia familiar apresentada no primeiro jogo com novos deuses e vilões.' || E'\n\n' ||
        'Feitiçaria substitui parte do arsenal físico do jogo anterior, com magias, invocações e uma nova mecânica de Ômega que transforma ataques carregados em habilidades devastadoras, além de permitir explorar tanto o Submundo quanto a superfície grega.' || E'\n\n' ||
        'A Supergiant Games mantém a direção de arte refinada e a trilha sonora marcante da série, desta vez em acesso antecipado, incorporando feedback da comunidade antes do lançamento completo.',
        89.90, DATE '2025-09-25',
        '["Ação", "RPG", "Roguelike", "Mitologia Grega", "Indie", "Supergiant"]',
        '[]'
    ),
    (
        'God of War Ragnarök', 'god-of-war-ragnarok',
        'A jornada épica de Kratos e Atreus continua enquanto pai e filho enfrentam a profecia do Ragnarök pelos Nove Reinos.',
        'A jornada épica de Kratos e Atreus continua. Enfrentando a iminente profecia do Ragnarök, pai e filho devem viajar pelos Nove Reinos em busca de respostas. Enquanto as forças de Asgard se preparam para a guerra, Kratos e Atreus devem fazer escolhas que irão ecoar pelos mundos.' || E'\n\n' ||
        'Com o inverno de Fimbulwinter se aproximando do fim, Kratos e Atreus se veem no centro de uma guerra que envolve os Nove Reinos, deuses e gigantes. A relação entre pai e filho amadurece à medida que Atreus busca seu próprio caminho, enquanto Kratos confronta seu passado violento e o peso de ser visto como um deus.' || E'\n\n' ||
        'O combate expande o sistema introduzido em 2018 com o retorno das Lâminas do Caos ao lado do Machado Leviatã, permitindo alternar entre estilos de gelo e fogo em tempo real. A exploração dos Nove Reinos ficou mais livre, com viagens entre mundos, quebra-cabeças ambientais e desafios opcionais que recompensam equipamentos e histórias paralelas.' || E'\n\n' ||
        'Desenvolvido pela Santa Monica Studio, o jogo manteve a assinatura de câmera contínua sem cortes e elevou a fidelidade das animações faciais e da direção cinematográfica, sendo aclamado como um dos maiores exclusivos de PlayStation da geração.',
        299.90, DATE '2022-11-09',
        '["Ação", "Aventura", "Hack and Slash", "Kratos", "Mitologia Nórdica", "Santa Monica Studio"]',
        '[]'
    ),
    (
        'Dark Souls III', 'dark-souls-3',
        'RPG de ação da FromSoftware com mundos interconectados, chefes memoráveis e combate desafiador.',
        'RPG de ação da FromSoftware com mundos interconectados, chefes memoráveis e combate desafiador.' || E'\n\n' ||
        'A Era do Fogo está se apagando pela última vez, e Lothric, reino decadente, reúne ecos de áreas e personagens de toda a trilogia Souls em uma última tentativa de vincular a Primeira Chama, encerrando a saga com tom apocalíptico e melancólico.' || E'\n\n' ||
        'O combate acelera o ritmo em relação aos jogos anteriores, com inimigos mais agressivos e uma maior ênfase em posicionamento e timing, enquanto artes de combate exclusivas de cada arma adicionam variação tática a duelos contra cavaleiros corrompidos e chefes titânicos.' || E'\n\n' ||
        'Como conclusão da trilogia dirigida por Hidetaka Miyazaki, o jogo recebeu as expansões Ashes of Ariandel e The Ringed City, fechando o ciclo Souls com uma direção de arte gótica que se tornou referência do gênero.',
        299.90, DATE '2016-04-12',
        '["Ação", "RPG", "Fantasia", "Soulslike", "FromSoftware", "Fantasia Sombria"]',
        '[]'
    ),
    (
        'God of War', 'god-of-war',
        'Kratos deixa para trás seu passado grego para viver na Midgard nórdica ao lado do filho Atreus, em uma jornada de redenção pelos Nove Reinos.',
        'Kratos deixa para trás seu passado grego para viver na Midgard nórdica ao lado do filho Atreus, em uma jornada de redenção pelos Nove Reinos.' || E'\n\n' ||
        'Após a morte da esposa, Kratos precisa ensinar o filho Atreus a sobreviver em um mundo nórdico hostil, cumprindo o último pedido dela: espalhar suas cinzas do ponto mais alto dos Nove Reinos. A viagem se torna também uma reconciliação de Kratos com seu passado violento como o antigo Deus da Guerra grego.' || E'\n\n' ||
        'A câmera contínua sem cortes, inédita na série, aproxima o jogador da relação entre pai e filho, enquanto o Machado Leviatã substitui as Lâminas do Caos como arma principal, permitindo arremessos, recall mágico e combos que combinam força bruta com as flechas de Atreus.' || E'\n\n' ||
        'Sob direção de Cory Barlog, a reinvenção de 2018 na Santa Monica Studio é considerada um divisor de águas para a franquia, elevando a narrativa e a atuação de Christopher Judge como Kratos a um novo patamar.',
        199.90, DATE '2018-04-20',
        '["Ação", "Aventura", "Hack and Slash", "Kratos", "Mitologia Nórdica", "Santa Monica Studio"]',
        '[]'
    ),
    (
        'Gang Beasts', 'gang-beasts',
        'Brawler multiplayer com físicas exageradas: personagens gelatinosos se enfrentam em arenas caóticas cheias de armadilhas.',
        'Brawler multiplayer com físicas exageradas: personagens gelatinosos se enfrentam em arenas caóticas cheias de armadilhas.' || E'\n\n' ||
        'Sem golpes especiais ou combos complexos, as lutas dependem inteiramente da física: agarrar, empurrar e arremessar oponentes para fora de arenas repletas de armadilhas, como esteiras industriais, penhascos e veículos em movimento, gerando situações cômicas e imprevisíveis.' || E'\n\n' ||
        'Pensado sobretudo para partidas locais, o jogo brilha em modos de até oito jogadores simultâneos, favorecendo o caos social entre amigos mais do que a competição equilibrada, com personalização simples de personagens gelatinosos.' || E'\n\n' ||
        'Desenvolvido pela pequena Boneless Metal, o jogo se tornou um fenômeno de vídeos e streams justamente pela imprevisibilidade de sua física, consolidando-se como clássico de festa mesmo anos após o lançamento.',
        49.90, DATE '2017-12-05',
        '["Ação", "Festa", "Multijogador", "Indie", "Local Co-op", "Física"]',
        '[]'
    ),
    (
        'Metal Gear Solid Delta: Snake Eater', 'metal-gear-solid-delta',
        'Remake completo do clássico de furtividade na selva. Naked Snake enfrenta uma missão em solo soviético que mudará a história para sempre.',
        'Remake completo do clássico de furtividade na selva. Naked Snake enfrenta uma missão em solo soviético que mudará a história para sempre.' || E'\n\n' ||
        'Ambientado em 1964, no auge da Guerra Fria, Naked Snake se infiltra na selva soviética para resgatar um cientista e deter uma ameaça nuclear, enfrentando sua mentora The Boss em um confronto que redefine os conceitos de lealdade, patriotismo e sacrifício na franquia.' || E'\n\n' ||
        'O remake preserva os sistemas de camuflagem, cura de ferimentos e sobrevivência na selva que definiram o jogo original, como caçar e preparar alimentos, agora com controles modernizados e a opção de alternar entre uma câmera clássica fixa e uma nova câmera livre em terceira pessoa.' || E'\n\n' ||
        'Produzido pela Konami com direção de arte que recria fielmente a visão de Hideo Kojima para o título original de 2004, o remake é tratado como uma reconstrução respeitosa de um dos pilares narrativos dos jogos de furtividade.',
        349.90, DATE '2025-08-28',
        '["Ação", "Aventura", "Furtividade", "Stealth", "Konami", "Remake"]',
        '[]'
    ),
    (
        'Days Gone Remake', 'days-gone-remake',
        'Como o caçador de recompensas Deacon St. John, sobreviva em um mundo aberto pós-apocalíptico dominado por hordas de Freakers.',
        'Como o caçador de recompensas Deacon St. John, sobreviva em um mundo aberto pós-apocalíptico dominado por hordas de Freakers.' || E'\n\n' ||
        'Dois anos após um surto global transformar parte da população em Freakers, Deacon busca respostas sobre o paradeiro de sua esposa Sarah enquanto navega por facções de sobreviventes, cada uma com sua própria visão sobre como reconstruir a sociedade em meio ao colapso.' || E'\n\n' ||
        'A moto de Deacon funciona como extensão do personagem, exigindo manutenção de combustível e reparos constantes durante travessias por um mapa aberto hostil, enquanto hordas massivas de Freakers, compostas por centenas de inimigos simultâneos, representam alguns dos momentos mais intensos do jogo.' || E'\n\n' ||
        'A remasterização pela Bend Studio aprimora iluminação, texturas e desempenho técnico, revisitando um título que, apesar de recepção dividida no lançamento original, conquistou uma base de fãs fiel ao longo dos anos.',
        249.90, DATE '2026-03-01',
        '["Ação", "Aventura", "Sobrevivência", "Mundo Aberto", "Zumbis", "Bend Studio"]',
        '[]'
    ),
    (
        'God of War III Remastered', 'god-of-war-3-remastered',
        'A batalha final de Kratos contra o Monte Olimpo, remasterizada em alta definição com desempenho e visuais aprimorados.',
        'A batalha final de Kratos contra o Monte Olimpo, remasterizada em alta definição com desempenho aprimorado.' || E'\n\n' ||
        'Traído pelos deuses do Olimpo, Kratos escala o Monte Olimpo para se vingar de Zeus, deixando um rastro de destruição mitológica que encerra a trilogia grega original com o tom mais brutal e espetacular da série.' || E'\n\n' ||
        'Combos viscerais com as Lâminas do Caos, quebra-cabeças ambientais em escala monumental e finalizações cinematográficas contra titãs e deuses definem um ritmo de ação quase ininterrupto, culminando em algumas das sequências de chefe mais lembradas da geração PlayStation 3.' || E'\n\n' ||
        'A versão remasterizada pela Santa Monica Studio traz resolução em alta definição e taxa de quadros aprimorada, preservando a direção original de Stig Asmussen para uma nova geração de jogadores.',
        129.90, DATE '2015-07-14',
        '["Ação", "Aventura", "Hack and Slash", "Kratos", "Mitologia Grega", "Remasterizado"]',
        '[]'
    ),
    (
        'Battlefield 6', 'battlefield-6',
        'Combate militar em larga escala com destruição total de cenários, veículos e batalhas multiplayer de até 128 jogadores.',
        'Combate militar em larga escala com destruição total de cenários, veículos e batalhas multiplayer de até 128 jogadores.' || E'\n\n' ||
        'O motor de destruição permite derrubar estruturas inteiras em tempo real, alterando linhas de visão e rotas de combate no meio de um confronto, enquanto classes especializadas em assalto, suporte, engenharia e reconhecimento incentivam trabalho em equipe organizado.' || E'\n\n' ||
        'Tanques, helicópteros e veículos blindados operam ao lado da infantaria em mapas amplos, sustentando batalhas de até 128 jogadores em modos como Conquista e Breakthrough, marca registrada da série desde seus primeiros títulos.' || E'\n\n' ||
        'Desenvolvido pela EA DICE, o jogo busca retomar a identidade de combate em larga escala e destruição ambiental que consagrou a franquia, após entradas anteriores marcadas por recepção mais morna do público.',
        299.90, DATE '2025-10-10',
        '["Ação", "FPS", "Multijogador", "Guerra", "EA DICE", "Destruição"]',
        '[]'
    ),
    (
        'DOOM: The Dark Ages', 'doom-the-dark-ages',
        'Prequência sombria e medieval da saga DOOM. Empunhe escudo-serra e maça enquanto o Doom Slayer massacra hordas infernais.',
        'Prequência sombria e medieval da saga DOOM. Empunhe escudo-serra e maça enquanto o Doom Slayer massacra hordas infernais.' || E'\n\n' ||
        'Ambientado antes dos eventos de DOOM (2016), o jogo explora as origens do Doom Slayer como uma arma forjada por deuses para conter as hordas infernais, em um cenário que mistura fantasia medieval sombria com tecnologia demoníaca grotesca.' || E'\n\n' ||
        'Além do combate frenético característico da série, o Slayer ganha um escudo-serra para ataques à distância e bloqueios, uma maça capaz de esmagar formações inteiras de inimigos e sequências em um dragão mecânico e um mech gigante, expandindo a escala das batalhas.' || E'\n\n' ||
        'Desenvolvido pela id Software, o jogo mantém a direção de arte brutal da franquia enquanto experimenta um ritmo de combate mais posicional, complementando a velocidade extrema de DOOM Eternal com confrontos de maior escala.',
        299.90, DATE '2025-05-15',
        '["Ação", "FPS", "Doom Slayer", "id Software", "Demônios", "Medieval"]',
        '[]'
    ),
    (
        'Demon Slayer -Kimetsu no Yaiba- The Hinokami Chronicles', 'demon-slayer-hinokami-chronicles',
        'Reviva a jornada de Tanjiro Kamado em batalhas de arena fiéis ao anime, com técnicas de respiração espetaculares.',
        'Reviva a jornada de Tanjiro Kamado em batalhas de arena fiéis ao anime, com técnicas de respiração espetaculares.' || E'\n\n' ||
        'O jogo recria os principais arcos do anime, desde a tragédia que transforma Nezuko em demônio até a formação de Tanjiro como Caçador de Demônios, narrando eventos por meio de cutscenes fiéis à animação original.' || E'\n\n' ||
        'As batalhas em arena usam as Respirações elementais — Água, Trovão, Chama e outras — para combos vistosos e habilidades especiais que recriam ataques icônicos do anime, com um sistema de esquiva e contra-ataque que recompensa leitura de padrões inimigos.' || E'\n\n' ||
        'Desenvolvido pela CyberConnect2, estúdio conhecido por adaptações de anime como Naruto: Ultimate Ninja Storm, o jogo aposta em efeitos visuais vibrantes que buscam reproduzir a estética marcante da animação de Demon Slayer.',
        249.90, DATE '2021-10-14',
        '["Ação", "Luta", "Anime", "Arena Fighter", "Demon Slayer", "CyberConnect2"]',
        '[]'
    ),
    (
        'Hollow Knight: Silksong', 'hollow-knight-silksong',
        'Jogue como Hornet em um reino novo, enfrente inimigos e desvende os mistérios de Pharloom.',
        'Jogue como Hornet em um reino novo, enfrente inimigos e desvende os mistérios de Pharloom.' || E'\n\n' ||
        'Capturada e levada ao reino de Pharloom, Hornet precisa escalar rumo ao topo de um território montanhoso dominado por seda e reis esquecidos, revelando uma mitologia distinta da de Hallownest, porém igualmente sombria e enigmática.' || E'\n\n' ||
        'Hornet luta com sua agulha e uma variedade de técnicas de seda, unindo agilidade acrobática a um arsenal mais ofensivo que o do Cavaleiro original, com novas ferramentas de mobilidade e um sistema de crafting que personaliza habilidades ao longo da jornada.' || E'\n\n' ||
        'Após anos de desenvolvimento aguardado pela comunidade, a Team Cherry expande a direção de arte desenhada à mão e a trilha sonora atmosférica da série, prometendo um mundo ainda maior e mais denso que o primeiro jogo.',
        59.90, DATE '2025-09-04',
        '["Ação", "Metroidvania", "Plataforma", "Indie", "2D", "Exploração", "Desafio"]',
        '[]'
    ),
    (
        'Assassin''s Creed Black Flag Remake', 'assassins-creed-black-flag-remake',
        'Retorne aos mares do Caribe como o pirata Edward Kenway nesta recriação de uma aventura de ação, furtividade e mundo aberto.',
        'Retorne aos mares do Caribe como o pirata Edward Kenway nesta recriação de uma aventura de ação, furtividade e mundo aberto.' || E'\n\n' ||
        'Nas Índias Ocidentais do início do século XVIII, Edward Kenway busca fortuna rápida e acaba se envolvendo com os grandes nomes da Idade de Ouro da Pirataria, além de ser puxado para o conflito milenar entre Assassinos e Templários que molda o pano de fundo da franquia.' || E'\n\n' ||
        'Combates navais dinâmicos permitem abordar, saquear e afundar embarcações inimigas, enquanto a exploração em terra mistura parkour urbano, infiltração em fortalezas espanholas e mergulhos em destroços submersos repletos de tesouros.' || E'\n\n' ||
        'A recriação revisita um dos capítulos mais queridos da série com tecnologia gráfica atual, prometendo manter a atmosfera de liberdade caribenha que consagrou o jogo original como favorito dos fãs.',
        0.00, NULL,
        '["Ação", "Aventura", "Mundo Aberto", "Piratas", "Naval", "Furtividade", "Caribe"]',
        '[]'
    ),
    (
        'DRAGON BALL: Sparking! ZERO', 'dragon-ball-sparking-zero',
        'Lutas em arenas 3D que retomam a série Budokai Tenkaichi, com elenco amplo e batalhas destrutivas.',
        'Lutas em arenas 3D que retomam a série Budokai Tenkaichi, com elenco amplo e batalhas destrutivas.' || E'\n\n' ||
        'Com um elenco que ultrapassa 180 personagens de toda a saga Dragon Ball, o jogo revive arcos clássicos como Saiyajin, Freeza, Cell e Majin Boo através do modo Episódio Batalha, recriando momentos icônicos do anime com liberdade para explorar rotas alternativas.' || E'\n\n' ||
        'O combate mantém a essência frenética da série Budokai Tenkaichi: voo livre em arenas totalmente destrutíveis, transformações espetaculares e combos que podem encerrar lutas em segundos, exigindo leitura rápida de guard breaks e contra-ataques.' || E'\n\n' ||
        'Desenvolvido pela Spike Chunsoft sob licença da Bandai Namco, o jogo é aguardado havia mais de uma década pelos fãs da franquia, entregando visuais que recriam fielmente a estética do anime em batalhas de escala cinematográfica.',
        279.90, DATE '2024-10-11',
        '["Ação", "Luta", "Anime", "Arena Fighter", "Dragon Ball", "Multiplayer"]',
        '[]'
    ),
    (
        'Minecraft', 'minecraft',
        'Minecraft é um jogo de aventura sandbox onde você pode construir e criar seu próprio mundo.',
        'Minecraft é um jogo de aventura sandbox onde você pode construir e criar seu próprio mundo. Explore mundos gerados proceduralmente com biomas infinitos. Colete recursos, crafteie ferramentas, construa estruturas e sobreviva aos monstros da noite.' || E'\n\n' ||
        'Não existe um objetivo único: o jogador define seus próprios propósitos, seja construir castelos elaborados, redstone complexo automatizado ou simplesmente sobreviver o máximo possível. O modo Sobrevivência introduz fome, saúde e ameaças noturnas, enquanto o modo Criativo remove limites de recursos para dar espaço total à imaginação.' || E'\n\n' ||
        'Cada mundo gerado é único, combinando biomas que vão de desertos e florestas a oceanos profundos e a dimensão do Nether, repleta de perigos e recursos exclusivos. A dimensão do End guarda o confronto final contra o Ender Dragon, mas a maior parte da experiência é definida pela jornada, não pelo destino.' || E'\n\n' ||
        'Criado originalmente por Markus "Notch" Persson e hoje mantido pela Mojang Studios, Minecraft se tornou um fenômeno cultural com atualizações constantes, suporte robusto a mods e um dos maiores mercados multiplayer já criados, sendo um dos jogos mais vendidos da história.',
        89.90, DATE '2011-11-18',
        '["Sandbox", "Aventura", "Sobrevivência", "Mojang", "Construção", "Multiplayer", "Criativo"]',
        '[]'
    ),
    (
        'Genshin Impact', 'genshin-impact',
        'Embarque em uma jornada por Teyvat, um vasto mundo fantástico de sete nações elementais, em busca de um irmão ou irmã perdido.',
        'Embarque em uma jornada por Teyvat, um vasto mundo fantástico repleto de sete nações regidas por diferentes elementos e divindades, em busca de um irmão ou irmã perdido logo na chegada.' || E'\n\n' ||
        'Como o Viajante, você atravessa terras inspiradas em culturas do mundo real, cada uma moldada por um elemento específico e um Arconte que a governa, encontrando companheiros com histórias e motivações próprias ao longo do caminho. A narrativa se expande continuamente por meio de atualizações que introduzem novas regiões, arcos e revelações sobre o destino dos dois irmãos.' || E'\n\n' ||
        'A exploração é livre e vertical, com escalada, planador para atravessar grandes distâncias e quebra-cabeças ambientais que usam os sete elementos — Piro, Hidro, Eletro, Crio, Anemo, Geo e Dendro — cujas combinações geram reações como Vaporizar ou Sobrecarregar, tanto na exploração quanto no combate em tempo real com equipes de até quatro personagens.' || E'\n\n' ||
        'Desenvolvido pela HoYoverse, o jogo é gratuito e monetizado por meio de um sistema de invocação (gacha) para obter novos personagens e armas, sustentando uma das maiores bases de jogadores do mundo com atualizações regulares, trilha sonora orquestral aclamada e eventos sazonais robustos.',
        0.00, DATE '2020-09-28',
        '["RPG", "Ação", "Aventura", "Mundo Aberto", "Gacha", "Anime", "Free to Play"]',
        '[]'
    ),
    (
        'Valorant', 'valorant',
        'Shooter tático 5v5 gratuito onde precisão de mira encontra um elenco de agentes com habilidades únicas.',
        'Shooter tático 5v5 gratuito onde precisão de mira encontra um elenco de agentes com habilidades únicas, plantando ou defusando o Spike em rodadas de alta tensão.' || E'\n\n' ||
        'Cada agente pertence a um dos quatro papéis táticos — Duelista, Iniciador, Controlador ou Sentinela — e carrega um conjunto de habilidades que abrem espaço, revelam inimigos ou negam território, complementando o tiroteio direto sem substituir a importância da mira fina e do posicionamento.' || E'\n\n' ||
        'A economia de compra por rodada obriga cada equipe a gerenciar créditos entre armas, escudos e habilidades, criando decisões estratégicas constantes sobre quando forçar uma compra completa ou economizar para a próxima rodada, enquanto mapas desenhados com ângulos de tiro justos recompensam leitura de jogo e comunicação em equipe.' || E'\n\n' ||
        'Desenvolvido pela Riot Games, o título se tornou rapidamente um pilar do cenário competitivo global através do circuito VCT, recebendo novos agentes, mapas e temporadas de passe de batalha em um ciclo constante de conteúdo gratuito.',
        0.00, DATE '2020-06-02',
        '["Ação", "FPS", "Multijogador", "Hero Shooter", "Tático", "Esports"]',
        '[]'
    ),
    (
        'Resident Evil Requiem', 'resident-evil-requiem',
        'Grace Ashcroft, agente em treinamento do FBI, investiga um hospital abandonado em Raccoon City ligado ao passado obscuro de sua mãe.',
        'Grace Ashcroft, agente em treinamento do FBI, é convocada a investigar um hospital abandonado em Raccoon City com ligações diretas ao passado obscuro de sua própria mãe.' || E'\n\n' ||
        'A trama aprofunda os traumas pessoais da protagonista enquanto ela se depara com experimentos esquecidos e horrores que ecoam a história da cidade destruída pelo vírus-T, tecendo um mistério psicológico tão perturbador quanto as ameaças físicas que rondam os corredores decadentes do hospital.' || E'\n\n' ||
        'O jogo alterna entre perspectivas de primeira e terceira pessoa, permitindo ao jogador escolher a abordagem que preferir para explorar ambientes claustrofóbicos, gerenciar recursos escassos e evitar criaturas mutantes através de furtividade cuidadosa, mantendo o equilíbrio entre tensão constante e combate calculado que define a série moderna.' || E'\n\n' ||
        'Desenvolvido pela Capcom no RE Engine, o título dá continuidade ao renascimento crítico da franquia iniciado com Resident Evil Village, prometendo elevar ainda mais o nível de terror psicológico e imersão visual da saga.',
        349.90, DATE '2026-02-27',
        '["Ação", "Aventura", "Furtividade", "Terror", "Survival Horror", "Capcom"]',
        '[]'
    ),
    (
        'ARC Raiders', 'arc-raiders',
        'Em uma Terra devastada por máquinas ARC, pequenos grupos de sobreviventes se arriscam em incursões cooperativas de extração.',
        'Em uma Terra devastada por uma invasão de máquinas conhecidas como ARC, pequenos grupos de sobreviventes se arriscam em incursões cooperativas para recuperar recursos essenciais à humanidade.' || E'\n\n' ||
        'Cada expedição parte de um refúgio subterrâneo rumo a zonas de superfície contestadas, onde equipamento, munição e tecnologia recuperada podem ser extraídos com sucesso ou perdidos para sempre caso o raider caia em combate, elevando o peso de cada decisão tomada em campo.' || E'\n\n' ||
        'Além das temíveis máquinas ARC, que variam de drones ágeis a colossos blindados, outros esquadrões de jogadores disputam os mesmos recursos, criando confrontos tensos de PvPvE onde negociar, emboscar ou simplesmente fugir são estratégias igualmente válidas, enquanto o progresso entre incursões permite craftar e aprimorar equipamentos no refúgio.' || E'\n\n' ||
        'Desenvolvido pela Embark Studios, formado por veteranos da série Battlefield, o jogo adotou o modelo free-to-play para ampliar seu alcance, entregando um shooter de extração tecnicamente refinado que rapidamente conquistou uma comunidade fiel.',
        0.00, DATE '2025-10-30',
        '["Ação", "FPS", "Sobrevivência", "Multijogador", "Extraction Shooter", "PvPvE"]',
        '[]'
    ),
    (
        'Marvel Tokon: Fighting Souls', 'marvel-tokon-fighting-souls',
        'Reúna um elenco lendário de heróis e vilões da Marvel em duelos 1 contra 1 em arenas totalmente destrutíveis.',
        'Reúna um elenco lendário de heróis e vilões da Marvel em duelos 1 contra 1 onde almas e poderes cósmicos colidem em arenas totalmente destrutíveis.' || E'\n\n' ||
        'O conceito de "Tokon", um choque decisivo de almas e vontades, dá nome ao sistema de combate: cada personagem carrega um kit de golpes fiel à sua identidade nos quadrinhos, de combos aéreos ágeis a investidas de força bruta, culminando em habilidades especiais carregadas de energia que podem virar o rumo de uma luta em segundos.' || E'\n\n' ||
        'O elenco reúne ícones como Homem-Aranha, Tempestade, Feiticeira Escarlate e Magik, cada um com animações e efeitos visuais que recriam a estética vibrante dos quadrinhos em cenários tridimensionais reativos, enquanto modos de equipe expandem os duelos individuais para confrontos em grupo.' || E'\n\n' ||
        'Produzido em parceria com a Marvel Games, o título busca reacender o gênero de jogos de luta licenciados com ambições competitivas, unindo fidelidade visual ao material de origem e um sistema de combate pensado tanto para iniciantes quanto para jogadores competitivos.',
        249.90, NULL,
        '["Ação", "Luta", "Marvel", "Arena Fighter", "Multiplayer"]',
        '[]'
    ),
    (
        'Marvel''s Spider-Man 2', 'spider-man-2',
        'Peter Parker e Miles Morales unem forças quando os Caçadores de Kraven invadem Nova York e o simbionte Venom se manifesta.',
        'Peter Parker e Miles Morales unem forças como o Homem-Aranha para proteger Nova York quando os Caçadores de Kraven invadem a cidade e o simbionte Venom começa a se manifestar.' || E'\n\n' ||
        'A dupla de protagonistas jogáveis permite alternar livremente entre Peter e Miles em missões paralelas que se entrelaçam, aprofundando o crescimento pessoal de cada herói enquanto Kraven caça os predadores mais perigosos do mundo e uma ameaça simbiótica cresce nas sombras da cidade.' || E'\n\n' ||
        'O mundo aberto se expande para além de Manhattan, incluindo Brooklyn e Queens, atravessado por um sistema de web-wing que combina balanço de teia com voo planado para uma locomoção ainda mais fluida, enquanto o combate ganha novas camadas com os poderes simbiontes de Peter e as habilidades bioelétricas de Miles.' || E'\n\n' ||
        'Desenvolvido pela Insomniac Games, o jogo eleva o padrão técnico estabelecido pelos títulos anteriores no PlayStation 5, sendo aclamado pela narrativa emocional, pela fluidez de traversal e pela ambição de contar duas histórias de heróis com pesos dramáticos equivalentes.',
        299.90, DATE '2023-10-20',
        '["Ação", "Aventura", "Mundo Aberto", "Marvel", "Super-Herói", "PlayStation"]',
        '[]'
    ),
    (
        'Roblox', 'roblox',
        'Plataforma de jogos gerados por usuários onde milhões de experiências criadas pela comunidade convivem em um único hub.',
        'Plataforma de jogos gerados por usuários onde milhões de experiências criadas pela própria comunidade convivem em um único hub, de simuladores casuais a RPGs ambiciosos.' || E'\n\n' ||
        'Qualquer jogador pode criar e publicar suas próprias experiências usando o Roblox Studio, uma ferramenta de desenvolvimento acessível que ensina lógica de programação e design de jogos, transformando criadores amadores em desenvolvedores independentes com alcance global.' || E'\n\n' ||
        'A economia virtual gira em torno dos Robux, moeda usada para personalizar avatares, adquirir itens dentro das experiências e apoiar criadores, enquanto o suporte multiplataforma entre PC, celular, tablet e console mantém milhões de jogadores conectados simultaneamente em salas sociais.' || E'\n\n' ||
        'Mantido pela Roblox Corporation, o jogo se tornou um fenômeno cultural especialmente entre o público mais jovem, expandindo-se com eventos ao vivo, colaborações com marcas e franquias, e ambições declaradas de se tornar uma plataforma social e criativa duradoura.',
        0.00, DATE '2006-09-01',
        '["Sandbox", "Aventura", "Multijogador", "UGC", "Free to Play", "Criativo"]',
        '[]'
    ),
    (
        'Free Fire', 'free-fire',
        'Battle royale mobile onde 50 jogadores saltam de paraquedas em uma ilha isolada e apenas um esquadrão sobrevive.',
        'Battle royale mobile onde 50 jogadores saltam de paraquedas em uma ilha isolada e apenas um esquadrão sobrevive ao confronto final contra a zona segura que se fecha implacavelmente.' || E'\n\n' ||
        'Pensadas para durar cerca de dez minutos, as partidas priorizam ritmo acelerado e decisões rápidas, com um arsenal variado de armas, veículos terrestres e aquáticos, e uma zona segura que empurra os sobreviventes para confrontos cada vez mais próximos conforme a partida avança.' || E'\n\n' ||
        'Personagens jogáveis carregam habilidades especiais passivas ou ativáveis que se combinam ao arsenal tradicional, permitindo estratégias de equipe que vão além da pontaria, enquanto sistemas de clã e temporadas ranqueadas mantêm a comunidade engajada partida após partida.' || E'\n\n' ||
        'Publicado pela Garena, subsidiária da Sea Limited, o jogo se tornou um dos títulos mobile mais jogados do mundo, com destaque especial no Brasil, Sudeste Asiático e América Latina, sustentando um cenário competitivo robusto através do Free Fire World Series.',
        0.00, DATE '2017-12-04',
        '["Ação", "Sobrevivência", "Multijogador", "Battle Royale", "Mobile", "Free to Play"]',
        '[]'
    ),
    (
        'League of Legends', 'league-of-legends',
        'MOBA 5v5 gratuito disputado no Summoner''s Rift, onde duas equipes de invocadores comandam campeões em busca de destruir o Nexus adversário.',
        'MOBA 5v5 gratuito disputado no Summoner''s Rift, onde duas equipes de invocadores comandam campeões com habilidades únicas em busca de destruir o Nexus adversário.' || E'\n\n' ||
        'O extenso elenco de campeões cobre praticamente todo tipo de arquétipo de fantasia, cada um com quatro habilidades ativas e uma ultimate que definem seu papel em campo, sustentando uma fase de seleção estratégica onde composições de equipe e contrapicks moldam o resultado antes mesmo da partida começar.' || E'\n\n' ||
        'As funções tradicionais — Topo, Selva, Meio, Atirador e Suporte — organizam o time em torno de rotas e objetivos, enquanto dragões, arauto e o poderoso Barão Nashor concedem vantagens coletivas que transformam o controle de mapa em uma camada estratégica tão importante quanto os combates diretos entre campeões.' || E'\n\n' ||
        'Desenvolvido pela Riot Games, o jogo se consolidou como um dos esportes eletrônicos mais assistidos do planeta através do Campeonato Mundial, sustentando um ciclo constante de balanceamento, novos campeões e expansões de universo, incluindo a aclamada série animada Arcane.',
        0.00, DATE '2009-10-27',
        '["Ação", "MOBA", "Multijogador", "Esports", "Free to Play"]',
        '[]'
    ),
    (
        'Marvel''s Wolverine', 'marvels-wolverine',
        'Logan enfrenta seu passado violento como o mutante conhecido como Wolverine, em uma aventura sombria e madura ambientada no universo Marvel.',
        'Logan enfrenta seu passado violento como o mutante conhecido como Wolverine, em uma aventura sombria e madura ambientada no universo Marvel.' || E'\n\n' ||
        'Distante da luz dos Vingadores, Logan é arrastado a um conflito que envolve a Alkali Corporation e o Clã Yakuza, revivendo fragmentos dolorosos de seu passado como arma viva mutante enquanto tenta encontrar um propósito além da violência que definiu boa parte de sua existência.' || E'\n\n' ||
        'O combate corpo a corpo prioriza as garras de adamantium e o fator de cura regenerativo, permitindo embates brutais e desmembramentos que refletem a fama do anti-herói nos quadrinhos, além de habilidades sensoriais aguçadas para rastrear inimigos e itens em ambientes semiabertos.' || E'\n\n' ||
        'Desenvolvido pela Insomniac Games, mesmo estúdio por trás de Marvel''s Spider-Man, o jogo promete uma classificação indicativa mais madura que os títulos anteriores do estúdio, aprofundando o tom violento e psicológico do personagem enquanto expande o universo compartilhado da PlayStation Studios.',
        0.00, NULL,
        '["Ação", "Aventura", "Mundo Aberto", "Marvel", "X-Men", "Insomniac Games"]',
        '[]'
    ),
    (
        'Fortnite', 'fortnite',
        'Cem jogadores saltam de um ônibus voador sobre uma ilha em constante mutação, construindo estruturas e lutando até restar apenas um sobrevivente ou esquadrão.',
        'Cem jogadores saltam de um ônibus voador sobre uma ilha em constante mutação, construindo estruturas e lutando até restar apenas um sobrevivente ou esquadrão.' || E'\n\n' ||
        'A ilha se reinventa a cada temporada através de eventos ao vivo que mudam o mapa, introduzem novos pontos de interesse e cruzam o battle royale com narrativas de crossovers que já reuniram desde super-heróis Marvel até artistas musicais em shows dentro do próprio jogo.' || E'\n\n' ||
        'O sistema de construção em tempo real, que permite erguer paredes, rampas e torres instantaneamente com recursos coletados, diferencia o combate de outros battle royales, exigindo tanto mira precisa quanto raciocínio espacial rápido sob pressão, enquanto a zona de tempestade força confrontos cada vez mais próximos.' || E'\n\n' ||
        'Desenvolvido pela Epic Games, o título se tornou um fenômeno cultural global, sustentado por um modelo free-to-play com cosméticos e um passe de batalha sazonal, e expandiu-se para modos como Fortnite Festival e LEGO Fortnite, consolidando-se como uma das plataformas de entretenimento mais lucrativas já criadas.',
        0.00, DATE '2017-07-25',
        '["Ação", "Battle Royale", "Multijogador", "Free to Play", "Epic Games", "Construção"]',
        '[]'
    ),
    (
        'Apex Legends', 'apex-legends',
        'Vinte esquadrões de Lendárias com habilidades únicas disputam a sobrevivência nas arenas de Kings Canyon e outros mapas do universo Titanfall.',
        'Vinte esquadrões de Lendárias com habilidades únicas disputam a sobrevivência nas arenas de Kings Canyon e outros mapas do universo Titanfall.' || E'\n\n' ||
        'Ambientado décadas após os eventos de Titanfall, o jogo situa a competição dentro do Circuito Apex, um espetáculo televisionado onde soldados, cientistas e simulacros lutam por fama e fortuna, revelando aos poucos suas motivações através de trailers cinematográficos e eventos sazonais.' || E'\n\n' ||
        'Cada Lendária carrega três habilidades exclusivas — tática, passiva e definitiva — que se combinam em sinergias de equipe, enquanto o sistema de pingar sem voz permite comunicação tática rápida, e mecânicas de movimento herdadas de Titanfall, como escalada e deslizamento, mantêm o ritmo de combate extremamente ágil.' || E'\n\n' ||
        'Desenvolvido pela Respawn Entertainment e publicado pela Electronic Arts, o jogo se consolidou como um dos principais nomes do gênero battle royale, sustentando um cenário competitivo global através da Apex Legends Global Series e atualizações constantes de novas Lendárias, armas e mapas.',
        0.00, DATE '2019-02-04',
        '["Ação", "FPS", "Battle Royale", "Multijogador", "Hero Shooter", "Free to Play"]',
        '[]'
    ),
    (
        'PUBG: BATTLEGROUNDS', 'pubg',
        'Cem jogadores saltam de um avião sobre ilhas isoladas em busca de armas, veículos e equipamentos, enquanto uma zona azul tóxica reduz o campo de batalha até restar um único sobrevivente.',
        'Cem jogadores saltam de um avião sobre ilhas isoladas em busca de armas, veículos e equipamentos, enquanto uma zona azul tóxica reduz o campo de batalha até restar um único sobrevivente.' || E'\n\n' ||
        'Popularizando o formato battle royale em escala massiva, o jogo não possui uma narrativa tradicional, mas constrói tensão através da imprevisibilidade de cada partida, onde encontros com outros jogadores podem significar sobrevivência ou eliminação instantânea em qualquer um dos diversos mapas ambientados em diferentes regiões do mundo.' || E'\n\n' ||
        'O looting realista, a balística de armas com queda de projétil e recuo pronunciado, e a necessidade de gerenciar veículos, coletes e curativos criam uma simulação de sobrevivência mais lenta e tática que rivais mais arcade, recompensando posicionamento cuidadoso e paciência acima de reflexos puros.' || E'\n\n' ||
        'Desenvolvido pela Krafton, o jogo é creditado por popularizar o gênero battle royale para o mainstream, migrando para o modelo free-to-play em 2022 e mantendo um cenário competitivo ativo através da PUBG Global Championship, além de expansões de mapas e modos ao longo dos anos.',
        0.00, DATE '2017-12-20',
        '["Ação", "FPS", "Battle Royale", "Multijogador", "Krafton", "Tático"]',
        '[]'
    ),
    (
        'The Last of Us Part I', 'the-last-of-us-part-1',
        'Joel Miller é contratado para escoltar Ellie, uma garota de 14 anos possivelmente imune à infecção fúngica que devastou a civilização, através dos Estados Unidos pós-apocalípticos.',
        'Joel Miller é contratado para escoltar Ellie, uma garota de 14 anos possivelmente imune à infecção fúngica que devastou a civilização, através dos Estados Unidos pós-apocalípticos.' || E'\n\n' ||
        'A jornada de Boston a outras regiões devastadas do país expõe Joel e Ellie a facções humanas tão perigosas quanto os infectados, enquanto o vínculo entre os dois se aprofunda diante de perdas e decisões morais que culminam em um dos finais mais discutidos da história dos games.' || E'\n\n' ||
        'O combate mistura furtividade, crafting de itens escassos e confrontos táticos contra clickers e outros infectados, exigindo gerenciamento cuidadoso de munição e recursos, enquanto a IA de Ellie e outros aliados reage dinamicamente às ações do jogador durante emboscadas e fugas.' || E'\n\n' ||
        'Refeito pela Naughty Dog para PlayStation 5, o remake reconstrói integralmente gráficos, animações faciais e sistemas de jogo baseados em Part II, sendo aclamado por elevar tecnicamente um dos títulos mais premiados da geração PlayStation 4 sem alterar sua narrativa original.',
        299.90, DATE '2022-09-02',
        '["Ação", "Aventura", "Sobrevivência", "Terror", "Naughty Dog", "Narrativa"]',
        '[]'
    ),
    (
        'Doki Doki Literature Club!', 'doki-doki-literature-club',
        'Ao entrar no clube de literatura da escola a convite de uma amiga de infância, o jogador conhece quatro garotas com personalidades cativantes em uma aparente visual novel romântica.',
        'Ao entrar no clube de literatura da escola a convite de uma amiga de infância, o jogador conhece quatro garotas com personalidades cativantes em uma aparente visual novel romântica.' || E'\n\n' ||
        'Sob a fachada de poesia, festivais escolares e conversas descontraídas, a trama revela gradualmente camadas psicológicas perturbadoras, subvertendo as expectativas do gênero através de quebras de quarta parede e elementos de terror psicológico que impactam diretamente a experiência do jogador.' || E'\n\n' ||
        'A escrita de poemas com escolha de palavras que refletem a afinidade com cada personagem é a principal mecânica de interação, enquanto o jogo manipula ativamente arquivos, interface e até mesmo a percepção de controle do jogador conforme a história avança para territórios mais sombrios.' || E'\n\n' ||
        'Desenvolvido pela pequena Team Salvato e liderado por Dan Salvato, o jogo é distribuído gratuitamente desde o lançamento, com uma versão expandida paga chamada Plus, tornando-se um fenômeno de culto por subverter o gênero visual novel com uma narrativa que permanece um dos maiores exemplos de terror psicológico independente.',
        0.00, DATE '2017-09-22',
        '["Aventura", "Terror", "Simulação", "Visual Novel", "Psicológico", "Indie"]',
        '[]'
    ),
    (
        'Horizon Forbidden West', 'horizon-forbidden-west',
        'Aloy parte rumo ao Oeste Proibido, uma terra selvagem repleta de máquinas ainda mais perigosas, em busca de respostas para uma praga misteriosa que ameaça toda a vida na Terra.',
        'Aloy parte rumo ao Oeste Proibido, uma terra selvagem repleta de máquinas ainda mais perigosas, em busca de respostas para uma praga misteriosa que ameaça toda a vida na Terra.' || E'\n\n' ||
        'A expedição revela mais sobre o colapso da civilização antiga que originou as máquinas, enquanto Aloy enfrenta tribos rivais, conspirações políticas e uma ameaça tecnológica que ultrapassa até mesmo o conhecimento acumulado desde os eventos do primeiro jogo.' || E'\n\n' ||
        'Novas armas, habilidades de escalada mais livres e a capacidade de planar e nadar em profundidades submersas expandem o combate tático contra máquinas, que agora contam com comportamentos em manada e novas fraquezas elementais para explorar através de armadilhas e componentes recuperados de suas partes mecânicas.' || E'\n\n' ||
        'Desenvolvido pela Guerrilla Games, o jogo expande a escala visual e narrativa do universo criado em Horizon Zero Dawn, sendo aclamado pela direção de arte vibrante, pela evolução do combate contra máquinas e pela atuação de Ashly Burch como Aloy, consolidando a franquia como um dos pilares exclusivos da PlayStation.',
        299.90, DATE '2022-02-18',
        '["Ação", "RPG", "Aventura", "Mundo Aberto", "Ficção Científica"]',
        '[]'
    ),
    (
        'Kandidatos', 'kandidatos',
        'Em meio a uma disputa eleitoral caricata, Kandidatos transforma a corrida presidencial brasileira em um verdadeiro ringue de boxe, onde carisma, deboche e golpes exagerados decidem quem vence cada round.',
        'Em meio a uma disputa eleitoral caricata, Kandidatos transforma a corrida presidencial brasileira em um verdadeiro ringue de boxe, onde carisma, deboche e golpes exagerados decidem quem vence cada round.' || E'\n\n' ||
        'O elenco reúne caricaturas afiadas de figuras públicas e políticos que dominaram o noticiário nacional nos últimos anos, cada uma com trejeitos, frases de efeito e bordões reconhecíveis transformados em golpes de combate, misturando humor ácido com uma estética escrachada tipicamente brasileira.' || E'\n\n' ||
        'As partidas acontecem em confrontos 1 contra 1 organizados em rounds dentro do ringue, com golpes e combos simples de aprender, mas que recompensam timing e leitura do adversário, favorecendo disputas rápidas e resenhas entre amigos mais do que a profundidade técnica de um jogo de luta tradicional.' || E'\n\n' ||
        'Desenvolvido pelo estúdio independente brasileiro Guaru Games sob a chancela BR, Kandidatos integra uma cena crescente de jogos de humor e sátira nacional, usando o absurdo da política brasileira como matéria-prima para o entretenimento.',
        0.00, NULL,
        '["Ação", "Luta", "Festa", "Indie", "Sátira", "Brasileiro"]',
        '[]'
    ),
    (
        'Persona 5 Royal', 'persona-5-royal',
        'Um estudante transferido para Tóquio após ser injustamente condenado assume a identidade de Joker e desperta o poder de invocar Personas, liderando os Ladrões Fantasmas de Coração.',
        'Um estudante transferido para Tóquio após ser injustamente condenado assume a identidade de Joker e desperta o poder de invocar Personas, dando início a uma dupla vida entre os estudos no colégio Shujin e as incursões dos Ladrões Fantasmas de Coração.' || E'\n\n' ||
        'Ao lado de um elenco de aliados que também descobrem seus próprios Personas, o protagonista invade Palácios distorcidos criados pela cognição de adultos corruptos, roubando seus "Tesouros" para forçar mudanças de coração e expor abusos de poder escondidos por trás da fachada da sociedade japonesa.' || E'\n\n' ||
        'O combate por turnos explora fraquezas elementais dos inimigos para encadear ataques All-Out, enquanto o cotidiano fora das masmorras é gerido em um calendário detalhado de relacionamentos (Confidants), estudos e atividades noturnas que fortalecem tanto as habilidades sociais quanto o poder das Personas do protagonista.' || E'\n\n' ||
        'Esta versão Royal, desenvolvida pela P-Studio e publicada pela Atlus, expande o Persona 5 original com um semestre inteiro adicional, a personagem Kasumi/Violet, o Palácio de Sae Niijima remodelado, a área social Thieves Den e o professor Takuto Maruki, sendo amplamente considerada a versão definitiva da aclamada aventura urbana da série Persona.',
        299.90, DATE '2019-10-31',
        '["RPG", "Aventura", "Turnos", "JRPG", "Anime", "Atlus"]',
        '[]'
    )
) AS g(titulo, slug, descricao_curta, descricao_longa, preco, data_lancamento, tags_json, atualizacoes_json)
WHERE u.email = 'catalog@nekobox.local'
ON CONFLICT (slug) DO NOTHING;

-- Remove fotos desatualizadas (URLs antigas da Steam/picsum.photos ou capas provisórias) de
-- jogos que já foram semeados anteriormente, para permitir a reinserção abaixo com as URLs
-- corretas. O INSERT de fotos é idempotente via WHERE NOT EXISTS(produto_id, tipo, posicao) e
-- por isso não substitui uma foto já existente nesse par (tipo, posicao); apagar as linhas
-- desatualizadas é o que garante a correção também em bancos já semeados.
DELETE FROM fotos f
USING produtos p
WHERE f.produto_id = p.id
  AND (
    (p.slug = 'cyberpunk-2077' AND f.tipo IN ('cover', 'banner', 'screenshot')) OR
    (p.slug = 'the-witcher-3' AND f.tipo IN ('banner', 'screenshot')) OR
    (p.slug = 'red-dead-redemption-2' AND f.tipo IN ('cover', 'banner', 'screenshot')) OR
    (p.slug = 'elden-ring' AND f.tipo IN ('banner', 'screenshot')) OR
    (p.slug = 'hollow-knight' AND f.tipo IN ('banner', 'screenshot')) OR
    (p.slug = 'hades' AND f.tipo IN ('banner', 'screenshot')) OR
    (p.slug = 'stardew-valley' AND f.tipo IN ('banner', 'screenshot')) OR
    (p.slug = 'celeste' AND f.tipo IN ('banner', 'screenshot')) OR
    (p.slug = 'minecraft' AND f.tipo IN ('cover', 'banner', 'screenshot')) OR
    (p.slug = 'doki-doki-literature-club' AND f.tipo = 'poster')
  );

-- Corrige preços de jogos que já foram semeados anteriormente com valores provisórios (0.00).
UPDATE produtos p
SET preco = corrigido.preco
FROM (VALUES
    ('doki-doki-literature-club', 39.90),
    ('assassins-creed-black-flag-remake', 349.90),
    ('call-of-duty-modern-warfare-4', 349.90),
    ('arc-raiders', 249.90),
    ('marvels-wolverine', 0.00)
) AS corrigido(slug, preco)
WHERE p.slug = corrigido.slug AND p.preco <> corrigido.preco;

INSERT INTO fotos (produto_id, url, tipo, posicao)
SELECT p.id, f.url, f.tipo, f.posicao
FROM produtos p
JOIN (VALUES
    ('cyberpunk-2077', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/bxSj4jO0KBqUgAbH3zuNjCje_hnuhwb.avif', 'cover', 1),
    ('cyberpunk-2077', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806003/UjQ1pWQiHwymgQQ6q4pWQkMC_nlek1l.avif', 'banner', 1),
    ('cyberpunk-2077', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976540/cyber_qoorlm.avif', 'poster', 1),
    ('cyberpunk-2077', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/4afa4359de58e6c1fe2509b0bf19c3dded734f5d9f7be0ed_t4fubo.avif', 'screenshot', 1),
    ('cyberpunk-2077', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PT2qWfNzcGncIlTB0SlzFYY9_loktv2.avif', 'screenshot', 2),
    ('cyberpunk-2077', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806002/To8WFTjfrMQtrX63D0GoCNRj_x4ujy6.avif', 'screenshot', 3),
    ('cyberpunk-2077', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806002/SWnz126faKV0CbPOVzCk2R3M_bsyghl.avif', 'screenshot', 4),

    ('the-witcher-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307423/3f7ee6aa3482b514bd443e116022b038a9728f017916ed37da3f09f731a7d5f2_oql09m.jpg', 'cover', 1),
    ('the-witcher-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/IW5r8hLVZzf0ApOyiOuRnKUe_cvfqcd.jpg', 'banner', 1),
    ('the-witcher-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976541/witcher_hmrpgu.avif', 'poster', 1),
    ('the-witcher-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805987/5DSZkROrbrlYN2PXGfDGedeM_wbjrnr.avif', 'screenshot', 1),
    ('the-witcher-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805997/iFujqkGQJZKBGjpw1kgAkjWe_flr6bl.avif', 'screenshot', 2),
    ('the-witcher-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/mfy0530smBKbptFC5oEIaEyi_lwpbw9.avif', 'screenshot', 3),

    ('red-dead-redemption-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/Hpl5MtwQgOVF9vJqlfui6SDB5Jl4oBSq_uweazv.jpg', 'cover', 1),
    ('red-dead-redemption-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806004/WyHa1BM3ISDVqYSEUMB9VZJs_bfe8u8.avif', 'banner', 1),
    ('red-dead-redemption-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976351/red_ctn8d7.avif', 'poster', 1),
    ('red-dead-redemption-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/PREVIEW_SCREENSHOT1_166081_kvyqms.avif', 'screenshot', 1),
    ('red-dead-redemption-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806000/PREVIEW_SCREENSHOT4_166081_c0bi3q.avif', 'screenshot', 2),
    ('red-dead-redemption-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT5_166081_lravql.avif', 'screenshot', 3),
    ('red-dead-redemption-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT7_166081_rq0mxs.avif', 'screenshot', 4),
    ('red-dead-redemption-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT10_166081_djlfoi.avif', 'screenshot', 5),
    ('red-dead-redemption-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT8_166081_f45khu.avif', 'screenshot', 6),
    ('red-dead-redemption-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT9_166081_kounmg.avif', 'screenshot', 7),

    ('elden-ring', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307550/ER-collection-2000x1125-780428_igoswx.png', 'cover', 1),
    ('elden-ring', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/M2IBVSWR2ao2oHizClzsUaYL_ksajdf.webp', 'banner', 1),
    ('elden-ring', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976545/elden_ybyqim.webp', 'poster', 1),
    ('elden-ring', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805986/1fdf69c57c1ef3af7e137bf260510354b59870e71f7a6e8b_wwdkvv.avif', 'screenshot', 1),
    ('elden-ring', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805987/5c4a4ddd38c9db0fb0a0cf7c3cddee592c83bc7b180f9267_u20rae.avif', 'screenshot', 2),
    ('elden-ring', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805989/8dcbe67db4fe71d7cb71d0855ec2e5864fdeae7f177b884c_mzlryu.avif', 'screenshot', 3),
    ('elden-ring', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805991/335fda4e507ce5de650984ddd1638c45dc87c74c24ec8c24_rrfqqv.avif', 'screenshot', 4),
    ('elden-ring', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805991/621d598da03399e9788e3028aed34b9df33115e2156102fe_sitfsr.avif', 'screenshot', 5),
    ('elden-ring', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805993/a7a3c819e53f1427fa90f3062217bb6268696a0ebde47539_m3uosh.avif', 'screenshot', 6),
    ('elden-ring', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805997/fe7053cb00f45f480737a5cc170fc3f1e9ec47aca48c2475_d9llbk.avif', 'screenshot', 7),

    ('hollow-knight', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307583/1-tgg1vtswva_vdhblc.png', 'cover', 1),
    ('hollow-knight', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805990/91d47e238a9e2cb5f33e10e4b54c911b4beaafcad3e14a9e_kzsgie.avif', 'banner', 1),
    ('hollow-knight', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976547/hollow_fij6gq.avif', 'poster', 1),
    ('hollow-knight', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805986/4ea721a23a20b67707fbf5d69b39a305c4e1d6d320800576_oavrkh.avif', 'screenshot', 1),
    ('hollow-knight', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805989/14c9dd1071f9c112cd2463c0b097ffdf2c59f21c655459e6_mbggf1.avif', 'screenshot', 2),
    ('hollow-knight', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805993/9937901dc35fe88cc2c947b1eecdb3f9f186ca64269273d8_nfqhlc.avif', 'screenshot', 3),
    ('hollow-knight', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805993/a9dbdffcbcd942f97bd1e4418ed250d49f556bc514c80cb2_ddfwod.avif', 'screenshot', 4),
    ('hollow-knight', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805996/e4e40255c4cef4f9d83e220441cc794bbc49bd9029e3deae_h4skxd.avif', 'screenshot', 5),
    ('hollow-knight', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805996/f68bed187022f0acb95a1945199f1370a3f332bbe78b1ea0_zcqivj.avif', 'screenshot', 6),

    ('hades', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307889/hades_bw1hy6.webp', 'cover', 1),
    ('hades', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806002/pYyqTYA34U1a7hv6BCrqgc24_zypcq1.webp', 'banner', 1),
    ('hades', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976543/hades_fk6xfc.webp', 'poster', 1),
    ('hades', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805990/327fb169e7af8eb759a72c0aba917194451047e1b3776758_z1lsp5.avif', 'screenshot', 1),
    ('hades', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/CWACHJZ2R8OoZp52SH1UqlXl_qh0pwd.avif', 'screenshot', 2),
    ('hades', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805997/h1Tmq8oRqHn1Hiyh8OozLpTi_omuiu9.avif', 'screenshot', 3),
    ('hades', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805997/htIpeQrsndcAUvsQFcUnwlxQ_gzvngm.avif', 'screenshot', 4),
    ('hades', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/nFLj8gGhCcJnSnUeK06Ns8qe_ae7hal.avif', 'screenshot', 5),

    ('stardew-valley', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307843/tile_wayfij.webp', 'cover', 1),
    ('stardew-valley', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806003/yPmlPNe9extT2AVsv90hOKmn_np3zpb.avif', 'banner', 1),
    ('stardew-valley', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976351/stardew_f9oz6e.avif', 'poster', 1),
    ('stardew-valley', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/PREVIEW_SCREENSHOT2_130501_jjz4a1.avif', 'screenshot', 1),
    ('stardew-valley', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307126/PREVIEW_SCREENSHOT1_130501_oyorel.avif', 'screenshot', 2),
    ('stardew-valley', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307124/PREVIEW_SCREENSHOT3_130501_etm5sw.avif', 'screenshot', 3),
    ('stardew-valley', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307124/PREVIEW_SCREENSHOT4_130501_nmxigj.avif', 'screenshot', 4),

    ('celeste', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786308111/apps.21257.71633162879241707.7cf18b3b-9fa5-486f-9a68-067f06d50bf1_iovi27.jpg', 'cover', 1),
    ('celeste', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805997/hgqlI1LTcsd6zuL7YWVLQ8d00jkBmtCg_pdm532.avif', 'banner', 1),
    ('celeste', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976351/celeste_lrby4w.avif', 'poster', 1),
    ('celeste', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806000/PREVIEW_SCREENSHOT2_161659_izqbbu.avif', 'screenshot', 1),
    ('celeste', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806000/PREVIEW_SCREENSHOT3_161659_nuwcy3.avif', 'screenshot', 2),
    ('celeste', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307117/PREVIEW_SCREENSHOT4_161659_lb0f3q.avif', 'screenshot', 3),
    ('celeste', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307117/PREVIEW_SCREENSHOT5_161659_brobqd.avif', 'screenshot', 4),
    ('celeste', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307116/PREVIEW_SCREENSHOT6_161659_nt0hog.avif', 'screenshot', 5),

    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805994/aeb816655b966f6e96a0fc4929afba02da754badf872f10f_zzjj6k.avif', 'cover', 1),
    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/907bba0da07662df166e58a65ef6fff1c23439ae11c31db7_vecwuu.avif', 'banner', 1),
    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976539/Marvel_Rivals_ogypwa.avif', 'poster', 1),
    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/7ca0dd31fecc5a0263171dc1ac1ea6befc8c68a65cbf6ed1_xzjqag.avif', 'screenshot', 1),
    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805989/034f754b52a25a00736af4b882a9c6d26246dc634b36c62d_n6njhn.avif', 'screenshot', 2),
    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/1497203e1cb92ca05a9aba5f9f945123509dbe98bbc319b3_vtgs7z.avif', 'screenshot', 3),
    ('marvel-rivals', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805994/beca58d8d8c64b5f874bf722b0852eb91844fc165a740402_h8rufp.avif', 'screenshot', 4),

    ('halo-campaign-evolved', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805993/a0d52445fcb5d96d66a361b6759d1b8b959c4644cea70714_zvkgj3.avif', 'cover', 1),
    ('halo-campaign-evolved', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/5102f2929b3357cb4af79022f4fc2234fc5756710947e91a_edmtif.avif', 'banner', 1),
    ('halo-campaign-evolved', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976352/halo_iijmgv.avif', 'poster', 1),
    ('halo-campaign-evolved', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/7f525c8831b83edd4443bab95a5daae307ef2da814d7b398_ainlx7.avif', 'screenshot', 1),
    ('halo-campaign-evolved', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805993/7808104862aafa9eede3c8eaacc204b5ac8245d97cf90668_mgdr2d.avif', 'screenshot', 2),
    ('halo-campaign-evolved', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/afba6274e85aa8de25cbb7f07409bab9f87e37d61ffc08c0_cpvtdj.avif', 'screenshot', 3),
    ('halo-campaign-evolved', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805996/e3cf56087f2010c33bde8a30b68f57948f2bc8e1dc819980_z6svhv.avif', 'screenshot', 4),

    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786308164/mixcollage-21-dec-2024-12-41-pm-2315_aggsbe.jpg', 'cover', 1),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/brIXKBE5BqYgBSrsDn6Wo18O_gv8k0f.avif', 'banner', 1),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976352/demons_souls_h4tlbj.webp', 'poster', 1),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/lK4tpxDNLfOxHly1yE5ceKNt_aule4d.avif', 'screenshot', 1),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/NE92EYZjGR8hU8ZcNDgEYEX1_dfe44s.avif', 'screenshot', 2),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805998/p3BNVCDOeLpb3bWAptk2Hi2t_xzqj7q.avif', 'screenshot', 3),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/OtTU8V9BfVqiy4jp0QhHp8ad_m7hywr.avif', 'screenshot', 4),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806002/s1gIFpXqw8t18gzshEHkv8r2_x4msa4.avif', 'screenshot', 5),
    ('demons-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806002/sYFQ266gczqGyso9d8PjJ1Al_xxozqy.avif', 'screenshot', 6),

    ('baldurs-gate-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786311758/apps.11593.13550459053619040.9c555c73-a698-4992-b0f3-c5084cf18b5e_dkikhk.jpg', 'cover', 1),
    ('baldurs-gate-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305796/95cce955dc59d04e2ea5ab624a823ace14e9c5f7e24dfb8f_qvelus.avif', 'banner', 1),
    ('baldurs-gate-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305795/ba706e54d68d10a0eb6ab7c36cdad9178c58b7fb7bb03d28_ky0gxn.avif', 'poster', 1),
    ('baldurs-gate-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305796/cf4d6784b45e8821ece8399d310738a386052aba91098a7c_ogmqyn.avif', 'screenshot', 1),
    ('baldurs-gate-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305796/09e502a2ce6e26469b1f4c5bf332f2006340f92c51c969f5_evsyrq.avif', 'screenshot', 2),
    ('baldurs-gate-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305795/5370c71dc10127345d99c8e59b4b568458fa0147f660368b_e3b1ff.avif', 'screenshot', 3),
    ('baldurs-gate-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305796/560cfc1d960830ff98de6015f961cab01ab881985c7bb541_hnlmrl.avif', 'screenshot', 4),

    ('gta-5', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305802/gtavcover_ymqnr8.avif', 'cover', 1),
    ('gta-5', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305802/bZ1JTRXzoyl3hkcsloKcCgdBGTAV_banner_vthhn4.webp', 'banner', 1),
    ('gta-5', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305802/oltI7Zc96usbdvhVVXcV1EAigtasquare_epfps5.webp', 'poster', 1),
    ('gta-5', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305801/8kNkdvIIbW8YCoFQkv5tdVU5_lhfnid.avif', 'screenshot', 1),
    ('gta-5', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305801/4aX03Zu8ocLyP0bQui1AiKcotpPFgPeAv6YWMBUg51YyZcdv_yncrrm.avif', 'screenshot', 2),
    ('gta-5', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305801/tpPFgPeAv6YWMBUg51YyZcdv_s158c2.avif', 'screenshot', 3),
    ('gta-5', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305801/DogIYjDGyXPn1vI4a62P5XN3_c32dge.avif', 'screenshot', 4),
    ('gta-5', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305800/WGP58ZYx9ZjS816Ksjm3fgNR_tk41cy.avif', 'screenshot', 5),

    ('grand-theft-auto-vi', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307693/GTA-VI-article-image-illustration-2_mfoij4.webp', 'cover', 1),
    ('grand-theft-auto-vi', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/1c8e3e304f0bad2d99ffed828ad460ebe5949608cb82a5dd_veylsj.avif', 'banner', 1),
    ('grand-theft-auto-vi', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976548/gtavi_rerqc6.avif', 'poster', 1),
    ('grand-theft-auto-vi', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805986/1b1bb3a94bbd1a8a4e7514763d016f510e24247b4d864ff6_iwulpc.avif', 'screenshot', 1),
    ('grand-theft-auto-vi', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805986/5d18cf5f59260666abe5029f450ba2b5a61d996b0503e1fc_xz5tmd.avif', 'screenshot', 2),
    ('grand-theft-auto-vi', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805987/6e2a7c7eb29de1f04c32820823f66858fbc3d9ab9adf88a9_pojfdm.avif', 'screenshot', 3),
    ('grand-theft-auto-vi', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805991/3139bd312f0bfb208738dc2b752d17c3fb9d4ad50c2c25aa_bfz13y.avif', 'screenshot', 4),
    ('grand-theft-auto-vi', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/9106bb2a9b8835b8f617c892edbbe46312cb2e0e3d16b480_wdaqos.avif', 'screenshot', 5),

    ('call-of-duty-modern-warfare-4', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786311695/16x9_CallOfDutyModernWarfare4_image1600w_ky8hid.jpg', 'cover', 1),
    ('call-of-duty-modern-warfare-4', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805991/972f277c6ca05ffd7b4f290ba34ebc0131bffc73e2a7548d_fpyvv4.avif', 'banner', 1),
    ('call-of-duty-modern-warfare-4', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976542/modernwar4_nsgjew.avif', 'poster', 1),
    ('call-of-duty-modern-warfare-4', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805987/6d9d0cb6602f3eb2b655e202e9b7b68114ff74505a20575e_vvrkfq.avif', 'screenshot', 1),
    ('call-of-duty-modern-warfare-4', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/6efef757dc2f5c06c3ffa95871cc5fc94523ee2739043c83_cbgblf.avif', 'screenshot', 2),
    ('call-of-duty-modern-warfare-4', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805994/ade65b9e9216d88cb89f864f445e52b5f3d7a6b6ae57b0ff_tfo9yq.avif', 'screenshot', 3),
    ('call-of-duty-modern-warfare-4', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/d21a425ed8dfc7ca0731b593de37ea8de40ee6c4b4d93891_rie37m.avif', 'screenshot', 4),

    ('elden-ring-nightreign', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307466/Elden-Ring-Nightreign-290525_l46qa4.png', 'cover', 1),
    ('elden-ring-nightreign', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805994/b21fc6bafea0353ad8578dec61cd2690020b615f161c416e_mbr7zx.avif', 'banner', 1),
    ('elden-ring-nightreign', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976545/night_aiiepe.avif', 'poster', 1),
    ('elden-ring-nightreign', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805986/1d7f60c58f6efbe48079d1ff8773c49c32c341c9ae992e0f_iqljbz.avif', 'screenshot', 1),
    ('elden-ring-nightreign', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/7a8b663566237f74b48758e7faba85ff9e3f565178e82253_liyraa.avif', 'screenshot', 2),
    ('elden-ring-nightreign', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805989/45e68fda0fcfe7fe3523b5012ab9af14e88db2a1387388af_lhnoth.avif', 'screenshot', 3),
    ('elden-ring-nightreign', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805989/75caece2da1c88c118907670406d83b6d29a73869f9426fe_grre7z.avif', 'screenshot', 4),
    ('elden-ring-nightreign', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805990/109df616efc3f73a6de74967928346e6b891ec31c3952c5c_adb82h.avif', 'screenshot', 5),
    ('elden-ring-nightreign', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805997/fe69b66a0f2e238fa1b2577fac5681733bc69fc2849ceac3_u1nplv.avif', 'screenshot', 6),
    ('elden-ring-nightreign', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT7_109885_ywf51r.avif', 'screenshot', 7),

    ('eldest-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786308050/apps.29240.14189158524560144.27914bed-e8a1-42b9-ae1b-8794ad1be952_mkzgps.jpg', 'cover', 1),
    ('eldest-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/bOtJXHmvkx4iJCU21kFH1APZ_fdg4da.avif', 'banner', 1),
    ('eldest-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976544/eldest_c72xw6.webp', 'poster', 1),
    ('eldest-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805986/1sUjGLkgvlBbb6EU1egjgoYS_w1tnog.avif', 'screenshot', 1),
    ('eldest-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/7nyQkp1Pe6bHcri1T3LI0OYy_myivul.avif', 'screenshot', 2),
    ('eldest-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806002/R5uwFp2MAdNDWGRCxUlZWDNy_zg8xex.avif', 'screenshot', 3),
    ('eldest-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307121/u9BXvSZftbLJ1w8ZaESMS4lc_lertnd.avif', 'screenshot', 4),
    ('eldest-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307121/n1xiZhfikaSgmMqpcqlwKRdu_j0489t.avif', 'screenshot', 5),

    ('hades-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786308084/MV5BYmU1MzVkYjMtNmI2Ny00NWQzLWE5MjQtZTIzNzgzMGY3ODEyXkEyXkFqcGc._V1_FMjpg_UX1000__qqr7sl.jpg', 'cover', 1),
    ('hades-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805990/93f66b17d66159f2a06f2f001b0e28cb485b524c9204797b_pqwyv8.avif', 'banner', 1),
    ('hades-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976543/hades2_aexewa.avif', 'poster', 1),
    ('hades-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805986/1ddcec87d4be70acd848473572c14128024db5786ec46ee7_l3yyss.avif', 'screenshot', 1),
    ('hades-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805987/2dff06b0be12903fbddbc2bd578bcdbe6136730ec2e18bac_ahtvuf.avif', 'screenshot', 2),
    ('hades-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805989/08c5b674ef49cc0139791254f2ca1528a8239c3922842621_qp0qwg.avif', 'screenshot', 3),
    ('hades-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806002/raGBM82s7S5GfCR1Kjh9eSop_vyeay0.avif', 'screenshot', 4),
    ('hades-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307120/05f26dcb60585da07389c6f27345e665646a226a84ec5ded_knlk50.avif', 'screenshot', 5),
    ('hades-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307119/fd064d78bf3f585e10e51be3d652c7a5f83cf9763e22b24a_wkos5n.avif', 'screenshot', 6),

    ('god-of-war-ragnarok', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786308241/God_of_War_Ragnar_C3_B6k_capa.jpg_cajyo5.jpg', 'cover', 1),
    ('god-of-war-ragnarok', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305791/1f4bf1ee42276b3841e71ebb812510493ce78bfc307d3296_qdf1d2.avif', 'banner', 1),
    ('god-of-war-ragnarok', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305767/P8AN9kNfSJtfSx0PmlT93mnN_g2ooq8.avif', 'poster', 1),
    ('god-of-war-ragnarok', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305790/NbH8trRlNM7tXO8cPm4Bfkew_zsdw8i.avif', 'screenshot', 1),
    ('god-of-war-ragnarok', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305790/bs47a1TJb585Z0MtRQKRW5er_wvl1sy.avif', 'screenshot', 2),
    ('god-of-war-ragnarok', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305790/WERD9QwOeuJ257snQnLhOob8_nrudgg.avif', 'screenshot', 3),
    ('god-of-war-ragnarok', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305790/gjZf7QAeZ195d7KKPVHLM6QU_thszqc.avif', 'screenshot', 4),
    ('god-of-war-ragnarok', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305790/MYG8s9nxUeFtDiAKaxvkRzwF_jdmm7b.avif', 'screenshot', 5),
    ('god-of-war-ragnarok', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305789/IPb3Z7rbbC39jXRVTIgM1vcw_axcqd4.avif', 'screenshot', 6),

    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786308192/images_wcxjkm.jpg', 'cover', 1),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806003/zA0pyOR4JXOtGGIY7Jp2FJZP_p8ismg.avif', 'banner', 1),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976351/darksouls_a2x95o.jpg', 'poster', 1),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/PREVIEW_SCREENSHOT1_77921_ayuygk.avif', 'screenshot', 1),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/PREVIEW_SCREENSHOT2_77921_cmp1ja.avif', 'screenshot', 2),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/PREVIEW_SCREENSHOT1_109885_q6jtln.avif', 'screenshot', 3),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805999/PREVIEW_SCREENSHOT2_109885_jrb8ao.avif', 'screenshot', 4),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806000/PREVIEW_SCREENSHOT3_77921_naxrf1.avif', 'screenshot', 5),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806000/PREVIEW_SCREENSHOT3_109885_fhkz2m.avif', 'screenshot', 6),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT4_77921_kmqse4.avif', 'screenshot', 7),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT5_77921_twukh5.avif', 'screenshot', 8),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806000/PREVIEW_SCREENSHOT4_109885_h1vtbg.avif', 'screenshot', 9),
    ('dark-souls-3', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785806001/PREVIEW_SCREENSHOT6_77921_oxg56e.avif', 'screenshot', 10),

    ('god-of-war', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305791/LsaRVLF2IU2L1FNtu9d3MKLq_bpzydt.avif', 'cover', 1),
    ('god-of-war', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305793/KAmUQWQ5V9QF3XDzmty1VkKj_xdyurb.avif', 'banner', 1),
    ('god-of-war', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305742/ax0V5TYMax06mLzmkWeQMiwH_q3xbhp.jpg', 'poster', 1),
    ('god-of-war', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305793/PREVIEW_SCREENSHOT1_152721_fstpqi.avif', 'screenshot', 1),
    ('god-of-war', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305793/PREVIEW_SCREENSHOT2_152721_qjekvt.avif', 'screenshot', 2),
    ('god-of-war', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305792/PREVIEW_SCREENSHOT6_152721_kqxrsm.avif', 'screenshot', 3),
    ('god-of-war', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305792/PREVIEW_SCREENSHOT3_152721_iexyqu.avif', 'screenshot', 4),
    ('god-of-war', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305792/PREVIEW_SCREENSHOT5_152721_efdxw6.avif', 'screenshot', 5),
    ('god-of-war', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305791/PREVIEW_SCREENSHOT7_152721_bwzyyz.avif', 'screenshot', 6),
    ('god-of-war', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305791/PREVIEW_SCREENSHOT8_152721_pulnjf.avif', 'screenshot', 7),

    ('gang-beasts', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307619/apps.35593.68150164172276526.ddc374d7-ef5e-43b9-940a-bbc04440bb33_k0tho9.jpg', 'cover', 1),
    ('gang-beasts', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305795/pXC7nJzBiN8m9VswrBZUid4S_fak1wy.webp', 'banner', 1),
    ('gang-beasts', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307127/DaMDXP75LV9pti5nA2IALzhO_qxi3ul.webp', 'poster', 1),
    ('gang-beasts', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305795/2kZcm1OOdNpBufLRjkzZtfnv_ml6lmi.avif', 'screenshot', 1),
    ('gang-beasts', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305795/1h3ap4ZwW7zYZXgBnTSSJdoC_ohrrxa.avif', 'screenshot', 2),
    ('gang-beasts', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305794/q4Exwcr9q3dnb4lNkV9DcXF3_geinzf.avif', 'screenshot', 3),
    ('gang-beasts', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305794/243vNOrtYaXTTY1gXInkUuk4_uwmxgq.avif', 'screenshot', 4),
    ('gang-beasts', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305793/icmz1iQRCSUOYlrqPMuAyxX3v_hqburc.avif', 'screenshot', 5),
    ('gang-beasts', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305793/LdmZRQDHjacJkU7jGNwNkSqD_aneupy.avif', 'screenshot', 6),

    ('metal-gear-solid-delta', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786308021/13093424477046.jpg_ojghav.jpg', 'cover', 1),
    ('metal-gear-solid-delta', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305800/40644e8efe1a34b361adcd5d22283444e0ee12fcf9783479_qojrlt.avif', 'banner', 1),
    ('metal-gear-solid-delta', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307123/d35b305652ee922a72b4020bd5d6ef36675cf526dd4945d1_uxxixv.avif', 'poster', 1),
    ('metal-gear-solid-delta', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305800/46104018b61828982144fb4143fa22feb8af8dd3b6928557_bgdzj0.avif', 'screenshot', 1),
    ('metal-gear-solid-delta', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305800/17ebc3943be34b5f2939be89cbe0224cb6497b6f0de6cbe1_jmu6fw.avif', 'screenshot', 2),
    ('metal-gear-solid-delta', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305800/7c1a55246937ca9cd0b97f27406b160ed12ab1ecf3e40f5e_r2dcap.avif', 'screenshot', 3),
    ('metal-gear-solid-delta', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305799/00ca61180b5be75e30a03cdf988c8b03b7687da9a8a8c6f6_ungxmi.avif', 'screenshot', 4),
    ('metal-gear-solid-delta', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305799/f710e938347567ceb9410d36f17f137ff20bddff078afdcb_tmu5uy.avif', 'screenshot', 5),
    ('metal-gear-solid-delta', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305799/3db1a8c5dfb382d18c48dae2af54f60b84a897a987b3727d_km1lns.avif', 'screenshot', 6),
    ('metal-gear-solid-delta', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307122/6a7ce4bfb6e642c717dd8a56817ce6dfe1636a285664bed6_anzgne.avif', 'screenshot', 7),

    ('days-gone-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305797/a2fa690381bb625c8efca0bbd5210811b9e044ed6f116ab8_qbwkuk.avif', 'cover', 1),
    ('days-gone-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305798/cdf6431ee3f30fde3c13b42857d41edc42142da11e1bdc61_a0hd1p.avif', 'banner', 1),
    ('days-gone-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305797/a2fa690381bb625c8efca0bbd5210811b9e044ed6f116ab8_qbwkuk.avif', 'poster', 1),
    ('days-gone-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305798/fd748611c48677afcef1bc86f54f434975725490922037f3_toqxn8.avif', 'screenshot', 1),
    ('days-gone-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305798/07e3cbc0ef39ec3a4bd862ac25688ae528dea1ef1c9a32b5_ajnpdy.avif', 'screenshot', 2),
    ('days-gone-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305798/ff80f7cceea59534c7ed676b383ce6c3d954d98cea2045fd_uvzuvf.avif', 'screenshot', 3),
    ('days-gone-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305798/0c0e0fc330d42c94fc1dfdce600a693177a33812990df571_jge15q.avif', 'screenshot', 4),
    ('days-gone-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305797/50c5441b6bada7aad6327618ce0436150616cc9babe17de7_pl1kvr.avif', 'screenshot', 5),
    ('days-gone-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305797/58917f6cb6f4d55d427957ccfa73b3c1207a612bb91a138d_di8vua.avif', 'screenshot', 6),
    ('days-gone-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305797/15d0b8414e37a40eb61a53f6bead755ef704e1699bd9eecf_j5embw.avif', 'screenshot', 7),

    ('god-of-war-3-remastered', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786311858/god-of-war-iii-remastered-playstation-4-playstation-store-cover_pwfqj1.jpg', 'cover', 1),
    ('god-of-war-3-remastered', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305742/qKv4pRqoGFvnoUKyDSLg17ne_b1kv5w.avif', 'banner', 1),
    ('god-of-war-3-remastered', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786311858/god-of-war-iii-remastered-playstation-4-playstation-store-cover_pwfqj1.jpg', 'poster', 1),
    ('god-of-war-3-remastered', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305741/gow3_8_jgxx0b.avif', 'screenshot', 1),
    ('god-of-war-3-remastered', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305741/gow3_2_rryxoj.avif', 'screenshot', 2),
    ('god-of-war-3-remastered', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305741/gow3_9_svji1w.avif', 'screenshot', 3),
    ('god-of-war-3-remastered', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305741/gow3_4_smqccd.avif', 'screenshot', 4),

    ('battlefield-6', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305739/aa972ae00b4f52514faa64d6626c43fe92ca880b250fa485_pzozlf.avif', 'cover', 1),
    ('battlefield-6', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305740/499e810a69aecf9bca5e65daa391ad9fb212b6d17bd230a3_c0f3y0.avif', 'banner', 1),
    ('battlefield-6', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305739/aa972ae00b4f52514faa64d6626c43fe92ca880b250fa485_pzozlf.avif', 'poster', 1),
    ('battlefield-6', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305740/1dc001a065e8494cff98c986044363bcd2702a6c7442f926_cdkng0.avif', 'screenshot', 1),
    ('battlefield-6', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305739/16e87f0ace49b69774dd829c279fcf032eb21927818f1473_pk8sg8.avif', 'screenshot', 2),
    ('battlefield-6', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305739/4b0674c633720a66d0811adf557162b98cd4011aeb06df4b_xalylg.avif', 'screenshot', 3),
    ('battlefield-6', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305739/6193a0bab1b1fda68f517e52958143437f77c12a3db2e05b_inand9.avif', 'screenshot', 4),
    ('battlefield-6', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305738/0fc79385f4b9aeb80608dfc229ad0bbcc45ed783eaae7a2a_oudxi3.avif', 'screenshot', 5),
    ('battlefield-6', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305738/82d15c5c148aae2906c24f414447fac0c36d5736fe0e53d9_webkpi.avif', 'screenshot', 6),
    ('battlefield-6', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305738/5be2e3f9827b6c838807c1c7716b3acd9b57cc299c5960cc_euobtj.avif', 'screenshot', 7),

    ('doom-the-dark-ages', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/bb3f89ae3425f3aa86041ff71646fc5d44d7705f3a383427_q7twzo.avif', 'cover', 1),
    ('doom-the-dark-ages', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305738/9cce1948120d31351ecd5d9715fffe9ffc0041be81767b45_nvrzgr.avif', 'banner', 1),
    ('doom-the-dark-ages', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/bb3f89ae3425f3aa86041ff71646fc5d44d7705f3a383427_q7twzo.avif', 'poster', 1),
    ('doom-the-dark-ages', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305737/6e2b6c98d0288a93def5d186504a68efc2860c7a8262ed20_lhytwa.avif', 'screenshot', 1),
    ('doom-the-dark-ages', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305737/b2f73f8185e0deda697df52f80091ae99199fb19fdcbbf46_wfeijq.avif', 'screenshot', 2),
    ('doom-the-dark-ages', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305737/78ee91a3dc2ac0f05e2eabaab691eab94e8546be8e860747_csjdng.avif', 'screenshot', 3),
    ('doom-the-dark-ages', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305737/5ba37b7c0954394dad1584b6bacce62526e6b18db8ce6136_jdtk3k.avif', 'screenshot', 4),
    ('doom-the-dark-ages', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/be7fe0044a833ab346a55daca3cc439fd7a70ccc80a34c9c_ajkyub.avif', 'screenshot', 5),
    ('doom-the-dark-ages', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/d6f20a4679ef37b1f0e06444499a89fc2699dada89f91ac1_wsya63.avif', 'screenshot', 6),

    ('demon-slayer-hinokami-chronicles', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786308270/2ZfAUG5CTXdM34S1OhmMW1zF_yfq4sm.jpg', 'cover', 1),
    ('demon-slayer-hinokami-chronicles', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/9b8b59b311dd2d8555f7d3a862369e888c2ebcd389ca88d2_cxm2kh.avif', 'banner', 1),
    ('demon-slayer-hinokami-chronicles', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786307116/JzL1NLQvok7Pghe9W5PP2XNV_wflum1.jpg', 'poster', 1),
    ('demon-slayer-hinokami-chronicles', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/ddfc7334f0360433a48686cf67ed8f5bd0ba4d4fa5a60d4b_jcjabc.avif', 'screenshot', 1),
    ('demon-slayer-hinokami-chronicles', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/58ef9804d2fe7d273e0e40ac1f7d09ebaff15fccebbed785_znxhig.avif', 'screenshot', 2),
    ('demon-slayer-hinokami-chronicles', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/eb4ce78fc4ffada1440240b1e15870a42daeeb1999cd75f6_unpzka.avif', 'screenshot', 3),
    ('demon-slayer-hinokami-chronicles', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786305736/8b870159336a620e3ba8ae5150508c038cb99c8e684b2c8e_pcgp9d.avif', 'screenshot', 4),

    ('hollow-knight-silksong', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/9396dc04cc0161e5a17f8775402f2c3afdcb5d8043a7ebf8_ielpmn.avif', 'cover', 1),
    ('hollow-knight-silksong', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/9396dc04cc0161e5a17f8775402f2c3afdcb5d8043a7ebf8_ielpmn.avif', 'banner', 1),
    ('hollow-knight-silksong', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976546/silk_mbrzoi.avif', 'poster', 1),
    ('hollow-knight-silksong', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805986/4c666cab506dfdf3e9469c4835f51ee3e472ab350b03b4a3_ypwsf2.avif', 'screenshot', 1),
    ('hollow-knight-silksong', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/08b19c7ef4fcc3a6ca370ce65c6ea3bb855e36b584e4044a_uhf4ng.avif', 'screenshot', 2),
    ('hollow-knight-silksong', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805989/52f93db9eed66234db64703fc279d673cbc83dec97eb6bb2_lr0kew.avif', 'screenshot', 3),
    ('hollow-knight-silksong', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805990/155e14df406bbfea7ea5ffea758936061396bf91803da6a2_gf28gw.avif', 'screenshot', 4),
    ('hollow-knight-silksong', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/3980a8757252ca77f4627bd0e0e505348da978f6c2b3a453_sskxvh.avif', 'screenshot', 5),
    ('hollow-knight-silksong', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/6145661f43db3aa357cfcf1406e2b9ef5604adac91af04cf_wwxz6v.avif', 'screenshot', 6),
    ('hollow-knight-silksong', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805996/df324b3ee1c4f136f5749164e21ba6656c18d5a6e1790e75_nzoxki.avif', 'screenshot', 7),

    ('assassins-creed-black-flag-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805993/30972495c4d1b567dcd015b80c0d3af9c946efc8822944d7_qwsind.avif', 'cover', 1),
    ('assassins-creed-black-flag-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805996/f1fe921628640e04e0019a7c874a0215dbe26bec1f4b6df2_t8iedq.avif', 'banner', 1),
    ('assassins-creed-black-flag-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976546/blackflag_ns2rvc.avif', 'poster', 1),
    ('assassins-creed-black-flag-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805986/0d9e9f056f2d03bbf86ee2dcb1815bc071504109baa86b88_xkuict.avif', 'screenshot', 1),
    ('assassins-creed-black-flag-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805992/8063607e29c74f35e590945fa66ac18de08ef03c6cc09f85_pdvohz.avif', 'screenshot', 2),
    ('assassins-creed-black-flag-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805994/b4e22cd44ad3f5fb7a9dc551401c1a9991a58bb6df3cd8df_n294ij.avif', 'screenshot', 3),
    ('assassins-creed-black-flag-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/d478cb56002fd2cb2e04d8cfd8490942fced08e62db2933e_gf0lgt.avif', 'screenshot', 4),
    ('assassins-creed-black-flag-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805995/dd35830fb3d2c5e8bc08b5ed6be69fd1904b9a1a7d354855_gw0rlt.avif', 'screenshot', 5),
    ('assassins-creed-black-flag-remake', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805996/e8b9a90a1b989b14aec6fca118bccdfced151d199994ab52_mmjie4.avif', 'screenshot', 6),

    ('dragon-ball-sparking-zero', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805991/881aeea06b117a39f1724a4d7ebf66b152a088475e4467e4_nfucut.avif', 'cover', 1),
    ('dragon-ball-sparking-zero', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805989/70bf2b0857ebc50a44d0e281d711cede69f592785da33d97_k5nozh.avif', 'banner', 1),
    ('dragon-ball-sparking-zero', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976541/sparkign_wdn07w.avif', 'poster', 1),
    ('dragon-ball-sparking-zero', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805987/3b49de028249b81b51a531debf39f65aa6fc08c65f865101_rmk7re.avif', 'screenshot', 1),
    ('dragon-ball-sparking-zero', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/7de725f13584a8b7b4426cecefb30714801740b6365798ce_zhnrf2.avif', 'screenshot', 2),
    ('dragon-ball-sparking-zero', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805991/905d6d57a028928cc8f7f623643c339ab2bd2a2fc1183370_zjb4os.avif', 'screenshot', 3),
    ('dragon-ball-sparking-zero', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805994/bba7d02ae9cae5f4b87c87bc4e86a215eb28ae70a2908e14_i8x5ac.avif', 'screenshot', 4),

    ('minecraft', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805991/670c294ded3baf4fa11068db2ec6758c63f7daeb266a35a1_sjezdo.avif', 'cover', 1),
    ('minecraft', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805990/91fe046f742042e3b31e57f7731dbe2226e1fd1e02a36223_issij9.avif', 'banner', 1),
    ('minecraft', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785976539/mine_a464rw.avif', 'poster', 1),
    ('minecraft', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805988/6fe83bf38f93a06816c21b46ce73945f157260319c4a77d2_prt4b6.avif', 'screenshot', 1),
    ('minecraft', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805990/94dd1a47ceec2cd4fbd4839938ddfcc51d8cad604b57c595_p6ksxx.avif', 'screenshot', 2),
    ('minecraft', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805990/0193d3b773501fffe0609513ab4e134ff14759ede12d4423_r2mwbm.avif', 'screenshot', 3),
    ('minecraft', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805993/51311490f915043da2f955969ac22133541f122c78c168f5_kum8cu.avif', 'screenshot', 4),
    ('minecraft', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1785805996/fc3e64baae92f6976c2ec81e4020e7862c9afaaf103c1317_p0fwmg.avif', 'screenshot', 5),

    ('genshin-impact', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786334454/genshin-impact-40jjf_bhspko.jpg', 'cover', 1),
    ('genshin-impact', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333492/588720a686e20fc3d0ed0fa5d42b10d0981341dde320e3c6_le2n0z.avif', 'banner', 1),
    ('genshin-impact', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333490/30935168a0f21b6710dc2bd7bb37c23ed937fb9fa747d84c_dyvivu.avif', 'poster', 1),
    ('genshin-impact', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333491/ee8fc561d32640042cfc52f98f1eddb9e7529eafc39c60a0_ivgfir.avif', 'screenshot', 1),
    ('genshin-impact', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333491/acdc8c4afc1b17bbeb7c961a4c2dbb2636e20b8cf0515a0a_vtdidz.avif', 'screenshot', 2),
    ('genshin-impact', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333491/c50d3976bafdb642fd8c384a22a9dd81affb5f1bf363c04f_ycwqgd.avif', 'screenshot', 3),
    ('genshin-impact', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333491/b969913e8a04f2c4ab6ca10173856162d65c1c352a015322_u3jpvu.avif', 'screenshot', 4),
    ('genshin-impact', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333490/85390fe18f86b8480ab0a69a6bddbb9f75d4fb75745e8168_u2niqn.avif', 'screenshot', 5),

    ('valorant', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786334412/apps.21507.13663857844271189.4c1de202-3961-4c40-a0aa-7f4f1388775a_kxqhwh.jpg', 'cover', 1),
    ('valorant', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333490/f70950c34b58491e273fa8ef1bcb0022bc633537921934d8_meaz5j.avif', 'banner', 1),
    ('valorant', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786334425/tecnologia_20e_20games-games-valorant-call_of_duty-1721677606_emjfbj.jpg', 'poster', 1),
    ('valorant', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333489/2c1e9886a14f934916259b5dc12e95e5d3857aa789cf07b5_dksuvy.avif', 'screenshot', 1),
    ('valorant', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333489/57ba040780f841303f990276a1163357db7ddd4fc73e891e_edjprg.avif', 'screenshot', 2),
    ('valorant', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333489/31ecfb2e24d112b6a4cd318470b2b1ce80bd340885feac97_loclbb.avif', 'screenshot', 3),
    ('valorant', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333489/8ca49a8478ab4f4b1093fb6ebca67e0ca5a3adb7d1c037be_gw3w2r.avif', 'screenshot', 4),
    ('valorant', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333488/9c98fba4828d6739e4c35635f251fb18d81568657a65587f_hmrbty.avif', 'screenshot', 5),

    ('resident-evil-requiem', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786334340/images_gkkjyq.jpg', 'cover', 1),
    ('resident-evil-requiem', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333488/3878ff92261c1fda7ce03772ac149514ce6f6bf5c715e64b_ay64zk.avif', 'banner', 1),
    ('resident-evil-requiem', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786334338/resident-evil-9_q75h_futvg4.jpg', 'poster', 1),
    ('resident-evil-requiem', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333488/b2ee4bb116cbc638d085ccf6f8a70926e23a945810ef8696_hvryvg.avif', 'screenshot', 1),
    ('resident-evil-requiem', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333487/0defaa05f3a37f4340975cb80cbd328462d6f9af93c115b0_jfso0t.avif', 'screenshot', 2),
    ('resident-evil-requiem', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333487/42738d3e42f78fab129efa703bd39b56c223d1e9aff488cd_okovcg.avif', 'screenshot', 3),
    ('resident-evil-requiem', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333487/85f70c7da036a82417a2c4e9bf9dc6876320e22c25def9d9_hfzdmx.avif', 'screenshot', 4),
    ('resident-evil-requiem', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333486/f8fc0bb33bb532fd955efc69f5206a487507361406213583_sjn2qk.avif', 'screenshot', 5),
    ('resident-evil-requiem', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333486/53835b4d3bd76248d5df4ea114f851da584ad3dee93170a5_cpt3uq.avif', 'screenshot', 6),
    ('resident-evil-requiem', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333486/b63335ca9f101e01db8bc3a61e3941abfc4658e50f84f4d5_p9fmut.avif', 'screenshot', 7),

    ('arc-raiders', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786334174/apps.1218.13550041517005289.7f3b0841-0084-4cae-88f4-8996d95d574f_ejtndw.jpg', 'cover', 1),
    ('arc-raiders', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333485/1ba134fed235d21ae7ae2588ed379fbb2eb24e1574dd6dad_crpzlp.avif', 'banner', 1),
    ('arc-raiders', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786334294/images_dmoyfc.jpg', 'poster', 1),
    ('arc-raiders', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333485/d8fe1cbb0a3f30673003363089667bc932e5bd1f2f4ab4b2_fjelb8.avif', 'screenshot', 1),
    ('arc-raiders', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333485/545919c3eb68b7a80f26585a9eb213f62cd8bfa1da4c52a5_jfxogb.avif', 'screenshot', 2),
    ('arc-raiders', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333485/1854db4af5285cf9e6a2d5e64188f2cf61dcf373e12cc8db_e3cdwz.avif', 'screenshot', 3),
    ('arc-raiders', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333484/e52c17aca8d3dedc85e586c97502787ddf22b6823684b6c9_kfkntp.avif', 'screenshot', 4),
    ('arc-raiders', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333484/8cbbaa5b92d0ce745153ac6ea4ab5083546729e80b792023_dwytxx.avif', 'screenshot', 5),

    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786334153/cover_voessc.jpg', 'cover', 1),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333484/71b37be111798b6f8e9f9413474e882603867affbbea6b4d_clj0eh.avif', 'banner', 1),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786334130/marvel-tokon-fighting-souls_dc82_a7svp3.jpg', 'poster', 1),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333484/4815eb3172d0243de81381930283979e6c50857cb51aafc1_dels6m.avif', 'screenshot', 1),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333483/00158ca9b06407610e5e73c38547f46538e4c4f4c87ee052_rzngcx.avif', 'screenshot', 2),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333483/eea10430815adb7a5995097fd5ab8d30002e2ffeb4b95712_sz3x1p.avif', 'screenshot', 3),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333483/5c395b96290fc72c7244d94fbe15cdf3e0ec8a5342bb9cf8_lhwl9v.avif', 'screenshot', 4),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333482/0f36058edd06e73dfd9028fca0fc3582b7c237642b98e0bc_e7ubpm.avif', 'screenshot', 5),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333482/973f3b7807d55b4c3cc556d50ba38f8056545bf5f42e937e_k7brjh.avif', 'screenshot', 6),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333481/61ca8f3b7dc02bdf0a3719be7d4771c549617fc4e9773ccd_jgyoya.avif', 'screenshot', 7),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333481/2786fb5d2958f181e836bc8d7c2c2424b0ad6b9a47f04724_f028fa.avif', 'screenshot', 8),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333481/f127f61a7cdf328577b55767b95a8a0e5a9f9c6fc3cfddbd_mw6a6i.avif', 'screenshot', 9),
    ('marvel-tokon-fighting-souls', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333480/47646bc6f0b4d839aa64a21350978f84956db3dd979244ab_hzid8b.avif', 'screenshot', 10),

    ('spider-man-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786334040/e66c4ae18c5d8e3986a24599b293162a6f5c9eba22968d2c_mlcj65.jpg', 'cover', 1),
    ('spider-man-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333480/97e9f5fa6e50c185d249956c6f198a2652a9217e69a59ecd_kcwazg.avif', 'banner', 1),
    ('spider-man-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786334040/e66c4ae18c5d8e3986a24599b293162a6f5c9eba22968d2c_mlcj65.jpg', 'poster', 1),
    ('spider-man-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333480/2c98c3222259f47462e6d7cd596e7e6bb2c9c0ff2ed314f6_fxynbj.avif', 'screenshot', 1),
    ('spider-man-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333479/21b32023d0332afe6f2fa5ae74d66ceea4fa82212922135a_zoedzd.avif', 'screenshot', 2),
    ('spider-man-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333479/e2293c139402f6a14ffb7b69ea4da5fbfd58939bd9bccd5b_rbeug2.avif', 'screenshot', 3),
    ('spider-man-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333479/023d3a703dd14e4b76534132d18e5a648c3bd1b2f3f082ea_hwcwg1.avif', 'screenshot', 4),
    ('spider-man-2', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333479/ca4fa327f917323de1822c3511640700f11af3772b4d0cf1_galwzr.avif', 'screenshot', 5),

    ('roblox', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333943/roblox_ensino_j6uqjp.jpg', 'cover', 1),
    ('roblox', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333478/6157a74f216f5fd380f33d326132130e6d1d7578291da74c_mqucsh.avif', 'banner', 1),
    ('roblox', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333478/12278d7eaa31b8e9afe79e98f5017d4522b3ac51c7635826_smbidm.avif', 'poster', 1),
    ('roblox', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333478/44cc9e6950a383e88a43b0876d7926cf32a678c8788ecbbd_dmn2q8.avif', 'screenshot', 1),
    ('roblox', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333477/ad591a0097eee07d2ac0de67d464d0ffcf4e86c40a2ed023_udr6xf.avif', 'screenshot', 2),
    ('roblox', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333477/8055b401120af0b02f837e042937bce377844b34bd70936d_ythrve.avif', 'screenshot', 3),
    ('roblox', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333477/fbb0338a4bed3b8d1d43085e9df587b53cd74c37ba877202_srsq0w.avif', 'screenshot', 4),
    ('roblox', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333476/910edf5bb055b7dcb8fb506ecd318a8a8b6028a8b952aced_kperpc.avif', 'screenshot', 5),

    ('free-fire', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333476/MV5BMTI3MTE3ZGQtNWJmMi00MTAzLWI2MzYtZTFiMDRkMzU0ZjE0XkEyXkFqcGc._V1__ogfwwd.jpg', 'cover', 1),
    ('free-fire', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333474/65fef1213324415a00e170bef3a51e2b_tmmriz.jpg', 'banner', 1),
    ('free-fire', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333476/garena-free-fire_2e8s_quw5e0.jpg', 'poster', 1),
    ('free-fire', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/maxresdefault_2_gvqstl.jpg', 'screenshot', 1),
    ('free-fire', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333476/images_iikqog.jpg', 'screenshot', 2),
    ('free-fire', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333475/maxresdefault_1_kgvzjr.jpg', 'screenshot', 3),
    ('free-fire', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333475/images_1_ydnkdx.jpg', 'screenshot', 4),
    ('free-fire', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333475/unnamed_hgjuf1.webp', 'screenshot', 5),
    ('free-fire', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/hq720_u8kemt.jpg', 'screenshot', 6),

    ('league-of-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/apps.18996.14127010465288187.f9de4a96-0ee4-4da3-bf66-d4132b38c599_jic6oh.jpg', 'cover', 1),
    ('league-of-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333899/image_principale_lol_0d328e25-2895-428d-a871-34cccfda67ae_v7vvna.jpg', 'banner', 1),
    ('league-of-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/lol-banner_jr3grz.webp', 'poster', 1),
    ('league-of-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/99691af754da3fdb0f9c122530db5048c7a2e168-1920x1080_tphmvi.jpg', 'screenshot', 1),
    ('league-of-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/images_2_ruzmac.jpg', 'screenshot', 2),
    ('league-of-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/Udyr_3.jpg_l2nzov.webp', 'screenshot', 3),
    ('league-of-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333473/147753-lol-article_cover_bd-2_tsjdyi.webp', 'screenshot', 4),
    ('league-of-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333472/league_of_legends_novas_skins_florescer_espiritual__254tlno0_q2f5zy.jpg', 'screenshot', 5),
    ('league-of-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333472/LeagueofLegends_NoxusSkins_SeasonOne_MasqueoftheBlackRoseVladimir_Splashart_rd5ori.jpg', 'screenshot', 6),
    ('league-of-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333472/2b5f2946482626a0718f4a124ffcf55c6250c8ad-1215x717_rezexp.jpg', 'screenshot', 7),
    ('league-of-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786333472/1ddf258f6a27414a83067d14cca91e3afdb13af9-1215x717_kprecn.jpg', 'screenshot', 8),

    ('marvels-wolverine', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335533/5ba04b023e0b4c4aa7fbdbf2170262a52bc0384ee44efce0_tmdu2a.jpg', 'cover', 1),
    ('marvels-wolverine', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335509/2e98d11ecc5fc86cf404d0f4b7b4a1ba5774a51bf3db0020_kyxiig.jpg', 'banner', 1),
    ('marvels-wolverine', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335506/a69481c5fa50fe19f42896d84fb7cbf37ab8646801a93322_qgfile.jpg', 'poster', 1),
    ('marvels-wolverine', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335575/55310752343_8b1160b229_4k_eiosqo.jpg', 'screenshot', 1),
    ('marvels-wolverine', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335582/marvels-wolverine-gameplay-brutal-state-of-play_dzage1.webp', 'screenshot', 2),
    ('marvels-wolverine', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335585/wolverine-marvel-sony-rolling-stone_enmflr.jpg', 'screenshot', 3),
    ('marvels-wolverine', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335611/wolverineb.jpg_oi10qu.webp', 'screenshot', 4),
    ('marvels-wolverine', 'https://www.einerd.com/wp-content/uploads/2025/09/552413441_18525434383026398_4040425915169076594_n-1024x576.jpg', 'screenshot', 5),

    ('fortnite', 'https://i.redd.it/why-roblox-is-seen-as-for-kids-but-games-like-fortnite-or-v0-d6fhyley7c4c1.jpg?width=1000&format=pjpg&auto=webp&s=67f63774e9d4f2d5d9fbc75527924b9add9c01c4', 'cover', 1),
    ('fortnite', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335787/uptodown-fortnite-epic-games-store-battle-royale_xkczdd.jpg', 'banner', 1),
    ('fortnite', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335803/maxresdefault_glcrxv.jpg', 'poster', 1),
    ('fortnite', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336121/imagem-2024-12-11-175848969_fzbkfp.jpg', 'screenshot', 1),
    ('fortnite', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335971/maxresdefault_gbydxc.jpg', 'screenshot', 2),
    ('fortnite', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335983/Imagem-07-08-2026-as-18.20_qfi6lc.png', 'screenshot', 3),
    ('fortnite', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336126/PZwgUkS8NwAym9tokx97Vn_uflq3b.jpg', 'screenshot', 4),
    ('fortnite', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336124/fortnite-01_xhayst.jpg', 'screenshot', 5),

    ('apex-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335918/94825_viltsw.jpg', 'cover', 1),
    ('apex-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335835/b7710f94cae71eb1e149b3b658a22e24e022accebba4880f_c61bb1.jpg', 'banner', 1),
    ('apex-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335823/b48e1eb395ffbbb4523ecbaf169b44c010ffed2dd0b526b0_k8gkbg.jpg', 'poster', 1),
    ('apex-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335837/005b8b83efad77f7ac511a163035857070e51e610260b747_namubt.jpg', 'screenshot', 1),
    ('apex-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335842/fa6cffe59160a10d800e9c8e76feecf00c0c8c68c4db89e6_zqlypx.jpg', 'screenshot', 2),
    ('apex-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335839/9ac130bed625dd2f27ccb88ce4c7221b7cb49cd8af589e7c_v4pjah.jpg', 'screenshot', 3),
    ('apex-legends', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786335923/apex3_r1unbv.png', 'screenshot', 4),

    ('pubg', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336208/pubg-pc_1280x720-800-resize_gr0m0j.jpg', 'cover', 1),
    ('pubg', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336132/PUBG-Screen-03_roi2ym.jpg', 'banner', 1),
    ('pubg', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336128/a667297e99ffe4f306b1b513ffd1f38b429ab22ab4848408_nximds.jpg', 'poster', 1),
    ('pubg', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336246/images_xkood1.jpg', 'screenshot', 1),
    ('pubg', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336238/Aq0F4oV6_q5ygti.jpg', 'screenshot', 2),
    ('pubg', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336275/images_fjw7eg.jpg', 'screenshot', 3),
    ('pubg', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336278/dd4e4db38323102089c82ecdb193908fbeb93bbd80d210c2_uzx7oz.jpg', 'screenshot', 4),
    ('pubg', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336280/88db5bf_b03z1b.webp', 'screenshot', 5),

    ('the-last-of-us-part-1', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336388/JKqkaz5Sy6AvH2fZAVdjTxR8_ypqdvx.jpg', 'cover', 1),
    ('the-last-of-us-part-1', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336388/JKqkaz5Sy6AvH2fZAVdjTxR8_ypqdvx.jpg', 'banner', 1),
    ('the-last-of-us-part-1', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336381/eEczyEMDd2BLa3dtkGJVE9Id_ucs4li.jpg', 'poster', 1),
    ('the-last-of-us-part-1', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336400/8qNEBMsYiPgIfmGmmi49jdO9_suy0ti.jpg', 'screenshot', 1),
    ('the-last-of-us-part-1', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336408/ETNxL6Q3oHcXGuTM7lKNmEPC_ggeghb.jpg', 'screenshot', 2),
    ('the-last-of-us-part-1', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336413/6nNniLbi1lIxtrkVhsR6RBU9_ylicpa.jpg', 'screenshot', 3),
    ('the-last-of-us-part-1', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336415/mfCn8HhUv1cBfh6m6HkjG0tN_aijwyp.jpg', 'screenshot', 4),
    ('the-last-of-us-part-1', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336418/qpAUFYXSVRlSN0Z1MSKXPu92_zes8zi.jpg', 'screenshot', 5),
    ('the-last-of-us-part-1', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336421/XrinjHHmA699ahvDroE7Mmoa_erf2tq.jpg', 'screenshot', 6),
    ('the-last-of-us-part-1', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336423/fwAXxU3rbbRVJABaov6bMfYA_sa0cvc.jpg', 'screenshot', 7),

    ('doki-doki-literature-club', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336528/MV5BZmJhMTkwMDEtNDU2Yi00MjNkLWIwNDYtMTZhNWM1ODgyZDI3XkEyXkFqcGc._V1__fhswb3.jpg', 'cover', 1),
    ('doki-doki-literature-club', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336568/3xIQlFWEBEUNrbSOpbUxu7Pd_ydsj1t.jpg', 'banner', 1),
    ('doki-doki-literature-club', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369812/N7ihNMs56mxfYpLu3h7KjtGi_nuagi5.jpg', 'poster', 1),
    ('doki-doki-literature-club', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336565/ss_3941e57f278958dd15c9855f42ab069da3a19608.1920x1080_ha5q0f.jpg', 'screenshot', 1),
    ('doki-doki-literature-club', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336637/ss_2ba08e22d1a3226a85b19e682b3cf88960c9f190.1920x1080_q9cftd.jpg', 'screenshot', 2),
    ('doki-doki-literature-club', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336640/RjN13xW3n1RxqMyFSM2nEzqU_yvswvf.jpg', 'screenshot', 3),
    ('doki-doki-literature-club', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336643/yiQGUhNNvr0KqEp8xrj7yab5_pfbxfw.jpg', 'screenshot', 4),
    ('doki-doki-literature-club', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336646/maLXGPNpjJmyGeAJ8uRdRSgt_ivx0kk.jpg', 'screenshot', 5),
    ('doki-doki-literature-club', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336649/r1kWWVKxktLTOSz75cSjpeKg_f3urhl.jpg', 'screenshot', 6),

    ('horizon-forbidden-west', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336742/SqRcyLjZbpK26ej6TnWf43xp_lbh49m.jpg', 'cover', 1),
    ('horizon-forbidden-west', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336767/yKyAgL4hV8wgDMgN0tcerpzO_f1gruo.jpg', 'banner', 1),
    ('horizon-forbidden-west', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336862/ki0STHGAkIF06Q4AU8Ow4OkV_njz4zy.jpg', 'poster', 1),
    ('horizon-forbidden-west', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336756/cGMjVMO5g2yPS9bjwL5CGyGE_nzpv13.jpg', 'screenshot', 1),
    ('horizon-forbidden-west', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336758/paxX30u6PJZWTIywCzTjQ8XQ_v6nons.jpg', 'screenshot', 2),
    ('horizon-forbidden-west', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336762/S6OtFMhSYw0m1GYRTykhGDs6_bo1pzd.jpg', 'screenshot', 3),
    ('horizon-forbidden-west', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336764/JEpfvm4xHpYTmXyz12vWRCR5_y216tt.jpg', 'screenshot', 4),
    ('horizon-forbidden-west', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336772/VYOttvPGju7LvJKD65OGeT41_uousfs.jpg', 'screenshot', 5),
    ('horizon-forbidden-west', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786336775/goSNxvzTBXhNy965YPXGM906_z2wu1g.jpg', 'screenshot', 6),

    ('kandidatos', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369002/4e6d49ddedcb7c3edde61148ceda4953_r8ymg6.png', 'cover', 1),
    ('kandidatos', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369021/maxresdefault_fblvmp.jpg', 'banner', 1),
    ('kandidatos', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786368986/3320953-5358214920-rOW6cDC8QLo8y2xzF7104pXMmiXSyLC6RVMjl3YYl6cBkpYNWf18dxTYTsvkMfP5GZw_3Ds180_yhqkmb.jpg', 'poster', 1),
    ('kandidatos', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369038/ss_2acf9559421dd59bd85822eaf17ca0e5262831d7.1920x1080_omknin.jpg', 'screenshot', 1),
    ('kandidatos', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369074/ss_5164c684ce6e1f46cf4a275ff700b77c0d7f3843.1920x1080_vwknfy.jpg', 'screenshot', 2),
    ('kandidatos', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369070/ss_9156e5d4fde11b878f9219c13b7f5762a8d504ed.1920x1080_i147eh.jpg', 'screenshot', 3),
    ('kandidatos', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369056/ss_eae1222db15cbca40e97ce4606104102f0e632cf.1920x1080_wtuzvu.jpg', 'screenshot', 4),

    ('persona-5-royal', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369475/899500_front_qaf8ku.jpg', 'cover', 1),
    ('persona-5-royal', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369284/ksJmxHAF3c4PV9N7MRvLCeWb_usfwo7.jpg', 'banner', 1),
    ('persona-5-royal', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369252/OjPcc6QP2W8kImOhWSnzojn3_ftucvg.jpg', 'poster', 1),
    ('persona-5-royal', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369290/oAyxg9w4rLSSbIK91wzvaby6_jbeyuq.jpg', 'screenshot', 1),
    ('persona-5-royal', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369322/rKJ656smMK3g3cAwIVFeAdgS_a8tdht.jpg', 'screenshot', 2),
    ('persona-5-royal', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369333/QZuvnoBy0DhHj8CH5znQLIpL_vu4jgg.jpg', 'screenshot', 3),
    ('persona-5-royal', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369313/F4rgmdmQH5Wvj9cA0sLHOKxj_un05kv.jpg', 'screenshot', 4),
    ('persona-5-royal', 'https://res.cloudinary.com/meguitooooooo/image/upload/v1786369351/CKIWUxnh85P9sLV1vRfXCqMj_jncnez.jpg', 'screenshot', 5)
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
    (p.slug = 'halo-campaign-evolved' AND c.nome IN ('Ação', 'Ficção Científica')) OR
    (p.slug = 'demons-souls' AND c.nome IN ('RPG', 'Ação', 'Fantasia')) OR
    (p.slug = 'baldurs-gate-3' AND c.nome IN ('RPG', 'Fantasia', 'Turnos')) OR
    (p.slug = 'gta-5' AND c.nome IN ('Ação', 'Mundo Aberto', 'Aventura')) OR
    (p.slug = 'grand-theft-auto-vi' AND c.nome IN ('Ação', 'Aventura', 'Mundo Aberto')) OR
    (p.slug = 'call-of-duty-modern-warfare-4' AND c.nome IN ('Ação', 'FPS')) OR
    (p.slug = 'elden-ring-nightreign' AND c.nome IN ('Ação', 'RPG', 'Roguelike')) OR
    (p.slug = 'eldest-souls' AND c.nome IN ('Ação', 'RPG')) OR
    (p.slug = 'hades-2' AND c.nome IN ('Ação', 'RPG', 'Roguelike')) OR
    (p.slug = 'god-of-war-ragnarok' AND c.nome IN ('Ação', 'Aventura', 'Hack and Slash')) OR
    (p.slug = 'dark-souls-3' AND c.nome IN ('Ação', 'RPG', 'Fantasia')) OR
    (p.slug = 'god-of-war' AND c.nome IN ('Ação', 'Aventura', 'Hack and Slash')) OR
    (p.slug = 'gang-beasts' AND c.nome IN ('Ação', 'Festa', 'Multijogador')) OR
    (p.slug = 'metal-gear-solid-delta' AND c.nome IN ('Ação', 'Aventura', 'Furtividade')) OR
    (p.slug = 'days-gone-remake' AND c.nome IN ('Ação', 'Aventura', 'Sobrevivência', 'Mundo Aberto')) OR
    (p.slug = 'god-of-war-3-remastered' AND c.nome IN ('Ação', 'Aventura', 'Hack and Slash')) OR
    (p.slug = 'battlefield-6' AND c.nome IN ('Ação', 'FPS', 'Multijogador')) OR
    (p.slug = 'doom-the-dark-ages' AND c.nome IN ('Ação', 'FPS')) OR
    (p.slug = 'demon-slayer-hinokami-chronicles' AND c.nome IN ('Ação', 'Luta')) OR
    (p.slug = 'hollow-knight-silksong' AND c.nome IN ('Ação', 'Metroidvania', 'Plataforma')) OR
    (p.slug = 'assassins-creed-black-flag-remake' AND c.nome IN ('Ação', 'Aventura', 'Mundo Aberto')) OR
    (p.slug = 'dragon-ball-sparking-zero' AND c.nome IN ('Ação', 'Luta')) OR
    (p.slug = 'minecraft' AND c.nome IN ('Sandbox', 'Aventura', 'Sobrevivência')) OR
    (p.slug = 'genshin-impact' AND c.nome IN ('RPG', 'Ação', 'Aventura', 'Mundo Aberto')) OR
    (p.slug = 'valorant' AND c.nome IN ('Ação', 'FPS', 'Multijogador')) OR
    (p.slug = 'resident-evil-requiem' AND c.nome IN ('Ação', 'Aventura', 'Furtividade', 'Terror')) OR
    (p.slug = 'arc-raiders' AND c.nome IN ('Ação', 'FPS', 'Sobrevivência', 'Multijogador')) OR
    (p.slug = 'marvel-tokon-fighting-souls' AND c.nome IN ('Ação', 'Luta')) OR
    (p.slug = 'spider-man-2' AND c.nome IN ('Ação', 'Aventura', 'Mundo Aberto')) OR
    (p.slug = 'roblox' AND c.nome IN ('Sandbox', 'Aventura', 'Multijogador')) OR
    (p.slug = 'free-fire' AND c.nome IN ('Ação', 'Sobrevivência', 'Multijogador', 'Battle Royale')) OR
    (p.slug = 'league-of-legends' AND c.nome IN ('Ação', 'MOBA', 'Multijogador')) OR
    (p.slug = 'marvels-wolverine' AND c.nome IN ('Ação', 'Aventura', 'Mundo Aberto')) OR
    (p.slug = 'fortnite' AND c.nome IN ('Ação', 'Battle Royale', 'Multijogador')) OR
    (p.slug = 'apex-legends' AND c.nome IN ('Ação', 'FPS', 'Battle Royale', 'Multijogador')) OR
    (p.slug = 'pubg' AND c.nome IN ('Ação', 'FPS', 'Battle Royale', 'Multijogador')) OR
    (p.slug = 'the-last-of-us-part-1' AND c.nome IN ('Ação', 'Aventura', 'Sobrevivência', 'Terror')) OR
    (p.slug = 'doki-doki-literature-club' AND c.nome IN ('Aventura', 'Terror', 'Simulação')) OR
    (p.slug = 'horizon-forbidden-west' AND c.nome IN ('Ação', 'RPG', 'Aventura', 'Mundo Aberto')) OR
    (p.slug = 'kandidatos' AND c.nome IN ('Ação', 'Luta', 'Festa')) OR
    (p.slug = 'persona-5-royal' AND c.nome IN ('RPG', 'Aventura', 'Turnos'))
)
ON CONFLICT (produto_id, categoria_id) DO NOTHING;

COMMIT;