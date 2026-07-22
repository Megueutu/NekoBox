import { LegalDocument } from "./LegalDocument";

const sections = [
  {
    id: "dados",
    title: "1. Dados que tratamos",
    content: `
      <p>Tratamos os dados necessários para oferecer a conta e os recursos do marketplace.</p>
      <ul>
        <li>Dados de cadastro, como nome de usuário, e-mail, avatar e biografia.</li>
        <li>Dados da conta, incluindo biblioteca, lista de desejos, carrinho e histórico de compras.</li>
        <li>Dados de uso, como preferências de interface, sessões e interações com a plataforma.</li>
        <li>Informações técnicas indispensáveis à segurança e ao funcionamento do serviço.</li>
      </ul>
    `,
  },
  {
    id: "finalidades",
    title: "2. Como usamos os dados",
    content: `
      <p>Usamos essas informações para autenticar usuários, processar ações solicitadas, exibir jogos adquiridos, personalizar preferências, prevenir fraudes, corrigir falhas e melhorar a experiência.</p>
    `,
  },
  {
    id: "bases",
    title: "3. Bases e escolhas",
    content: `
      <p>O tratamento pode ocorrer para executar o serviço solicitado, cumprir obrigações legais, proteger direitos e segurança ou atender interesses legítimos compatíveis com suas expectativas.</p>
      <p>Quando o consentimento for necessário, vc poderá revogá-lo pelos meios disponibilizados, sem afetar tratamentos anteriores válidos.</p>
    `,
  },
  {
    id: "compartilhamento",
    title: "4. Compartilhamento",
    content: `
      <p>Dados podem ser processados por fornecedores que apoiam autenticação, hospedagem de mídia e infraestrutura. Eles devem atuar conforme instruções do NekoBox e adotar medidas de proteção adequadas.</p>
      <p>Também podemos compartilhar informações quando houver obrigação legal, ordem de autoridade competente ou necessidade de proteger direitos e segurança.</p>
    `,
  },
  {
    id: "armazenamento-local",
    title: "5. Armazenamento no dispositivo",
    content: `
      <p>O navegador pode armazenar token de sessão e preferências visuais para manter vc autenticado e preservar suas escolhas. Limpar os dados do site pode encerrar a sessão e restaurar configurações padrão.</p>
    `,
  },
  {
    id: "retencao",
    title: "6. Retenção e segurança",
    content: `
      <p>Mantemos dados pelo período necessário às finalidades descritas e às obrigações aplicáveis. Adotamos controles técnicos e organizacionais para reduzir riscos de acesso indevido, perda e alteração.</p>
      <p>Nenhum sistema é totalmente imune a incidentes; por isso, medidas de segurança são revisadas continuamente.</p>
    `,
  },
  {
    id: "direitos",
    title: "7. Seus direitos",
    content: `
      <p>Nos termos da legislação aplicável, vc pode solicitar confirmação de tratamento, acesso, correção, portabilidade, eliminação ou informações sobre compartilhamento, além de contestar tratamentos quando cabível.</p>
      <p>Alguns dados podem ser mantidos para cumprir obrigações legais, prevenir fraude ou resguardar direitos.</p>
    `,
  },
  {
    id: "contato",
    title: "8. Contato e mudanças",
    content: `
      <p>Esta política pode ser atualizada para refletir mudanças no produto ou na legislação. A versão vigente e sua data estarão publicadas nesta página.</p>
      <p>Para exercer direitos ou tirar dúvidas, use os canais de suporte disponibilizados pelo NekoBox.</p>
    `,
  },
];

export default function PrivacyPage() {
  return LegalDocument({
    eyebrow: "Transparência e proteção",
    title: "Política de Privacidade",
    introduction: "Esta política explica quais dados o NekoBox trata, para quais finalidades e quais escolhas estão disponíveis pra vc.",
    updatedAt: "22 de julho de 2026",
    sections,
  });
}
