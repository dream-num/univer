import { IKeyboardEvent, Scene } from '@univer/base-render';

export class SheetViewKeyboardEvent {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
        this._initialize();
    }

    protected _initialize() {
        this._scene.onKeyDownObservable.add((evt: IKeyboardEvent) => {
            switch (evt.code) {
                case 'Enter':
                    break;

                case 'Tab':
                    break;

                case ' ':
                    break;

                case 'Shift':
                    break;

                case 'Control':
                    break;

                case 'Meta':
                    break;

                case 'Alt':
                    break;

                case 'ArrowUp':
                    break;

                case 'ArrowDown':
                    break;

                case 'ArrowLeft':
                    break;

                case 'ArrowRight':
                    break;

                default:
                    break;
            }
        });
        this._scene.onKeyUpObservable.add((evt: IKeyboardEvent) => {});
    }

    handleEnter() {}

    handleTab() {}

    handleBackSpace() {}

    handleShift() {}

    handleControl() {}

    handleMeta() {}

    handleAlt() {}

    handleArrowUp() {}

    handleArrowDown() {}

    handleArrowLeft() {}

    handleArrowRight() {}
}
