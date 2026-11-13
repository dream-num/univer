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

import type { IFormulaCurrentConfigService } from '../../services/current-data.service';
import type { BaseReferenceObject } from '../reference-object/base-reference-object';
import { ErrorType } from '../../basics/error-type';
import { MultiAreaArrayMode, MultiAreaReferenceObject } from '../reference-object/multi-area-reference-object';
import { RangeReferenceObject } from '../reference-object/range-reference-object';
import { ErrorValueObject } from '../value-object/base-value-object';

export function expandSheetSpan(
    source: BaseReferenceObject,
    currentConfig: IFormulaCurrentConfigService
): MultiAreaReferenceObject | ErrorValueObject | undefined {
    const span = source.getForcedSheetName();
    if (!span?.includes(':') || source.getForcedSheetId()) {
        return;
    }
    const endpoints = span.split(':');
    if (endpoints.length !== 2) {
        return ErrorValueObject.create(ErrorType.NAME);
    }
    const [first, last] = endpoints;
    return createThreeDimensionalReference(first, last, source, currentConfig.getSheetsInfo(source.getUnitId()))
        ?? ErrorValueObject.create(ErrorType.NAME);
}

export function createThreeDimensionalReference(
    firstSheetName: string,
    lastSheetName: string,
    source: BaseReferenceObject,
    sheetsInfo: ReturnType<IFormulaCurrentConfigService['getSheetsInfo']>
): MultiAreaReferenceObject | undefined {
    const { sheetOrder, sheetNameMap } = sheetsInfo;
    const sheetIdsByName = new Map(
        Object.entries(sheetNameMap).map(([sheetId, sheetName]) => [sheetName.toLocaleLowerCase(), sheetId])
    );
    const firstSheetId = sheetIdsByName.get(firstSheetName.toLocaleLowerCase());
    const lastSheetId = sheetIdsByName.get(lastSheetName.toLocaleLowerCase());
    const firstIndex = firstSheetId == null ? -1 : sheetOrder.indexOf(firstSheetId);
    const lastIndex = lastSheetId == null ? -1 : sheetOrder.indexOf(lastSheetId);
    if (firstIndex < 0 || lastIndex < 0) {
        return;
    }

    const startIndex = Math.min(firstIndex, lastIndex);
    const endIndex = Math.max(firstIndex, lastIndex);
    const areas = sheetOrder.slice(startIndex, endIndex + 1).map((sheetId) => {
        const reference = new RangeReferenceObject(source.getRangeData(), sheetId, source.getUnitId());
        copyReferenceContext(source, reference);
        reference.setForcedSheetIdDirect(sheetId);
        reference.setForcedSheetName(sheetNameMap[sheetId] ?? '');
        return [reference];
    });

    return new MultiAreaReferenceObject(
        `${firstSheetName}:${source.getToken()}`,
        areas,
        MultiAreaArrayMode.STACK_AREAS
    );
}

function copyReferenceContext(source: BaseReferenceObject, target: BaseReferenceObject): void {
    target.setDefaultUnitId(source.getDefaultUnitId());
    target.setDefaultSheetId(source.getDefaultSheetId());
    target.setCalculationCache(source.getCalculationCache());
    target.setUnitData(source.getUnitData());
    target.setUnitStylesData(source.getUnitStylesData());
    target.setFilteredOutRows(source.getFilteredOutRows());
    target.setRuntimeData(source.getRuntimeData());
    target.setArrayFormulaCellData(source.getArrayFormulaCellData());
    target.setArrayFormulaRange(source.getArrayFormulaRange());
    target.setRuntimeArrayFormulaCellData(source.getRuntimeArrayFormulaCellData());
    target.setRuntimeArrayFormulaRange(source.getRuntimeArrayFormulaRange());
    target.setRuntimeFeatureCellData(source.getRuntimeFeatureCellData());

    const currentRow = source.getCurrentRow();
    const currentColumn = source.getCurrentColumn();
    if (currentRow != null && currentColumn != null) {
        target.setCurrentRowAndColumn(currentRow, currentColumn);
    }

    const { x, y } = source.getRefOffset();
    target.setRefOffset(x, y);
}
