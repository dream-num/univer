import { BaseComponentProps } from '../../BaseComponent';
import { Component } from '../../Framework';

interface IState {
    modalGroup: any[];
}

export class ModalGroup extends Component<BaseComponentProps, IState> {
    refs: any[] = [];

    initialize() {
        this.state = {
            modalGroup: [],
        };
    }

    componentDidMount(): void {
        this._context.getObserverManager().getObserver<ModalGroup>('onModalGroupDidMountObservable')?.notifyObservers(this);
    }

    setModalGroup(group: ModalGroupProps) {
        const modalGroup = group.map((item, index) => {
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
