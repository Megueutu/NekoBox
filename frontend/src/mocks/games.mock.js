import { seedCatalogGames, seedMediaBySlug, seedPosterBySlug } from "./seed-catalog.mock";

const baseMockGames = [
  {
    id: "d3b07384-d113-4e4e-a57e-7977b3b3a60a",
    owner_id: "usr_admin_system_001",
    title: "Cyberpunk 2077",
    slug: "cyberpunk-2077",
    long_description: `Cyberpunk 2077 é um RPG de ação e aventura em mundo aberto ambientado na megalópole de Night City, onde você vive, rouba, implanta chips em si mesmo e mata para sobreviver. Você joga como V, um mercenário fora da lei atrás de um implante único que carrega a chave da imortalidade. Personalize o corpo e as habilidades do seu personagem enquanto você escolhe o seu caminho por uma cidade implacável.

A trama gira em torno da parceria entre V e Johnny Silverhand, um rebelde digitalizado interpretado por Keanu Reeves, cuja personalidade está gravada no biochip que ameaça sobrepor a mente do protagonista. Entre gangues, corporações e fixers, Night City se revela um organismo vivo, dividido em distritos com identidades e conflitos próprios, onde cada escolha de diálogo pode redefinir alianças e o destino final da história.

O combate mistura tiro em primeira pessoa, hackeamento e habilidades cibernéticas (cyberware) que transformam braços em lâminas ou olhos em scanners táticos. A build do personagem é moldada por uma árvore de perícias flexível, permitindo abordagens furtivas, técnicas ou de confronto direto, enquanto veículos e uma cidade vertical incentivam a exploração livre entre missões principais e contratos paralelos ricos em detalhes.

Desenvolvido pela CD Projekt RED, o jogo passou por um ciclo extenso de correções desde o lançamento, culminando na expansão Phantom Liberty e em uma reformulação completa dos sistemas de habilidade, veículos e inteligência artificial policial, elevando a direção de arte cyberpunk e a trilha sonora licenciada a um dos pontos altos da produção.`,
    price: 199.90,
    release_date: "2020-12-10",
    status: "published",
    media: [
      { id: "m1", type: "cover", url: "https://picsum.photos/seed/cp2077/400/600", position: 1 },
      { id: "m2", type: "banner", url: "https://picsum.photos/seed/cp2077b/1920/1080", position: 1 },
      { id: "m3", type: "screenshot", url: "https://picsum.photos/seed/cp2077s1/800/450", position: 1 },
      { id: "m4", type: "screenshot", url: "https://picsum.photos/seed/cp2077s2/800/450", position: 2 },
      { id: "m5", type: "screenshot", url: "https://picsum.photos/seed/cp2077s3/800/450", position: 3 },
      { id: "m5-4", type: "screenshot", url: "https://picsum.photos/seed/cp2077s4/800/450", position: 4 },
      { id: "m5-5", type: "screenshot", url: "https://picsum.photos/seed/cp2077s5/800/450", position: 5 },
      { id: "m5-6", type: "screenshot", url: "https://picsum.photos/seed/cp2077s6/800/450", position: 6 },
      { id: "m5-7", type: "screenshot", url: "https://picsum.photos/seed/cp2077s7/800/450", position: 7 },
      { id: "m5-8", type: "screenshot", url: "https://picsum.photos/seed/cp2077s8/800/450", position: 8 },
      { id: "m5-9", type: "screenshot", url: "https://picsum.photos/seed/cp2077s9/800/450", position: 9 },
      { id: "m5-10", type: "screenshot", url: "https://picsum.photos/seed/cp2077s10/800/450", position: 10 },
    ],
    categories: ["RPG", "Ficção Científica", "Mundo Aberto"],
    tags: ["Cyberpunk", "Keanu Reeves", "Primeira Pessoa", "CD Projekt Red"],
    publisher: { id: "p1", name: "CD PROJEKT RED", logo_url: "" },
    system_requirements: [
      { type: "minimum", os: "Windows 10 64-bit", cpu: "Core i5-3570K ou FX-8310", ram: "12 GB", gpu: "GTX 780 ou Radeon RX 470", storage: "70 GB SSD" },
      { type: "recommended", os: "Windows 10 64-bit", cpu: "Core i7-4790 ou Ryzen 3 3200G", ram: "16 GB", gpu: "GTX 1060 6GB ou Radeon RX 590", storage: "70 GB SSD" },
    ],
    languages: [
      { name: "Português (Brasil)", interface: true, subtitles: true, audio: true },
      { name: "Inglês", interface: true, subtitles: true, audio: true },
      { name: "Espanhol", interface: true, subtitles: true, audio: false },
    ],
    updates: [
      { id: "u1", version: "v2.12", title: "Patch de Estabilidade", content: "Correções de crash e otimizações gerais de Ray Tracing.", created_at: "2024-02-20" },
      { id: "u2", version: "v2.0", title: "Phantom Liberty Overhaul", content: "Reformulação completa da árvore de habilidades e combate veicular.", created_at: "2023-09-21" },
    ],
  },
  {
    id: "a4f18923-b224-4f5f-b67f-8988c4c4b71b",
    owner_id: "usr_admin_system_001",
    title: "The Witcher 3: Wild Hunt",
    slug: "the-witcher-3",
    long_description: `O RPG de mundo aberto mais premiado de uma geração está refinado e aprimorado. Você é Geralt de Rívia, um caçador de monstros mercenário, em um continente devastado pela guerra e infestado de monstros que você pode explorar à vontade. Conclua contratos de caçador de monstros, tome decisões difíceis para coletar enormes recompensas.

No centro da trama está a busca de Geralt por Ciri, sua filha adotiva perseguida pela Wild Hunt, uma horda espectral vinda de outro mundo. A jornada atravessa reinos em guerra, vilarejos amaldiçoados e cortes políticas, tecendo uma narrativa adulta sobre escolhas morais ambíguas, onde poucas decisões têm resposta certa.

O combate combina espadas de aço e prata, sinais mágicos e alquimia de poções e óleos, exigindo preparo contra cada tipo de criatura do bestiário. Fora das batalhas, Gwent, corridas de cavalo, contratos de caça e uma economia de crafting robusta preenchem um mundo aberto denso, onde cada região carrega sua própria identidade visual e folclore.

Desenvolvido pela CD Projekt RED, o jogo é aclamado por sua escrita madura e pelas expansões Hearts of Stone e Blood and Wine, consideradas referências do gênero. A direção de arte inspirada no folclore eslavo, aliada a uma trilha sonora atmosférica, consolidou Wild Hunt como um marco na narrativa de RPGs.`,
    price: 129.90,
    release_date: "2015-05-19",
    status: "published",
    media: [
      { id: "m6", type: "cover", url: "https://picsum.photos/seed/witcher3/400/600", position: 1 },
      { id: "m7", type: "banner", url: "https://picsum.photos/seed/witcher3b/1920/1080", position: 1 },
      { id: "m8", type: "screenshot", url: "https://picsum.photos/seed/witcher3s1/800/450", position: 1 },
      { id: "m9", type: "screenshot", url: "https://picsum.photos/seed/witcher3s2/800/450", position: 2 },
    ],
    categories: ["RPG", "Fantasia", "Mundo Aberto"],
    tags: ["Bruxo", "Geralt", "História Rica", "CD Projekt Red"],
    publisher: { id: "p1", name: "CD PROJEKT RED", logo_url: "" },
    system_requirements: [
      { type: "minimum", os: "Windows 7/8 64-bit", cpu: "Intel i5-2500K ou Phenom II X4", ram: "6 GB", gpu: "GTX 660 ou HD 7870", storage: "40 GB" },
      { type: "recommended", os: "Windows 10 64-bit", cpu: "Intel i7-3770 ou FX-8350", ram: "8 GB", gpu: "GTX 770 ou R9 290", storage: "40 GB" },
    ],
    languages: [
      { name: "Português (Brasil)", interface: true, subtitles: true, audio: true },
      { name: "Inglês", interface: true, subtitles: true, audio: true },
    ],
    updates: [],
  },
  {
    id: "b5c29034-e335-4f6f-c78g-9099d5d5c82c",
    owner_id: "usr_admin_system_001",
    title: "Red Dead Redemption 2",
    slug: "red-dead-redemption-2",
    long_description: `America, 1899. O fim da era dos foragidos chegou. Arthur Morgan e a gangue Van der Linde são forçados a fugir depois de um roubo que deu errado na cidade de Blackwater. Com autoridades federais e os melhores caçadores de recompensas do país em seus calcanhares, a gangue deve roubar, roubar e brigar para sobreviver.

A narrativa acompanha o declínio da gangue Van der Linde em uma América que industrializa rapidamente e não tem mais espaço para foras da lei. Arthur Morgan, tenente leal ao líder Dutch, é o fio condutor de uma história sobre lealdade, redenção e as consequências morais de uma vida de crime, contada com um elenco de personagens profundamente humanos.

O mundo aberto reage ao comportamento do jogador através do sistema de Honra, que influencia diálogos, reputação e finais possíveis. Caça, pesca, acampamento, tiroteios táticos e a criação de vínculo com o cavalo compõem uma simulação de sobrevivência minuciosa, onde o ritmo lento reforça a imersão em vez de pressa.

Produzido pela Rockstar Games, o título é reconhecido pela reconstrução detalhada do Velho Oeste, com ciclos climáticos, fauna e economia simulados em escala raramente vista. A direção de Dan Houser e a atuação de Roger Clark como Arthur renderam um dos roteiros mais elogiados da indústria.`,
    price: 179.90,
    release_date: "2018-10-26",
    status: "published",
    media: [
      { id: "m10", type: "cover", url: "https://picsum.photos/seed/rdr2/400/600", position: 1 },
      { id: "m11", type: "banner", url: "https://picsum.photos/seed/rdr2b/1920/1080", position: 1 },
      { id: "m12", type: "screenshot", url: "https://picsum.photos/seed/rdr2s1/800/450", position: 1 },
      { id: "m13", type: "screenshot", url: "https://picsum.photos/seed/rdr2s2/800/450", position: 2 },
      { id: "m14", type: "screenshot", url: "https://picsum.photos/seed/rdr2s3/800/450", position: 3 },
    ],
    categories: ["Ação", "Aventura", "Mundo Aberto"],
    tags: ["Faroeste", "Rockstar", "Cavalo", "Narrativa"],
    publisher: { id: "p2", name: "ROCKSTAR GAMES", logo_url: "" },
    system_requirements: [
      { type: "minimum", os: "Windows 10 64-bit", cpu: "Intel i5-2500K ou AMD FX-6300", ram: "8 GB", gpu: "Nvidia GTX 770 ou AMD Radeon R9 280", storage: "150 GB SSD" },
      { type: "recommended", os: "Windows 10 64-bit", cpu: "Intel i7-4770K ou AMD Ryzen 5 1500X", ram: "12 GB", gpu: "Nvidia GTX 1060 6GB ou AMD Radeon RX 480", storage: "150 GB SSD" },
    ],
    languages: [
      { name: "Português (Brasil)", interface: true, subtitles: true, audio: false },
      { name: "Inglês", interface: true, subtitles: true, audio: true },
    ],
    updates: [
      { id: "u3", version: "v1.31", title: "Atualização de Fevereiro", content: "Correções de bugs e melhorias gerais de estabilidade.", created_at: "2023-02-15" },
    ],
  },
  {
    id: "c6d30145-f446-5g7g-d89h-0100e6e6d93d",
    owner_id: "usr_admin_system_001",
    title: "Elden Ring",
    slug: "elden-ring",
    long_description: `Uma nova fantasia épica criada por Hidetaka Miyazaki e o grande novelista George R. R. Martin. ELDEN RING é um RPG de ação e fantasia set em um mundo criado pela colaboração dessas duas mentes criativas. Um vasto mundo onde florestas abertas e campos animados são conectados a masmorras sombrias.

As Terras Intermédias mergulharam no caos após o estilhaçamento do Anel Prezado, e cabe ao Sem-Luz reunir os fragmentos perdidos para se tornar o novo Lorde Prezado. A mitologia obscura de Martin se manifesta em ruínas, semideuses corrompidos e uma lore fragmentada, contada por itens e diálogos em vez de cutscenes explicativas.

Diferente dos jogos Souls anteriores, o mundo é totalmente aberto e navegável a cavalo em Torrente, permitindo abordar masmorras, castelos e chefes opcionais na ordem que o jogador preferir. Armas, feitiços e cinzas de guerra oferecem builds altamente variadas, mantendo o combate punitivo e recompensador que caracteriza a FromSoftware.

Sob a direção de Hidetaka Miyazaki, com worldbuilding de George R. R. Martin, o jogo venceu múltiplos prêmios de Jogo do Ano e recebeu a expansão Shadow of the Erdtree, expandindo ainda mais seu já vasto universo de fantasia sombria.`,
    price: 249.90,
    release_date: "2022-02-25",
    status: "published",
    media: [
      { id: "m15", type: "cover", url: "https://picsum.photos/seed/eldenring/400/600", position: 1 },
      { id: "m16", type: "banner", url: "https://picsum.photos/seed/eldenringb/1920/1080", position: 1 },
      { id: "m17", type: "screenshot", url: "https://picsum.photos/seed/eldenrings1/800/450", position: 1 },
      { id: "m18", type: "screenshot", url: "https://picsum.photos/seed/eldenrings2/800/450", position: 2 },
    ],
    categories: ["RPG", "Ação", "Fantasia"],
    tags: ["Souls-like", "FromSoftware", "George R.R. Martin", "Mundo Aberto"],
    publisher: { id: "p3", name: "BANDAI NAMCO", logo_url: "" },
    system_requirements: [
      { type: "minimum", os: "Windows 10/11 64-bit", cpu: "INTEL CORE I5-8400 / AMD RYZEN 3 3300X", ram: "12 GB", gpu: "NVIDIA GEFORCE GTX 1060 3 GB / AMD RADEON RX 580 4 GB", storage: "60 GB SSD" },
      { type: "recommended", os: "Windows 10/11 64-bit", cpu: "INTEL CORE I7-8700K / AMD RYZEN 5 3600X", ram: "16 GB", gpu: "NVIDIA GEFORCE GTX 1070 8 GB / AMD RADEON RX VEGA 56 8 GB", storage: "60 GB SSD" },
    ],
    languages: [
      { name: "Português (Brasil)", interface: true, subtitles: true, audio: false },
      { name: "Inglês", interface: true, subtitles: true, audio: true },
      { name: "Japonês", interface: true, subtitles: true, audio: true },
    ],
    updates: [
      { id: "u4", version: "v1.12", title: "Shadow of the Erdtree DLC", content: "Nova expansão com área massiva, novos bosses, armas e histórias.", created_at: "2024-06-21" },
    ],
  },
  {
    id: "d7e41256-g557-6h8h-e90i-1211f7f7e04e",
    owner_id: "usr_admin_system_001",
    title: "God of War Ragnarök",
    slug: "god-of-war-ragnarok",
    long_description: `A jornada épica de Kratos e Atreus continua. Enfrentando a iminente profecia do Ragnarök, pai e filho devem viajar pelos Nove Reinos em busca de respostas. Enquanto as forças de Asgard se preparam para a guerra, Kratos e Atreus devem fazer escolhas que irão ecoar pelos mundos.

Com o inverno de Fimbulwinter se aproximando do fim, Kratos e Atreus se veem no centro de uma guerra que envolve os Nove Reinos, deuses e gigantes. A relação entre pai e filho amadurece à medida que Atreus busca seu próprio caminho, enquanto Kratos confronta seu passado violento e o peso de ser visto como um deus.

O combate expande o sistema introduzido em 2018 com o retorno das Lâminas do Caos ao lado do Machado Leviatã, permitindo alternar entre estilos de gelo e fogo em tempo real. A exploração dos Nove Reinos ficou mais livre, com viagens entre mundos, quebra-cabeças ambientais e desafios opcionais que recompensam equipamentos e histórias paralelas.

Desenvolvido pela Santa Monica Studio, o jogo manteve a assinatura de câmera contínua sem cortes e elevou a fidelidade das animações faciais e da direção cinematográfica, sendo aclamado como um dos maiores exclusivos de PlayStation da geração.`,
    price: 299.90,
    release_date: "2022-11-09",
    status: "published",
    media: [
      { id: "m19", type: "cover", url: "https://picsum.photos/seed/gowr/400/600", position: 1 },
      { id: "m20", type: "banner", url: "https://picsum.photos/seed/gowrb/1920/1080", position: 1 },
      { id: "m21", type: "screenshot", url: "https://picsum.photos/seed/gowrs1/800/450", position: 1 },
      { id: "m22", type: "screenshot", url: "https://picsum.photos/seed/gowrs2/800/450", position: 2 },
      { id: "m23", type: "screenshot", url: "https://picsum.photos/seed/gowrs3/800/450", position: 3 },
    ],
    categories: ["Ação", "Aventura", "Hack and Slash"],
    tags: ["Kratos", "Mitologia Nórdica", "Santa Monica Studio", "PS5"],
    publisher: { id: "p4", name: "SONY INTERACTIVE", logo_url: "" },
    system_requirements: [
      { type: "minimum", os: "Windows 10 64-bit", cpu: "Intel i5-6600K / AMD Ryzen 5 2600X", ram: "8 GB", gpu: "NVIDIA GTX 1060 (6 GB) / AMD RX 5500 XT (8 GB)", storage: "190 GB SSD" },
      { type: "recommended", os: "Windows 10/11 64-bit", cpu: "Intel i7-7700K / AMD Ryzen 7 3700X", ram: "16 GB", gpu: "NVIDIA RTX 3080 / AMD RX 6800 XT", storage: "190 GB SSD" },
    ],
    languages: [
      { name: "Português (Brasil)", interface: true, subtitles: true, audio: true },
      { name: "Inglês", interface: true, subtitles: true, audio: true },
    ],
    updates: [],
  },
  {
    id: "e8f52367-h668-7i9i-f01j-2322g8g8f15f",
    owner_id: "usr_admin_system_001",
    title: "Hollow Knight",
    slug: "hollow-knight",
    long_description: `Forje seu caminho por um vasto reino em ruínas de insetos e heróis. Explore cavernas tortuosas, vilas antigas e ruínas mortais. Enfrente inimigos mortais, faça amizade com criaturas estranhas e resolva mistérios ancestrais no coração do continente.

Hallownest é um reino subterrâneo em ruínas, devastado por uma praga que corrompeu seus habitantes insetóides. Como o Cavaleiro, um pequeno guerreiro silencioso, você desvenda aos poucos uma história trágica de reis caídos, irmãs guardiãs e um mal ancestral, contada quase inteiramente através de ambientes e encontros opcionais.

A exploração não linear recompensa curiosidade e memorização de mapas, com habilidades de movimento (double jump, dash, wall jump) que abrem caminhos previamente inacessíveis, no estilo clássico de metroidvania. Os combates contra chefes exigem precisão e paciência, com uma dificuldade que cresce de forma justa conforme novos amuletos e talismãs são equipados.

Criado por uma equipe pequena na Team Cherry, o jogo se destaca pela direção de arte desenhada à mão e por uma trilha sonora orquestral melancólica, tornando-se referência do gênero indie e abrindo caminho para a aguardada sequência Silksong.`,
    price: 49.90,
    release_date: "2017-02-24",
    status: "published",
    media: [
      { id: "m24", type: "cover", url: "https://res.cloudinary.com/m7bohjtg/image/upload/v1784025147/1425e65d043da63396a10ccf87d5e4af50175464e64cda30_pz3jdd.avif", position: 1 },
      { id: "m25", type: "banner", url: "https://picsum.photos/seed/hollowb/1920/1080", position: 1 },
      { id: "m26", type: "screenshot", url: "https://picsum.photos/seed/hollows1/800/450", position: 1 },
      { id: "m27", type: "screenshot", url: "https://picsum.photos/seed/hollows2/800/450", position: 2 },
    ],
    categories: ["Ação", "Plataforma", "Metroidvania"],
    tags: ["Indie", "Metroidvania", "Team Cherry", "2D"],
    publisher: { id: "p5", name: "TEAM CHERRY", logo_url: "" },
    system_requirements: [
      { type: "minimum", os: "Windows 7 64-bit", cpu: "Intel Core 2 Duo E5200", ram: "4 GB", gpu: "GeForce 9800GTX+ 1GB", storage: "9 GB" },
      { type: "recommended", os: "Windows 10 64-bit", cpu: "Intel Core i5", ram: "8 GB", gpu: "GeForce GTX 560 1GB", storage: "9 GB" },
    ],
    languages: [
      { name: "Inglês", interface: true, subtitles: true, audio: false },
      { name: "Português (Brasil)", interface: true, subtitles: true, audio: false },
    ],
    updates: [],
  },
  {
    id: "f9g63478-i779-8j0j-g12k-3433h9h9g26g",
    owner_id: "usr_admin_system_001",
    title: "Baldur's Gate 3",
    slug: "baldurs-gate-3",
    long_description: `Reúna seus companheiros e retorne às Terras Esquecidas em uma história de amizade, traição, sacrifício e sobrevivência. Uma doença chamada Aberração Mental está se espalhando pela cidade. Você é um dos poucos que pode parar isso — se não se tornar um monstro antes.

Infectado por um parasita mental ilítida, o grupo de sobreviventes precisa encontrar uma cura antes de se transformar em uma aberração mental. A jornada atravessa a Costa da Espada em uma trama repleta de reviravoltas políticas, dilemas morais e romances possíveis, moldada quase inteiramente pelas escolhas do jogador.

Baseado nas regras de Dungeons & Dragons 5ª edição, o combate por turnos valoriza posicionamento, vantagem tática e uso criativo do ambiente, como empurrar inimigos de penhascos ou incendiar óleo derramado. A liberdade narrativa é notável: praticamente qualquer ação pode ser tentada, com resultados determinados por testes de dados e pelas consequências de longo prazo.

Desenvolvido pela Larian Studios ao longo de mais de seis anos, incluindo um extenso período de acesso antecipado, o jogo é elogiado pela quantidade de conteúdo reativo e pela qualidade das atuações em captura de performance, tendo vencido o prêmio de Jogo do Ano em 2023.`,
    price: 219.90,
    release_date: "2023-08-03",
    status: "published",
    media: [
      { id: "m28", type: "cover", url: "https://picsum.photos/seed/bg3/400/600", position: 1 },
      { id: "m29", type: "banner", url: "https://picsum.photos/seed/bg3b/1920/1080", position: 1 },
      { id: "m30", type: "screenshot", url: "https://picsum.photos/seed/bg3s1/800/450", position: 1 },
      { id: "m31", type: "screenshot", url: "https://picsum.photos/seed/bg3s2/800/450", position: 2 },
      { id: "m32", type: "screenshot", url: "https://picsum.photos/seed/bg3s3/800/450", position: 3 },
    ],
    categories: ["RPG", "Fantasia", "Turnos"],
    tags: ["D&D", "Larian Studios", "Co-op", "Escolhas Morais"],
    publisher: { id: "p6", name: "LARIAN STUDIOS", logo_url: "" },
    system_requirements: [
      { type: "minimum", os: "Windows 10 64-bit", cpu: "Intel i7 8700K / AMD Ryzen 5 3600", ram: "8 GB", gpu: "Nvidia GTX 1060 Super 6GB / AMD RX 5500 XT 8GB", storage: "150 GB SSD" },
      { type: "recommended", os: "Windows 10/11 64-bit", cpu: "Intel i7 8700K / AMD Ryzen 5 3600", ram: "16 GB", gpu: "Nvidia RTX 2060 Super 8GB / AMD RX 5700 XT 8GB", storage: "150 GB SSD" },
    ],
    languages: [
      { name: "Inglês", interface: true, subtitles: true, audio: true },
      { name: "Português (Brasil)", interface: true, subtitles: true, audio: false },
    ],
    updates: [
      { id: "u5", version: "Patch 7", title: "Epilogos e Melhorias", content: "Novos epilogos, melhorias de performance e correções de bugs.", created_at: "2024-01-10" },
    ],
  },
  {
    id: "g0h74589-j880-9k1k-h23l-4544i0i0h37h",
    owner_id: "usr_admin_system_001",
    title: "Minecraft",
    slug: "minecraft",
    long_description: `Minecraft é um jogo de aventura sandbox onde você pode construir e criar seu próprio mundo. Explore mundos gerados proceduralmente com biomas infinitos. Colete recursos, crafteie ferramentas, construa estruturas e sobreviva aos monstros da noite.

Não existe um objetivo único: o jogador define seus próprios propósitos, seja construir castelos elaborados, redstone complexo automatizado ou simplesmente sobreviver o máximo possível. O modo Sobrevivência introduz fome, saúde e ameaças noturnas, enquanto o modo Criativo remove limites de recursos para dar espaço total à imaginação.

Cada mundo gerado é único, combinando biomas que vão de desertos e florestas a oceanos profundos e a dimensão do Nether, repleta de perigos e recursos exclusivos. A dimensão do End guarda o confronto final contra o Ender Dragon, mas a maior parte da experiência é definida pela jornada, não pelo destino.

Criado originalmente por Markus "Notch" Persson e hoje mantido pela Mojang Studios, Minecraft se tornou um fenômeno cultural com atualizações constantes, suporte robusto a mods e um dos maiores mercados multiplayer já criados, sendo um dos jogos mais vendidos da história.`,
    price: 89.90,
    release_date: "2011-11-18",
    status: "published",
    media: [
      { id: "m33", type: "cover", url: "https://picsum.photos/seed/minecraft/400/600", position: 1 },
      { id: "m34", type: "banner", url: "https://picsum.photos/seed/minecraftb/1920/1080", position: 1 },
      { id: "m35", type: "screenshot", url: "https://picsum.photos/seed/minecrafts1/800/450", position: 1 },
      { id: "m36", type: "screenshot", url: "https://picsum.photos/seed/minecrafts2/800/450", position: 2 },
    ],
    categories: ["Sandbox", "Aventura", "Sobrevivência"],
    tags: ["Mojang", "Construção", "Multiplayer", "Criativo"],
    publisher: { id: "p7", name: "MOJANG STUDIOS", logo_url: "" },
    system_requirements: [
      { type: "minimum", os: "Windows 10 64-bit", cpu: "Intel i3-3210 / AMD A8-7600", ram: "4 GB", gpu: "Intel HD Graphics 4000 / AMD Radeon R5", storage: "4 GB" },
      { type: "recommended", os: "Windows 10 64-bit", cpu: "Intel i5-4690 / AMD A10-7800", ram: "8 GB", gpu: "NVIDIA GeForce 700 Series / AMD Radeon Rx 200", storage: "8 GB" },
    ],
    languages: [
      { name: "Português (Brasil)", interface: true, subtitles: true, audio: false },
      { name: "Inglês", interface: true, subtitles: true, audio: true },
    ],
    updates: [
      { id: "u6", version: "1.21", title: "Tricky Trials", content: "Novas masmorras de câmara de julgamento, novos mobs e novos itens.", created_at: "2024-06-13" },
    ],
  },
  {
    id: "h1i85690-k991-0l2l-i34m-5655j1j1i48i",
    owner_id: "usr_admin_system_001",
    title: "Stardew Valley",
    slug: "stardew-valley",
    long_description: `Você herdou a antiga fazenda do seu avô e se mudou para o interior para recomeçar. Com algumas ferramentas antigas e algumas moedas, você dá início a uma nova vida. Cultive colheitas, crie animais, pesque, minere, faça amizades com os moradores da cidade e talvez encontre o amor.

O ciclo de dias é dividido entre plantio e colheita sazonal, cuidado com animais, mineração em cavernas geradas proceduralmente e pesca em lagos, rios e no mar. A gestão de tempo e energia adiciona uma camada estratégica sutil, incentivando o jogador a planejar rotas e prioridades a cada manhã.

Pelican Town abriga dezenas de moradores com rotinas, diálogos e arcos pessoais próprios, permitindo amizades, rivalidades e casamentos. Restaurar o Centro Comunitário abandonado em oposição à cadeia JojaMart adiciona um tema sutil sobre comunidade versus consumismo corporativo.

Desenvolvido quase inteiramente por uma única pessoa, Eric "ConcernedApe" Barone, o jogo levou cerca de quatro anos para ficar pronto e recebeu atualizações gratuitas contínuas por quase uma década, incluindo multiplayer, novas áreas e o modo Terreno Ancestral, mantendo uma das comunidades mais fiéis do gênero indie.`,
    price: 39.90,
    release_date: "2016-02-26",
    status: "published",
    media: [
      { id: "m37", type: "cover", url: "https://picsum.photos/seed/stardew/400/600", position: 1 },
      { id: "m38", type: "banner", url: "https://picsum.photos/seed/stardewb/1920/1080", position: 1 },
      { id: "m39", type: "screenshot", url: "https://picsum.photos/seed/stardews1/800/450", position: 1 },
      { id: "m40", type: "screenshot", url: "https://picsum.photos/seed/stardews2/800/450", position: 2 },
    ],
    categories: ["Simulação", "RPG", "Fazenda"],
    tags: ["Indie", "ConcernedApe", "Relaxante", "Pixel Art"],
    publisher: { id: "p8", name: "CONCERNEDAPE", logo_url: "" },
    system_requirements: [
      { type: "minimum", os: "Windows Vista ou mais recente", cpu: "2 Ghz", ram: "2 GB", gpu: "256mb video memory, capable of Shader Model 3.0+", storage: "500 MB" },
      { type: "recommended", os: "Windows 10 64-bit", cpu: "Intel i5", ram: "4 GB", gpu: "512 MB VRAM dedicada", storage: "500 MB" },
    ],
    languages: [
      { name: "Português (Brasil)", interface: true, subtitles: true, audio: false },
      { name: "Inglês", interface: true, subtitles: true, audio: false },
    ],
    updates: [
      { id: "u7", version: "1.6", title: "Grande Atualização de Conteúdo", content: "Novos eventos, itens, e melhorias de QoL para multiplayer.", created_at: "2024-03-19" },
    ],
  },
  {
    id: "i2j96701-l002-1m3m-j45n-6766k2k2j59j",
    owner_id: "usr_admin_system_001",
    title: "Hades",
    slug: "hades",
    long_description: `Desafie o deus da morte lutando para escapar do submundo da mitologia grega neste aclamado roguelike de Supergiant Games. Cada vez que você sai, o mundo se expande e novos segredos são revelados. Use uma combinação de armas, habilidades e bençãos dos deuses do Olimpo para triunfar.

Zagreu, filho do deus Hades, tenta repetidamente escapar do Submundo para encontrar sua verdadeira mãe na superfície. Cada fuga fracassada revela mais sobre a família disfuncional do Olimpo através de diálogos que evoluem a cada nova tentativa, transformando a repetição roguelike em uma ferramenta narrativa em vez de um obstáculo.

Cada uma das Salas do Submundo apresenta combinações aleatórias de inimigos e recompensas, enquanto Bênçãos concedidas por deuses do Olimpo, como Zeus e Ares, alteram drasticamente as armas e habilidades do jogador em cada corrida. Seis armas com estilos distintos garantem builds variadas mesmo depois de dezenas de tentativas.

Desenvolvido pela Supergiant Games, o jogo se destaca por sua direção de arte vibrante inspirada em cerâmica grega antiga e por uma trilha sonora de rock composta por Darren Korb, sendo um dos roguelikes mais premiados e o primeiro do gênero indicado ao prêmio Hugo.`,
    price: 69.90,
    release_date: "2020-09-17",
    status: "published",
    media: [
      { id: "m41", type: "cover", url: "https://picsum.photos/seed/hades/400/600", position: 1 },
      { id: "m42", type: "banner", url: "https://picsum.photos/seed/hadesb/1920/1080", position: 1 },
      { id: "m43", type: "screenshot", url: "https://picsum.photos/seed/hadess1/800/450", position: 1 },
      { id: "m44", type: "screenshot", url: "https://picsum.photos/seed/hadess2/800/450", position: 2 },
    ],
    categories: ["Ação", "RPG", "Roguelike"],
    tags: ["Indie", "Supergiant", "Mitologia Grega", "Dungeon Crawler"],
    publisher: { id: "p9", name: "SUPERGIANT GAMES", logo_url: "" },
    system_requirements: [
      { type: "minimum", os: "Windows 7 SP1 64-bit", cpu: "Dual Core 2.4 GHz", ram: "4 GB", gpu: "1GB VRAM / DirectX 10+ support", storage: "15 GB" },
      { type: "recommended", os: "Windows 10 64-bit", cpu: "Dual Core 3.0 GHz+", ram: "8 GB", gpu: "2GB VRAM / DirectX 10+ support", storage: "15 GB" },
    ],
    languages: [
      { name: "Inglês", interface: true, subtitles: true, audio: true },
      { name: "Português (Brasil)", interface: true, subtitles: true, audio: false },
    ],
    updates: [],
  },
  {
    id: "j3k07812-m113-2n4n-k56o-7877l3l3k60k",
    owner_id: "usr_admin_system_001",
    title: "Grand Theft Auto V",
    slug: "gta-5",
    long_description: `Quando um jovem golpista das ruas, um ladrão de bancos aposentado e um psicopata aterrorizante se envolvem com a facção mais assustadora e lunática do governo criminal dos EUA, eles devem arriscar tudo em uma série de golpes ousados e perigosos que representam sua única saída.

A trama alterna entre três protagonistas jogáveis — Michael, Franklin e Trevor — cujas histórias se cruzam em uma série de assaltos cada vez mais ambiciosos em Los Santos, uma sátira da Califórnia moderna. A alternância de perspectivas permite abordar cada missão de múltiplos ângulos, aprofundando a caracterização de cada personagem.

Além da campanha, GTA Online oferece um mundo persistente com missões cooperativas, corridas, negócios criminosos e atualizações contínuas de conteúdo há mais de uma década. A liberdade de explorar Los Santos e o condado de Blaine a pé, de carro, avião ou submarino continua sendo um dos maiores atrativos da série.

Desenvolvido pela Rockstar North, o jogo é um dos produtos de entretenimento mais lucrativos já criados, sustentado por uma direção de mundo aberto minuciosa, humor satírico afiado e uma trilha sonora com rádios licenciadas que definiram a cultura pop da década de 2010.`,
    price: 99.90,
    release_date: "2013-09-17",
    status: "published",
    media: [
      { id: "m45", type: "cover", url: "https://picsum.photos/seed/gta5/400/600", position: 1 },
      { id: "m46", type: "banner", url: "https://picsum.photos/seed/gta5b/1920/1080", position: 1 },
      { id: "m47", type: "screenshot", url: "https://picsum.photos/seed/gta5s1/800/450", position: 1 },
      { id: "m48", type: "screenshot", url: "https://picsum.photos/seed/gta5s2/800/450", position: 2 },
    ],
    categories: ["Ação", "Mundo Aberto", "Aventura"],
    tags: ["Rockstar", "Los Santos", "Crime", "Online"],
    publisher: { id: "p2", name: "ROCKSTAR GAMES", logo_url: "" },
    system_requirements: [
      { type: "minimum", os: "Windows 10 64-bit", cpu: "Intel Core i5-3470 / AMD X8 FX-8350", ram: "8 GB", gpu: "NVIDIA GTX 660 2GB / AMD HD 7870 2GB", storage: "72 GB" },
      { type: "recommended", os: "Windows 10 64-bit", cpu: "Intel Core i7-3770 / AMD FX-9590", ram: "16 GB", gpu: "NVIDIA GTX 1060 6GB / AMD RX 580 4GB", storage: "72 GB SSD" },
    ],
    languages: [
      { name: "Português (Brasil)", interface: true, subtitles: true, audio: false },
      { name: "Inglês", interface: true, subtitles: true, audio: true },
    ],
    updates: [
      { id: "u8", version: "v1.68", title: "Bottom Dollar Bounties", content: "Nova atividade de recompensas no GTA Online com missões de caça.", created_at: "2024-07-10" },
    ],
  },
];

const withSeedMedia = (game) => ({
  ...game,
  media: [
    ...(seedMediaBySlug[game.slug] || game.media),
    ...(seedPosterBySlug[game.slug]
      ? [{ type: "poster", url: seedPosterBySlug[game.slug], position: 1 }]
      : []),
    { type: "poster", url: `https://picsum.photos/seed/nekobox-poster-${game.slug}/640/640`, position: 1 },
  ].filter((media, index, items) => media.type !== "poster" || items.findIndex((item) => item.type === "poster") === index)
    .map((media, index) => ({
      ...media,
      id: media.id || `${game.slug}-${media.type}-${media.position || index + 1}`,
    })),
});

export const mockGames = [
  ...baseMockGames.map(withSeedMedia),
  ...seedCatalogGames.map(withSeedMedia),
];
