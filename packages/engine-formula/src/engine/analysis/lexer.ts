import { Disposable } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { IDefinedNamesService } from '../../services/defined-names.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import type { ISequenceArray } from '../utils/sequence';
import { sequenceNodeType } from '../utils/sequence';
import { LexerTreeBuilder } from './lexer-tree-builder';

export class Lexer extends Disposable {
    constructor(
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService,
        @Inject(LexerTreeBuilder) private readonly _lexerTreeBuilder: LexerTreeBuilder
    ) {
        super();
    }

    treeBuilder(formulaString: string, transformSuffix = true) {
        return this._lexerTreeBuilder.treeBuilder(formulaString, transformSuffix, this._injectDefinedName.bind(this));
    }

    private _injectDefinedName(sequenceArray: ISequenceArray[]) {
        const unitId = this._runtimeService.currentUnitId;

        if (!this._definedNamesService.hasDefinedName(unitId)) {
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
                const definedContent = this._definedNamesService.getDefinedNameMap(unitId)?.get(token);
                if (definedContent) {
                    sequenceString += definedContent;
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
