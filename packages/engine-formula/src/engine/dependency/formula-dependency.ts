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

import type { IRange, IUnitRange, Nullable } from '@univerjs/core';
import type { IFeatureDirtyRangeType, IFormulaData, IOtherFormulaData, IUnitData } from '../../basics/common';

import type { ErrorType } from '../../basics/error-type';
import type { IFormulaDirtyData } from '../../services/current-data.service';
import type { IFeatureCalculationManagerParam } from '../../services/feature-calculation-manager.service';
import type { IAllRuntimeData } from '../../services/runtime.service';
import type { LexerNode } from '../analysis/lexer-node';
import type { AstRootNode, FunctionNode, PrefixNode, SuffixNode } from '../ast-node';
import type { BaseAstNode } from '../ast-node/base-ast-node';
import type { BaseReferenceObject } from '../reference-object/base-reference-object';
import type { PreCalculateNodeType } from '../utils/node-type';
import { Disposable, Inject, ObjectMatrix } from '@univerjs/core';
import { FormulaAstLRU } from '../../basics/cache-lru';
import { ERROR_TYPE_SET } from '../../basics/error-type';
import { prefixToken, suffixToken } from '../../basics/token';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IDependencyManagerService } from '../../services/dependency-manager.service';
import { IFeatureCalculationManagerService } from '../../services/feature-calculation-manager.service';
import { IOtherFormulaManagerService } from '../../services/other-formula-manager.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { Lexer } from '../analysis/lexer';
import { AstTreeBuilder } from '../analysis/parser';
import { ErrorNode } from '../ast-node/base-ast-node';
import { NodeType } from '../ast-node/node-type';
import { Interpreter } from '../interpreter/interpreter';
import { FormulaDependencyTree } from './dependency-tree';

const FORMULA_CACHE_LRU_COUNT = 100000;

interface IFeatureFormulaParam {
    unitId: string;
    subUnitId: string;
    featureId: string;
}

export class FormulaDependencyGenerator extends Disposable {
    private _formulaASTCache = new FormulaAstLRU<AstRootNode>(FORMULA_CACHE_LRU_COUNT);
    private _updateRangeFlattenCache = new Map<string, Map<string, IRange[]>>();

    constructor(
        @IFormulaCurrentConfigService private readonly _currentConfigService: IFormulaCurrentConfigService,
        @IFormulaRuntimeService private readonly _runtimeService: IFormulaRuntimeService,
        @IOtherFormulaManagerService private readonly _otherFormulaManagerService: IOtherFormulaManagerService,
        @IFeatureCalculationManagerService
        private readonly _featureCalculationManagerService: IFeatureCalculationManagerService,
        @Inject(Interpreter) private readonly _interpreter: Interpreter,
        @Inject(AstTreeBuilder) private readonly _astTreeBuilder: AstTreeBuilder,
        @Inject(Lexer) private readonly _lexer: Lexer,
        @IDependencyManagerService private readonly _dependencyManagerService: IDependencyManagerService
    ) {
        super();
    }

    override dispose(): void {
        this._formulaASTCache.clear();
    }

    async generate() {
        this._updateRangeFlatten();
        // const formulaInterpreter = Interpreter.create(interpreterDatasetConfig);

        const formulaData = this._currentConfigService.getFormulaData();

        const otherFormulaData = this._otherFormulaManagerService.getOtherFormulaData();

        const unitData = this._currentConfigService.getUnitData();

        const treeList = await this._generateTreeList(formulaData, otherFormulaData, unitData);

        const updateTreeList = this._getUpdateTreeListAndMakeDependency(treeList);

        let finalTreeList = this._calculateRunList(updateTreeList);

        const hasFeatureCalculation = this._dependencyFeatureCalculation(finalTreeList);

        if (hasFeatureCalculation) {
            finalTreeList.forEach((tree) => {
                tree.resetState();
            });
            finalTreeList = this._calculateRunList(finalTreeList);
        }

        const isCycleDependency = this._checkIsCycleDependency(finalTreeList);

        if (isCycleDependency) {
            this._runtimeService.enableCycleDependency();
        }

        return Promise.resolve(finalTreeList);
    }

