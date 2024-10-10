/**
 * Copyright 2023-present DreamNum Inc.
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

import { useDependency } from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { useEffect, useState } from 'react';
import type { ISequenceNode } from '@univerjs/engine-formula';

export const useFormulaToken = (text: string) => {
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);

    const [sequenceNodes, sequenceNodesSet] = useState<(string | ISequenceNode)[]>([]);

    useEffect(() => {
        sequenceNodesSet(lexerTreeBuilder.sequenceNodesBuilder(text) ?? []);
    }, [text]);

    return {
        sequenceNodes,
        sequenceNodesSet,
    };
};
