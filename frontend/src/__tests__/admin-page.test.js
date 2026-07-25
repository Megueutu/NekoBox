import { beforeEach, describe, expect, it, vi } from "vitest";

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
    expect(dialog.querySelector("[data-preview-cover] img").src).toBe("https://example.com/cover.jpg");
    expect(dialog.querySelector("[data-preview-banner] img").src).toBe("https://example.com/banner.jpg");
  });
});
