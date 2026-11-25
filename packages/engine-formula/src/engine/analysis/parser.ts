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

import type { Nullable } from '@univerjs/core';
import type { LambdaNode } from '../ast-node/lambda-node';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import { Disposable, Inject, Injector, sortRules } from '@univerjs/core';
import { AstNodePromiseType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { normalizeFunctionToken } from '../../basics/function';
import { isReferenceString } from '../../basics/regex';
import { operatorToken, prefixToken } from '../../basics/token';
import {
    DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME,
    DEFAULT_TOKEN_LET_FUNCTION_NAME,
    DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER,
    DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER,
    DEFAULT_TOKEN_TYPE_PARAMETER,
    DEFAULT_TOKEN_TYPE_ROOT,
    FORCED_RECALCULATION_FUNCTION_NAME,
} from '../../basics/token-type';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IDefinedNamesService } from '../../services/defined-names.service';
import { FormulaCacheService } from '../../services/formula-cache.service';
import { IFunctionService } from '../../services/function.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { AstRootNode, AstRootNodeFactory } from '../ast-node/ast-root-node';
import { BaseAstNode, ErrorNode } from '../ast-node/base-ast-node';
import { ErrorFunctionNode, FunctionNodeFactory } from '../ast-node/function-node';
import { LambdaNodeFactory } from '../ast-node/lambda-node';
import { LambdaParameterNode, LambdaParameterNodeFactory } from '../ast-node/lambda-parameter-node';
import { NodeType } from '../ast-node/node-type';
import { NullNode } from '../ast-node/null-node';
import { OperatorNode, OperatorNodeFactory } from '../ast-node/operator-node';
import { PrefixNodeFactory } from '../ast-node/prefix-node';
import { ReferenceNodeFactory } from '../ast-node/reference-node';
import { SuffixNodeFactory } from '../ast-node/suffix-node';
import { UnionNodeFactory } from '../ast-node/union-node';
import { ValueNodeFactory } from '../ast-node/value-node';
import { Interpreter } from '../interpreter/interpreter';
import { AsyncObject } from '../reference-object/base-reference-object';
import { generateExecuteAstNodeData, getAstNodeTopParent } from '../utils/ast-node-tool';
import { isChildRunTimeParameter, isFirstChildParameter } from '../utils/function-definition';
import { ErrorValueObject } from '../value-object/base-value-object';
import { LambdaValueObjectObject } from '../value-object/lambda-value-object';
import { Lexer } from './lexer';
import { LexerNode } from './lexer-node';

// Bound deferred calls before the JavaScript stack overflows; this is not Excel's recursion limit.
const MAX_NAMED_LAMBDA_CALL_DEPTH = 64;

class NamedLambdaCallNode extends BaseAstNode {
    constructor(
        token: string,
        private readonly _evaluate: (args: FunctionVariantType[], preserveReference: boolean) => FunctionVariantType | AsyncObject,
        private readonly _callee?: BaseAstNode
    ) {
        super(token);
        this._callee?.setParent(this);
    }

    override get nodeType() {
        return NodeType.FUNCTION;
    }

    override preservesReferenceInRangeEndpoint(child: BaseAstNode): boolean {
        return child !== this._callee;
    }

    override execute() {
        this.setValue(this._evaluate(this._arguments(), this.isUsedAsRangeEndpoint()) as FunctionVariantType);
    }

    override async executeAsync(): Promise<AstNodePromiseType> {
        const value = this._evaluate(this._arguments(), this.isUsedAsRangeEndpoint());
        this.setValue(value instanceof AsyncObject ? await value.getValue() : value);
        return AstNodePromiseType.SUCCESS;
    }

    private _arguments(): FunctionVariantType[] {
        const children = this.getChildren();
        return (this._callee ? children.slice(1) : children).map((node) => node.getValue() ?? ErrorValueObject.create(ErrorType.VALUE));
    }
}

class EtaReducedFunctionNode extends BaseAstNode {
    constructor(name: string, private readonly _lambda: BaseAstNode) {
        super(name);
    }

