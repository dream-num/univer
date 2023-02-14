import { SheetUIPlugin } from "..";
import { Slot } from "../View";

export type SlotGroupProps = Map<string, any>;

export class SlotController {
    private _slotGroup: SlotGroupProps = new Map();

    private _slot: Slot;

    private _plugin: SheetUIPlugin;

    constructor(plugin: SheetUIPlugin) {
        this._plugin = plugin;
    }

    getComponent(ref: Slot) {
        this._slot = ref
    }

    addSlot(name: string, component: any) {
        if (this._slotGroup.get(name)) return
        this._slotGroup.set(name, component)
        this.setSlot()
    }

    getSlot(name: string) {
        const slotGroup = this._slot.getSlotGroup();
        return slotGroup.get(name);
    }

    removeSlot(name: string) {
        this._slotGroup.delete(name)
        this.setSlot()
    }

    setSlot() {
        this._slot.setSlotGroup(this._slotGroup);
    }
}
