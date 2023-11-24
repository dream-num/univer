import { FormulaEngineService, ISequenceNode, sequenceNodeType } from '@univerjs/base-formula-engine';
import { createIdentifier, IDisposable, Inject } from '@wendellhu/redi';
import { Observable, Subject } from 'rxjs';

export interface ISyncToEditorParam {
    textSelectionOffset: number;
    sequences: Array<string | ISequenceNode>;
}

export interface IFormulaInputService {
    syncToEditor$: Observable<ISyncToEditorParam>;

    inputFormula$: Observable<string>;

    changeRef$: Observable<boolean>;

    syncToEditor(textSelectionOffset: number): void;

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

    enableSelectionMoving(): void;

    disableSelectionMoving(): void;

    isSelectionMoving(): boolean;

    enableLockedSelectionChange(): void;

    disableLockedSelectionChange(): void;

    isLockedSelectionChange(): boolean;

    enableLockedSelectionInsert(): void;

    disableLockedSelectionInsert(): void;

    isLockedSelectionInsert(): boolean;

    inputFormula(formulaString: string): void;
}

export class FormulaInputService implements IFormulaInputService, IDisposable {
    private _sequenceNodes: Array<string | ISequenceNode> = [];

    private _isSelectionMoving = false;

    private _isLockedOnSelectionChangeRefString: boolean = false;

    private _isLockedOnSelectionInsertRefString: boolean = false;

    private readonly _syncToEditor$ = new Subject<ISyncToEditorParam>();

    readonly syncToEditor$ = this._syncToEditor$.asObservable();

    private _changeRef$ = new Subject<boolean>();

    readonly changeRef$ = this._changeRef$.asObservable();

    private readonly _inputFormula$ = new Subject<string>();

    readonly inputFormula$ = this._inputFormula$.asObservable();

    constructor(@Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService) {}

    dispose(): void {
        this._sequenceNodes = [];
    }

    inputFormula(formulaString: string) {
        this._inputFormula$.next(formulaString);
    }

    syncToEditor(textSelectionOffset: number) {
        this._syncToEditor$.next({ sequences: this._sequenceNodes, textSelectionOffset });
    }

    getSequenceNodes() {
        return this._sequenceNodes;
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
     * @param sequenceNodes
     * @param strIndex
     * @returns
     */
    getCurrentSequenceNodeIndex(strIndex: number) {
        let nodeIndex = 0;
        for (let i = 0, len = this._sequenceNodes.length; i < len; i++) {
            const node = this._sequenceNodes[i];

            if (typeof node === 'string') {
                nodeIndex++;
            } else {
                const { endIndex } = node;

                nodeIndex = endIndex;
            }

            if (strIndex <= nodeIndex) {
                return i;
            }
        }

        return this._sequenceNodes.length;
    }

    /**
     * Synchronize the reference text based on the changes of the selection.
     * @param refIndex
     * @param rangeWithCoord
     * @returns
     */
    updateSequenceRef(nodeIndex: number, refString: string) {
        const node = this._sequenceNodes[nodeIndex];

        if (typeof node === 'string' || node.nodeType !== sequenceNodeType.REFERENCE) {
            return;
        }

        const difference = refString.length - node.token.length;

        node.token = refString;

        node.endIndex += difference;

        for (let i = nodeIndex + 1, len = this._sequenceNodes.length; i < len; i++) {
            const node = this._sequenceNodes[i];
            if (typeof node === 'string') {
                continue;
            }

            node.startIndex += difference;
            node.endIndex += difference;
        }

        this._changeRef$.next(true);
    }

    /**
     * When the cursor is on the right side of a formula token,
     * you can add reference text to the formula by drawing a selection.
     * @param index
     * @param range
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

            node.startIndex += refStringCount;
            node.endIndex += refStringCount;
        }

        this._changeRef$.next(true);
    }

    /**
     * Insert a string at the cursor position in the text corresponding to the sequenceNodes.
     * @param sequenceNodes
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

            node.startIndex += contentCount;
            node.endIndex += contentCount;
        }

        this._changeRef$.next(true);
    }

    enableSelectionMoving() {
        this._isSelectionMoving = true;
    }

    disableSelectionMoving() {
        this._isSelectionMoving = false;
    }

    isSelectionMoving() {
        return this._isSelectionMoving;
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

export const IFormulaInputService = createIdentifier<FormulaInputService>('formula-ui.input-service');
