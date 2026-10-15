import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type RefObject,
  type UIEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/class-name";

type CarouselContextValue = {
  viewportRef: RefObject<HTMLDivElement | null>;
  canScrollPrevious: boolean;
  canScrollNext: boolean;
  scrollPrevious: () => void;
  scrollNext: () => void;
  updateNavigation: () => void;
};

// Shares the viewport ref, navigation state, and scroll actions with
// CarouselContent, CarouselPrevious, and CarouselNext without prop drilling.
const CarouselContext = createContext<CarouselContextValue | null>(null);

// Returns the current carousel context and throws a clear error when a
// subcomponent is accidentally rendered outside the Carousel provider.
const useCarousel = () => {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error("Carousel components must be used inside <Carousel />");
  }

  return context;
};

export type CarouselProps = ComponentProps<"div">;

export const Carousel = ({
  className,
  children,
  onKeyDownCapture,
  ...props
}: CarouselProps) => {
  // viewportRef points to the element whose scrollLeft value changes.
  // The two state values control whether the previous/next buttons are usable.
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Compares the current horizontal position with the maximum scroll distance.
  // A 1px tolerance prevents browser rounding errors from leaving a navigation
  // button visible when the carousel is already at the beginning or end.
  const updateNavigation = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    const maximumScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    setCanScrollPrevious(viewport.scrollLeft > 1);
    setCanScrollNext(viewport.scrollLeft < maximumScrollLeft - 1);
  }, []);

  // Uses the first item's rendered width as one scroll step and includes the
  // track gap so each click lands on the next CSS snap point.
  // direction is -1 for previous and 1 for next.
  const scrollByItem = useCallback((direction: -1 | 1) => {
    const viewport = viewportRef.current;
    const firstItem = viewport?.firstElementChild?.firstElementChild;

    if (!viewport || !(firstItem instanceof HTMLElement)) return;

    const content = firstItem.parentElement;
    const gap = content ? Number.parseFloat(getComputedStyle(content).gap) : 0;

    viewport.scrollBy({
      left: direction * (firstItem.offsetWidth + (Number.isNaN(gap) ? 0 : gap)),
      behavior: "smooth",
    });
  }, []);

  const scrollPrevious = useCallback(() => scrollByItem(-1), [scrollByItem]);
  const scrollNext = useCallback(() => scrollByItem(1), [scrollByItem]);

  // Runs a consumer-provided keyboard handler first. Unless it prevents the
  // event, the left and right arrow keys move the carousel by one item.
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownCapture?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrevious();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [onKeyDownCapture, scrollNext, scrollPrevious],
  );

  // Watches both the visible viewport and the complete track. This keeps the
  // button state correct after responsive resizing, image loading, or item
  // width/content changes.
  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    const resizeObserver = new ResizeObserver(updateNavigation);
    resizeObserver.observe(viewport);

    if (viewport.firstElementChild) {
      resizeObserver.observe(viewport.firstElementChild);
    }

    updateNavigation();

    return () => resizeObserver.disconnect();
  }, [updateNavigation]);

  // The provider allows every compound component to consume the same state.
  // The root also exposes carousel semantics to assistive technologies.
  return (
    <CarouselContext.Provider
      value={{
        viewportRef,
        canScrollPrevious,
        canScrollNext,
        scrollPrevious,
        scrollNext,
        updateNavigation,
      }}
    >
      <div
        aria-roledescription="carousel"
        className={cn("relative", className)}
        data-slot="carousel"
        onKeyDownCapture={handleKeyDown}
        role="region"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

export const CarouselContent = ({
  className,
  onScroll,
  ...props
}: ComponentProps<"div">) => {
  const { viewportRef, updateNavigation } = useCarousel();

  // Native scrolling may come from buttons, touch, mouse wheels, or trackpads.
  // Rechecking on every scroll keeps both navigation buttons in sync.
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    updateNavigation();
    onScroll?.(event);
  };

  // The outer element scrolls while hiding its scrollbar. The inner flex track
  // keeps every item on one row and enables CSS scroll snapping.
  return (
    <div
      className="overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onScroll={handleScroll}
      ref={viewportRef}
    >
      <div
        className={cn("-ml-4 flex snap-x snap-mandatory", className)}
        data-slot="carousel-content"
        {...props}
      />
    </div>
  );
};

export const CarouselItem = ({
  className,
  ...props
}: ComponentProps<"div">) => {
  // The item cannot shrink and snap-start aligns its leading edge with the
  // viewport after a button click, touch gesture, or trackpad scroll.
  return (
    <div
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full snap-start pl-4",
        className,
      )}
      data-slot="carousel-item"
      role="group"
      {...props}
    />
  );
};

export const CarouselPrevious = ({
  className,
  ...props
}: ComponentProps<typeof Button>) => {
  const { canScrollPrevious, scrollPrevious } = useCarousel();

  // Hiding the disabled button matches the design and prevents an action that
  // cannot move the carousel any farther to the left.
  return (
    <Button
      {...props}
      aria-label={props["aria-label"] ?? "Previous slide"}
      className={cn(
        "absolute top-1/2 z-10 -translate-y-1/2 rounded-full border bg-card shadow-md hover:bg-muted disabled:invisible",
        className,
      )}
      disabled={!canScrollPrevious}
      onClick={scrollPrevious}
      size="icon-xl"
      variant="ghost"
    >
      <ChevronLeft aria-hidden="true" className="size-5" />
    </Button>
  );
};

export const CarouselNext = ({
  className,
  ...props
}: ComponentProps<typeof Button>) => {
  const { canScrollNext, scrollNext } = useCarousel();

  // Hiding the disabled button matches the design and prevents an action that
  // cannot move the carousel any farther to the right.
  return (
    <Button
      {...props}
      aria-label={props["aria-label"] ?? "Next slide"}
      className={cn(
        "absolute top-1/2 z-10 -translate-y-1/2 rounded-full border bg-card shadow-md hover:bg-muted disabled:invisible",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      size="icon-xl"
      variant="ghost"
    >
      <ChevronRight aria-hidden="true" className="size-5" />
    </Button>
  );
};
