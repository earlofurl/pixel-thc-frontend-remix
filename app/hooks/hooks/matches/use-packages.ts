import type { PackageWithNesting } from "~/types/types";
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

const routeIdString = "routes/admin/inventory";

export function useOptionalPackages(): PackageWithNesting[] | undefined {
  const data = useMatchesData(routeIdString);
  //   console.log(JSON.stringify(data));
  if (!data) {
    return undefined;
  }
  return data.data;
}

export function usePackages(): PackageWithNesting[] {
  const maybePackages = useOptionalPackages();
  if (!maybePackages) {
    throw new Error(
      `No packages found in ${routeIdString} loader, but packages are required by usePackages. If packages are optional, try useOptionalPackages instead.`
    );
  }
  // console.log(JSON.stringify(maybePackages));
  return maybePackages;
}
