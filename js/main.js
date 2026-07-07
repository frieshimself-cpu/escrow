/* SupplyFun — shared interactivity */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initWalletModal();
  initCounters();
  initReveal();
  initTokenGallery();
  initMilestoneTrack();
  initLaunchForm();
  initClaimFlow();
});

/* ------------------------------------------------------------------ */
/* Mobile nav                                                          */
/* ------------------------------------------------------------------ */
function initMobileNav() {
  const burger = document.querySelector(".nav-burger");
  const menu = document.querySelector(".nav-mobile");
  if (!burger || !menu) return;
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
}

/* ------------------------------------------------------------------ */
/* Wallet modal (demo — no real wallet adapter wired up)               */
/* ------------------------------------------------------------------ */
function initWalletModal() {
  const backdrop = document.getElementById("wallet-modal");
  if (!backdrop) return;

  const openers = document.querySelectorAll("[data-open-wallet]");
  const close = () => backdrop.classList.remove("open");

  openers.forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      backdrop.classList.add("open");
    })
  );

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelector(".modal-close")?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  backdrop.querySelectorAll(".wallet-option").forEach((btn) =>
    btn.addEventListener("click", () => {
      close();
      const addr = mockAddress();
      document.querySelectorAll("[data-open-wallet].btn").forEach((b) => {
        b.textContent = addr;
        b.classList.remove("btn-ghost");
        b.classList.add("btn-dark");
      });
      toast(`Connected ${addr} (demo)`);
    })
  );
}

function mockAddress() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  let e = "";
  for (let i = 0; i < 4; i++) e += chars[Math.floor(Math.random() * chars.length)];
  return `${s}…${e}`;
}

/* ------------------------------------------------------------------ */
/* Animated counters in the stats bar                                  */
/* ------------------------------------------------------------------ */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        animateCount(entry.target);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => io.observe(c));
}

function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const decimals = Number(el.dataset.decimals || 0);
  const dur = 1600;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = target * eased;
    el.textContent = prefix + val.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------------ */
/* Scroll reveal                                                       */
/* ------------------------------------------------------------------ */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------------ */
/* Token gallery with filter tabs                                      */
/* ------------------------------------------------------------------ */
function initTokenGallery() {
  const grid = document.querySelector("[data-token-grid]");
  if (!grid || typeof TOKENS === "undefined") return;

  const limit = Number(grid.dataset.limit || 0);
  const tabs = document.querySelectorAll(".tab[data-filter]");

  function render(filter) {
    let list = TOKENS;
    if (filter && filter !== "all") {
      list = TOKENS.filter((t) => t.tags.includes(filter) || t.status === filter);
    }
    if (limit) list = list.slice(0, limit);

    grid.innerHTML = list.length
      ? list.map(tokenCard).join("")
      : `<p class="empty-note">No launches match this filter yet — check back soon.</p>`;

    // let the milestone bars animate in
    requestAnimationFrame(() => {
      grid.querySelectorAll(".milestone .bar i").forEach((bar) => {
        bar.style.width = bar.dataset.w;
      });
    });
  }

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      render(tab.dataset.filter);
    })
  );

  render(document.querySelector(".tab.active")?.dataset.filter || "all");
}

function tokenCard(t) {
  const changeCls = t.change >= 0 ? "up" : "down";
  const changeSign = t.change >= 0 ? "+" : "";
  return `
  <article class="token-card" title="$${t.ticker} — demo launch">
    <div class="token-top">
      <div class="token-avatar" style="background:${t.color}">${t.ticker[0]}</div>
      <div class="token-id">
        <b>$${t.ticker}</b>
        <span>${t.handle}</span>
      </div>
      <span class="badge ${t.status}">${STATUS_LABEL[t.status] || t.status}</span>
    </div>
    <div class="token-metrics">
      <div>Market cap <b>$${fmtCompact(t.mcap)}</b></div>
      <div class="${changeCls}">24h <b>${changeSign}${t.change.toFixed(1)}%</b></div>
      <div>Volume 24h <b>$${fmtCompact(t.vol24)}</b></div>
      <div>Liquidity <b>$${fmtCompact(t.liq)}</b></div>
    </div>
    <div class="milestone">
      <div class="row"><span>Milestone progress</span><b>${t.milestone}%</b></div>
      <div class="bar"><i data-w="${t.milestone}%" style="width:0"></i></div>
    </div>
  </article>`;
}

function fmtCompact(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

/* ------------------------------------------------------------------ */
/* Milestone liquidity track                                           */
/* ------------------------------------------------------------------ */
function initMilestoneTrack() {
  const track = document.querySelector("[data-mile-progress]");
  if (!track) return;
  const pct = Number(track.dataset.mileProgress);

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const fill = track.querySelector(".mile-line i");
        if (fill) fill.style.width = pct + "%";
        track.querySelectorAll(".mile-node").forEach((node) => {
          if (Number(node.dataset.at) <= pct) node.classList.add("hit");
        });
      });
    },
    { threshold: 0.4 }
  );
  io.observe(track);
}

/* ------------------------------------------------------------------ */
/* Launch form (demo)                                                  */
/* ------------------------------------------------------------------ */
function initLaunchForm() {
  const form = document.getElementById("launch-form");
  if (!form) return;

  const handleInput = form.querySelector("#creator-handle");
  const pctInput = form.querySelector("#creator-pct");
  const preview = document.getElementById("escrow-preview");

  function updatePreview() {
    if (!preview) return;
    const handle = (handleInput?.value || "").trim().replace(/^@*/, "");
    const pct = Math.min(Math.max(Number(pctInput?.value || 0), 0), 50);
    preview.querySelector("[data-p-handle]").textContent = handle ? "@" + handle : "—";
    preview.querySelector("[data-p-pct]").textContent = pct + "%";
    preview.querySelector("[data-p-open]").textContent = (100 - pct) + "%";
  }

  handleInput?.addEventListener("input", updatePreview);
  pctInput?.addEventListener("input", updatePreview);
  updatePreview();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    toast("Demo only — no token was deployed. Wire up your program here.");
  });
}

/* ------------------------------------------------------------------ */
/* Claim flow (demo)                                                   */
/* ------------------------------------------------------------------ */
function initClaimFlow() {
  const flow = document.getElementById("claim-flow");
  if (!flow) return;

  flow.querySelectorAll("[data-step-action]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const step = btn.closest(".verify-step");
      step.classList.add("done");
      btn.textContent = "Done";
      btn.disabled = true;
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-dark");
      toast(btn.dataset.stepAction + " (demo)");
    })
  );
}

/* ------------------------------------------------------------------ */
/* Toast helper                                                        */
/* ------------------------------------------------------------------ */
let toastTimer;
function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}
