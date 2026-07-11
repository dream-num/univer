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

import type { IRange, IUnitRange, Nullable, Workbook } from '@univerjs/core';
import type {
    IFeatureDirtyRangeType,
    IFormulaData,
    IFormulaDataItem,
    IOtherFormulaData,
    IUnitData,
} from '../../basics/common';
import type { IFormulaDirtyData } from '../../services/current-data.service';
import type { IFeatureCalculationManagerParam } from '../../services/feature-calculation-manager.service';
import type { IAllRuntimeData } from '../../services/runtime.service';
import type { FunctionNode, PrefixNode, SuffixNode } from '../ast-node';
import type { BaseAstNode } from '../ast-node/base-ast-node';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { IExecuteAstNodeData } from '../utils/ast-node-tool';
import type { PreCalculateNodeType } from '../utils/node-type';
import type {
    IFormulaDependencyTree,
    IFormulaDependencyTreeFullJson,
    IFormulaDependencyTreeJson,
    IFormulaDependentsAndInRangeResults,
} from './dependency-tree';
import {
    createIdentifier,
    Disposable,
    Inject,
    IUniverInstanceService,
    ObjectMatrix,
    RTree,
    UniverInstanceType,
} from '@univerjs/core';
import { prefixToken, suffixToken } from '../../basics/token';
import { IFormulaCurrentConfigService } from '../../services/current-data.service';
import { IDependencyManagerService } from '../../services/dependency-manager.service';
import { IFeatureCalculationManagerService } from '../../services/feature-calculation-manager.service';
import { IOtherFormulaManagerService } from '../../services/other-formula-manager.service';
import { IFormulaRuntimeService } from '../../services/runtime.service';
import { Lexer } from '../analysis/lexer';
import { LexerTreeBuilder } from '../analysis/lexer-tree-builder';
import { AstTreeBuilder } from '../analysis/parser';
import { NodeType } from '../ast-node/node-type';
import { Interpreter } from '../interpreter/interpreter';
import { FORMULA_AST_CACHE, generateAstNode, includeDefinedName } from '../utils/generate-ast-node';
import {
    FormulaDependencyTree,
    FormulaDependencyTreeModel,
    FormulaDependencyTreeType,
    FormulaDependencyTreeVirtual,
} from './dependency-tree';

export function generateRandomDependencyTreeId(dependencyManagerService: IDependencyManagerService): number {
    const idNum = dependencyManagerService.getLastTreeId() || 0;
    return idNum;
}

export interface IFormulaDependencyGenerator {
    generate(isCalculateTreeModel?: boolean): Promise<IFormulaDependencyTree[]>;
    getAllDependencyJson(): Promise<IFormulaDependencyTreeJson[]>;
    getCellDependencyJson(unitId: string, sheetId: string, row: number, column: number): Promise<IFormulaDependencyTreeFullJson | undefined>;
    getRangeDependents(unitRanges: IUnitRange[]): Promise<IFormulaDependencyTreeJson[]>;
    getInRangeFormulas(unitRanges: IUnitRange[]): Promise<IFormulaDependencyTreeJson[]>;
    getRangeDependentsAndInRangeFormulas(unitRanges: IUnitRange[]): Promise<IFormulaDependentsAndInRangeResults>;
}

export const IFormulaDependencyGenerator = createIdentifier<IFormulaDependencyGenerator>('engine-formula.dependency-generator');

export class FormulaDependencyGenerator extends Disposable implements IFormulaDependencyGenerator {
    private _updateRangeFlattenCache = new Map<string, Map<string, IRange[]>>();

    protected _dependencyRTreeCacheForAddressFunction: RTree = new RTree();

    protected _dependencyTreeCache = new Map<number, IFormulaDependencyTree>();

