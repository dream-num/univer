import { isElement } from '@univerjs/base-ui';
import { render } from 'preact';

import { App, BaseUIProps } from './App';

interface BaseDicUIConfig extends BaseUIProps {
    container?: HTMLElement | string;
}

export class UI {
    constructor(props: BaseDicUIConfig) {
        this._initialize(props);
    }

    static create(props: BaseDicUIConfig) {
        return new UI(props);
    }

    private _initialize(props: BaseDicUIConfig) {
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

export * from './DocContainer';
