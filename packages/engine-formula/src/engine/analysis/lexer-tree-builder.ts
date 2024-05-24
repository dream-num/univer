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

import type { IRange, Nullable } from '@univerjs/core';
import { AbsoluteRefType, Disposable, isValidRange, moveRangeByOffset, Tools } from '@univerjs/core';

import { FormulaAstLRU } from '../../basics/cache-lru';
import { ErrorType } from '../../basics/error-type';
import { isFormulaLexerToken } from '../../basics/match-token';
import { REFERENCE_SINGLE_RANGE_REGEX } from '../../basics/regex';
import {
    matchToken,
    OPERATOR_TOKEN_PRIORITY,
    OPERATOR_TOKEN_SET,
    operatorToken,
    prefixToken,
    SPACE_TOKEN,
    SUFFIX_TOKEN_SET,
    suffixToken,
} from '../../basics/token';
import {
    DEFAULT_TOKEN_CUBE_FUNCTION_NAME,
    DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME,
    DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER,
    DEFAULT_TOKEN_TYPE_PARAMETER,
    DEFAULT_TOKEN_TYPE_ROOT,
} from '../../basics/token-type';
import type { ISequenceArray, ISequenceNode } from '../utils/sequence';
import { generateStringWithSequence, sequenceNodeType } from '../utils/sequence';
import { deserializeRangeWithSheet, isReferenceStringWithEffectiveColumn, serializeRangeToRefString } from '../utils/reference';
import { LexerNode } from './lexer-node';

enum bracketType {
    NORMAL,
    FUNCTION,
    LAMBDA,
}

const FORMULA_CACHE_LRU_COUNT = 100000;

export const FormulaLexerNodeCache = new FormulaAstLRU<LexerNode>(FORMULA_CACHE_LRU_COUNT);

export const FormulaSequenceNodeCache = new FormulaAstLRU<Array<string | ISequenceNode>>(FORMULA_CACHE_LRU_COUNT);

export class LexerTreeBuilder extends Disposable {
    private _currentLexerNode: LexerNode = new LexerNode();

    private _upLevel = 0;

    private _segment = '';

    private _bracketState: bracketType[] = []; // ()

    private _squareBracketState: number = 0;

    private _bracesState = 0; // {}

    private _singleQuotationState = 0; // ''

    private _doubleQuotationState = 0; // ""

    private _lambdaState = false; // Lambda

    private _colonState = false; // :

    private _tableBracketState = false; // Table3[[#All],[Column1]:[Column2]]

    override dispose(): void {
        this._resetTemp();
        this._currentLexerNode.dispose();

        FormulaLexerNodeCache.clear();

        FormulaSequenceNodeCache.clear();
    }

    getUpLevel() {
        return this._upLevel;
    }

    isColonClose() {
        return this._colonState === false;
    }

    isColonOpen() {
        return this._colonState === true;
    }

    isDoubleQuotationClose() {
        return this._doubleQuotationState === 0;
    }

    isLambdaOpen() {
        return this._lambdaState === true;
    }

    isLambdaClose() {
        return this._lambdaState === false;
    }

    isSingleQuotationClose() {
        return this._singleQuotationState === 0;
    }

    isBracesClose() {
        return this._bracesState === 0;
    }

    isBracketClose() {
        return this._bracketState.length === 0;
    }

    isSquareBracketClose() {
        return this._squareBracketState === 0;
    }

    getCurrentLexerNode() {
        return this._currentLexerNode;
    }

    getFunctionAndParameter(formulaString: string, strIndex: number) {
        const current = this._getCurrentParamIndex(formulaString, strIndex);

        if (current == null || current === ErrorType.VALUE) {
            return;
        }

        const lexerNode = current[0];

        if (typeof lexerNode === 'string') {
            return;
        }

        let parent = lexerNode.getParent();

        let children = lexerNode;

        while (parent) {
            const token = parent.getToken();
            if (
                token !== DEFAULT_TOKEN_TYPE_PARAMETER &&
                !isFormulaLexerToken(token) &&
                parent.getStartIndex() !== -1
            ) {
                const paramIndex = parent.getChildren().indexOf(children);

                return {
                    functionName: token,
                    paramIndex,
                };
            }

            children = parent;
            parent = parent.getParent();
        }
    }

    /**
     * Estimate the number of right brackets that need to be automatically added to the end of the formula.
     * @param formulaString
     */
    checkIfAddBracket(formulaString: string) {
        let lastBracketCount = 0;
        let lastIndex = formulaString.length - 1;
        let lastString = formulaString[lastIndex];
        /**
         * Determine how many close brackets are at the end, and estimate how many functions need to automatically add close brackets.
         */
        while ((lastString === matchToken.CLOSE_BRACKET || lastString === ' ') && lastIndex >= 0) {
            if (lastString === matchToken.CLOSE_BRACKET) {
                lastBracketCount++;
            }
            lastString = formulaString[--lastIndex];
        }

        const current = this._getCurrentParamIndex(formulaString, formulaString.length - 2);

        if (current == null || current === ErrorType.VALUE) {
            return 0;
        }

        const lexerNode = current[0];

        if (typeof lexerNode === 'string') {
            return 0;
        }

        let parent = lexerNode.getParent();
        let bracketCount = 0;

        if (current[1] === matchToken.OPEN_BRACKET) {
            bracketCount++;
        }

        /**
         * Perform an upward search on the syntax tree to see how many layers the function is nested.
         * For each layer passed, subtract the estimated number of right brackets,
         * ultimately obtaining the number of right brackets that need to be completed.
         */
        while (parent) {
            const token = parent.getToken();
            if (
                token !== DEFAULT_TOKEN_TYPE_PARAMETER &&
                token !== matchToken.COLON &&
                parent.getStartIndex() !== -1 &&
                token.toUpperCase() !== DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME
            ) {
                if (lastBracketCount === 0) {
                    bracketCount += 1;
                } else {
                    lastBracketCount--;
                }
            }

            parent = parent.getParent();
        }

        return bracketCount;
    }

