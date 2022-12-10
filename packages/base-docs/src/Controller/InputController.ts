import { Documents, IDocumentSkeletonSpan, SpanType } from '@univer/base-render';
import { TextSelection } from '@univer/base-render/src/Component/Docs/Common/TextSelection';
import { KeyboardKeyType, Logger, Nullable } from '@univer/core';
import { DocPlugin } from '../DocPlugin';

export class InputController {
    constructor(private _plugin: DocPlugin) {
        this._plugin.getObserver('onDocContainerDidMountObservable')?.add(() => {
            this._initialize();
        });
    }

    private _previousIMEContent: string = '';

    private _previousIMEStart: number;

    private _initialize() {
        const events = this._plugin.getInputEvent();
        if (!events) {
            return;
        }
        const { onInputObservable, onCompositionstartObservable, onCompositionupdateObservable, onCompositionendObservable, onKeydownObservable } = events;

        const docsModel = this._plugin.context.getDocument();

        onKeydownObservable.add((config) => {
            const { event, document, selection } = config;
            let e = event as KeyboardEvent;

            const cursor = selection?.getCursor() || 0;

            const skeleton = document.getSkeleton();

            if (!skeleton) {
                return;
            }

            if (e.key === KeyboardKeyType.backspace) {
                const selectionRemain = document.remainActiveSelection();

                const content = document.findNodeByCharIndex(cursor - 1)?.content || '';

                docsModel.deleteText(content, cursor);

                skeleton.calculate();

                const span = document.findNodeByCharIndex(cursor - 2);

                this._adjustSelection(document, selectionRemain, span);
            }
        });

        onInputObservable.add((config) => {
            const { event, content = '', document, selection } = config;

            const cursor = selection?.getCursor() || 0;

            const skeleton = document.getSkeleton();

            if (!skeleton) {
                return;
            }

            const selectionRemain = document.remainActiveSelection();

            docsModel.insertText(content, cursor);

            skeleton.calculate();

            const span = document.findNodeByCharIndex(cursor + content.length - 1);

            this._adjustSelection(document, selectionRemain, span);
        });

        onCompositionstartObservable.add((config) => {
            const { selection } = config;

            const cursor = selection?.getCursor() || 0;

            this._previousIMEStart = cursor;

            // console.log('_previousIMEStart', this._previousIMEStart);
        });

        onCompositionupdateObservable.add((config) => {
            const { event, content = '', document } = config;

            const cursor = this._previousIMEStart;

            const skeleton = document.getSkeleton();

            if (!skeleton) {
                return;
            }

            const e = event as CompositionEvent;

            if (content === this._previousIMEContent) {
                return;
            }

            const selectionRemain = document.remainActiveSelection();

            // const increaseText = this._getIncreaseText(content, this._previousIMEContent);

            // docsModel.insertText(increaseText, cursor);

            docsModel.updateText(content, this._previousIMEContent, cursor);

            skeleton.calculate();

            const span = document.findNodeByCharIndex(cursor + content.length - 1);

            // console.log('Compositionupdate', content, this._previousIMEContent, e.data, cursor, span);

            this._adjustSelection(document, selectionRemain, span);

            this._previousIMEContent = content;
        });

        onCompositionendObservable.add((config) => {
            this._previousIMEContent = '';

            this._previousIMEStart = -1;
        });
    }

    private _getIncreaseText(current: string, old: string) {
        const oldLen = old.length;
        return current.slice(oldLen);
    }

    private _adjustSelection(document: Documents, selectionRemain?: TextSelection, span?: Nullable<IDocumentSkeletonSpan>) {
        if (span == null) {
            return;
        }

        const position = document.findPositionBySpan(span);

        if (position == null || selectionRemain == null) {
            return;
        }

        if (this._hasListSpan(span)) {
            position.span += 1;
        }

        const newPos = { ...position, isBack: false };

        document.addSelection(selectionRemain);

        selectionRemain.startNodePosition = newPos;

        selectionRemain.endNodePosition = undefined;

        selectionRemain.refresh(document);

        document.syncSelection();
    }

    private _hasListSpan(span: Nullable<IDocumentSkeletonSpan>) {
        const divide = span?.parent;

        if (divide == null) {
            return false;
        }

        const spanGroup = divide.spanGroup;

        return spanGroup[0]?.spanType === SpanType.LIST;
    }
}
