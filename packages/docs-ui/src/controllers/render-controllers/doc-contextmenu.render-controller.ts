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

import {
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DOCS_ZEN_EDITOR_UNIT_ID_KEY,
    ICommandService,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { ContextMenuPosition, IContextMenuService } from '@univerjs/ui';
import type { Workbook } from '@univerjs/core';
import type { Documents, IRenderContext, IRenderModule } from '@univerjs/engine-render';

const SKIP_UNIT_IDS = [
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DOCS_ZEN_EDITOR_UNIT_ID_KEY,
];

/**
 * This controller subscribe to context menu events in sheet rendering views and invoke context menu at a correct
 * position and with correct menu type.
 */
export class DocContextMenuRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        if (!SKIP_UNIT_IDS.includes(this._context.unitId)) {
            this._initPointerDown();
            this._initEditChange();
        }
    }

    private _initPointerDown(): void {
        const documentsPointerDownObserver = (this._context?.mainComponent as Documents)?.onPointerDown$;
        // Content range context menu
        const documentsSubscription = documentsPointerDownObserver.subscribeEvent((event) => {
            if (event.button === 2) {
                this._contextMenuService.triggerContextMenu(event, ContextMenuPosition.MAIN_AREA);
            }
        });
        this.disposeWithMe(documentsSubscription);
    }

    private _initEditChange(): void {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command) => {
                if (command.id === RichTextEditingMutation.id) {
                    if (this._contextMenuService.visible) {
                        this._contextMenuService.hideContextMenu();
                    }
                }
            })
        );
    }
}
