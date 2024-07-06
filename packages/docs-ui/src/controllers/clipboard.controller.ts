/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    ICommandService,
    IContextService,
    LifecycleStages,
    OnLifecycle,
    RxDisposable,
} from '@univerjs/core';
import { IClipboardInterfaceService } from '@univerjs/ui';

import { ITextSelectionRenderManager } from '@univerjs/engine-render';
import { takeUntil } from 'rxjs';
import { CutContentCommand, InnerPasteCommand } from '@univerjs/docs';
import { DocCopyCommand, DocCutCommand, DocPasteCommand, whenDocOrEditor } from '../commands/commands/clipboard.command';
import { IDocClipboardService } from '../services/clipboard/clipboard.service';

@OnLifecycle(LifecycleStages.Rendered, DocClipboardController)
export class DocClipboardController extends RxDisposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService,
        @IDocClipboardService private readonly _docClipboardService: IDocClipboardService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @IContextService private readonly _contextService: IContextService
    ) {
        super();

        this._init();
    }

    private _init() {
        [DocCopyCommand, DocCutCommand, DocPasteCommand].forEach((command) => this.disposeWithMe(this._commandService.registerMultipleCommand(command)));
        [InnerPasteCommand, CutContentCommand].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));

        this._initLegacyPasteCommand();
    }

    private _initLegacyPasteCommand(): void {
        this._textSelectionRenderManager?.onPaste$.pipe(takeUntil(this.dispose$)).subscribe((config) => {
            if (!whenDocOrEditor(this._contextService)) {
                return;
            }

            config!.event.preventDefault();
            const clipboardEvent = config!.event as ClipboardEvent;
            const htmlContent = clipboardEvent.clipboardData?.getData('text/html');
            const textContent = clipboardEvent.clipboardData?.getData('text/plain');

            this._docClipboardService.legacyPaste(htmlContent, textContent);
        });
    }
}
