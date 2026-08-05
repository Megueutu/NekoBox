import { mockGames } from "./games.mock";

const STORAGE_KEY = "nekobox_mock_api_state";
const SEED_VERSION = 5;
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
  giftCards: [],
  games: clone(mockGames),
});

function migrateSeedState(state) {
  if (state.seedVersion === SEED_VERSION) return state;

  const seededBySlug = new Map(mockGames.map((game) => [game.slug, game]));
  state.games = state.games.filter((game) => game.id !== "seed-halo");
  const existingSlugs = new Set(state.games.map((game) => game.slug));
  state.games = state.games.map((game) => {
    const seeded = seededBySlug.get(game.slug);
    return seeded ? { ...game, media: clone(seeded.media) } : game;
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

function catalog(state, pathname, searchParams) {
  if (pathname === "/api/games/media-audit") {
    return { ausentes: [], nomes_divergentes: [], jogos_sem_screenshots: [], disponiveis: [] };
  }
  if (pathname === "/api/games") {
    const query = searchParams.get("search")?.trim().toLocaleLowerCase("pt-BR");
    const content = query
      ? state.games.filter((game) => [game.title, game.short_description, ...game.tags].some((value) => value.toLocaleLowerCase("pt-BR").includes(query)))
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
    descricao_curta: game.short_description,
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
  if (method === "GET" && url.pathname === "/api/carrinho") return { items: clone(state.carts[userId]) };
  if (method === "POST" && url.pathname === "/api/carrinho/itens") {
    const game = gameById(state, body.produto_id);
    if (Number(game.price) === 0) {
      throw mockError("Jogos gratuitos devem ser adquiridos diretamente na biblioteca.", 422);
    }
    const existing = state.carts[userId].find((item) => item.id === game.id && item.for_gift === Boolean(body.para_presente));
    if (existing) existing.quantity = Math.min(existing.quantity + 1, 10);
    else state.carts[userId].push({ ...clone(game), quantity: 1, for_gift: Boolean(body.para_presente) });
    saveState(state);
    return { items: clone(state.carts[userId]) };
  }
  const cartId = url.pathname.match(/^\/api\/carrinho\/itens\/([^/]+)$/)?.[1];
  if (cartId && method === "PATCH") {
    const item = state.carts[userId].find((entry) => String(entry.id) === decodeURIComponent(cartId));
    if (!item) throw mockError("Item não encontrado no carrinho.", 404);
    item.quantity = Math.max(1, Math.min(Number(body.quantidade) || 1, 10));
    saveState(state);
    return { items: clone(state.carts[userId]) };
  }
  if (cartId && method === "DELETE") {
    state.carts[userId] = state.carts[userId].filter((item) => !(String(item.id) === decodeURIComponent(cartId) && item.for_gift === (url.searchParams.get("paraPresente") === "true")));
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
    const total = state.carts[userId].reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (total > user.saldo) throw mockError("Saldo insuficiente.", 422);
    user.saldo -= total;
    state.carts[userId].filter((item) => !item.for_gift).forEach((item) => {
      if (!state.libraries[userId].some((game) => game.id === item.id)) state.libraries[userId].push({ ...clone(item), acquired_at: now() });
    });
    state.carts[userId] = [];
    saveState(state);
    return { pagamentos: [{ valor: total, criado_em: now() }], codigos_presente: [] };
  }

  const reviewGameId = url.pathname.match(/^\/api\/produtos\/([^/]+)\/avaliacoes$/)?.[1];
  if (reviewGameId && method === "POST") {
    const game = gameById(state, decodeURIComponent(reviewGameId));
    const rating = Number(body?.nota);
    const recommended = body?.recomenda;

    if (!state.libraries[userId].some((item) => String(item.id) === String(game.id))) {
      throw mockError("O usuário só pode avaliar jogos presentes em sua biblioteca.", 422);
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5 || typeof recommended !== "boolean") {
      throw mockError("Informe uma nota entre 1 e 5 e se recomenda o jogo.", 422);
    }
    if (game.reviews.some((review) => review.username === user.username)) {
      throw mockError("Você já avaliou este jogo.", 409);
    }

    const review = {
      id: crypto.randomUUID(),
      username: user.username,
      recommended,
      review_text: String(body?.textoAvaliacao || "").trim(),
      created_at: now(),
      votes: 0,
      rating,
    };
    game.reviews.unshift(review);
    saveState(state);
    return clone(review);
  }

  requireAdmin(state);
  if (method === "GET" && url.pathname === "/api/admin/dashboard") return dashboardMock(state);
  if (method === "GET" && url.pathname === "/api/admin/gift-cards") return clone(state.giftCards);
  if (method === "POST" && url.pathname === "/api/admin/gift-cards") {
    const card = { id: String(state.giftCards.length + 1), codigo: `NEKO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, valor: Number(body.valor), resgatado: false, resgatado_por: null, criado_em: now() };
    state.giftCards.unshift(card);
    saveState(state);
    return clone(card);
  }
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
    const game = { id: crypto.randomUUID(), owner_id: "usr_admin_system_001", title: body.titulo, slug: body.titulo.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), short_description: body.descricao_curta || "", long_description: body.descricao_longa || "", price: Number(body.preco), release_date: body.data_lancamento || "", status: body.status, tags: body.tags || [], categories: [], media: [], publisher: null, system_requirements: [], languages: [], updates: [], reviews: [] };
    state.games.push(game);
    saveState(state);
    return adminGame(game);
  }
  const adminGameId = url.pathname.match(/^\/api\/admin\/jogos\/([^/]+)$/)?.[1];
  if (adminGameId && method === "PUT") {
    const editableGame = gameById(state, decodeURIComponent(adminGameId));
    Object.assign(editableGame, { title: body.titulo, short_description: body.descricao_curta || "", long_description: body.descricao_longa || "", price: Number(body.preco), release_date: body.data_lancamento || "", status: body.status, tags: body.tags || [] });
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
