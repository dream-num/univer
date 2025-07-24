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

import type { DocumentDataModel, IAccessor, IOperation } from '@univerjs/core';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';

export interface ISetDocZoomRatioOperationParams {
    zoomRatio: number;
    unitId: string;
}

export const SetDocZoomRatioUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetDocZoomRatioOperationParams
): ISetDocZoomRatioOperationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const documentModel = univerInstanceService.getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);

    documentModel?.setZoomRatio(params.zoomRatio);

    return { ...params };
};

export const SetDocZoomRatioOperation: IOperation<ISetDocZoomRatioOperationParams> = {
    id: 'doc.operation.set-zoom-ratio',

    type: CommandType.OPERATION,

    handler: (accessor, params: ISetDocZoomRatioOperationParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const documentModel = univerInstanceService.getUnit<DocumentDataModel>(params.unitId, UniverInstanceType.UNIVER_DOC);
        if (!documentModel) {
            return false;
        }

        documentModel.setZoomRatio(params.zoomRatio);

        return true;
    },
};
