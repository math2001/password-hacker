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
