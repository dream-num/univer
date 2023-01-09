import { render } from '../Framework';
import { isElement } from '../Utils';
import { BaseSheetContainerProps, UniverContainer } from './UniverContainer';

export class UI {
    constructor(props: BaseSheetContainerProps) {
        this._initialize(props);
    }

    static create(props: BaseSheetContainerProps) {
        return new UI(props);
    }

    private _initialize(props: BaseSheetContainerProps) {
        let univerContainer: HTMLElement;
        const container = props.config.container;

        if (typeof container === 'string') {
            const containerDOM = document.getElementById(container);
            if (containerDOM == null) {
                univerContainer = document.createElement('div');
                univerContainer.id = container;
            } else {
                univerContainer = containerDOM;
            }
        } else if (isElement(container)) {
            univerContainer = container!;
        } else {
            univerContainer = document.createElement('div');
            univerContainer.id = 'univer';
        }

        render(<UniverContainer {...props} />, univerContainer);
    }
}
