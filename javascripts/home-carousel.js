const AUTOPLAY_MS = 4000;
const CLONE_PAD = 2;
const SAMPLE_SIZE = 16;

const srgb = (value) => {
  const scaled = value / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
};

const luminance = (red, green, blue) =>
  0.2126 * srgb(red) + 0.7152 * srgb(green) + 0.0722 * srgb(blue);

const contrast = (first, second) => {
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
};

const opaqueBackground = (node) => {
  while (node) {
    const match = getComputedStyle(node).backgroundColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
    );
    if (match && (match[4] === undefined || Number(match[4]) > 0.6)) {
      return [Number(match[1]), Number(match[2]), Number(match[3])];
    }
    node = node.parentElement;
  }
  return [255, 255, 255];
};

const setupCarousel = (root) => {
  if (root.dataset.carouselReady === "true") {
    return;
  }

  const viewport = root.querySelector("[data-carousel-viewport]");
  const track = root.querySelector(".spx-carousel__track");
  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");
  const originals = [...root.querySelectorAll(".spx-carousel__slide")];
  if (!viewport || !track || !prev || !next || originals.length < 2) {
    return;
  }

  root.dataset.carouselReady = "true";

  const count = originals.length;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const slides = buildSlides(track, originals);
  let index = CLONE_PAD;
  let settling = false;

  const scrollTo = (slide, behavior) => {
    const left =
      slide.getBoundingClientRect().left -
      viewport.getBoundingClientRect().left +
      viewport.scrollLeft -
      (viewport.clientWidth - slide.offsetWidth) / 2;
    const motion = behavior === "auto" || reduceMotion.matches ? "auto" : "smooth";
    if (motion === "auto") {
      const previous = viewport.style.scrollBehavior;
      viewport.style.scrollBehavior = "auto";
      viewport.scrollLeft = left;
      viewport.style.scrollBehavior = previous;
      return;
    }
    viewport.scrollTo({ left, behavior: "smooth" });
  };

  const nearestIndex = () => {
    const center = viewport.getBoundingClientRect().left + viewport.clientWidth / 2;
    return slides.reduce(
      (best, slide, slideIndex) => {
        const box = slide.getBoundingClientRect();
        const distance = Math.abs(box.left + box.width / 2 - center);
        return distance < best.distance ? { index: slideIndex, distance } : best;
      },
      { index, distance: Infinity },
    ).index;
  };

  // Clones past either end jump back to the matching real slide.
  const normalize = (slideIndex) => {
    if (slideIndex < CLONE_PAD) {
      return slideIndex + count;
    }
    if (slideIndex >= CLONE_PAD + count) {
      return slideIndex - count;
    }
    return slideIndex;
  };

  const mark = (slideIndex) => {
    index = slideIndex;
    slides.forEach((slide, candidate) => {
      const active = candidate === index;
      slide.classList.toggle("is-active", active);
      if (slide.dataset.clone === "true") {
        return;
      }
      slide.toggleAttribute("aria-hidden", !active);
    });
    queuePaint();
  };

  const go = (slideIndex) => {
    const nextIndex = (slideIndex + slides.length) % slides.length;
    scrollTo(slides[nextIndex], "smooth");
    mark(nextIndex);
  };

  const settle = () => {
    if (settling) {
      return;
    }
    const nearest = nearestIndex();
    const normalized = normalize(nearest);
    if (normalized === nearest) {
      mark(nearest);
      return;
    }
    settling = true;
    scrollTo(slides[normalized], "auto");
    mark(normalized);
    requestAnimationFrame(() => {
      settling = false;
    });
  };

  const { showPreview, hidePreview } = createPreview(root);
  const { queuePaint, paintControls } = createPainter(root, viewport, slides, [prev, next]);

  let paused = false;
  let autoplay = 0;
  const stopAutoplay = () => {
    window.clearInterval(autoplay);
    autoplay = 0;
  };
  const startAutoplay = () => {
    stopAutoplay();
    if (paused || reduceMotion.matches || document.hidden) {
      return;
    }
    autoplay = window.setInterval(() => go(index + 1), AUTOPLAY_MS);
  };
  const step = (delta) => {
    hidePreview();
    go(index + delta);
    startAutoplay();
  };

  prev.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  slides.forEach((slide) => {
    slide.addEventListener("mouseenter", () => showPreview(slide));
  });
  root.addEventListener("mouseenter", () => {
    paused = true;
    stopAutoplay();
  });
  root.addEventListener("mouseleave", () => {
    paused = false;
    hidePreview();
    startAutoplay();
  });
  root.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    go(index + (event.key === "ArrowRight" ? 1 : -1));
  });

  let scrollTimer = 0;
  viewport.addEventListener(
    "scroll",
    () => {
      queuePaint();
      if (settling) {
        return;
      }
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(settle, 90);
    },
    { passive: true },
  );
  viewport.addEventListener("scrollend", settle);
  document.addEventListener("visibilitychange", startAutoplay);
  if (document.body) {
    new MutationObserver(queuePaint).observe(document.body, {
      attributes: true,
      attributeFilter: ["data-md-color-scheme"],
    });
  }

  scrollTo(slides[index], "auto");
  mark(index);
  paintControls();
  startAutoplay();
  window.addEventListener("resize", () => {
    scrollTo(slides[index], "auto");
    queuePaint();
  });
};

