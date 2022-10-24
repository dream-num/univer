import { BaseAstNode } from '../AstNode/BaseAstNode';
import { NodeType } from '../AstNode/NodeType';
import { AstNodePromiseType, FunctionVariantType, IInterpreterDatasetConfig } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';

export class Interpreter {
    private async _execute(node: BaseAstNode): Promise<AstNodePromiseType> {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            this._execute(item);
            // if (item.nodeType === NodeType.FUNCTION) {
            //     await item.executeAsync(this._interpreterCalculateProps);
            // } else {
            //     item.execute(this._interpreterCalculateProps);
            // }
        }

        if (node.nodeType === NodeType.FUNCTION) {
            await node.executeAsync(this._interpreterDatasetConfig);
        } else {
            node.execute(this._interpreterDatasetConfig);
        }

        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    constructor(private _interpreterDatasetConfig?: IInterpreterDatasetConfig) {}

    async execute(node: BaseAstNode): Promise<FunctionVariantType> {
        // if (!this._interpreterCalculateProps) {
        //     return ErrorValueObject.create(ErrorType.ERROR);
        // }

        if (!node) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        await this._execute(node);

        return Promise.resolve(node.getValue());
    }

    setProps(interpreterDatasetConfig: IInterpreterDatasetConfig) {
        this._interpreterDatasetConfig = interpreterDatasetConfig;
    }

    // static interpreter: Interpreter;

    static create(interpreterDatasetConfig?: IInterpreterDatasetConfig) {
        return new Interpreter(interpreterDatasetConfig);
        // if (!this.interpreter) {
        //     this.interpreter = new Interpreter(interpreterCalculateProps);
        // }

        // interpreterCalculateProps && this.interpreter.setProps(interpreterCalculateProps);

        // return this.interpreter;
    }
}
