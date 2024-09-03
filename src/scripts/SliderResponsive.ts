import { addCustomEventListener, obtenerHermanos } from '@/utils/CustomEventListener';

type Direction = 'LEFT' | 'RIGTH';

export class SliderResponsive {
  // Parámetro que recibe la clase
  private slider: HTMLElement | null = null;

  // Variables privadas a inicializar
  private $sliderNavDot: HTMLElement | null = null;
  private $sliderList: HTMLElement | null = null;
  private $sliderItems: HTMLElement[] | null = null;
  private $arraySLiderItems: HTMLElement[] = [];
  private $arrayDots: HTMLElement[] = [];

  private itemObserver: IntersectionObserver;

  constructor(slider: string) {
    this.slider = document.querySelector<HTMLElement>(slider);

    this.#initElements();
    this.#clonarItem();
    this.#eventsElements();
    this.#insertectionOberver();
    this.#activeSliderItem();
  }

  #clonarItem() {
    const existingClones = this.$sliderList.querySelectorAll<HTMLElement>('[data-clone="true"]');
    if (existingClones.length > 0) {
      existingClones.forEach((clone) => clone.remove());
    }

    this.$sliderItems = Array.from(this.$sliderList.querySelectorAll<HTMLElement>('.slider__item:not([data-clone="true"])'));
    const { firstElements, lastElements } = this.#getFirstAndLastElements(this.$sliderItems, this.#getSlidersShow());

    let totalClonesWidth = 0;
    firstElements.forEach((elem, index) => {
      const clone = elem.cloneNode(true) as HTMLElement;
      clone.setAttribute('data-clone', 'true');
      if (index === 0) clone.setAttribute('data-return', 'true');
      this.$sliderList.append(clone);
      totalClonesWidth += clone.clientWidth;
    });

