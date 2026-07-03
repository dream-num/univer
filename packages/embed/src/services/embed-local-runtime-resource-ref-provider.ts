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

import type {
    IReferencedUnitDataValue,
    IReferencedUnitManagerService as IReferencedUnitManagerServiceInterface,
    IReferencedUnitReadDataResult,
    IRange,
    ResourceRef,
    ResourceRefInput,
    ResourceRefPart,
    UniverInstanceType,
    Workbook,
} from '@univerjs/core';
import type {
    IEmbedResourceRefDataProvider,
    IEmbedResourceRefDataProviderRegistration,
    IEmbedResourceRefEnsureUnitInput,
    IEmbedResourceRefReadDataInput,
    IEmbedResourceRefUnitProvider,
    IEmbedResourceRefUnitProviderRegistration,
    IReferencedUnitLoadResult,
} from './embed-resource-ref-provider-registry.service';
import { getOriginCellValue, Inject, IReferencedUnitManagerService, IUniverInstanceService, ReferencedUnitDataType, UniverInstanceType as CoreUniverInstanceType } from '@univerjs/core';
import { EmbedError, EmbedErrorCode } from '../common/error';
import { parseResourceRef } from '../common/resource-ref-uri';
import { toResourceRefUnitType } from '../common/unit-type';

export const LOCAL_RUNTIME_RESOURCE_REF_UNIT_PROVIDER_ID = 'local-runtime-resource-ref-unit-provider';
export const LOCAL_RUNTIME_RESOURCE_REF_DATA_PROVIDER_ID = 'local-runtime-resource-ref-data-provider';
export const LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_PRIORITY = -100;

export class EmbedLocalRuntimeResourceRefUnitProvider implements IEmbedResourceRefUnitProvider {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        // noop
    }

    ensureUnit(input: IEmbedResourceRefEnsureUnitInput): IReferencedUnitLoadResult {
        assertLocalRuntimeRef(input.ref);
        assertLocalRuntimeRefUnitType(input.ref, input.unitType);

        const unit = this._univerInstanceService.getUnit(input.ref.unit.selector, input.unitType);
        if (!unit) {
            throw new EmbedError(EmbedErrorCode.LocalRuntimeResourceRefUnitNotFound, {
                ref: input.ref,
                unitType: input.unitType,
            });
        }

        return {
            unitId: unit.getUnitId(),
            unitType: input.unitType,
        };
    }
}

export class EmbedLocalRuntimeResourceRefDataProvider implements IEmbedResourceRefDataProvider {
    constructor(
        @Inject(IReferencedUnitManagerService) private readonly _referencedUnitManager: IReferencedUnitManagerServiceInterface,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        // noop
    }

    async readData(input: IEmbedResourceRefReadDataInput): Promise<IReferencedUnitReadDataResult> {
        if (input.dataType !== ReferencedUnitDataType.RANGE || input.selector.kind !== 'range') {
            throw new EmbedError(EmbedErrorCode.LocalRuntimeResourceRefDataSelectorUnsupported, {
                dataType: input.dataType,
                selector: input.selector,
            });
        }

        const record = await this._referencedUnitManager.ensure(
            getResourceRefUnitLocatorRef(input.ref),
            {
                unitType: input.unitType,
                signal: input.signal,
            }
        );

        if (record.unitType !== CoreUniverInstanceType.UNIVER_SHEET) {
            throw new EmbedError(EmbedErrorCode.LocalRuntimeResourceRefDataUnitTypeUnsupported, {
                ref: input.ref,
                unitType: record.unitType,
            });
        }

        const workbook = this._univerInstanceService.getUnit<Workbook>(record.unitId, CoreUniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            throw new EmbedError(EmbedErrorCode.LocalRuntimeResourceRefDataUnitNotFound, {
                ref: input.ref,
                unitId: record.unitId,
            });
        }

        const worksheet = input.selector.sheetId
            ? workbook.getSheetBySheetId(input.selector.sheetId)
            : workbook.getSheetBySheetName(input.selector.sheetName);
        if (!worksheet) {
            throw new EmbedError(EmbedErrorCode.LocalRuntimeResourceRefDataSheetNotFound, {
                ref: input.ref,
                selector: input.selector,
            });
        }

        return {
            type: ReferencedUnitDataType.RANGE,
            values: worksheet.getRange(parseA1Range(input.selector.range)).getValues().map((row) => row.map((cell) => toDataValue(getOriginCellValue(cell)))),
        };
    }
}

