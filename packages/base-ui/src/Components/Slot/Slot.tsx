import { BaseComponentProps } from '../../BaseComponent';
import { Component } from '../../Framework';

interface IState {
    slotGroup: any[];
}

export class Slot extends Component<BaseComponentProps, IState> {
    refs: any[] = [];

    initialize() {
        this.state = {
            slotGroup: [],
        };
    }

    componentDidMount(): void {
        this.props.getComponent?.(this);
    }

    setSlotGroup(group: any[]) {
        const slotGroup = group.map((item, index) => {
            const Modal = plugin?.getRegisterComponent(item);
            if (Modal) {
                return <Modal ref={(ele: any) => (this.refs[index] = ele)} />;
            }
            return null;
        });

        this.setState({
            modalGroup,
        });
    }

    getModalGroup() {
        return this.refs;
    }

    render() {
        const { modalGroup } = this.state;
        return <>{modalGroup.map((item) => item)}</>;
    }
}
