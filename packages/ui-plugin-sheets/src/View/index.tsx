import { isElement } from '@univerjs/base-ui';
import { createRoot } from 'react-dom/client';

import { App, BaseUIProps } from './App';

interface BaseSheetUIConfig extends BaseUIProps {
    container?: HTMLElement | string;
}

// TODO@wzhudev: this is not necessary to be a class. A function is enough.
export class UI {
    constructor(props: BaseSheetUIConfig) {
        this._initialize(props);
    }

    private _initialize(props: BaseSheetUIConfig) {
        let renderContainer: HTMLElement;
        const container = props.container;

        if (typeof container === 'string') {
            const containerDOM = document.getElementById(container);
            if (containerDOM == null) {
                renderContainer = document.createElement('div');
                renderContainer.id = container;
            } else {
                renderContainer = containerDOM;
            }
        } else if (isElement(container)) {
            renderContainer = container!;
        } else {
            renderContainer = document.createElement('div');
            renderContainer.id = 'univer';
        }

        const root = createRoot(renderContainer);
        root.render(<App {...props} />);
    }
}

export * from './Common';
export * from './InfoBar';
export * from './RightMenu';
export * from './SheetContainer';
export * from './Toolbar';
