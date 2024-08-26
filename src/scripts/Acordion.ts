export const toogleAcordeon = (e: Event) => {
    const startTime = performance.now();
    const $Button = e.target as HTMLElement;
    if (!$Button) return;

    $Button.classList.toggle("active");
    const $Contenido = $Button.nextElementSibling as HTMLElement;
    rotateIcon($Button.querySelector("span"));
    $Contenido.classList.toggle("isOpen");

    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    console.log(`Event click processing time: ${timeTaken}ms`);
  };

  const rotateIcon = (element: HTMLElement) => {
    element.classList.toggle("rotate");
  };