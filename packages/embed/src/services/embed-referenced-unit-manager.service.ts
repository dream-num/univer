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
    IDisposable,
    IReferencedUnitEnsureOptions,
    IReferencedUnitManagerService,
    IReferencedUnitReadDataOptions,
    IReferencedUnitReadDataResult,
    IReferencedUnitRuntimeRecord,
    ResourceRef,
    ResourceRefInput,
} from '@univerjs/core';
import type { IEmbedResourceRefUnitProvider } from './embed-resource-ref-provider-registry.service';
import { formatResourceRef, getResourceRefUnitKey, normalizeResourceRefInput, Optional, ReferencedUnitDataType, ReferencedUnitError, ReferencedUnitErrorCode, toDisposable, UniverInstanceType } from '@univerjs/core';
import { EMBED_CHILD_CREATE_OPTIONS } from '../common/const';
import { fromResourceRefUnitType, toResourceRefUnitType } from '../common/unit-type';
import { EmbedResourceRefProviderRegistryService } from './embed-resource-ref-provider-registry.service';

interface IReferencedUnitLoadState {
    readonly unitLoadKey: string;
    readonly ref: ResourceRef;
    readonly token: symbol;
    providerLoadPromise: Promise<IReferencedUnitRuntimeRecord>;
    record?: IReferencedUnitRuntimeRecord;
}

export class EmbedReferencedUnitManagerService implements IReferencedUnitManagerService {
    private readonly _loadStates = new Map<string, IReferencedUnitLoadState>();
    private readonly _loadStatesByRuntimeUnitId = new Map<string, Set<IReferencedUnitLoadState>>();
    private readonly _usageCounts = new Map<string, number>();

    constructor(
        @Optional(EmbedResourceRefProviderRegistryService) private readonly _resourceRefProviderRegistry?: EmbedResourceRefProviderRegistryService
    ) {
        // noop
    }

    ensure(refInput: ResourceRefInput, options: IReferencedUnitEnsureOptions = {}): Promise<IReferencedUnitRuntimeRecord> {
        const ref = normalizeResourceRefInput(refInput);
        const unitType = this._resolveUnitType(ref, options.unitType);
        const unitLoadKey = this._getUnitLoadKey(ref, unitType);
        const existingState = this._loadStates.get(unitLoadKey);
        if (existingState) {
            return this._withOptionalAbort(existingState.providerLoadPromise, options.signal);
        }

        const provider = this._getUnitProvider(ref, unitType);
        const state = this._createLoadState({
            ref,
            unitType,
            unitLoadKey,
            provider,
            createOptions: options.createOptions ?? EMBED_CHILD_CREATE_OPTIONS,
            signal: options.signal,
        });

        return this._withOptionalAbort(state.providerLoadPromise, options.signal);
    }

    async readData(refInput: ResourceRefInput, options: IReferencedUnitReadDataOptions = {}): Promise<IReferencedUnitReadDataResult> {
        const ref = normalizeResourceRefInput(refInput);
        if (!ref.part || ref.part.kind !== 'range') {
            throw new ReferencedUnitError(ReferencedUnitErrorCode.MissingDataSelector, { ref });
        }

        const unitType = this._resolveUnitType(ref, undefined);
        const registration = this._resourceRefProviderRegistry?.getDataProvider(ref, ref.unit.type);
        if (!registration) {
            throw new ReferencedUnitError(ReferencedUnitErrorCode.ProviderMissing, {
                capability: 'data',
                ref,
                unitType,
            });
        }

        return registration.provider.readData({
            ref,
            unitType,
            dataType: ReferencedUnitDataType.RANGE,
            selector: ref.part,
            signal: options.signal,
        });
    }

    addUsage(fromUnitId: string, toUnitId: string, count = 1): IDisposable {
        const key = this._getUsageKey(fromUnitId, toUnitId);
        this._usageCounts.set(key, (this._usageCounts.get(key) ?? 0) + count);

        let disposed = false;
        return toDisposable(() => {
            if (disposed) {
                return;
            }

            disposed = true;
            const current = this._usageCounts.get(key) ?? 0;
            const next = current - count;
            if (next <= 0) {
                this._usageCounts.delete(key);
                return;
            }

            this._usageCounts.set(key, next);
        });
    }

    releaseUnit(unitId: string): void {
        for (const [key] of this._usageCounts) {
            const [fromUnitId, toUnitId] = JSON.parse(key) as [string, string];
            if (fromUnitId === unitId || toUnitId === unitId) {
                this._usageCounts.delete(key);
            }
        }

        for (const state of this._loadStates.values()) {
            if (state.record?.unitId === unitId) {
                this._removeLoadState(state);
            }
        }
    }

