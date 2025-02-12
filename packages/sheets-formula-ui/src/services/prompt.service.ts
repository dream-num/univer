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

import type { Direction, IDisposable } from '@univerjs/core';
import type { ISearchItem } from '@univerjs/sheets-formula';
import type { Observable } from 'rxjs';
import { createIdentifier, IContextService } from '@univerjs/core';
import { type IFunctionInfo, type ISequenceNode, sequenceNodeType } from '@univerjs/engine-formula';
import { Subject } from 'rxjs';

/** If the formula prompt is visible. */
export const FORMULA_PROMPT_ACTIVATED = 'FORMULA_PROMPT_ACTIVATED';

export interface ISearchFunctionOperationParams {
    /**
     * show SearchFunction Component or not
     */
    visible: boolean;

    /**
     * function search text
     */
    searchText: string;

    /**
     * function list
     */
    searchList: ISearchItem[];
}

export interface IHelpFunctionOperationParams {
    /**
     * show HelpFunction Component or not
     */
    visible: boolean;

    /**
     * function param index
     */
    paramIndex: number;

    /**
     * function info
     */
    functionInfo: IFunctionInfo;
}

export interface INavigateParam {
    direction: Direction.UP | Direction.DOWN;
}

export interface IFormulaPromptService {
    /**
     * listen search function open
     */
    search$: Observable<ISearchFunctionOperationParams>;

    /**
     * open search function
     */
    search(param: ISearchFunctionOperationParams): void;

    /**
     * listen help function open
     */
    help$: Observable<IHelpFunctionOperationParams>;

    /**
     * open help function
     */

    help(param: IHelpFunctionOperationParams): void;

    /**
     * listen navigate shortcut, UP and DOWN
     */
    navigate$: Observable<INavigateParam>;

    /**
     * set navigate shortcut
     */
    navigate(param: INavigateParam): void;

    /**
     * listen accept shortcut, TAB/ENTER
     */
    accept$: Observable<boolean>;

    /**
     * set accept shortcut
     */
    accept(param: boolean): void;

    /**
     * accept formula name
     */
    acceptFormulaName$: Observable<string>;

    /**
     * set accept formula name
     */
    acceptFormulaName(param: string): void;

    isSearching(): boolean;

    isHelping(): boolean;

    dispose(): void;

    getSequenceNodes(): Array<string | ISequenceNode>;

    setSequenceNodes(nodes: Array<string | ISequenceNode>): void;

    clearSequenceNodes(): void;

    getCurrentSequenceNodeIndex(strIndex: number): number;

    getCurrentSequenceNodeByIndex(nodeIndex: number): string | ISequenceNode;

    getCurrentSequenceNode(strIndex: number): string | ISequenceNode;

    updateSequenceRef(nodeIndex: number, refString: string): void;

    insertSequenceRef(index: number, refString: string): void;

    insertSequenceString(index: number, content: string): void;

    enableLockedSelectionChange(): void;

    disableLockedSelectionChange(): void;

    isLockedSelectionChange(): boolean;

    enableLockedSelectionInsert(): void;

    disableLockedSelectionInsert(): void;

    isLockedSelectionInsert(): boolean;
}

export const IFormulaPromptService = createIdentifier<FormulaPromptService>('formula-ui.prompt-service');

export class FormulaPromptService implements IFormulaPromptService, IDisposable {
    private readonly _search$ = new Subject<ISearchFunctionOperationParams>();

    private readonly _help$ = new Subject<IHelpFunctionOperationParams>();

    private readonly _navigate$ = new Subject<INavigateParam>();

    private readonly _accept$ = new Subject<boolean>();

    private readonly _acceptFormulaName$ = new Subject<string>();

    readonly search$ = this._search$.asObservable();

    readonly help$ = this._help$.asObservable();

    readonly navigate$ = this._navigate$.asObservable();

    readonly accept$ = this._accept$.asObservable();

    readonly acceptFormulaName$ = this._acceptFormulaName$.asObservable();

    private _searching: boolean = false;

    private _helping: boolean = false;

    private _sequenceNodes: Array<string | ISequenceNode> = [];

    private _isLockedOnSelectionChangeRefString: boolean = false;

    private _isLockedOnSelectionInsertRefString: boolean = false;

    constructor(
        @IContextService private readonly _contextService: IContextService
    ) {
    }

    dispose(): void {
        this._search$.complete();
        this._help$.complete();
        this._navigate$.complete();
        this._accept$.complete();
        this._acceptFormulaName$.complete();
        this._sequenceNodes = [];
    }

    search(param: ISearchFunctionOperationParams) {
        this._contextService.setContextValue(FORMULA_PROMPT_ACTIVATED, param.visible);
        this._searching = param.visible;
        this._search$.next(param);
    }

