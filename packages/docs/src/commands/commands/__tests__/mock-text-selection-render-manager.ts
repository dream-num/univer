import type { Nullable } from '@univerjs/core';
import type { ITextSelectionInnerParam } from '@univerjs/engine-render';
import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export class TextSelectionRenderManager {
    private readonly _textSelectionInner$ = new BehaviorSubject<Nullable<ITextSelectionInnerParam>>(null);

    readonly textSelectionInner$ = this._textSelectionInner$.asObservable();
    removeAllTextRanges() {}
    addTextRanges() {}
}

export const ITextSelectionRenderManager = createIdentifier<TextSelectionRenderManager>(
    'mock.univer.doc.text-selection-render-manager'
);
