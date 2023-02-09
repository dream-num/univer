import { isElement, render } from '@univerjs/base-ui';
import { App, BaseUIProps } from './App';

interface BaseSheetUIConfig extends BaseUIProps {
    container?: HTMLElement | string;
}

export class UI {
    constructor(props: BaseSheetUIConfig) {
        this._initialize(props);
    }

    static create(props: BaseSheetUIConfig) {
        return new UI(props);
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

        render(<App {...props} />, renderContainer);
    }
}

export * from './SheetContainer';
export * from './Toolbar';
export * from './RightMenu';
export * from './InfoBar';
export * from './Common';
