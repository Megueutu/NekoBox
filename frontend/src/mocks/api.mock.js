import { mockGames } from "./games.mock";

const STORAGE_KEY = "nekobox_mock_api_state";
const SEED_VERSION = 11;
const clone = (value) => structuredClone(value);
const now = () => new Date().toISOString();
const mockError = (message, status = 400) => Object.assign(new Error(message), { status });

const seedState = () => ({
  seedVersion: SEED_VERSION,
  users: [
    { id: "1", username: "admin", email: "admin@admin.com", password: "Batata123", role: "ADMIN", saldo: 1000, bio: "Administrador local", avatar_url: "", criado_em: now() },
    { id: "2", username: "user", email: "user@user.com", password: "Batata123", role: "USER", saldo: 1000, bio: "Usuário de demonstração", avatar_url: "", criado_em: now() },
  ],
  carts: {},
  wishlists: {},
  libraries: {},
  games: clone(mockGames),
});

function migrateSeedState(state) {
  if (state.seedVersion === SEED_VERSION) return state;

  delete state.giftCards;
  Object.values(state.carts).forEach((cart) => cart.forEach((item) => {
    delete item.for_gift;
    item.quantity = 1;
  }));

  const seededBySlug = new Map(mockGames.map((game) => [game.slug, game]));
  const renamedSeedSlugs = new Map([
    ["call-of-duty-black-ops-7", "call-of-duty-modern-warfare-4"],
    ["dark-souls-saga", "dark-souls-3"],
  ]);
  const replaceRenamedSeed = (game) => {
    const currentSlug = renamedSeedSlugs.get(game.slug);
    return currentSlug ? clone(seededBySlug.get(currentSlug)) : game;
  };

  state.games = state.games.filter((game) => game.id !== "seed-halo");
  state.games = state.games.map(replaceRenamedSeed);
  [state.carts, state.wishlists, state.libraries].forEach((collection) => {
    Object.values(collection).forEach((games) => games.forEach((game, index) => {
      const replacement = replaceRenamedSeed(game);
      if (replacement !== game) games[index] = { ...game, ...replacement };
    }));
  });
  [state.games, ...Object.values(state.carts), ...Object.values(state.wishlists), ...Object.values(state.libraries)]
    .flat()
    .forEach((game) => delete game.reviews);
  const existingSlugs = new Set(state.games.map((game) => game.slug));
  state.games = state.games.map((game) => {
    const seeded = seededBySlug.get(game.slug);
    return seeded ? { ...game, media: clone(seeded.media), long_description: seeded.long_description } : game;
  });
  state.games.push(...mockGames.filter((game) => !existingSlugs.has(game.slug)).map(clone));
  state.seedVersion = SEED_VERSION;
  return saveState(state);
}

