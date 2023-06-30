import { Nullable } from '@univerjs/core';
import { ErrorType } from '../Basics/ErrorType';
import { DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER, DEFAULT_TOKEN_TYPE_PARAMETER, DEFAULT_TOKEN_TYPE_ROOT } from '../Basics/TokenType';
import { LexerNode } from './LexerNode';
import { operatorToken, matchToken, OPERATOR_TOKEN_SET, OPERATOR_TOKEN_PRIORITY, SUFFIX_TOKEN_SET, prefixToken } from '../Basics/Token';

enum bracketType {
    NORMAL,
    FUNCTION,
    LAMBDA,
}

export class LexerTreeMaker {
    private _currentLexerNode: LexerNode;

    private _upLevel = 0;

    private _segment = '';

    private _bracketState: bracketType[] = []; // ()

    private _bracesState = 0; // {}

    private _singleQuotationState = 0; // ''

    private _doubleQuotationState = 0; // ""

    private _lambdaState = false; // Lambda

    private _colonState = false; // :

    constructor(private _formulaString: string) {}

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

    getCurrentLexerNode() {
        return this._currentLexerNode;
    }

    treeMaker() {
        this._resetCurrentLexerNode();

        this._currentLexerNode.setToken(DEFAULT_TOKEN_TYPE_ROOT);

        const state = this._nodeMaker(this._formulaString);

        // console.log('error', state);

        this._currentLexerNode = this._getTopNode(this._currentLexerNode);

        return this._currentLexerNode;
    }

