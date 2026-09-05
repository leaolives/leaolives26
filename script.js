// --- 1. CONFIGURAÇÃO DOS JOGOS ---
const matches = {
  fortaleza: {
    title: "Goiás x Fortaleza",
    meta: "05/09 • 16:00",
    players: [
      {
        type: "iframe",
        engine: "clappr",
        url: "https://www.youtube.com/embed/g4uAlbBgr60?si=3IUMO-n2U77WSzAj"
      },
      {
        type: "iframe",
        engine: "clappr",
        url: "https://2608.cdnembedcanais.xyz/redetv/"
      },
      {
        type: "iframe",
        engine: "clappr",
        url: "https://links.temporariofutemais.com/prime.php?c=canal2"
      }
    ]
  },

  ceara: {
    title: "Ceará x Sport",
    meta: "05/09 • 18:30",
    players: [
      {
        type: "iframe",
        engine: "clappr",
        url: "https://2608.cdnembedcanais.xyz/disneyplus/"
      },
      {
        type: "iframe",
        engine: "clappr",
        url: "https://links.temporariofutemais.com/prime.php?c=canal3"
      },
      {
        type: "iframe",
        engine: "clappr",
        url: "//ok.ru/videoembed/15577454616074?nochat=1&autoplay=1"
      }
    ]
  }
};

let currentMatch = "fortaleza";
let clapprPlayer = null;
let dplayerInstance = null;

// --- 2. FUNÇÕES DO PLAYER ---

function isM3U8(url) {
  return /\.m3u8($|\?)/i.test(url);
}

function destroyPlayer() {
  if (clapprPlayer) {
    clapprPlayer.destroy();
    clapprPlayer = null;
  }

  if (dplayerInstance) {
    dplayerInstance.destroy();
    dplayerInstance = null;
  }

  const iframeContainer = document.getElementById("iframeContainer");
  const clapprContainer = document.getElementById("player");
  const dplayerContainer = document.getElementById("dplayer");
  const nativeVideo = document.getElementById("nativeVideo");

  if (nativeVideo) {
    nativeVideo.pause();
    nativeVideo.removeAttribute("src");
    nativeVideo.load();
    nativeVideo.classList.add("hidden");
  }

  if (clapprContainer) clapprContainer.classList.add("hidden");

  if (dplayerContainer) {
    dplayerContainer.classList.add("hidden");
    dplayerContainer.innerHTML = "";
  }

  // CORREÇÃO: Limpar e ocultar o contêiner do Iframe
  if (iframeContainer) {
    iframeContainer.innerHTML = "";
    iframeContainer.classList.add("hidden");
  }
}

function updateWarning(source) {
  const dnsWarning = document.querySelector(".dns-warning");
  if (!dnsWarning || !source || !source.url) return;

  const url = source.url.toLowerCase();

  const trustedDomains = [
    "esportesembed.net",
    "sporturbo.com",
    "v5.rde.lat",
    "rdcanais.net",
    "links.temporariofutemais.com"
  ];

  const isEx = trustedDomains.some(domain =>
    url.includes(domain)
  );

  if (isEx) {
    dnsWarning.innerHTML = `
      <i class="fa-solid fa-shield-halved" style="color: #ffa500;"></i>
      <p><strong>Atenção:</strong> Se o jogo não abrir, sua operadora pode estar bloqueando o player de video. Use o <strong>App DNS 1.1.1.1</strong> para contornar o bloqueio.
      <a href="https://one.one.one.one/" target="_blank">Baixar agora para Celular ou PC</a></p>
    `;
    dnsWarning.style.borderColor = "#ff4444";
  } else {
    dnsWarning.innerHTML = `
      <i class="fa-solid fa-shield-halved" style="color: #ffa500;"></i>
      <p><strong>Atenção:</strong> Se o jogo não abrir, sua operadora pode estar bloqueando o player. Use o <strong>App DNS 1.1.1.1</strong> para contornar o bloqueio.
      <a href="https://one.one.one.one/" target="_blank">Baixar agora para Celular ou PC</a></p>
    `;
    dnsWarning.style.borderColor = "rgba(255, 165, 0, 0.3)";
  }
}

function loadHlsWithClappr(source) {
  const clapprContainer = document.getElementById("player");
  if (!clapprContainer) return;

  clapprContainer.classList.remove("hidden");

  clapprPlayer = new Clappr.Player({
    source: source.url,
    parentId: "#player",
    width: "100%",
    height: "100%",
    autoPlay: true,
    mimeType: "application/x-mpegURL",
    hlsjsConfig: {
      enableWorker: true
    }
  });
}

