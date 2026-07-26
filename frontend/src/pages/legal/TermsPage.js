import { LegalDocument } from "./LegalDocument";

const sections = [
  {
    id: "aceite",
    title: "1. Aceite dos termos",
    content: `
      <p>Ao criar uma conta, navegar pelo catálogo ou usar qualquer recurso do NekoBox, vc concorda com estes Termos de Uso e com a nossa Política de Privacidade.</p>
      <p>Se não concordar com alguma condição, interrompa o uso da plataforma.</p>
    `,
  },
  {
    id: "conta",
    title: "2. Conta e acesso",
    content: `
      <p>Vc é responsável por fornecer informações corretas, manter suas credenciais protegidas e pelas atividades realizadas em sua conta.</p>
      <ul>
        <li>Não compartilhe senhas ou tokens de acesso.</li>
        <li>Não tente acessar contas, dados ou áreas sem autorização.</li>
        <li>Avise o suporte caso suspeite de uso indevido da sua conta.</li>
      </ul>
    `,
  },
  {
    id: "compras",
    title: "3. Catálogo, compras e biblioteca",
    content: `
      <p>Preços, disponibilidade e informações dos jogos podem ser atualizados. Antes de concluir uma compra, confira o título, o valor e os requisitos do produto.</p>
      <p>Jogos adquiridos ficam associados à conta usada na compra. A presença de um título na biblioteca representa uma licença pessoal de acesso, não a transferência de propriedade intelectual.</p>
    `,
  },
  {
    id: "conduta",
    title: "4. Uso permitido",
    content: `
      <p>O NekoBox deve ser usado de forma legal e respeitosa. É proibido explorar falhas, automatizar acessos abusivos, distribuir código malicioso, fraudar transações ou prejudicar a experiência de outras pessoas.</p>
    `,
  },
  {
    id: "conteudo",
    title: "5. Conteúdo e propriedade intelectual",
    content: `
      <p>Marcas, textos, interfaces e demais elementos do NekoBox pertencem aos respectivos titulares. Capas, imagens e informações dos jogos permanecem sujeitas aos direitos de suas publicadoras e criadores.</p>
      <p>Vc não pode copiar, revender ou explorar comercialmente esses materiais sem autorização.</p>
    `,
  },
  {
    id: "disponibilidade",
    title: "6. Disponibilidade e alterações",
    content: `
      <p>Podemos realizar manutenção, corrigir falhas ou modificar funcionalidades. Buscamos manter a plataforma disponível, mas não garantimos operação ininterrupta ou livre de erros.</p>
    `,
  },
  {
    id: "encerramento",
    title: "7. Suspensão e encerramento",
    content: `
      <p>Contas podem ser suspensas ou encerradas em caso de fraude, violação destes termos, risco à segurança ou obrigação legal. Quando possível, informaremos o motivo e os canais disponíveis para contestação.</p>
    `,
  },
  {
    id: "contato",
    title: "8. Dúvidas e atualizações",
    content: `
      <p>Estes termos podem mudar para refletir novas funcionalidades ou requisitos legais. A versão vigente e sua data de atualização estarão sempre publicadas nesta página.</p>
      <p>Em caso de dúvida, use os canais de suporte disponibilizados pelo NekoBox.</p>
    `,
  },
];

export default function TermsPage() {
  return LegalDocument({
    eyebrow: "Regras da plataforma",
    title: "Termos de Uso",
    introduction: "Estas condições explicam as regras para acessar o NekoBox, adquirir jogos e usar os recursos da sua conta.",
    updatedAt: "22 de julho de 2026",
    sections,
  });
}
