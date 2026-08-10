// src/scripts/link-preview.js

function hasConsent() {
  return (
    typeof window.CookieConsent !== "undefined" &&
    window.CookieConsent.acceptedCategory("marketing")
  );
}

function renderMediaIfConsented() {
  if (!hasConsent()) return;

  const placeholders = document.querySelectorAll(
    ".link-preview__media-placeholder",
  );
  placeholders.forEach((el) => {
    const target = /** @type {HTMLElement} */ (el);
    const imgSrc = target.dataset.srcImg;
    const videoSrc = target.dataset.srcVideo;

    if (imgSrc) {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = target.dataset.alt || "";
      img.width = 1200;
      img.height = 630;
      target.replaceWith(img);
    } else if (videoSrc) {
      const video = document.createElement("video");
      video.controls = true;
      video.preload = "metadata";
      video.width = 1200;
      video.height = 630;
      const source = document.createElement("source");
      source.src = videoSrc;
      source.type = target.dataset.videoType || "";
      video.appendChild(source);
      target.replaceWith(video);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderMediaIfConsented);
} else {
  renderMediaIfConsented();
}

document.addEventListener("astro:page-load", renderMediaIfConsented);
window.addEventListener("cc:onConsent", renderMediaIfConsented);
window.addEventListener("cc:onChange", renderMediaIfConsented);