    private _isCyclicUtil(
        node: FormulaDependencyTree,
        visited: Set<FormulaDependencyTree>,
        recursionStack: Set<FormulaDependencyTree>
    ) {
        if (!visited.has(node)) {
            // Mark the current node as visited and part of recursion stack
            visited.add(node);
            recursionStack.add(node);

            // Recur for all the children of this node
            for (let i = 0; i < node.children.length; i++) {
                if (!visited.has(node.children[i]) && this._isCyclicUtil(node.children[i], visited, recursionStack)) {
                    return true;
                }
                if (recursionStack.has(node.children[i])) {
                    return true;
                }
            }
        }
        recursionStack.delete(node); // remove the node from recursion stack
        return false;
    }

    private _checkIsCycleDependency(treeList: FormulaDependencyTree[]) {
        const visited = new Set<FormulaDependencyTree>();
        const recursionStack = new Set<FormulaDependencyTree>();

        // Call the recursive helper function to detect cycle in different
        // DFS trees
        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];
            const isCycle = this._isCyclicUtil(tree, visited, recursionStack);
            if (isCycle === true) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate nodes for the dependency tree, where each node contains all the reference data ranges included in each formula.
     * @param formulaData
     */
    private async _generateTreeList(
        formulaData: IFormulaData,
        otherFormulaData: IOtherFormulaData,
        unitData: IUnitData
    ) {
        const formulaDataKeys = Object.keys(formulaData);

        const otherFormulaDataKeys = Object.keys(otherFormulaData);

        const treeList: FormulaDependencyTree[] = [];

        // Recalculation can only be triggered after clearing the cache. For example, if a calculation error is reported for a non-existent formula and a custom formula is registered later, all formulas need to be calculated forcibly.
        const forceCalculate = this._currentConfigService.isForceCalculate();
        if (forceCalculate) {
            this._dependencyManagerService.reset();
            this._formulaASTCache.clear();
        }

        this._registerFormulas(formulaDataKeys, formulaData, unitData, treeList);

        this._registerOtherFormulas(otherFormulaData, otherFormulaDataKeys, treeList);

        this._registerFeatureFormulas(treeList);

        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];

            this._runtimeService.setCurrent(
                tree.row,
                tree.column,
                tree.rowCount,
                tree.columnCount,
                tree.subUnitId,
                tree.unitId
            );

            if (tree.node == null) {
                continue;
            }

            const rangeList = await this._getRangeListByNode(tree.node);
            tree.pushRangeList(rangeList);

