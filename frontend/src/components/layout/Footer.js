import { Store } from "../../store/store";
import { ACCOUNT_PATHS } from "../../app/router/account-routes";

export function Footer() {
  const { user } = Store.getState();
  const isAuthenticated = Boolean(localStorage.getItem("access_token") && user);

  return `
    <footer class="site-footer mt-auto">
      <div class="site-container site-footer__grid">

        <div class="site-footer__brand">
          <a href="/" data-link class="site-footer__logo" aria-label="NekoBox — Início">
            <img src="/cat.svg" class="site-footer__mark" alt="" aria-hidden="true" />
            <img src="/logo.svg" class="site-footer__wordmark" alt="NekoBox" />
          </a>
          <p class="type-small text-muted">
            Marketplace de jogos digitais.<br>
            Compre, jogue e gerencie sua biblioteca.
          </p>
        </div>

        <div>
          <p class="type-small text-ink font-semibold mb-3">Navegação</p>
          <ul class="space-y-2">
            <li><a href="/hub" data-link class="type-small text-muted hover:text-[var(--color-accent-400)] transition-colors">Catálogo</a></li>
            <li><a href="${ACCOUNT_PATHS.cart}" data-link class="type-small text-muted hover:text-[var(--color-accent-400)] transition-colors">Carrinho</a></li>
            <li><a href="${ACCOUNT_PATHS.wishlist}" data-link class="type-small text-muted hover:text-[var(--color-accent-400)] transition-colors">Lista de Desejos</a></li>
            <li><a href="${ACCOUNT_PATHS.library}" data-link class="type-small text-muted hover:text-[var(--color-accent-400)] transition-colors">Biblioteca</a></li>
          </ul>
        </div>

        <div>
          <p class="type-small text-[var(--color-ink)] font-semibold mb-3">Conta</p>
          <ul class="space-y-2">
            ${
              isAuthenticated
                ? `
                  <li><a href="${ACCOUNT_PATHS.profile}" data-link class="type-small text-muted hover:text-[var(--color-accent-400)] transition-colors">Meu Perfil</a></li>
                  <li><a href="${ACCOUNT_PATHS.library}" data-link class="type-small text-muted hover:text-[var(--color-accent-400)] transition-colors">Minha Biblioteca</a></li>
                `
                : `<li><a href="/login" data-login-trigger aria-haspopup="dialog" aria-controls="auth-dialog" class="type-small text-muted hover:text-[var(--color-accent-400)] transition-colors">Entrar / Cadastrar</a></li>`
            }
          </ul>
        </div>

        <div>
          <p class="type-small text-[var(--color-ink)] font-semibold mb-4">Suporte</p>
          <ul class="space-y-2.5">
            <li><a href="/acessibilidade" data-link class="type-small text-muted hover:text-[var(--color-accent-400)] transition-colors">Acessibilidade</a></li>
            <li><a href="/termos-de-uso" data-link class="type-small text-muted hover:text-[var(--color-accent-400)] transition-colors">Termos de Uso</a></li>
            <li><a href="/privacidade" data-link class="type-small text-muted hover:text-[var(--color-accent-400)] transition-colors">Privacidade</a></li>
          </ul>
        </div>

      </div>
    </footer>
  `;
}
