import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/admin/admin.service", () => ({
  AdminService: {
    getDashboard: vi.fn(),
    getGiftCards: vi.fn(),
    getUsers: vi.fn(),
    getGames: vi.fn(),
  },
}));

import AdminPage from "../pages/admin/AdminPage";
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
        email: "admin@nekobox.local",
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
  });

  it("should protect the single admin from a delete action in the interface", async () => {
    const container = document.createElement("div");
    container.innerHTML = await AdminPage();

    expect(container.querySelector('[data-admin-delete-user="1"]')).toBeNull();
    expect(container.textContent).toContain("ADMIN");
  });
});
