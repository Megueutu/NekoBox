import { describe, expect, it } from "vitest";
import { filterAndSortLibrary } from "../pages/library/LibraryPage";
import { formatPlaytime } from "../utils/format";

const games = [
  { title: "Hades", categories: ["Roguelike"], publisher: { name: "Supergiant" }, playtime_minutes: 90, acquired_at: "2026-07-20" },
  { title: "Cyberpunk 2077", categories: ["RPG"], publisher: { name: "CD Projekt" }, playtime_minutes: 240, acquired_at: "2026-07-22" },
];

describe("Library collection", () => {
  it("should find games by title, category or publisher", () => {
    expect(filterAndSortLibrary(games, "rpg")).toHaveLength(1);
    expect(filterAndSortLibrary(games, "supergiant")[0].title).toBe("Hades");
  });

  it("should sort games by acquisition date, title and playtime", () => {
    expect(filterAndSortLibrary(games)[0].title).toBe("Cyberpunk 2077");
    expect(filterAndSortLibrary(games, "", "title")[0].title).toBe("Cyberpunk 2077");
    expect(filterAndSortLibrary(games, "", "playtime")[0].playtime_minutes).toBe(240);
  });

  it("should format accumulated playtime", () => {
    expect(formatPlaytime(45)).toBe("45 min");
    expect(formatPlaytime(135)).toBe("2 h 15 min");
  });
});
