import { BaseComponentProps } from '@univerjs/base-ui';
import { Component } from 'react';

import { SearchFormulaModalData } from '../../../Basics/Interfaces/IFormula';

interface IProps extends BaseComponentProps {}

interface IState {
    modalData: SearchFormulaModalData[];
}

export class SearchFormulaModal extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.initialize();
    }

    initialize() {
        this.state = {
            modalData: [],
        };
    }

    override componentDidMount() {
        this.props.getComponent?.(this);
    }

    setModal(modalData: SearchFormulaModalData[]) {
        const componentManager = (this.context as any).injector!.get('componentManager');

        modalData.forEach((item) => {
            const Label = componentManager?.get(item.children.name!);
            if (Label) {
                const props = item.children.props ?? {};
                item.modal = <Label {...props} />;
            }
        });

        this.setState({
            modalData,
        });
    }

    override render() {
        const { modalData } = this.state;
        // Set Provider for entire Container
        return (
            <>
                {modalData.map((item, index) => {
                    if (!item.show) return;
                    return (
                        // <Modal
                        //     key={index}
                        //     isDrag={true}
                        //     mask={item.mask}
                        //     title={item.label?.funParams.n}
                        //     visible={item.show}
                        //     group={item.group as ModalButtonGroup[]} // FIXME type error
                        //     onCancel={item.onCancel}
                        // >
                        //     {item.modal}
                        // </Modal>
                        <></>
                    );
                })}
            </>
        );
    }
}
