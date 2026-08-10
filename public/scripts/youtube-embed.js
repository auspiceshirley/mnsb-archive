// public/scripts/youtube-embed.js

(function () {
  var pendingRequests = {};

  function hasConsent() {
    return (
      typeof window.CookieConsent !== "undefined" &&
      window.CookieConsent.acceptedCategory("marketing")
    );
  }

  function fetchYouTubeData(cleanId) {
    var cacheKey = "youtube_cache_" + cleanId;

    try {
      var cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        return Promise.resolve(JSON.parse(cached));
      }
    } catch (e) {}

    if (pendingRequests[cleanId]) {
      return pendingRequests[cleanId];
    }

    var oembedUrl =
      "https://www.youtube-nocookie.com/oembed?url=https://www.youtube-nocookie.com/watch?v=" +
      encodeURIComponent(cleanId) +
      "&format=json";

    var promise = fetch(oembedUrl)
      .then(function (resp) {
        if (resp.ok) {
          return resp.json();
        }
        throw new Error("This video is unavailable.");
      })
      .then(function (json) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(json));
        } catch (e) {}
        delete pendingRequests[cleanId];
        return json;
      })
      .catch(function (err) {
        delete pendingRequests[cleanId];
        throw err;
      });

    pendingRequests[cleanId] = promise;
    return promise;
  }

  function renderErrorState(container, msg) {
    container.classList.remove("lite-mode", "direct-mode");
    container.classList.add("error-mode");
    container.innerHTML =
      '<div class="error-container">' +
      '<div class="error-code">404</div>' +
      '<div class="error-msg">' +
      (msg || "This video is unavailable.") +
      "</div>" +
      "</div>";
  }

  function renderEmbedData(container, data) {
    var propTitle = container.dataset.propTitle || "YouTube Video Player";
    var videoTitle = data.title || propTitle;

    var titleEl = container.querySelector(".lite-preview .title");
    if (titleEl) {
      titleEl.textContent = videoTitle;
    }

    var previewEl = container.querySelector(".lite-preview");
    if (previewEl) {
      previewEl.setAttribute("aria-label", "Play " + videoTitle);
    }

    var iframeEl = container.querySelector("iframe");
    if (iframeEl) {
      iframeEl.title = videoTitle;
    }

    var customPoster = container.dataset.poster;
    var coverUrl =
      customPoster ||
      "https://i.ytimg.com/vi/" + container.dataset.id + "/hqdefault.jpg";

    var coverDiv = container.querySelector(".cover-image");
    if (coverDiv && coverUrl) {
      var img = document.createElement("img");
      img.className = "cover-image";
      img.src = coverUrl;
      img.alt = videoTitle;
      img.referrerPolicy = "no-referrer";
      coverDiv.replaceWith(img);
    }

    if (data.author_name && data.author_url) {
      var authorLink = container.querySelector(".author");
      if (authorLink) {
        authorLink.href = data.author_url;
        authorLink.title = data.author_name;
        authorLink.style.display = "flex";

        var nameEl = authorLink.querySelector(".name");
        if (nameEl) {
          nameEl.textContent = data.author_name;
        }
      }
    }
  }

  function setupEmbedInteractivity(container) {
    var preview = container.querySelector(".lite-preview");
    var iframeWrapper = container.querySelector(".iframe-wrapper");
    var iframe = iframeWrapper ? iframeWrapper.querySelector("iframe") : null;
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
  }

  function initYouTubeEmbeds() {
    document
      .querySelectorAll(".astro-embed-youtube.lite-mode")
      .forEach(function (container) {
        if (container.classList.contains("error-mode")) return;

        var cleanId = container.dataset.id;
        if (!cleanId) return;

        if (!hasConsent()) {
          setupEmbedInteractivity(container);
          return;
        }

        if (!container.dataset.dataFetched) {
          container.dataset.dataFetched = "true";
          fetchYouTubeData(cleanId)
            .then(function (data) {
              renderEmbedData(container, data);
              setupEmbedInteractivity(container);
            })
            .catch(function () {
              renderErrorState(container, "This video is unavailable.");
            });
        } else {
          setupEmbedInteractivity(container);
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
