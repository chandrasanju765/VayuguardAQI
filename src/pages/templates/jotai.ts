import { atom } from "jotai";
import type { Template } from "../../models/Templates";

export const selectedTemplateAtom = atom<Template | null>(null);

export const toggleTemplateSelectionAtom = atom(
  null,
  (get, set, template: Template) => {
    const currentSelected = get(selectedTemplateAtom);
    if (currentSelected?._id === template._id) {
      set(selectedTemplateAtom, null);
    } else {
      set(selectedTemplateAtom, template);
    }
  }
);
