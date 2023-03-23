import { IKeyValue } from '@univerjs/core';
import { Slot } from '../View';

export type SlotComponentProps = {
    component: Function;
    props?: IKeyValue;
};

export type SlotGroupProps = Map<string, SlotComponentProps>;

export class SlotController {
    private _slotGroup: SlotGroupProps = new Map();

    private _slot: Slot;

    getComponent = (ref: Slot) => {
        this._slot = ref;
        this.setSlot();
    };

    addSlot(name: string, slot: SlotComponentProps, cb?: () => void) {
        if (this._slotGroup.get(name)) return;
        this._slotGroup.set(name, {
            component: slot.component,
            props: slot.props ?? {},
        });
        this.setSlot(cb);
    }

    getSlot(name: string) {
        const slotGroup = this._slot.getSlotGroup();
        const slot = slotGroup.get(name);
        return slot;
    }

    removeSlot(name: string) {
        this._slotGroup.delete(name);
        this.setSlot();
    }

    setSlot(cb?: () => void) {
        this._slot?.setSlotGroup(this._slotGroup, cb);
    }
}
