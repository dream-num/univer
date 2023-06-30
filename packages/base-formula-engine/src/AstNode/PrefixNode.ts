import { prefixToken } from '../Basics/Token';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { BaseAstNodeFactory, BaseAstNode } from './BaseAstNode';
import { NodeType, NODE_ORDER_MAP } from './NodeType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { ErrorType } from '../Basics/ErrorType';
import { ErrorNode } from './ErrorNode';
import { BaseFunction } from '../Functions/BaseFunction';
import { NumberValueObject } from '../ValueObject/NumberValueObject';
import { FunctionVariantType, IInterpreterDatasetConfig } from '../Basics/Common';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { LexerNode } from '../Analysis/LexerNode';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';

export class PrefixNode extends BaseAstNode {
    constructor(private _operatorString: string, private _functionExecutor?: BaseFunction) {
        super(_operatorString);
    }

    get nodeType() {
        return NodeType.PREFIX;
    }

    execute(interpreterDatasetConfig?: IInterpreterDatasetConfig) {
        const children = this.getChildren();
        const value = children[0].getValue();
        let result: FunctionVariantType;
        if (this._operatorString === prefixToken.MINUS) {
            result = this._functionExecutor!.calculate(new NumberValueObject(0), value) as FunctionVariantType;
        } else if (this._operatorString === prefixToken.AT) {
            result = this._handlerAT(value, interpreterDatasetConfig);
        } else {
            result = ErrorValueObject.create(ErrorType.VALUE);
        }
        this.setValue(result);
    }

    private _handlerAT(value: FunctionVariantType, interpreterDatasetConfig?: IInterpreterDatasetConfig) {
        if (!value.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const currentValue = value as BaseReferenceObject;

        if (currentValue.isCell()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const currentRow = interpreterDatasetConfig?.currentRow || 0;
        const currentColumn = interpreterDatasetConfig?.currentColumn || 0;

        // @ projection to current
        if (currentValue.isRow()) {
            return currentValue.getCellByColumn(currentColumn);
        }
        if (currentValue.isColumn()) {
            return currentValue.getCellByRow(currentRow);
        }
        if (currentValue.isRange()) {
            return currentValue.getCellByPosition();
        }
        if (currentValue.isTable()) {
            return currentValue.getCellByPosition();
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }
}

export class PrefixNodeFactory extends BaseAstNodeFactory {
    get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.PREFIX) || 100;
    }

    checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: ParserDataLoader) {
        if (!(param instanceof LexerNode)) {
            return false;
        }

        const token = param.getToken();
        const tokenTrim = token.trim();

        if (tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return false;
        }

        let functionName = '';
        if (tokenTrim === prefixToken.MINUS) {
            functionName = 'MINUS';
        } else if (tokenTrim === prefixToken.AT) {
            return new PrefixNode(tokenTrim);
        } else {
            return false;
        }

        const functionExecutor = parserDataLoader.getExecutor(functionName);
        if (!functionExecutor) {
            console.error(`No function ${token}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new PrefixNode(tokenTrim, functionExecutor);
    }
}

FORMULA_AST_NODE_REGISTRY.add(new PrefixNodeFactory());
