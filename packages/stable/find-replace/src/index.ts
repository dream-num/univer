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

import './global.css';

export { UniverFindReplacePlugin } from './plugin';
export { FindReplaceController } from './controllers/find-replace.controller';
export type {
    IFindComplete,
    IFindMatch,
    IFindMoveParams,
    IFindQuery,
    IFindReplaceProvider,
    IFindReplaceState,
    IReplaceAllResult,
} from './services/find-replace.service';

export { createInitFindReplaceState, FindBy, FindDirection, FindModel, FindReplaceModel, FindReplaceState, FindScope, IFindReplaceService } from './services/find-replace.service';

// #region - all commands

export { ReplaceAllMatchesCommand, ReplaceCurrentMatchCommand } from './commands/commands/replace.command';
export { GoToNextMatchOperation, GoToPreviousMatchOperation, OpenFindDialogOperation, OpenReplaceDialogOperation } from './commands/operations/find-replace.operation';

// #endregion
