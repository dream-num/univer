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

import type { ICreateUnitOptions, UniverInstanceType } from '@univerjs/core';
import type { ResourceRefInput } from './resource-ref';

export const ReferencedUnitOwnerKind = {
    Embed: 'embed',
    Formula: 'formula',
    Viewer: 'viewer',
    ViewHost: 'view-host',
} as const;

export type ReferencedUnitOwnerKind =
    | typeof ReferencedUnitOwnerKind[keyof typeof ReferencedUnitOwnerKind]
    | (string & {});

export interface IReferencedUnitOwner {
    kind: ReferencedUnitOwnerKind;
    unitId?: string;
    ownerId?: string;
}

export interface IReferencedUnitRecord {
    ref: ResourceRefInput;
    unitId: string;
    unitType: UniverInstanceType;
}

export interface IReferencedUnitUsageRecord extends IReferencedUnitRecord {
    usedBy: readonly IReferencedUnitOwner[];
}

export interface IReferencedUnitHandle {
    readonly loaded: Promise<IReferencedUnitRecord>;
    dispose(): void;
}

export interface IReferencedUnitEnsureInput {
    ref: ResourceRefInput;
    unitType?: UniverInstanceType;
    owner?: IReferencedUnitOwner;
    signal?: AbortSignal;
    createOptions?: ICreateUnitOptions;
}

export interface IReferencedUnitListFilter {
    ref?: ResourceRefInput;
    owner?: IReferencedUnitOwner;
}

export interface IReferencedUnitManagerService {
    ensure(input: IReferencedUnitEnsureInput): IReferencedUnitHandle;
    list(filter?: IReferencedUnitListFilter): IReferencedUnitUsageRecord[];
    getByUnitId(unitId: string): IReferencedUnitUsageRecord | null;
    findByRef(ref: ResourceRefInput): IReferencedUnitUsageRecord[];
}
