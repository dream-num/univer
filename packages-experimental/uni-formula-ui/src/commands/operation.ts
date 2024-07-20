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

import type { ICommand, IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { DocFormulaPopupService } from '../services/formula-popup.service';

export interface IShowFormulaPopupOperationParams {
    unitId: string;
    startIndex: number;
}

export const ShowFormulaPopupOperation: IOperation<IShowFormulaPopupOperationParams> = {
    id: 'doc.operation.show-formula-popup',
    type: CommandType.OPERATION,
    handler(accessor, params: IShowFormulaPopupOperationParams) {
        const docFormulaPopupService = accessor.get(DocFormulaPopupService);
        return docFormulaPopupService.showPopup(params.unitId, params.startIndex, 'new');
    },
};

export const CloseFormulaPopupOperation: IOperation = {
    id: 'doc.operation.close-formula-popup',
    type: CommandType.OPERATION,
    handler(accessor) {
        const docFormulaPopupService = accessor.get(DocFormulaPopupService);
        return docFormulaPopupService.closePopup(true);
    },
};

export const ConfirmFormulaPopupCommand: ICommand = {
    id: 'doc.operation.confirm-formula-popup',
    type: CommandType.COMMAND,
    handler(accessor) {
        const docFormulaPopupService = accessor.get(DocFormulaPopupService);
        return docFormulaPopupService.confirmPopup();
    },
};
