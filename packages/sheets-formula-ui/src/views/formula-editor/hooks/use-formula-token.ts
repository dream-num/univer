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

import type { IFormulaSyntax, ISequenceNode } from '@univerjs/engine-formula';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { useDependency } from '@univerjs/ui';
import { useCallback } from 'react';

export type INode = (string | ISequenceNode);
export function getEditorSequenceNodes(lexer: LexerTreeBuilder, text: string, projected: string) {
    const nodes = lexer.sequenceNodesBuilder(projected) ?? [];
    if (projected === text) return nodes;

    // The lexer omits the leading '='. Keep its token kinds and offsets while editing the original text.
    const source = text.startsWith('=') ? text.slice(1) : text;
    let offset = 0;
    return nodes.map((node) => {
        const length = typeof node === 'string' ? node.length : node.token.length;
        const token = source.slice(offset, offset + length);
        offset += length;
        return typeof node === 'string' ? token : { ...node, token };
    });
}

export const useFormulaToken = (syntax: IFormulaSyntax) => {
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const getFormulaToken = useCallback((text: string) => getEditorSequenceNodes(lexerTreeBuilder, text, syntax.toEditorTokens(text)), [lexerTreeBuilder, syntax]);
    return getFormulaToken;
};