    sequenceNodesBuilder(formulaString: string) {
        const sequenceNodesCache = FormulaSequenceNodeCache.get(formulaString);
        if (sequenceNodesCache) {
            return [...sequenceNodesCache];
        }

        const sequenceArray = this._getSequenceArray(formulaString);
        if (sequenceArray.length === 0) {
            return;
        }

        const newSequenceNodes = this.getSequenceNode(sequenceArray);

        // let sequenceString = '';
        // for (const node of newSequenceNodes) {
        //     if (typeof node === 'string') {
        //         sequenceString += node;
        //     } else {
        //         sequenceString += node.token;
        //     }
        // }
        // console.log('sequenceString', sequenceString);

        FormulaSequenceNodeCache.set(formulaString, [...newSequenceNodes]);

        return newSequenceNodes;
    }

    convertRefersToAbsolute(formulaString: string, startAbsoluteRefType: AbsoluteRefType, endAbsoluteRefType: AbsoluteRefType) {
        const nodes = this.sequenceNodesBuilder(formulaString);
        if (nodes == null) {
            return formulaString;
        }

        let prefixToken = '';
        if (formulaString.substring(0, 1) === operatorToken.EQUALS) {
            prefixToken = operatorToken.EQUALS;
        }

        for (let i = 0, len = nodes.length; i < len; i++) {
            const node = nodes[i];
            if (typeof node === 'string') {
                continue;
            }

            if (node.nodeType === sequenceNodeType.REFERENCE) {
                const { token, endIndex } = node;
                const sequenceGrid = deserializeRangeWithSheet(token);
                if (sequenceGrid == null) {
                    continue;
                }

                const { range, sheetName, unitId } = sequenceGrid;

                const newRange = {
                    ...range,
                    startAbsoluteRefType,
                    endAbsoluteRefType,
                };

                const newToken = serializeRangeToRefString({
                    range: newRange,
                    unitId,
                    sheetName,
                });

                const minusCount = newToken.length - token.length;

                nodes[i] = {
                    ...node,
                    token: newToken,
                    endIndex: endIndex + minusCount,
                };

                /**
                 * Adjust the start and end indexes of the subsequent nodes.
                 */
                for (let j = i + 1; j < len; j++) {
                    const nextNode = nodes[j];
                    if (typeof nextNode === 'string') {
                        continue;
                    }

                    nextNode.startIndex += minusCount;
                    nextNode.endIndex += minusCount;
                }
            }
        }

        return `${prefixToken}${generateStringWithSequence(nodes)}`;
    }

    moveFormulaRefOffset(formulaString: string, refOffsetX: number, refOffsetY: number, ignoreAbsolute = false) {
        const sequenceNodes = this.sequenceNodesBuilder(formulaString);

        if (sequenceNodes == null) {
            return formulaString;
        }

        const newSequenceNodes: Array<string | ISequenceNode> = [];

        for (let i = 0, len = sequenceNodes.length; i < len; i++) {
            const node = sequenceNodes[i];
            if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
                newSequenceNodes.push(node);
                continue;
            }

            const { token } = node;

            const sequenceGrid = deserializeRangeWithSheet(token);

            const { sheetName, unitId: sequenceUnitId } = sequenceGrid;

            let newRange: IRange = sequenceGrid.range;

            if (!ignoreAbsolute && newRange.startAbsoluteRefType === AbsoluteRefType.ALL && newRange.endAbsoluteRefType === AbsoluteRefType.ALL) {
                newSequenceNodes.push(node);
                continue;
            } else {
                newRange = moveRangeByOffset(newRange, refOffsetX, refOffsetY, ignoreAbsolute);
            }

            let newToken = '';
            if (isValidRange(newRange)) {
                newToken = serializeRangeToRefString({
                    range: newRange,
                    unitId: sequenceUnitId,
                    sheetName,
                });
            } else {
                newToken = ErrorType.REF;
            }

            newSequenceNodes.push({
                ...node,
                token: newToken,
            });
        }

