import { Slot } from "../View";

export type SlotGroupProps = Map<string, any>;

export class SlotController {
    private _slotGroup: SlotGroupProps = new Map();

    private _slot: Slot;

    getComponent = (ref: Slot) => {
        this._slot = ref
    }

    addSlot(name: string, component: any, cb?: () => void) {
        if (this._slotGroup.get(name)) return
        this._slotGroup.set(name, component)
        this.setSlot(cb)
    }

    getSlot(name: string) {
        const slotGroup = this._slot.getSlotGroup();
        return slotGroup.get(name);
    }

    removeSlot(name: string) {
        this._slotGroup.delete(name)
        this.setSlot()
    }

    setSlot(cb?: () => void) {
        this._slot?.setSlotGroup(this._slotGroup, cb);
    }
}
