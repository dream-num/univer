import { Component, IToolBarItemProps, VNode } from '@univer/base-component';
import { SheetContext } from '@univer/core';
import { FileSelected } from '../../Library/FileSelected';

export interface ImageUploadButtonUIProps {
    chooseCallback: (url: string, file: File) => void;
}

export class ImageUploadButtonUI extends Component<ImageUploadButtonUIProps> {
    initialize(props: ImageUploadButtonUIProps) {
        this.state = {};
    }

    render(): VNode {
        const SingleButton = this.getComponentRender().renderFunction('SingleButton');
        const OrderIcon = this.getComponentRender().renderFunction('OrderIcon');
        const Props: IToolBarItemProps = {
            locale: 'ImageUploadButtonUI',
            type: 'single',
            label: <OrderIcon />,
            show: true,
            onClick: async (item: IToolBarItemProps, context: SheetContext) => {
                const file = await FileSelected.chooseImage();
                this.props.chooseCallback(URL.createObjectURL(file), file);
            },
        };
        return <SingleButton tooltip={Props.tooltip} key={Props.locale} name={Props.locale} label={Props.label} onClick={Props.onClick} />;
    }
}
