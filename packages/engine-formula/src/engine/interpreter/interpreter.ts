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
import type { BaseAstNode } from '../ast-node/base-ast-node';
import type { FunctionNode } from '../ast-node/function-node';
import type { LambdaNode } from '../ast-node/lambda-node';
import type { ReferenceNode } from '../ast-node/reference-node';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { IExecuteAstNodeData } from '../utils/ast-node-tool';
import type { PreCalculateNodeType } from '../utils/node-type';
import type { ArrayValueObject } from '../value-object/array-value-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import { Disposable } from '@univerjs/core';
import { AstNodePromiseType } from '../../basics/common';
import { ErrorType } from '../../basics/error-type';
import { DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME } from '../../basics/token-type';
import { FUNCTION_NAMES_LOOKUP } from '../../functions/lookup/function-names';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { NodeType } from '../ast-node/node-type';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../value-object/primitive-object';

export class Interpreter extends Disposable {
    constructor(@IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService) {
        super();
    }

    async executeAsync(nodeData: IExecuteAstNodeData): Promise<FunctionVariantType> {
        // if (!this._interpreterCalculateProps) {
        //     return ErrorValueObject.create(ErrorType.ERROR);
        // }

        if (!nodeData || !nodeData.node) {
            return Promise.resolve(ErrorValueObject.create(ErrorType.VALUE));
        }

        const node = nodeData.node;
        const refOffsetX = nodeData.refOffsetX;
        const refOffsetY = nodeData.refOffsetY;

        await this._executeAsync(node, refOffsetX, refOffsetY);

        const value = node.getValue();

        if (value == null) {
            return Promise.resolve(ErrorValueObject.create(ErrorType.VALUE));
        }

        return Promise.resolve(value);
    }

    execute(nodeData: IExecuteAstNodeData): FunctionVariantType {
        // if (!this._interpreterCalculateProps) {
        //     return ErrorValueObject.create(ErrorType.ERROR);
        // }

        if (!nodeData || !nodeData.node) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const node = nodeData.node;
        const refOffsetX = nodeData.refOffsetX;
        const refOffsetY = nodeData.refOffsetY;

        this._execute(node, refOffsetX, refOffsetY);

        const value = node.getValue();

        if (value == null) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return value;
    }

    executePreCalculateNode(node: PreCalculateNodeType) {
        node.execute();
        return node.getValue();
    }

    checkAsyncNode(node: Nullable<BaseAstNode>) {
        if (node == null) {
            return false;
        }
        const result: boolean[] = [];
        this._checkAsyncNode(node, result);

        for (let i = 0, len = result.length; i < len; i++) {
            const item = result[i];
            if (item === true) {
                return true;
            }
        }

        return false;
    }