        return `=${generateStringWithSequence(newSequenceNodes)}`;
    }

    getSequenceNode(sequenceArray: ISequenceArray[]) {
        const sequenceNodes: Array<ISequenceNode | string> = [];

        let maybeString = false;

        for (let i = 0, len = sequenceArray.length; i < len; i++) {
            const item = sequenceArray[i];

            const preItem = sequenceArray[i - 1];

            const { segment, currentString } = item;

            if (currentString === matchToken.DOUBLE_QUOTATION) {
                maybeString = true;
            }

            if ((segment !== '' || i === 0) && i !== len - 1) {
                sequenceNodes.push(currentString);
                continue;
            }

            let preSegment = preItem?.segment || '';

            let startIndex = i - preSegment.length;

            let endIndex = i - 1;

            let deleteEndIndex = i - 1;

            if (i === len - 1 && this._isLastMergeString(currentString)) {
                preSegment += currentString;

                endIndex += 1;
            }

            if (preSegment === '' || OPERATOR_TOKEN_PRIORITY.has(preSegment)) {
                sequenceNodes.push(currentString);
                continue;
            }

            const preSegmentTrim = preSegment.trim();

            const preSegmentNotPrefixToken = this._replacePrefixString(preSegmentTrim);

            if (maybeString === true && preSegmentTrim[preSegmentTrim.length - 1] === matchToken.DOUBLE_QUOTATION) {
                maybeString = false;
                this._processPushSequenceNode(sequenceNodes, sequenceNodeType.STRING, preSegment, startIndex, endIndex, deleteEndIndex);
            } else if (new RegExp(REFERENCE_SINGLE_RANGE_REGEX).test(preSegmentNotPrefixToken) && isReferenceStringWithEffectiveColumn(preSegmentNotPrefixToken)) {
                /**
                 * =-A1  Separate the negative sign from the ref string.
                 */
                if (preSegmentNotPrefixToken.length !== preSegmentTrim.length) {
                    const minusCount = preSegmentTrim.length - preSegmentNotPrefixToken.length;
                    deleteEndIndex += minusCount;
                    startIndex += minusCount;

                    preSegment = this._replacePrefixString(preSegment);
                }
                this._processPushSequenceNode(sequenceNodes, sequenceNodeType.REFERENCE, preSegment, startIndex, endIndex, deleteEndIndex);
            } else if (Tools.isStringNumber(preSegmentTrim)) {
                this._processPushSequenceNode(sequenceNodes, sequenceNodeType.NUMBER, preSegment, startIndex, endIndex, deleteEndIndex);
            } else if (preSegmentTrim.length > 0) {
                this._processPushSequenceNode(sequenceNodes, sequenceNodeType.FUNCTION, preSegment, startIndex, endIndex, deleteEndIndex);
            }

            if (i !== len - 1 || !this._isLastMergeString(currentString)) {
                sequenceNodes.push(currentString);
            }
        }

        return this._mergeSequenceNodeReference(sequenceNodes);
    }

    private _processPushSequenceNode(sequenceNodes: (string | ISequenceNode)[], nodeType: sequenceNodeType, token: string, startIndex: number, endIndex: number, deleteEndIndex: number) {
        this._pushSequenceNode(
            sequenceNodes,
            {
                nodeType,
                token,
                startIndex,
                endIndex,
            },
            deleteEndIndex
        );
    }

    private _getCurrentParamIndex(formulaString: string, index: number) {
        return this._nodeMaker(formulaString, undefined, index);
    }

    private _isLastMergeString(str: string) {
        return str === matchToken.DOUBLE_QUOTATION || Tools.isStringNumber(str) || !isFormulaLexerToken(str);
    }

    /**
     * Merge array and handle ref operations
     *
     */
    private _mergeSequenceNodeReference(sequenceNodes: Array<string | ISequenceNode>) {
        const newSequenceNodes: Array<string | ISequenceNode> = [];

        const sequenceNodesCount = sequenceNodes.length;

        let i = 0;
        while (i < sequenceNodesCount) {
            const node = sequenceNodes[i];

            if (typeof node === 'string') {
                const preNode = sequenceNodes[i - 1];
                if (
                    node.trim() === matchToken.CLOSE_BRACES &&
                    preNode != null &&
                    typeof preNode !== 'string' &&
                    preNode.nodeType === sequenceNodeType.FUNCTION
                ) {
                    /**
                     * Solving the merging issue of ['{1,2,3;4,5,6;7,8,10', '}']
                     */
                    const firstChar = preNode.token.trim().substring(0, 1);

                    if (firstChar === matchToken.OPEN_BRACES) {
                        preNode.nodeType = sequenceNodeType.ARRAY;
                        preNode.token += node;
                        preNode.endIndex += node.length;
                        i++;
                        continue;
                    }
                }
                newSequenceNodes.push(node);
            } else {
                const nextOneNode = sequenceNodes[i + 1];

                const nextTwoNode = sequenceNodes[i + 2];

                if (
                    nextOneNode === matchToken.COLON &&
                    typeof node !== 'string' &&
                    nextTwoNode != null &&
                    typeof nextTwoNode !== 'string' &&
                    isReferenceStringWithEffectiveColumn((node.token + nextOneNode + nextTwoNode.token).trim())
                ) {
                    node.nodeType = sequenceNodeType.REFERENCE;
                    node.token += nextOneNode + nextTwoNode.token;
                    node.endIndex = nextTwoNode.endIndex;
                    i += 2;
                }

                newSequenceNodes.push(node);
            }

            i++;
        }

        return newSequenceNodes;
    }

    private _pushSequenceNode(
        sequenceNodes: Array<ISequenceNode | string>,
        node: ISequenceNode,
        deleteEndIndex: number
    ) {
        const segmentCount = deleteEndIndex - node.startIndex + 1;
        sequenceNodes.splice(sequenceNodes.length - segmentCount, segmentCount, node);
    }

    private _replacePrefixString(token: string) {
        const tokenArray = [];
        let isNotPreFix = false;
        for (let i = 0, len = token.length; i < len; i++) {
            const char = token[i];
            if (char === SPACE_TOKEN && !isNotPreFix) {
                tokenArray.push(char);
            } else if (!isNotPreFix && (char === prefixToken.AT || char === prefixToken.MINUS)) {
                continue;
            } else {
                tokenArray.push(char);
                isNotPreFix = true;
            }
        }
        return tokenArray.join('');
    }

    nodeMakerTest(formulaString: string) {
        return this._nodeMaker(formulaString);
    }

    treeBuilder(
        formulaString: string,
        transformSuffix = true,
        injectDefinedName?: (sequenceArray: ISequenceArray[]) => {
            sequenceString: string;
            hasDefinedName: boolean;
            definedNames: string[];
        },
        simpleCheckDefinedName?: (formulaString: string) => boolean
    ) {
        if (transformSuffix === true) {
            const lexerNode = FormulaLexerNodeCache.get(formulaString);
            const simpleCheckDefinedNameResult = simpleCheckDefinedName?.(formulaString);
            if (lexerNode && !simpleCheckDefinedNameResult) {
                return lexerNode;
            }
        }

        this._resetCurrentLexerNode();
        this._currentLexerNode.setToken(DEFAULT_TOKEN_TYPE_ROOT);
        const sequenceArray: ISequenceArray[] = [];

        let state = this._nodeMaker(formulaString, sequenceArray);

        if (state === ErrorType.VALUE || sequenceArray.length === 0) {
            return state;
        }

        let currentHasDefinedName = false;

        let currentSequenceString = '';

        let currentDefinedNames: string[] = [];

        if (injectDefinedName) {
            const { hasDefinedName, sequenceString, definedNames } = injectDefinedName(sequenceArray);
            currentHasDefinedName = hasDefinedName;
            currentSequenceString = sequenceString;
            currentDefinedNames = definedNames;
        }

        /**
         * If there is a custom name in the formula string,
         * replace the custom name with the corresponding character content and rebuild the formula.
         */
        if (currentHasDefinedName) {
            this._resetCurrentLexerNode();
            this._currentLexerNode.setToken(DEFAULT_TOKEN_TYPE_ROOT);
            state = this._nodeMaker(`=${currentSequenceString}`);
            if (state === ErrorType.VALUE) {
                return state;
            }
        }

        const node = this._getTopNode(this._currentLexerNode);
        if (node) {
            this._currentLexerNode = node;
        }

        if (transformSuffix) {
            const isValid = this._suffixExpressionHandler(this._currentLexerNode);
            if (!isValid) {
                return ErrorType.VALUE;
            }
            FormulaLexerNodeCache.set(formulaString, this._currentLexerNode);
        }

        if (currentHasDefinedName) {
            this._currentLexerNode.setDefinedNames(currentDefinedNames);
        }

        return this._currentLexerNode;
    }

    private _suffixExpressionHandler(lexerNode: LexerNode) {
        const children = lexerNode.getChildren();
        if (!children) {
            return false;
        }
        const childrenCount = children.length;

        const baseStack: Array<string | LexerNode> = []; // S2
        const symbolStack: string[] = []; // S1
        for (let i = 0; i < childrenCount; i++) {
            const node = children[i];
            if (!(node instanceof LexerNode)) {
                const char = node.trim();
                if (char === '') {
                    continue;
                }

                if (OPERATOR_TOKEN_SET.has(char)) {
                    // fix =-(+2)+2
                    if (char === operatorToken.PLUS && this._deletePlusForPreNode(children[i - 1])) {
                        continue;
                    }
                    // =-(2)+*9, return error
                    if (char !== operatorToken.PLUS && char !== operatorToken.MINUS && this._deletePlusForPreNode(children[i - 1])) {
                        return false;
                    }
                    while (symbolStack.length > 0) {
                        const lastSymbol = symbolStack[symbolStack.length - 1]?.trim();
                        if (!lastSymbol || lastSymbol === matchToken.OPEN_BRACKET) {
                            break;
                        }

                        const lastSymbolPriority = OPERATOR_TOKEN_PRIORITY.get(lastSymbol);
                        const charPriority = OPERATOR_TOKEN_PRIORITY.get(char);

                        if (!lastSymbolPriority || !charPriority) {
                            break;
                        }

                        if (charPriority >= lastSymbolPriority) {
                            baseStack.push(symbolStack.pop()!);
                        } else {
                            break;
                        }
                    }
                    symbolStack.push(node as string);
                } else if (char === matchToken.OPEN_BRACKET) {
                    symbolStack.push(node as string);
                } else if (char === matchToken.CLOSE_BRACKET) {
                    // =()+9, return error
                    this._processSuffixExpressionCloseBracket(baseStack, symbolStack, children, i);
                } else {
                     // =(1+3)9, return error
                    if (this._checkCloseBracket(children[i - 1])) {
                        return false;
                    }
                    baseStack.push(node as string);
                }
            } else {
                this._suffixExpressionHandler(node as LexerNode);
                baseStack.push(node);
            }
        }

        return this._processSuffixExpressionRemain(baseStack, symbolStack, lexerNode);
    }

    private _processSuffixExpressionRemain(baseStack: (string | LexerNode)[], symbolStack: string[], lexerNode: LexerNode) {
        const baseStackLength = baseStack.length;
        const lastBaseStack = baseStack[baseStackLength - 1];
        while (symbolStack.length > 0) {
            const symbol = symbolStack.pop()!;
            if (!(lastBaseStack instanceof LexerNode) && (symbol === matchToken.OPEN_BRACKET || symbol === matchToken.CLOSE_BRACKET)) {
                return false;
            }
            baseStack.push(symbol);
        }
        lexerNode.setChildren(baseStack);
        return true;
    }

    private _processSuffixExpressionCloseBracket(baseStack: (string | LexerNode)[], symbolStack: string[], children: (string | LexerNode)[], i: number) {
        if (this._checkOpenBracket(children[i - 1])) {
            return false;
        }

        // =1+(1*)
        if (this._checkOperator(children[i - 1])) {
            return false;
        }

        while (symbolStack.length > 0) {
            const lastSymbol = symbolStack[symbolStack.length - 1]?.trim();
            if (!lastSymbol) {
                break;
            }

            if (lastSymbol === matchToken.OPEN_BRACKET) {
                symbolStack.pop();
                break;
            }

            baseStack.push(symbolStack.pop()!);
        }
    }

    private _checkCloseBracket(node: Nullable<string | LexerNode>) {
        return node === matchToken.CLOSE_BRACKET;
    }

    private _checkOpenBracket(node: Nullable<string | LexerNode>) {
        return node === matchToken.OPEN_BRACKET;
    }

    private _checkOperator(node: Nullable<string | LexerNode>) {
        if (node == null) {
            return false;
        }

        if (node instanceof LexerNode) {
            return false;
        }

        return OPERATOR_TOKEN_SET.has(node);
    }

    private _deletePlusForPreNode(preNode: Nullable<string | LexerNode>) {
        if (preNode == null) {
            return true;
        }

        if (!(preNode instanceof LexerNode)) {
            const preChar = preNode.trim();
            if (OPERATOR_TOKEN_SET.has(preChar) || preChar === matchToken.OPEN_BRACKET) {
                return true;
            }
        }

        return false;
    }

    private _resetCurrentLexerNode() {
        this._currentLexerNode = new LexerNode();
    }

    private _resetSegment() {
        this._segment = '';
    }

    private _openBracket(type: bracketType = bracketType.NORMAL) {
        this._bracketState.push(type);
    }

    private _closeBracket() {
        this._bracketState.pop();
    }

    private _openSquareBracket() {
        this._squareBracketState += 1;
    }

    private _closeSquareBracket() {
        this._squareBracketState -= 1;
    }

    private _getCurrentBracket() {
        const bracketState = this._bracketState;
        return bracketState[bracketState.length - 1];
    }

    private _changeCurrentBracket(type: bracketType) {
        const bracketState = this._bracketState;
        bracketState[bracketState.length - 1] = type;
    }

    private _openBraces() {
        this._bracesState += 1;
    }

    private _closeBraces() {
        this._bracesState -= 1;
    }

    private _openSingleQuotation() {
        this._singleQuotationState += 1;
    }

    private _closeSingleQuotation() {
        this._singleQuotationState -= 1;
    }

    private _openDoubleQuotation() {
        this._doubleQuotationState += 1;
    }

    private _closeDoubleQuotation() {
        this._doubleQuotationState -= 1;
    }

    private _openLambda() {
        this._lambdaState = true;
    }

    private _closeLambda() {
        this._lambdaState = false;
    }

    private _openColon(upLevel: number) {
        this._upLevel = upLevel;
        this._colonState = true;
    }

    private _closeColon() {
        this._upLevel = 0;
        this._colonState = false;
    }

    private _isTableBracket() {
        return this._tableBracketState;
    }

    private _openTableBracket() {
        this._tableBracketState = true;
    }

    private _closeTableBracket() {
        this._tableBracketState = false;
    }

    private _getLastChildCurrentLexerNode() {
        const children = this._currentLexerNode.getChildren();
        if (children && children.length > 0) {
            const lastNode = children[children.length - 1];
            if (lastNode instanceof LexerNode) {
                return lastNode;
            }
        }
        return false;
    }

    private _getLastChildCurrent() {
        const children = this._currentLexerNode.getChildren();
        if (children && children.length > 0) {
            const lastNode = children[children.length - 1];
            return lastNode;
        }
        return false;
    }

    private _setParentCurrentLexerNode() {
        const parent = this._currentLexerNode.getParent();
        if (parent) {
            this._currentLexerNode = parent;
            return true;
        }

        return false;
    }

    private _setAncestorCurrentLexerNode() {
        const parent = this._currentLexerNode?.getParent();
        let state = false;
        if (parent && parent.getToken() === DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER) {
            // lambda will skip to more one level
            if (parent?.getParent()?.getParent()) {
                const node = this._currentLexerNode.getParent()?.getParent()?.getParent();
                if (node) {
                    this._currentLexerNode = node;
                }
                state = true;
            }
        } else {
            if (parent?.getParent()) {
                const node = this._currentLexerNode.getParent()?.getParent();
                if (node) {
                    this._currentLexerNode = node;
                }
                state = true;
            }
        }

        for (let i = 0; i < this._upLevel; i++) {
            const node = this._currentLexerNode?.getParent();
            if (node) {
                this._currentLexerNode = node;
            }
            if (this._currentLexerNode) {
                state = true;
            } else {
                state = false;
            }
        }

        return state;
    }

    private _segmentCount() {
        return this._segment.trim().length;
    }

    private _pushSegment(value: string) {
        this._segment += value;
    }

    private _pushNodeToChildren(value: LexerNode | string, isUnshift = false) {
        if (value !== '') {
            const children = this._currentLexerNode.getChildren();
            if (!(value instanceof LexerNode) && this.isColonOpen()) {
                const subLexerNode_ref = new LexerNode();
                subLexerNode_ref.setToken(value);
                subLexerNode_ref.setParent(this._currentLexerNode);

                value = subLexerNode_ref;
            }
            if (isUnshift) {
                children.unshift(value);
            } else {
                children.push(value);
            }
        }

        if (this.isColonOpen()) {
            this._setAncestorCurrentLexerNode();
            this._closeColon(); /*  */
        }
    }

    private _setCurrentLexerNode(subLexerNode: LexerNode, isUnshift = false) {
        this._pushNodeToChildren(subLexerNode, isUnshift);
        subLexerNode.setParent(this._currentLexerNode);
        this._currentLexerNode = subLexerNode;
    }

    private _newAndPushCurrentLexerNode(token: string, current: number, isUnshift = false) {
        const subLexerNode = new LexerNode();
        subLexerNode.setToken(token);
        subLexerNode.setIndex(current - token.length, current - 1);
        this._setCurrentLexerNode(subLexerNode, isUnshift);
    }

    private _getTopNode(lexerNode: LexerNode) {
        let parentNode: Nullable<LexerNode> = lexerNode;
        while (parentNode?.getParent()) {
            parentNode = parentNode.getParent();
        }
        return parentNode;
    }

    private _removeLastChild() {
        const children = this._currentLexerNode.getChildren();
        children.splice(-1);
    }

    private _findPreviousToken(data: string[], index: number) {
        while (index >= 0) {
            const token = data[index];
            if (token !== ' ') {
                return token;
            }
            index--;
        }
    }

    private _negativeCondition(prevString: string) {
        if (
            OPERATOR_TOKEN_SET.has(prevString) ||
            prevString === matchToken.OPEN_BRACKET ||
            prevString === matchToken.COMMA ||
            prevString === ''
        ) {
            return true;
        }
        return false;
    }

    private _getSequenceArray(formulaString: string) {
        const sequenceArray: ISequenceArray[] = [];

        this._nodeMaker(formulaString, sequenceArray);

        return sequenceArray;
    }

    private _resetTemp() {
        this._currentLexerNode = new LexerNode();

        this._upLevel = 0;

        this._segment = '';

        this._bracketState = []; // ()

        this._bracesState = 0; // {}

        this._singleQuotationState = 0; // ''

        this._doubleQuotationState = 0; // ""

        this._lambdaState = false; // Lambda

        this._colonState = false; // :
    }

    private _checkSimilarErrorToken(currentString: string, cur: number, formulaStringArray: string[]) {
        if (currentString !== suffixToken.POUND) {
            return true;
        }

        let currentText = formulaStringArray[++cur];

        while (currentText === ' ') {
            currentText = formulaStringArray[++cur];
        }

        if (isFormulaLexerToken(currentText)) {
            return true;
        }

        return false;
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _nodeMaker(formulaString: string, sequenceArray?: ISequenceArray[], matchCurrentNodeIndex?: number) {
        if (formulaString.substring(0, 1) === operatorToken.EQUALS) {
            formulaString = formulaString.substring(1);
        }

        let isZeroAdded = false;
        if (formulaString.substring(0, 1) === operatorToken.MINUS) {
            formulaString = `0${formulaString}`;
            isZeroAdded = true;
        }

        const formulaStringArray = formulaString.split('');
        const formulaStringArrayCount = formulaStringArray.length;
        let cur = 0;
        this._resetTemp();
        while (cur < formulaStringArrayCount) {
            const currentString = formulaStringArray[cur];

            if (matchCurrentNodeIndex === cur) {
                return [this._currentLexerNode, currentString];
            }

            if (
                currentString === matchToken.OPEN_BRACKET &&
                this.isSingleQuotationClose() &&
                this.isDoubleQuotationClose()
            ) {
                if (this._segmentCount() > 0 || this.isLambdaOpen()) {
                    if (this.isLambdaClose()) {
                        this._newAndPushCurrentLexerNode(this._segment, cur);
                        this._resetSegment();
                    }

                    this._openBracket(bracketType.FUNCTION);
                    this._closeLambda();

                    const nextCurrentString = formulaStringArray[cur + 1];
                    if (nextCurrentString && nextCurrentString === matchToken.CLOSE_BRACKET) {
                        // when function has not parameter, return to parentNode , e.g. row()
                        if (!this._setParentCurrentLexerNode() && cur !== formulaStringArrayCount - 1) {
                            return ErrorType.VALUE;
                        }
                        /**
                         * https://github.com/dream-num/univer/issues/1769
                         * Formula example: =IF(TODAY()>1,"TRUE", "FALSE")
                         * Copy or auto-fill at complex formula get error formula offset
                         */

                        this._addSequenceArray(sequenceArray, currentString, cur, isZeroAdded);
                        cur++;
                        this._addSequenceArray(sequenceArray, nextCurrentString, cur, isZeroAdded);
                        cur++;
                        this._closeBracket();
                        continue;
                    } else if (nextCurrentString) {
                        this._newAndPushCurrentLexerNode(DEFAULT_TOKEN_TYPE_PARAMETER, cur);
                    }
                } else {
                    this._pushNodeToChildren(currentString);
                    this._openBracket(bracketType.NORMAL);
                }
            } else if (
                currentString === matchToken.CLOSE_BRACKET &&
                this.isSingleQuotationClose() &&
                this.isDoubleQuotationClose()
            ) {
                this._pushNodeToChildren(this._segment);
                this._resetSegment();
                const currentBracket = this._getCurrentBracket();
                if (currentBracket === bracketType.NORMAL) {
                    this._pushNodeToChildren(currentString);
                } else if (currentBracket === bracketType.FUNCTION) {
                    // function close
                    const nextCurrentString = formulaStringArray[cur + 1];
                    if (nextCurrentString && nextCurrentString === matchToken.OPEN_BRACKET) {
                        // lambda handler, e.g. =lambda(x,y, x*y*x)(1,2)
                        if (!this._setParentCurrentLexerNode() && cur !== formulaStringArrayCount - 1) {
                            return ErrorType.VALUE;
                        }

                        this._newAndPushCurrentLexerNode(DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER, cur, true);
                        this._openLambda();
                    } else {
                        if (!this._setAncestorCurrentLexerNode() && cur !== formulaStringArrayCount - 1) {
                            return ErrorType.VALUE;
                        }
                    }
                } else {
                    return ErrorType.VALUE;
                }
                this._closeBracket();
            } else if (
                currentString === matchToken.OPEN_BRACES &&
                this.isSingleQuotationClose() &&
                this.isDoubleQuotationClose()
            ) {
                this._pushSegment(currentString);
                this._openBraces();
            } else if (
                currentString === matchToken.CLOSE_BRACES &&
                this.isSingleQuotationClose() &&
                this.isDoubleQuotationClose()
            ) {
                this._pushSegment(currentString);
                this._pushNodeToChildren(this._segment);
                this._resetSegment();
                this._closeBraces();
            } else if (
                currentString === matchToken.OPEN_SQUARE_BRACKET &&
                this.isSingleQuotationClose() &&
                this.isDoubleQuotationClose()
            ) {
                if (this._segment.length > 0) {
                    this._openTableBracket();
                }
                this._pushSegment(currentString);
                this._openSquareBracket();
            } else if (
                currentString === matchToken.CLOSE_SQUARE_BRACKET &&
                this.isSingleQuotationClose() &&
                this.isDoubleQuotationClose()
            ) {
                this._closeSquareBracket();
                if (this.isSquareBracketClose()) {
                    this._pushSegment(currentString);
                    if (this._isTableBracket()) {
                        this._pushNodeToChildren(this._segment);
                        this._resetSegment();
                    }
                    this._closeTableBracket();
                } else {
                    this._pushSegment(currentString);
                }
            } else if (
                currentString === matchToken.DOUBLE_QUOTATION &&
                this.isSingleQuotationClose() &&
                this.isBracesClose() &&
                this.isSquareBracketClose()
            ) {
                if (this.isDoubleQuotationClose()) {
                    this._openDoubleQuotation();
                } else {
                    const nextCurrentString = formulaStringArray[cur + 1];
                    if (nextCurrentString && nextCurrentString === matchToken.DOUBLE_QUOTATION) {
                        cur++;
                    } else {
                        this._closeDoubleQuotation();
                    }
                }
                // this._pushNodeToChildren(currentString);
                this._pushSegment(currentString);
            } else if (currentString === matchToken.SINGLE_QUOTATION && this.isDoubleQuotationClose()) {
                if (this.isSingleQuotationClose()) {
                    this._openSingleQuotation();
                } else {
                    const nextCurrentString = formulaStringArray[cur + 1];
                    if (nextCurrentString && nextCurrentString === matchToken.SINGLE_QUOTATION) {
                        cur++;
                    } else {
                        this._closeSingleQuotation();
                    }
                }
                // this._pushNodeToChildren(currentString);
                this._pushSegment(currentString);
            } else if (
                currentString === matchToken.COMMA &&
                this.isSingleQuotationClose() &&
                this.isDoubleQuotationClose() &&
                this.isBracesClose() &&
                this.isSquareBracketClose()
            ) {
                const currentBracket = this._getCurrentBracket();
                /**
                 * Handle the occurrence of commas, where in the formula,
                 * the comma represents the parameters of the function
                 * [currentBracket == null] is for the situation where [=A1:B1, B5:A10] occurs
                 */
                if (currentBracket === bracketType.FUNCTION || currentBracket == null) {
                    this._pushNodeToChildren(this._segment);
                    this._resetSegment();
                    if (
                        !this._setParentCurrentLexerNode() &&
                        cur !== formulaStringArrayCount - 1 &&
                        currentBracket != null
                    ) {
                        return ErrorType.VALUE;
                    }

                    this._newAndPushCurrentLexerNode(DEFAULT_TOKEN_TYPE_PARAMETER, cur);
                } else {
                    /**
                     * support cubeValueObject for =INDEX((A6:B6,C6:D7),1,1,2)
                     */
                    const cubeNode = new LexerNode();
                    cubeNode.setToken(DEFAULT_TOKEN_CUBE_FUNCTION_NAME);
                    const cubeParamNode = new LexerNode();
                    cubeParamNode.setToken(DEFAULT_TOKEN_TYPE_PARAMETER);
                    cubeParamNode.changeToParent(cubeNode);

                    const colonNode = this._currentLexerNode.getParent();

                    if (colonNode && colonNode.getToken() === matchToken.COLON) {
                        const colonNodeParent = colonNode.getParent();
                        if (!colonNodeParent) {
                            return ErrorType.VALUE;
                        }

                        colonNode.changeToParent(cubeParamNode);
                        colonNodeParent.setChildren([]);
                        cubeNode.changeToParent(colonNodeParent);
                    } else {
                        return ErrorType.VALUE;
                    }

                    this._changeCurrentBracket(bracketType.FUNCTION);
                    this._pushNodeToChildren(this._segment);
                    this._resetSegment();
                    this._currentLexerNode = cubeNode;
                    this._newAndPushCurrentLexerNode(DEFAULT_TOKEN_TYPE_PARAMETER, cur);
                }
            } else if (
                currentString === matchToken.COLON &&
                this.isSingleQuotationClose() &&
                this.isDoubleQuotationClose() &&
                this.isBracesClose() &&
                this.isSquareBracketClose()
            ) {
                const subLexerNode_op = new LexerNode();
                subLexerNode_op.setToken(currentString);

                const subLexerNode_left = new LexerNode();
                subLexerNode_left.setToken(DEFAULT_TOKEN_TYPE_PARAMETER);
                subLexerNode_left.setParent(subLexerNode_op);

                const subLexerNode_right = new LexerNode();
                subLexerNode_right.setToken(DEFAULT_TOKEN_TYPE_PARAMETER);
                subLexerNode_right.setParent(subLexerNode_op);

                subLexerNode_op.getChildren().push(subLexerNode_left, subLexerNode_right);

                let subLexerNode_main = subLexerNode_op;
                let upLevel = 0;
                if (this._segmentCount() > 0) {
                    // e.g. A1:B5
                    // -@A4:B5
                    let subLexerNode_minus: Nullable<LexerNode>;
                    let subLexerNode_at: Nullable<LexerNode>;
                    let sliceLength = 0;
                    const segmentTrim = this._segment.trim();
                    const lastString = segmentTrim[0];
                    const twoLastString = segmentTrim[1];

                    // new RegExp(prefixToken.MINUS, 'g').test(this._segment)
                    if (lastString === prefixToken.MINUS) {
                        subLexerNode_minus = new LexerNode();
                        subLexerNode_minus.setToken(prefixToken.MINUS);
                        sliceLength++;
                    }

                    // new RegExp(prefixToken.AT, 'g').test(this._segment)
                    if (lastString === prefixToken.AT || twoLastString === prefixToken.AT) {
                        subLexerNode_at = new LexerNode();
                        subLexerNode_at.setToken(prefixToken.AT);

                        if (subLexerNode_minus) {
                            subLexerNode_minus.addChildren(subLexerNode_at);
                            subLexerNode_at.setParent(subLexerNode_minus);
                        }

                        sliceLength++;
                    }

                    if (sliceLength > 0) {
                        this._segment = segmentTrim.slice(sliceLength);
                    }

                    upLevel = sliceLength;

                    if (subLexerNode_at) {
                        subLexerNode_at.addChildren(subLexerNode_op);
                        subLexerNode_op.setParent(subLexerNode_at);
                        if (subLexerNode_at.getParent()) {
                            const node = subLexerNode_at.getParent();
                            if (node) {
                                subLexerNode_main = node;
                            }
                        } else {
                            subLexerNode_main = subLexerNode_at;
                        }
                    } else if (subLexerNode_minus) {
                        subLexerNode_main = subLexerNode_minus;
                        subLexerNode_minus.addChildren(subLexerNode_op);
                        subLexerNode_op.setParent(subLexerNode_minus);
                    }

                    const subLexerNode_ref = new LexerNode();
                    subLexerNode_ref.setToken(this._segment);
                    subLexerNode_ref.setParent(subLexerNode_left);

                    subLexerNode_left.getChildren().push(subLexerNode_ref);
                    this._resetSegment();
                } else {
                    // e.g. indirect("A5"):B10
                    const lastChildNode = this._getLastChildCurrentLexerNode();
                    if (lastChildNode) {
                        lastChildNode.changeToParent(subLexerNode_left);
                    }
                }

                this._setCurrentLexerNode(subLexerNode_main);
                this._currentLexerNode = subLexerNode_right;
                this._openColon(upLevel);
            } else if (
                SUFFIX_TOKEN_SET.has(currentString) &&
                this._checkSimilarErrorToken(currentString, cur, formulaStringArray) &&
                this.isSingleQuotationClose() &&
                this.isDoubleQuotationClose() &&
                this.isSquareBracketClose()
            ) {
                this._pushNodeToChildren(this._segment);

                // this._pushNodeToChildren(currentString);

                const subLexerNode = new LexerNode();
                subLexerNode.setToken(currentString);

                const lastChildNode = this._getLastChildCurrent();
                if (lastChildNode instanceof LexerNode) {
                    lastChildNode.changeToParent(subLexerNode);
                } else if (lastChildNode !== false) {
                    subLexerNode.getChildren().push(lastChildNode);
                    this._removeLastChild();
                }

                this._pushNodeToChildren(subLexerNode);
                subLexerNode.setParent(this._currentLexerNode);

                this._resetSegment();
            } else if (
                OPERATOR_TOKEN_SET.has(currentString) &&
                this.isSingleQuotationClose() &&
                this.isDoubleQuotationClose() &&
                this.isSquareBracketClose()
            ) {
                let trimSegment = this._segment.trim();

                if (currentString === operatorToken.MINUS && (trimSegment === '')) {
                    // negative number
                    const prevString = this._findPreviousToken(formulaStringArray, cur - 1) || '';
                    if (this._negativeCondition(prevString)) {
                        this._pushSegment(operatorToken.MINUS);
                        this._addSequenceArray(sequenceArray, currentString, cur, isZeroAdded);

                        cur++;
                        continue;
                    }
                } else if (this._segment.length > 0 && this._isScientificNotation(formulaStringArray, cur, currentString)) {
                    this._pushSegment(currentString);

                    this._addSequenceArray(sequenceArray, currentString, cur, isZeroAdded);

                    cur++;
                    continue;
                } else if (this._segment.length > 0 && trimSegment === '') {
                    trimSegment = this._segment;
                } else {
                    this._pushNodeToChildren(this._segment);
                    trimSegment = '';
                }

                if (currentString === operatorToken.LESS_THAN || currentString === operatorToken.GREATER_THAN) {
                    const nextCurrentString = formulaStringArray[cur + 1];
                    if (nextCurrentString && OPERATOR_TOKEN_SET.has(currentString + nextCurrentString)) {
                        this._pushNodeToChildren(trimSegment + currentString + nextCurrentString);
                        cur++;
                    } else {
                        this._pushNodeToChildren(trimSegment + currentString);
                    }
                } else {
                    this._pushNodeToChildren(trimSegment + currentString);
                }
                this._resetSegment();
            } else {
                this._pushSegment(currentString);
            }

            this._addSequenceArray(sequenceArray, currentString, cur, isZeroAdded);
            cur++;
        }

        this._pushNodeToChildren(this._segment);
    }

    private _isScientificNotation(formulaStringArray: string[], cur: number, currentString: string) {
        const preTwoChar = formulaStringArray[cur - 2];
        if (preTwoChar && Number.isNaN(Number(preTwoChar))) {
            return false;
        }

        if (!(currentString === operatorToken.MINUS || currentString === operatorToken.PLUS)) {
            return false;
        }

        const nextOneChar = formulaStringArray[cur + 1];
        if (nextOneChar && Number.isNaN(Number(nextOneChar))) {
            return false;
        }

        const preOneChar = formulaStringArray[cur - 1];
        return preOneChar && preOneChar.toUpperCase() === 'E';
    }

    private _addSequenceArray(sequenceArray: ISequenceArray[] | undefined, currentString: string, cur: number, isZeroAdded: boolean) {
        if (!(isZeroAdded && cur === 0)) {
            sequenceArray?.push({
                segment: this._segment,
                currentString,
                cur,
                currentLexerNode: this._currentLexerNode,
            });
        }
    }
}
