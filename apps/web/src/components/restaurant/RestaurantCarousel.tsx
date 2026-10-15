import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { cn } from "@/lib/utils/class-name";
import type { Restaurant } from "@repo/shared/types/restaurant";

export type RestaurantCarouselItem = Restaurant;

export type RestaurantCarouselProps = {
  restaurants: RestaurantCarouselItem[];
  className?: string;
  isViewDetailsDisabled?: boolean;
  onFavoriteChange?: (id: string, isFavorite: boolean) => void;
  onViewDetails?: (id: string) => void;
};

export const RestaurantCarousel = ({
  restaurants,
  className,
  isViewDetailsDisabled = false,
  onFavoriteChange,
  onViewDetails,
}: RestaurantCarouselProps) => {
  if (restaurants.length === 0) {
    return null;
  }

  return (
    <Carousel className={cn("w-full", className)}>
      <CarouselContent className="pb-2">
        {restaurants.map((restaurant) => (
          <CarouselItem className="basis-[min(280px,85vw)]" key={restaurant.id}>
            <RestaurantCard
              {...restaurant}
              className="h-full max-w-none"
              isViewDetailsDisabled={isViewDetailsDisabled}
              onFavoriteChange={(isFavorite) =>
                onFavoriteChange?.(restaurant.id, isFavorite)
              }
              onViewDetails={() => onViewDetails?.(restaurant.id)}
            />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious aria-label="Previous restaurants" className="-left-4" />
      <CarouselNext aria-label="Next restaurants" className="-right-4" />
    </Carousel>
  );
};
