// public/scripts/youtube-embed.js

(function () {
  function hasConsent() {
    return (
      typeof window.CookieConsent !== "undefined" &&
      window.CookieConsent.acceptedCategory("marketing")
    );
  }

  function initYouTubeEmbeds() {
    document
      .querySelectorAll(".astro-embed-youtube.lite-mode")
      .forEach(function (container) {
        var preview = container.querySelector(".lite-preview");
        var iframeWrapper = container.querySelector(".iframe-wrapper");
        var iframe = iframeWrapper
          ? iframeWrapper.querySelector("iframe")
          : null;
        var playBtn = container.querySelector(".play-button");
        var iframeSrc = container.dataset.iframeSrc;
        var loaded = false;

        function loadVideo() {
          if (loaded || !iframe || !iframeSrc) return;
          if (!hasConsent()) {
            if (window.CookieConsent) {
              window.CookieConsent.showPreferences();
            }
            return;
          }
          iframe.src = iframeSrc;
          if (iframeWrapper) iframeWrapper.style.display = "block";
          if (preview) preview.style.display = "none";
          loaded = true;
        }

        if (preview && !container.hasAttribute("data-yt-inited")) {
          preview.addEventListener("click", loadVideo);
          preview.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              loadVideo();
            }
          });
          if (playBtn) {
            playBtn.addEventListener("click", function (e) {
              e.stopPropagation();
              loadVideo();
            });
          }
          container.setAttribute("data-yt-inited", "true");
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initYouTubeEmbeds();
    });
  } else {
    initYouTubeEmbeds();
  }

  document.addEventListener("astro:page-load", initYouTubeEmbeds);
  window.addEventListener("cc:onConsent", initYouTubeEmbeds);
  window.addEventListener("cc:onChange", initYouTubeEmbeds);
})();