    suffixExpressionHandler(lexerNode: LexerNode) {
        const children = lexerNode.getChildren();
        if (!children) {
            return;
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

                        if (charPriority > lastSymbolPriority) {
                            baseStack.push(symbolStack.pop()!);
                        } else {
                            break;
                        }
                    }
                    symbolStack.push(node as string);
                } else if (char === matchToken.OPEN_BRACKET) {
                    symbolStack.push(node as string);
                } else if (char === matchToken.CLOSE_BRACKET) {
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
                } else {
                    baseStack.push(node as string);
                }
            } else {
                this.suffixExpressionHandler(node as LexerNode);
                baseStack.push(node);
            }
        }
        while (symbolStack.length > 0) {
            baseStack.push(symbolStack.pop()!);
        }
        lexerNode.setChildren(baseStack);
    }

    private _resetCurrentLexerNode() {
        this._currentLexerNode = new LexerNode();
    }

    private _resetSegment() {
        this._segment = '';
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

    private _openBracket(type: bracketType = bracketType.NORMAL) {
        this._bracketState.push(type);
    }

    private _closeBracket() {
        this._bracketState.pop();
    }

    private _getCurrentBracket() {
        const bracketState = this._bracketState;
        return bracketState[bracketState.length - 1];
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
                this._currentLexerNode = this._currentLexerNode.getParent()?.getParent().getParent();
                state = true;
            }
        } else {
            if (parent?.getParent()) {
                this._currentLexerNode = this._currentLexerNode.getParent().getParent();
                state = true;
            }
        }

        for (let i = 0; i < this._upLevel; i++) {
            this._currentLexerNode = this._currentLexerNode?.getParent();
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

    private _setCurrentLexerNode(subLexerNode: LexerNode, isUnshift = false) {
        this._pushNodeToChildren(subLexerNode, isUnshift);
        subLexerNode.setParent(this._currentLexerNode);
        this._currentLexerNode = subLexerNode;
    }

    private _newAndPushCurrentLexerNode(token: string, isUnshift = false) {
        const subLexerNode = new LexerNode();
        subLexerNode.setToken(token);
        this._setCurrentLexerNode(subLexerNode, isUnshift);
    }

    private _getTopNode(lexerNode: LexerNode) {
        let parentNode = lexerNode;
        while (parentNode.getParent()) {
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
        if (OPERATOR_TOKEN_SET.has(prevString) || prevString === matchToken.OPEN_BRACKET || prevString === matchToken.COMMA) {
            return true;
        }
        return false;
    }

    private _nodeMaker(formulaString: string) {
        if (formulaString.substring(0, 1) === operatorToken.EQUALS) {
            formulaString = formulaString.substring(1);
        }
        const formulaStringArray = formulaString.split('');
        const formulaStringArrayCount = formulaStringArray.length;
        let cur = 0;
        this._resetSegment();
        while (cur < formulaStringArrayCount) {
            const currentString = formulaStringArray[cur];
            if (currentString === matchToken.OPEN_BRACKET && this.isSingleQuotationClose() && this.isDoubleQuotationClose()) {
                if (this._segmentCount() > 0 || this.isLambdaOpen()) {
                    if (this.isLambdaClose()) {
                        // const subLexerNode = new LexerNode();
                        // subLexerNode.token = this._segment;
                        // this.setCurrentLexerNode(subLexerNode);
                        this._newAndPushCurrentLexerNode(this._segment);
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
                        cur++;
                    } else if (nextCurrentString) {
                        // const subLexerNode = new LexerNode();
                        // subLexerNode.token = DEFAULT_TOKEN_TYPE_PARAMETER;
                        // this.setCurrentLexerNode(subLexerNode);
                        this._newAndPushCurrentLexerNode(DEFAULT_TOKEN_TYPE_PARAMETER);
                    }
                } else {
                    this._pushNodeToChildren(currentString);
                    this._openBracket(bracketType.NORMAL);
                }
            } else if (currentString === matchToken.CLOSE_BRACKET && this.isSingleQuotationClose() && this.isDoubleQuotationClose()) {
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
                        // const subLexerNode = new LexerNode();
                        // subLexerNode.token = DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER;
                        // this.setCurrentLexerNode(subLexerNode);
                        this._newAndPushCurrentLexerNode(DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER, true);
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
            } else if (currentString === matchToken.OPEN_BRACES && this.isSingleQuotationClose() && this.isDoubleQuotationClose()) {
                this._pushSegment(currentString);
                this._openBraces();
            } else if (currentString === matchToken.CLOSE_BRACES && this.isSingleQuotationClose() && this.isDoubleQuotationClose()) {
                this._pushSegment(currentString);
                this._pushNodeToChildren(this._segment);
                this._resetSegment();
                this._closeBraces();
            } else if (currentString === matchToken.DOUBLE_QUOTATION && this.isSingleQuotationClose() && this.isBracesClose()) {
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
            } else if (currentString === matchToken.COMMA && this.isSingleQuotationClose() && this.isDoubleQuotationClose() && this.isBracesClose()) {
                const currentBracket = this._getCurrentBracket();
                if (currentBracket === bracketType.FUNCTION) {
                    this._pushNodeToChildren(this._segment);
                    this._resetSegment();
                    if (!this._setParentCurrentLexerNode() && cur !== formulaStringArrayCount - 1) {
                        return ErrorType.VALUE;
                    }
                    // const subLexerNode = new LexerNode();
                    // subLexerNode.token = DEFAULT_TOKEN_TYPE_PARAMETER;
                    // this.setCurrentLexerNode(subLexerNode);
                    this._newAndPushCurrentLexerNode(DEFAULT_TOKEN_TYPE_PARAMETER);
                } else {
                    return ErrorType.VALUE;
                }
            } else if (currentString === matchToken.COLON && this.isSingleQuotationClose() && this.isDoubleQuotationClose() && this.isBracesClose()) {
                // const subLexerNode = new LexerNode();
                // subLexerNode.token = currentString;
                // this.setCurrentLexerNode(subLexerNode);
                // this.newAndPushCurrentLexerNode(currentString);
                // this._resetSegment();

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
                    if (new RegExp(prefixToken.MINUS, 'g').test(this._segment)) {
                        subLexerNode_minus = new LexerNode();
                        subLexerNode_minus.setToken(prefixToken.MINUS);
                        sliceLength++;
                    }

                    if (new RegExp(prefixToken.AT, 'g').test(this._segment)) {
                        subLexerNode_at = new LexerNode();
                        subLexerNode_at.setToken(prefixToken.AT);

                        if (subLexerNode_minus) {
                            subLexerNode_minus.addChildren(subLexerNode_at);
                            subLexerNode_at.setParent(subLexerNode_minus);
                        }

                        sliceLength++;
                    }

                    if (sliceLength > 0) {
                        this._segment = this._segment.slice(sliceLength);
                    }

                    upLevel = sliceLength;

                    if (subLexerNode_at) {
                        subLexerNode_at.addChildren(subLexerNode_op);
                        subLexerNode_op.setParent(subLexerNode_at);
                        if (subLexerNode_at.getParent()) {
                            subLexerNode_main = subLexerNode_at.getParent();
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
            } else if (SUFFIX_TOKEN_SET.has(currentString) && this.isSingleQuotationClose() && this.isDoubleQuotationClose()) {
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
            } else if (OPERATOR_TOKEN_SET.has(currentString) && this.isSingleQuotationClose() && this.isDoubleQuotationClose()) {
                let trimSegment = this._segment.trim();

                if (currentString === operatorToken.MINUS && trimSegment === '') {
                    // negative number
                    const prevString = this._findPreviousToken(formulaStringArray, cur - 1) || '';
                    if (this._negativeCondition(prevString)) {
                        this._pushSegment(operatorToken.MINUS);
                        cur++;
                        continue;
                    }
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
            // console.log('func', { segment: this._segment, currentString, cur, currentLexerNode: this._currentLexerNode });
            cur++;
        }

        this._pushNodeToChildren(this._segment);
    }
}
