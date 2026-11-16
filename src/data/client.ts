// Facts for the homepage, only from veon/client.json (checked 2026-11-16). Prices: baby-center.lviv.ua/vartist/ and /price/.
// Not shown on purpose: opening hours (W-F004), psychologist price (W-F003), the third address from a catalogue (W-F006), Facebook.

export interface Branch {
  id: "centr" | "chornovola";
  name: string;
  street: string;
  phone: string;
  phoneLabel: string;
  viber?: string;
  email: string;
  map: string;
}

const map = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const branches: Branch[] = [
  {
    id: "centr",
    name: "Центр",
    street: "вул. Саксаганського, 14",
    phone: "tel:+380673106720",
    phoneLabel: "(067) 310-67-20",
    viber: "viber://chat?number=%2B380673106720",
    email: "babycenter.lviv@gmail.com",
    map: map("Львів, вулиця Саксаганського, 14"),
  },
  {
    id: "chornovola",
    name: "Чорновола",
    street: "вул. Ставова, 7В",
    phone: "tel:+380967783131",
    phoneLabel: "(096) 778-31-31",
    email: "babycenter3.lviv@gmail.com",
    map: map("Львів, вулиця Ставова, 7В"),
  },
];

// Telegram handle from client.json (@KUZYADRUZII); t.me is Telegram's own address for the same account.
export const telegram = { href: "https://t.me/KUZYADRUZII", label: "@KUZYADRUZII" };
export const instagram = { href: "https://www.instagram.com/babycenter.friends/", label: "@babycenter.friends" };

export interface AgeGroup {
  id: string;
  range: string;
  unit: string;
  tone: "age-1" | "age-3" | "age-5";
  short: string;
  items: string[];
}

export const ages: AgeGroup[] = [
  { id: "age-1-3", range: "1–3", unit: "роки", tone: "age-1", short: "Монтессорі, Baby-fitness, музика", items: ["Монтессорі-заняття", "Baby-fitness", "Музичні заняття", "Ізостудія"] },
  { id: "age-3-5", range: "3–5", unit: "років", tone: "age-3", short: "«Умка», ритміка, англійська", items: ["«Умка»", "Ритміка", "Музичні заняття", "Англійська мова", "Образотворче мистецтво", "Пісочна анімація"] },
  { id: "age-5-7", range: "5–7", unit: "років", tone: "age-5", short: "«Дошколярик», English, гімнастика", items: ["English", "Студія образотворчого мистецтва", "Гімнастика", "Музичні заняття"] },
];

export const preschool = [
  { label: "2 години двічі на тиждень", price: "2100" },
  { label: "3 години двічі на тиждень", price: "2750" },
];

export const kindergartenPrices = [
  { label: "День", price: "700" },
  { label: "Тиждень", price: "2300" },
  { label: "Місяць", price: "7000" },
];

export const passes = [
  { count: "4", price: "900" },
  { count: "8", price: "1450" },
  { count: "12", price: "1800" },
  { count: "16", price: "2200" },
];

export const shows = "наукове, паперове і бульбашкове шоу, фокусник, аквагрим, піньята, фотограф, торти, babysitter, привітання Санта Клауса і св. Миколая";
export const workshops = "розпис футболок, карамельний, пісочна анімація, гіпсові фігурки, малювання в темряві, КДМ";

export const futureNote = "Розділ у розробці";
