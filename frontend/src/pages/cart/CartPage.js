import { PrivateLayout } from "../../app/layouts/PrivateLayout";
import { ACCOUNT_PATHS } from "../../app/router/account-routes";
import { Store } from "../../store/store";
import { Actions } from "../../store/actions";
import { navigate } from "../../app/router/navigate";
import { AuthService } from "../../services/auth/auth.service";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { getCoverUrl } from "../../utils/media";
import { formatPrice } from "../../utils/format";
import { Icon, icons } from "../../components/ui/Icon";
import { AccountService } from "../../services/account/account.service";
import { validateCheckout } from "./checkout-validation";

export default async function CartPage() {
  const cart = await AccountService.getCart();
  Store.setState((state) => ({ ...state, cart }));

  const user = Store.getState().user;
  const personalCount = cart.filter((game) => !game.for_gift).length;
  const giftCount = cart
    .filter((game) => game.for_gift)
    .reduce((total, game) => total + game.quantity, 0);
  const total = cart.reduce(
    (acc, game) => acc + game.price * (game.for_gift ? game.quantity : 1),
    0
  );

  const content = `
    <div class="cart-page space-y-8">
      ${PageHeader({
        title: "Carrinho",
        subtitle: `${personalCount} para você e ${giftCount} presente${giftCount !== 1 ? "s" : ""}`,
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
                  <span class="cart-item__mode">
                    ${Icon(game.for_gift ? icons.gift : icons.user, { className: "w-3.5 h-3.5" })}
                    ${game.for_gift ? "Código para presente" : "Para minha biblioteca"}
                  </span>
                  <a href="/game/${game.slug}" data-link class="font-semibold text-sm hover:text-[var(--color-brand-400)] truncate block transition-colors">${game.title}</a>
                  <p class="text-xs text-[var(--color-muted-2)] mt-1">${game.categories?.[0] || ""} • ${game.publisher?.name || ""}</p>
                  <p class="font-bold text-sm mt-1.5 text-[var(--color-accent-400)]">${formatPrice(game.price)}${game.for_gift ? " por código" : ""}</p>
                </div>

                ${
                  game.for_gift
                    ? `<div class="cart-quantity" aria-label="Quantidade de códigos de presente de ${game.title}">
                        <button type="button" data-quantity-step="-1" data-product-id="${game.id}"
                                aria-label="Diminuir códigos de presente de ${game.title}" ${game.quantity === 1 ? "disabled" : ""}>−</button>
                        <label class="sr-only" for="cart-quantity-${game.id}">Códigos de presente de ${game.title}</label>
                        <input id="cart-quantity-${game.id}" data-quantity-input="${game.id}" type="number"
                               min="1" max="10" step="1" inputmode="numeric" value="${game.quantity}"
                               aria-describedby="cart-quantity-hint-${game.id}" />
                        <button type="button" data-quantity-step="1" data-product-id="${game.id}"
                                aria-label="Aumentar códigos de presente de ${game.title}" ${game.quantity === 10 ? "disabled" : ""}>+</button>
                        <small id="cart-quantity-hint-${game.id}">Até 10 códigos</small>
                      </div>`
                    : `<span class="cart-personal-quantity">1 cópia</span>`
                }

                <strong class="cart-item__subtotal">${formatPrice(game.price * (game.for_gift ? game.quantity : 1))}</strong>

                <!-- Remover -->
                <button type="button" data-remove-cart="${game.id}" data-for-gift="${game.for_gift}"
                        class="cart-item__remove text-[var(--color-muted-2)] hover:text-red-400 transition-colors" aria-label="Remover ${game.title}">
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
              <div class="checkout-card__heading">
                <p>Finalização segura</p>
                <h2>Resumo do pedido</h2>
              </div>

              <div class="checkout-summary">
                ${cart
                  .map(
                    (game) => `
                  <div class="checkout-summary__item flex justify-between text-sm">
                    <span class="text-muted truncate pr-2">${game.for_gift ? `${game.quantity}× presente` : "1× pessoal"} — ${game.title}</span>
                    <span class="shrink-0 font-medium">${formatPrice(game.price * (game.for_gift ? game.quantity : 1))}</span>
                  </div>
                `
                  )
                  .join("")}
              </div>

              <div class="checkout-total">
                <span class="font-bold">Total</span>
                <span class="font-display font-bold text-xl text-gradient-brand">${formatPrice(total)}</span>
              </div>

              <fieldset class="checkout-fields">
                <legend>Dados da compra</legend>

                <div class="checkout-field">
                  <label for="checkout-name">Nome completo</label>
                  <input id="checkout-name" name="name" type="text" minlength="3" maxlength="80"
                         autocomplete="name" value="${user?.username || ""}"
                         aria-describedby="checkout-name-error" required />
                  <small id="checkout-name-error" role="alert" hidden></small>
                </div>

                <div class="checkout-field">
                  <label for="checkout-email">E-mail</label>
                  <input id="checkout-email" name="email" type="email" maxlength="255"
                         autocomplete="email" value="${user?.email || ""}"
                         aria-describedby="checkout-email-error" required />
                  <small id="checkout-email-error" role="alert" hidden></small>
                </div>

                <div class="checkout-field">
                  <label for="checkout-payment-method">Forma de pagamento</label>
                  <select id="checkout-payment-method" name="paymentMethod"
                          aria-describedby="checkout-payment-method-hint checkout-payment-method-error" required>
                    <option value="balance">Saldo NekoBox</option>
                  </select>
                  <small id="checkout-payment-method-hint">Nenhum cartão ou dado bancário será solicitado.</small>
                  <small id="checkout-payment-method-error" role="alert" hidden></small>
                </div>

                <div class="checkout-terms">
                  <input id="checkout-terms" name="termsAccepted" type="checkbox"
                         aria-describedby="checkout-terms-hint checkout-terms-error" required />
                  <label for="checkout-terms">Confirmo que esta é uma compra de demonstração.</label>
                  <small id="checkout-terms-hint">O saldo virtual será debitado. Compras pessoais vão para sua biblioteca; presentes geram códigos únicos.</small>
                  <small id="checkout-terms-error" role="alert" hidden></small>
                </div>
              </fieldset>

              <p id="checkout-form-error" class="checkout-form-error" role="alert" hidden></p>

              <button id="btn-checkout" type="submit" class="button-primary w-full py-3 text-sm">
                Confirmar compra
              </button>

              <a href="/hub" data-link class="block text-center text-[var(--color-muted-2)] text-xs hover:text-[var(--color-ink)] transition-colors">
                Continuar Comprando
              </a>
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
            <div id="checkout-gift-codes" class="checkout-gift-codes" hidden>
              <h3>Códigos para enviar aos amigos</h3>
              <p>Copie agora ou consulte depois em Presentes, dentro da sua conta.</p>
              <ul id="checkout-gift-code-list"></ul>
            </div>
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

  const updateQuantity = async (gameId, quantity) => {
    const resolvedQuantity = Number(quantity);
    if (!Number.isInteger(resolvedQuantity) || resolvedQuantity < 1 || resolvedQuantity > 10) {
      showFeedback("A quantidade deve estar entre 1 e 10.", true);
      return;
    }

    const input = document.querySelector(`[data-quantity-input="${gameId}"]`);
    const container = input?.closest(".cart-quantity");
    container?.setAttribute("aria-busy", "true");
    try {
      await Actions.atualizarQuantidadeCarrinho(gameId, resolvedQuantity);
      navigate(ACCOUNT_PATHS.cart, { focusTarget: `[data-quantity-input="${gameId}"]` });
    } catch (error) {
      showFeedback(error.message || "Não foi possível atualizar a quantidade.", true);
      container?.removeAttribute("aria-busy");
    }
  };

  document.querySelectorAll("[data-quantity-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const gameId = button.dataset.productId;
      const input = document.querySelector(`[data-quantity-input="${gameId}"]`);
      updateQuantity(gameId, Number(input?.value) + Number(button.dataset.quantityStep));
    });
  });

  document.querySelectorAll("[data-quantity-input]").forEach((input) => {
    input.addEventListener("change", () => updateQuantity(input.dataset.quantityInput, input.value));
  });

  document.querySelectorAll("[data-remove-cart]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const gameId = btn.getAttribute("data-remove-cart");
      const forGift = btn.dataset.forGift === "true";
      btn.disabled = true;
      try {
        await Actions.removerDoCarrinho(gameId, forGift);
        navigate(ACCOUNT_PATHS.cart);
      } catch (error) {
        btn.disabled = false;
        showFeedback(error.message || "Não foi possível remover o item.", true);
      }
    });
  });

  const form = document.getElementById("checkout-form");
  const fieldMap = {
    name: "checkout-name",
    email: "checkout-email",
    paymentMethod: "checkout-payment-method",
    termsAccepted: "checkout-terms",
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
      name: data.get("name"),
      email: data.get("email"),
      paymentMethod: data.get("paymentMethod"),
      termsAccepted: data.get("termsAccepted") === "on",
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
      const { payments, giftCodes } = await Actions.finalizarCheckoutCarrinho();
      const confirmation = document.getElementById("checkout-confirmation");
      const description = document.getElementById("checkout-confirmation-description");
      const personalPurchases = payments.filter((payment) => !payment.para_presente).length;
      if (description) {
        const parts = [];
        if (personalPurchases) {
          parts.push(
            `${personalPurchases} jogo${personalPurchases !== 1 ? "s" : ""} adicionado${personalPurchases !== 1 ? "s" : ""} à sua biblioteca`
          );
        }
        if (giftCodes.length) {
          parts.push(
            `${giftCodes.length} código${giftCodes.length !== 1 ? "s" : ""} de presente gerado${giftCodes.length !== 1 ? "s" : ""}`
          );
        }
        description.textContent = `${parts.join(" e ")}.`;
      }

      const codesContainer = document.getElementById("checkout-gift-codes");
      const codesList = document.getElementById("checkout-gift-code-list");
      if (giftCodes.length && codesContainer && codesList) {
        giftCodes.forEach((gift) => {
          const item = document.createElement("li");
          const game = document.createElement("span");
          const code = document.createElement("strong");
          const copy = document.createElement("button");

          game.textContent = gift.titulo_produto;
          code.textContent = gift.codigo;
          copy.type = "button";
          copy.textContent = "Copiar";
          copy.setAttribute("aria-label", `Copiar código de ${gift.titulo_produto}`);
          copy.addEventListener("click", async () => {
            await navigator.clipboard.writeText(gift.codigo);
            copy.textContent = "Copiado";
          });

          item.append(game, code, copy);
          codesList.append(item);
        });
        codesContainer.hidden = false;
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
