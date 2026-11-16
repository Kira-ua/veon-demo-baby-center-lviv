export {};
// Page behaviour: branch picker, mobile menu, colour strip of the current section, bottom bar on phones.
// Every part degrades to plain links: without script [data-picker] goes to #branches and the menu is a <details>.
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const wide = window.matchMedia("(min-width: 48rem)");

/* Branch picker */
const picker = document.querySelector<HTMLDialogElement>("#picker");
let opener: HTMLElement | null = null;
let closing = 0;

function place(from: HTMLElement) {
  if (!picker) return;
  if (!wide.matches) { picker.style.removeProperty("--x"); picker.style.removeProperty("--y"); return; }
  const r = from.getBoundingClientRect();
  const w = Math.min(416, window.innerWidth - 32);
  const x = Math.max(16, Math.min(r.left, window.innerWidth - w - 16));
  const below = r.bottom + 8;
  const y = below + 360 > window.innerHeight ? Math.max(16, r.top - 8 - picker.offsetHeight) : below;
  picker.style.setProperty("--x", `${x}px`);
  picker.style.setProperty("--y", `${y}px`);
}

function openPicker(from: HTMLElement) {
  if (!picker || typeof picker.showModal !== "function") return false;
  window.clearTimeout(closing);
  opener = from;
  picker.classList.remove("is-closing");
  place(from);
  if (!picker.open) picker.showModal();
  place(from);
  picker.querySelector<HTMLElement>(".picker__row a")?.focus();
  return true;
}

function closePicker() {
  if (!picker || !picker.open) return;
  picker.classList.add("is-closing");
  const done = () => { picker.close(); picker.classList.remove("is-closing"); opener?.focus(); };
  if (reduce.matches) done();
  else closing = window.setTimeout(done, 160);
}

document.addEventListener("click", (e) => {
  const t = e.target as Element | null;
  const trigger = t?.closest<HTMLElement>("[data-picker]");
  if (trigger && openPicker(trigger)) { e.preventDefault(); closeMenu(); }
});
document.querySelectorAll<HTMLElement>("[data-picker]").forEach((el) => el.setAttribute("aria-haspopup", "dialog"));
picker?.addEventListener("cancel", (e) => { e.preventDefault(); closePicker(); });
picker?.addEventListener("click", (e) => {
  if (e.target === picker) closePicker();
  if ((e.target as Element).closest("[data-picker-close]")) closePicker();
});

/* FutureLink: a tap shows «Розділ у розробці» for 2 s (hover already does on desktop) */
let tipTimer = 0;
document.addEventListener("click", (e) => {
  const fl = (e.target as Element | null)?.closest<HTMLElement>(".future-link");
  document.querySelectorAll(".future-link.is-tip").forEach((el) => { if (el !== fl) el.classList.remove("is-tip"); });
  if (!fl) return;
  fl.classList.add("is-tip");
  window.clearTimeout(tipTimer);
  tipTimer = window.setTimeout(() => fl.classList.remove("is-tip"), 2000);
});

/* Mobile menu (<details>): close on link, Esc and outside click */
const menu = document.querySelector<HTMLDetailsElement>("[data-menu]");
function closeMenu() { if (menu?.open) menu.open = false; }
menu?.addEventListener("click", (e) => { if ((e.target as Element).closest("a")) closeMenu(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu?.open) { closeMenu(); menu.querySelector("summary")?.focus(); }
});
document.addEventListener("click", (e) => { if (menu?.open && !menu.contains(e.target as Node)) closeMenu(); });
wide.addEventListener("change", closeMenu);

/* Colour strip: the colour of the section under the header */
const strip = document.querySelector<HTMLElement>("[data-strip]");
const toned = Array.from(document.querySelectorAll<HTMLElement>("[data-tone]"));
let current = "";
function setTone(tone: string) {
  if (!strip || tone === current) return;
  current = tone;
  const value = `var(--color-${tone})`;
  const showB = !strip.classList.contains("is-b");
  strip.style.setProperty(showB ? "--b" : "--a", value);
  strip.classList.toggle("is-b", showB);
}
if (strip && toned.length && "IntersectionObserver" in window) {
  const seen = new Map<Element, boolean>();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => seen.set(en.target, en.isIntersecting));
    const active = toned.filter((el) => seen.get(el)).pop() ?? toned.find((el) => seen.get(el));
    if (active?.dataset.tone) setTone(active.dataset.tone);
  }, { rootMargin: "-80px 0px -70% 0px" });
  toned.forEach((el) => io.observe(el));
}

/* Bottom bar on phones: appears once the first screen is behind */
const bar = document.querySelector<HTMLElement>("[data-bar]");
const top = document.querySelector("#top");
if (bar && top && "IntersectionObserver" in window) {
  new IntersectionObserver(([en]) => { bar.classList.toggle("is-shown", !en.isIntersecting); }, { rootMargin: "0px 0px -40% 0px" }).observe(top);
}
