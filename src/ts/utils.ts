export type error = string;

export function assert(condition: boolean): asserts condition {
  if (!condition) throw new Error("assertion error");
}

// https://stackoverflow.com/a/45905199/6164984
export function debounce(delayMS: number, func: (a: any) => any) {
  let timer: any;
  return function (event: any) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, delayMS, event);
  };
}

export function querySelector<T extends HTMLElement>(
  selector: string,
  parent: HTMLElement | Document = document
): T {
  const el = parent.querySelector<T>(selector);
  if (el === null) throw new Error(`selector ${selector} returned null`);
  return el;
}

export function escapeHTML(html: string): string {
  const el = document.createElement("span");
  el.textContent = html;
  return el.innerHTML;
}

export async function sleep(delay: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(() => res(), delay);
  });
}

export function durationToString(totalMS: number): string {
  const ms = totalMS % 1000;
  totalMS /= 1000;
  const s = Math.floor(totalMS) % 60;
  totalMS /= 60;
  const m = Math.floor(totalMS) % 60;
  totalMS /= 60;
  const h = Math.floor(totalMS) % 24;
  totalMS /= 24;
  const d = Math.floor(totalMS) % 365;
  totalMS /= 365;
  const y = Math.floor(totalMS) % 1000;
  totalMS /= 1000;
  const mil = Math.floor(totalMS) % 4543000;

  // just for fun
  totalMS /= 4543000; // earth has been around for 4.543 billion years
  const e = Math.floor(totalMS);

  let parts = [];

  if (e > 1) parts.push(`${e}earth life spans`);
  if (e === 1) parts.push(`${e}earth life span`);
  if (mil > 1) parts.push(`${mil}milleniums`);
  if (mil === 1) parts.push(`${mil}millenium`);
  if (y > 1) parts.push(`${y}years`);
  if (y === 1) parts.push(`${y}year`);
  if (d > 1) parts.push(`${d}days`);
  if (d === 1) parts.push(`${d}day`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}min`);
  if (s > 0) parts.push(`${s}s`);
  if (ms > 0) parts.push(`${ms}ms`);

  // take at most 2 "sig fig" (no point saying 1year 234days 3h min 12s 400ms,
  // just say 1year 234days)
  return parts.slice(0, 2).join(" ");
}
