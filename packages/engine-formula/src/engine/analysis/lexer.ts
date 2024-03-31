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

import { Disposable } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IDefinedNamesService } from '../../services/defined-names.service';
import type { ISequenceArray } from '../utils/sequence';
import { sequenceNodeType } from '../utils/sequence';
import { operatorToken } from '../../basics/token';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { LexerTreeBuilder } from './lexer-tree-builder';

export class Lexer extends Disposable {
    constructor(
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder,
        @IFormulaCurrentConfigService private readonly _formulaCurrentConfigService: IFormulaCurrentConfigService
    ) {
        super();
    }

    treeBuilder(formulaString: string, transformSuffix = true) {
        return this._lexerTreeBuilder.treeBuilder(formulaString, transformSuffix, this._injectDefinedName.bind(this));
    }

    private _injectDefinedName(sequenceArray: ISequenceArray[]) {
        const unitId = this._formulaCurrentConfigService.getExecuteUnitId();

        if (unitId == null || !this._definedNamesService.hasDefinedName(unitId)) {
            return {
                sequenceString: '',
                hasDefinedName: false,
            };
        }

        const sequenceNodes = this._lexerTreeBuilder.getSequenceNode(sequenceArray);
        let sequenceString = '';
        let hasDefinedName = false;

        for (let i = 0, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string') {
                sequenceString += node;
                continue;
            }

            const { nodeType, token } = node;

            if (nodeType === sequenceNodeType.REFERENCE || nodeType === sequenceNodeType.FUNCTION) {
                const definedContent = this._definedNamesService.getValueByName(unitId, token);
                if (definedContent) {
                    let refString = definedContent.formulaOrRefString;
                    if (refString.substring(0, 1) === operatorToken.EQUALS) {
                        refString = refString.substring(1);
                    }
                    sequenceString += refString;
                    hasDefinedName = true;
                } else {
                    sequenceString += token;
                }
            } else {
                sequenceString += token;
            }
        }

        return {
            sequenceString,
            hasDefinedName,
        };
    }
}
