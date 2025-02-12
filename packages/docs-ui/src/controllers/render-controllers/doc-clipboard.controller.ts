/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { DocumentDataModel } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';

import {
    ICommandService,
    IContextService,
    Inject,
    RxDisposable,
} from '@univerjs/core';
import {
    HTML_CLIPBOARD_MIME_TYPE,
    imageMimeTypeSet,
    PLAIN_TEXT_CLIPBOARD_MIME_TYPE,
} from '@univerjs/ui';
import { takeUntil } from 'rxjs';
import { whenDocOrEditor } from '../../commands/commands/clipboard.command';
import { IDocClipboardService } from '../../services/clipboard/clipboard.service';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';

export class DocClipboardController extends RxDisposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @IDocClipboardService private readonly _docClipboardService: IDocClipboardService,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService,
        @IContextService private readonly _contextService: IContextService,
        @IEditorService private readonly _editorService: IEditorService

    ) {
        super();

        this._init();
    }

    private _init() {
        this._initLegacyPasteCommand();
    }

    private _initLegacyPasteCommand(): void {
        this._docSelectionRenderService?.onPaste$.pipe(takeUntil(this.dispose$)).subscribe((config) => {
            if (!whenDocOrEditor(this._contextService)) {
                return;
            }

            config!.event.preventDefault();
            const clipboardEvent = config!.event as ClipboardEvent;
            let htmlContent = clipboardEvent.clipboardData?.getData(HTML_CLIPBOARD_MIME_TYPE);
            const textContent = clipboardEvent.clipboardData?.getData(PLAIN_TEXT_CLIPBOARD_MIME_TYPE);

            const files = [...(clipboardEvent.clipboardData?.items || [])]
                .filter((item) => imageMimeTypeSet.has(item.type))
                .map((item) => item.getAsFile()!)
                .filter((e) => !!e);

            // TODO: @JOCS, work around to fix https://github.com/dream-num/univer-pro/issues/2006. and then when you paste it,
            // you need to distinguish between different editors,
            // because different editors have different pasting effects. For example, when editing a state, you can't paste a table
            const editor = this._editorService.getEditor(this._context.unitId);

            if (!!editor && (htmlContent ?? '').indexOf('</table>') > -1) {
                htmlContent = '';
            }

            this._docClipboardService.legacyPaste({ html: htmlContent, text: textContent, files });
        });
    }
}