    override get nodeType() {
        return NodeType.VALUE;
    }

    override execute(): void {
        this._lambda.execute();
        this.setValue(this._lambda.getValue());
    }
}

class EtaReducedLambdaValue extends LambdaValueObjectObject {
    constructor(
        interpreter: Interpreter,
        private readonly _call: (args: FunctionVariantType[]) => BaseValueObject | AsyncObject,
        private readonly _minParams: number,
        private readonly _maxParams: number
    ) {
        super(null, interpreter, new Set());
    }

    override acceptsArity(count: number): boolean {
        return this._minParams === -1 || this._maxParams === -1 ||
            (count >= this._minParams && count <= this._maxParams);
    }

    override execute(...args: FunctionVariantType[]) {
        return this.executeWithReference(...args);
    }

    override executeWithReference(...args: FunctionVariantType[]) {
        return args.length === 0 ? this : this._call(args);
    }
}

export class AstTreeBuilder extends Disposable {
    private _astNodeFactoryList: AstRootNodeFactory[] = [];
    private _namedLambdaCallDepth = 0;
    private _namedLambdaCalls: NamedLambdaCallNode[] = [];

    constructor(
        @Inject(FormulaCacheService) readonly cacheService: FormulaCacheService,
        @IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService,
        @Inject(AstRootNodeFactory) private readonly _astRootNodeFactory: AstRootNodeFactory,
        @Inject(FunctionNodeFactory) private readonly _functionNodeFactory: FunctionNodeFactory,
        @Inject(LambdaNodeFactory) private readonly _lambdaNodeFactory: LambdaNodeFactory,
        @Inject(LambdaParameterNodeFactory) private readonly _lambdaParameterNodeFactory: LambdaParameterNodeFactory,
        @Inject(OperatorNodeFactory) private readonly _operatorNodeFactory: OperatorNodeFactory,
        @Inject(PrefixNodeFactory) private readonly _prefixNodeFactory: PrefixNodeFactory,
        @Inject(ReferenceNodeFactory) private readonly _referenceNodeFactory: ReferenceNodeFactory,
        @Inject(SuffixNodeFactory) private readonly _suffixNodeFactory: SuffixNodeFactory,
        @Inject(UnionNodeFactory) private readonly _unionNodeFactory: UnionNodeFactory,
        @Inject(ValueNodeFactory) private readonly _valueNodeFactory: ValueNodeFactory,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initializeAstNode();
    }

    override dispose(): void {
        this._astNodeFactoryList.forEach((nodeFactory) => {
            nodeFactory.dispose();
        });

        this._astNodeFactoryList = [];
    }

    parse(lexerNode: LexerNode) {
        this._namedLambdaCalls = [];
        const astNode = new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);
        const node = this._parse(lexerNode, astNode);
        const result = node?.getChildren();
        if (result?.length === 1 && result[0] instanceof OperatorNode && !lexerNode.outerParenthesized) {
            result[0].setFormulaResultOperator();
        }

