import { PublicLayout } from "../../app/layouts/PublicLayout";
import { GamesService } from "../../services/games/games.service";
import { resolveRandomBannerUrls } from "../../utils/random-banner";

const principles = [
  {
    number: "1.1",
    title: "Perceptível",
    description:
      "Conteúdo, estados e controles precisam ser apresentados de formas que diferentes pessoas consigam perceber.",
    examples: [
      "Contraste suficiente entre texto e fundo.",
      "Texto alternativo para imagens informativas.",
      "Informações que não dependem apenas de cor.",
    ],
  },
  {
    number: "1.2",
    title: "Operável",
    description:
      "Todas as funções essenciais devem estar disponíveis sem depender de mouse, toque preciso ou movimento.",
    examples: [
      "Navegação completa por teclado.",
      "Foco visível e ordem de navegação previsível.",
      "Suporte a preferências de movimento reduzido.",
    ],
  },
  {
    number: "1.3",
    title: "Compreensível",
    description:
      "Navegação, formulários e mensagens precisam usar linguagem clara e comportamentos consistentes.",
    examples: [
      "Labels e instruções próximos do contexto.",
      "Mensagens de erro objetivas.",
      "Navegação e comportamentos consistentes.",
    ],
  },
  {
    number: "1.4",
    title: "Robusto",
    description:
      "A interface deve comunicar sua estrutura de forma confiável para navegadores e tecnologias assistivas.",
    examples: [
      "HTML semântico como base da interface.",
      "Nomes acessíveis para controles e ações.",
      "Estados ARIA corretos quando necessários.",
    ],
  },
];

const standards = [
  {
    name: "WCAG 2.2",
    scope: "Referência principal",
    description:
      "Buscamos atender ao nível AA das Diretrizes de Acessibilidade para Conteúdo Web, publicadas pelo W3C.",
  },
  {
    name: "WAI-ARIA",
    scope: "Semântica complementar",
    description:
      "Usamos padrões ARIA quando o HTML nativo não expressa sozinho o papel, o estado ou a relação de um componente.",
  },
  {
    name: "eMAG",
    scope: "Contexto brasileiro",
    description:
      "Consideramos as recomendações do Modelo de Acessibilidade em Governo Eletrônico como referência local de boas práticas.",
  },
  {
    name: "ABNT NBR 17225:2025",
    scope: "Referência nacional",
    description:
      "A norma brasileira de acessibilidade em conteúdo e aplicações web complementa a WCAG com requisitos aplicáveis ao contexto nacional.",
  },
];

const implementedFeatures = [
  "Navegação pelas funções essenciais com Tab e Shift + Tab.",
  "Atalho “Pular para o conteúdo” como primeiro item focável.",
  "Foco transferido ao conteúdo principal após mudanças de rota na SPA.",
  "Indicador de foco visível com contraste em links, botões e campos.",
  "Setas, Home e End em grupos de abas e filtros; Escape no menu mobile.",
  "Regiões, títulos, tabelas, formulários e controles com semântica apropriada.",
  "Ícones decorativos ocultos de leitores de tela e ações com nome acessível.",
  "Redução de animações quando o sistema solicita menos movimento.",
];

export default async function AccessibilityPage() {
  const [heroBannerUrl, premiseBannerUrl = heroBannerUrl] = await resolveRandomBannerUrls(
    () => GamesService.getAll(),
    { limit: 2 }
  );

  const content = `
    <div class="accessibility-page">
      <header class="site-container accessibility-hero" aria-labelledby="accessibility-title">
        <img src="${heroBannerUrl}" alt="" class="accessibility-hero__image" fetchpriority="high" />
        <div class="accessibility-hero__backdrop" aria-hidden="true"></div>
        <div class="accessibility-hero__layout">
          <div class="accessibility-hero__content">
            <p class="section-heading__eyebrow mb-3">Acessibilidade no NekoBox</p>
            <h1 id="accessibility-title">Jogar e descobrir devem ser experiências para todos.</h1>
            <p class="accessibility-hero__lead">
              Acessibilidade não é uma etapa final do produto. É uma premissa de projeto que orienta conteúdo,
              interação, código e validação desde o início.
            </p>
            <dl class="accessibility-hero__meta" aria-label="Objetivo de conformidade">
              <div>
                <dt>Objetivo atual</dt>
                <dd>WCAG 2.2 · Nível AA</dd>
              </div>
              <div>
                <dt>Abordagem</dt>
                <dd>Aderência progressiva e testes contínuos</dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <div class="site-container accessibility-content">
        <section id="premissa" class="accessibility-intro" aria-labelledby="premise-title">
          <figure class="accessibility-intro__media">
            <img src="${premiseBannerUrl}" alt="" loading="lazy" />
          </figure>
          <div class="accessibility-intro__content">
            <p class="section-heading__eyebrow mb-2">Nossa premissa</p>
            <h2 id="premise-title">Acesso equivalente, não uma versão separada.</h2>
            <p>
              Projetamos a mesma experiência para diferentes formas de perceber, compreender e operar a interface.
              Isso inclui pessoas com deficiências permanentes, temporárias ou situacionais — e melhora a experiência
              de todo mundo.
            </p>
            <blockquote>
              “Se uma função essencial depende exclusivamente de visão, audição, precisão motora ou mouse, ela ainda
              não está pronta.”
            </blockquote>
          </div>
        </section>

      </div>

      <div class="site-container legal-layout accessibility-legal-layout">
        <nav class="legal-index" aria-label="Nesta página">
          <p>Nesta página</p>
          <a href="#principios">Princípios da WCAG</a>
          <a href="#normas">Normas e padrões</a>
          <a href="#recursos">Recursos atuais</a>
        </nav>

        <article class="legal-content accessibility-legal-content">
          <section id="principios" aria-labelledby="principles-title">
            <h2 id="principles-title">1. Os quatro princípios da WCAG</h2>
            <p>Perceptível, operável, compreensível e robusto são os critérios que orientam nossas decisões de interface.</p>
            <ol class="accessibility-principles">
              ${principles
                .map(
                  ({ number, title, description, examples }) => `
                    <li>
                      <h3><span aria-hidden="true">${number}</span> ${title}</h3>
                      <p>${description}</p>
                      <ul>
                        ${examples.map((example) => `<li>${example}</li>`).join("")}
                      </ul>
                    </li>
                  `
                )
                .join("")}
            </ol>
          </section>

          <section id="normas" aria-labelledby="standards-title">
            <h2 id="standards-title">2. Normas e padrões que orientam o trabalho</h2>
            <p>Aplicamos referências complementares de acordo com o contexto da interface.</p>
            <ul>
              ${standards
                .map(({ name, scope, description }) => `<li><strong>${name}</strong> — ${scope}: ${description}</li>`)
                .join("")}
            </ul>
          </section>

          <section id="recursos" aria-labelledby="features-title">
            <h2 id="features-title">3. Recursos presentes na experiência atual</h2>
            <p>Estes recursos fazem parte do produto hoje e são validados por testes automatizados e percursos manuais de teclado.</p>
            <ul>
              ${implementedFeatures.map((feature) => `<li>${feature}</li>`).join("")}
            </ul>
          </section>

        </article>
      </div>
    </div>
  `;

  return PublicLayout(content);
}
