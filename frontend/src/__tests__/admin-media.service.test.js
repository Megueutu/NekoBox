import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminService } from "../services/admin/admin.service";

describe("Admin media service", () => {
  beforeEach(() => {
    localStorage.setItem("access_token", "admin-token");
    vi.restoreAllMocks();
  });

  it("should upload game media as multipart form data", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ id: 1, tipo: "cover" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    ));
    const file = new File(["image"], "cover.png", { type: "image/png" });

    await AdminService.uploadGameMedia(10, "cover", file);

    const request = fetchMock.mock.calls[0][1];
    expect(request.body).toBeInstanceOf(FormData);
    expect(request.headers["Content-Type"]).toBeUndefined();
    expect(request.body.get("tipo")).toBe("cover");
    expect(request.body.get("arquivo").name).toBe("cover.png");
  });

  it("should request deletion for the selected game media", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    await AdminService.deleteGameMedia(10, 21);

    expect(fetchMock.mock.calls[0][0]).toContain("/api/admin/jogos/10/midias/21");
  });
});
