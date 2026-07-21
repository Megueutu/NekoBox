import { PublicLayout } from "../../app/layouts/PublicLayout";

const principles = [
  {
    number: "01",
    title: "Perceptível",
    description:
      "Conteúdo, estados e controles precisam ser apresentados de formas que diferentes pessoas consigam perceber.",
    examples: "Contraste, texto alternativo, hierarquia semântica e conteúdo que não depende apenas de cor.",
  },
  {
    number: "02",
    title: "Operável",
    description:
      "Todas as funções essenciais devem estar disponíveis sem depender de mouse, toque preciso ou movimento.",
    examples: "Teclado, foco visível, skip link, ordem previsível e suporte a movimento reduzido.",
  },
  {
    number: "03",
    title: "Compreensível",
    description:
      "Navegação, formulários e mensagens precisam usar linguagem clara e comportamentos consistentes.",
    examples: "Labels associados, instruções próximas do contexto, erros objetivos e navegação estável.",
  },
  {
    number: "04",
    title: "Robusto",
    description:
      "A interface deve comunicar sua estrutura de forma confiável para navegadores e tecnologias assistivas.",
    examples: "HTML semântico, nomes acessíveis, estados ARIA corretos e componentes testáveis.",
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

export default function AccessibilityPage() {
  const content = `
    <div class="accessibility-page">
      <header class="accessibility-hero" aria-labelledby="accessibility-title">
        <div class="site-container accessibility-hero__layout">
          <div>
            <p class="section-heading__eyebrow mb-3">Acessibilidade na NexusPlay</p>
            <h1 id="accessibility-title">Jogar e descobrir devem ser experiências para todos.</h1>
            <p class="accessibility-hero__lead">
              Acessibilidade não é uma etapa final do produto. É uma premissa de projeto que orienta conteúdo,
              interação, código e validação desde o início.
            </p>
          </div>
          <div class="accessibility-status" aria-label="Objetivo de conformidade">
            <span>Objetivo atual</span>
            <strong>WCAG 2.2 · Nível AA</strong>
            <p>Aderência progressiva, testada continuamente e sem alegação de certificação formal.</p>
          </div>
        </div>
      </header>

      <nav class="site-container accessibility-shortcuts" aria-label="Nesta página">
        <span>Nesta página</span>
        <a href="#premissa">Nossa premissa</a>
        <a href="#principios">Princípios</a>
        <a href="#normas">Normas</a>
        <a href="#recursos">Recursos atuais</a>
        <a href="#evolucao">Evolução</a>
      </nav>

      <div class="site-container accessibility-content">
        <section id="premissa" class="accessibility-intro" aria-labelledby="premise-title">
          <p class="accessibility-section-index" aria-hidden="true">01</p>
          <div>
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

        <section id="principios" aria-labelledby="principles-title">
          <div class="accessibility-heading">
            <div>
              <p class="section-heading__eyebrow mb-2">Como tomamos decisões</p>
              <h2 id="principles-title">Os quatro princípios da WCAG</h2>
            </div>
            <p>Perceptível, operável, compreensível e robusto.</p>
          </div>
          <div class="accessibility-principles">
            ${principles
              .map(
                ({ number, title, description, examples }) => `
                  <article>
                    <span aria-hidden="true">${number}</span>
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <small>${examples}</small>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>

        <section id="normas" aria-labelledby="standards-title">
          <div class="accessibility-heading">
            <div>
              <p class="section-heading__eyebrow mb-2">Referências adotadas</p>
              <h2 id="standards-title">Normas e padrões que orientam o trabalho</h2>
            </div>
            <p>Referências complementares, aplicadas de acordo com o contexto da interface.</p>
          </div>
          <div class="accessibility-standards">
            ${standards
              .map(
                ({ name, scope, description }) => `
                  <article>
                    <p>${scope}</p>
                    <h3>${name}</h3>
                    <span>${description}</span>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>

        <section id="recursos" class="accessibility-features" aria-labelledby="features-title">
          <div>
            <p class="section-heading__eyebrow mb-2">Já disponível</p>
            <h2 id="features-title">Recursos presentes na experiência atual</h2>
            <p>
              Estes recursos fazem parte do produto hoje e são validados por testes automatizados e percursos manuais
              de teclado.
            </p>
          </div>
          <ul>
            ${implementedFeatures.map((feature) => `<li>${feature}</li>`).join("")}
          </ul>
        </section>

        <section id="evolucao" class="accessibility-evolution" aria-labelledby="evolution-title">
          <div>
            <p class="section-heading__eyebrow mb-2">Compromisso contínuo</p>
            <h2 id="evolution-title">Acessibilidade nunca fica “concluída”.</h2>
          </div>
          <div>
            <p>
              Novas páginas, conteúdos e interações podem introduzir barreiras. Por isso, tratamos conformidade como
              um processo contínuo: revisar, testar com diferentes tecnologias assistivas, registrar limitações e
              corrigir regressões.
            </p>
            <p>
              A NexusPlay ainda não passou por uma auditoria externa de conformidade. Nosso objetivo é evoluir a
              cobertura com testes em leitores de tela, zoom ampliado, alto contraste e diferentes dispositivos de entrada.
            </p>
            <a href="/" data-link class="button-primary px-5 py-3">Voltar para a loja</a>
          </div>
        </section>
      </div>
    </div>
  `;

  return PublicLayout(content);
}
