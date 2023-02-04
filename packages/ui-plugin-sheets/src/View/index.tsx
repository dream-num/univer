import { isElement, render } from '@univerjs/base-ui';
import { BaseSheetContainerProps, SheetContainer } from './SheetContainer';

export class UI {
    constructor(props: BaseSheetContainerProps) {
        this._initialize(props);
    }

    static create(props: BaseSheetContainerProps) {
        return new UI(props);
    }

    private _initialize(props: BaseSheetContainerProps) {
        let sheetContainer: HTMLElement;
        const container = props.config.container;

        if (typeof container === 'string') {
            const containerDOM = document.getElementById(container);
            if (containerDOM == null) {
                sheetContainer = document.createElement('div');
                sheetContainer.id = container;
            } else {
                sheetContainer = containerDOM;
            }
        } else if (isElement(container)) {
            sheetContainer = container!;
        } else {
            sheetContainer = document.createElement('div');
            sheetContainer.id = 'univer';
        }

        props.container = sheetContainer;

        render(<SheetContainer {...props} />, sheetContainer);
    }
}

export * from './SheetContainer';
export * from './ToolBar';
export * from './RightMenu';