        /**
         * If the lexer node has defined names,
         * it means that the current formula contains a reference to the defined name.
         */
        if (lexerNode.hasDefinedNames()) {
            node?.setDefinedNames(lexerNode.getDefinedNames());
        }
        if (node && this._namedLambdaCalls.length > 0 && this._injector.get(Interpreter).checkAsyncNode(node)) {
            this._namedLambdaCalls.forEach((call) => call.setAsync());
        }
        this._namedLambdaCalls = [];
        return node;
    }

    private _createNamedLambdaCall(item: LexerNode): NamedLambdaCallNode | undefined {
        if (item.getChildren().some((child) => !(child instanceof LexerNode) || child.getToken() !== DEFAULT_TOKEN_TYPE_PARAMETER)) {
            return;
        }
        const token = item.getToken().trim();
        if (this._injector.get(IFunctionService).hasExecutor(token.toUpperCase())) {
            return;
        }
        const config = this._injector.get(IFormulaCurrentConfigService);
        const unitId = config.getExecuteUnitId();
        if (!unitId) {
            return;
        }
        const sheetId = config.getExecuteSubUnitId();
        const definedName = this._injector.get(IDefinedNamesService).getValueByName(unitId, token, sheetId);
        if (!definedName) {
            return;
        }
        const node = new NamedLambdaCallNode(token, (args, preserveReference) => this._executeNamedLambda(token, unitId, sheetId, args, preserveReference));
        this._namedLambdaCalls.push(node);
        return node;
    }

    private _createLocalLambdaCall(item: LexerNode): NamedLambdaCallNode | undefined {
        const token = item.getToken();
        const scope = item.getFunctionDefinitionPrivacyVar();
        if (!scope || token === DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER ||
            this._injector.get(IFunctionService).hasExecutor(token.trim().toUpperCase())) {
            return;
        }
        const callee = new LambdaParameterNode(DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER, item.getLambdaParameter(), scope);
        return this._createExpressionLambdaCall(token, callee);
    }

    private _createExpressionLambdaCall(token: string, callee: BaseAstNode): NamedLambdaCallNode {
        const node = new NamedLambdaCallNode(token, (args, preserveReference) => {
            const value = callee.getValue();
            if (value instanceof LambdaValueObjectObject) {
                return preserveReference ? value.executeWithReference(...args) : value.execute(...args);
            }
            return value?.isError() ? value : ErrorValueObject.create(ErrorType.VALUE);
        }, callee);
        this._namedLambdaCalls.push(node);
        return node;
    }

    private _executeNamedLambda(token: string, unitId: string, sheetId: Nullable<string>, args: FunctionVariantType[], preserveReference: boolean): FunctionVariantType | AsyncObject {
        if (this._namedLambdaCallDepth >= MAX_NAMED_LAMBDA_CALL_DEPTH) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
        const config = this._injector.get(IFormulaCurrentConfigService);
        const lexer = this._injector.get(Lexer);
        const interpreter = this._injector.get(Interpreter);
        this._namedLambdaCallDepth++;
        let asynchronous = false;
        try {
            config.setExecuteUnitId(unitId);
            if (sheetId != null) {
                config.setExecuteSubUnitId(sheetId);
            }
            // Every invocation needs fresh parameter bindings, including repeated calls in one formula.
            const lexerNode = lexer.treeBuilder(`=${token}`, true, unitId);
            if (!(lexerNode instanceof LexerNode)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
            const body = this.parse(lexerNode);
            if (!body) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
            const lambda = interpreter.execute(generateExecuteAstNodeData(body));
            if (!(lambda instanceof LambdaValueObjectObject)) {
                return lambda.isError() ? lambda : ErrorValueObject.create(ErrorType.VALUE);
            }
            const result = preserveReference ? lambda.executeWithReference(...args) : lambda.execute(...args);
            if (result instanceof AsyncObject) {
                asynchronous = true;
                return new AsyncObject(result.getValue().finally(() => this._namedLambdaCallDepth--));
            }
            return result;
        } finally {
            if (!asynchronous) {
                this._namedLambdaCallDepth--;
            }
        }
    }

    private _lambdaParameterHandler(lexerNode: LexerNode, parent: LambdaNode) {
        if (parent.getLambdaId == null) {
            return ErrorNode.create(ErrorType.VALUE);
        }
        const lambdaId = parent.getLambdaId();

        const parentAstNode = new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);

        // const lambdaRuntime = this._parserDataLoader.getLambdaRuntime();
        const currentLambdaPrivacyVar = this._runtimeService.getFunctionDefinitionPrivacyVar(lambdaId);

        if (!currentLambdaPrivacyVar) {
            return false;
        }

        const currentLambdaPrivacyVarKeys = [...currentLambdaPrivacyVar.keys()];

        const children = this._getLambdaArguments(lexerNode);
        const childrenCount = children.length;

        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];

            if (item instanceof LexerNode) {
                this._parse(item, parentAstNode);

                const parentChildren = parentAstNode.getChildren();
                const valueNode = parentChildren[i];
                if (valueNode != null) {
                    currentLambdaPrivacyVar.set(currentLambdaPrivacyVarKeys[i], valueNode);
                }
            } else {
                return false;
            }

            // astNode?.setParent(parentAstNode);
        }

        // const parentChildren = parentAstNode.getChildren();
        // const parentChildrenCount = parentChildren.length;

        // for (let i = 0; i < parentChildrenCount; i++) {
        //     const item = parentChildren[i];
        //     currentLambdaPrivacyVar.set(currentLambdaPrivacyVarKeys[i], item);
        // }

        for (let i = childrenCount; i < currentLambdaPrivacyVarKeys.length; i++) {
            const omitted = new NullNode(DEFAULT_TOKEN_TYPE_ROOT);
            omitted.setParent(parentAstNode);
            currentLambdaPrivacyVar.set(currentLambdaPrivacyVarKeys[i], omitted);
        }
        parentAstNode.setParent(parent);

        return parent;
    }

    private _getLambdaArguments(group: LexerNode) {
        const children = group.getChildren();
        return isFirstChildParameter(children[0]) ? children.slice(1) : children;
    }

    private _appendLambdaCalls(node: BaseAstNode, declaration: LexerNode): BaseAstNode {
        let callGroup = declaration.getChildren()[0];
        if (!(callGroup instanceof LexerNode && isFirstChildParameter(callGroup))) {
            return node;
        }
        let callee = node;
        callGroup = callGroup.getChildren()[0];
        while (callGroup instanceof LexerNode && isFirstChildParameter(callGroup)) {
            const call = this._createExpressionLambdaCall(DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME, callee);
            for (const parameter of this._getLambdaArguments(callGroup)) {
                if (!(parameter instanceof LexerNode)) {
                    return ErrorNode.create(ErrorType.VALUE);
                }
                const argument = new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);
                const result = this._parse(parameter, argument);
                if (result == null || result.nodeType === NodeType.ERROR) {
                    return result ?? ErrorNode.create(ErrorType.VALUE);
                }
                argument.setParent(call);
            }
            callee = call;
            callGroup = callGroup.getChildren()[0];
        }
        return callee;
    }

    private _changeLetToLambda(letLexerNode: LexerNode) {
        const letChildren = letLexerNode.getChildren();
        if (letChildren.length % 2 !== 1 || letChildren.length < 3) {
            return;
        }

        let body = letChildren[letChildren.length - 1];
        if (!(body instanceof LexerNode)) {
            return;
        }
        // An initializer sees earlier bindings, including the old value of a shadowed name.
        for (let i = letChildren.length - 3; i >= 0; i -= 2) {
            const declaration = letChildren[i];
            const initializer = letChildren[i + 1];
            if (!(declaration instanceof LexerNode && initializer instanceof LexerNode)) {
                return;
            }

            const parameters = new LexerNode();
            parameters.setToken(DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER);
            parameters.setChildren([initializer]);
            initializer.setParent(parameters);

            const lambda = new LexerNode();
            lambda.setToken(DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME);
            lambda.setChildren([parameters, declaration, body]);
            parameters.setParent(lambda);
            declaration.setParent(lambda);
            body.setParent(lambda);
            body = lambda;
        }

        letLexerNode.getParent()?.replaceChild(letLexerNode, body);
        return body;
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _parse(lexerNode: LexerNode, parent: BaseAstNode): Nullable<BaseAstNode> {
        const children = lexerNode.getChildren();
        const childrenCount = children.length;
        const calculateStack: BaseAstNode[] = [];
        let currentAstNode: Nullable<BaseAstNode> = null;
        // console.log('lexerNode', lexerNode, children);
        const rawToken = lexerNode.getToken().trim().toUpperCase();
        const intersection = rawToken.startsWith(prefixToken.AT) &&
            normalizeFunctionToken(rawToken.slice(1).trim()) === DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME;
        const token = normalizeFunctionToken(intersection ? rawToken.slice(1).trim() : rawToken);
        if (token === DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME || token === DEFAULT_TOKEN_LET_FUNCTION_NAME) {
            lexerNode.setToken(token);
        }
        if (token === DEFAULT_TOKEN_LET_FUNCTION_NAME) {
            /**
             * Since the let function performs the same as lambda expressions,
             * here we make a conversion to use only lambda expressions for calculations.
             */
            const resultNode: Nullable<LexerNode> = this._changeLetToLambda(lexerNode);
            if (resultNode != null) {
                return this._parse(resultNode, parent);
            }

            // console.log('errorLet', resultNode, currentAstNode, lexerNode);
            return ErrorNode.create(ErrorType.ERROR);
        }
        if (token === DEFAULT_TOKEN_TYPE_PARAMETER) {
            currentAstNode = parent;

            if (childrenCount === 0) {
                const nullNode = new NullNode(DEFAULT_TOKEN_TYPE_ROOT);

                nullNode.setParent(parent);

                return currentAstNode;
            }
        } else {
            /**
             * Process the parameters of the lambda expression, create an execution environment,
             * allowing parameters to correspond to variables.
             */
            if (token === DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER) {
                let resultNode: BaseAstNode | false = this._lambdaParameterHandler(lexerNode, parent as LambdaNode);
                if (resultNode === false) {
                    // console.log('error1', resultNode, currentAstNode, lexerNode);
                    resultNode = ErrorNode.create(ErrorType.ERROR);
                }

                return resultNode;
            }

            currentAstNode = this._checkAstNode(lexerNode);
            if (currentAstNode == null) {
                // console.log('error2', currentAstNode, lexerNode);
                return ErrorNode.create(ErrorType.NAME);
            }

            // currentAstNode.setParent(parent);
            // parent.addChildren(currentAstNode);
        }
        // console.log('currentAstNode', currentAstNode.nodeType, currentAstNode, lexerNode);
        const firstChild = children[0];
        // let isSkipFirstInLambda = false;
        // if (
        //     currentAstNode.getToken().trim().toUpperCase() === DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME &&
        //     !isFirstChildParameter(firstChild)
        // ) {
        //     isSkipFirstInLambda = true;
        // }
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            /**
             *  If it is a lambda expression, by default, only the first and last child nodes are valid.
             * The intermediate nodes have already been processed during the conversion of lambda parameters,
             * so they need to be skipped here.
             */
            if (isFirstChildParameter(firstChild)) {
                if (i !== 0 && i !== childrenCount - 1) {
                    continue;
                }
            } else if (isChildRunTimeParameter(item)) {
                if (i !== childrenCount - 1) {
                    continue;
                }
            }

            let astNode: Nullable<BaseAstNode> = null;
            if (item instanceof LexerNode) {
                if (item.getToken() === DEFAULT_TOKEN_TYPE_PARAMETER && item.getChildren().length === 0) {
                    // =trim(      ) is #NAME?
                    const children = item.getParent()?.getChildren();
                    if (children && children.length === 1) {
                        return ErrorNode.create(ErrorType.NAME);
                    }
                }

                astNode = this._parse(item, currentAstNode);
                if (astNode === currentAstNode) {
                    continue;
                }
            } else {
                astNode = this._checkAstNode(item, lexerNode);
            }

            if (astNode == null) {
                // console.log('error3', astNode, currentAstNode, lexerNode);
                return ErrorNode.create(ErrorType.NAME);
            }

            astNode = getAstNodeTopParent(astNode);

            if (astNode == null || astNode?.nodeType === NodeType.ERROR) {
                return astNode;
            }

            // console.log('bugfix1', astNode, astNode.nodeType, currentAstNode, lexerNode);
            switch (astNode.nodeType) {
                // case NodeType.ERROR:
                //     return astNode;
                case NodeType.BASE:
                    calculateStack.push(astNode);
                    break;
                case NodeType.FUNCTION: {
                    const token = astNode.getToken().trim().toUpperCase();
                    if (FORCED_RECALCULATION_FUNCTION_NAME.has(token)) {
                        astNode.setForcedCalculateFunction();
                    }
                    calculateStack.push(astNode);
                    break;
                }
                case NodeType.LAMBDA:
                    calculateStack.push(astNode);
                    break;
                case NodeType.LAMBDA_PARAMETER:
                    calculateStack.push(astNode);
                    break;
                case NodeType.OPERATOR: {
                    const parameterNode1 = calculateStack.pop();
                    const parameterNode2 = calculateStack.pop();

                    if (parameterNode2) {
                        parameterNode2.setParent(astNode);
                    }

                    if (parameterNode1) {
                        parameterNode1.setParent(astNode);
                    }

                    calculateStack.push(astNode);
                    break;
                }
                case NodeType.REFERENCE:
                    // astNode.setRefOffset(this._refOffsetX, this._refOffsetY);
                    calculateStack.push(astNode);
                    break;
                case NodeType.ROOT:
                    calculateStack.push(astNode);
                    break;
                case NodeType.UNION:
                    calculateStack.push(astNode);
                    break;
                case NodeType.VALUE:
                    calculateStack.push(astNode);
                    break;
                case NodeType.PREFIX:
                    if (item === operatorToken.UNARY_PLUS || item === operatorToken.UNARY_MINUS || item === operatorToken.IMPLICIT_INTERSECTION) {
                        const operand = calculateStack.pop();
                        if (!operand) {
                            return ErrorNode.create(ErrorType.VALUE);
                        }
                        operand.setParent(astNode);
                    }
                    calculateStack.push(astNode);
                    break;
                case NodeType.SUFFIX:
                    calculateStack.push(astNode);
                    break;
            }
        }

        const calculateStackCount = calculateStack.length;

        for (let i = 0; i < calculateStackCount; i++) {
            const item = calculateStack[i];
            item.setParent(currentAstNode);
        }

        if (token === DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME && currentAstNode.nodeType === NodeType.LAMBDA) {
            const result = this._appendLambdaCalls(currentAstNode, lexerNode);
            if (intersection && result.nodeType !== NodeType.ERROR) {
                const prefix = new LexerNode();
                prefix.setToken(prefixToken.AT);
                const prefixNode = this._prefixNodeFactory.checkAndCreateNodeType(prefix);
                if (prefixNode) {
                    result.setParent(prefixNode);
                    return prefixNode;
                }
            }
            return result;
        }
        return currentAstNode;
    }

    // private _setPrefixRefOffset(astNode: BaseAstNode) {
    //     const children = astNode.getChildren();
    //     const childrenCount = children.length;
    //     for (let i = 0; i < childrenCount; i++) {
    //         const item = children[i];
    //         if (item.nodeType === NodeType.REFERENCE) {
    //             item.setRefOffset(this._refOffsetX, this._refOffsetY);
    //         }
    //     }
    // }

    private _checkAstNode(item: LexerNode | string, parameter?: LexerNode): BaseAstNode {
        if (item instanceof LexerNode) {
            const namedCall = this._createLocalLambdaCall(item) ?? this._createNamedLambdaCall(item);
            if (namedCall) {
                return namedCall;
            }
        }
        if (typeof item === 'string' || item.getChildren().length === 0) {
            const token = typeof item === 'string' ? item : item.getToken();
            const context = parameter ?? (typeof item === 'string' ? undefined : item.getParent() ?? undefined);
            const lambda = this._createEtaReducedFunction(token, context, typeof item === 'string');
            if (lambda) {
                return lambda;
            }
        }
        let astNode: Nullable<BaseAstNode> = null;
        const astNodeFactoryListCount = this._astNodeFactoryList.length;
        for (let x = 0; x < astNodeFactoryListCount; x++) {
            const astNodeFactory = this._astNodeFactoryList[x];
            astNode = astNodeFactory.checkAndCreateNodeType(item);
            if (astNode != null) {
                break;
            }
        }

        if (astNode == null) {
            return new ErrorFunctionNode(typeof item === 'string' ? item : item.getToken());
        }

        // console.log('astNode111', astNode, item);
        return astNode;
    }

    private _createEtaReducedFunction(raw: string, parameter: LexerNode | undefined, isBare: boolean): BaseAstNode | undefined {
        const token = raw.trim().toUpperCase();
        const prefix = '_XLETA.';
        const explicit = token.startsWith(prefix);
        const name = explicit ? token.slice(prefix.length) : token;
        if (!/^[A-Z][A-Z0-9.]*$/.test(name)) {
            return;
        }
        const arity = this._getEtaReducedFunctionArity(parameter);
        if (!explicit && (!isBare || name === 'TRUE' || name === 'FALSE' || isReferenceString(name))) {
            return;
        }
        const executor = this._injector.get(IFunctionService).getExecutor(name);
        if (!executor) {
            return;
        }
        if (arity == null) {
            const interpreter = this._injector.get(Interpreter);
            const value = new EtaReducedLambdaValue(interpreter, (args) => {
                const call = this._functionNodeFactory.create(name);
                for (const value of args) {
                    const argument = new BaseAstNode(DEFAULT_TOKEN_TYPE_PARAMETER);
                    argument.setValue(value);
                    argument.setParent(call);
                }
                const result = () => {
                    const value = call.getValue() ?? ErrorValueObject.create(ErrorType.VALUE);
                    return value.isReferenceObject() ? (value as BaseReferenceObject).toArrayValueObject() : value as BaseValueObject;
                };
                if (call.isAsync()) {
                    return new AsyncObject(call.executeAsync(interpreter.getDateSystem()).then(result));
                }
                call.execute(interpreter.getDateSystem());
                return result();
            }, executor.minParams, executor.maxParams);
            const node = new BaseAstNode(DEFAULT_TOKEN_TYPE_ROOT);
            node.setValue(value);
            return new EtaReducedFunctionNode(name, node);
        }
        const args = arity === 2 || name === 'PERCENTOF' ? '_xlpm.etaValue,_xlpm.etaSecond' : '_xlpm.etaValue';
        const lexer = this._injector.get(Lexer).treeBuilder(`=LAMBDA(${args},${name}(${args}))`);
        if (!(lexer instanceof LexerNode)) {
            return;
        }
        const root = new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);
        const lambda = this._parse(lexer, root)?.getChildren()[0];
        return lambda ? new EtaReducedFunctionNode(name, lambda) : undefined;
    }

    private _getEtaReducedFunctionArity(parameter: LexerNode | undefined): number | undefined {
        let argument = parameter;
        while (argument?.getToken() === DEFAULT_TOKEN_TYPE_PARAMETER) {
            const call = argument.getParent();
            if (!call) {
                return;
            }
            const name = normalizeFunctionToken(call.getToken().trim().toUpperCase());
            if (name === 'HSTACK' || name === 'VSTACK') {
                argument = call.getParent() ?? undefined;
                continue;
            }
            const index = call.getChildren().indexOf(argument);
            if ((name === 'REDUCE' || name === 'SCAN') && index === 2) {
                return 2;
            }
            if ((name === 'PIVOTBY' && index === 3) || (name === 'GROUPBY' && index === 2) ||
                ((name === 'BYCOL' || name === 'BYROW') && index === 1)) {
                return 1;
            }
            return;
        }
    }

    private _initializeAstNode() {
        this._astNodeFactoryList = [
            this._astRootNodeFactory,
            this._functionNodeFactory,
            this._lambdaNodeFactory,
            this._lambdaParameterNodeFactory,
            this._operatorNodeFactory,
            this._prefixNodeFactory,
            this._referenceNodeFactory,
            this._suffixNodeFactory,
            this._unionNodeFactory,
            this._valueNodeFactory,
        ].sort(sortRules);
    }
}
