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

import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

import { IFindReplaceService } from '../../services/find-replace.service';
import { FindReplaceState, IFindReplaceDialogService } from '../../services/find-replace-dialog.service';

export const OpenFindDialogOperation: IOperation = {
    id: 'ui.operation.open-find-dialog',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const dialogService = accessor.get(IFindReplaceDialogService);
        dialogService.toggleFind();
        return true;
    },
};

export const OpenReplaceDialogOperation: IOperation = {
    id: 'ui.operation.open-replace-dialog',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const dialogService = accessor.get(IFindReplaceDialogService);
        dialogService.toggleReplace();
        return true;
    },
};

export const CloseFRDialogOperation: IOperation = {
    id: 'ui.operation.close-find-replace-dialog',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const dialogService = accessor.get(IFindReplaceDialogService);
        dialogService.closePanel();
        return true;
    },
};

export const ToggleFindReplaceDialogOperation: IOperation = {
    type: CommandType.OPERATION,
    id: 'ui.operation.toggle-find-replace-dialog',
    handler: (accessor) => {
        const dialogService = accessor.get(IFindReplaceDialogService);
        if (dialogService.state === FindReplaceState.CLOSED) {
            dialogService.toggleFind();
        } else {
            dialogService.closePanel();
        }

        return true;
    },
};

export const GoToNextMatchOperation: IOperation = {
    type: CommandType.OPERATION,
    id: 'ui.operation.go-to-next-match',
    handler: (accessor) => {
        const dialogService = accessor.get(IFindReplaceService);
        // dialogService.findNext();
        return true;
    },
};

export const GoToPreviousMatchOperation: IOperation = {
    type: CommandType.OPERATION,
    id: 'ui.operation.go-to-previous-match',
    handler: (accessor) => {
        const dialogService = accessor.get(IFindReplaceService);
        // dialogService.findPrevious();
        return true;
    },
};
