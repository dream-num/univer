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

import type { IUniverInstanceService, Nullable, Workbook, Worksheet } from '@univerjs/core';
import { UniverInstanceType } from '@univerjs/core';

export function getSheetCommandTargetWorkbook(univerInstanceService: IUniverInstanceService, params: { unitId?: string }): Nullable<{
    workbook: Workbook;
    unitId: string;
}> {
    const { unitId } = params;
    const workbook = unitId
        ? univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)
        : univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);

    if (!workbook) return null;

    return {
        workbook,
        unitId: workbook.getUnitId(),
    };
}

export interface IResult {
    workbook: Workbook;
    worksheet: Worksheet;
    unitId: string;
    subUnitId: string;
}

/**
 * Get targeted Workbook & Worksheet of a command. If `unitId` and `subUnitId` are given, the function would
 * try to get these instances. If not, it would try to get the current active instances.
 *
 * @param univerInstanceService
 * @param params - unitId and subUnitId
 * @param params.unitId - The unitId of the Workbook
 * @param params.subUnitId - The subUnitId of the Worksheet
 * @returns Targeted Workbook & Worksheet
 */
export function getSheetCommandTarget(univerInstanceService: IUniverInstanceService, params: { unitId?: string; subUnitId?: string } = {}): Nullable<IResult> {
    const { unitId, subUnitId } = params;

    const workbook = unitId
        ? univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)
        : univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    if (!workbook) return null;

    const worksheet = subUnitId ? workbook.getSheetBySheetId(subUnitId) : workbook.getActiveSheet(true);
    if (!worksheet) {
        return null;
    }

    return {
        worksheet,
        workbook,
        unitId: workbook.getUnitId(),
        subUnitId: worksheet.getSheetId(),
    };
}

export function getSheetMutationTarget(univerInstanceService: IUniverInstanceService, params: { unitId: string; subUnitId: string }): Nullable<Pick<IResult, 'workbook' | 'worksheet'>> {
    const { unitId, subUnitId } = params;

    const workbook = univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
    if (!workbook) return null;

    const worksheet = workbook.getSheetBySheetId(subUnitId);
    if (!worksheet) {
        return null;
    }

    return {
        worksheet,
        workbook,
    };
}