    constructor(
        @IFormulaCurrentConfigService protected readonly _currentConfigService: IFormulaCurrentConfigService,
        @IFormulaRuntimeService protected readonly _runtimeService: IFormulaRuntimeService,
        @IOtherFormulaManagerService protected readonly _otherFormulaManagerService: IOtherFormulaManagerService,
        @IFeatureCalculationManagerService
        protected readonly _featureCalculationManagerService: IFeatureCalculationManagerService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Interpreter) private readonly _interpreter: Interpreter,
        @Inject(AstTreeBuilder) protected readonly _astTreeBuilder: AstTreeBuilder,
        @Inject(Lexer) protected readonly _lexer: Lexer,
        @IDependencyManagerService protected readonly _dependencyManagerService: IDependencyManagerService,
        @Inject(LexerTreeBuilder) protected readonly _lexerTreeBuilder: LexerTreeBuilder
    ) {
        super();

        this._initUnitDispose();
    }

    override dispose(): void {
        super.dispose();
        this._dependencyTreeCache.clear();

        this._updateRangeFlattenCache.clear();
        this._dependencyRTreeCacheForAddressFunction.clear();
        FORMULA_AST_CACHE.clear();
    }

    private _initUnitDispose() {
        this.disposeWithMe(
            this._univerInstanceService.getTypeOfUnitDisposed$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
                this._disposeByUnitId(workbook.getUnitId());
            })
        );
    }

    private _disposeByUnitId(unitId: string) {
        FORMULA_AST_CACHE.forEach((_, key) => {
            if (key.startsWith(unitId)) {
                FORMULA_AST_CACHE.delete(key);
            }
        });
    }

    async generate(isCalculateTreeModel = false) {
        this._updateRangeFlatten();
        // const formulaInterpreter = Interpreter.create(interpreterDatasetConfig);

        const formulaData = this._currentConfigService.getFormulaData();

        const otherFormulaData = this._otherFormulaManagerService.getOtherFormulaData();

        const clearDependencyTreeCache = this._currentConfigService.getClearDependencyTreeCache();

        if (clearDependencyTreeCache != null) {
            Object.keys(clearDependencyTreeCache).forEach((unitId) => {
                if (unitId == null) {
                    return;
                }
                Object.keys(clearDependencyTreeCache[unitId]!).forEach((subUnitId) => {
                    if (subUnitId == null) {
                        return;
                    }

                    this._dependencyManagerService.clearOtherFormulaDependency(unitId, subUnitId);
                    this._dependencyManagerService.clearFeatureFormulaDependency(unitId, subUnitId);
                    this._dependencyManagerService.clearFormulaDependency(unitId, subUnitId);
                });
            });
        }

        const unitData = this._currentConfigService.getUnitData();

        const treeList = await this._generateTreeList(formulaData, otherFormulaData, unitData);

        this._dependencyManagerService.openKdTree();

        const updateTreeList = this._getUpdateTreeListAndMakeDependency();

        const finalTreeList = this._calculateRunList(updateTreeList);

        const isCycleDependency = this._checkIsCycleDependency(finalTreeList);

        if (isCycleDependency) {
            this._runtimeService.enableCycleDependency();
        }

        if (isCalculateTreeModel) {
            this._runtimeService.setDependencyTreeModelData(
                this._getAllDependencyJson(Array.from(this._dependencyTreeCache.values()))
            );
        }

        this._dependencyTreeCache.clear();

        this._dependencyRTreeCacheForAddressFunction.clear();

        this._dependencyManagerService.closeKdTree();

        this._runtimeService.clearArrayObjectCache();

        return Promise.resolve(finalTreeList);
    }

    private _isCyclicUtilMap(treeId: number, colorMap: Map<number, number>): boolean {
        const WHITE = 0;
        const GRAY = 1;
        const BLACK = 2;
        const stack: number[] = [treeId];

        while (stack.length > 0) {
            const currentTreeId = stack[stack.length - 1];
            const color = colorMap.get(currentTreeId) || WHITE;

            if (color === WHITE) {
                colorMap.set(currentTreeId, GRAY);
                const node = this._dependencyTreeCache.get(currentTreeId);
                if (node == null) {
                    colorMap.set(currentTreeId, BLACK);
                    stack.pop();
                    continue;
                }

                const parents = this._dependencyManagerService.searchDependency(node.toRTreeItem());
                for (const parentTreeId of parents) {
                    const parentColor = colorMap.get(parentTreeId) || WHITE;
                    if (parentColor === GRAY) {
                        return true; // 发现环
                    } else if (parentColor === WHITE) {
                        stack.push(parentTreeId);
                    }
                }
            } else {
                colorMap.set(currentTreeId, BLACK);
                stack.pop();
            }
        }

        return false;
    }

    protected _checkIsCycleDependency(treeList: IFormulaDependencyTree[]): boolean {
        const colorMap = new Map<number, number>();

        for (const tree of treeList) {
            if (!colorMap.has(tree.treeId)) {
                if (this._isCyclicUtilMap(tree.treeId, colorMap)) {
                    return true;
                }
            }
        }

        colorMap.clear();

        return false;
    }

    protected _getFeatureFormulaTree(featureId: string, treeId: Nullable<number>, params: IFeatureCalculationManagerParam) {
        const { unitId, subUnitId, dependencyRanges, getDirtyData } = params;
        const treeIdNum = treeId || generateRandomDependencyTreeId(this._dependencyManagerService);
        const FDtree = new FormulaDependencyTree(treeIdNum);

        // FDtree.unitId = unitId;
        // FDtree.subUnitId = subUnitId;

        FDtree.unitId = unitId;
        FDtree.subUnitId = subUnitId;
        FDtree.rangeList = dependencyRanges;
        FDtree.getDirtyData = getDirtyData;

        const allDependency = getDirtyData(this._currentConfigService.getDirtyData() as IFormulaDirtyData, this._runtimeService.getAllRuntimeData() as IAllRuntimeData);
        const dirtyRanges = this._convertDirtyRangesToUnitRange(allDependency.dirtyRanges);

        FDtree.featureDirtyRanges = dirtyRanges;

        FDtree.featureId = featureId;

        FDtree.type = FormulaDependencyTreeType.FEATURE_FORMULA;

        // FDtree.rangeList = dependencyRanges;

        this._dependencyManagerService.addFeatureFormulaDependency(unitId, subUnitId, featureId, FDtree);

        this._dependencyTreeCache.set(FDtree.treeId, FDtree);

        const treeCache = this._dependencyManagerService.getFeatureFormulaDependency(params.unitId, params.subUnitId, featureId);
        if (treeCache) {
            FDtree.isCache = true;
        }

        return FDtree;
    }

    protected _registerOtherFormulas(otherFormulaData: IOtherFormulaData, otherFormulaDataKeys: string[], treeList: IFormulaDependencyTree[]) {
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

                const { rowCount = Infinity, columnCount = Infinity } = this._currentConfigService.getSheetRowColumnCount(unitId, subUnitId) || {};

                const subFormulaDataKeys = Object.keys(subFormulaData);
                for (const subFormulaDataId of subFormulaDataKeys) {
                    const hasOtherFormula = this._dependencyManagerService.hasOtherFormulaDataMainData(subFormulaDataId);
                    const formulaDataItem = subFormulaData[subFormulaDataId];
                    const { f: formulaString, ranges } = formulaDataItem;
                    let isCache = false;
                    if (hasOtherFormula) {
                        isCache = true;
                    }
                    // const node = generateAstNode(unitId, formulaString, this._lexer, this._astTreeBuilder, this._currentConfigService);
                    const { firstRow, firstColumn } = this._getFirstCellOfRange(ranges);
                    const treeMatrix = this._dependencyManagerService.getOtherFormulaDependency(unitId, subUnitId, subFormulaDataId);
                    const firstTreeId = treeMatrix?.getValue(0, 0) ?? generateRandomDependencyTreeId(this._dependencyManagerService);
                    const firstFDtree = new FormulaDependencyTree(firstTreeId);

                    for (let i = 0; i < ranges.length; i++) {
                        const range = ranges[i];
                        const { startRow, startColumn } = range;
                        let { endRow, endColumn } = range;
                        endRow = Math.min(endRow, rowCount - 1);
                        endColumn = Math.min(endColumn, columnCount - 1);
                        for (let r = startRow; r <= endRow; r++) {
                            for (let c = startColumn; c <= endColumn; c++) {
                                const x = c - firstColumn;
                                const y = r - firstRow;
                                if (x === 0 && y === 0) {
                                    // firstFDtree.node = node;
                                    firstFDtree.formula = formulaString;
                                    firstFDtree.unitId = unitId;
                                    firstFDtree.subUnitId = subUnitId;
                                    firstFDtree.formulaId = subFormulaDataId;
                                    firstFDtree.type = FormulaDependencyTreeType.OTHER_FORMULA;
                                    firstFDtree.isCache = isCache;
                                    treeList.push(firstFDtree);
                                    this._dependencyTreeCache.set(firstFDtree.treeId, firstFDtree);
                                    this._dependencyManagerService.addOtherFormulaDependency(unitId, subUnitId, subFormulaDataId, firstFDtree);
                                    this._dependencyManagerService.addFormulaDependencyByDefinedName(firstFDtree);
                                    continue;
                                }

                                const virtual = new FormulaDependencyTreeVirtual();
                                virtual.treeId = treeMatrix?.getValue(x, y) || generateRandomDependencyTreeId(this._dependencyManagerService);

                                virtual.refTree = firstFDtree;
                                virtual.refOffsetX = x;
                                virtual.refOffsetY = y;
                                virtual.isCache = isCache;
                                virtual.type = FormulaDependencyTreeType.OTHER_FORMULA;
                                this._dependencyManagerService.addOtherFormulaDependency(unitId, subUnitId, subFormulaDataId, virtual);
                                this._dependencyManagerService.addFormulaDependencyByDefinedName(virtual);
                                treeList.push(virtual);
                                this._dependencyTreeCache.set(virtual.treeId, virtual);
                            }
                        }
                    }
                    this._dependencyManagerService.addOtherFormulaDependencyMainData(subFormulaDataId);
                }
            }
        }
    }

    protected _registerFormulas(formulaDataKeys: string[], formulaData: IFormulaData, unitData: IUnitData, treeList: IFormulaDependencyTree[]) {
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
                const sIdCache = new Map<string, FormulaDependencyTree>();

                matrixData.forValue((row, column, formulaDataItem) => {
                    // const formulaString = formulaDataItem.f;
                    if (formulaDataItem == null) {
                        return true;
                    }

                    const { x = 0, y = 0, si } = formulaDataItem;

                    if (!(x === 0 && y === 0 && si != null)) {
                        return true;
                    }

                    const FDtree = this._createFDtree(unitId, sheetId, row, column, unitData, formulaDataItem);

                    const treeId = this._dependencyManagerService.getFormulaDependency(unitId, sheetId, row, column);
                    if (treeId != null) {
                        FDtree.treeId = treeId;
                    } else {
                        this._dependencyManagerService.addFormulaDependency(unitId, sheetId, row, column, FDtree);
                        this._dependencyManagerService.addFormulaDependencyByDefinedName(FDtree);
                    }

                    sIdCache.set(si, FDtree);
                    treeList.push(FDtree);

                    this._dependencyTreeCache.set(FDtree.treeId, FDtree);
                });

                matrixData.forValue((row, column, formulaDataItem) => {
                    // const formulaString = formulaDataItem.f;
                    if (formulaDataItem == null) {
                        return true;
                    }

                    const { x = 0, y = 0, si } = formulaDataItem;

                    if (x === 0 && y === 0 && si != null) {
                        return true;
                    }

                    let FDtree: IFormulaDependencyTree;

                    if (si && sIdCache.has(si)) {
                        const cache = sIdCache.get(si)!;
                        FDtree = this._createVirtualFDtree(cache as FormulaDependencyTree, formulaDataItem);
                        // FDtree.rangeList = this._moveRangeList(cache, x, y);
                    } else {
                        FDtree = this._createFDtree(unitId, sheetId, row, column, unitData, formulaDataItem);
                    }

                    const treeId = this._dependencyManagerService.getFormulaDependency(unitId, sheetId, row, column);
                    if (treeId != null) {
                        FDtree.treeId = treeId;
                    } else {
                        this._dependencyManagerService.addFormulaDependency(unitId, sheetId, row, column, FDtree);
                        this._dependencyManagerService.addFormulaDependencyByDefinedName(FDtree);
                    }

                    treeList.push(FDtree);
                    this._dependencyTreeCache.set(FDtree.treeId, FDtree);
                });

                sIdCache.clear();
            }
        }
    }

    protected _createFDtree(unitId: string, sheetId: string, row: number, column: number, unitData: IUnitData, formulaDataItem: IFormulaDataItem) {
        const { f: formulaString, x = 0, y = 0 } = formulaDataItem;

        const FDtree = new FormulaDependencyTree(generateRandomDependencyTreeId(this._dependencyManagerService));

        const sheetItem = unitData[unitId][sheetId];

        // const node = generateAstNode(unitId, formulaString, this._lexer, this._astTreeBuilder, this._currentConfigService);

        // FDtree.node = node;
        FDtree.formula = formulaString;
        FDtree.unitId = unitId;
        FDtree.subUnitId = sheetId;
        FDtree.row = row;
        FDtree.column = column;

        // FDtree.refOffsetX = x;
        // FDtree.refOffsetY = y;

        FDtree.rowCount = sheetItem.rowCount;
        FDtree.columnCount = sheetItem.columnCount;

        return FDtree;
    }

    /**
     * Build a formula dependency tree based on the dependency relationships.
     * @param treeList
     */
    protected _getUpdateTreeListAndMakeDependency() {
        const newTreeList: IFormulaDependencyTree[] = [];
        const existTree = new Set<number>();
        const forceCalculate = this._currentConfigService.isForceCalculate();

        // const allTree: IFormulaDependencyTree[] = Array.from(this._dependencyTreeCache.values());

        const dirtyRanges = this._currentConfigService.getDirtyRanges();
        const treeIds = this._dependencyManagerService.searchDependency(dirtyRanges); // RTree Average case is O(logN + k)
        const addressSearchResults = this._dependencyRTreeCacheForAddressFunction.bulkSearch(dirtyRanges) as Set<number>;
        for (const addressSearchResult of addressSearchResults) {
            treeIds.add(addressSearchResult);
        }

        for (const [treeId, tree] of this._dependencyTreeCache) {
            // const tree = allTree[i];

            /**
             * forceCalculate: Mandatory calculation, adding all formulas to dependencies
             * tree.dependencyRange: Formula dependent modification range
             * includeTree: modification range contains formula
             */
            if (
                (
                    forceCalculate ||
                    tree.isDirty ||
                    tree.dependencySheetName(this._currentConfigService.getDirtyNameMap()) || //O(n) n=tree.rangeList.length
                    (
                        treeIds.has(treeId)// O(1)
                        && !tree.isExcludeRange(this._currentConfigService.getExcludedRange()) //worst O(n^2), best O(n)  n^2=tree.rangeList.length*excludedRange.length, excludedRange.length is usually small
                    )
                ) && !existTree.has(treeId) //O(1)
            ) {
                newTreeList.push(tree);
                existTree.add(treeId);
            }
        }

        for (const [treeId, tree] of this._dependencyTreeCache) {
            if (tree.isVirtual) {
                continue;
            }

            (tree as FormulaDependencyTree).rangeList.length = 0;
        }

        return newTreeList;
    }

    protected _getTreeById(treeId: number) {
        return this._dependencyTreeCache.get(treeId);
    }

    protected _getTreeNode(tree: IFormulaDependencyTree) {
        return generateAstNode(tree.unitId, tree.formula, this._lexer, this._astTreeBuilder, this._currentConfigService, tree.subUnitId);
    }

    // eslint-disable-next-line style/generator-star-spacing
    private * _traverse(treeList: IFormulaDependencyTree[], skippedTreeIds: Set<number>) {
        const stack = treeList;
        const cacheStack: Set<IFormulaDependencyTree> = new Set();

        while (stack.length > 0) {
            const tree = stack.pop();
            cacheStack.clear();
            if (tree === undefined || tree.isSkip()) {
                continue;
            }

            if (tree.isAdded()) {
                yield tree;
                tree.setSkip();
                skippedTreeIds.add(tree.treeId);
                continue;
            }

            const searchResults = this._dependencyManagerService.searchDependency(tree.toRTreeItem(), skippedTreeIds);
            const addressSearchResults = this._dependencyRTreeCacheForAddressFunction.bulkSearch(tree.toRTreeItem(), skippedTreeIds) as Set<number>;
            for (const addressSearchResult of addressSearchResults) {
                searchResults.add(addressSearchResult);
            }

            for (const parentTreeId of searchResults) {
                const parentTree = this._dependencyTreeCache.get(parentTreeId);
                if (!parentTree) {
                    console.error('Dependency tree not found for treeId:', parentTreeId);
                    continue;
                }
                if (parentTree.isAdded() || tree.isSkip()) {
                    continue;
                }
                cacheStack.add(parentTree);
            }

            searchResults.clear();

            if (cacheStack.size === 0) {
                yield tree;
                tree.setSkip();
                skippedTreeIds.add(tree.treeId);
            } else {
                tree.setAdded();
                stack.push(tree);
                for (const cacheTree of cacheStack) {
                    stack.push(cacheTree);
                }
            }
        }

        stack.length = 0;

        cacheStack.clear();
    }

    protected _calculateRunList(treeList: IFormulaDependencyTree[]) {
        const formulaRunList = [];
        const skippedTreeIds = new Set<number>();
        for (const tree of this._traverse(treeList, skippedTreeIds)) {
            formulaRunList.push(tree);
        }

        return formulaRunList;
    }

    protected async _getAllTreeList() {
        await this._initializeGenerateTreeList();

        return Array.from(this._dependencyTreeCache.values());
    }

    protected _getDependencyTreeParenIds(tree: IFormulaDependencyTree): Set<number> {
        return this._dependencyManagerService.searchDependency(tree.toRTreeItem());
    }

    protected _getDependencyTreeChildrenIds(tree: IFormulaDependencyTree): Set<number> {
        const childrenIds = new Set<number>();
        const rangeList = tree.rangeList;
        for (const [treeId, dependencyTree] of this._dependencyTreeCache) {
            for (const unitRange of rangeList) {
                const unitId = unitRange.unitId;
                const sheetId = unitRange.sheetId;
                if (dependencyTree.unitId !== unitId || dependencyTree.subUnitId !== sheetId) {
                    continue;
                }

                const range = unitRange.range;

                if (dependencyTree.inRangeData(range)) {
                    childrenIds.add(treeId);
                    break;
                }
            }
        }
        return childrenIds;
    }

    protected _startFormulaDependencyTreeModel() {
        this._dependencyManagerService.openKdTree();
    }

    protected _endFormulaDependencyTreeModel() {
        this._formulaDependencyTreeModel.clear();
        this._dependencyTreeCache.clear();
        this._dependencyManagerService.closeKdTree();
    }

    /**
     * TODO @DR-Univer: The next step will be to try changing the incoming dirtyRanges to an array, thus avoiding conversion.
     * @param dirtyRanges
     * @returns
     */
    protected _convertDirtyRangesToUnitRange(dirtyRanges: IFeatureDirtyRangeType) {
        const unitRange: IUnitRange[] = [];
        for (const unitId in dirtyRanges) {
            const unitMap = dirtyRanges[unitId];
            for (const subUnitId in unitMap) {
                const ranges = unitMap[subUnitId];
                for (const range of ranges) {
                    unitRange.push({
                        unitId,
                        sheetId: subUnitId,
                        range,
                    });
                }
            }
        }
        return unitRange;
    }

    private _isCyclicUtil(
        treeId: number,
        visited: Set<number>,
        recursionStack: Set<number>
    ) {
        const node = this._dependencyManagerService.getTreeById(treeId);
        if (node == null) {
            return false;
        }
        if (!visited.has(node.treeId)) {
            // Mark the current node as visited and part of recursion stack
            visited.add(node.treeId);
            recursionStack.add(node.treeId);

            // Recur for all the children of this node
            for (const childTreeId of node.children) {
                if (!visited.has(childTreeId) && this._isCyclicUtil(childTreeId, visited, recursionStack)) {
                    return true;
                }
                if (recursionStack.has(childTreeId)) {
                    return true;
                }
            }
        }
        recursionStack.delete(node.treeId); // remove the node from recursion stack
        return false;
    }

    /**
     * Generate nodes for the dependency tree, where each node contains all the reference data ranges included in each formula.
     * @param formulaData
     */
    protected async _generateTreeList(
        formulaData: IFormulaData,
        otherFormulaData: IOtherFormulaData,
        unitData: IUnitData
    ) {
        const formulaDataKeys = Object.keys(formulaData);

        const otherFormulaDataKeys = Object.keys(otherFormulaData);

        const treeList: IFormulaDependencyTree[] = [];

        // Recalculation can only be triggered after clearing the cache. For example, if a calculation error is reported for a non-existent formula and a custom formula is registered later, all formulas need to be calculated forcibly.
        const forceCalculate = this._currentConfigService.isForceCalculate();
        if (forceCalculate) {
            this._dependencyManagerService.reset();
        }

        this._registerFormulas(formulaDataKeys, formulaData, unitData, treeList);

        this._registerOtherFormulas(otherFormulaData, otherFormulaDataKeys, treeList as FormulaDependencyTree[]);

        this._registerFeatureFormulas(treeList as FormulaDependencyTree[]);

        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];

            // After entering the pivot table, no calculation is required if there is no formula
            if (!tree.formula) {
                continue;
            }

            this._runtimeService.setCurrent(
                tree.row,
                tree.column,
                tree.rowCount,
                tree.columnCount,
                tree.subUnitId,
                tree.unitId
            );

            const node = this._getTreeNode(tree);
            tree.isDirty = this._includeTree(tree, node);

            const addressFunctionNodes = this._getAddressFunctionNodeList(node);
            if (addressFunctionNodes.length > 0) {
                tree.addressFunctionNodes = addressFunctionNodes;
            }

            if (tree.isVirtual) {
                continue;
            }

            const rangeList = await this._getRangeListByNode({
                node,
                refOffsetX: tree.refOffsetX,
                refOffsetY: tree.refOffsetY,
            });
            (tree as FormulaDependencyTree).pushRangeList(rangeList);
        }

        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];
            if (tree.isCache) {
                continue;
            }
            this._dependencyManagerService.addDependencyRTreeCache(tree);
        }

        await this._calculateListByFunctionRefNode(treeList);
        return treeList;
    }

    // private _moveRangeList(tree: FormulaDependencyTree, refOffsetX: number, refOffsetY: number) {
    //     const rangeList = tree.rangeList;
    //     const newRangeList = [];
    //     for (let i = 0, len = rangeList.length; i < len; i++) {
    //         const unitRange = rangeList[i];
    //         const newRange = {
    //             unitId: tree.unitId,
    //             sheetId: tree.subUnitId,
    //             range: moveRangeByOffset(unitRange.range, refOffsetX, refOffsetY),
    //         };
    //         newRangeList.push(newRange);
    //     }
    //     return newRangeList;
    // }

    protected _registerFeatureFormulas(treeList: FormulaDependencyTree[]) {
        /**
         * Register the external application relying on 'ref' into the formula system,
         * which can determine the execution timing of the external application
         * registration Executor based on the dependency relationship.
         */
        const featureMap = this._featureCalculationManagerService.getReferenceExecutorMap();
        featureMap.forEach((subUnitMap, _) => {
            subUnitMap.forEach((featureMap, _) => {
                featureMap.forEach((params, featureId) => {
                    const treeId = this._dependencyManagerService.getFeatureFormulaDependency(params.unitId, params.subUnitId, featureId);
                    treeList.push(this._getFeatureFormulaTree(featureId, treeId, params));
                });
            });
        });
    }

    protected _getFirstCellOfRange(ranges: IRange[]) {
        const range = ranges[0];
        return {
            firstRow: range.startRow,
            firstColumn: range.startColumn,
        };
    }

    protected _createVirtualFDtree(tree: FormulaDependencyTree, formulaDataItem: IFormulaDataItem) {
        const { x = 0, y = 0 } = formulaDataItem;
        const virtual = new FormulaDependencyTreeVirtual();
        virtual.treeId = generateRandomDependencyTreeId(this._dependencyManagerService);
        virtual.refTree = tree;
        virtual.refOffsetX = x;
        virtual.refOffsetY = y;

        return virtual;
    }

    /**
     * Break down the dirty areas into ranges for subsequent matching.
     */
    protected _updateRangeFlatten() {
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
                if (item.nodeType === NodeType.UNION) {
                    for (const unionChildItem of item.getChildren()) {
                        if (unionChildItem.nodeType === NodeType.FUNCTION && (unionChildItem as FunctionNode).isAddress()) {
                            this._nodeTraversalRef(unionChildItem, result);
                        }
                    }
                }
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

    private async _executeNode(node: PreCalculateNodeType | FunctionNode, refOffsetX = 0, refOffsetY = 0) {
        let value: BaseReferenceObject;
        const nodeData = {
            node,
            refOffsetX,
            refOffsetY,
        };
        if (this._interpreter.checkAsyncNode(node)) {
            value = (await this._interpreter.executeAsync(nodeData)) as BaseReferenceObject;
        } else {
            value = this._interpreter.execute(nodeData) as BaseReferenceObject;
        }
        return value;
    }

    /**
     * Calculate the range required for collection in advance,
     * including references and location functions (such as OFFSET, INDIRECT, INDEX, etc.).
     * @param node
     */
    protected async _getRangeListByNode(nodeData: IExecuteAstNodeData) {
        // ref function in offset indirect INDEX
        const preCalculateNodeList: PreCalculateNodeType[] = [];

        const refOffsetX = nodeData.refOffsetX;
        const refOffsetY = nodeData.refOffsetY;
        const node = nodeData.node;

        if (node == null) {
            return [];
        }

        this._nodeTraversalRef(node, preCalculateNodeList);
        const rangeList: IUnitRange[] = [];

        for (let i = 0, len = preCalculateNodeList.length; i < len; i++) {
            const node = preCalculateNodeList[i];

            const value: BaseReferenceObject = await this._executeNode(node, refOffsetX, refOffsetY);

            const gridRange = value.toUnitRange();

            // const token = serializeRangeToRefString({ ...gridRange, sheetName: this._currentConfigService.getSheetName(gridRange.unitId, gridRange.sheetId) });

            rangeList.push(gridRange);

            node.setValue(null);
        }

        return rangeList;
    }

    protected _getAddressFunctionNodeList(node: Nullable<BaseAstNode>) {
        const referenceFunctionList: FunctionNode[] = [];

        if (node == null) {
            return [];
        }

        this._nodeTraversalReferenceFunction(node, referenceFunctionList);

        return referenceFunctionList;
    }

    protected async _buildDirtyRangesByAddressFunction(treeDependencyCache: RTree, tree: IFormulaDependencyTree) {
        const addressFunctionNodes = tree.addressFunctionNodes;

        if (addressFunctionNodes.length === 0) {
            return;
        }

        const refOffsetX = tree.refOffsetX;
        const refOffsetY = tree.refOffsetY;

        const addressFunctionRangeList = await this._getRangeListByFunctionRefNode(addressFunctionNodes, refOffsetX, refOffsetY);

        tree.addressFunctionNodes = [];

        this._addDependencyTreeByAddressFunction(tree, addressFunctionRangeList);

        const newSearchResults = treeDependencyCache.bulkSearch(addressFunctionRangeList) as Set<number>;

        const preCalculateTreeList = this._buildTreeNodeById(newSearchResults);

        if (preCalculateTreeList.length === 0) {
            return;
        }

        await this._calculateAddressFunctionRuntimeData(treeDependencyCache, preCalculateTreeList);
    }

    private _executedAddressFunctionNodeIds: Set<number> = new Set();

    protected async _calculateListByFunctionRefNode(treeList: IFormulaDependencyTree[]) {
        const treeDependencyCache = new RTree();
        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];

            treeDependencyCache.insert({
                unitId: tree.unitId,
                sheetId: tree.subUnitId,
                range: {
                    startRow: tree.row,
                    startColumn: tree.column,
                    endRow: tree.row,
                    endColumn: tree.column,
                },
                id: tree.treeId,
            });
        }

        this._executedAddressFunctionNodeIds.clear();

        for (let i = 0, len = treeList.length; i < len; i++) {
            const tree = treeList[i];
            await this._calculateAddressFunction(treeDependencyCache, tree);
        }
    }

    private async _calculateAddressFunction(treeDependencyCache: RTree, tree: IFormulaDependencyTree) {
        const addressFunctionNodes = tree.addressFunctionNodes;

        if (addressFunctionNodes.length === 0) {
            return;
        }

        const refOffsetX = tree.refOffsetX;
        const refOffsetY = tree.refOffsetY;

        this._runtimeService.setCurrent(
            tree.row,
            tree.column,
            tree.rowCount,
            tree.columnCount,
            tree.subUnitId,
            tree.unitId
        );

        const dirtyRanges: IUnitRange[] = [];
        for (let j = 0, len = addressFunctionNodes.length; j < len; j++) {
            const rangeList = await this._getRangeListByNode({
                node: addressFunctionNodes[j],
                refOffsetX,
                refOffsetY,
            });

            dirtyRanges.push(...rangeList);
        }

        const newSearchResults = new Set<number>();
        this._searchDependencyByAddressFunction(treeDependencyCache, dirtyRanges, newSearchResults);

        const preCalculateTreeList: IFormulaDependencyTree[] = this._buildTreeNodeById(newSearchResults);

        if (preCalculateTreeList.length === 0) {
            await this._buildDirtyRangesByAddressFunction(treeDependencyCache, tree);
            return;
        }

        // const finalTreeList = this._calculateRunList(preCalculateTreeList);

        // for(const tree of finalTreeList){
        //     tree.resetState();
        // }

        await this._calculateAddressFunctionRuntimeData(treeDependencyCache, preCalculateTreeList);

        await this._buildDirtyRangesByAddressFunction(treeDependencyCache, tree);
    }

    private async _calculateAddressFunctionRuntimeData(treeDependencyCache: RTree, preCalculateTreeList: IFormulaDependencyTree[]) {
        while (preCalculateTreeList.length > 0) {
            const tree = preCalculateTreeList.pop()!;

            this._runtimeService.setCurrent(
                tree.row,
                tree.column,
                tree.rowCount,
                tree.columnCount,
                tree.subUnitId,
                tree.unitId
            );

            const node = this._getTreeNode(tree);
            const nodeData = {
                node,
                refOffsetX: tree.refOffsetX,
                refOffsetY: tree.refOffsetY,
            };

            await this._calculateAddressFunction(treeDependencyCache, tree);

            let value: FunctionVariantType;
            if (this._interpreter.checkAsyncNode(nodeData.node)) {
                value = await this._interpreter.executeAsync(nodeData);
            } else {
                value = this._interpreter.execute(nodeData);
            }

            if (tree.formulaId != null) {
                this._runtimeService.setRuntimeOtherData(tree.formulaId, tree.refOffsetX, tree.refOffsetY, value);
            } else {
                this._runtimeService.setRuntimeData(value);
            }
        }
    }

    private _buildTreeNodeById(treeIds: Set<number>) {
        const preCalculateTreeList: IFormulaDependencyTree[] = [];
        for (const treeId of treeIds) {
            const tree = this._getTreeById(treeId);
            if (!tree || this._executedAddressFunctionNodeIds.has(treeId)) {
                continue;
            }

            this._executedAddressFunctionNodeIds.add(treeId);

            preCalculateTreeList.push(tree);
        }
        return preCalculateTreeList;
    }

    private _searchDependencyByAddressFunction(treeDependencyCache: RTree, dirtyRanges: IUnitRange[], searchResults: Set<number>) {
        const newSearchResults = treeDependencyCache.bulkSearch(dirtyRanges) as Set<number>;
        const addressFunctionNodes = this._dependencyRTreeCacheForAddressFunction.bulkSearch(dirtyRanges) as Set<number>;
        for (const treeId of addressFunctionNodes) {
            if (!searchResults.has(treeId)) {
                searchResults.add(treeId);
            }
        }

        const newDirtyRanges: IUnitRange[] = [];
        for (const treeId of newSearchResults) {
            const tree = this._getTreeById(treeId);
            if (tree && !searchResults.has(treeId)) {
                newDirtyRanges.push(...tree.rangeList);

                searchResults.add(treeId);
            }
        }

        if (newDirtyRanges.length > 0) {
            this._searchDependencyByAddressFunction(treeDependencyCache, newDirtyRanges, searchResults);
        }

        return searchResults;
    }

    private _addDependencyTreeByAddressFunction(tree: IFormulaDependencyTree, addressFunctionRangeList: IUnitRange[]) {
        const searchRanges = [];
        for (let i = 0; i < addressFunctionRangeList.length; i++) {
            const unitRangeWithNum = addressFunctionRangeList[i];
            const { unitId, sheetId, range } = unitRangeWithNum;

            searchRanges.push({
                unitId,
                sheetId,
                range,
                id: tree.treeId,
            });
        }

        this._dependencyRTreeCacheForAddressFunction.bulkInsert(searchRanges);
    }

    /**
     * Calculate the range required for collection in advance,
     * including references and location functions (such as OFFSET, INDIRECT, INDEX, etc.).
     * @param node
     */
    protected async _getRangeListByFunctionRefNode(referenceFunctionList: FunctionNode[], refOffsetX: number, refOffsetY: number) {
        const rangeList: IUnitRange[] = [];

        for (let i = 0, len = referenceFunctionList.length; i < len; i++) {
            const node = referenceFunctionList[i];
            const value: BaseReferenceObject = await this._executeNode(node, refOffsetX, refOffsetY);

            const gridRange = value.toUnitRange();

            // const token = serializeRangeToRefString({ ...gridRange, sheetName: this._currentConfigService.getSheetName(gridRange.unitId, gridRange.sheetId) });

            rangeList.push(gridRange);

            node.setValue(null);
        }

        return rangeList;
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

    private _detectForcedRecalculationNode(tree: IFormulaDependencyTree, node: Nullable<BaseAstNode>) {
        if (node == null) {
            return false;
        }

        return this._detectForcedRecalculationNodeRecursion(node);
    }

    private _detectForcedRecalculationNodeRecursion(node: BaseAstNode) {
        if (node.isForcedCalculateFunction()) {
            return true;
        }

        const children = node.getChildren();
        for (let i = 0, len = children.length; i < len; i++) {
            const child = children[i];
            if (this._detectForcedRecalculationNodeRecursion(child)) {
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
    protected _includeTree(tree: IFormulaDependencyTree, node: BaseAstNode) {
        const unitId = tree.unitId;
        const subUnitId = tree.subUnitId;

        /**
         * RAND, RANDBETWEEN, NOW, TODAY are volatile functions that are marked dirty and recalculated every time a calculation occurs.
         */
        if (this._detectForcedRecalculationNode(tree, node) === true) {
            return true;
        }

        if (this._includeTreeFeature(tree as FormulaDependencyTree) === true) {
            return true;
        }

        if (this._includeOtherFormula(tree as FormulaDependencyTree) === true) {
            return true;
        }

        if (includeDefinedName(tree, node, this._currentConfigService) === true) {
            return true;
        }

        const excludedCell = this._currentConfigService.getExcludedRange()?.[unitId]?.[subUnitId];

        /**
         * The position of the primary cell in the array formula needs to be excluded when calculating the impact of the array formula on dependencies.
         * This is because its impact was already considered during the first calculation.
         */
        const isExclude = excludedCell?.getValue(tree.row, tree.column) != null;

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

    protected async _initializeGenerateTreeList() {
        const formulaData = this._currentConfigService.getFormulaData();

        const otherFormulaData = this._otherFormulaManagerService.getOtherFormulaData();

        const unitData = this._currentConfigService.getUnitData();

        const treeList = await this._generateTreeList(formulaData, otherFormulaData, unitData);

        return treeList;
    }

    protected _formulaDependencyTreeModel = new Map<number, FormulaDependencyTreeModel>();

    protected _getTreeModel(treeId: number): FormulaDependencyTreeModel | undefined {
        let treeModel = this._formulaDependencyTreeModel.get(treeId);
        if (!treeModel) {
            const tree = this._getTreeById(treeId);
            if (!tree) {
                console.error('FormulaDependencyTree is null for treeId:', treeId);
                return;
            }

            treeModel = new FormulaDependencyTreeModel(tree);
            // if (tree.isVirtual) {
            //     const formula = this._lexerTreeBuilder.moveFormulaRefOffset(
            //         tree.formula,
            //         tree.refOffsetX,
            //         tree.refOffsetY
            //     );
            //     treeModel.formula = formula;
            // }
            this._formulaDependencyTreeModel.set(treeId, treeModel);
        }
        return treeModel;
    }

    protected _getFormulaDependencyTreeModel(tree: IFormulaDependencyTree): FormulaDependencyTreeModel {
        const treeModel = this._getTreeModel(tree.treeId);
        const parentIds = this._getDependencyTreeParenIds(tree);

        if (!treeModel) {
            return new FormulaDependencyTreeModel(tree);
        }

        for (const parentId of parentIds) {
            const parentTreeModel = this._getTreeModel(parentId);
            if (!parentTreeModel) {
                continue;
            }
            treeModel.addParent(parentTreeModel);
            parentTreeModel.addChild(treeModel);
        }
        return treeModel;
    }

    protected _getAllDependencyJson(treeList: IFormulaDependencyTree[]): IFormulaDependencyTreeJson[] {
        this._startFormulaDependencyTreeModel();

        const results: FormulaDependencyTreeModel[] = [];
        for (const tree of treeList) {
            const treeType = tree.type;
            if (tree.isVirtual && (treeType === FormulaDependencyTreeType.FEATURE_FORMULA || treeType === FormulaDependencyTreeType.OTHER_FORMULA)) {
                continue;
            }
            const treeModel = this._getFormulaDependencyTreeModel(tree);
            results.push(treeModel);
        }

        const resultsJson: IFormulaDependencyTreeJson[] = [];
        for (const result of results) {
            resultsJson.push(result.toJson());
        }

        this._endFormulaDependencyTreeModel();

        return resultsJson;
    }

    async getAllDependencyJson(): Promise<IFormulaDependencyTreeJson[]> {
        const treeList = await this._getAllTreeList();

        const resultsJson = this._getAllDependencyJson(treeList);

        return resultsJson;
    }

    protected _setRealFormulaString(treeModel: FormulaDependencyTreeModel) {
        if (treeModel.refTreeId == null) {
            return;
        }

        const mainTree = this._getTreeById(treeModel.refTreeId);
        if (!mainTree) {
            return;
        }
        const formula = this._lexerTreeBuilder.moveFormulaRefOffset(
            mainTree.formula,
            treeModel.refOffsetX,
            treeModel.refOffsetY
        );
        treeModel.formula = formula;
    }

    async getCellDependencyJson(unitId: string, sheetId: string, row: number, column: number): Promise<IFormulaDependencyTreeFullJson | undefined> {
        await this._initializeGenerateTreeList();
        const treeId = this._dependencyManagerService.getFormulaDependency(unitId, sheetId, row, column);
        if (treeId == null) {
            return;
        }
        const tree = this._getTreeById(treeId);
        if (!tree) {
            return;
        }

        this._startFormulaDependencyTreeModel();

        const treeModel = this._getFormulaDependencyTreeModel(tree);
        this._setRealFormulaString(treeModel);

        const childIds = this._getDependencyTreeChildrenIds(tree);
        for (const childId of childIds) {
            const childTreeModel = this._getTreeModel(childId);
            if (!childTreeModel) {
                continue;
            }
            this._setRealFormulaString(childTreeModel);
            treeModel.addChild(childTreeModel);
        }

        for (const parentTreeModel of treeModel.parents) {
            this._setRealFormulaString(parentTreeModel);
        }

        this._endFormulaDependencyTreeModel();

        return treeModel.toFullJson();
    }

    protected _getRangeDependents(unitRanges: IUnitRange[]): IFormulaDependencyTreeJson[] {
        const treeIds = this._dependencyManagerService.searchDependency(unitRanges);
        const treeList: FormulaDependencyTreeModel[] = [];
        for (const treeId of treeIds) {
            const tree = this._getTreeById(treeId);
            if (!tree) {
                continue;
            }
            const treeModel = this._getFormulaDependencyTreeModel(tree);
            this._setRealFormulaString(treeModel);
            treeList.push(treeModel);
        }

        const resultsJson: IFormulaDependencyTreeJson[] = [];
        for (const result of treeList) {
            if (result) {
                resultsJson.push(result.toJson());
            }
        }

        return resultsJson;
    }

    async getRangeDependents(unitRanges: IUnitRange[]): Promise<IFormulaDependencyTreeJson[]> {
        await this._initializeGenerateTreeList();

        this._startFormulaDependencyTreeModel();

        const resultsJson = this._getRangeDependents(unitRanges);

        this._endFormulaDependencyTreeModel();

        return resultsJson;
    }

    protected _getInRangeFormulas(unitRanges: IUnitRange[], treeList: IFormulaDependencyTree[]): IFormulaDependencyTreeJson[] {
        const matchTreeList: IFormulaDependencyTree[] = [];
        for (const dependencyTree of treeList) {
            for (const unitRange of unitRanges) {
                const unitId = unitRange.unitId;
                const sheetId = unitRange.sheetId;
                if (dependencyTree.unitId !== unitId || dependencyTree.subUnitId !== sheetId) {
                    continue;
                }

                const range = unitRange.range;

                if (dependencyTree.inRangeData(unitRange.range)) {
                    matchTreeList.push(dependencyTree);
                    break;
                }
            }
        }

        const results: FormulaDependencyTreeModel[] = [];
        for (const tree of matchTreeList) {
            const treeModel = this._getFormulaDependencyTreeModel(tree);
            this._setRealFormulaString(treeModel);
            results[tree.treeId] = treeModel;
        }

        const resultsJson: IFormulaDependencyTreeJson[] = [];
        for (const result of results) {
            if (result) {
                resultsJson.push(result.toJson());
            }
        }

        return resultsJson;
    }

    async getInRangeFormulas(unitRanges: IUnitRange[]): Promise<IFormulaDependencyTreeJson[]> {
        const treeList = await this._getAllTreeList();

        this._startFormulaDependencyTreeModel();

        const resultsJson = this._getInRangeFormulas(unitRanges, treeList);

        this._endFormulaDependencyTreeModel();

        return resultsJson;
    }

    async getRangeDependentsAndInRangeFormulas(unitRanges: IUnitRange[]): Promise<IFormulaDependentsAndInRangeResults> {
        const treeList = await this._getAllTreeList();

        this._startFormulaDependencyTreeModel();

        const dependentsJson = this._getRangeDependents(unitRanges);

        const inRangeFormulasJson = this._getInRangeFormulas(unitRanges, treeList);

        this._endFormulaDependencyTreeModel();

        return {
            dependents: dependentsJson,
            inRanges: inRangeFormulasJson,
        };
    }
}
