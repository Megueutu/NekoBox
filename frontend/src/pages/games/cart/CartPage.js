import { PrivateLayout } from "../../../app/layouts/PrivateLayout";
import { ACCOUNT_PATHS } from "../../../app/router/account-routes";
import { Store } from "../../../store/store";
import { Actions } from "../../../store/actions";
import { navigate } from "../../../app/router/navigate";
import { AuthService } from "../../../services/auth.service";
import { EmptyState } from "../../../components/ui/EmptyState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { getCoverUrl } from "../../../utils/media";
import { formatPrice } from "../../../utils/format";
import { Icon, icons } from "../../../components/ui/Icon";
import { AccountService } from "../../../services/account.service";
import { validateCheckout } from "./checkout-validation";

export default async function CartPage() {
  const cart = await AccountService.getCart();
  Store.setState((state) => ({ ...state, cart }));

  const user = Store.getState().user;
  const total = cart.reduce((acc, game) => acc + game.price, 0);

  const content = `
    <div class="cart-page space-y-8">
      ${PageHeader({
        title: "Carrinho",
        subtitle: `${cart.length} jogo${cart.length !== 1 ? "s" : ""} para sua biblioteca`,
      })}

      <p id="cart-feedback" class="cart-feedback" role="status" aria-live="polite" hidden></p>

      ${
        cart.length === 0
          ? EmptyState({
              icon: icons.shoppingCart,
              title: "Seu carrinho está vazio",
              description: "Adicione jogos ao carrinho para continuar.",
              ctaHref: "/hub",
              ctaLabel: "Explorar Catálogo",
            })
          : `
        <div class="cart-layout grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Lista de Itens -->
          <div class="cart-items lg:col-span-2 space-y-4">
            ${cart
              .map(
                (game) => `
              <article class="cart-item panel">
                <!-- Capa Compacta -->
                <a href="/game/${game.slug}" data-link class="shrink-0">
                  <div class="cart-item__cover bg-cover bg-center bg-no-repeat rounded-lg bg-[var(--color-surface-2)]"
                       role="img" aria-label="Capa do jogo ${game.title}"
                       style="background-image: url('${getCoverUrl(game)}')"></div>
                </a>
                <!-- Infos -->
                <div class="cart-item__content">
                  <a href="/game/${game.slug}" data-link class="type-card-title hover:text-[var(--color-brand-400)] truncate block transition-colors">${game.title}</a>
                  <p class="type-caption text-[var(--color-muted-2)] mt-1">${game.publisher?.name || ""}</p>
                  <p class="type-small font-bold mt-1.5 text-[var(--color-accent-400)]">${formatPrice(game.price)}</p>
                </div>

                <!-- Remover -->
                <button type="button" data-remove-cart="${game.id}"
                        class="cart-item__remove text-[var(--color-muted-2)] hover:text-[var(--color-danger)] transition-colors" aria-label="Remover ${game.title}">
                  ${Icon(icons.trash)}
                </button>
              </article>
            `
              )
              .join("")}
          </div>

          <!-- Resumo do Pedido -->
          <div class="lg:col-span-1">
            <form id="checkout-form" class="checkout-card panel lg:sticky lg:top-24" novalidate>

              <div class="checkout-total">
                <span class="font-bold">Total</span>
                <span class="type-content-title text-brand">${formatPrice(total)}</span>
              </div>

              <fieldset class="checkout-fields">
                <div class="checkout-field">
                  <label for="checkout-payment-method">Forma de pagamento</label>
                  <select id="checkout-payment-method" class="ui-control" name="paymentMethod"
                          aria-describedby="checkout-payment-method-hint checkout-payment-method-error" required>
                    <option value="balance">Saldo NekoBox</option>
                  </select>
                  <small id="checkout-payment-method-error" role="alert" hidden></small>
                </div>
              </fieldset>

              <p id="checkout-form-error" class="checkout-form-error" role="alert" hidden></p>

              <button id="btn-checkout" type="submit" class="button-primary w-full py-3">
                Confirmar compra
              </button>
            </form>
          </div>
        </div>

        <section id="checkout-confirmation" class="checkout-confirmation panel" tabindex="-1"
                 aria-labelledby="checkout-confirmation-title" role="status" aria-live="polite" hidden>
          <span>${Icon(icons.circleCheck, { className: "w-5 h-5" })}</span>
          <div>
            <p>Pedido confirmado</p>
            <h2 id="checkout-confirmation-title">Compra concluída com sucesso</h2>
            <p id="checkout-confirmation-description"></p>
          </div>
          <a href="${ACCOUNT_PATHS.library}" data-link class="button-primary">Abrir biblioteca</a>
        </section>
      `
      }
    </div>
  `;

  return PrivateLayout(content);
}

