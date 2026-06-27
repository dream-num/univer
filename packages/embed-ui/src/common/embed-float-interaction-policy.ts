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

import type { EmbedFloatingStage, EmbedInteractionFlow } from '../types/embed-ui';

export interface IEmbedFloatInteractionPolicy {
    allowHostBodyDrag: boolean;
    allowHostDragHandle: boolean;
    disableLiveHostPointerEvents: boolean;
    passThroughInteractionGate: boolean;
    runtimeOwnsInteraction: boolean;
    showHostDragHandle: boolean;
}

export function resolveEmbedFloatInteractionPolicy(params: {
    stage: EmbedFloatingStage;
    interactionFlow: EmbedInteractionFlow;
}): IEmbedFloatInteractionPolicy {
    const { stage, interactionFlow } = params;
    const docBlock = interactionFlow === 'doc-block';
    const hostOwnsStage1 = stage === 'stage1' && !docBlock;
    const runtimeOwnsInteraction = stage === 'stage2' || docBlock;

    return {
        allowHostBodyDrag: hostOwnsStage1,
        allowHostDragHandle: hostOwnsStage1,
        disableLiveHostPointerEvents: !docBlock && (stage === 'inactive' || stage === 'stage1'),
        passThroughInteractionGate: runtimeOwnsInteraction,
        runtimeOwnsInteraction,
        showHostDragHandle: hostOwnsStage1,
    };
}
