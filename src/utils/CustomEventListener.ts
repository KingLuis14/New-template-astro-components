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
  
  
  
  export const getSiblings = (elem: HTMLElement, parent?: string | HTMLElement) => {
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
  