function readState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? migrateSeedState(JSON.parse(stored)) : seedState();
  } catch {
    return seedState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

function sessionUser(state) {
  const token = localStorage.getItem("access_token");
  const userId = token?.replace("mock-token-", "");
  const user = state.users.find((item) => item.id === userId);
  if (!user) throw mockError("Autenticação obrigatória.", 401);
  return user;
}

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function gameById(state, id) {
  const game = state.games.find((item) => String(item.id) === String(id));
  if (!game) throw mockError("Jogo não encontrado.", 404);
  return game;
}

function productSlug(title) {
  return String(title || "jogo")
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function myGame(game) {
  return {
    id: game.id,
    titulo: game.title,
    slug: game.slug,
    preco: game.price,
    status: game.status,
    release_date: game.release_date,
    descricao_longa: game.long_description,
    tags: game.tags,
    capa_url: game.media.find((media) => media.type === "cover")?.url || "",
    midias: game.media.map((media) => ({ ...media, tipo: media.type })),
  };
}

function catalog(state, pathname, searchParams) {
  if (pathname === "/api/games") {
    const query = searchParams.get("search")?.trim().toLocaleLowerCase("pt-BR");
    const content = query
      ? state.games.filter((game) => [game.title, ...game.tags].some((value) => value.toLocaleLowerCase("pt-BR").includes(query)))
      : state.games;
    return { content: clone(content) };
  }
  const slug = pathname.match(/^\/api\/games\/([^/]+)$/)?.[1];
  if (slug) {
    const game = state.games.find((item) => item.slug === decodeURIComponent(slug));
    if (game) return clone(game);
  }
  return null;
}

function adminGame(game) {
  return {
    id: game.id,
    titulo: game.title,
    slug: game.slug,
    preco: game.price,
    status: game.status,
    data_lancamento: game.release_date,
    descricao_longa: game.long_description,
    tags: game.tags,
    categoria_ids: [],
    capa_url: game.media.find((media) => media.type === "cover")?.url || "",
    midias: game.media,
  };
}

function adminUser(user) {
  return { ...publicUser(user), nome_usuario: user.username, papel: user.role };
}

function requireAdmin(state) {
  const user = sessionUser(state);
  if (user.role !== "ADMIN") throw mockError("Acesso restrito a administradores.", 403);
  return user;
}

function dashboardMock(state) {
  return {
    receita: 1469,
    vendas: 9,
    ticket_medio: 163.22,
    compradores: 6,
    usuarios: state.users.length,
    jogos_ativos: state.games.filter((game) => game.status === "published").length,
    evolucao: [
      { data: "2026-07-27", receita: 199.9, vendas: 1 },
      { data: "2026-07-28", receita: 179.8, vendas: 1 },
      { data: "2026-07-29", receita: 299.8, vendas: 2 },
      { data: "2026-07-30", receita: 129.9, vendas: 1 },
      { data: "2026-07-31", receita: 259.8, vendas: 2 },
      { data: "2026-08-01", receita: 199.9, vendas: 1 },
      { data: "2026-08-02", receita: 199.9, vendas: 1 },
    ],
    mais_vendidos: [
      { titulo: "Cyberpunk 2077", vendas: 3, receita: 599.7 },
      { titulo: "Elden Ring", vendas: 2, receita: 299.8 },
      { titulo: "The Witcher 3: Wild Hunt", vendas: 2, receita: 259.8 },
      { titulo: "Hades", vendas: 1, receita: 129.9 },
      { titulo: "Baldur's Gate 3", vendas: 1, receita: 179.8 },
    ],
    vendas_recentes: [
      { criado_em: "2026-08-02T18:42:00", usuario: "marina", jogo: "Cyberpunk 2077", valor: 199.9 },
      { criado_em: "2026-08-01T15:18:00", usuario: "joao", jogo: "The Witcher 3: Wild Hunt", valor: 129.9 },
      { criado_em: "2026-07-31T21:06:00", usuario: "ana", jogo: "Elden Ring", valor: 149.9 },
      { criado_em: "2026-07-30T11:27:00", usuario: "lucas", jogo: "Hades", valor: 129.9 },
    ],
  };
}

export async function mockApiRequest(path, { body, method = "GET" } = {}) {
  const url = new URL(path, window.location.origin);
  const state = readState();
  const catalogResponse = method === "GET" ? catalog(state, url.pathname, url.searchParams) : null;
  if (catalogResponse !== null) return catalogResponse;

  if (method === "POST" && url.pathname === "/api/auth/login") {
    const user = state.users.find((item) => item.email.toLowerCase() === String(body?.email || "").trim().toLowerCase() && item.password === body?.senha);
    if (!user) throw mockError("E-mail ou senha inválidos.", 401);
    return { access_token: `mock-token-${user.id}`, user: publicUser(user) };
  }

  if (method === "POST" && url.pathname === "/api/auth/logout") return null;

  if (method === "POST" && url.pathname === "/api/usuarios") {
    if (state.users.some((user) => user.email.toLowerCase() === String(body.email).toLowerCase())) throw mockError("Este e-mail já está cadastrado.", 409);
    const user = { id: String(state.users.length + 1), username: body.nome_usuario, email: body.email, password: body.senha, role: "USER", saldo: 1000, bio: "", avatar_url: "", criado_em: now() };
    state.users.push(user);
    saveState(state);
    return publicUser(user);
  }

  const user = sessionUser(state);
  const userId = user.id;
  state.carts[userId] ||= [];
  state.wishlists[userId] ||= [];
  state.libraries[userId] ||= [];

  if (url.pathname === "/api/usuarios/me") {
    if (method === "GET") return publicUser(user);
    if (method === "PUT") {
      user.username = body.username;
      user.bio = body.bio || "";
      user.avatar_url = body.avatar_url || "";
      saveState(state);
      return publicUser(user);
    }
  }
  if (method === "GET" && url.pathname === "/api/carteira") return { saldo: user.saldo };
  if (method === "POST" && url.pathname === "/api/carteira/recargas") {
    const value = Number(body?.valor);
    if (!Number.isFinite(value) || value <= 0) throw mockError("Informe um valor de recarga maior que zero.", 422);
    user.saldo += value;
    saveState(state);
    return { valor_adicionado: value, saldo: user.saldo };
  }
  if (method === "GET" && url.pathname === "/api/carrinho") return { items: clone(state.carts[userId]) };
  if (method === "POST" && url.pathname === "/api/carrinho/itens") {
    const game = gameById(state, body.produto_id);
    if (Number(game.price) === 0) {
      throw mockError("Jogos gratuitos devem ser adquiridos diretamente na biblioteca.", 422);
    }
    const existing = state.carts[userId].find((item) => item.id === game.id);
    if (existing) throw mockError("Este jogo já está no seu carrinho.", 409);
    state.carts[userId].push({ ...clone(game), quantity: 1 });
    saveState(state);
    return { items: clone(state.carts[userId]) };
  }
  const cartId = url.pathname.match(/^\/api\/carrinho\/itens\/([^/]+)$/)?.[1];
  if (cartId && method === "DELETE") {
    state.carts[userId] = state.carts[userId].filter((item) => String(item.id) !== decodeURIComponent(cartId));
    saveState(state);
    return null;
  }
  if (method === "GET" && url.pathname === "/api/wishlist") return clone(state.wishlists[userId]);
  const wishlistId = url.pathname.match(/^\/api\/wishlist\/([^/]+)$/)?.[1];
  if (wishlistId && method === "POST") {
    const game = gameById(state, wishlistId);
    if (!state.wishlists[userId].some((item) => item.id === game.id)) state.wishlists[userId].push(clone(game));
    saveState(state);
    return clone(game);
  }
  if (wishlistId && method === "DELETE") {
    state.wishlists[userId] = state.wishlists[userId].filter((item) => String(item.id) !== decodeURIComponent(wishlistId));
    saveState(state);
    return null;
  }
  if (method === "GET" && url.pathname === "/api/biblioteca") return clone(state.libraries[userId]);
  const freeLicenseId = url.pathname.match(/^\/api\/biblioteca\/licencas-gratuitas\/([^/]+)$/)?.[1];
  if (freeLicenseId && method === "POST") {
    const game = gameById(state, freeLicenseId);
    if (Number(game.price) !== 0) throw mockError("Apenas jogos gratuitos podem ser adquiridos sem custo.", 422);
    const ownedGame = state.libraries[userId].find((item) => String(item.id) === String(game.id));
    if (ownedGame) return clone(ownedGame);
    const acquiredGame = { ...clone(game), acquired_at: now() };
    state.libraries[userId].push(acquiredGame);
    saveState(state);
    return clone(acquiredGame);
  }
  if (method === "POST" && url.pathname === "/api/pagamentos/checkout") {
    const total = state.carts[userId].reduce((sum, item) => sum + item.price, 0);
    if (total > user.saldo) throw mockError("Saldo insuficiente.", 422);
    user.saldo -= total;
    state.carts[userId].forEach((item) => {
      if (!state.libraries[userId].some((game) => game.id === item.id)) state.libraries[userId].push({ ...clone(item), acquired_at: now() });
    });
    const payments = state.carts[userId].map((item) => ({ produto_id: item.id, valor: item.price, criado_em: now() }));
    state.carts[userId] = [];
    saveState(state);
    return { pagamentos: payments };
  }

  if (method === "GET" && url.pathname === "/api/produtos/meus") {
    return state.games.filter((game) => String(game.owner_id) === String(user.id)).map(myGame);
  }

  if (method === "POST" && url.pathname === "/api/produtos") {
    const game = {
      id: crypto.randomUUID(),
      owner_id: user.id,
      title: String(body?.titulo || "").trim(),
      slug: productSlug(body?.titulo),
      long_description: String(body?.descricao_longa || ""),
      price: Number(body?.preco || 0),
      release_date: body?.release_date || "",
      status: body?.status || "draft",
      tags: Array.isArray(body?.tags) ? body.tags : [],
      categories: [],
      media: [],
      publisher: null,
      updates: [],
    };
    if (!game.title) throw mockError("Informe o título do jogo.", 422);
    state.games.push(game);
    saveState(state);
    return myGame(game);
  }

  const ownProductMedia = url.pathname.match(/^\/api\/produtos\/([^/]+)\/fotos(?:\/([^/]+))?$/);
  if (ownProductMedia) {
    const [, productId, mediaId] = ownProductMedia;
    const game = gameById(state, decodeURIComponent(productId));
    if (String(game.owner_id) !== String(user.id)) throw mockError("Você não pode alterar este jogo.", 403);
    if (method === "POST" && !mediaId) {
      const type = body?.get("tipo");
      const file = body?.get("arquivo");
      if (!['cover', 'banner', 'poster', 'screenshot'].includes(type) || !(file instanceof File)) {
        throw mockError("Informe uma mídia válida.", 422);
      }
      if (type !== "screenshot") game.media = game.media.filter((media) => media.type !== type);
      const media = {
        id: crypto.randomUUID(),
        type,
        url: `https://picsum.photos/seed/${game.slug}-${type}-${crypto.randomUUID()}/1200/675`,
        position: game.media.filter((item) => item.type === type).length + 1,
      };
      game.media.push(media);
      saveState(state);
      return { ...media, tipo: media.type };
    }
    if (method === "DELETE" && mediaId) {
      const before = game.media.length;
      game.media = game.media.filter((media) => media.id !== decodeURIComponent(mediaId));
      if (game.media.length === before) throw mockError("Mídia não encontrada.", 404);
      saveState(state);
      return null;
    }
  }

  const ownProductId = url.pathname.match(/^\/api\/produtos\/([^/]+)$/)?.[1];
  if (ownProductId) {
    const game = gameById(state, decodeURIComponent(ownProductId));
    if (String(game.owner_id) !== String(user.id)) throw mockError("Você não pode alterar este jogo.", 403);
    if (method === "PUT") {
      Object.assign(game, {
        title: String(body?.titulo || "").trim(),
        slug: productSlug(body?.titulo),
        long_description: String(body?.descricao_longa || ""),
        price: Number(body?.preco || 0),
        release_date: body?.release_date || "",
        status: body?.status || "draft",
        tags: Array.isArray(body?.tags) ? body.tags : [],
      });
      if (!game.title) throw mockError("Informe o título do jogo.", 422);
      saveState(state);
      return myGame(game);
    }
    if (method === "DELETE") {
      state.games = state.games.filter((item) => item.id !== game.id);
      saveState(state);
      return null;
    }
  }

  requireAdmin(state);
  if (method === "GET" && url.pathname === "/api/admin/dashboard") return dashboardMock(state);
  if (method === "GET" && url.pathname === "/api/admin/usuarios") return state.users.map(adminUser);
  if (method === "GET" && url.pathname === "/api/admin/jogos") return state.games.map(adminGame);
  if (method === "POST" && url.pathname === "/api/admin/usuarios") {
    const newUser = { id: String(state.users.length + 1), username: body.nome_usuario, email: body.email, password: body.senha, role: "USER", saldo: Number(body.saldo || 0), bio: "", avatar_url: "", criado_em: now() };
    state.users.push(newUser);
    saveState(state);
    return adminUser(newUser);
  }
  const adminUserId = url.pathname.match(/^\/api\/admin\/usuarios\/([^/]+)$/)?.[1];
  if (adminUserId && method === "PUT") {
    const editableUser = state.users.find((item) => item.id === decodeURIComponent(adminUserId));
    if (!editableUser) throw mockError("Usuário não encontrado.", 404);
    editableUser.username = body.nome_usuario;
    editableUser.email = body.email;
    editableUser.saldo = Number(body.saldo);
    if (body.senha) editableUser.password = body.senha;
    saveState(state);
    return adminUser(editableUser);
  }
  if (adminUserId && method === "DELETE") {
    state.users = state.users.filter((item) => item.id !== decodeURIComponent(adminUserId));
    saveState(state);
    return null;
  }
  if (method === "POST" && url.pathname === "/api/admin/jogos") {
    const game = { id: crypto.randomUUID(), owner_id: "usr_admin_system_001", title: body.titulo, slug: productSlug(body.titulo), long_description: body.descricao_longa || "", price: Number(body.preco), release_date: body.data_lancamento || "", status: body.status, tags: body.tags || [], categories: [], media: [], publisher: null, updates: [] };
    state.games.push(game);
    saveState(state);
    return adminGame(game);
  }
  const adminGameId = url.pathname.match(/^\/api\/admin\/jogos\/([^/]+)$/)?.[1];
  if (adminGameId && method === "PUT") {
    const editableGame = gameById(state, decodeURIComponent(adminGameId));
    Object.assign(editableGame, { title: body.titulo, long_description: body.descricao_longa || "", price: Number(body.preco), release_date: body.data_lancamento || "", status: body.status, tags: body.tags || [] });
    saveState(state);
    return adminGame(editableGame);
  }
  if (adminGameId && method === "DELETE") {
    state.games = state.games.filter((item) => item.id !== decodeURIComponent(adminGameId));
    saveState(state);
    return null;
  }

  throw mockError("Endpoint não disponível no modo mock local.", 404);
}
