import type { Uom } from "@prisma/client";
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

export function useOptionalUoms(): Uom[] | undefined {
  const data = useMatchesData(routeIdString);
  // console.log(JSON.stringify(data));
  if (!data) {
    return undefined;
  }
  return data.uoms;
}

export function useUoms(): Uom[] {
  const maybeUoms = useOptionalUoms();
  if (!maybeUoms) {
    throw new Error(
      `No UoMs found in ${routeIdString} loader, but UoMs are required by useUoMs. If UoMs are optional, try useOptionalUoMs instead.`
    );
  }
  // console.log(JSON.stringify(maybeUoms));
  return maybeUoms;
}
