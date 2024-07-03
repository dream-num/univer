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

import type { Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { TextSelectionManagerService } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';
import { DocHyperLinkEdit } from '../views/hyper-link-edit';

export class DocHyperLinkService extends Disposable {
    private readonly _editingLink$ = new BehaviorSubject<string | undefined>(undefined);
    readonly editingLink$ = this._editingLink$.asObservable();

    private _editPopup: Nullable<IDisposable> = null;
    private _infoPopup: Nullable<IDisposable> = null;

    constructor(
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopupManagerService: DocCanvasPopManagerService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService
    ) {
        super();
    }

    startAddOrEdit(id: string | undefined) {
        this._editingLink$.next(id);
    }

    getEditing() {
        return this._editingLink$.value;
    }

    showEditPopup() {
        const activeRange = this._textSelectionManagerService.getActiveRange();

        if (activeRange) {
            this._editPopup = this._docCanvasPopupManagerService.attachPopupToRange(
                activeRange,
                {
                    componentKey: DocHyperLinkEdit.componentKey,
                    direction: 'bottom',
                }
            );
            return this._editPopup;
        }

        return null;
    }

    hideEditPopup() {
        this._editPopup?.dispose();
    }

    showInfoPopup() {}

    hideInfoPopup() {}
}