function loadHlsWithDPlayer(source) {
  const dplayerContainer = document.getElementById("dplayer");
  if (!dplayerContainer) return;

  dplayerContainer.classList.remove("hidden");
  dplayerContainer.innerHTML = "";

  dplayerInstance = new DPlayer({
    container: dplayerContainer,
    autoplay: true,
    live: true,
    video: {
      url: source.url,
      type: "customHls",
      customType: {
        customHls: function (video) {
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: false,
              lowLatencyMode: false
            });

            hls.loadSource(video.src);
            hls.attachMedia(video);
          } else {
            video.src = source.url;
          }
        }
      }
    }
  });

  setTimeout(() => {
    const video = dplayerContainer.querySelector("video");
    if (video) {
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "contain";
      video.style.display = "block";
      video.play().catch(() => {});
    }
  }, 800);
}

function loadIframe(source) {
  const iframeContainer = document.getElementById("iframeContainer");
  if (!iframeContainer) return;

  // CORREÇÃO: Mostrar o contêiner do Iframe antes de injetar o vídeo
  iframeContainer.classList.remove("hidden");

  const url = source.url.toLowerCase();

  // Sites que não devem receber sandbox
  const trustedDomains = [
    "esportesembed.net",
    "sporturbo.com",
    "v5.rde.lat",
    "rdcanais.net",
    "links.temporariofutemais.com"
  ];

  const isTrusted = trustedDomains.some(domain =>
    url.includes(domain)
  );

  const iframe = document.createElement("iframe");
  iframe.id = "videoFrame";
  iframe.className = "video-frame";

  // Sandbox apenas para domínios não confiáveis
  if (!isTrusted) {
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-presentation"
    );
  }

  iframe.setAttribute("allowfullscreen", "true");
  iframe.setAttribute(
    "allow",
    "autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write"
  );
  iframe.setAttribute("frameborder", "0");

  iframeContainer.appendChild(iframe);
  iframe.src = source.url;
}

function loadPlayer(source) {
  destroyPlayer();

  if (!source || !source.url) return;

  updateWarning(source);

  const playerType = source.type || (isM3U8(source.url) ? "hls" : "iframe");

  if (playerType === "hls") {
    let engine = source.engine || "clappr";

    // Na Smart TV, força player nativo para evitar tela preta
    if (isSmartTV()) {
      engine = "native";
    }

    if (engine === "native") {
      loadNativeHls(source);
    } else if (engine === "dplayer") {
      loadHlsWithDPlayer(source);
    } else {
      loadHlsWithClappr(source);
    }

    return;
  }

  loadIframe(source);
}

function loadNativeHls(source) {
  const nativeVideo = document.getElementById("nativeVideo");
  if (!nativeVideo) return;

  nativeVideo.classList.remove("hidden");
  nativeVideo.src = source.url;
  nativeVideo.load();
  nativeVideo.play().catch(() => {});
}

// --- 3. NAVEGAÇÃO ---

function openMatch(team) {
  currentMatch = team;
  const match = matches[team];

  const titleElem = document.getElementById("matchTitle");
  const metaElem = document.getElementById("matchMeta");

  if (titleElem) titleElem.textContent = match.title;
  if (metaElem) metaElem.textContent = match.meta;

  loadPlayer(match.players[0]);

  document.querySelectorAll(".player-btn").forEach((btn, index) => {
    btn.classList.remove("active-player");
    if (index === 0) btn.classList.add("active-player");
  });

  const home = document.getElementById("homePage");
  const watch = document.getElementById("watchPage");

  if (home) home.classList.remove("active");
  if (watch) watch.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function changePlayer(button, playerIndex) {
  const match = matches[currentMatch];
  if (!match || !match.players[playerIndex - 1]) return;

  loadPlayer(match.players[playerIndex - 1]);

  document.querySelectorAll(".player-btn").forEach((btn) => {
    btn.classList.remove("active-player");
  });

  button.classList.add("active-player");
}

function goToIndex() {
  window.location.href = "index.html";
}

// --- 4. SEGURANÇA CONTRA INSPEÇÃO ---

document.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

document.onkeydown = function (e) {
  if (e.keyCode === 123) return false;

  if (
    e.ctrlKey &&
    e.shiftKey &&
    (e.keyCode === 73 || e.keyCode === 67 || e.keyCode === 74)
  ) {
    return false;
  }

  if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83)) {
    return false;
  }
};

function isSmartTV() {
  const ua = navigator.userAgent.toLowerCase();

  return (
    ua.includes("smart-tv") ||
    ua.includes("smarttv") ||
    ua.includes("tizen") ||
    ua.includes("webos") ||
    ua.includes("netcast") ||
    ua.includes("appletv") ||
    ua.includes("hbbtv") ||
    ua.includes("bravia") ||
    ua.includes("viera") ||
    ua.includes("hisense") ||
    ua.includes("vidaa") ||
    ua.includes("aftt")
  );
}
