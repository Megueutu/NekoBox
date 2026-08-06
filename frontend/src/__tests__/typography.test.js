import { describe, expect, it } from "vitest";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { Section } from "../components/ui/Section";

describe("Semantic typography", () => {
  it("should use title and subtitle roles in page headers", () => {
    const markup = PageHeader({ title: "Minha biblioteca", subtitle: "Seus jogos" });

    expect(markup).toContain('class="type-page-title"');
    expect(markup).toContain("type-subtitle");
  });

  it("should keep section headings in the content-title role", () => {
    const markup = Section({ title: "Destaques", content: "<p>Conteúdo</p>" });

    expect(markup).toContain("type-content-title");
  });

  it("should use readable roles in an empty state", () => {
    const markup = EmptyState({ title: "Sem jogos", description: "Volte mais tarde." });

    expect(markup).toContain("type-content-title");
    expect(markup).toContain("type-body");
  });
});
