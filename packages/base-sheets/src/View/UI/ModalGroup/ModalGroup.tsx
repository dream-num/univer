import { Component } from '@univer/base-component';
import { PLUGIN_NAMES } from '@univer/core';
import { SpreadsheetPlugin } from '../../../SpreadsheetPlugin';
import { ModalGroupProps } from '../../../Controller/ModalGroupController';

interface IState {
    modalGroup: any[];
}

export class ModalGroup extends Component<any, IState> {
    initialize() {
        this.state = {
            modalGroup: [],
        };
    }

    componentDidMount(): void {
        this._context.getObserverManager().getObserver<ModalGroup>('onModalGroupDidMountObservable')?.notifyObservers(this);
    }

    setModalGroup(group: ModalGroupProps) {
        const plugin = this._context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        const modalGroup = group.map((item) => {
            const Modal = plugin?.getRegisterComponent(item);
            if (Modal) {
                return <Modal />;
            }
            return null;
        });

        this.setState({
            modalGroup,
        });
    }

    render() {
        const { modalGroup } = this.state;
        return <>{modalGroup.map((item) => item)}</>;
    }
}
