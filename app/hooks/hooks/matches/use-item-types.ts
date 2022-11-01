import type { ItemType } from "@prisma/client";
import { useMatchesData } from "../use-matches-data";

/**
 * Build a custom hook for each data object
 * of your loader data.
 * Use useMatchesData to access loader data
 * across your application.
 * Use tiny-invariant and Typescript "is"
 * to require data on runtime.
 * Or return undefined if data is optional and not found.
 */

const routeIdString = "routes/admin";

export function useOptionalItemTypes(): ItemType[] | undefined {
  const data = useMatchesData(routeIdString);
  // console.log(JSON.stringify(data));
  if (!data) {
    return undefined;
  }
  return data.itemTypes;
}

export function useItemTypes(): ItemType[] {
  const maybeItemTypes = useOptionalItemTypes();
  if (!maybeItemTypes) {
    throw new Error(
      `No ItemTypes found in ${routeIdString} loader, but ItemTypes are required by useItemTypes. If ItemTypes are optional, try useOptionalItemTypes instead.`
    );
  }
  // console.log(JSON.stringify(maybeItemTypes));
  return maybeItemTypes;
}
