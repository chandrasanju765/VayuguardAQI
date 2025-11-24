import { atom } from "jotai";
import type { User } from "../../models/common";

export const selectedCustomerAtom = atom<User | null>(null);

export const toggleCustomerSelectionAtom = atom(
  null,
  (get, set, customer: User) => {
    const currentSelected = get(selectedCustomerAtom);
    if (currentSelected?._id === customer._id) {
      set(selectedCustomerAtom, null);
    } else {
      set(selectedCustomerAtom, customer);
    }
  }
);
