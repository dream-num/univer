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

import type { IDisposable } from '@univerjs/core';
import type { IEmbedDescriptor } from '@univerjs/embed';
import { toDisposable } from '@univerjs/core';

export interface IEmbedRuntimeAncestor {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
}

export interface IEmbedRuntimeMountDecision {
    allowed: boolean;
    reason?: 'max-depth' | 'cycle';
    ancestry: readonly IEmbedRuntimeAncestor[];
}

export interface IEmbedRuntimePolicyConfig {
    maxDepth?: number;
}

type EmbedRuntimeDescriptor = Pick<IEmbedDescriptor, 'hostUnitId' | 'embedId'> & {
    childUnitId: string;
};

const DEFAULT_MAX_EMBED_DEPTH = 1;

export class EmbedRuntimePolicyService {
    private readonly _childUnitAncestry = new Map<string, IEmbedRuntimeAncestor[]>();
    private readonly _maxDepth: number;

    constructor(config: IEmbedRuntimePolicyConfig = {}) {
        this._maxDepth = normalizeMaxDepth(config.maxDepth);
    }

    canMount(descriptor: EmbedRuntimeDescriptor): IEmbedRuntimeMountDecision {
        const ancestry = this.getAncestryForHostUnit(descriptor.hostUnitId);
        if (ancestry.some(
            (ancestor) => ancestor.hostUnitId === descriptor.childUnitId || ancestor.childUnitId === descriptor.childUnitId
        )) {
            return {
                allowed: false,
                reason: 'cycle',
                ancestry,
            };
        }

        if (ancestry.length >= this._maxDepth) {
            return {
                allowed: false,
                reason: 'max-depth',
                ancestry,
            };
        }

        return {
            allowed: true,
            ancestry,
        };
    }

    registerMountedRuntime(descriptor: EmbedRuntimeDescriptor): IDisposable {
        const ancestry = [
            ...this.getAncestryForHostUnit(descriptor.hostUnitId),
            {
                hostUnitId: descriptor.hostUnitId,
                embedId: descriptor.embedId,
                childUnitId: descriptor.childUnitId,
            },
        ];
        this._childUnitAncestry.set(descriptor.childUnitId, ancestry);

        return toDisposable(() => {
            const current = this._childUnitAncestry.get(descriptor.childUnitId);
            if (current === ancestry) {
                this._childUnitAncestry.delete(descriptor.childUnitId);
            }
        });
    }

    getAncestryForHostUnit(hostUnitId: string): readonly IEmbedRuntimeAncestor[] {
        return this._childUnitAncestry.get(hostUnitId) ?? [];
    }

    getParentEmbedId(hostUnitId: string): string | undefined {
        return this.getAncestryForHostUnit(hostUnitId).at(-1)?.embedId;
    }
}

function normalizeMaxDepth(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
        ? Math.floor(value)
        : DEFAULT_MAX_EMBED_DEPTH;
}
