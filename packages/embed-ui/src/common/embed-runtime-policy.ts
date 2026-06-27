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

import type { IEmbedDescriptor } from '@univerjs/embed';
import type { EmbedFloatingStage, IEmbedFloatingActivation } from '../types/embed-ui';
import { UniverInstanceType } from '@univerjs/core';

export type EmbedRuntimeMountGate = 'deferred' | 'ready';
export type EmbedFloatingMenuStage = 'inactive' | 'stage2';

export function shouldDeferEmbedRuntimeMount(
    descriptor: Pick<IEmbedDescriptor, 'hostType' | 'childType' | 'sourceMeta'> | undefined,
    stage: EmbedFloatingStage
): boolean {
    return descriptor?.hostType === UniverInstanceType.UNIVER_SHEET &&
        descriptor.childType === UniverInstanceType.UNIVER_SHEET &&
        Boolean(descriptor.sourceMeta?.floating) &&
        stage !== 'stage2';
}

export function resolveEmbedRuntimeMountGate(
    descriptor: Pick<IEmbedDescriptor, 'hostType' | 'childType' | 'sourceMeta'> | undefined,
    stage: EmbedFloatingStage
): EmbedRuntimeMountGate {
    return shouldDeferEmbedRuntimeMount(descriptor, stage) ? 'deferred' : 'ready';
}

export function resolveEmbedFloatingMenuStage(params: {
    embedId: string;
    active: IEmbedFloatingActivation | null;
    fullscreen?: boolean;
    usesDomFloatingStage: boolean;
    renderScopeActive: boolean;
}): EmbedFloatingMenuStage {
    if (params.fullscreen) {
        return 'stage2';
    }

    if (params.active?.embedId === params.embedId && params.active.stage === 'stage2') {
        return 'stage2';
    }

    if (!params.usesDomFloatingStage && params.renderScopeActive) {
        return 'stage2';
    }

    return 'inactive';
}
