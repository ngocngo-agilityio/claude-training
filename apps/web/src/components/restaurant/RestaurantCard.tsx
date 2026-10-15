import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { cn } from "@/lib/utils/class-name";
import type { Restaurant } from "@repo/shared/types/restaurant";

export type RestaurantCardProps = Omit<Restaurant, "id"> & {
  className?: string;
  isViewDetailsDisabled?: boolean;
  onFavoriteChange?: (isFavorite: boolean) => void;
  onViewDetails?: () => void;
};

export const RestaurantCard = ({
  name,
  imageUrl,
  rating,
  reviewCount,
  cuisine,
  location,
  distance,
  priceRange,
  rank,
  className,
  isViewDetailsDisabled = false,
  onViewDetails,
}: RestaurantCardProps) => {
  return (
    <Card
      aria-label={`${name} restaurant`}
      className={cn(
        "group w-full max-w-[280px] gap-0 overflow-hidden rounded-2xl py-0 transition-[border-color,box-shadow] duration-200 ease-out hover:border-orange-300 hover:shadow-md focus-within:border-orange-300 dark:hover:border-orange-500/50 dark:focus-within:border-orange-500/50",
        className,
      )}
      role="article"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          alt={`Dining area at ${name}`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          src={imageUrl}
        />

        {rank && (
          <span className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-sm font-bold text-white shadow-sm">
            {rank}
          </span>
        )}
      </div>

      <CardContent className="space-y-2 p-4 pb-3">
        <h3 className="truncate text-base font-bold">{name}</h3>

        <div className="flex items-center gap-1.5 text-sm">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({reviewCount})</span>
        </div>

        <p className="truncate text-sm text-muted-foreground">
          {cuisine}
          <span> · </span>
          {location}
          <span> · </span>
          {distance}
        </p>

        <p className="text-sm font-medium text-muted-foreground">
          {priceRange}
        </p>
      </CardContent>

      <CardFooter className="px-4 pb-4">
        <Button
          className="w-full"
          disabled={isViewDetailsDisabled}
          onClick={onViewDetails}
          size="sm"
          variant="outline"
        >
          View details
        </Button>
      </CardFooter>
    </Card>
  );
};
