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

import type { IMutationInfo, UniverInstanceType } from '@univerjs/core';
import type { EmbedHostEntry, IEmbedDescriptor } from './embed';
import type { IEmbedHostAnchorRecord } from './host-anchor';

export interface IEmbedHostAnchorContext {
    embedId: string;
    hostUnitId: string;
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    requestedAnchorId?: string;
    hostContext?: Record<string, unknown>;
    descriptor?: IEmbedDescriptor;
}

export interface IEmbedHostAnchorMutationPlan {
    hostAnchorId: string;
    redoMutations: IMutationInfo[];
    undoMutations: IMutationInfo[];
}

export interface IEmbedHostAnchorRemoveMutationPlan {
    redoMutations: IMutationInfo[];
    undoMutations: IMutationInfo[];
}

interface IEmbedHostAdapterContributionBase {
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    removeAnchor?: (context: IEmbedHostAnchorContext & { hostAnchorId: string }) => void;
    removeAnchorPlan?: (context: IEmbedHostAnchorContext & { hostAnchorId: string }) => IEmbedHostAnchorRemoveMutationPlan;
    afterCreateAnchor?: (context: IEmbedHostAnchorContext & { hostAnchorId: string; descriptor: IEmbedDescriptor }) => void;
    afterRemoveAnchor?: (context: IEmbedHostAnchorContext & { hostAnchorId: string; descriptor?: IEmbedDescriptor }) => void;
    activateAnchor?: (context: IEmbedHostAnchorContext & { hostAnchorId: string; descriptor: IEmbedDescriptor }) => void;
    restoreAnchor?: (context: IEmbedHostAnchorContext & { hostAnchorId: string; descriptor: IEmbedDescriptor }) => IEmbedHostAnchorRecord;
}

export type IEmbedHostAdapterContribution = IEmbedHostAdapterContributionBase & (
    | {
        createAnchorPlan: (context: IEmbedHostAnchorContext) => IEmbedHostAnchorMutationPlan;
        createAnchor?: (context: IEmbedHostAnchorContext) => string;
    }
    | {
        createAnchor: (context: IEmbedHostAnchorContext) => string;
        createAnchorPlan?: (context: IEmbedHostAnchorContext) => IEmbedHostAnchorMutationPlan;
    }
);
