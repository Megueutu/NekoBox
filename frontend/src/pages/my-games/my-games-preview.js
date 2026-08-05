import { formatDate, money } from "../admin/admin-format";

export function filesToUpload(file, type) {
  return file instanceof File && file.size > 0 ? [{ file, type }] : [];
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

export function updateGamePreview(form) {
  const preview = form?.querySelector("[data-game-preview]");
  if (!preview) return;

  const title = form.elements.titulo.value.trim() || "Título do jogo";
  const description = form.elements.descricao_curta.value.trim()
    || "Uma breve descrição vai aparecer aqui.";
  const price = Number(form.elements.preco.value || 0);
  const formattedPrice = money.format(Number.isFinite(price) ? price : 0);
  const releaseDate = form.elements.release_date.value;
  const status = form.elements.status.value;
  const statusLabels = { draft: "Rascunho", published: "Publicado", archived: "Arquivado" };
  const tags = form.elements.tags.value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4);
  const coverUrl = selectedMediaUrls(form, "cover")[0] || "";
  const bannerUrl = selectedMediaUrls(form, "banner")[0] || "";
  const screenshots = selectedMediaUrls(form, "screenshot");

  preview.querySelector("[data-preview-title]").textContent = title;
  preview.querySelector("[data-preview-card-title]").textContent = title;
  preview.querySelector("[data-preview-description]").textContent = description;
  preview.querySelector("[data-preview-card-description]").textContent = tags[0] || "Jogo digital";
  preview.querySelector("[data-preview-price]").textContent = formattedPrice;
  preview.querySelector("[data-preview-card-price]").textContent = formattedPrice;
  preview.querySelector("[data-preview-release]").textContent = releaseDate
    ? formatDate(releaseDate)
    : "Data a definir";

  const statusBadge = preview.querySelector("[data-preview-status]");
  statusBadge.textContent = statusLabels[status] || status;
  statusBadge.dataset.status = status;

  const tagsContainer = preview.querySelector("[data-preview-tags]");
  tagsContainer.replaceChildren(...tags.map((tag) => {
    const chip = document.createElement("span");
    chip.textContent = tag;
    return chip;
  }));

  setPreviewImage(preview.querySelector("[data-preview-cover]"), coverUrl, `Capa de ${title}`);
  setPreviewImage(preview.querySelector("[data-preview-banner]"), bannerUrl, `Banner de ${title}`);

  const screenshotsContainer = preview.querySelector("[data-preview-screenshots]");
  screenshotsContainer.replaceChildren();
  if (!screenshots.length) {
    const empty = document.createElement("p");
    empty.textContent = "As screenshots selecionadas aparecerão aqui.";
    screenshotsContainer.append(empty);
    return;
  }
  screenshots.slice(0, 4).forEach((url, index) => {
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
  const data = new FormData(form);
  const selections = [
    ...filesToUpload(data.get("cover"), "cover"),
    ...filesToUpload(data.get("banner"), "banner"),
    ...Array.from(data.getAll("screenshots"))
      .flatMap((file) => filesToUpload(file, "screenshot")),
  ];
  selections.forEach(({ file, type }) => {
    const figure = document.createElement("figure");
    figure.className = "admin-media-item admin-media-item--selected";
    figure.dataset.selectedMedia = "";
    figure.dataset.mediaType = type;
    const image = document.createElement("img");
    image.src = URL.createObjectURL(file);
    image.alt = "";
    const caption = document.createElement("figcaption");
    caption.textContent = `${type === "screenshot" ? "Screenshot" : type} — ${file.name}`;
    figure.append(image, caption);
    preview.append(figure);
  });
  updateGamePreview(form);
}

export function cleanupSelectedMedia(dialog) {
  dialog.querySelectorAll("[data-selected-media] img").forEach((image) => {
    URL.revokeObjectURL(image.src);
  });
}
