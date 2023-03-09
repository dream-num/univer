import { isElement, render } from '@univerjs/base-ui';
import { App, BaseUIProps } from './App';

interface BaseSlideUIConfig extends BaseUIProps {
    container?: HTMLElement | string;
}

export class UI {
    constructor(props: BaseSlideUIConfig) {
        this._initialize(props);
    }

    static create(props: BaseSlideUIConfig) {
        return new UI(props);
    }

    private _initialize(props: BaseSlideUIConfig) {
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

export * from './SlideContainer';
export * from './Toolbar';
export * from './Common';