export async function afterRender() {
  const feedback = document.getElementById("cart-feedback");

  const showFeedback = (message, isError = false) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.hidden = false;
    feedback.classList.toggle("cart-feedback--error", isError);
  };

  document.querySelectorAll("[data-remove-cart]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const gameId = btn.getAttribute("data-remove-cart");
      btn.disabled = true;
      try {
        await Actions.removerDoCarrinho(gameId);
        navigate(ACCOUNT_PATHS.cart);
      } catch (error) {
        btn.disabled = false;
        showFeedback(error.message || "Não foi possível remover o item.", true);
      }
    });
  });

  const form = document.getElementById("checkout-form");
  const fieldMap = {
    paymentMethod: "checkout-payment-method",
  };

  const clearFieldError = (field) => {
    const input = document.getElementById(fieldMap[field]);
    const error = document.getElementById(`${fieldMap[field]}-error`);
    input?.removeAttribute("aria-invalid");
    if (error) {
      error.textContent = "";
      error.hidden = true;
    }
  };

  Object.entries(fieldMap).forEach(([field, id]) => {
    document.getElementById(id)?.addEventListener("input", () => clearFieldError(field));
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const validation = validateCheckout({
      paymentMethod: data.get("paymentMethod"),
    });

    Object.keys(fieldMap).forEach(clearFieldError);
    const formError = document.getElementById("checkout-form-error");
    if (formError) {
      formError.textContent = "";
      formError.hidden = true;
    }

    if (!validation.isValid) {
      Object.entries(validation.errors).forEach(([field, message]) => {
        const input = document.getElementById(fieldMap[field]);
        const error = document.getElementById(`${fieldMap[field]}-error`);
        input?.setAttribute("aria-invalid", "true");
        if (error) {
          error.textContent = message;
          error.hidden = false;
        }
      });
      document.getElementById(fieldMap[Object.keys(validation.errors)[0]])?.focus();
      return;
    }

    const button = document.getElementById("btn-checkout");
    const idleLabel = button.textContent;
    form.setAttribute("aria-busy", "true");
    button.disabled = true;
    button.textContent = "Confirmando compra...";

    try {
      const { payments } = await Actions.finalizarCheckoutCarrinho();
      const confirmation = document.getElementById("checkout-confirmation");
      const description = document.getElementById("checkout-confirmation-description");
      if (description) {
        description.textContent = `${payments.length} jogo${payments.length !== 1 ? "s" : ""} adicionado${payments.length !== 1 ? "s" : ""} à sua biblioteca.`;
      }
      form.hidden = true;
      confirmation.hidden = false;
      confirmation.focus();
    } catch (error) {
      form.removeAttribute("aria-busy");
      button.disabled = false;
      button.textContent = idleLabel;
      if (formError) {
        formError.textContent = error.message || "Não foi possível concluir a compra.";
        formError.hidden = false;
        formError.focus?.();
      }
    }
  });

  document.getElementById("btn-sidebar-logout")?.addEventListener("click", async () => {
    await AuthService.logout();
    navigate("/hub");
  });
}
