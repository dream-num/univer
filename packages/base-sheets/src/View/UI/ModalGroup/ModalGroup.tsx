import { Component } from '@univer/base-component';
import { PLUGIN_NAMES } from '@univer/core';
import { ModalGroupProps } from '../../../Controller/ModalGroupController';
import { SheetPlugin } from '../../../SheetPlugin';

interface IState {
    modalGroup: any[];
}

export class ModalGroup extends Component<any, IState> {
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
        const plugin = this._context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

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
