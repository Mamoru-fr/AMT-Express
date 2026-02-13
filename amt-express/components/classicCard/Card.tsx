/** 
 * This component is used to create a card with a title, description and content.
*/

import {cn} from "@/utils/cn";

type CardProps = {
  className?: string;
  children?: React.ReactNode;
}

export function Card({className, ...rest}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...rest}
    />
  );
}

/**
  * This component is used to create the content section of a card.
*/

export function CardContent({className, ...rest}: CardProps) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 last:pb-6", className)}
      {...rest}
    />
  );
}