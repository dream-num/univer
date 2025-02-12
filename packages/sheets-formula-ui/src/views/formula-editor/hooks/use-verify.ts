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

import type { IFormulaEditorProps } from '../index';
import { LexerTreeBuilder, operatorToken } from '@univerjs/engine-formula';
import { useDependency } from '@univerjs/ui';
import { useEffect, useRef } from 'react';

export const useVerify = (isNeed: boolean, onVerify: IFormulaEditorProps['onVerify'], formulaText: string) => {
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
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
                const result = lexerTreeBuilder.checkIfAddBracket(formulaText);
                onVerify(result === 0 && formulaText.startsWith(operatorToken.EQUALS), `${formulaText}`);
            }
        }
    }, [formulaText, onVerify]);
};
