import { LegalDocument } from "./legal/LegalDocument";

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

const sections = [
  {
    id: "principios",
    title: "1. Os quatro princípios da WCAG",
    content: `
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
    `,
  },
  {
    id: "normas",
    title: "2. Normas e padrões que orientam o trabalho",
    content: `
      <p>Aplicamos referências complementares de acordo com o contexto da interface.</p>
      <ul>
        ${standards
          .map(({ name, scope, description }) => `<li><strong>${name}</strong> — ${scope}: ${description}</li>`)
          .join("")}
      </ul>
    `,
  },
  {
    id: "recursos",
    title: "3. Recursos presentes na experiência atual",
    content: `
      <p>Estes recursos fazem parte do produto hoje e são validados por testes automatizados e percursos manuais de teclado.</p>
      <ul>
        ${implementedFeatures.map((feature) => `<li>${feature}</li>`).join("")}
      </ul>
    `,
  },
];

export default function AccessibilityPage() {
  return LegalDocument({
    title: "Jogar deve ser uma experiência para todos.",
    introduction:
      "Acessibilidade não é uma etapa final do produto. É uma premissa de projeto que orienta conteúdo, interação, código e validação desde o início.",
    sections,
  });
}