// Two copies on each end keep the faded neighbors visible when the track wraps.
const buildSlides = (track, originals) => {
  const clone = (slide) => {
    const copy = slide.cloneNode(true);
    copy.dataset.clone = "true";
    copy.setAttribute("aria-hidden", "true");
    return copy;
  };

  originals
    .slice(-CLONE_PAD)
    .map(clone)
    .reverse()
    .forEach((copy) => track.insertBefore(copy, track.firstChild));
  originals.slice(0, CLONE_PAD).map(clone).forEach((copy) => track.appendChild(copy));
  return [...track.querySelectorAll(".spx-carousel__slide")];
};

const createPreview = (root) => {
  const preview = document.createElement("div");
  preview.className = "spx-carousel__preview";
  preview.hidden = true;
  preview.setAttribute("aria-hidden", "true");
  const image = document.createElement("img");
  image.alt = "";
  preview.appendChild(image);
  root.appendChild(preview);

  return {
    showPreview(slide) {
      const source = slide.querySelector("img");
      if (!source) {
        return;
      }
      if (image.src !== source.src) {
        image.src = source.src;
      }
      preview.hidden = false;
    },
    hidePreview() {
      preview.hidden = true;
    },
  };
};

const createPainter = (root, viewport, slides, buttons) => {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  let queued = false;

  const sample = (image, relX, relY) => {
    const patch = 48;
    const sourceX = relX * image.naturalWidth - patch / 2;
    const sourceY = relY * image.naturalHeight - patch / 2;
    context.drawImage(image, sourceX, sourceY, patch, patch, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const pixels = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;
    let red = 0;
    let green = 0;
    let blue = 0;
    for (let offset = 0; offset < pixels.length; offset += 4) {
      red += pixels[offset];
      green += pixels[offset + 1];
      blue += pixels[offset + 2];
    }
    const count = pixels.length / 4;
    return [red / count, green / count, blue / count];
  };

  const paintButton = (button, background) => {
    const box = button.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const slide = slides.find((candidate) => {
      const bounds = candidate.getBoundingClientRect();
      return x >= bounds.left && x <= bounds.right;
    });
    const image = slide?.querySelector("img");
    if (!context || !image?.complete || !image.naturalWidth) {
      return;
    }

    const imageBox = image.getBoundingClientRect();
    const relX = (x - imageBox.left) / imageBox.width;
    const relY = (y - imageBox.top) / imageBox.height;
    if (relX < 0 || relX > 1 || relY < 0 || relY > 1) {
      return;
    }

    let red;
    let green;
    let blue;
    try {
      [red, green, blue] = sample(image, relX, relY);
    } catch {
      return;
    }

    const view = viewport.getBoundingClientRect();
    const slideShare =
      parseFloat(getComputedStyle(root).getPropertyValue("--spx-carousel-slide")) / 100 || 0.68;
    const fade = (view.width * (1 - slideShare)) / 2;
    const localX = x - view.left;
    let mask = 1;
    if (localX <= fade) {
      mask = localX / fade;
    } else if (localX >= view.width - fade) {
      mask = (view.width - localX) / fade;
    }
    mask = Math.min(1, Math.max(0, mask));

    const visible = [red, green, blue].map(
      (channel, channelIndex) => channel * mask + background[channelIndex] * (1 - mask),
    );
    const seen = luminance(...visible);
    button.dataset.tone = contrast(seen, 0) >= contrast(seen, 1) ? "light" : "dark";
  };

  const paintControls = () => {
    const background = opaqueBackground(root);
    buttons.forEach((button) => paintButton(button, background));
  };

  slides.forEach((slide) => {
    const image = slide.querySelector("img");
    if (image && !image.complete) {
      image.addEventListener("load", () => queuePaint(), { once: true });
    }
  });

  const queuePaint = () => {
    if (queued) {
      return;
    }
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      paintControls();
    });
  };

  return { queuePaint, paintControls };
};

const startCarousels = () => {
  document.querySelectorAll("[data-carousel]").forEach(setupCarousel);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startCarousels);
} else {
  startCarousels();
}
