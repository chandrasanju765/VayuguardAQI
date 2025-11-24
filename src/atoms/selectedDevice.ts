import { atom } from "jotai";
import type { AQIDevice } from "../models/AQIDevices";

// Helper function to get device from localStorage
const getStoredSelectedDevice = (): AQIDevice | null => {
  if (typeof window === "undefined") return null; // Default for SSR

  try {
    const stored = localStorage.getItem("selectedDevice");
    if (stored) {
      return JSON.parse(stored) as AQIDevice;
    }
  } catch (error) {
    console.warn("Failed to read selected device from localStorage:", error);
  }

  return null; // fallback default
};

// Base atom for the selected device (full object)
const baseSelectedDeviceAtom = atom<AQIDevice | null>(
  getStoredSelectedDevice()
);

// Atom for selected device with localStorage persistence
export const selectedDeviceAtom = atom<
  AQIDevice | null,
  [AQIDevice | null],
  void
>(
  (get) => get(baseSelectedDeviceAtom),
  (_get, set, newValue) => {
    set(baseSelectedDeviceAtom, newValue);

    // Persist to localStorage
    if (typeof window !== "undefined") {
      try {
        if (newValue) {
          localStorage.setItem("selectedDevice", JSON.stringify(newValue));
        } else {
          localStorage.removeItem("selectedDevice");
        }
      } catch (error) {
        console.warn("Failed to save selected device to localStorage:", error);
      }
    }
  }
);

// Toggle device selection atom (for backward compatibility with devices page)
export const toggleDeviceSelectionAtom = atom(
  null,
  (get, set, device: AQIDevice) => {
    const currentSelected = get(selectedDeviceAtom);
    if (currentSelected?._id === device._id) {
      set(selectedDeviceAtom, null);
    } else {
      set(selectedDeviceAtom, device);
    }
  }
);
