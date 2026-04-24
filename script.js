const matches = {
  fortaleza: {
    title: "Operario x Fortaleza",
    meta: "26/04 • 18:00",
    players: [
      { type: "hls", url: "https://xn---22--11--33--88--75---------b25zjfpkmbt1n9g9zza94e.xn----------------g34l3fkcn6n2hmd3acobj33ac2a7a8lufomma7cf2b1sh.xn---1l1--5o4dxb.xn--pck.xn--zck.xn--0ck.xn--pck.xn--yck.xn-----0b4asja8cbew2b4b0gd0edbjm2jpa1b1e9zva7a0347s4da2797e7qri.xn--1ck2e1b/docs/primevideo3/__index.m3u8?cc=y&sv=118&nu3zAQc9HC3GbwJq=1776899756-kRqqPpFlX9ruzYh%2F4KIDXe29LbVzlQZPX0dgZtMQ85Y%3D" },
      { type: "iframe", url: "https://sporturbo.com/player/canais/ampv-sportv" },
      { type: "iframe", url: "https://esportesembed.com/casa-pia-x-braga-2" }
    ]
  },
  ceara: {
    title: "Ceará x Vila Nova",
    meta: "26/04 • 18:00",
    players: [
      { type: "hls", url: "https://xn---22--11--33--88--75---------b25zjfpkmbt1n9g9zza94e.xn----------------g34l3fkcn6n2hmd3acobj33ac2a7a8lufomma7cf2b1sh.xn---1l1--5o4dxb.xn--pck.xn--zck.xn--0ck.xn--pck.xn--yck.xn-----0b4asja8cbew2b4b0gd0edbjm2jpa1b1e9zva7a0347s4da2797e7qri.xn--1ck2e1b/docs/sportv1/__index.m3u8?cc=y&sv=66&nu3zAQc9HC3GbwJq=1776980407-HgzlRUrW%2BLfk9x7vTIIUJzCdsOB8ekaISWq0elkpqY4%3D" },
      { type: "hls", url: "https://dlnmh9ip6v2xc9xx.cloudfontes.net/sportv.m3u8" },
      { type: "iframe", url: "https://3embeddecanais.xyz/sportv/" }
    ]
  }
};

let currentMatch = "fortaleza";
let clapprPlayer = null;

function isM3U8(url) {
  return /\.m3u8($|\?)/i.test(url);
}

function destroyPlayer() {
  if (clapprPlayer) {
    clapprPlayer.destroy();
    clapprPlayer = null;
  }
  const ifContainer = document.getElementById("iframeContainer");
  if (ifContainer) {
    ifContainer.innerHTML = ""; // Limpa qualquer iframe injetado anteriormente
  }
}

function loadPlayer(source) {
  const clapprContainer = document.getElementById("player");
  const iframeContainer = document.getElementById("iframeContainer");
  
  destroyPlayer();
  
  // Esconde o container do Clappr por padrão
  clapprContainer.classList.add("hidden");

  const playerType = source.type || (isM3U8(source.url) ? "hls" : "iframe");

  if (playerType === "hls") {
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
  } else {
    // Criação dinâmica do iframe para evitar conflitos de sandbox
    const iframe = document.createElement("iframe");
    iframe.id = "videoFrame";
    iframe.className = "video-frame";
    
    const url = source.url.toLowerCase();
    const isException = url.includes("esportesembed.com") || url.includes("sporturbo.com");

    if (!isException) {
      iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-presentation");
    }
    
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute("webkitallowfullscreen", "true");
    iframe.setAttribute("mozallowfullscreen", "true");
    iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write");
    iframe.setAttribute("frameborder", "0");
    
    iframeContainer.appendChild(iframe);
    iframe.src = source.url;
  }
}

function openMatch(team) {
  currentMatch = team;
  const match = matches[team];
  document.getElementById("matchTitle").textContent = match.title;
  document.getElementById("matchMeta").textContent = match.meta;
  
  loadPlayer(match.players[0]);

  document.querySelectorAll(".player-btn").forEach((btn, index) => {
    btn.classList.remove("active-player");
    if (index === 0) btn.classList.add("active-player");
  });

  document.getElementById("homePage").classList.remove("active");
  document.getElementById("watchPage").classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (typeof gtag === 'function') {
    gtag('event', 'page_view', {
      page_title: 'Assistindo: ' + team,
      page_location: window.location.href + '#' + team
    });
  }
}

function goHome() {
  destroyPlayer();
  document.getElementById("watchPage").classList.remove("active");
  document.getElementById("homePage").classList.add("active");
  if (document.body.classList.contains('cinema-active')) toggleCinema();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function changePlayer(button, playerIndex) {
  const match = matches[currentMatch];
  loadPlayer(match.players[playerIndex - 1]);
  document.querySelectorAll(".player-btn").forEach(btn => btn.classList.remove("active-player"));
  button.classList.add("active-player");
}

function toggleCinema() {
  document.body.classList.toggle('cinema-active');
  const btn = document.getElementById('cinemaModeBtn');
  if (btn) {
    btn.innerHTML = document.body.classList.contains('cinema-active') ? 
      '<i class="fa-solid fa-xmark"></i> Sair do Cinema' : 
      '<i class="fa-solid fa-film"></i> Modo Cinema';
  }
}

function vote(option) {
  const optionsDiv = document.querySelector('.poll-options');
  const resultDiv = document.getElementById('pollResult');
  if (optionsDiv) optionsDiv.classList.add('hidden');
  if (resultDiv) resultDiv.classList.remove('hidden');
}

// Bloqueios de segurança
document.addEventListener('contextmenu', event => event.preventDefault());

document.onkeydown = function(e) {
  if (e.keyCode == 123) return false;
  if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 67 || e.keyCode == 74)) return false;
  if (e.ctrlKey && (e.keyCode == 85 || e.keyCode == 83)) return false;
};