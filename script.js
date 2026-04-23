const matches = {
  fortaleza: {
    title: "Operario x Fortaleza",
    meta: "26/04 • 18:00",
    players: [
      {
        type: "hls",
        url: "https://xn---22--11--33--88--75---------b25zjfpkmbt1n9g9zza94e.xn----------------g34l3fkcn6n2hmd3acobj33ac2a7a8lufomma7cf2b1sh.xn---1l1--5o4dxb.xn--pck.xn--zck.xn--0ck.xn--pck.xn--yck.xn-----0b4asja8cbew2b4b0gd0edbjm2jpa1b1e9zva7a0347s4da2797e7qri.xn--1ck2e1b/docs/primevideo3/__index.m3u8?cc=y&sv=118&nu3zAQc9HC3GbwJq=1776899756-kRqqPpFlX9ruzYh%2F4KIDXe29LbVzlQZPX0dgZtMQ85Y%3D"
      },
      {
        type: "iframe",
        url: "https://sporturbo.com/player/canais/ampv-sportv"
      },
      {
        type: "iframe",
        url: "https://esportesembed.com/casa-pia-x-braga-2"
      }
    ]
  },
  ceara: {
    title: "Atlético MG x Ceará",
    meta: "23/04 • 20:30",
    players: [
      {
        type: "hls",
        url: "https://xn---22--11--33--88--75---------b25zjfpkmbt1n9g9zza94e.xn----------------g34l3fkcn6n2hmd3acobj33ac2a7a8lufomma7cf2b1sh.xn---1l1--5o4dxb.xn--pck.xn--zck.xn--0ck.xn--pck.xn--yck.xn-----0b4asja8cbew2b4b0gd0edbjm2jpa1b1e9zva7a0347s4da2797e7qri.xn--1ck2e1b/docs/sportv1/__index.m3u8?cc=y&sv=52&nu3zAQc9HC3GbwJq=1776970144-XveofNEpAM5C9h4GnJ1IZ5XCNucL01wU%2FK209UztYNY%3D"
      },
      {
        type: "hls",
        url: "https://dlnmh9ip6v2xc9xx.cloudfontes.net/sportv.m3u8"
      },
      {
        type: "iframe",
        url: "https://3embeddecanais.xyz/sportv/"
      }
    ]
  }
};

let currentMatch = "fortaleza";
let hlsInstance = null;

function isM3U8(url) {
  return /\.m3u8($|\?)/i.test(url);
}

function destroyHls() {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
}

function loadPlayer(source) {
  const video = document.getElementById("videoPlayer");
  const container = document.querySelector(".video-container");
  let iframe = document.getElementById("videoFrame");

  destroyHls();

  video.classList.add("hidden");
  video.pause();
  video.removeAttribute("src");
  video.load();

  if (iframe) {
    iframe.parentNode.removeChild(iframe);
  }

  const playerType = source.type || (isM3U8(source.url) ? "hls" : "iframe");

  if (playerType === "hls") {
    video.classList.remove("hidden");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source.url;
      video.play().catch(() => {});
    } else if (window.Hls && Hls.isSupported()) {
      hlsInstance = new Hls();
      hlsInstance.loadSource(source.url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(() => {});
      });
    } else {
      alert("Seu navegador não suporta HLS.");
    }
  } else {
    iframe = document.createElement("iframe");
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
    
    container.appendChild(iframe);
    
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
  gtag('event', 'page_view', {
  page_title: 'Assistindo: ' + team,
  page_location: window.location.href + '#' + team
});
}

function goHome() {
  destroyHls();
  const iframe = document.getElementById("videoFrame");
  const video = document.getElementById("videoPlayer");
  iframe.src = "";
  video.pause();
  video.removeAttribute("src");
  video.load();
  document.getElementById("watchPage").classList.remove("active");
  document.getElementById("homePage").classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function changePlayer(button, playerIndex) {
  const match = matches[currentMatch];
  loadPlayer(match.players[playerIndex - 1]);
  document.querySelectorAll(".player-btn").forEach((btn) => {
    btn.classList.remove("active-player");
  });
  button.classList.add("active-player");
}

document.addEventListener('contextmenu', event => event.preventDefault());

document.onkeydown = function(e) {
    if (e.keyCode == 123) { return false; } // F12
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { return false; } // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) { return false; } // Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { return false; } // Ctrl+Shift+J
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { return false; } // Ctrl+U
    if (e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)) { return false; } // Ctrl+S (Evita salvar a página)
};