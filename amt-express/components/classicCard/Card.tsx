/** 
 * This component is used to create a card with a title, description and content.
*/

import styles from './Card.module.css';

type CardProps = {
  className?: string;
  children?: React.ReactNode;
}

export function Card({className, ...rest}: CardProps) {
  return (
    <div
      data-slot="card"
      className={`${styles.card} ${className || ''}`}
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
      className={`${styles.cardContent} ${className || ''}`}
      {...rest}
    />
  );
}