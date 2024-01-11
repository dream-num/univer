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

import { Disposable, IContextService } from '@univerjs/core';
import { IDialogService, IFocusService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';

import { FIND_REPLACE_ACTIVATED } from '../context-keys';
import type { IFindReplaceDialogService } from '../find-replace-dialog.service';
import { FindReplaceState } from '../find-replace-dialog.service';

// TODO@wzhudev: maybe I should register dialog component in this service as well.

const FIND_REPLACE_DIALOG_ID = 'FIND_REPLACE_DIALOG';

export class DesktopFindReplaceDialogService extends Disposable implements IFindReplaceDialogService {
    private readonly _state$ = new BehaviorSubject(FindReplaceState.CLOSED);
    readonly state$ = this._state$.asObservable();
    get state(): FindReplaceState {
        return this._state$.getValue();
    }

    constructor(
        @IContextService private readonly _contextService: IContextService,
        @IDialogService private readonly _dialogService: IDialogService,
        @IFocusService private readonly _focusService: IFocusService
    ) {
        super();
    }

    toggleFind(): void {
        this._contextService.setContextValue(FIND_REPLACE_ACTIVATED, true);
        this._state$.next(FindReplaceState.FIND);

        // TODO@wzhudev: should move this to an controller?
        this._dialogService.open({
            id: FIND_REPLACE_DIALOG_ID,
            draggable: true,
            width: 350,
            title: {
                title: 'Find Replace',
            },
            children: {
                label: 'FindReplaceDialog',
            },
            onClose: () => {
                this.closePanel();
            },
        });
    }

    toggleReplace(): void {
        this._contextService.setContextValue(FIND_REPLACE_ACTIVATED, true);
        this._state$.next(FindReplaceState.REPLACE);
    }

    closePanel(): void {
        this._contextService.setContextValue(FIND_REPLACE_ACTIVATED, false);
        this._state$.next(FindReplaceState.CLOSED);

        this._dialogService.close(FIND_REPLACE_DIALOG_ID);
        this._focusService.forceFocus();
    }
}
