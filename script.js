// --- 1. CONFIGURAÇÃO DOS JOGOS ---
const matches = {
  fortaleza: {
    title: "Fortaleza x Sport",
    meta: "29/04 • 21:30",
    players: [
      { type: "iframe", url: "https://www.youtube.com/embed/PoXrobHfUmI?si=v9oTkhu-B6BH504I" },
      { type: "hls", url: "https://dlnmh9ip6v2xc9xx.cloudfontes.net/redetv.m3u8" },
      { type: "iframe", url: "https://esportesembed.com/operario-ferroviario-x-fortaleza-1" }
    ]
  },
  ceara: {
    title: "Maranhão x Ceará",
    meta: "29/04 • 21:30",
    players: [
      { type: "hls", url: "https://xn---22--11--33--88--75---------b25zjfpkmbt1n9g9zza94e.xn----------------g34l3fkcn6n2hmd3acobj33ac2a7a8lufomma7cf2b1sh.xn---1l1--5o4dxb.xn--pck.xn--zck.xn--0ck.xn--pck.xn--yck.xn-----0b4asja8cbew2b4b0gd0edbjm2jpa1b1e9zva7a0347s4da2797e7qri.xn--1ck2e1b/docs/xsports/__index.m3u8?cc=y&sv=38&nu3zAQc9HC3GbwJq=1777215946-%2BUmWqOy7I3%2BYIBZanyoVDcjzSyawF6xDa8xQntKlq6A%3D" },
      { type: "hls", url: "https://dlnmh9ip6v2xc9xx.cloudfontes.net/espn.m3u8" },
      { type: "iframe", url: "https://esportesembed.com/ceara-x-vila-nova-2" }
    ]
  }
};

let currentMatch = "fortaleza";
let clapprPlayer = null;

// --- 2. FUNÇÕES DO PLAYER ---

function isM3U8(url) {
  return /\.m3u8($|\?)/i.test(url);
}

function destroyPlayer() {
  if (clapprPlayer) {
    clapprPlayer.destroy();
    clapprPlayer = null;
  }
  const ifContainer = document.getElementById("iframeContainer");
  if (ifContainer) ifContainer.innerHTML = "";
}

function loadPlayer(source) {
  const clapprContainer = document.getElementById("player");
  const iframeContainer = document.getElementById("iframeContainer");
  const dnsWarning = document.querySelector(".dns-warning"); 
  
  destroyPlayer();
  
  if (clapprContainer) clapprContainer.classList.add("hidden");

  const playerType = source.type || (isM3U8(source.url) ? "hls" : "iframe");

  // Identifica links que abrem pop-ups (Exceções)
  const url = source.url.toLowerCase();
  const isEx = url.includes("esportesembed.com") || url.includes("sporturbo.com");

  // Atualiza o quadro de aviso dependendo do link
  if (dnsWarning) {
    if (isEx) {
        // Mensagem para links com anúncios (Exceções)
        dnsWarning.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color: #ff4444;"></i>
        <p><strong>Aviso:</strong> Este player pode abrir anúncios externos. Se uma aba abrir, <strong>feche</strong> e volte para cá para assistir.</p>`;
        dnsWarning.style.borderColor = "#ff4444";
    } else {
        // MENSAGEM OPÇÃO 3 para links estáveis (HLS/DNS)
        dnsWarning.innerHTML = `<i class="fa-solid fa-shield-halved" style="color: #ffa500;"></i>
        <p><strong>Atenção:</strong> Se o jogo nao abrir, sua operadora pode estar bloqueando o player. Use o <strong>App DNS 1.1.1.1</strong> para contornar o bloqueio. 
        <a href="https://one.one.one.one/" target="_blank">Baixar agora para Celular ou PC</a></p>`;
        dnsWarning.style.borderColor = "rgba(255, 165, 0, 0.3)";
    }
  }

  if (playerType === "hls") {
    if (clapprContainer) clapprContainer.classList.remove("hidden");
    clapprPlayer = new Clappr.Player({
      source: source.url,
      parentId: "#player",
      width: "100%",
      height: "100%",
      autoPlay: true,
      mimeType: "application/x-mpegURL",
      hlsjsConfig: { enableWorker: true }
    });
  } else if (iframeContainer) {
    const iframe = document.createElement("iframe");
    iframe.id = "videoFrame";
    iframe.className = "video-frame";
    
    // Aplica sandbox apenas se NÃO for exceção (para permitir que o vídeo rode nessas fontes)
    if (!isEx) {
        iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-presentation");
    }
    
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write");
    iframe.setAttribute("frameborder", "0");
    
    iframeContainer.appendChild(iframe);
    iframe.src = source.url;
  }
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

  // Atualiza botões de player para o primeiro por padrão
  document.querySelectorAll(".player-btn").forEach((btn, index) => {
    btn.classList.remove("active-player");
    if (index === 0) btn.classList.add("active-player");
  });

  // Gerencia visibilidade das seções (útil para o index.html)
  const home = document.getElementById("homePage");
  const watch = document.getElementById("watchPage");
  if (home) home.classList.remove("active");
  if (watch) watch.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function changePlayer(button, playerIndex) {
  const match = matches[currentMatch];
  loadPlayer(match.players[playerIndex - 1]);
  document.querySelectorAll(".player-btn").forEach(btn => btn.classList.remove("active-player"));
  button.classList.add("active-player");
}

function goToIndex() {
    window.location.href = "index.html";
}

// --- 4. SEGURANÇA CONTRA INSPEÇÃO ---

document.addEventListener('contextmenu', event => event.preventDefault());

document.onkeydown = function(e) {
  if (e.keyCode == 123) return false;
  if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 67 || e.keyCode == 74)) return false;
  if (e.ctrlKey && (e.keyCode == 85 || e.keyCode == 83)) return false;
};