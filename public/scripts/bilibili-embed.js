// src/scripts/bilibili-embed.js

(function () {
  var pendingRequests = {};

  function hasConsent() {
    return (
      typeof window.CookieConsent !== "undefined" &&
      window.CookieConsent.acceptedCategory("marketing")
    );
  }

  function fetchBilibiliData(bvid, aid) {
    var key = bvid ? "bvid_" + bvid : "aid_" + aid;
    var cacheKey = "bilibili_cache_" + key;

    try {
      var cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        return Promise.resolve(JSON.parse(cached));
      }
    } catch (e) {}

    if (pendingRequests[key]) {
      return pendingRequests[key];
    }

    var paramStr = bvid
      ? "bvid=" + encodeURIComponent(bvid)
      : "aid=" + encodeURIComponent(aid);
    var apiUrl = "https://api.bilibili.com/x/web-interface/view?" + paramStr;

    var promise = new Promise(function (resolve, reject) {
      var callbackName =
        "jsonp_bili_" +
        Math.random().toString(36).substring(2, 10) +
        "_" +
        Date.now();
      var script = document.createElement("script");
      script.src = apiUrl + "&jsonp=jsonp&callback=" + callbackName;

      var timer = setTimeout(function () {
        cleanup();
        reject(new Error("Timeout"));
      }, 10000);

      function cleanup() {
        if (timer) clearTimeout(timer);
        delete window[callbackName];
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        delete pendingRequests[key];
      }

      window[callbackName] = function (res) {
        cleanup();
        if (res && res.code === 0 && res.data) {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
          } catch (e) {}
          resolve(res.data);
        } else {
          reject(new Error("This video is unavailable."));
        }
      };

      script.onerror = function () {
        cleanup();
        reject(new Error("This video is unavailable."));
      };

      document.head.appendChild(script);
    });

    pendingRequests[key] = promise;
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

  function renderEmbedData(container, videoData) {
    var wrapper =
      container.closest(".bilibili-wrapper") || container.parentElement;

    var videoTitle =
      videoData.title || container.dataset.propTitle || "Bilibili Video Player";

    var titleEl = container.querySelector(".lite-preview .title");
    if (titleEl) {
      titleEl.textContent = videoTitle;
    }

    var iframeEl = container.querySelector("iframe");
    if (iframeEl) {
      iframeEl.title = videoTitle;
    }

    var coverUrl = videoData.pic
      ? videoData.pic.replace(/^http:/, "https:")
      : "";
    var coverImageDiv = container.querySelector(".cover-image");
    if (coverImageDiv && coverUrl) {
      var img = document.createElement("img");
      img.className = "cover-image";
      img.src = coverUrl;
      img.alt = videoTitle;
      img.referrerPolicy = "no-referrer";
      coverImageDiv.replaceWith(img);
    }

    var owner = videoData.owner;
    if (owner && owner.mid && owner.name) {
      var authorLink = container.querySelector(".author");
      if (authorLink) {
        authorLink.href = "https://space.bilibili.com/" + owner.mid;
        authorLink.title = owner.name;
        authorLink.style.display = "flex";

        var ownerFace = owner.face
          ? owner.face.replace(/^http:/, "https:")
          : "";
        var avatarHolder =
          authorLink.querySelector(".avatar-holder") ||
          authorLink.querySelector(".avatar");
        if (avatarHolder && ownerFace) {
          var avatarImg = document.createElement("img");
          avatarImg.className = "avatar";
          avatarImg.src = ownerFace;
          avatarImg.alt = owner.name;
          avatarImg.referrerPolicy = "no-referrer";
          avatarHolder.replaceWith(avatarImg);
        }

        var nameEl = authorLink.querySelector(".name");
        if (nameEl) {
          nameEl.textContent = owner.name;
        }
      }
    }

    if (wrapper && videoData.desc) {
      var descWrapper = wrapper.querySelector(".video-description");
      var descContent = wrapper.querySelector(".desc-content");
      if (descWrapper && descContent) {
        descContent.innerHTML = videoData.desc.replace(/\n/g, "<br/>");
        descWrapper.style.display = "block";
      }
    }
  }

  function setupEmbedInteractivity(container) {
    if (container.classList.contains("direct-mode")) {
      if (hasConsent()) {
        var directIframe = container.querySelector("iframe");
        var iframeSrc = container.dataset.iframeSrc;
        if (directIframe && iframeSrc && !directIframe.src) {
          directIframe.src = iframeSrc;
        }
      }
      return;
    }

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

    if (preview && !container.hasAttribute("data-bilibili-inited")) {
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
      container.setAttribute("data-bilibili-inited", "true");
    }
  }

  function initBilibiliEmbeds() {
    document
      .querySelectorAll(".astro-embed-bilibili")
      .forEach(function (container) {
        if (container.classList.contains("error-mode")) return;

        var bvid = container.dataset.bvid;
        var aid = container.dataset.aid;
        if (!bvid && !aid) return;

        if (!hasConsent()) {
          setupEmbedInteractivity(container);
          return;
        }

        if (!container.dataset.dataFetched) {
          container.dataset.dataFetched = "true";
          fetchBilibiliData(bvid, aid)
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
      initBilibiliEmbeds();
    });
  } else {
    initBilibiliEmbeds();
  }

  document.addEventListener("astro:page-load", initBilibiliEmbeds);
  window.addEventListener("cc:onConsent", initBilibiliEmbeds);
  window.addEventListener("cc:onChange", initBilibiliEmbeds);
})();
