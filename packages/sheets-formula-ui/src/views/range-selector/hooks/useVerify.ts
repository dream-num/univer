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

import type { IRangeSelectorProps } from '../';
import type { INode } from './useFormulaToken';
import { useEffect, useRef } from 'react';
import { sequenceNodeToText } from '../utils/sequenceNodeToText';
import { verifyRange } from '../utils/verifyRange';

export const useVerify = (isNeed: boolean, onVerify: IRangeSelectorProps['onVerify'], sequenceNodes: INode[]) => {
    const isInitRender = useRef(true);

    // No validation is performed during the initialization phase.
    useEffect(() => {
        if (isNeed) {
            const time = setTimeout(() => {
                isInitRender.current = false;
            }, 500);
            return () => {
                clearTimeout(time);
            };
        }
    }, [isNeed]);

    useEffect(() => {
        if (!isInitRender.current) {
            if (onVerify) {
                const result = verifyRange(sequenceNodes);
                onVerify(result, sequenceNodeToText(sequenceNodes));
            }
        }
    }, [sequenceNodes, onVerify]);
};
