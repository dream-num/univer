import { SlideTabBar } from './SlideTabBar';
import { Animate } from './Animate';
import { SlideScrollbar } from './SlideScrollbar';

export interface SlideTabItemAnimate {
    translateX: (x: number) => void;
    cancel: () => void;
}

export class SlideTabItem {
    _slideTabItem: HTMLElement;

    _animate: Animate | null;

    _midline: number;

    _translateX: number;

    _scrollbar: SlideScrollbar;

    _slideTabBar: SlideTabBar;

    _editMode: boolean;

    _placeholder: HTMLElement | null;

    constructor(slideTabItem: HTMLElement, slideTabBar: SlideTabBar) {
        this._slideTabItem = slideTabItem;
        this._animate = null;
        this._translateX = 0;
        this._editMode = false;
        this._slideTabBar = slideTabBar;
        this._placeholder = null;
        this._scrollbar = slideTabBar.getScrollbar();
        this.update();
    }

    static midline(item: SlideTabItem) {
        return item.getBoundingRect().x + item.getBoundingRect().width / 2;
    }

    static make(nodeList: NodeList, slideTabBar: SlideTabBar): SlideTabItem[] {
        let result: SlideTabItem[] = [];
        nodeList.forEach((item) => result.push(new SlideTabItem(item as HTMLElement, slideTabBar)));
        return result;
    }

    isEditMode(): boolean {
        return this._editMode;
    }

    classList(): DOMTokenList {
        return this._slideTabItem.classList;
    }

    primeval(): HTMLElement {
        return this._slideTabItem;
    }

    translateX(x: number) {
        this._translateX = x;
        this._slideTabItem.style.transform = `translateX(${x}px)`;
        return this.getTranslateXDirection();
    }

    editor(callback?: (event: FocusEvent) => void): void {
        if (this._editMode === false) {
            let input = this.primeval().querySelector('span');

            let blurAction = (focusEvent: FocusEvent) => {
                this._editMode = false;

                if (input) {
                    input.removeAttribute('contentEditable');
                    input.removeEventListener('blur', blurAction);
                    input.removeEventListener('input', inputAction);
                }

                this._slideTabBar.updateItems();

                if (this._slideTabBar.getConfig().onChangeName) {
                    this._slideTabBar.getConfig().onChangeName(focusEvent);
                }

                if (callback) {
                    callback(focusEvent);
                }
            };

            let inputAction = () => {
                if (input) {
                    const brs = input.querySelectorAll('br');
                    if (brs.length > 0) {
                        brs.forEach((br) => {
                            if (input) {
                                input.removeChild(br);
                            }
                        });
                        input.blur();
                    }
                }
            };

            if (input) {
                input.setAttribute('contentEditable', 'true');
                input.addEventListener('blur', blurAction);
                input.addEventListener('input', inputAction);
                this._editMode = true;
                SlideTabBar.keepLastIndex(input);
            }
        }
    }

    animate(): SlideTabItemAnimate {
        return {
            translateX: (x: number) => {
                if (this._translateX !== x) {
                    if (this._animate) {
                        this._animate.cancel();
                        this._animate = null;
                    }
                    this._animate = new Animate({
                        begin: this._translateX,
                        end: x,
                        receive: (val: number) => {
                            this._slideTabItem.style.transform = `translateX(${val}px)`;
                        },
                    });
                    this._translateX = x;
                    this._animate.request();
                }
            },
            cancel: () => {
                if (this._animate) {
                    this._animate.cancel();
                    this._animate = null;
                }
            },
        };
    }

    after(other: SlideTabItem) {
        this._slideTabItem.after(other._slideTabItem || other);
    }

    update() {
        this._midline = SlideTabItem.midline(this);
    }

    disableFixed() {
        if (this._placeholder) {
            const primeval = this._slideTabBar.primeval();

            this._slideTabItem.style.removeProperty('position');
            this._slideTabItem.style.removeProperty('left');
            this._slideTabItem.style.removeProperty('top');
            this._slideTabItem.style.removeProperty('width');
            this._slideTabItem.style.removeProperty('height');
            this._slideTabItem.style.removeProperty('box-shadow');
            this._slideTabItem.style.removeProperty('background');

            this._placeholder.after(this._slideTabItem);
            primeval.removeChild(this._placeholder);
            this._placeholder = null;
        }
    }

    enableFixed() {
        const placeholder = document.createElement('div');
        const boundingRect = this.getBoundingRect();

        this._placeholder = placeholder;
        this._placeholder.style.width = `${boundingRect.width}px`;
        this._placeholder.style.height = `${boundingRect.height}px`;
        this._placeholder.style.flexShrink = '0';

        this._slideTabItem.style.left = `${boundingRect.x - this.getScrollbar().getScrollX()}px`;
        this._slideTabItem.style.top = `${boundingRect.y}px`;
        this._slideTabItem.style.width = `${boundingRect.width}px`;
        this._slideTabItem.style.height = `${boundingRect.height}px`;
        this._slideTabItem.style.background = getComputedStyle(this._slideTabItem).background;
        this._slideTabItem.style.boxShadow = '0px 0px 1px 1px rgba(82,82,82,0.1)';
        this._slideTabItem.style.position = 'fixed';

        this._slideTabItem.after(placeholder);
        document.body.appendChild(this._slideTabItem);
    }

    addEventListener<K extends keyof HTMLElementEventMap>(type: K, action: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
        this._slideTabItem.addEventListener(type, action, options);
    }

    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, action: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
        this._slideTabItem.removeEventListener(type, action, options);
    }

    getScrollbar() {
        return this._scrollbar;
    }

    getMidLine() {
        return this._midline;
    }

    getBoundingRect() {
        const boundingClientRect = this._slideTabItem.getBoundingClientRect();
        boundingClientRect.x += this._scrollbar.getScrollX();
        return boundingClientRect;
    }

    getWidth() {
        return this.getBoundingRect().width;
    }

    getTranslateXDirection() {
        const midline = SlideTabItem.midline(this);
        return midline > this._midline ? 1 : midline < this._midline ? -1 : 0;
    }

    equals(other: SlideTabItem | null) {
        return other && other._slideTabItem === this._slideTabItem;
    }
}
