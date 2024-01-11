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

import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';

// This is implemented as an abstract service because we may need to support
// mobile platforms in the future.

/**
 * State of the dialog panel.
 */
export enum FindReplaceState {
    CLOSED,
    FIND,
    REPLACE,
}

/**
 * This service controls panel state of the find/replace dialog.
 */
export interface IFindReplaceDialogService {
    readonly state: FindReplaceState;
    readonly state$: Observable<FindReplaceState>;

    toggleFind(): void;
    toggleReplace(): void;
    closePanel(): void;
}

/**
 * The injection token of `IFindReplaceDialogService`.
 */
export const IFindReplaceDialogService = createIdentifier<IFindReplaceDialogService>('univer.find-replace-dialog');
