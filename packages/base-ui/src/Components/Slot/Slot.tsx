import { Component } from 'react';
import { BaseComponentProps } from '../../BaseComponent';
import { SlotComponent } from '../../Common/SlotManager';
import { AppContext } from '../../Common';

interface IState {
    slotGroup: Map<string, SlotComponent>;
}

interface IProps extends BaseComponentProps {
    name: string;
}

export class Slot extends Component<IProps, IState> {
    static override contextType = AppContext;

    private _refs: any[] = [];

    constructor(props: IProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            slotGroup: new Map(),
        };
    }

    override componentDidMount(): void {
        this.props.getComponent?.(this);
    }

    setSlot(component: SlotComponent, cb?: () => void) {
        const { slotGroup } = this.state;
        slotGroup.set(component.name, component);

        this.setState(
            {
                slotGroup,
            },
            () => {
                cb?.();
            }
        );
    }

    setSlotAll(slots: Map<string, SlotComponent>) {
        const { slotGroup } = this.state;
        slots.forEach((item) => {
            slotGroup.set(item.name, item);
        });

        this.setState({
            slotGroup,
        });
    }

    removeSlot(component: SlotComponent) {
        const { slotGroup } = this.state;
        const slot = slotGroup.get(component.name);
        if (!slot) return;
        slotGroup.delete(component.name);
        this.setState({
            slotGroup,
        });
    }

    getSlots() {
        return this._refs;
    }

    renderSlot() {
        const { slotGroup } = this.state;
        const arr: JSX.Element[] = [];
        slotGroup.forEach((item, index) => {
            const Label = this.context.componentManager.get(item.component.name);
            if (Label) {
                arr.push(<Label key={index} ref={(ref: any) => (this._refs[index as any] = ref)} {...item.component.props} />);
            }
        });
        return arr;
    }

    render() {
        return <>{this.renderSlot()}</>;
    }
}
