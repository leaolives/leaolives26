const matches = {
  fortaleza: {
    title: "Fortaleza x CRB",
    meta: "22/04 • 20:30",
    players: [
      {
        type: "iframe",
        url: "https://2embeddecanais.xyz/amazonprimevideo02/"
      },
      {
        type: "hls",
        url: "https://xn---22--11--33--88--75---------b25zjfpkmbt1n9g9zza94e.xn----------------g34l3fkcn6n2hmd3acobj33ac2a7a8lufomma7cf2b1sh.xn---1l1--5o4dxb.xn--pck.xn--zck.xn--0ck.xn--pck.xn--yck.xn-----0b4asja8cbew2b4b0gd0edbjm2jpa1b1e9zva7a0347s4da2797e7qri.xn--1ck2e1b/docs/primevideo2/__index.m3u8?cc=y&sv=152&nu3zAQc9HC3GbwJq=1776892511-2p%2FO5yfeUkDvD%2FGMni4xP1gAX24hCQpam5hLrnYty4I%3D"
      },
      {
        type: "iframe",
        url: "https://w1.embedtv.live/primevideo3"
      }
    ]
  },
  ceara: {
    title: "Atlético MG x Ceará",
    meta: "23/04 • 20:30",
    players: [
      {
        type: "iframe",
        url: "https://player.exemplo.com/embed/ceara1"
      },
      {
        type: "hls",
        url: "https://teste.com/live/ceara2.m3u8"
      },
      {
        type: "hls",
        url: "https://teste.com/live/ceara3.m3u8"
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
  const iframe = document.getElementById("videoFrame");
  const video = document.getElementById("videoPlayer");

  destroyHls();

  iframe.classList.add("hidden");
  video.classList.add("hidden");
  iframe.src = "";
  video.pause();
  video.removeAttribute("src");
  video.load();

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
    iframe.classList.remove("hidden");
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
