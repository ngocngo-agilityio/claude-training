import { useState } from "react";
import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Clock3,
  House,
  MapPin,
  Star,
  Utensils,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { cn } from "@/lib/utils/class-name";
import type { RestaurantDetail } from "@repo/shared/types/restaurant";

type RestaurantDetailItem = {
  icon: LucideIcon;
  label: string;
  value: string;
};

type RestaurantCardDetailProps = Omit<RestaurantDetail, "id" | "menuUrl"> & {
  className?: string;
  isReserveDisabled?: boolean;
  isViewMenuDisabled?: boolean;
  onReserve?: () => void;
  onViewMenu?: () => void;
};

export const RestaurantCardDetail = ({
  name,
  imageUrl,
  galleryImageUrls = [],
  rating,
  reviewCount,
  restaurantType,
  distance,
  location,
  description,
  priceRange,
  openingHours,
  cuisine,
  ambience,
  className,
  isReserveDisabled = false,
  isViewMenuDisabled = false,
  onReserve,
  onViewMenu,
}: RestaurantCardDetailProps) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const photos = [imageUrl, ...galleryImageUrls];

  const showPreviousPhoto = () =>
    setActivePhotoIndex((index) => (index - 1 + photos.length) % photos.length);

  const showNextPhoto = () =>
    setActivePhotoIndex((index) => (index + 1) % photos.length);

  const details: RestaurantDetailItem[] = [
    { icon: WalletCards, label: "Price Range", value: priceRange },
    { icon: Clock3, label: "Opening Hours", value: openingHours },
    { icon: Utensils, label: "Cuisine", value: cuisine },
    { icon: House, label: "Ambience", value: ambience },
  ];

  return (
    <Card
      aria-label={`${name} restaurant details`}
      className={cn(
        "w-full max-w-[780px] gap-0 overflow-hidden rounded-2xl py-0 shadow-sm",
        className,
      )}
      role="article"
    >
      <CardContent className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-[48%_minmax(0,1fr)] sm:gap-6">
        {/* Keep all available photos in a compact, in-card carousel. */}
        <div className="min-w-0">
          <div className="group relative aspect-[3/2] overflow-hidden rounded-xl bg-muted">
            <img
              alt={`${name} photo ${activePhotoIndex + 1}`}
              className="size-full object-cover transition-opacity duration-200"
              src={photos[activePhotoIndex]}
            />

            {photos.length > 1 && (
              <>
                <Button
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-950/60 text-white opacity-0 shadow-sm hover:bg-slate-950/80 group-hover:opacity-100 group-focus-within:opacity-100"
                  onClick={showPreviousPhoto}
                  size="icon"
                  variant="ghost"
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-950/60 text-white opacity-0 shadow-sm hover:bg-slate-950/80 group-hover:opacity-100 group-focus-within:opacity-100"
                  onClick={showNextPhoto}
                  size="icon"
                  variant="ghost"
                >
                  <ChevronRight aria-hidden="true" />
                </Button>

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-950/60 px-2.5 py-1.5">
                  {photos.map((photo, index) => (
                    <button
                      aria-label={`Show photo ${index + 1}`}
                      className={cn(
                        "size-1.5 rounded-full bg-white/50 transition-all hover:bg-white",
                        index === activePhotoIndex && "w-4 bg-white",
                      )}
                      key={`${photo}-${index}`}
                      onClick={() => setActivePhotoIndex(index)}
                      type="button"
                    />
                  ))}
                </div>

                <span className="absolute right-3 top-3 rounded-full bg-slate-950/60 px-2.5 py-1 text-xs font-medium text-white">
                  {activePhotoIndex + 1} / {photos.length}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Information column: summary, location, description */}
        <div className="flex min-w-0 flex-col">
          <h3 className="text-xl font-bold tracking-tight">{name}</h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <Star
              aria-hidden="true"
              className="size-4 fill-amber-400 text-amber-400"
            />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({reviewCount} reviews)
            </span>
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <span className="text-muted-foreground">{restaurantType}</span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            <span>{distance}</span>
            <span aria-hidden="true">·</span>
            <span>{location}</span>
          </div>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {description}
          </p>

          <dl className="mt-4 space-y-2">
            {details.map(({ icon: Icon, label, value }) => (
              <div
                className="grid grid-cols-[18px_96px_minmax(0,1fr)] items-start gap-2 text-sm"
                key={label}
              >
                <Icon
                  aria-hidden="true"
                  className="mt-0.5 size-4 text-muted-foreground"
                />
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </CardContent>

      {/* Mobile actions stack vertically; desktop actions share the right column. */}
      <CardFooter className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-[48%_minmax(0,1fr)] sm:gap-6">
        <div className="flex min-w-0 flex-col gap-3 sm:col-start-2 sm:flex-row">
          <Button
            className="w-full sm:w-auto sm:shrink-0"
            disabled={isViewMenuDisabled}
            onClick={onViewMenu}
            size="sm"
            variant="outline"
          >
            View menu
            <BookOpenText aria-hidden="true" />
          </Button>

          <Button
            className="w-full sm:min-w-0 sm:flex-1"
            disabled={isReserveDisabled}
            onClick={onReserve}
            size="sm"
          >
            Reserve this restaurant
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
