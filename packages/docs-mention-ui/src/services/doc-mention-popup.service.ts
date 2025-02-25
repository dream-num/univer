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

import type { IDisposable, Nullable } from '@univerjs/core';
import { Disposable, Inject } from '@univerjs/core';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { BehaviorSubject } from 'rxjs';
import { MentionEditPopup } from '../views/mention-edit-popup';
import { DocMentionService } from './doc-mention.service';

export class DocMentionPopupService extends Disposable {
    private readonly _infoPopup$ = new BehaviorSubject(undefined);
    readonly infoPopup$ = this._infoPopup$.asObservable();
    get infoPopup() {
        return this._infoPopup$.value;
    }

    private readonly _editPopup$ = new BehaviorSubject<Nullable<{ anchor: number; popup: IDisposable; unitId: string }>>(undefined);
    readonly editPopup$ = this._editPopup$.asObservable();
    get editPopup() {
        return this._editPopup$.value;
    }

    constructor(
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopupManagerService: DocCanvasPopManagerService,
        @Inject(DocMentionService) private readonly _docMentionService: DocMentionService
    ) {
        super();

        this.disposeWithMe(this._docMentionService.editing$.subscribe((editing) => {
            if (editing !== undefined && editing !== null) {
                this.showEditPopup(editing.unitId, editing.index);
            } else {
                this.closeEditPopup();
            }
        }));
    }

    showInfoPopup() {}

    closeInfoPopup() {}

    showEditPopup(unitId: string, index: number) {
        this.closeEditPopup();
        const dispose = this._docCanvasPopupManagerService.attachPopupToRange(
            { startOffset: index, endOffset: index, collapsed: true },
            {
                componentKey: MentionEditPopup.componentKey,
                onClickOutside: () => {
                    this.closeEditPopup();
                },
                direction: 'bottom',
            },
            unitId
        );
        this._editPopup$.next({ popup: dispose, anchor: index, unitId });
    }

    closeEditPopup() {
        if (!(this._docMentionService.editing == null)) {
            this._docMentionService.endEditing();
        }

        if (this.editPopup) {
            this.editPopup.popup.dispose();
            this._editPopup$.next(null);
        }
    }
}