            if (!tree.isCache) {
                this._dependencyManagerService.addDependencyRTreeCache(tree);
            }
        }

        return treeList;
    }

    private _registerFeatureFormulas(treeList: FormulaDependencyTree[]) {
        /**
         * Register the external application relying on 'ref' into the formula system,
         * which can determine the execution timing of the external application
         * registration Executor based on the dependency relationship.
         */
        const featureMap = this._featureCalculationManagerService.getReferenceExecutorMap();
        featureMap.forEach((subUnitMap, _) => {
            subUnitMap.forEach((featureMap, _) => {
                featureMap.forEach((params, featureId) => {
                    const treeCache = this._dependencyManagerService.getFeatureFormulaDependency(params.unitId, params.subUnitId, featureId);
                    if (treeCache) {
                        treeCache.isCache = true;
                        return;
                    }
                    treeList.push(this._getFeatureFormulaTree(featureId, params));
                });
            });
        });
    }

    private _getFeatureFormulaTree(featureId: string, params: IFeatureCalculationManagerParam) {
        const { unitId, subUnitId, dependencyRanges, getDirtyData } = params;

        const FDtree = new FormulaDependencyTree();

        FDtree.unitId = unitId;
        FDtree.subUnitId = subUnitId;

        FDtree.getDirtyData = getDirtyData;

        FDtree.featureId = featureId;

        FDtree.rangeList = dependencyRanges;

        this._dependencyManagerService.addFeatureFormulaDependency(unitId, subUnitId, featureId, FDtree);

        return FDtree;
    }

    private _registerOtherFormulas(otherFormulaData: IOtherFormulaData, otherFormulaDataKeys: string[], treeList: FormulaDependencyTree[]) {
        /**
         * Register formulas in doc, slide, and other types of applications.
         */
        for (const unitId of otherFormulaDataKeys) {
            const subComponentData = otherFormulaData[unitId];

            if (subComponentData == null) {
                continue;
            }

            const subComponentKeys = Object.keys(subComponentData);

            for (const subUnitId of subComponentKeys) {
                const subFormulaData = subComponentData[subUnitId];

                if (subFormulaData == null) {
                    continue;
                }

                const subFormulaDataKeys = Object.keys(subFormulaData);

                for (const subFormulaDataId of subFormulaDataKeys) {
                    const treeCache = this._dependencyManagerService.getOtherFormulaDependency(unitId, subUnitId, subFormulaDataId);
                    if (treeCache) {
                        treeCache.isCache = true;
                        continue;
                    }

                    const formulaDataItem = subFormulaData[subFormulaDataId];

                    const { f: formulaString } = formulaDataItem;

                    const node = this._generateAstNode(unitId, formulaString);

                    const FDtree = new FormulaDependencyTree();

                    FDtree.node = node;
                    FDtree.formula = formulaString;
                    FDtree.unitId = unitId;
                    FDtree.subUnitId = subUnitId;

                    FDtree.formulaId = subFormulaDataId;

                    this._dependencyManagerService.addOtherFormulaDependency(unitId, subUnitId, subFormulaDataId, FDtree);

                    treeList.push(FDtree);
                }
            }
        }
    }

    private _registerFormulas(formulaDataKeys: string[], formulaData: IFormulaData, unitData: IUnitData, treeList: FormulaDependencyTree[]) {
        /**
         * Register formulas in the sheet.
         */
        for (const unitId of formulaDataKeys) {
            const sheetData = formulaData[unitId];

            if (sheetData == null) {
                continue;
            }

            const sheetDataKeys = Object.keys(sheetData);

            for (const sheetId of sheetDataKeys) {
                const matrixData = new ObjectMatrix(sheetData[sheetId] || {});

                matrixData.forValue((row, column, formulaDataItem) => {
                    // const formulaString = formulaDataItem.f;
                    if (formulaDataItem == null) {
                        return true;
                    }
                    const { f: formulaString, x, y } = formulaDataItem;

                    const treeCache = this._dependencyManagerService.getFormulaDependency(unitId, sheetId, row, column);
                    if (treeCache) {
                        treeCache.isCache = true;
                        return true;
                    }

                    const node = this._generateAstNode(unitId, formulaString, x, y);

                    const FDtree = new FormulaDependencyTree();

                    const sheetItem = unitData[unitId][sheetId];

                    FDtree.node = node;
                    FDtree.formula = formulaString;
                    FDtree.unitId = unitId;
                    FDtree.subUnitId = sheetId;
                    FDtree.row = row;
                    FDtree.column = column;

                    FDtree.rowCount = sheetItem.rowCount;
                    FDtree.columnCount = sheetItem.columnCount;

                    this._dependencyManagerService.addFormulaDependency(unitId, sheetId, row, column, FDtree);

                    treeList.push(FDtree);
                });
            }
        }
    }

    /**
     * Break down the dirty areas into ranges for subsequent matching.
     */
    private _updateRangeFlatten() {
        const forceCalculate = this._currentConfigService.isForceCalculate();
        const dirtyRanges = this._currentConfigService.getDirtyRanges();
        if (forceCalculate) {
            return;
        }
        this._updateRangeFlattenCache.clear();
        for (let i = 0; i < dirtyRanges.length; i++) {
            const gridRange = dirtyRanges[i];
            const range = gridRange.range;
            const sheetId = gridRange.sheetId;
            const unitId = gridRange.unitId;

            this._addFlattenCache(unitId, sheetId, range);
        }
    }

    private _generateAstNode(unitId: string, formulaString: string, refOffsetX: number = 0, refOffsetY: number = 0) {
        // refOffsetX and refOffsetY are separated by -, otherwise x:1 y:10 will be repeated with x:11 y:0
        let astNode: Nullable<AstRootNode> = this._formulaASTCache.get(`${unitId}${formulaString}##${refOffsetX}-${refOffsetY}`);

        if (astNode && !this._isDirtyDefinedForNode(astNode)) {
            return astNode;
        }

        const lexerNode = this._lexer.treeBuilder(formulaString);

        if (ERROR_TYPE_SET.has(lexerNode as ErrorType)) {
            return ErrorNode.create(lexerNode as ErrorType);
        }

        // suffix Express, 1+(3*4=4)*5+1 convert to 134*4=5*1++

        astNode = this._astTreeBuilder.parse(lexerNode as LexerNode, refOffsetX, refOffsetY);

        if (astNode == null) {
            throw new Error('astNode is null');
        }

        this._formulaASTCache.set(`${unitId}${formulaString}##${refOffsetX}-${refOffsetY}`, astNode);

        return astNode;
    }

    private _addFlattenCache(unitId: string, sheetId: string, range: IRange) {
        let unitMatrix = this._updateRangeFlattenCache.get(unitId);
        if (unitMatrix == null) {
            unitMatrix = new Map<string, IRange[]>();
            this._updateRangeFlattenCache.set(unitId, unitMatrix);
        }

        let ranges = unitMatrix.get(sheetId);

        if (ranges == null) {
            ranges = [];
            unitMatrix.set(sheetId, ranges);
        }

        ranges.push(range);

        // let sheetMatrix = unitMatrix.get(sheetId);
        // if (!sheetMatrix) {
        //     sheetMatrix = new ObjectMatrix<IRange>();
        //     unitMatrix.set(sheetId, sheetMatrix);
        // }

        // // don't use destructuring assignment
        // const startRow = range.startRow;

        // const startColumn = range.startColumn;

        // const endRow = range.endRow;

        // const endColumn = range.endColumn;

        // // don't use chained calls
        // for (let r = startRow; r <= endRow; r++) {
        //     for (let c = startColumn; c <= endColumn; c++) {
        //         sheetMatrix.setValue(r, c, true);
        //     }
        // }
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
            if (this._isPreCalculateNode(item)) {
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

    private async _executeNode(node: PreCalculateNodeType | FunctionNode) {
        let value: BaseReferenceObject;
        if (this._interpreter.checkAsyncNode(node)) {
            value = (await this._interpreter.executeAsync(node)) as BaseReferenceObject;
        } else {
            value = this._interpreter.execute(node) as BaseReferenceObject;
        }
        return value;
    }

    /**
     * Calculate the range required for collection in advance,
     * including references and location functions (such as OFFSET, INDIRECT, INDEX, etc.).
     * @param node
     */
    private async _getRangeListByNode(node: BaseAstNode) {
        // ref function in offset indirect INDEX
        const preCalculateNodeList: PreCalculateNodeType[] = [];
        const referenceFunctionList: FunctionNode[] = [];

        this._nodeTraversalRef(node, preCalculateNodeList);

        this._nodeTraversalReferenceFunction(node, referenceFunctionList);

        const rangeList: IUnitRange[] = [];

        for (let i = 0, len = preCalculateNodeList.length; i < len; i++) {
            const node = preCalculateNodeList[i];

            const value: BaseReferenceObject = await this._executeNode(node);

            const gridRange = value.toUnitRange();

            // const token = serializeRangeToRefString({ ...gridRange, sheetName: this._currentConfigService.getSheetName(gridRange.unitId, gridRange.sheetId) });

            rangeList.push(gridRange);
        }

        for (let i = 0, len = referenceFunctionList.length; i < len; i++) {
            const node = referenceFunctionList[i];
            const value: BaseReferenceObject = await this._executeNode(node);

            const gridRange = value.toUnitRange();

            // const token = serializeRangeToRefString({ ...gridRange, sheetName: this._currentConfigService.getSheetName(gridRange.unitId, gridRange.sheetId) });

            rangeList.push(gridRange);
        }

        return rangeList;
    }

    private _isDirtyDefinedForNode(node: BaseAstNode) {
        const definedNameMap = this._currentConfigService.getDirtyDefinedNameMap();
        const executeUnitId = this._currentConfigService.getExecuteUnitId();
        if (executeUnitId != null && definedNameMap[executeUnitId] != null) {
            const names = Object.keys(definedNameMap[executeUnitId]!);
            for (let i = 0, len = names.length; i < len; i++) {
                const name = names[i];
                if (node.hasDefinedName(name)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Build a formula dependency tree based on the dependency relationships.
     * @param treeList
     */
    private _getUpdateTreeListAndMakeDependency(treeList: FormulaDependencyTree[]) {
        const newTreeList: FormulaDependencyTree[] = [];
        const existTree = new Set<FormulaDependencyTree>();
        const forceCalculate = this._currentConfigService.isForceCalculate();

        const allTree: FormulaDependencyTree[] = this._dependencyManagerService.buildDependencyTree(treeList);

        for (let i = 0, len = allTree.length; i < len; i++) {
            const tree = allTree[i];

            // if (dependencyAlgorithm) {
            //     dependencyTreeCache.dependency(tree);
            // } else {
            //     for (let m = 0, mLen = treeList.length; m < mLen; m++) {
            //         const treeMatch = treeList[m];
            //         if (tree === treeMatch) {
            //             continue;
            //         }

            //         if (tree.dependency(treeMatch)) {
            //             tree.pushChildren(treeMatch);
            //         }
            //     }
            // }

            /**
             * forceCalculate: Mandatory calculation, adding all formulas to dependencies
             * tree.dependencyRange: Formula dependent modification range
             * includeTree: modification range contains formula
             */
            if (
                (
                    forceCalculate ||
                    tree.dependencySheetName(this._currentConfigService.getDirtyNameMap()) ||
                    (this._isInDirtyRange(tree, this._currentConfigService.getDirtyRanges()) && !tree.isExcludeRange(this._currentConfigService.getExcludedRange())) ||
                    this._includeTree(tree)
                ) && !existTree.has(tree)
            ) {
                newTreeList.push(tree);
                existTree.add(tree);
            }
        }

        return newTreeList;
    }

    private _isInDirtyRange(tree: FormulaDependencyTree, dirtyRanges: IUnitRange[] = []) {
        // const dirtyRanges = this._currentConfigService.getDirtyRanges();
        const treeIds = this._dependencyManagerService.searchDependency(dirtyRanges);
        if (treeIds.has(tree.treeId)) {
            return true;
        }
        // for (let i = 0, len = treeIds.length; i < len; i++) {
        //     const treeId = treeIds[i].id;
        //     if (treeId === tree.treeId) {
        //         return true;
        //     }
        // }
        return false;
    }

    private _dependencyFeatureCalculation(newTreeList: FormulaDependencyTree[]) {
        /**
         * Clear the dependency relationships of all featureCalculation nodes in the tree.
         * Because each execution requires rebuilding the reverse dependencies,
         * the previous dependencies may become outdated due to data changes in applications such as pivot tables,
         * which can result in an outdated dirty mark range.
         */
        this._clearFeatureCalculationNode(newTreeList);

        let hasFeatureCalculation = false;

        const featureMap = this._featureCalculationManagerService.getReferenceExecutorMap();
        featureMap.forEach((subUnitMap, _) => {
            subUnitMap.forEach((featureMap, _) => {
                featureMap.forEach((params, featureId) => {
                    const { unitId, subUnitId, getDirtyData } = params;
                    const allDependency = getDirtyData(this._currentConfigService.getDirtyData() as IFormulaDirtyData, this._runtimeService.getAllRuntimeData() as IAllRuntimeData);
                    const dirtyRanges = this._convertDirtyRangesToUnitRange(allDependency.dirtyRanges);
                    const intersectTrees = this._intersectFeatureCalculation(dirtyRanges, newTreeList, { unitId, subUnitId, featureId });
                    if (intersectTrees.length > 0) {
                        let featureTree = this._getExistTreeList({ unitId, subUnitId, featureId }, newTreeList);
                        if (featureTree == null) {
                            featureTree = this._getFeatureFormulaTree(featureId, params);
                            newTreeList.push(featureTree);
                        }
                        featureTree.parents = [];
                        intersectTrees.forEach((tree) => {
                            if (tree.children.includes(featureTree!)) {
                                return;
                            }
                            tree.pushChildren(featureTree!);
                        });

                        hasFeatureCalculation = true;
                    }
                });
            });
        });

        return hasFeatureCalculation;
    }

    private _clearFeatureCalculationNode(newTreeList: FormulaDependencyTree[]) {
        const featureMap = this._featureCalculationManagerService.getReferenceExecutorMap();

        newTreeList.forEach((tree) => {
            tree.children = tree.children.filter((child) => {
                if (!child.featureId) {
                    return true;
                }
                if (featureMap.get(tree.unitId)?.get(tree.subUnitId)?.has(child.featureId)) {
                    return false;
                }
                return true;
            });

            tree.parents = tree.parents.filter((parent) => {
                if (!parent.featureId) {
                    return true;
                }
                if (featureMap.get(tree.unitId)?.get(tree.subUnitId)?.has(parent.featureId)) {
                    return false;
                }
                return true;
            });
        });
    }

    private _getExistTreeList(param: IFeatureFormulaParam, treeList: FormulaDependencyTree[]) {
        const { unitId, subUnitId, featureId } = param;
        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];
            if (tree.unitId === unitId && tree.subUnitId === subUnitId && tree.featureId === featureId) {
                return tree;
            }
        }
    }

    private _convertDirtyRangesToUnitRange(dirtyRanges: IFeatureDirtyRangeType) {
        const unitRange: IUnitRange[] = [];
        for (const unitId in dirtyRanges) {
            const unitMap = dirtyRanges[unitId];
            for (const subUnitId in unitMap) {
                const ranges = unitMap[subUnitId];
                ranges.forEach((range) => {
                    unitRange.push({
                        unitId,
                        sheetId: subUnitId,
                        range,
                    });
                });
            }
        }
        return unitRange;
    }

    private _intersectFeatureCalculation(dirtyRanges: IUnitRange[], newTreeList: FormulaDependencyTree[], param: IFeatureFormulaParam) {
        const dependencyTree = [];
        for (let i = 0, len = newTreeList.length; i < len; i++) {
            const tree = newTreeList[i];
            if (tree.unitId === param.unitId && tree.subUnitId === param.subUnitId && tree.featureId === param.featureId) {
                continue;
            }
            const isAdded = this._isInDirtyRange(tree, dirtyRanges);
            if (isAdded) {
                dependencyTree.push(tree);
            }
        }
        return dependencyTree;
    }

    private _includeTreeFeature(tree: FormulaDependencyTree) {
        const unitId = tree.unitId;
        const subUnitId = tree.subUnitId;
        /**
         * Perform active dirty detection for the feature.
         */
        const featureId = tree.featureId;
        if (featureId != null) {
            const featureMap = this._currentConfigService.getDirtyUnitFeatureMap();
            const state = featureMap?.[unitId]?.[subUnitId]?.[featureId];
            if (state != null) {
                return true;
            }
        }

        return false;
    }

    private _includeOtherFormula(tree: FormulaDependencyTree) {
        const unitId = tree.unitId;
        const subUnitId = tree.subUnitId;
        /**
         * Specify a specific other formula for flagging a functionality as dirty.
         */
        const formulaId = tree.formulaId;
        if (formulaId != null) {
            const otherFormulaMap = this._currentConfigService.getDirtyUnitOtherFormulaMap();
            const state = otherFormulaMap?.[unitId]?.[subUnitId]?.[formulaId];
            if (state != null) {
                return true;
            }
        }

        return false;
    }

    private _includeDefinedName(tree: FormulaDependencyTree) {
        /**
         * Detect whether the dirty map contains a defined name.
         */
        const node = tree.node;
        if (node != null) {
            const dirtyDefinedName = this._isDirtyDefinedForNode(node);
            if (dirtyDefinedName) {
                return true;
            }
        }
        return false;
    }

    /**
     * Determine whether all ranges of the current node exist within the dirty area.
     * If they are within the dirty area, return true, indicating that this node needs to be calculated.
     * @param tree
     */
    private _includeTree(tree: FormulaDependencyTree) {
        const unitId = tree.unitId;
        const subUnitId = tree.subUnitId;

        if (this._includeTreeFeature(tree) === true) {
            return true;
        }

        if (this._includeOtherFormula(tree) === true) {
            return true;
        }

        if (this._includeDefinedName(tree) === true) {
            return true;
        }

        const excludedCell = this._currentConfigService.getExcludedRange()?.[unitId]?.[subUnitId];

        /**
         * The position of the primary cell in the array formula needs to be excluded when calculating the impact of the array formula on dependencies.
         * This is because its impact was already considered during the first calculation.
         */
        let isExclude = false;
        excludedCell?.forValue((row, column) => {
            if (tree.row === row && tree.column === column) {
                isExclude = true;
                return false;
            }
        });

        if (isExclude) {
            return false;
        }

        /**
         * When a worksheet is inserted or deleted,
         * the formulas within it need to be calculated.
         */
        if (this._currentConfigService.getDirtyNameMap()[unitId]?.[subUnitId] != null) {
            return true;
        }

        if (!this._updateRangeFlattenCache.has(unitId)) {
            return false;
        }

        const sheetRangeMap = this._updateRangeFlattenCache.get(unitId)!;

        if (!sheetRangeMap.has(subUnitId)) {
            return false;
        }

        const ranges = sheetRangeMap.get(subUnitId)!;

        for (const range of ranges) {
            if (tree.inRangeData(range)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate the final formula calculation order array by traversing the dependency tree established via depth-first search.
     * @param treeList
     */
    private _calculateRunList(treeList: FormulaDependencyTree[]) {
        let stack = treeList;
        const formulaRunList = [];
        while (stack.length > 0) {
            const tree = stack.pop();

            if (tree === undefined || tree.isSkip()) {
                continue;
            }

            if (tree.isAdded()) {
                formulaRunList.push(tree);
                // If cacheStack is empty, that is, all parent nodes of the node have been processed, call setSkip() to mark the node as skipped. The premise of this is that the node should have been added to the formulaRunList, that is, the calculation is completed.
                // Make sure setSkip is called after the node is added to formulaRunList to avoid skipping processing early.
                tree.setSkip();
                continue;
            }

            const cacheStack: FormulaDependencyTree[] = [];

            for (let i = 0, len = tree.parents.length; i < len; i++) {
                const parentTree = tree.parents[i];
                if (parentTree.isAdded() || tree.isSkip()) {
                    continue;
                }
                cacheStack.push(parentTree);
            }

            if (cacheStack.length === 0) {
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
}
