import { BaseComponentProps, Component } from '@univerjs/base-ui';

interface IState {
    slotGroup: Map<string, any>;
}

interface IProps extends BaseComponentProps {
    ref?: Slot;
}

export class Slot extends Component<IProps, IState> {
    refMap = new Map();

    refs: any[] = [];

    initialize() {
        this.state = {
            slotGroup: new Map(),
        };
    }

    componentDidMount(): void {
        this.props.getComponent?.(this);
    }

    setSlotGroup(group: Map<string, any>, cb?: () => void) {
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

    getRender(slotGroup: Map<string, any>) {
        const group: JSX.Element[] = [];
        slotGroup.forEach((v, k) => {
            const Slot = slotGroup.get(k);
            group.push(
                <Slot
                    ref={(ele: any) => {
                        this.refMap.set(k, ele);
                    }}
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
