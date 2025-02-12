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

import { CommandType, IUniverInstanceService, Tools } from '@univerjs/core';
import type { IAccessor, IOperation } from '@univerjs/core';

export interface ISetDocZoomRatioOperationParams {
    zoomRatio: number;
    unitId: string;
}

export const SetDocZoomRatioUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetDocZoomRatioOperationParams
): ISetDocZoomRatioOperationParams => {
    const documentModel = accessor.get(IUniverInstanceService).getUniverDocInstance(params.unitId);
    const old = documentModel?.zoomRatio || 1;
    return {
        ...Tools.deepClone(params),
        zoomRatio: old,
    };
};

export const SetDocZoomRatioOperation: IOperation<ISetDocZoomRatioOperationParams> = {
    id: 'doc.operation.set-zoom-ratio',

    type: CommandType.OPERATION,

    handler: (accessor, params: ISetDocZoomRatioOperationParams) => {
        const documentModel = accessor.get(IUniverInstanceService).getUniverDocInstance(params.unitId);
        if (!documentModel) {
            return false;
        }

        const documentData = documentModel.getSnapshot();
        if (documentData.settings == null) {
            documentData.settings = {
                zoomRatio: params.zoomRatio,
            };
        } else {
            documentData.settings.zoomRatio = params.zoomRatio;
        }

        return true;
    },
};
