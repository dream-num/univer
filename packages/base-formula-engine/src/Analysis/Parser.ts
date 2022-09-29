import { AstRootNode } from '../AstNode/AstRootNode';
import { BaseAstNode, BaseAstNodeFactory } from '../AstNode/BaseAstNode';
import { ErrorNode } from '../AstNode/ErrorNode';
import { NodeType } from '../AstNode/NodeType';
import { ErrorType } from '../Basics/ErrorType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import '../AstNode';
import { FORMULA_AST_NODE_REGISTRY, FORMULA_FUNCTION_REGISTRY } from '../Basics/Registry';
import { LexerNode } from './LexerNode';
import { DEFAULT_TOKEN_TYPE_PARAMETER } from '../Basics/TokenType';
export class AstTreeMaker {
    private _parserDataLoader = new ParserDataLoader();
    private _astNodeFactoryList: BaseAstNodeFactory[];

    parse(lexerNode: LexerNode) {
        this._astNodeFactoryList = FORMULA_AST_NODE_REGISTRY.getData() as BaseAstNodeFactory[];
        const astNode = new AstRootNode();
        const node = this._parse(lexerNode, astNode);
        return astNode;
    }

    private _parse(lexerNode: LexerNode, parent: BaseAstNode): BaseAstNode {
        const children = lexerNode.getChildren();
        const childrenCount = children.length;
        const calculateStack = [];
        let currentAstNode: false | BaseAstNode = false;
        if (lexerNode.getToken() === DEFAULT_TOKEN_TYPE_PARAMETER) {
            currentAstNode = parent;
        } else {
            currentAstNode = this._checkAstNode(lexerNode);
            if (currentAstNode === false) {
                return ErrorNode.create(ErrorType.ERROR);
            }

            currentAstNode.setParent(parent);
        }

        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            let astNode: BaseAstNode | false = false;
            if (item instanceof LexerNode) {
                astNode = this._parse(item, currentAstNode);
            } else {
                astNode = this._checkAstNode(item);
            }

            if (astNode === false) {
                return ErrorNode.create(ErrorType.ERROR);
            }

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
                    break;
                case NodeType.OPERATOR:
                    const parameterNode1 = calculateStack.pop();
                    const parameterNode2 = calculateStack.pop();
                    parameterNode1?.setParent(astNode);
                    parameterNode2?.setParent(astNode);
                    calculateStack.push(astNode);
                    break;
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

            astNode.setParent(currentAstNode);
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
        return astNode;
    }

    private _findTopNode() {}

    getDataLoader() {
        return this._parserDataLoader;
    }

    static maker: AstTreeMaker;

    static create() {
        if (!this.maker) {
            this.maker = new AstTreeMaker();
            this.maker._parserDataLoader.initialize();
        }

        return this.maker;
    }
}
