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

import type { ICommand, Workbook } from '@univerjs/core';
import { CommandType, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IDialogService } from '@univerjs/ui';
import { CALCULATION_OPTIONS_COMPONENT, CALCULATION_OPTIONS_DIALOG } from '../../views/calculation-options/interface';

export const CalculationOptionsOperation: ICommand<{ unitId?: string }> = {
    id: 'sheets-formula-ui.operation.calculation-options',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const instanceService = accessor.get(IUniverInstanceService);
        const workbook = params?.unitId
            ? instanceService.getUnit<Workbook>(params.unitId, UniverInstanceType.UNIVER_SHEET)
            : instanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return false;
        }
        const dialogService = accessor.get(IDialogService);
        dialogService.close(CALCULATION_OPTIONS_DIALOG);
        dialogService.open({
            id: CALCULATION_OPTIONS_DIALOG,
            title: { title: 'sheets-formula-ui.calculation.title' },
            children: {
                label: {
                    name: CALCULATION_OPTIONS_COMPONENT,
                    props: { unitId: workbook.getUnitId() },
                },
            },
            width: 420,
            onClose: () => dialogService.close(CALCULATION_OPTIONS_DIALOG),
        });
        return true;
    },
};
