import { BaseComponentProps, Component } from '@univerjs/base-ui';

interface IState {
    slotGroup: Map<string, any>;
}

export class Slot extends Component<BaseComponentProps, IState> {
    refMap = new Map();

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
            Slot && group.push(<Slot ref={(ele: any) => this.refMap.set(k, ele)}></Slot>);
        });
        return group;
    }

    render() {
        const { slotGroup } = this.state;
        return <>{this.getRender(slotGroup)}</>;
    }
}
