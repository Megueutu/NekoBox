import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSelectedMediaUploads, selectMediaFiles } from "../pages/admin/admin-game-preview";

vi.mock("../services/admin/admin.service", () => ({
  AdminService: {
    getDashboard: vi.fn(),
    getGiftCards: vi.fn(),
    getUsers: vi.fn(),
    getGames: vi.fn(),
  },
}));

import AdminPage, { afterRender } from "../pages/admin/AdminPage";
import { AdminService } from "../services/admin/admin.service";

describe("Admin page", () => {
  beforeEach(() => {
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: vi.fn((file) => `blob:${file.name}`) },
      revokeObjectURL: { configurable: true, value: vi.fn() },
    });
    AdminService.getDashboard.mockResolvedValue({
      receita: 349.8,
      vendas: 2,
      ticket_medio: 174.9,
      compradores: 2,
      usuarios: 4,
      jogos_ativos: 3,
      evolucao: [],
      mais_vendidos: [],
      vendas_recentes: [],
    });
    AdminService.getGiftCards.mockResolvedValue([]);
    AdminService.getUsers.mockResolvedValue([
      {
        id: 1,
        nome_usuario: "admin",
        email: "admin@admin.com",
        saldo: 0,
        papel: "ADMIN",
        criado_em: "2026-07-23T10:00:00",
      },
    ]);
    AdminService.getGames.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("should render all management sections with an accessible navigation", async () => {
    const container = document.createElement("div");
    container.innerHTML = await AdminPage();

    expect(container.querySelectorAll("[data-admin-section]")).toHaveLength(4);
    expect(container.querySelector('[data-admin-panel="dashboard"]')).not.toBeNull();
    expect(container.querySelector('[data-admin-panel="gift-cards"]')).not.toBeNull();
    expect(container.querySelector('[data-admin-panel="users"]')).not.toBeNull();
    expect(container.querySelector('[data-admin-panel="games"]')).not.toBeNull();
    expect(container.querySelector("footer")).toBeNull();
    expect(container.querySelector('a[href="/hub"]')).toBeNull();
    expect(container.querySelector("#admin-logout")).not.toBeNull();
  });

  it("should center useful empty states when dashboard data is unavailable", async () => {
    const container = document.createElement("div");
    container.innerHTML = await AdminPage();

    expect(container.querySelectorAll("[data-admin-panel=\"dashboard\"] .admin-empty-state")).toHaveLength(3);
    expect(container.textContent).toContain("A evolução começa na primeira venda");
    expect(container.textContent).toContain("O ranking será montado aqui");
  });

  it("should render dashboard content when sales data is available", async () => {
    AdminService.getDashboard.mockResolvedValue({
      receita: 329.8, vendas: 2, ticket_medio: 164.9, compradores: 2, usuarios: 4, jogos_ativos: 3,
      evolucao: [{ data: "2026-08-01", receita: 129.9, vendas: 1 }, { data: "2026-08-02", receita: 199.9, vendas: 1 }],
      mais_vendidos: [{ titulo: "Hades", vendas: 1, receita: 129.9 }],
      vendas_recentes: [{ criado_em: "2026-08-02T18:42:00", usuario: "marina", jogo: "Cyberpunk 2077", valor: 199.9 }],
    });
    const container = document.createElement("div");
    container.innerHTML = await AdminPage();

    expect(container.querySelectorAll(".admin-chart li")).toHaveLength(2);
    expect(container.querySelector(".admin-ranking strong")?.textContent).toBe("Hades");
    expect(container.querySelector("[data-admin-panel=\"dashboard\"] .admin-empty-state")).toBeNull();
  });

  it("should protect the single admin from a delete action in the interface", async () => {
    const container = document.createElement("div");
    container.innerHTML = await AdminPage();

    expect(container.querySelector('[data-admin-delete-user="1"]')).toBeNull();
    expect(container.textContent).toContain("ADMIN");
  });

  it("should render the uploaded cover returned by the backend", async () => {
    AdminService.getGames.mockResolvedValue([{
      id: 10,
      titulo: "Cyberpunk 2077",
      slug: "cyberpunk-2077",
      preco: 199.9,
      status: "published",
      midias: [{
        id: 21,
        tipo: "cover",
        posicao: 1,
        url: "https://res.cloudinary.com/demo/image/upload/cover.jpg",
      }],
      capa_url: "https://res.cloudinary.com/demo/image/upload/cover.jpg",
    }]);
    const container = document.createElement("div");

    container.innerHTML = await AdminPage();

    expect(container.querySelector(".admin-game-cover")?.getAttribute("style")).toContain("res.cloudinary.com");
  });

  it("should open the user editor with the normalized dialog structure", async () => {
    document.body.innerHTML = await AdminPage();
    const dialog = document.getElementById("admin-dialog");
    dialog.showModal = vi.fn(() => dialog.setAttribute("open", ""));
    afterRender();

    document.querySelector('[data-admin-edit-user="1"]').click();

    expect(dialog.dataset.variant).toBe("user");
    expect(dialog.getAttribute("aria-labelledby")).toBe("admin-dialog-title");
    expect(dialog.querySelector("#admin-dialog-title")?.textContent).toBe("admin");
    expect(dialog.querySelector('button[type="submit"]')?.classList).toContain("admin-form-wide");
  });

  it("should update the game preview while editing catalog fields", async () => {
    AdminService.getGames.mockResolvedValue([{
      id: 10,
      titulo: "Cyberpunk 2077",
      slug: "cyberpunk-2077",
      descricao_curta: "Night City.",
      preco: 199.9,
      status: "published",
      tags: ["RPG"],
      midias: [
        { id: 21, tipo: "cover", posicao: 1, url: "https://example.com/cover.jpg" },
        { id: 22, tipo: "banner", posicao: 1, url: "https://example.com/banner.jpg" },
      ],
    }]);
    document.body.innerHTML = await AdminPage();
    const dialog = document.getElementById("admin-dialog");
    dialog.showModal = vi.fn(() => dialog.setAttribute("open", ""));
    afterRender();

    document.querySelector('[data-admin-edit-game="10"]').click();
    const form = dialog.querySelector('[data-kind="game"]');
    form.elements.titulo.value = "Novo título";
    form.elements.preco.value = "89.9";
    form.elements.tags.value = "Indie, Aventura";
    form.elements.titulo.dispatchEvent(new Event("input", { bubbles: true }));

    expect(dialog.querySelector("[data-preview-title]").textContent).toBe("Novo título");
    expect(dialog.querySelector("[data-preview-card-title]").textContent).toBe("Novo título");
    expect(dialog.querySelector("[data-preview-card-price]").textContent).toContain("89,90");
    expect([...dialog.querySelectorAll("[data-preview-tags] span")].map((item) => item.textContent))
      .toEqual(["Indie", "Aventura"]);
    expect(dialog.querySelector("[data-preview-poster] img").hidden).toBe(true);
    expect(dialog.querySelector("[data-preview-banner] img").src).toBe("https://example.com/banner.jpg");

    form.elements.preco.value = "0";
    form.elements.preco.dispatchEvent(new Event("input", { bubbles: true }));

    expect(dialog.querySelector("[data-preview-card-price]").textContent).toBe("Gratuito");
  });

  it("should organize the game form into content and publication sections", async () => {
    document.body.innerHTML = await AdminPage();
    const dialog = document.getElementById("admin-dialog");
    dialog.showModal = vi.fn(() => dialog.setAttribute("open", ""));
    afterRender();

    document.querySelector('[data-admin-create="game"]').click();

    expect(dialog.querySelector("#admin-game-content-title")?.textContent).toBe("Conteúdo do catálogo");
    expect(dialog.querySelector("#admin-game-publication-title")?.textContent).toBe("Publicação e descoberta");
    expect(dialog.querySelector('input[name="titulo"]')?.getAttribute("placeholder"))
      .toBe("Ex.: Hades II");
    expect(dialog.querySelector('[name="preco"]')?.closest(".admin-input-prefix")).not.toBeNull();
    expect(dialog.querySelector('[name="preco"]')?.closest(".admin-input-prefix")?.querySelector("svg")).not.toBeNull();
    expect(dialog.querySelectorAll(".field-required")).toHaveLength(2);
    expect(dialog.querySelectorAll(".admin-field .field-tooltip")).toHaveLength(7);
    expect(dialog.querySelector(".admin-field small")).toBeNull();
  });

  it("should accumulate screenshot thumbnails up to ten files", () => {
    document.body.innerHTML = `
      <form data-kind="game">
        <input name="screenshots" type="file" multiple>
        <b data-screenshot-count></b><p data-media-selection-status></p>
        <div data-media-preview></div>
      </form>`;
    const form = document.querySelector("form");
    const input = form.elements.screenshots;
    const firstSelection = Array.from({ length: 6 }, (_, index) => new File(["image"], `first-${index}.jpg`, { type: "image/jpeg" }));
    const secondSelection = Array.from({ length: 6 }, (_, index) => new File(["image"], `second-${index}.jpg`, { type: "image/jpeg" }));

    Object.defineProperty(input, "files", { configurable: true, value: firstSelection });
    selectMediaFiles(form, input);
    Object.defineProperty(input, "files", { configurable: true, value: secondSelection });
    selectMediaFiles(form, input);

    expect(getSelectedMediaUploads(form)).toHaveLength(10);
    expect(form.querySelectorAll("[data-selected-media]")).toHaveLength(10);
    expect(form.querySelector("[data-screenshot-count]").textContent).toBe("10 / 10 capturas");
  });

  it("should keep a selected poster as a single media upload", () => {
    document.body.innerHTML = `
      <form data-kind="game"><input name="poster" type="file"><div data-media-preview></div></form>`;
    const form = document.querySelector("form");
    const input = form.elements.poster;
    const poster = new File(["image"], "poster.jpg", { type: "image/jpeg" });

    Object.defineProperty(input, "files", { configurable: true, value: [poster] });
    selectMediaFiles(form, input);

    expect(getSelectedMediaUploads(form)).toEqual([{ file: poster, type: "poster" }]);
  });
});
