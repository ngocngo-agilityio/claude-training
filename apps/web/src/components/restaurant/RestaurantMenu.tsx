import { useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils/class-name";
import type { RestaurantMenuCategory } from "@repo/shared/types/restaurant-menu";

type RestaurantMenuProps = {
  categories: RestaurantMenuCategory[];
  initialCategoryId?: string;
  className?: string;
};

export const RestaurantMenu = ({
  categories,
  initialCategoryId,
  className,
}: RestaurantMenuProps) => {
  const defaultCategoryId = initialCategoryId ?? categories[0]?.id ?? "";
  const [selectedCategoryId, setSelectedCategoryId] =
    useState(defaultCategoryId);

  const selectedCategory =
    categories.find(({ id }) => id === selectedCategoryId) ?? categories[0];

  const handleCategoryClick = (event: MouseEvent<HTMLButtonElement>) => {
    setSelectedCategoryId(event.currentTarget.value);
  };

  return (
    <Card className={cn("w-full max-w-[520px] gap-5 p-5", className)}>
      <div className="flex gap-2 overflow-x-auto" role="tablist">
        {categories.map(({ id, label }) => {
          const isSelected = id === selectedCategory?.id;

          return (
            <Button
              className={cn(
                "relative h-10 rounded-lg px-4 text-sm",
                isSelected
                  ? "bg-orange-500/5 text-orange-500 hover:bg-orange-500/10 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-orange-500"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
              id={`menu-tab-${id}`}
              key={id}
              onClick={handleCategoryClick}
              role="tab"
              value={id}
              variant="ghost"
            >
              {label}
            </Button>
          );
        })}
      </div>

      <CardContent
        className="space-y-4 p-0"
        id={
          selectedCategory
            ? `menu-panel-${selectedCategory.id}`
            : "menu-panel-empty"
        }
        role="tabpanel"
      >
        {selectedCategory?.items.map(
          ({ id, name, description, price, imageUrl }) => (
            <div
              className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3"
              key={id}
            >
              <img
                alt={name}
                className="size-[52px] rounded-lg object-cover"
                src={imageUrl}
              />

              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">{name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {description}
                </p>
              </div>

              <span className="text-sm font-bold">{price}</span>
            </div>
          ),
        )}

        {!selectedCategory && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No menu items available.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
