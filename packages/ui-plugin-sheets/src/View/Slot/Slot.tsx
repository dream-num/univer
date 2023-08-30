import { BaseComponentProps } from '@univerjs/base-ui';
import { Component } from 'preact';
import { SlotGroupProps } from '../../Controller/SlotController';

interface IState {
    slotGroup: SlotGroupProps;
}

interface IProps extends BaseComponentProps {
    ref?: Slot;
}

export class Slot extends Component<IProps, IState> {
    refMap = new Map();

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

    setSlotGroup(group: SlotGroupProps, cb?: () => void) {
        this.setState(
            {
                slotGroup: group,
            },
            cb
        );
    }

    getSlotGroup() {
        return this.refMap;
    }

    getRender(slotGroup: SlotGroupProps) {
        const group: JSX.Element[] = [];
        slotGroup.forEach((v, k) => {
            const Slot = slotGroup.get(k)?.component;
            const props = slotGroup.get(k)?.props;
            if (!Slot) return;
            group.push(
                <Slot
                    ref={(ele: Slot) => {
                        this.refMap.set(k, ele);
                    }}
                    {...props}
                ></Slot>
            );
        });
        return group;
    }

    render() {
        const { slotGroup } = this.state;
        return <div>{this.getRender(slotGroup)}</div>;
    }
}
