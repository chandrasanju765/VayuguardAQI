import { atom } from "jotai";
import type { APISubscription } from "../../models/APISubscriptions";

export const selectedAPISubscriptionAtom = atom<APISubscription | null>(null);

export const toggleAPISubscriptionSelectionAtom = atom(
  null,
  (get, set, APISubscription: APISubscription) => {
    const currentSelected = get(selectedAPISubscriptionAtom);
    if (currentSelected?._id === APISubscription._id) {
      set(selectedAPISubscriptionAtom, null);
    } else {
      set(selectedAPISubscriptionAtom, APISubscription);
    }
  }
);
