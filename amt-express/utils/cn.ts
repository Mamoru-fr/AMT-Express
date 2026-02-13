/**
 * Utility for conditionally combining CSS class names
 * 
 * This file provides a lightweight alternative to libraries like 'classnames' or 'clsx'.
 * It allows you to combine multiple class names, including conditional ones, into a single string.
 * 
 * @example
 * // Simple usage
 * cn('btn', 'btn-primary') // => 'btn btn-primary'
 * 
 * @example
 * // With conditional classes
 * cn('btn', isActive && 'active', !isActive && 'disabled') // => 'btn active' (if isActive is true)
 * 
 * @example
 * // With nested arrays
 * cn('base', ['nested', 'classes'], undefined, null) // => 'base nested classes'
 */

/**
 * Type definition for values that can be passed to the cn() function
 * Supports strings, falsy values (for conditional rendering), and nested arrays
 */
type ClassValue = string | undefined | null | false | ClassValue[];

/**
 * Recursively flattens nested arrays of class values into a single-level array
 * 
 * @param classes - Array of class values that may contain nested arrays
 * @returns Flattened array of class values (strings or falsy values)
 * 
 * @example
 * flatten(['a', ['b', 'c']]) // => ['a', 'b', 'c']
 */
function flatten(classes: ClassValue[]): (string | undefined | null | false)[] {
  const result: (string | undefined | null | false)[] = [];
  
  for (const cls of classes) {
    if (Array.isArray(cls)) {
      // Recursively flatten nested arrays
      result.push(...flatten(cls));
    } else {
      result.push(cls);
    }
  }
  
  return result;
}

/**
 * Combines multiple class names into a single space-separated string
 * 
 * Accepts multiple arguments of varying types and combines them into a clean class string.
 * Automatically filters out falsy values (undefined, null, false) which makes it perfect
 * for conditional class application.
 * 
 * @param classes - Variable number of class values (strings, conditionals, arrays)
 * @returns A single space-separated string of class names
 * 
 * @example
 * cn('btn', 'btn-primary') // => 'btn btn-primary'
 * cn('card', isActive && 'active') // => 'card active' or 'card'
 * cn('base', ['flex', 'items-center'], null, 'p-4') // => 'base flex items-center p-4'
 */
export function cn(...classes: ClassValue[]): string {
  return flatten(classes).filter(Boolean).join(' ');
}
