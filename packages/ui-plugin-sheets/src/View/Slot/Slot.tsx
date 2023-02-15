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
        slotGroup.forEach((k) => {
            const Slot = slotGroup.get(k);
            group.push(<Slot ref={(ele: any) => this.refMap.set(k, ele)}></Slot>);
        });
        // for (let k in slotGroup) {
        //     const A = slotGroup.get(k);
        //     group.push(<A ref={(ele: any) => this.refMap.set(k, ele)}></A>);
        // }
        return group;
    }

    render() {
        const { slotGroup } = this.state;
        return <>{this.getRender(slotGroup)}</>;
    }
}
