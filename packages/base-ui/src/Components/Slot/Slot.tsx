// export class Slot extends Component<IProps, IState> {
//     static override contextType = AppContext;
//     private _refs: any[] = [];
//     constructor(props: IProps) {
//         super(props);
//         this.initialize();
//     }
//     initialize() {
//         this.state = {
//             slotGroup: new Map(),
//         };
//     }
//     override componentDidMount(): void {
//         this.props.getComponent?.(this);
//     }
//     setSlot(component: SlotComponent, cb?: () => void) {
//         const { slotGroup } = this.state;
//         slotGroup.set(component.name, component);
//         this.setState(
//             {
//                 slotGroup,
//             },
//             () => {
//                 cb?.();
//             }
//         );
//     }
//     setSlotAll(slots: Map<string, SlotComponent>) {
//         const { slotGroup } = this.state;
//         slots.forEach((item) => {
//             slotGroup.set(item.name, item);
//         });
//         this.setState({
//             slotGroup,
//         });
//     }
//     removeSlot(component: SlotComponent) {
//         const { slotGroup } = this.state;
//         const slot = slotGroup.get(component.name);
//         if (!slot) return;
//         slotGroup.delete(component.name);
//         this.setState({
//             slotGroup,
//         });
//     }
//     getSlots() {
//         return this._refs;
//     }
//     renderSlot() {
//         const { slotGroup } = this.state;
//         const arr: JSX.Element[] = [];
//         slotGroup.forEach((item, index) => {
//             const Label = this.context.componentManager.get(item.component.name);
//             if (Label) {
//                 arr.push(<Label key={index} ref={(ref: any) => (this._refs[index as any] = ref)} {...item.component.props} />);
//             }
//         });
//         return arr;
//     }
//     render() {
//         return <>{this.renderSlot()}</>;
//     }
// }
import React, { useContext, useRef, useState } from 'react';

import { BaseComponentProps } from '../../BaseComponent';
import { AppContext } from '../../Common/AppContext';
import { SlotComponent } from '../../Common/SlotManager';

interface IProps extends BaseComponentProps {
    name: string;
}
export function Slot(props: IProps) {
    const context = useContext(AppContext);
    const [slotGroup, setSlotGroup] = useState(new Map<string, SlotComponent>());
    const _refs = useRef<any[]>([]);

    // useEffect(() => {
    //     props.getComponent?.(this);
    // }, []);

    const setSlot = (component: SlotComponent, cb?: () => void) => {
        const newSlotGroup = new Map(slotGroup);
        newSlotGroup.set(component.name, component);
        setSlotGroup(newSlotGroup);
        cb?.();
    };

    const setSlotAll = (slots: Map<string, SlotComponent>) => {
        const newSlotGroup = new Map(slotGroup);
        slots.forEach((item) => {
            newSlotGroup.set(item.name, item);
        });
        setSlotGroup(newSlotGroup);
    };

    const removeSlot = (component: SlotComponent) => {
        const newSlotGroup = new Map(slotGroup);
        const slot = newSlotGroup.get(component.name);
        if (!slot) return;
        newSlotGroup.delete(component.name);
        setSlotGroup(newSlotGroup);
    };

    const getSlots = () => _refs.current;

    const renderSlot = () => {
        const arr: JSX.Element[] = [];
        slotGroup.forEach((item, index) => {
            const Label = context?.componentManager?.get(item.component.name) as React.ComponentType<any>;
            if (Label) {
                arr.push(
                    <Label
                        key={index}
                        ref={(ref: any) => (_refs.current[index as any] = ref)}
                        {...item.component.props}
                    />
                );
            }
        });
        return arr;
    };
    return <>{renderSlot()}</>;
}