    isSearching() {
        return this._searching;
    }

    help(param: IHelpFunctionOperationParams) {
        this._helping = param.visible;
        this._help$.next(param);
    }

    isHelping() {
        return this._helping;
    }

    navigate(param: INavigateParam) {
        this._navigate$.next(param);
    }

    accept(param: boolean) {
        this._accept$.next(param);
    }

    acceptFormulaName(param: string) {
        this._acceptFormulaName$.next(param);
    }

    getSequenceNodes() {
        return [...this._sequenceNodes];
    }

    setSequenceNodes(nodes: Array<string | ISequenceNode>) {
        this._sequenceNodes = nodes;
    }

    clearSequenceNodes() {
        this._sequenceNodes = [];
    }

    getCurrentSequenceNode(strIndex: number) {
        return this._sequenceNodes[this.getCurrentSequenceNodeIndex(strIndex)];
    }

    getCurrentSequenceNodeByIndex(nodeIndex: number) {
        return this._sequenceNodes[nodeIndex];
    }

    /**
     * Query the text coordinates in the sequenceNodes and determine the actual insertion index.
     * @param strIndex
     */
    getCurrentSequenceNodeIndex(strIndex: number) {
        let nodeIndex = 0;
        const firstNode = this._sequenceNodes[0];

        for (let i = 0, len = this._sequenceNodes.length; i < len; i++) {
            const node = this._sequenceNodes[i];

            if (typeof node === 'string') {
                nodeIndex++;
            } else {
                const { endIndex } = node;

                nodeIndex = endIndex;
            }

            if (strIndex <= nodeIndex) {
                /**
                 * =((|A1 and =|**，fix https://github.com/dream-num/univer/issues/1387
                 */
                if (typeof firstNode === 'string' && strIndex !== 0) {
                    return i + 1;
                }

                return i;
            }
        }

        return this._sequenceNodes.length;
    }

    /**
     * Synchronize the reference text based on the changes of the selection.
     * @param nodeIndex
     * @param refString
     */
    updateSequenceRef(nodeIndex: number, refString: string) {
        const node = this._sequenceNodes[nodeIndex];

        if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
            return;
        }

        const difference = refString.length - node.token.length;

        const newNode = { ...node };

        newNode.token = refString;

        newNode.endIndex += difference;

        this._sequenceNodes[nodeIndex] = newNode;

        for (let i = nodeIndex + 1, len = this._sequenceNodes.length; i < len; i++) {
            const node = this._sequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }

            const newNode = { ...node };

            newNode.startIndex += difference;
            newNode.endIndex += difference;

            this._sequenceNodes[i] = newNode;
        }
    }

    /**
     * When the cursor is on the right side of a formula token,
     * you can add reference text to the formula by drawing a selection.
     * @param index
     * @param refString
     */
    insertSequenceRef(index: number, refString: string) {
        const refStringCount = refString.length;

        const nodeIndex = this.getCurrentSequenceNodeIndex(index);

        this._sequenceNodes.splice(nodeIndex, 0, {
            token: refString,
            startIndex: index,
            endIndex: index + refStringCount - 1,
            nodeType: sequenceNodeType.REFERENCE,
        });

        for (let i = nodeIndex + 1, len = this._sequenceNodes.length; i < len; i++) {
            const node = this._sequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }

            const newNode = { ...node };

            newNode.startIndex += refStringCount;
            newNode.endIndex += refStringCount;

            this._sequenceNodes[i] = newNode;
        }
    }

    /**
     * Insert a string at the cursor position in the text corresponding to the sequenceNodes.
     * @param index
     * @param content
     */
    insertSequenceString(index: number, content: string) {
        const nodeIndex = this.getCurrentSequenceNodeIndex(index);
        const str = content.split('');
        this._sequenceNodes.splice(nodeIndex, 0, ...str);

        const contentCount = str.length;

        for (let i = nodeIndex + contentCount, len = this._sequenceNodes.length; i < len; i++) {
            const node = this._sequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }

            const newNode = { ...node };

            newNode.startIndex += contentCount;
            newNode.endIndex += contentCount;

            this._sequenceNodes[i] = newNode;
        }
    }

    enableLockedSelectionChange() {
        this._isLockedOnSelectionChangeRefString = true;
    }

    disableLockedSelectionChange() {
        this._isLockedOnSelectionChangeRefString = false;
    }

    isLockedSelectionChange() {
        return this._isLockedOnSelectionChangeRefString;
    }

    enableLockedSelectionInsert() {
        this._isLockedOnSelectionInsertRefString = true;
    }

    disableLockedSelectionInsert() {
        this._isLockedOnSelectionInsertRefString = false;
    }

    isLockedSelectionInsert() {
        return this._isLockedOnSelectionInsertRefString;
    }
}
