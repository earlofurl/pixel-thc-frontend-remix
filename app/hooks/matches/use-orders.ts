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

const routeIdString = "routes/admin/orders";

export function useOptionalOrders() {
  const data = useMatchesData(routeIdString);
  //   console.log(JSON.stringify(data));
  if (!data) {
    return;
  }
  return data.data;
}

export function useOrders() {
  const maybeOrders = useOptionalOrders();
  if (!maybeOrders) {
    throw new Error(
      `No orders found in ${routeIdString} loader, but orders are required by useOrders. If orders are optional, try useOptionalOrders instead.`
    );
  }
  // console.log(JSON.stringify(maybeOrders));
  return maybeOrders;
}
