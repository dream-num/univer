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

import type { Workbook } from '@univerjs/core';
import {
    Disposable,
    Inject,
} from '@univerjs/core';
import { TextSelectionManagerService } from '@univerjs/docs';
import type { Documents, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { IContextMenuService, MenuPosition } from '@univerjs/ui';

/**
 * This controller subscribe to context menu events in sheet rendering views and invoke context menu at a correct
 * position and with correct menu type.
 */
export class DocContextMenuRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        const documentsPointerDownObserver = (this._context?.mainComponent as Documents)?.onPointerDown$;

        // Content range context menu
        const documentsSubscription = documentsPointerDownObserver.subscribeEvent((event) => {
            if (event.button === 2) {
                const selections = this._textSelectionManagerService.getCurrentSelections();
                const currentSelection = selections?.[0];
                if (!currentSelection) {
                    return;
                }
                const triggerMenu = () => {
                    this._contextMenuService.triggerContextMenu(event, MenuPosition.CONTEXT_MENU);
                };

                triggerMenu();
            }
        });
        this.disposeWithMe(documentsSubscription);
    }
}
