import { formatPrice } from "../../utils/format";
import { Icon, icons } from "../../components/ui/Icon";

const MAX_SCREENSHOTS = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const mediaSelections = new WeakMap();

function getSelection(form) {
  if (!mediaSelections.has(form)) {
    mediaSelections.set(form, { cover: [], banner: [], poster: [], screenshots: [] });
  }
  return mediaSelections.get(form);
}

function existingScreenshotCount(form) {
  return form.querySelectorAll('[data-existing-media][data-media-type="screenshot"]').length;
}

function formatFileSize(size) {
  return size < 1024 * 1024
    ? `${Math.ceil(size / 1024)} KB`
    : `${(size / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}

function updateMediaStatus(form, message = "") {
  const selected = getSelection(form);
  const screenshotCount = existingScreenshotCount(form) + selected.screenshots.length;
  const count = form.querySelector("[data-screenshot-count]");
  const status = form.querySelector("[data-media-selection-status]");

  if (count) count.textContent = `${screenshotCount} / ${MAX_SCREENSHOTS} capturas`;
  if (status) status.textContent = message;
}

export function selectMediaFiles(form, input) {
  const selection = getSelection(form);
  const candidates = Array.from(input.files || []).filter((file) => file instanceof File && file.size > 0);
  if (!candidates.length) return;

  const oversized = candidates.filter((file) => file.size > MAX_FILE_SIZE);
  const files = candidates.filter((file) => file.size <= MAX_FILE_SIZE);
  const messages = [];
  if (oversized.length) {
    messages.push(
      `${oversized.length > 1 ? "Arquivos acima" : "Arquivo acima"} de 10 MB ignorado${oversized.length > 1 ? "s" : ""}: ${oversized.map((file) => file.name).join(", ")}.`
    );
  }

  if (input.name === "screenshots") {
    const remaining = Math.max(0, MAX_SCREENSHOTS - existingScreenshotCount(form) - selection.screenshots.length);
    selection.screenshots.push(...files.slice(0, remaining));
    if (files.length > remaining) {
      messages.push(`Só é possível manter até ${MAX_SCREENSHOTS} capturas por jogo.`);
    }
  } else if (["cover", "banner", "poster"].includes(input.name)) {
    if (files.length) selection[input.name] = files.slice(-1);
  }

  updateMediaStatus(form, messages.join(" "));
  input.value = "";
  renderSelectedMedia(form);
}

export function removeSelectedMedia(form, type, index) {
  const selection = getSelection(form);
  const files = selection[type];
  if (!files || index < 0 || index >= files.length) return;
  files.splice(index, 1);
  updateMediaStatus(form);
  renderSelectedMedia(form);
}

export function getSelectedMediaUploads(form) {
  const selection = getSelection(form);
  return [
    ...selection.cover.map((file) => ({ file, type: "cover" })),
    ...selection.banner.map((file) => ({ file, type: "banner" })),
    ...selection.poster.map((file) => ({ file, type: "poster" })),
    ...selection.screenshots.map((file) => ({ file, type: "screenshot" })),
  ];
}

function selectedMediaUrls(form, type) {
  const selected = [...form.querySelectorAll(`[data-selected-media][data-media-type="${type}"] img`)]
    .map((image) => image.src);
  if (selected.length) return selected;
  return [...form.querySelectorAll(`[data-existing-media][data-media-type="${type}"] img`)]
    .map((image) => image.src);
}

function setPreviewImage(container, url, alt) {
  const image = container.querySelector("[data-preview-image]");
  const placeholder = container.querySelector("[data-preview-placeholder]");
  image.hidden = !url;
  placeholder.hidden = Boolean(url);
  if (url) {
    image.src = url;
    image.alt = alt;
  } else {
    image.removeAttribute("src");
    image.alt = "";
  }
}

function syncMediaPickers(form) {
  const selection = getSelection(form);
  ["cover", "banner", "poster"].forEach((type) => {
    const picker = form.querySelector(`[data-media-picker][data-media-type="${type}"]`);
    if (!picker) return;
    const filled = selection[type].length > 0 || Boolean(form.querySelector(`[data-existing-media][data-media-type="${type}"]`));
    picker.classList.toggle("admin-media-picker--filled", filled);
    const action = picker.querySelector("[data-media-picker-action]");
    if (action) action.textContent = filled ? "Trocar" : "Selecionar";
    const icon = picker.querySelector("[data-media-picker-icon]");
    if (icon) icon.innerHTML = filled ? Icon(icons.check, { className: "w-4 h-4" }) : Icon(icons.upload, { className: "w-4 h-4" });
  });
}

export function updateGamePreview(form) {
  const preview = form?.querySelector("[data-game-preview]");
  if (!preview) return;

  const title = form.elements.titulo.value.trim() || "Título do jogo";
  const price = Number(form.elements.preco.value || 0);
  const formattedPrice = formatPrice(Number.isFinite(price) ? price : 0);
  const tags = form.elements.tags.value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4);
  const bannerUrl = selectedMediaUrls(form, "banner")[0] || "";
  const coverUrl = selectedMediaUrls(form, "cover")[0] || "";
  const screenshots = selectedMediaUrls(form, "screenshot");

  preview.querySelector("[data-preview-title]").textContent = title;
  preview.querySelector("[data-preview-card-title]").textContent = title;
  preview.querySelector("[data-preview-card-description]").textContent = tags[0] || "Jogo digital";
  preview.querySelector("[data-preview-price]").textContent = formattedPrice;
  preview.querySelector("[data-preview-card-price]").textContent = formattedPrice;

  const tagsContainer = preview.querySelector("[data-preview-tags]");
  tagsContainer.replaceChildren(...tags.map((tag) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = tag;
    return chip;
  }));

  setPreviewImage(preview.querySelector("[data-preview-cover]"), coverUrl, `Capa de ${title}`);
  setPreviewImage(preview.querySelector("[data-preview-banner]"), bannerUrl, `Banner de ${title}`);

  syncMediaPickers(form);

  const screenshotsContainer = preview.querySelector("[data-preview-screenshots]");
  screenshotsContainer.replaceChildren();
  if (!screenshots.length) {
    const empty = document.createElement("p");
    empty.textContent = "As screenshots selecionadas aparecerão aqui.";
    screenshotsContainer.append(empty);
    return;
  }
  screenshots.slice(0, 3).forEach((url, index) => {
    const image = document.createElement("img");
    image.src = url;
    image.alt = `Screenshot ${index + 1} de ${title}`;
    screenshotsContainer.append(image);
  });
  if (screenshots.length > 4) {
    const remaining = document.createElement("span");
    remaining.textContent = `+${screenshots.length - 4}`;
    screenshotsContainer.append(remaining);
  }
}

export function renderSelectedMedia(form) {
  const preview = form.querySelector("[data-media-preview]");
  preview.querySelectorAll("[data-selected-media]").forEach((item) => {
    URL.revokeObjectURL(item.querySelector("img").src);
    item.remove();
  });
  const selection = getSelection(form);
  const selections = [
    ...selection.cover.map((file, index) => ({ file, type: "cover", index })),
    ...selection.banner.map((file, index) => ({ file, type: "banner", index })),
    ...selection.poster.map((file, index) => ({ file, type: "poster", index })),
    ...selection.screenshots.map((file, index) => ({ file, type: "screenshots", index })),
  ];
  selections.forEach(({ file, type, index }) => {
    const figure = document.createElement("figure");
    figure.className = "admin-media-item admin-media-item--selected";
    figure.dataset.selectedMedia = "";
    figure.dataset.mediaType = type === "screenshots" ? "screenshot" : type;
    const image = document.createElement("img");
    image.src = URL.createObjectURL(file);
    image.alt = `Prévia de ${file.name}`;
    const caption = document.createElement("figcaption");
    const details = document.createElement("span");
    const typeLabel = type === "screenshots" ? `Captura ${index + 1}` : ({ cover: "Capa", banner: "Banner", poster: "Pôster" }[type]);
    details.textContent = `${typeLabel} · ${formatFileSize(file.size)}`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.dataset.removeSelectedMedia = "";
    remove.dataset.mediaType = type;
    remove.dataset.mediaIndex = String(index);
    remove.setAttribute("aria-label", `Remover ${file.name}`);
    remove.textContent = "Remover";
    caption.append(details, remove);
    figure.append(image, caption);
    preview.append(figure);
  });
  updateMediaStatus(form);
  updateGamePreview(form);
}

export async function saveGameWithMedia(service, id, payload, form) {
  const savedGame = id
    ? await service.updateGame(id, payload)
    : await service.createGame(payload);
  const uploads = getSelectedMediaUploads(form);
  for (const upload of uploads) {
    await service.uploadGameMedia(savedGame.id, upload.type, upload.file);
  }
  return savedGame;
}

export function cleanupSelectedMedia(dialog) {
  dialog.querySelectorAll("[data-selected-media] img").forEach((image) => {
    URL.revokeObjectURL(image.src);
  });
  const form = dialog.querySelector("[data-kind='game']");
  if (form) mediaSelections.delete(form);
}
