import { Nullable, Observer } from '@univer/core';
import { CURSOR_TYPE, IMouseEvent, injectStyle, IPointerEvent } from '../../Basics';
import { getCurrentScrollXY } from '../../Basics/Position';
import { ScrollTimer } from '../../ScrollTimer';
import { Documents } from './Document';

export class DocsEditor {
    private _container: HTMLDivElement;

    private _inputParent: HTMLDivElement;

    private _input: HTMLDivElement;

    private _cursor: HTMLDivElement;

    private _downObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveInObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveOutObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _startOffsetX: number;

    private _startOffsetY: number;

    private _viewportScrollX: number;

    private _viewportScrollY: number;

    constructor(private _documents?: Documents) {
        this._initialDom();

        if (this._documents) {
            this.changeDocuments(this._documents);
        }
    }

    private _initialDom() {
        const container = document.createElement('div');

        container.style.position = 'absolute';

        container.style.position = 'absolute';

        container.style.left = `0px`;
        container.style.top = `0px`;

        const inputParent = document.createElement('div');
        const inputDom = document.createElement('div');

        inputParent.appendChild(inputDom);

        const cursorDom = document.createElement('div');

        container.appendChild(inputParent);

        container.appendChild(cursorDom);

        this._container = container;
        this._inputParent = inputParent;
        this._input = inputDom;
        this._cursor = cursorDom;

        this._initialInput();

        this._initialCursor();

        document.body.appendChild(container);
    }

    private _initialInput() {
        this._inputParent.style.cssText = `
            position:absolute;
            height:1px;
            width:1px;
            overflow: hidden;
        `;

        this._input.contentEditable = 'true';

        this._input.style.cssText = `
            position: absolute; 
            overflow: hidden; 
            opacity: 1; 
            background: #000; 
            color: transparent; 
            outline: none; 
            z-index: -2; 
            caret-color: transparent; 
            white-space: pre-wrap; 
            user-select: text;
        `;
    }

    private _initialCursor() {
        this._cursor.style.cssText = `
            visibility: visible;
            position: absolute;
            background: #000;
            left: 0;
            top: 0;
            width: 1px;
            height: 20px;
            opacity: 0;
            z-index: 0;
            pointer-events: none;
            display: none
        `;

        if (!DocsEditor.isInsertKeyFrame) {
            DocsEditor.isInsertKeyFrame = true;
            const styles = [
                `
                @-webkit-keyframes univer-blinkStyle {
                    0% {
                        opacity: 1;
                    }
                
                    50% {
                        opacity: 0;
                    }
                
                    to {
                        opacity: 1;
                    }
                }
            `,
                `
                @keyframes univer-blinkStyle {
                    0% {
                        opacity: 1;
                    }
                
                    50% {
                        opacity: 0;
                    }
                
                    to {
                        opacity: 1;
                    }
                }
            `,
            ];
            injectStyle(styles);
        }
    }

    active(x: number, y: number) {
        this._container.style.left = `${x}px`;
        this._container.style.top = `${y}px`;

        this._cursor.style.animation = 'univer-blinkStyle 1s steps(1) infinity';
        this._cursor.style.display = 'revert';
    }

    deactivate() {
        this._container.style.left = `0px`;
        this._container.style.top = `0px`;

        this._cursor.style.animation = '';
        this._cursor.style.display = 'none';
    }

    private _moving(moveOffsetX: number, moveOffsetY: number, scrollTimer: ScrollTimer) {
        const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
        const endX = moveOffsetX - this._viewportScrollX + scrollX;
        const endY = moveOffsetY - this._viewportScrollY + scrollY;

        // const startCoord = this._documents!.getInverseCoord(Vector2.FromArray([this._startOffsetX, this._startOffsetY]));

        // const endCoord = this._documents!.getInverseCoord(Vector2.FromArray([endX, endY]));

        // const moveLeft = x - this._startOffsetX;
        // const moveTop = y - this._startOffsetY;

        // this._startOffsetX = x;
        // this._startOffsetY = y;
    }

    private _attachEvent(documents: Documents) {
        this._moveInObserver = documents.onPointerEnterObserver.add(() => {
            documents.cursor = CURSOR_TYPE.TEXT;
        });

        this._moveOutObserver = documents.onPointerLeaveObserver.add(() => {
            documents.cursor = CURSOR_TYPE.DEFAULT;
            scene.resetCursor();
        });
        const scene = documents.getScene();
        this._downObserver = documents.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            this._startOffsetX = evtOffsetX;
            this._startOffsetY = evtOffsetY;

            console.log(this._documents?.findNodeByCoord(evtOffsetX, evtOffsetY));

            scene.disableEvent();

            const scrollTimer = ScrollTimer.create(scene);
            scrollTimer.startScroll(evtOffsetX, evtOffsetY);

            const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);

            this._viewportScrollX = scrollX;
            this._viewportScrollY = scrollY;

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                this._moving(moveOffsetX, moveOffsetY, scrollTimer);
                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this._moving(moveOffsetX, moveOffsetY, scrollTimer);
                });
                scene.setCursor(CURSOR_TYPE.TEXT);
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                scene.onPointerMoveObserver.remove(this._moveObserver);
                scene.onPointerUpObserver.remove(this._upObserver);
                scene.enableEvent();

                scrollTimer.stopScroll();
            });

            state.stopPropagation();
        });
    }

    private _detachEvent(documents: Documents) {
        documents.onPointerEnterObserver.remove(this._moveInObserver);
        documents.onPointerLeaveObserver.remove(this._moveOutObserver);
        documents.onPointerDownObserver.remove(this._downObserver);
    }

    changeDocuments(documents: Documents) {
        if (this._documents) {
            this._detachEvent(this._documents);
        }

        this._documents = documents;
        this._attachEvent(this._documents);
    }

    dispose() {}

    static isInsertKeyFrame = false;

    static create(documents?: Documents) {
        return new DocsEditor(documents);
    }
}
