type Direction = "LEFT" | "RIGTH";

export const addCustomEventListener = (
  typeEvent: keyof DocumentEventMap,
  selector: string,
  callback: (e: Event) => void,
  parent: HTMLElement | Document = document
) => {
  parent.addEventListener(typeEvent, (e) => {
    const target = e.target as HTMLElement | null;
    if (target && target.matches(selector)) {
      callback(e);
    }
  });
};

export const getSiblings = (
  elem: HTMLElement,
  parent?: string | HTMLElement
) => {
  const parentElement =
    typeof parent === "string"
      ? elem.closest(parent).children
      : elem.parentNode.children;
  const $Hermanos = parentElement;
  return Array.from($Hermanos).filter(
    (hermano) => hermano !== elem
  ) as HTMLElement[];
};

export const removeClassElements = (
  elements: HTMLElement[],
  selectorClass: string
) => {
  elements.forEach((element) => element.classList.remove(selectorClass));
};

export const findPreviousSiblingWithClass = (
  element: HTMLElement,
  className: string
) => {
  let sibling = element.previousElementSibling;

  while (sibling) {
    if (sibling.classList.contains(className)) {
      return sibling as HTMLElement;
    }
    sibling = sibling.previousElementSibling;
  }

  return null;
};
export const obtenerHermanos = (
  elementoInicial: HTMLElement,
  direction: Direction,
  cantidad: number
): { ultimoHermano: HTMLElement | null; hermanos: HTMLElement[] } => {
  const hermanos: HTMLElement[] = [];
  let elemento = elementoInicial;

  if (direction === "RIGTH") {
    while (elemento.nextElementSibling && hermanos.length < cantidad) {
      elemento = elemento.nextElementSibling as HTMLElement;
      hermanos.push(elemento);
    }
  } else {
    // Si no es "RIGHT", asumimos que es "LEFT"
    while (elemento.previousElementSibling && hermanos.length < cantidad) {
      elemento = elemento.previousElementSibling as HTMLElement;
      hermanos.push(elemento);
    }
  }

  const ultimoHermano =
    hermanos.length > 0 ? hermanos[hermanos.length - 1] : null;

  return { ultimoHermano, hermanos };
};


export type CreateArrayWithLengthX<
    LENGTH extends number,
    ACC extends unknown[] = [],

> = ACC['length'] extends LENGTH
    ? ACC
    : CreateArrayWithLengthX<LENGTH, [...ACC,1]>


export type NumericRange<
START_ARR extends number[], 
END extends number, 
ACC extends number=never>=
START_ARR['length'] extends END 
? ACC | END
: NumericRange<[...START_ARR,1],END,ACC | START_ARR['length']>