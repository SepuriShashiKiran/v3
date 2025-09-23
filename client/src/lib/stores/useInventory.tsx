import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GadgetType = 'drone' | 'lockpick' | 'camera' | 'scanner' | 'emp' | 'grapple';
export type ItemType = 'keycard' | 'document' | 'photo' | 'code' | 'map';

interface InventoryState {
  items: string[];
  gadgets: GadgetType[];
  selectedGadget: string | null;
  maxCapacity: number;
  documents: { id: string; name: string; content: string }[];
  keycards: { id: string; level: number; area: string }[];
  
  // Actions
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
  hasItem: (item: string) => boolean;
  setSelectedGadget: (gadget: string | null) => void;
  addDocument: (document: { id: string; name: string; content: string }) => void;
  addKeycard: (keycard: { id: string; level: number; area: string }) => void;
  clearInventory: () => void;
  getInventoryCount: () => number;
}

export const useInventory = create<InventoryState>()(
  subscribeWithSelector((set, get) => ({
    items: [],
    gadgets: [],
    selectedGadget: null,
    maxCapacity: 20,
    documents: [],
    keycards: [],
    
    addItem: (item) => {
      const { items, maxCapacity } = get();
      
      if (items.length >= maxCapacity) {
        console.log("Inventory full - cannot add item:", item);
        return;
      }
      
      if (!items.includes(item)) {
        console.log("Item added to inventory:", item);
        set((state) => ({
          items: [...state.items, item]
        }));
        
        // Auto-equip first gadget if none selected
        if (['drone', 'lockpick', 'camera'].includes(item) && !get().selectedGadget) {
          set({ selectedGadget: item });
        }
      }
    },
    
    removeItem: (item) => {
      const { items } = get();
      if (items.includes(item)) {
        console.log("Item removed from inventory:", item);
        set((state) => ({
          items: state.items.filter(i => i !== item)
        }));
        
        // Unselect gadget if it was removed
        if (get().selectedGadget === item) {
          set({ selectedGadget: null });
        }
      }
    },
    
    hasItem: (item) => {
      return get().items.includes(item);
    },
    
    setSelectedGadget: (gadget) => {
      if (gadget && get().items.includes(gadget)) {
        console.log("Selected gadget:", gadget);
        set({ selectedGadget: gadget });
      } else if (!gadget) {
        console.log("Deselected gadget");
        set({ selectedGadget: null });
      } else {
        console.log("Cannot select gadget - not in inventory:", gadget);
      }
    },
    
    addDocument: (document) => {
      const { documents } = get();
      if (!documents.find(d => d.id === document.id)) {
        console.log("Document added:", document.name);
        set((state) => ({
          documents: [...state.documents, document]
        }));
      }
    },
    
    addKeycard: (keycard) => {
      const { keycards } = get();
      if (!keycards.find(k => k.id === keycard.id)) {
        console.log("Keycard added:", keycard.area, "Level", keycard.level);
        set((state) => ({
          keycards: [...state.keycards, keycard]
        }));
      }
    },
    
    clearInventory: () => {
      console.log("Inventory cleared");
      set({
        items: [],
        gadgets: [],
        selectedGadget: null,
        documents: [],
        keycards: []
      });
    },
    
    getInventoryCount: () => {
      const { items, documents, keycards } = get();
      return items.length + documents.length + keycards.length;
    }
  }))
);
