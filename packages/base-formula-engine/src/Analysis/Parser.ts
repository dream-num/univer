import { AstRootNode } from '../AstNode/AstRootNode';
import { BaseAstNode, BaseAstNodeFactory } from '../AstNode/BaseAstNode';
import { ErrorNode } from '../AstNode/ErrorNode';
import { NodeType } from '../AstNode/NodeType';
import { ErrorType } from '../Basics/ErrorType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { LambdaNode } from '../AstNode';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { LexerNode } from './LexerNode';
import { DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER, DEFAULT_TOKEN_TYPE_PARAMETER, DEFAULT_TOKEN_TYPE_ROOT } from '../Basics/TokenType';
import { LambdaRuntime } from '../Basics/LambdaRuntime';

export class AstTreeMaker {
    static maker: AstTreeMaker;

    private _parserDataLoader = new ParserDataLoader();

    private _astNodeFactoryList: BaseAstNodeFactory[];

    static create() {
        if (!this.maker) {
            this.maker = new AstTreeMaker();
            this.maker._parserDataLoader.initialize();
        }

        return this.maker;
    }

    parse(lexerNode: LexerNode) {
        this._astNodeFactoryList = FORMULA_AST_NODE_REGISTRY.getData() as BaseAstNodeFactory[];
        this._parserDataLoader.setLambdaRuntime(new LambdaRuntime());
        const astNode = new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);
        const node = this._parse(lexerNode, astNode);
        return node;
    }

    getDataLoader() {
        return this._parserDataLoader;
    }

    private _lambdaParameterHandler(lexerNode: LexerNode, parent: LambdaNode) {
        const lambdaId = parent.getLambdaId();
        const parentAstNode = new AstRootNode(DEFAULT_TOKEN_TYPE_ROOT);

        const lambdaRuntime = this._parserDataLoader.getLambdaRuntime();
        const currentLambdaPrivacyVar = lambdaRuntime.getCurrentPrivacyVar(lambdaId);

        if (!currentLambdaPrivacyVar) {
            return false;
        }

        const currentLambdaPrivacyVarKeys = [...currentLambdaPrivacyVar.keys()];

        const children = lexerNode.getChildren();
        const childrenCount = children.length;

        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            let astNode: BaseAstNode | false = false;
            if (item instanceof LexerNode) {
                astNode = this._parse(item, parentAstNode);
            } else {
                return false;
            }

            // astNode.setParent(parentAstNode);
        }

        const parentChildren = parentAstNode.getChildren();
        const parentChildrenCount = parentChildren.length;

        for (let i = 0; i < parentChildrenCount; i++) {
            const item = parentChildren[i];
            currentLambdaPrivacyVar.set(currentLambdaPrivacyVarKeys[i], item);
        }

        parentAstNode.setParent(parent);

        return parent;
    }

    private _getTopParent(node: BaseAstNode) {
        let parent: BaseAstNode = node;
        while (parent.getParent()) {
            parent = parent.getParent();
            console.log(parent);
        }
        return parent;
    }

    private _parse(lexerNode: LexerNode, parent: BaseAstNode): BaseAstNode {
        const children = lexerNode.getChildren();
        const childrenCount = children.length;
        const calculateStack: BaseAstNode[] = [];
        let currentAstNode: false | BaseAstNode = false;
        // console.log('lexerNode', lexerNode, children);
        if (lexerNode.getToken() === DEFAULT_TOKEN_TYPE_PARAMETER) {
            currentAstNode = parent;
        } else {
            if (lexerNode.getToken() === DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER) {
                let resultNode: BaseAstNode | false = this._lambdaParameterHandler(lexerNode, parent as LambdaNode);
                if (resultNode === false) {
                    // console.log('error1', resultNode, currentAstNode, lexerNode);
                    resultNode = ErrorNode.create(ErrorType.ERROR);
                }

                return resultNode;
            }

            currentAstNode = this._checkAstNode(lexerNode);
            if (currentAstNode === false) {
                // console.log('error2', currentAstNode, lexerNode);
                return ErrorNode.create(ErrorType.ERROR);
            }

            // currentAstNode.setParent(parent);
            // parent.addChildren(currentAstNode);
        }
        // console.log('currentAstNode', currentAstNode.nodeType, currentAstNode, lexerNode);
        for (let i = 0; i < childrenCount; i++) {
            if (currentAstNode.nodeType === NodeType.LAMBDA && parent.nodeType !== NodeType.LAMBDA && i !== 0 && i !== childrenCount - 1) {
                continue;
            }

            const item = children[i];
            let astNode: BaseAstNode | false = false;
            if (item instanceof LexerNode) {
                astNode = this._parse(item, currentAstNode);
                if (astNode === currentAstNode) {
                    continue;
                }
            } else {
                astNode = this._checkAstNode(item);
            }

            if (astNode === false) {
                // console.log('error3', astNode, currentAstNode, lexerNode);
                return ErrorNode.create(ErrorType.ERROR);
            }

            astNode = this._getTopParent(astNode);
            // console.log('bugfix1', astNode, astNode.nodeType, currentAstNode, lexerNode);
            switch (astNode.nodeType) {
                case NodeType.ERROR:
                    return astNode;
                case NodeType.FUNCTION:
                    calculateStack.push(astNode);
                    break;
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
                    } else {
                        // console.log('error4', currentAstNode, lexerNode, children, i);
                        return ErrorNode.create(ErrorType.ERROR);
                    }

                    if (parameterNode1) {
                        parameterNode1.setParent(astNode);
                    } else {
                        // console.log('error5', currentAstNode, lexerNode, children, i);
                        return ErrorNode.create(ErrorType.ERROR);
                    }

                    calculateStack.push(astNode);
                    break;
                }
                case NodeType.REFERENCE:
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

        return currentAstNode;
    }

    private _checkAstNode(item: LexerNode | string) {
        let astNode: BaseAstNode | false = false;
        const astNodeFactoryListCount = this._astNodeFactoryList.length;
        for (let x = 0; x < astNodeFactoryListCount; x++) {
            const astNodeFactory = this._astNodeFactoryList[x];
            astNode = astNodeFactory.checkAndCreateNodeType(item, this._parserDataLoader);
            if (astNode !== false) {
                break;
            }
        }
        // console.log('astNode111', astNode, item);
        return astNode;
    }

    private _findTopNode() {}
}
