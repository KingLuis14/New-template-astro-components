import { addCustomEventListener, obtenerHermanos } from '@/utils/CustomEventListener';

type Direction = 'LEFT' | 'RIGTH';

interface Props {
  slider: string;
  sliderItem?: string;
  autoPlayOptions?: {
    time: number;
  };
}

export class SliderResponsive {
  private slider: HTMLElement | null = null;
  private autoPlayoptions: { time: number } = null;

  private $sliderNavDot: HTMLElement | null = null;
  private $sliderList: HTMLElement | null = null;
  private $sliderItems: HTMLElement[] | null = null;
  private $arraySLiderItems: HTMLElement[] = [];
  private $arrayDots: HTMLElement[] = [];

  private itemObserver: IntersectionObserver;
  private autoplayEnabled: boolean;
  private autoplayInterval: NodeJS.Timeout | null = null;
  private selectorSliderItem: string = null;

  constructor({ slider, autoPlayOptions, sliderItem = '.slider__item' }: Props) {
    this.slider = document.querySelector<HTMLElement>(slider);
    this.selectorSliderItem = sliderItem;
    this.#initElements();
    this.#eventsElements();
    this.#insertectionOberver();
    this.#observeSlides();
    this.autoPlayoptions = autoPlayOptions;
    this.autoplayEnabled = !!autoPlayOptions;

    if (autoPlayOptions) {
      this.startAutoplay(this.autoplayAction, autoPlayOptions.time);
    }
  }

  #clonarItem() {
    const existingClones = this.$sliderList.querySelectorAll<HTMLElement>('[data-clone="true"]');
    if (existingClones.length > 0) {
      existingClones.forEach((clone) => clone.remove());
    }

    this.$sliderItems = Array.from(this.$sliderList.querySelectorAll<HTMLElement>(`${this.selectorSliderItem}:not([data-clone="true"]`));
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
    this.#setSlideMoveScroll(totalClonesWidth);
  }

  #initElements() {
    this.$sliderNavDot = this.slider.querySelector<HTMLElement>('.slider__nav');
    this.$sliderList = this.slider.querySelector<HTMLElement>('.slider__list');
    this.$sliderItems = Array.from(this.$sliderList.querySelectorAll<HTMLElement>(`${this.selectorSliderItem}`));
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

    const resize = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        this.#throttledResize(entry.target);
      });
    });
    resize.observe(this.$sliderList);

    this.#initScrollEvents();

    this.$sliderList.addEventListener('mouseenter', this.#throttledDisableAutoPlay);
    this.$sliderList.addEventListener('mouseleave', this.#resetAutoPlay.bind(this));
    this.$sliderList.addEventListener('touchstart', this.#throttledDisableAutoPlay);
    this.$sliderList.addEventListener('touchend', this.#resetAutoPlay.bind(this));
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

            const $original = this.$sliderItems.find((item) => item.getAttribute('data-slide') === atributeDataSlide && !item.hasAttribute('data-clone'));

            const distanceLeft = $original.offsetLeft;
            this.#setSlideMoveScroll(distanceLeft);
          }
        } else {
          const visibleEntries = entries.filter((entry) => entry.isIntersecting);
          const $sliderActive = visibleEntries.find((entry) => {
            return (entry.target as HTMLElement).classList.contains('active');
          });

          const atributeDataSlide = $sliderActive.target.getAttribute('data-slide');
          this.#setActiveDot(atributeDataSlide);
        }

        entries.forEach((entry) => observer.unobserve(entry.target));
      },
      {
        root: this.$sliderList,
        threshold: 0.5,
      }
    );
  };

  #observeSlides = () => {
    const $ArrayItem = Array.from(this.$sliderList.children) as HTMLElement[];
    $ArrayItem.forEach((item) => this.itemObserver.observe(item));
  };

  #moveSLideActive(direction: Direction, steps: number = 1) {
    const $SlideActive = this.slider.querySelector(`${this.selectorSliderItem}[data-active-slider]`) as HTMLElement;

    const { ultimoHermano } = obtenerHermanos($SlideActive, direction, steps);
    if (!ultimoHermano) return;

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
      const sliderActive = this.$arraySLiderItems.find((itemSlider) => itemSlider.getAttribute('data-slide') === dataSlide && !itemSlider.hasAttribute('data-clone'));

      if (sliderActive) {
        return {
          element: sliderActive,
          distance: sliderActive.offsetLeft,
        };
      }
    }
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

  #resetAutoPlay() {
    if (this.autoplayEnabled) {
      this.stopAutoplay();
      this.startAutoplay(this.autoplayAction, this.autoPlayoptions.time);
    }
  }

  // poluifyll scroll

  #initScrollEvents() {
    if ('onscrollend' in window) {
      // console.log('si soporta');

      this.$sliderList.addEventListener('scrollend', () => {
        this.#disableSmoothScroll();
        this.#observeSlides();
        this.#resetAutoPlay();
      });
    } else {
      // console.log('No soporta');
      this.$sliderList.addEventListener('scroll', this.#scrollEnd, { passive: true });

      // Escuchar el evento customscrollend
      this.$sliderList.addEventListener('customscrollend', () => {
        this.#disableSmoothScroll();
        this.#observeSlides();
        this.#resetAutoPlay();
      });
    }
  }

  #scrollEnd = this.#debounce((e: Event) => {
    (e.target as HTMLElement).dispatchEvent(
      new CustomEvent('customscrollend', {
        bubbles: true,
      })
    );
  }, 100);

  // Función debounce para manejar la espera del evento scroll
  #debounce(callback: (e: Event) => void, wait: number) {
    let timeout: number | undefined;
    return (e: Event) => {
      clearTimeout(timeout);

      timeout = window.setTimeout(() => {
        callback(e);
      }, wait);
    };
  }

  // Función para iniciar el autoplay con setInterval
  private startAutoplay = (cb: () => void, interval: number = 4000): (() => void) => {
    if (this.autoplayInterval !== null) {
      return this.stopAutoplay;
    }

    this.autoplayInterval = setInterval(cb, interval);

    // Devuelve una función para detener el autoplay
    return this.stopAutoplay;
  };

  // Método para detener el autoplay
  private stopAutoplay = (): void => {
    if (this.autoplayInterval !== null) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  };

  private autoplayAction = (): void => {
    this.#activeSmoothScroll();
    this.#moveSLideActive('RIGTH', this.#getSlidersShow());
    // console.log('Ejecutado cada 4 segundos', this.slider);
  };

  #throttledDisableAutoPlay = this.#throttle(() => {
    if (this.autoplayEnabled) {
      this.stopAutoplay();
    }
  }, 250);
}
