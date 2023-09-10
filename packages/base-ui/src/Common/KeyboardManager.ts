import { Observable, ObserverManager } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

export type KeyboardObserver = {
    onKeyDownObservable: Observable<KeyboardEvent>;
    onKeyUpObservable: Observable<KeyboardEvent>;
    onKeyCopyObservable: Observable<ClipboardEvent>;
    onKeyPasteObservable: Observable<ClipboardEvent>;
    onKeyCutObservable: Observable<ClipboardEvent>;
    onKeyCompositionStartObservable: Observable<CompositionEvent>;
    onKeyCompositionUpdateObservable: Observable<CompositionEvent>;
    onKeyCompositionEndObservable: Observable<CompositionEvent>;
};

/**
 * @deprecated this module would be removed in the future
 */
export class KeyboardManager {
    constructor(@Inject(ObserverManager) private readonly _observerManager: ObserverManager) {
        this._installObserver();
    }

    /**
     * init keyboard listener
     *
     * add to docs/slides/
     */
    handleKeyboardAction(element: HTMLElement) {
        const keyboardDownEvent = (evt: KeyboardEvent) => {
            this._observerManager.requiredObserver<KeyboardEvent>('onKeyDownObservable', 'core')?.notifyObservers(evt);
        };

        const keyboardUpEvent = (evt: KeyboardEvent) => {
            this._observerManager.requiredObserver<KeyboardEvent>('onKeyUpObservable', 'core')?.notifyObservers(evt);
        };

        // Maybe move to Paste.ts
        const keyboardCopyEvent = (evt: ClipboardEvent) => {
            this._observerManager.requiredObserver<ClipboardEvent>('onKeyCopyObservable', 'core')?.notifyObservers(evt);
        };

        const keyboardPasteEvent = (evt: ClipboardEvent) => {
            this._observerManager.requiredObserver<ClipboardEvent>('onKeyPasteObservable', 'core')?.notifyObservers(evt);
        };
        const keyboardCutEvent = (evt: ClipboardEvent) => {
            this._observerManager.requiredObserver<ClipboardEvent>('onKeyCutObservable', 'core')?.notifyObservers(evt);
        };

        const keyboardCompositionStartEvent = (evt: CompositionEvent) => {
            this._observerManager.requiredObserver<CompositionEvent>('onKeyCompositionStartObservable', 'core')?.notifyObservers(evt);
        };
        const keyboardCompositionUpdateEvent = (evt: CompositionEvent) => {
            this._observerManager.requiredObserver<CompositionEvent>('onKeyCompositionUpdateObservable', 'core')?.notifyObservers(evt);
        };
        const keyboardCompositionEndEvent = (evt: CompositionEvent) => {
            this._observerManager.requiredObserver<CompositionEvent>('onKeyCompositionEndObservable', 'core')?.notifyObservers(evt);
        };

        element.addEventListener('keydown', keyboardDownEvent);
        element.addEventListener('keyup', keyboardUpEvent);
        element.addEventListener('copy', keyboardCopyEvent);
        element.addEventListener('paste', keyboardPasteEvent);
        element.addEventListener('cut', keyboardCutEvent);
        element.addEventListener('compositionstart', keyboardCompositionStartEvent);
        element.addEventListener('compositionupdate', keyboardCompositionUpdateEvent);
        element.addEventListener('compositionend', keyboardCompositionEndEvent);
    }

    private _installObserver() {
        // keyboard
        this._observerManager.addObserver('onKeyDownObservable', 'core', new Observable());
        this._observerManager.addObserver('onKeyUpObservable', 'core', new Observable());
        this._observerManager.addObserver('onKeyCopyObservable', 'core', new Observable());
        this._observerManager.addObserver('onKeyPasteObservable', 'core', new Observable());
        this._observerManager.addObserver('onKeyCutObservable', 'core', new Observable());
        this._observerManager.addObserver('onKeyCompositionStartObservable', 'core', new Observable());
        this._observerManager.addObserver('onKeyCompositionUpdateObservable', 'core', new Observable());
        this._observerManager.addObserver('onKeyCompositionEndObservable', 'core', new Observable());
    }
}