    lastElements.reverse().forEach((elem, index) => {
      const clone = elem.cloneNode(true) as HTMLElement;
      clone.setAttribute('data-clone', 'true');
      if (index === lastElements.length - 1) clone.setAttribute('data-return', 'true');
      this.$sliderList.prepend(clone);
    });
  }

  #initElements() {
    this.$sliderNavDot = this.slider.querySelector<HTMLElement>('.slider__nav');
    this.$sliderList = this.slider.querySelector<HTMLElement>('.slider__list');
    this.$sliderItems = Array.from(this.$sliderList.querySelectorAll<HTMLElement>('.slider__item'));
    this.$arrayDots = this.$sliderNavDot ? (Array.from(this.$sliderNavDot.children) as HTMLElement[]) : [];
    this.$arraySLiderItems = this.$sliderList ? (Array.from(this.$sliderList.children) as HTMLElement[]) : [];
  }

  #eventsElements() {
    addCustomEventListener(
      'click',
      '.slider__prev',
      () => {
        this.#activeSmoothScroll();
        this.#moveSLideActive('LEFT', this.#getSlidersShow());
      },
      this.slider
    );
    addCustomEventListener(
      'click',
      '.slider__next',
      () => {
        this.#activeSmoothScroll();
        const $SlideActive = this.slider.querySelector('.slider__item[data-active-slider]') as HTMLElement;
        // console.log($SlideActive);

        this.#moveSLideActive('RIGTH', this.#getSlidersShow());
      },
      this.slider
    );

    addCustomEventListener(
      'click',
      '.slider__dot',
      (e) => {
        this.#activeSmoothScroll();
        const target = e.target as HTMLElement | null;
        const atributeDataSlide = target.getAttribute('data-slide');
        const { element, distance } = this.#getSlideWithDot(atributeDataSlide);

        if (element) {
          this.#setSlideMoveScroll(distance);
        }
      },
      this.slider
    );

    window.addEventListener('resize', this.#throttledResize);

    this.$sliderList.addEventListener('scrollend', () => {
      this.#disableSmoothScroll();
      this.#observeSlides();
      // console.log(this.$sliderList.scrollLeft);
    });
  }

  #insertectionOberver = () => {
    this.itemObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            if (element.classList.contains('active')) {
              element.setAttribute('data-active-slider', 'true');
            }
          } else {
            if (element.classList.contains('active')) {
              element.removeAttribute('data-active-slider');
            }
          }
        });

        const anyActiveVisible = entries.some((entry) => {
          return entry.isIntersecting && (entry.target as HTMLElement).classList.contains('active');
        });

        if (!anyActiveVisible) {
          const visibleEntries = entries.filter((entry) => entry.isIntersecting);

          const elementWithDataReturn = visibleEntries.find((entry) => {
            return (entry.target as HTMLElement).hasAttribute('data-return');
          });

          if (elementWithDataReturn) {
            const $Element = elementWithDataReturn.target as HTMLElement;
            const atributeDataSlide = $Element.getAttribute('data-slide');

            const $original = this.$sliderItems.find(
              (item) => item.getAttribute('data-slide') === atributeDataSlide && !item.hasAttribute('data-clone')
            );

            const distanceLeft = $original.offsetLeft;
            this.#setSlideMoveScroll(distanceLeft);

            // console.log('Elemento con data-return:', elementWithDataReturn.target);
          }
        } else {
          const visibleEntries = entries.filter((entry) => entry.isIntersecting);
          const $sliderActive = visibleEntries.find((entry) => {
            return (entry.target as HTMLElement).classList.contains('active');
          });

          const atributeDataSlide = $sliderActive.target.getAttribute('data-slide');
          this.#setActiveDot(atributeDataSlide);

          // console.log('Hay al menos un elemento activo visible en el slider.');
        }

        entries.forEach((entry) => observer.unobserve(entry.target));
      },
      {
        root: this.$sliderList,
        threshold: 0.8,
      }
    );
  };

  #observeSlides = () => {
    const $ArrayItem = Array.from(this.$sliderList.children) as HTMLElement[];
    $ArrayItem.forEach((item) => this.itemObserver.observe(item));
  };

  #moveSLideActive(direction: Direction, steps: number = 1) {
    const $SlideActive = this.slider.querySelector('.slider__item[data-active-slider]') as HTMLElement;

    const { ultimoHermano } = obtenerHermanos($SlideActive, direction, steps);
    if (!ultimoHermano) return;
    // console.log(ultimoHermano);

    const { distance } = this.#getSlidePostion(ultimoHermano);
    this.#setSlideMoveScroll(distance);
  }

  #setActiveDot(index: string) {
    this.$arrayDots = this.$sliderNavDot ? (Array.from(this.$sliderNavDot.children) as HTMLElement[]) : [];
    if (this.$arrayDots.length === 0) return;

    this.$arrayDots.forEach((dot) => dot.classList.remove('active'));
    const $indexDot = parseInt(index, 10);

    this.$arrayDots.forEach((dot) => {
      const dotIndex = parseInt(dot.getAttribute('data-slide') || '', 10);
      if (dotIndex === $indexDot) {
        dot.classList.add('active');
      }
    });

    // if ($indexDot >= 0 && $indexDot < this.$arrayDots.length) {
    //   this.$arrayDots[$indexDot].classList.add('active');
    // }
  }

  #reoderSlider(targetElement: HTMLElement) {
    const $ArrayItems = Array.from(this.$sliderList.children) as HTMLElement[];
    const atributeDataSlide = targetElement.getAttribute('data-slide');
    const $SliderOriginal = $ArrayItems.find((item) => {
      return item.getAttribute('data-slide') === atributeDataSlide && !item.hasAttribute('data-clone');
    });

    if ($SliderOriginal) {
      this.#setSlideMoveScroll($SliderOriginal.offsetLeft);
    }
  }

  #getSlidePostion(item: HTMLElement) {
    return {
      dataPosition: item.getAttribute('data-positionValue'),
      dataSlide: item.getAttribute('data-slide'),
      distance: item.offsetLeft,
    };
  }

  #setSlideMoveScroll(value: number) {
    this.$sliderList.scrollLeft = value;
  }

  #getSlideWithDot(dataSlide: string) {
    if (dataSlide) {
      const sliderActive = this.$arraySLiderItems.find(
        (itemSlider) => itemSlider.getAttribute('data-slide') === dataSlide && !itemSlider.hasAttribute('data-clone')
      );

      if (sliderActive) {
        return {
          element: sliderActive,
          distance: sliderActive.offsetLeft,
        };
      }
    }

    // Si no se encuentra el elemento o si `dataSlide` no está definido, retorna `null`
    return null;
  }

  #activeSmoothScroll() {
    this.$sliderList.style.setProperty('--Move', 'smooth');
  }
  #disableSmoothScroll() {
    this.$sliderList.style.setProperty('--Move', 'auto');
  }

  #getFirstAndLastElements(elements: HTMLElement[], count: number) {
    if (count < 1) {
      return {
        firstElements: [],
        lastElements: [],
      };
    }

    const firstElements = elements.slice(0, count);
    const lastElements = elements.slice(-count);

    return {
      firstElements,
      lastElements,
    };
  }

  #getSlidersShow() {
    return Number(getComputedStyle(this.$sliderList).getPropertyValue('--sliders-show'));
  }
  #setSlidersShow(value: string) {
    this.$sliderList.style.setProperty('--sliders-show', value);
  }

  #throttle(cb: (...args: any[]) => void, delay: number = 1000) {
    let shouldWait = false;
    let waitingArgs: any[] | null;

    const timeoutFunc = () => {
      if (waitingArgs == null) {
        shouldWait = false;
      } else {
        cb(...waitingArgs);
        waitingArgs = null;
        setTimeout(timeoutFunc, delay);
      }
    };

    return (...args: any[]) => {
      if (shouldWait) {
        waitingArgs = args;
        return;
      }

      cb(...args);
      shouldWait = true;
      setTimeout(timeoutFunc, delay);
    };
  }

  #throttledResize = this.#throttle(() => {
    this.#clonarItem();
    this.#activeSliderItem();
  }, 250);

  #activeSliderItem() {
    const allElements = this.slider.querySelectorAll<HTMLElement>('.slider__list > *');
    allElements.forEach((elem) => {
      elem.classList.remove('active');
      elem.removeAttribute('data-active-slider');
    });

    const dynamicSelector = `.slider__list > *:nth-child(${this.#getSlidersShow()}n + 1)`;
    const allMatchingElements = this.slider.querySelectorAll<HTMLElement>(dynamicSelector);
    const filteredElements = Array.from(allMatchingElements).filter((element) => !element.hasAttribute('data-clone'));
    filteredElements.forEach((elem) => elem.classList.add('active'));
    this.#createDots(filteredElements);
  }

  #createDots(elems: HTMLElement[]) {
    const fragment = document.createDocumentFragment();

    while (this.$sliderNavDot.firstChild) {
      this.$sliderNavDot.removeChild(this.$sliderNavDot.firstChild);
    }

    elems.forEach((elem) => {
      const dataValue = elem.getAttribute('data-slide');
      const className = 'slider__dot';
      const button = document.createElement('button');
      button.className = className;
      button.setAttribute('data-slide', dataValue);
      fragment.appendChild(button);
    });

    this.$sliderNavDot.appendChild(fragment);
  }
}
