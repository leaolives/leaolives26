/* =========================================
   1. CONFIGURAÇÃO DOS JOGOS
   club: fortaleza | ceara | neutral (cor da faixa)
========================================= */

const games = {
    "crb-ceara": {
        name: "CRB x Ceará",
        club: "ceara",
        type: "hls",
        engine: "native",
        url: "https://www.youtube.com/embed/tbBHNdnt78A?si=Ym7JIF_TAMIjOGwn"
    },

    "fortaleza-vila-nova": {
        name: "Fortaleza x Vila Nova",
        club: "fortaleza",
        type: "hls",
        engine: "native",
        url: "https://cdn-aovivo-atualplay.nxtv.com.br/ESPN/tracks-v1a1/mono.ts.m3u8"
    },

    "america-avai": {
        name: "América MG x Avaí",
        club: "neutral",
        type: "hls",
        engine: "native",
        url: "https://www.youtube.com/embed/634HzfFlADc?si=3yEwQafkcB8KsQXi"
    }
};


/* =========================================
   2. CONFIGURAÇÕES DE SEGURANÇA
========================================= */

// Domínios que NÃO devem receber sandbox
const trustedDomains = [
    "esportesembed.org",
    "sporturbo.com",
    "v5.rde.lat",
    "rdcanais.net",
    "links.temporariofutemais.com"
];

// Verifica se o endereço pertence a uma exceção
function isTrustedDomain(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase();

        return trustedDomains.some(domain =>
            hostname === domain || hostname.endsWith("." + domain)
        );

    } catch (error) {
        return false;
    }
}

// Verifica se o link é HLS
function isM3U8(url) {
    return /\.m3u8($|\?)/i.test(url);
}


/* =========================================
   3. ELEMENTOS DA PÁGINA
========================================= */

const checkboxes = document.querySelectorAll(".game-checkbox");

const selectedCount = document.getElementById("selectedCount");

const mosaicoStatus = document.getElementById("mosaicoStatus");

const mosaicoGrid = document.getElementById("mosaicoGrid");

// Guarda os players ativos
const activePlayers = new Map();

// Identificador dos elementos
let playerCounter = 0;


/* =========================================
   4. DESTRUIR PLAYER
========================================= */

function destroyGamePlayer(gameId) {

    const instance = activePlayers.get(gameId);

    if (!instance) return;

    // Destrói Clappr
    if (instance.clappr) {
        instance.clappr.destroy();
    }

    // Destrói DPlayer
    if (instance.dplayer) {
        instance.dplayer.destroy();
    }

    // Destrói HLS.js, se utilizado
    if (instance.hls) {
        instance.hls.destroy();
    }

    // Para vídeo nativo
    if (instance.video) {
        instance.video.pause();
        instance.video.removeAttribute("src");
        instance.video.load();
    }

    // Remove o player do registro
    activePlayers.delete(gameId);
}


/* =========================================
   5. CRIAR IFRAME
========================================= */