    private _checkAsyncNode(node: BaseAstNode, resultList: boolean[]) {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            resultList.push(item.isAsync());
            this._checkAsyncNode(item, resultList);
        }
    }

    private async _executeAsync(node: BaseAstNode, refOffsetX = 0, refOffsetY = 0): Promise<AstNodePromiseType> {
        if (this._runtimeService.isStopExecution()) {
            return Promise.resolve(AstNodePromiseType.ERROR);
        }
        if (await this._executeLazyFunctionAsync(node, refOffsetX, refOffsetY)) {
            return Promise.resolve(AstNodePromiseType.SUCCESS);
        }
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            const token = item.getToken();
            /**
             * If the lambda expression has no parameters, then do not execute further.
             */
            if (
                token.toUpperCase() === DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME &&
                (item as LambdaNode).isEmptyParamFunction()
            ) {
                item.execute();
                continue;
            }
            await this._executeAsync(item, refOffsetX, refOffsetY);
        }

        if (node.nodeType === NodeType.REFERENCE) {
            (node as ReferenceNode).setRefOffset(refOffsetX, refOffsetY);
        }

        if (node.nodeType === NodeType.FUNCTION && (node as FunctionNode).isAsync()) {
            await node.executeAsync();
        } else {
            node.execute();
        }

        return Promise.resolve(AstNodePromiseType.SUCCESS);
    }

    private _execute(node: BaseAstNode, refOffsetX = 0, refOffsetY = 0): AstNodePromiseType {
        if (this._runtimeService.isStopExecution()) {
            return AstNodePromiseType.ERROR;
        }
        if (this._executeLazyFunction(node, refOffsetX, refOffsetY)) {
            return AstNodePromiseType.SUCCESS;
        }
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            const token = item.getToken();
            /**
             * If the lambda expression has no parameters, then do not execute further.
             */
            if (
                token.toUpperCase() === DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME &&
                (item as LambdaNode).isEmptyParamFunction()
            ) {
                item.execute();
                continue;
            }
            this._execute(item, refOffsetX, refOffsetY);
        }

        if (node.nodeType === NodeType.REFERENCE) {
            (node as ReferenceNode).setRefOffset(refOffsetX, refOffsetY);
        }

        node.execute();

        return AstNodePromiseType.SUCCESS;
    }

    private async _executeLazyFunctionAsync(node: BaseAstNode, refOffsetX: number, refOffsetY: number): Promise<boolean> {
        if (node.nodeType !== NodeType.FUNCTION) {
            return false;
        }

        const token = node.getToken().toUpperCase();
        if (token === 'IF') {
            return await this._executeLazyIfAsync(node, refOffsetX, refOffsetY);
        }
        if (token === 'IFERROR') {
            return await this._executeLazyIfErrorAsync(node, refOffsetX, refOffsetY);
        }
        return false;
    }

    private _executeLazyFunction(node: BaseAstNode, refOffsetX: number, refOffsetY: number): boolean {
        if (node.nodeType !== NodeType.FUNCTION) {
            return false;
        }

        const token = node.getToken().toUpperCase();
        if (token === 'IF') {
            return this._executeLazyIf(node, refOffsetX, refOffsetY);
        }
        if (token === 'IFERROR') {
            return this._executeLazyIfError(node, refOffsetX, refOffsetY);
        }
        return false;
    }

    private async _executeLazyIfAsync(node: BaseAstNode, refOffsetX: number, refOffsetY: number): Promise<boolean> {
        const children = node.getChildren();
        if (children.length < 2 || children.length > 3) {
            return false;
        }

        await this._executeAsync(children[0], refOffsetX, refOffsetY);
        const condition = children[0].getValue();
        if (condition == null || condition.isReferenceObject() || condition.isArray()) {
            return false;
        }
        if (condition.isError()) {
            node.setValue(condition);
            return true;
        }

        const selected = (condition as BaseValueObject).getValue() ? children[1] : children[2];
        if (selected == null) {
            node.setValue(BooleanValueObject.create(false));
            return true;
        }

        await this._executeAsync(selected, refOffsetX, refOffsetY);
        node.setValue(this._toLazyIfSelectedValue(selected.getValue(), node));
        return true;
    }

    private _executeLazyIf(node: BaseAstNode, refOffsetX: number, refOffsetY: number): boolean {
        const children = node.getChildren();
        if (children.length < 2 || children.length > 3) {
            return false;
        }

        this._execute(children[0], refOffsetX, refOffsetY);
        const condition = children[0].getValue();
        if (condition == null || condition.isReferenceObject() || condition.isArray()) {
            return false;
        }
        if (condition.isError()) {
            node.setValue(condition);
            return true;
        }

        const selected = (condition as BaseValueObject).getValue() ? children[1] : children[2];
        if (selected == null) {
            node.setValue(BooleanValueObject.create(false));
            return true;
        }

        this._execute(selected, refOffsetX, refOffsetY);
        node.setValue(this._toLazyIfSelectedValue(selected.getValue(), node));
        return true;
    }

    private async _executeLazyIfErrorAsync(node: BaseAstNode, refOffsetX: number, refOffsetY: number): Promise<boolean> {
        const children = node.getChildren();
        if (children.length !== 2) {
            return false;
        }

        await this._executeAsync(children[0], refOffsetX, refOffsetY);
        const rawValue = children[0].getValue();
        const value = this._toLazyIfErrorValue(rawValue);
        if (value == null || value.isArray()) {
            return false;
        }
        if (!value.isError()) {
            node.setValue(value);
            return true;
        }

        await this._executeAsync(children[1], refOffsetX, refOffsetY);
        node.setValue(children[1].getValue() ?? ErrorValueObject.create(ErrorType.VALUE));
        return true;
    }

    private _executeLazyIfError(node: BaseAstNode, refOffsetX: number, refOffsetY: number): boolean {
        const children = node.getChildren();
        if (children.length !== 2) {
            return false;
        }

        this._execute(children[0], refOffsetX, refOffsetY);
        const rawValue = children[0].getValue();
        const value = this._toLazyIfErrorValue(rawValue);
        if (value == null || value.isArray()) {
            return false;
        }
        if (!value.isError()) {
            node.setValue(value);
            return true;
        }

        this._execute(children[1], refOffsetX, refOffsetY);
        node.setValue(children[1].getValue() ?? ErrorValueObject.create(ErrorType.VALUE));
        return true;
    }

    private _toLazyIfErrorValue(value: Nullable<FunctionVariantType>): Nullable<BaseValueObject> {
        if (value == null) {
            return null;
        }

        if (!value.isReferenceObject()) {
            const baseValue = value as BaseValueObject;
            return baseValue.isNull() ? NumberValueObject.create(0) : baseValue;
        }

        const reference = value as BaseReferenceObject;

        if (reference.getRowCount() !== 1 || reference.getColumnCount() !== 1) {
            return reference.toArrayValueObject();
        }

        const cellValue = reference.getCellByPosition();
        return cellValue.isNull() ? NumberValueObject.create(0) : cellValue;
    }

    private _toLazyIfSelectedValue(value: Nullable<FunctionVariantType>, node: BaseAstNode): FunctionVariantType {
        if (value == null) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (value.isReferenceObject()) {
            const reference = value as BaseReferenceObject;
            if (this._preserveLazyIfSelectedReferenceArray(node)) {
                return reference.toArrayValueObject();
            }
            value = this._implicitLazyIfReferenceValue(reference);
        }

        if (value.isArray()) {
            value = this._implicitLazyIfArrayValue(value as ArrayValueObject);
        }

        if (!value.isArray()) {
            const baseValue = value as BaseValueObject;
            return baseValue.isNull() ? NumberValueObject.create(0) : baseValue;
        }

        return value;
    }

    private _implicitLazyIfReferenceValue(reference: BaseReferenceObject): BaseValueObject {
        const range = reference.getRangePosition();
        const currentRow = this._runtimeService.currentRow || 0;
        const currentColumn = this._runtimeService.currentColumn || 0;
        const { startRow, startColumn, endRow, endColumn } = range;

        if (startRow === endRow && startColumn === endColumn) {
            return reference.getCellByPosition();
        }

        if (endRow === startRow && currentColumn >= startColumn && currentColumn <= endColumn) {
            return reference.getCellByColumn(currentColumn);
        }

        if (startColumn === endColumn && currentRow >= startRow && currentRow <= endRow) {
            return reference.getCellByRow(currentRow);
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }

    private _preserveLazyIfSelectedReferenceArray(node: BaseAstNode): boolean {
        let child: BaseAstNode = node;
        let parent = child.getParent();

        while (parent != null) {
            if (parent.nodeType === NodeType.FUNCTION) {
                return parent.getToken().toUpperCase() === FUNCTION_NAMES_LOOKUP.MATCH && parent.getChildren().indexOf(child) === 1;
            }

            child = parent;
            parent = parent.getParent();
        }

        return false;
    }

    private _implicitLazyIfArrayValue(array: ArrayValueObject): FunctionVariantType {
        if (
            array.getUnitId() === '' ||
            array.getSheetId() === '' ||
            array.getCurrentRow() < 0 ||
            array.getCurrentColumn() < 0
        ) {
            return array;
        }

        const startRow = array.getCurrentRow();
        const startColumn = array.getCurrentColumn();
        const rowCount = array.getRowCount();
        const columnCount = array.getColumnCount();
        const currentRow = this._runtimeService.currentRow || 0;
        const currentColumn = this._runtimeService.currentColumn || 0;

        let rowIndex = -1;
        let columnIndex = -1;
        if (rowCount === 1 && columnCount === 1) {
            rowIndex = 0;
            columnIndex = 0;
        } else if (rowCount === 1) {
            rowIndex = 0;
            columnIndex = currentColumn - startColumn;
        } else if (columnCount === 1) {
            rowIndex = currentRow - startRow;
            columnIndex = 0;
        } else {
            rowIndex = currentRow - startRow;
            columnIndex = currentColumn - startColumn;
        }

        if (rowIndex < 0 || rowIndex >= rowCount || columnIndex < 0 || columnIndex >= columnCount) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return (array.get(rowIndex, columnIndex) as BaseValueObject) || ErrorValueObject.create(ErrorType.VALUE);
    }
}
