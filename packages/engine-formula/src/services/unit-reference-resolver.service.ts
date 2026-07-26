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

import type { FormulaUnitType } from '../basics/common';
import { createIdentifier, UniverInstanceType } from '@univerjs/core';
import { ErrorType } from '../basics/error-type';
import { IFormulaCurrentConfigService } from './current-data.service';

export type FormulaUnitReferenceKind = 'a1' | 'table';

export interface IFormulaUnitReferenceResolveInput {
    hostUnitId: string;
    qualifier: string;
    referenceKind: FormulaUnitReferenceKind;
}

export interface IFormulaUnitReferenceResolution {
    unitId: string;
    unitType?: FormulaUnitType;
    externalReference?: {
        kind: 'host' | 'ooxml';
        qualifier: string;
        referenceId?: string;
        slot?: number;
    };
}

export interface IFormulaUnitReferenceResolver {
    resolve(input: IFormulaUnitReferenceResolveInput): IFormulaUnitReferenceResolution | ErrorType;
}

export const IFormulaUnitReferenceResolver = createIdentifier<IFormulaUnitReferenceResolver>(
    'univer.formula.unit-reference-resolver'
);

const EXCEL_WORKBOOK_EXTENSION = /\.(?:xlsx|xlsm|xlsb|xltx|xltm|xls)$/i;

export function normalizeFormulaUnitName(name: string): string {
    return name.replace(EXCEL_WORKBOOK_EXTENSION, '').toLowerCase();
}

export class FormulaUnitReferenceResolver implements IFormulaUnitReferenceResolver {
    constructor(
        @IFormulaCurrentConfigService
        protected readonly _currentConfigService: IFormulaCurrentConfigService
    ) {}

    resolve({
        hostUnitId,
        qualifier,
        referenceKind,
    }: IFormulaUnitReferenceResolveInput): IFormulaUnitReferenceResolution | ErrorType {
        const unitNameMap = this._currentConfigService.getUnitNameMap();
        const unitData = this._currentConfigService.getUnitData();
        const address = qualifier || hostUnitId;
        const direct = unitNameMap[address];

        if (direct || unitData[address]) {
            return this._validateReferenceKind(
                hostUnitId,
                referenceKind,
                {
                    unitId: address,
                    unitType: direct?.unitType,
                },
                unitNameMap
            );
        }

        if (!qualifier) {
            return ErrorType.REF;
        }

        const namedUnits = Object.entries(unitNameMap).filter(([, item]) => item.name.length > 0);
        const normalizedQualifier = qualifier.toLowerCase();
        const exactMatches = namedUnits.filter(([, item]) => item.name.toLowerCase() === normalizedQualifier);
        const matches =
            exactMatches.length > 0
                ? exactMatches
                : namedUnits.filter(
                    ([, item]) => normalizeFormulaUnitName(item.name) === normalizeFormulaUnitName(qualifier)
                );

        if (matches.length !== 1) {
            return ErrorType.REF;
        }

        const [unitId, item] = matches[0];
        return this._validateReferenceKind(
            hostUnitId,
            referenceKind,
            {
                unitId,
                unitType: item.unitType,
            },
            unitNameMap
        );
    }

    private _validateReferenceKind(
        hostUnitId: string,
        referenceKind: FormulaUnitReferenceKind,
        resolution: IFormulaUnitReferenceResolution,
        unitNameMap: ReturnType<IFormulaCurrentConfigService['getUnitNameMap']>
    ): IFormulaUnitReferenceResolution | ErrorType {
        if (referenceKind !== 'a1' || resolution.unitId === hostUnitId) {
            return resolution;
        }
        const hostType = unitNameMap[hostUnitId]?.unitType;
        if (resolution.unitType === UniverInstanceType.UNIVER_BASE) {
            return ErrorType.REF;
        }
        if (hostType === UniverInstanceType.UNIVER_BASE && resolution.unitType !== UniverInstanceType.UNIVER_SHEET) {
            return ErrorType.REF;
        }
        return resolution;
    }
}
