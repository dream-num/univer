import { Component } from 'react';

export interface ImageUploadButtonUIProps {
    chooseCallback: (url: string, file: File) => void;
}

export class ImageUploadButtonUI extends Component<ImageUploadButtonUIProps> {
    constructor(props: ImageUploadButtonUIProps) {
        super(props);
        this.initialize(props);
    }

    initialize(props: ImageUploadButtonUIProps) {
        this.state = {};
    }

    override render() {
        // const Props: IToolbarItemProps = {
        //     locale: 'ImageUploadButtonUI',
        //     type: 'single',
        //     label: <OrderIcon />,
        //     show: true,
        //     onClick: async (item: IToolbarItemProps, context: SheetContext) => {
        //         const file = await FileSelected.chooseImage();
        //         this.props.chooseCallback(URL.createObjectURL(file), file);
        //     },
        // };
        // return <SingleButton tooltip={Props.tooltip} key={Props.locale} name={Props.locale} label={Props.label} onClick={Props.onClick} />;
        return undefined;
    }
}
