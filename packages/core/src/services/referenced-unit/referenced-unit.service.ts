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

import type { IDisposable } from '../../common/di';
import type { UniverInstanceType } from '../../common/unit';
import type { ICreateUnitOptions } from '../instance/instance.service';
import type { ResourceRefInput } from './resource-ref';
import { createIdentifier } from '../../common/di';

export interface IReferencedUnitRuntimeRecord {
    /** Canonical ResourceRef string that produced this runtime unit. */
    ref: string;
    /** Runtime unit id returned by the provider and registered in Univer runtime. */
    unitId: string;
    /** Runtime unit type validated by the manager. */
    unitType: UniverInstanceType;
}

export type IReferencedUnitRecord = IReferencedUnitRuntimeRecord;

export interface IReferencedUnitEnsureOptions {
    /** Declared expected unit type. The manager rejects provider mismatch. */
    unitType?: UniverInstanceType;
    signal?: AbortSignal;
    /** Runtime unit creation options forwarded to providers that create units. */
    createOptions?: ICreateUnitOptions;
}

export interface IReferencedUnitUsageCount {
    /** Unit that depends on another unit's data. */
    fromUnitId: string;
    /** Unit that is depended on. */
    toUnitId: string;
    /** Aggregated live edge count between fromUnitId and toUnitId. */
    count: number;
}

export type IReferencedUnitDataValue = string | number | boolean | null;

export enum ReferencedUnitDataType {
    RANGE = 'range',
}

export interface IReferencedUnitReadDataResult {
    /** Data shape returned by this read. Current implementation supports range data. */
    type: ReferencedUnitDataType.RANGE;
    /** Two-dimensional primitive values; a single cell is represented as 1 x 1. */
    values: IReferencedUnitDataValue[][];
}

export interface IReferencedUnitReadDataOptions {
    signal?: AbortSignal;
}

export enum ReferencedUnitErrorCode {
    ProviderMissing = 'provider-missing',
    ProviderConflict = 'provider-conflict',
    UnitTypeMismatch = 'unit-type-mismatch',
    MissingDataSelector = 'missing-data-selector',
}

export class ReferencedUnitError extends Error {
    readonly code: ReferencedUnitErrorCode;
    readonly details?: unknown;

    constructor(code: ReferencedUnitErrorCode, details?: unknown) {
        super(code);
        this.name = 'ReferencedUnitError';
        this.code = code;
        this.details = details;
    }
}

export const IReferencedUnitManagerService = createIdentifier<IReferencedUnitManagerService>('univer.referenced-unit-manager-service');

export interface IReferencedUnitManagerService {
    /**
     * Materialize the runtime unit described by `ref`.
     *
     * The manager owns provider selection, pending/result bookkeeping and unit
     * type validation. This method never binds an embed owner.
     */
    ensure(ref: ResourceRefInput, options?: IReferencedUnitEnsureOptions): Promise<IReferencedUnitRuntimeRecord>;

    /**
     * Read data selected by a ResourceRef.
     *
     * The manager normalizes `ref` and requires a data selector such as a range
     * part. This path never creates an embed owner or unit claim.
     */
    readData(ref: ResourceRefInput, options?: IReferencedUnitReadDataOptions): Promise<IReferencedUnitReadDataResult>;

    /**
     * Register one unit-to-unit usage edge for GC facts.
     *
     * The returned disposable releases exactly this usage count once; repeated
     * dispose calls are no-op.
     */
    addUsage(fromUnitId: string, toUnitId: string, count?: number): IDisposable;

    /**
     * Clear manager runtime facts involving the given unit.
     */
    releaseUnit(unitId: string): void;
}