function loadIframe(source, container) {

    const iframe = document.createElement("iframe");

    iframe.className = "video-frame";
    iframe.title = source.name;

    // Sandbox apenas para domínios não confiáveis
    if (source.sandbox === true ||
        (source.sandbox !== false && !isTrustedDomain(source.url))) {

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

    container.appendChild(iframe);

    iframe.src = source.url;
}


/* =========================================
   6. HLS COM CLAPPR
========================================= */

function loadHlsWithClappr(source, container, gameId) {

    if (typeof Clappr === "undefined") {
        showPlayerError(container, "Biblioteca Clappr não carregada.");
        return;
    }

    const playerElement = document.createElement("div");

    playerElement.id = `clappr-${++playerCounter}`;
    playerElement.className = "hls-player";

    container.appendChild(playerElement);

    const player = new Clappr.Player({
        source: source.url,
        parentId: `#${playerElement.id}`,
        width: "100%",
        height: "100%",
        autoPlay: true,
        mute: true,
        mimeType: "application/x-mpegURL",
        hlsjsConfig: {
            enableWorker: true
        }
    });

    activePlayers.set(gameId, { clappr: player });
}


/* =========================================
   7. HLS COM DPLAYER
========================================= */

function loadHlsWithDPlayer(source, container, gameId) {

    if (typeof DPlayer === "undefined" || typeof Hls === "undefined") {
        showPlayerError(container, "Bibliotecas DPlayer/HLS não carregadas.");
        return;
    }

    const player = new DPlayer({
        container: container,
        autoplay: true,
        live: true,
        video: {
            url: source.url,
            type: "customHls",
            customType: {
                customHls: function(video) {

                    if (Hls.isSupported()) {

                        const hls = new Hls({
                            enableWorker: false,
                            lowLatencyMode: false
                        });

                        hls.loadSource(video.src);
                        hls.attachMedia(video);

                        activePlayers.set(gameId, {
                            dplayer: player,
                            hls: hls
                        });

                    } else {
                        video.src = source.url;
                    }
                }
            }
        }
    });

    if (!activePlayers.has(gameId)) {
        activePlayers.set(gameId, { dplayer: player });
    }
}


/* =========================================
   8. HLS NATIVO
========================================= */


function loadNativeHls(source, container, gameId) {

    const video = document.createElement("video");

    video.controls = true;
    video.autoplay = true;
    video.muted = true;

    // Mantém o vídeo dentro do player ao girar o celular
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    video.preload = "auto";

    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "contain";

    container.appendChild(video);

    video.src = source.url;
    video.load();

    video.play().catch(() => {});

    activePlayers.set(gameId, { video: video });
}



/* =========================================
   9. CARREGAR PLAYER
========================================= */

function loadPlayer(source, container, gameId) {

    if (!source || !source.url) {
        showPlayerError(container, "Link de transmissão não configurado.");
        return;
    }

    const type = source.type || (isM3U8(source.url) ? "hls" : "iframe");

    if (type === "iframe") {

        loadIframe(source, container);
        return;
    }

    if (type === "hls") {

        let engine = source.engine || "clappr";

        // Smart TVs: prioriza reprodução nativa
        if (isSmartTV()) {
            engine = "native";
        }

        if (engine === "native") {
            loadNativeHls(source, container, gameId);

        } else if (engine === "dplayer") {
            loadHlsWithDPlayer(source, container, gameId);

        } else {
            loadHlsWithClappr(source, container, gameId);
        }

        return;
    }

    showPlayerError(container, "Tipo de transmissão inválido.");
}


/* =========================================
   10. MENSAGEM DE ERRO
========================================= */

function showPlayerError(container, message) {

    container.innerHTML = `
        <div class="player-placeholder">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <p>${message}</p>
        </div>
    `;
}


/* =========================================
   11. CRIAR ÁREA DO JOGO
========================================= */

function createGamePlayer(gameId) {

    const game = games[gameId];

    if (!game) return;

    const tile = document.createElement("article");

    tile.className = "mosaico-player";
    tile.dataset.game = gameId;
    tile.dataset.club = game.club;

    tile.innerHTML = `
        <div class="tile-bar">
            <span class="tile-name">${game.name}</span>
            <span class="tile-actions">
                <button type="button" class="tile-btn" data-action="fullscreen"
                        aria-label="Tela cheia: ${game.name}">
                    <i class="fa-solid fa-maximize"></i>
                </button>
                <button type="button" class="tile-btn" data-action="remove"
                        aria-label="Tirar ${game.name} da tela">
                    <i class="fa-solid fa-xmark"></i> Tirar
                </button>
            </span>
        </div>
        <div class="tile-frame"><div class="player-content"></div></div>
    `;

    loadPlayer(game, tile.querySelector(".player-content"), gameId);

    return tile;
}


/* =========================================
   12. ATUALIZAR MOSAICO
   (não move os players no DOM: mover um iframe recarrega a transmissão)
========================================= */

const clearAll = document.getElementById("clearAll");
const picker = document.querySelector(".picker");
const mosaicoBar = document.querySelector(".mosaico-bar");

const emptyHTML = `
    <div class="empty-mosaico">
        <i class="fa-solid fa-arrow-up"></i>
        <h3>Escolha um jogo para começar</h3>
        <p>Toque em "Adicionar" em quantos jogos quiser.</p>
    </div>
`;

let previousTotal = 0;

function updateMosaico() {

    const selectedIds = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const total = selectedIds.length;

    mosaicoStatus.textContent =
        total === 0 ? "Nenhum jogo na tela" :
        total === 1 ? "1 jogo na tela" :
        `${total} jogos na tela`;

    clearAll.hidden = total === 0;

mosaicoGrid.className = `mosaico-grid layout-${total}`;


// Posiciona o seletor conforme o dispositivo
const isMobile = window.matchMedia("(max-width: 900px)").matches;

if (total > 0 && isMobile) {
    mosaicoGrid.after(picker);
} else {
    mosaicoBar.before(picker);
}

// Atualiza o estado visual dos cards
checkboxes.forEach(checkbox => {

    const card = checkbox.closest(".pick");
    const state = card.querySelector(".pick-state");

    card.classList.toggle("selected", checkbox.checked);

    picker.classList.add("is-repositioning");

    if (checkbox.checked) {
        state.innerHTML = `
            <i class="fa-solid fa-check"></i>
            <span>Adicionado</span>
        `;
    } else {
        state.innerHTML = `
            <i class="fa-solid fa-plus"></i>
            <span>Adicionar</span>
        `;
    }

    requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        picker.classList.remove("is-repositioning");
    });
});
});

    // Remove os players desmarcados (inclusive iframes)
    mosaicoGrid.querySelectorAll(".mosaico-player").forEach(tile => {

        if (!selectedIds.includes(tile.dataset.game)) {
            destroyGamePlayer(tile.dataset.game);
            tile.remove();
        }
    });

    if (total === 0) {
        mosaicoGrid.innerHTML = emptyHTML;
        previousTotal = 0;
        return;
    }

    const empty = mosaicoGrid.querySelector(".empty-mosaico");

    if (empty) empty.remove();

    selectedIds.forEach(gameId => {

        if (!mosaicoGrid.querySelector(`[data-game="${gameId}"]`)) {

            const tile = createGamePlayer(gameId);

            if (tile) mosaicoGrid.appendChild(tile);
        }
    });

    // No celular, leva o usuário até o jogo que ele acabou de escolher
    if (previousTotal === 0 && window.innerWidth < 900) {
        mosaicoGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    previousTotal = total;
}


/* =========================================
   13. EVENTOS
========================================= */

checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", updateMosaico);
});

clearAll.addEventListener("click", () => {
    checkboxes.forEach(checkbox => { checkbox.checked = false; });
    updateMosaico();
});

mosaicoGrid.addEventListener("click", event => {

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const tile = button.closest(".mosaico-player");

    if (button.dataset.action === "remove") {
        const box = Array.from(checkboxes).find(c => c.value === tile.dataset.game);
        if (box) box.checked = false;
        updateMosaico();
    }

    if (button.dataset.action === "fullscreen" && tile.requestFullscreen) {
        tile.requestFullscreen();
    }
});


/* =========================================
   14. DETECTAR SMART TV
========================================= */

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


/* =========================================
   15. INICIALIZAÇÃO
========================================= */

updateMosaico();