    private _getUnitProvider(ref: ResourceRef, unitType: UniverInstanceType): IEmbedResourceRefUnitProvider {
        const registration = this._resourceRefProviderRegistry?.getUnitProvider(ref, toResourceRefUnitType(unitType));
        if (!registration) {
            throw new ReferencedUnitError(ReferencedUnitErrorCode.ProviderMissing, {
                capability: 'unit',
                ref,
                unitType,
            });
        }

        return registration.provider;
    }

    private _createLoadState(input: {
        ref: ResourceRef;
        unitType: UniverInstanceType;
        unitLoadKey: string;
        provider: IEmbedResourceRefUnitProvider;
        createOptions: NonNullable<IReferencedUnitEnsureOptions['createOptions']>;
        signal?: AbortSignal;
    }): IReferencedUnitLoadState {
        const state: IReferencedUnitLoadState = {
            unitLoadKey: input.unitLoadKey,
            ref: input.ref,
            token: Symbol(input.unitLoadKey),
            providerLoadPromise: Promise.resolve(null as never),
        };
        this._addLoadState(state);
        state.providerLoadPromise = Promise.resolve()
            .then(() => input.provider.ensureUnit({
                ref: input.ref,
                unitType: input.unitType,
                createOptions: input.createOptions,
                signal: input.signal,
            }))
            .then((result) => {
                if (result.unitType !== input.unitType) {
                    throw new ReferencedUnitError(ReferencedUnitErrorCode.UnitTypeMismatch, {
                        expected: input.unitType,
                        actual: result.unitType,
                    });
                }

                const record = {
                    ref: this._formatUnitRef(input.ref),
                    unitId: result.unitId,
                    unitType: result.unitType,
                };
                if (this._loadStates.get(state.unitLoadKey) === state) {
                    state.record = record;
                    this._addRuntimeUnitLoadState(record.unitId, state);
                }
                return record;
            })
            .catch((error) => {
                this._removeLoadState(state);
                throw error;
            });
        return state;
    }

    private _addLoadState(state: IReferencedUnitLoadState): void {
        this._loadStates.set(state.unitLoadKey, state);
    }

    private _removeLoadState(state: IReferencedUnitLoadState): void {
        if (this._loadStates.get(state.unitLoadKey) === state) {
            this._loadStates.delete(state.unitLoadKey);
        }

        if (state.record) {
            const states = this._loadStatesByRuntimeUnitId.get(state.record.unitId);
            states?.delete(state);
            if (states?.size === 0) {
                this._loadStatesByRuntimeUnitId.delete(state.record.unitId);
            }
        }
    }

    private _addRuntimeUnitLoadState(unitId: string, state: IReferencedUnitLoadState): void {
        let states = this._loadStatesByRuntimeUnitId.get(unitId);
        if (!states) {
            states = new Set();
            this._loadStatesByRuntimeUnitId.set(unitId, states);
        }

        states.add(state);
    }

    private _withOptionalAbort<T>(promise: Promise<T>, signal: AbortSignal | undefined): Promise<T> {
        if (!signal) {
            return promise;
        }

        return this._withAbort(promise, signal);
    }

    private _withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
        if (signal.aborted) {
            return Promise.reject(new Error('REFERENCED_UNIT_LOAD_ABORTED'));
        }

        return new Promise<T>((resolve, reject) => {
            const onAbort = () => {
                signal.removeEventListener('abort', onAbort);
                reject(new Error('REFERENCED_UNIT_LOAD_ABORTED'));
            };

            signal.addEventListener('abort', onAbort, { once: true });
            promise.then(
                (value) => {
                    signal.removeEventListener('abort', onAbort);
                    resolve(value);
                },
                (error) => {
                    signal.removeEventListener('abort', onAbort);
                    reject(error);
                }
            );
        });
    }

    private _getUnitLoadKey(ref: ResourceRef, unitType: UniverInstanceType): string {
        return JSON.stringify([getResourceRefUnitKey(ref), unitType]);
    }

    private _getUsageKey(fromUnitId: string, toUnitId: string): string {
        return JSON.stringify([fromUnitId, toUnitId]);
    }

    private _resolveUnitType(ref: ResourceRef, declaredUnitType: UniverInstanceType | undefined): UniverInstanceType {
        const refUnitType = fromResourceRefUnitType(ref.unit.type);
        if (declaredUnitType !== undefined && declaredUnitType !== UniverInstanceType.UNRECOGNIZED && declaredUnitType !== refUnitType) {
            throw new ReferencedUnitError(ReferencedUnitErrorCode.UnitTypeMismatch, {
                expected: declaredUnitType,
                actual: refUnitType,
            });
        }

        return refUnitType;
    }

    private _formatUnitRef(ref: ResourceRef): string {
        return formatResourceRef({
            file: ref.file,
            unit: ref.unit,
        });
    }
}