export function createLocalRuntimeResourceRefUnitProviderRegistration(provider: IEmbedResourceRefUnitProvider): IEmbedResourceRefUnitProviderRegistration {
    return {
        registrationId: LOCAL_RUNTIME_RESOURCE_REF_UNIT_PROVIDER_ID,
        match: {
            fileKinds: ['self'],
            unitTypes: ['sheet', 'doc', 'slide', 'base'],
        },
        priority: LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_PRIORITY,
        provider,
    };
}

export function createLocalRuntimeResourceRefDataProviderRegistration(provider: IEmbedResourceRefDataProvider): IEmbedResourceRefDataProviderRegistration {
    return {
        registrationId: LOCAL_RUNTIME_RESOURCE_REF_DATA_PROVIDER_ID,
        match: {
            fileKinds: ['self'],
            unitTypes: ['sheet'],
        },
        priority: LOCAL_RUNTIME_RESOURCE_REF_PROVIDER_PRIORITY,
        provider,
    };
}

function assertLocalRuntimeRef(ref: ResourceRefInput): asserts ref is ResourceRefInput {
    const parsedRef = typeof ref === 'string' ? parseResourceRef(ref) : ref;
    if (parsedRef.file.kind !== 'self') {
        throw new EmbedError(EmbedErrorCode.LocalRuntimeResourceRefUnsupported, {
            ref,
        });
    }
}

function assertLocalRuntimeRefUnitType(ref: ResourceRefInput, unitType: UniverInstanceType): void {
    const parsedRef = typeof ref === 'string' ? parseResourceRef(ref) : ref;
    if (parsedRef.unit.type !== toResourceRefUnitType(unitType)) {
        throw new EmbedError(EmbedErrorCode.LocalRuntimeResourceRefUnitTypeMismatch, {
            ref,
            unitType,
        });
    }
}

function getResourceRefUnitLocatorRef(ref: ResourceRef): ResourceRef {
    return {
        file: ref.file,
        unit: ref.unit,
    };
}

const A1_RANGE_PATTERN = /^\$?([A-Za-z]+)\$?([1-9]\d*)(?::\$?([A-Za-z]+)\$?([1-9]\d*))?$/;

function parseA1Range(range: string): IRange {
    const match = A1_RANGE_PATTERN.exec(range);
    if (!match) {
        throw new EmbedError(EmbedErrorCode.LocalRuntimeResourceRefRangeInvalid, {
            range,
        });
    }

    const startColumn = columnLabelToIndex(match[1]);
    const startRow = Number(match[2]) - 1;
    const endColumn = match[3] ? columnLabelToIndex(match[3]) : startColumn;
    const endRow = match[4] ? Number(match[4]) - 1 : startRow;

    if (endRow < startRow || endColumn < startColumn) {
        throw new EmbedError(EmbedErrorCode.LocalRuntimeResourceRefRangeInvalid, {
            range,
        });
    }

    return {
        startRow,
        endRow,
        startColumn,
        endColumn,
    };
}

function columnLabelToIndex(label: string): number {
    let index = 0;
    for (const char of label.toUpperCase()) {
        const code = char.charCodeAt(0);
        if (code < 65 || code > 90) {
            throw new EmbedError(EmbedErrorCode.LocalRuntimeResourceRefRangeInvalid, {
                label,
            });
        }
        index = index * 26 + code - 64;
    }
    return index - 1;
}

function toDataValue(value: unknown): IReferencedUnitDataValue {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }

    return null;
}
