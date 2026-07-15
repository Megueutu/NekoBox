export function Footer() {
  return `
    <footer class="bg-[var(--color-surface)] border-t border-[var(--color-border)] mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">

        <div class="col-span-2 md:col-span-1">
          <p class="font-display font-bold text-lg mb-2 text-gradient-brand">NEXUSPLAY</p>
          <p class="text-[var(--color-muted)] text-sm leading-relaxed">
            Marketplace de jogos digitais.<br>
            Compre, jogue e gerencie sua biblioteca.
          </p>
        </div>

        <div>
          <p class="text-[var(--color-ink)] font-semibold text-sm mb-3">Navegação</p>
          <ul class="space-y-2">
            <li><a href="/hub" data-link class="text-[var(--color-muted)] hover:text-[var(--color-accent-400)] text-sm transition-colors">Catálogo</a></li>
            <li><a href="/cart" data-link class="text-[var(--color-muted)] hover:text-[var(--color-accent-400)] text-sm transition-colors">Carrinho</a></li>
            <li><a href="/wishlist" data-link class="text-[var(--color-muted)] hover:text-[var(--color-accent-400)] text-sm transition-colors">Lista de Desejos</a></li>
            <li><a href="/library" data-link class="text-[var(--color-muted)] hover:text-[var(--color-accent-400)] text-sm transition-colors">Biblioteca</a></li>
          </ul>
        </div>

        <div>
          <p class="text-[var(--color-ink)] font-semibold text-sm mb-3">Conta</p>
          <ul class="space-y-2">
            <li><a href="/profile" data-link class="text-[var(--color-muted)] hover:text-[var(--color-accent-400)] text-sm transition-colors">Meu Perfil</a></li>
            <li><a href="/library" data-link class="text-[var(--color-muted)] hover:text-[var(--color-accent-400)] text-sm transition-colors">Minha Biblioteca</a></li>
            <li><a href="/login" data-link class="text-[var(--color-muted)] hover:text-[var(--color-accent-400)] text-sm transition-colors">Entrar / Cadastrar</a></li>
          </ul>
        </div>

        <div>
          <p class="text-[var(--color-ink)] font-semibold text-sm mb-3">Suporte</p>
          <ul class="space-y-2">
            <li><span class="text-[var(--color-muted-2)] text-sm">Central de Ajuda</span></li>
            <li><span class="text-[var(--color-muted-2)] text-sm">Termos de Uso</span></li>
            <li><span class="text-[var(--color-muted-2)] text-sm">Privacidade</span></li>
          </ul>
        </div>

      </div>

      <div class="border-t border-[var(--color-border)] px-4 py-4">
        <p class="text-[var(--color-muted-2)] text-xs text-center">
          © ${new Date().getFullYear()} NEXUSPLAY — Marketplace de Jogos Digitais. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  `;
}
