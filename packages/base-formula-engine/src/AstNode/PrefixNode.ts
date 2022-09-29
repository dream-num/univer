import { prefixToken } from '../Basics/Token';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { BaseAstNodeFactory, BaseAstNode } from './BaseAstNode';
import { NodeType } from './NodeType';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { ErrorType } from '../Basics/ErrorType';
import { ErrorNode } from './ErrorNode';
import { BaseFunction } from '../Functions/BaseFunction';
import { NumberValueObject } from '../ValueObject/NumberValueObject';
import { FunctionVariantType, IInterpreterCalculateProps } from '../Basics/Common';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { LexerNode } from '../Analysis/LexerNode';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';

export class PrefixNode extends BaseAstNode {
    get nodeType() {
        return NodeType.PREFIX;
    }
    constructor(private _operatorString: string, private _functionExecutor?: BaseFunction) {
        super();
    }

    private _handlerAT(value: FunctionVariantType, interpreterCalculateProps: IInterpreterCalculateProps) {
        if (!value.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const currentValue = value as BaseReferenceObject;

        if (currentValue.isCell()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const currentRow = interpreterCalculateProps.currentRow;
        const currentColumn = interpreterCalculateProps.currentColumn;

        // @ projection to current
        if (currentValue.isRow()) {
            return currentValue.getCellByColumn(currentColumn);
        } else if (currentValue.isColumn()) {
            return currentValue.getCellByRow(currentRow);
        } else if (currentValue.isRange()) {
            return currentValue.getCellByPosition();
        } else if (currentValue.isTable()) {
            return currentValue.getCellByPosition();
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }

    execute(interpreterCalculateProps: IInterpreterCalculateProps) {
        const children = this.getChildren();
        const value = children[0].getValue();
        let result: FunctionVariantType;
        if (this._operatorString === prefixToken.MINUS) {
            result = this._functionExecutor!.calculate(new NumberValueObject(0), value) as FunctionVariantType;
        } else if (this._operatorString === prefixToken.AT) {
            result = this._handlerAT(value, interpreterCalculateProps);
        } else {
            result = ErrorValueObject.create(ErrorType.VALUE);
        }
        this.setValue(result);
    }
}

export class PrefixNodeFactory extends BaseAstNodeFactory {
    get zIndex() {
        return 6;
    }

    checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: ParserDataLoader) {
        if (!(param instanceof LexerNode)) {
            return false;
        }

        const token = param.getToken();
        const tokenTrim = token.trim();
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
            console.error('No function ' + token);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new PrefixNode(tokenTrim, functionExecutor);
    }
}

FORMULA_AST_NODE_REGISTRY.add(new PrefixNodeFactory());
