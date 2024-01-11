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

import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { FindReplaceState, type IFindReplaceDialogService } from '../../../services/find-replace-dialog.service';

export class StorybookFindReplaceDialogService implements IFindReplaceDialogService {
    private readonly _state = new BehaviorSubject<FindReplaceState>(FindReplaceState.FIND);
    readonly state$: Observable<FindReplaceState> = this._state.asObservable();

    get state(): FindReplaceState {
        return this._state.getValue();
    }

    toggleFind(): void {
        this._state.next(FindReplaceState.FIND);
    }

    toggleReplace(): void {
        this._state.next(FindReplaceState.REPLACE);
    }

    closePanel(): void {
        this._state.next(FindReplaceState.CLOSED);
    }
}
