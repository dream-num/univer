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

import type { ICommand, IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { UniFormulaPopupService } from '../../services/formula-popup.service';

export interface IDocPopupPosition {
    rangeId?: string;
}

export interface ISlidePopupPosition extends IDocPopupPosition {
    pageId: string;
    elementId: string;
}

export type IPopupPosition = IDocPopupPosition | ISlidePopupPosition;

export function isSlidePosition(position?: IPopupPosition): position is ISlidePopupPosition {
    return !!position && 'pageId' in position;
}

export interface IShowDocFormulaPopupOperationParams {
    unitId: string;
    startIndex: number;
    type?: 'new' | 'existing';
    position: IDocPopupPosition;
}

export interface IShowSlideFormulaPopupOPerationParams extends IShowDocFormulaPopupOperationParams {
    position: ISlidePopupPosition;
}

export type IShowFormulaPopupOperationParams = IShowDocFormulaPopupOperationParams | IShowSlideFormulaPopupOPerationParams;

export const ShowFormulaPopupOperation: IOperation<IShowFormulaPopupOperationParams> = {
    id: 'uni-formula.operation.show-formula-popup',
    type: CommandType.OPERATION,
    handler(accessor, params: IShowFormulaPopupOperationParams) {
        const { type = 'new', startIndex, unitId, position } = params;
        const { rangeId } = position;
        const formulaPopupService = accessor.get(UniFormulaPopupService);

        if (type === 'existing' && !rangeId) return false;
        return formulaPopupService.showDocPopup(unitId, startIndex, type, position);
    },
};

export const CloseFormulaPopupOperation: IOperation = {
    id: 'uni-formula.operation.close-formula-popup',
    type: CommandType.OPERATION,
    handler(accessor) {
        const docFormulaPopupService = accessor.get(UniFormulaPopupService);
        return docFormulaPopupService.closePopup(true);
    },
};

export const ConfirmFormulaPopupCommand: ICommand = {
    id: 'uni-formula.operation.confirm-formula-popup',
    type: CommandType.COMMAND,
    handler(accessor) {
        const docFormulaPopupService = accessor.get(UniFormulaPopupService);
        return docFormulaPopupService.confirmPopup();
    },
};
