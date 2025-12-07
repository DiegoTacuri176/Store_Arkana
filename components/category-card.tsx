import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
  productCount?: number;
}

export function CategoryCard({
  category,
  productCount = 0,
}: CategoryCardProps) {
  return (
    <Link href={`/categories/`}>
      <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="flex items-center gap-4 p-6">
          {category.image_url ? (
            <div className="relative h-14 w-14 overflow-hidden rounded-xl">
              <Image
                src={category.image_url || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-3xl transition-colors group-hover:bg-primary/20">
              {category.icon}
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-heading font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              {productCount} {productCount === 1 ? "trabajo" : "trabajos"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
