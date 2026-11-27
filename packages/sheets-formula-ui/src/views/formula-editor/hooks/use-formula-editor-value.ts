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

import type { IFormulaSyntax } from '@univerjs/engine-formula';
import { LexerTreeBuilder, operatorToken } from '@univerjs/engine-formula';
import { useDependency, useUpdateEffect } from '@univerjs/ui';
import { useEffect, useMemo, useRef } from 'react';
import type { IFormulaEditorProps } from '../index';

export function useFormulaEditorValue(
    syntax: IFormulaSyntax,
    draft: string,
    focused: boolean,
    onChange: IFormulaEditorProps['onChange'],
    onVerify: IFormulaEditorProps['onVerify']
) {
    const lexer = useDependency(LexerTreeBuilder);
    const standard = useMemo(() => syntax.toStandard(draft), [draft, syntax]);
    const isInitialRenderRef = useRef(true);

    useUpdateEffect(() => {
        // An invalid draft must clear the previous rule value in forms that only subscribe to onChange.
        onChange(standard ?? '');
    }, [onChange, standard]);

    useEffect(() => {
        if (focused) {
            const timer = setTimeout(() => {
                isInitialRenderRef.current = false;
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [focused]);

    useEffect(() => {
        if (onVerify && (!isInitialRenderRef.current || standard === null)) {
            const valid = standard !== null && standard.startsWith(operatorToken.EQUALS) && lexer.checkIfAddBracket(standard) === 0;
            onVerify(valid, standard ?? '');
        }
    }, [lexer, onVerify, standard]);
}
