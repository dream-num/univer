import { IGridRange, IRangeData, ObjectMatrix } from '@univer/core';
import { generateAstNode } from '../Analysis/Tools';
import { FunctionNode, PrefixNode, ReferenceNode, SuffixNode, UnionNode } from '../AstNode';
import { BaseAstNode } from '../AstNode/BaseAstNode';
import { NodeType } from '../AstNode/NodeType';
import { FormulaDataType, IInterpreterDatasetConfig, PreCalculateNodeType } from '../Basics/Common';
import { prefixToken, suffixToken } from '../Basics/Token';
import { Interpreter } from '../Interpreter/Interpreter';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { FormulaDependencyTree } from './DependencyTree';
export class FormulaDependencyGenerator {
    private _updateRangeFlattenCache = new Map<string, ObjectMatrix<boolean>>();

    constructor(private _formulaData: FormulaDataType) {}

    updateRangeFlatten(updateRangeList: IGridRange[]) {
        for (let i = 0; i < updateRangeList.length; i++) {
            const gridRange = updateRangeList[i];
            const range = gridRange.rangeData;
            const sheetId = gridRange.sheetId;

            this._addFlattenCache(sheetId, range);
        }
    }

    private _addFlattenCache(sheetId: string, rangeData: IRangeData) {
        let matrix = this._updateRangeFlattenCache.get(sheetId);
        if (!matrix) {
            matrix = new ObjectMatrix<boolean>();
            this._updateRangeFlattenCache.set(sheetId, matrix);
        }

        // don't use destructuring assignment
        const startRow = rangeData.startRow;

        const startColumn = rangeData.startColumn;

        const endRow = rangeData.endRow;

        const endColumn = rangeData.endColumn;

        // don't use chained calls
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                matrix.setValue(r, c, true);
            }
        }
    }

    private _isPreCalculateNode(node: BaseAstNode) {
        if (node.nodeType === NodeType.UNION) {
            return true;
        }

        if (node.nodeType === NodeType.PREFIX && (node as PrefixNode).getToken() === prefixToken.AT) {
            return true;
        }

        if (node.nodeType === NodeType.SUFFIX && (node as SuffixNode).getToken() === suffixToken.POUND) {
            return true;
        }

        return false;
    }

    private _nodeTraversalRef(node: BaseAstNode, result: PreCalculateNodeType[]) {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            if (this._isPreCalculateNode(node)) {
                result.push(item as PreCalculateNodeType);
                continue;
            } else if (item.nodeType === NodeType.REFERENCE) {
                result.push(item as PreCalculateNodeType);
            }
            this._nodeTraversalRef(item, result);
        }
    }

    private _nodeTraversalReferenceFunction(node: BaseAstNode, result: FunctionNode[]) {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            if (item.nodeType === NodeType.FUNCTION && (item as FunctionNode).isAddress()) {
                result.push(item as FunctionNode);
                continue;
            }
            this._nodeTraversalReferenceFunction(item, result);
        }
    }

    private async _getRangeListByNode(node: BaseAstNode, formulaInterpreter: Interpreter) {
        // ref function in offset indirect INDEX
        const preCalculateNodeList: PreCalculateNodeType[] = [];
        const referenceFunctionList: FunctionNode[] = [];

        this._nodeTraversalRef(node, preCalculateNodeList);

        this._nodeTraversalReferenceFunction(node, referenceFunctionList);

        const rangeList: IGridRange[] = [];

        for (let i = 0, len = preCalculateNodeList.length; i < len; i++) {
            const node = preCalculateNodeList[i];

            const value = formulaInterpreter.executePreCalculateNode(node) as BaseReferenceObject;

            const gridRange = value.toGridRange();

            rangeList.push(gridRange);
        }

        for (let i = 0, len = referenceFunctionList.length; i < len; i++) {
            const node = referenceFunctionList[i];
            let value: BaseReferenceObject;
            if (formulaInterpreter.checkAsyncNode(node)) {
                value = (await formulaInterpreter.executeAsync(node)) as BaseReferenceObject;
            } else {
                value = formulaInterpreter.execute(node) as BaseReferenceObject;
            }

            const gridRange = value.toGridRange();

            rangeList.push(gridRange);
        }

        return rangeList;
    }

    private _makeDependency(treeList: FormulaDependencyTree[]) {
        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];
            for (let m = 0, mLen = treeList.length; m < mLen; m++) {
                const treeMatch = treeList[i];
                if (tree === treeMatch) {
                    continue;
                }

                if (tree.dependency(treeMatch)) {
                    tree.pushChildren(treeMatch);
                }
            }
        }
    }

    private _calculateRunList(treeList: FormulaDependencyTree[]) {
        let stack = treeList;
        const formulaRunList = [];
        while (stack.length > 0) {
            let tree = stack.pop();

            if (tree === undefined || tree.isSkip()) {
                continue;
            }

            if (tree.isAdded()) {
                formulaRunList.push(tree);
                continue;
            }

            const cacheStack: FormulaDependencyTree[] = [];

            for (let i = 0, len = tree.parents.length; i < len; i++) {
                const parentTree = tree.parents[i];
                cacheStack.push(parentTree);
            }

            if (cacheStack.length == 0) {
                formulaRunList.push(tree);
                tree.setSkip();
            } else {
                tree.setAdded();
                stack.push(tree);
                stack = stack.concat(cacheStack);
            }
        }

        return formulaRunList.reverse();
    }

    async generate(updateRangeList: IGridRange[] = [], interpreterDatasetConfig?: IInterpreterDatasetConfig) {
        this.updateRangeFlatten(updateRangeList);

        const formulaInterpreter = Interpreter.create(interpreterDatasetConfig);

        const formulaDataKeys = Object.keys(this._formulaData);

        const treeList: FormulaDependencyTree[] = [];

        for (let sheetId of formulaDataKeys) {
            const matrixData = new ObjectMatrix(this._formulaData[sheetId]);

            matrixData.forEach((row, rangeRow) => {
                rangeRow.forEach((column, formulaData) => {
                    const formulaString = formulaData.formula;
                    const node = generateAstNode(formulaString);

                    const FDtree = new FormulaDependencyTree();

                    FDtree.node = node;
                    FDtree.formula = formulaString;
                    FDtree.sheetId = sheetId;
                    FDtree.row = row;
                    FDtree.column = column;

                    treeList.push(FDtree);
                });
            });
        }

        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];
            const rangeList = await this._getRangeListByNode(tree.node, formulaInterpreter);
            for (let r = 0, rLen = rangeList.length; r < rLen; r++) {
                tree.pushRangeList(rangeList[r]);
            }
        }

        this._makeDependency(treeList);

        return Promise.resolve(this._calculateRunList(treeList));
    }

    static create(formulaData: FormulaDataType) {
        return new FormulaDependencyGenerator(formulaData);
    }
}
