import { SelectionManagerService } from '@univerjs/base-sheets';
import { IClipboardInterfaceService } from '@univerjs/base-ui';
import { Disposable, ICurrentUniverService, toDisposable } from '@univerjs/core';
import { createIdentifier, IDisposable, Inject } from '@wendellhu/redi';

export interface IClipboardPropertyItem {
    [key: string]: string;
}

/**
 * ClipboardHook could:
 * 1. Before copy/cut/paste, decide whether to execute the command and prepare caches if necessary.
 * 1. When copying, decide what content could be written into clipboard.
 * 1. When pasting, get access to the clipboard content and append mutations to the paste command.
 */
export interface ISheetClipboardHook {
    onBeforeCopy?(): void;
    onBeforeCut?(): void;
    onBeforePaste?(): void;

    onGetContent(row: number, col: number): void;

    /**
     * Properties that would be appended to the td element.
     * @param row row of the the copied cell
     * @param col col of the the copied cell
     */
    onCopy?(row: number, col: number): IClipboardPropertyItem | null;
    onCut?(row: number, col: number): IClipboardPropertyItem | null;
    onPaste?(row: number, col: number): void; // TODO: should add raw content here

    onCopyRow(row: number): IClipboardPropertyItem | null;
    onCutRow(row: number): IClipboardPropertyItem | null;
    onPasteRow(row: number): void;

    onCopyColumn(col: number): IClipboardPropertyItem | null;
    onCutColumn(row: number): IClipboardPropertyItem | null;
    onPasteColumn(row: number): void;

    onAfterCopy?(): void;
    onAfterCut?(): void;
    onAfterPaste?(): void;

    getFilteredOutRows?(): number[];
}

export interface ISheetClipboardService {
    copy(): Promise<boolean>;

    addClipboardHook(hook: ISheetClipboardHook): IDisposable;
}

export const ISheetClipboardService = createIdentifier<ISheetClipboardService>('sheet.clipboard-service');

/**
 * This service provide hooks for sheet features to supplement content to clipboard.
 */
export class SheetClipboardService extends Disposable implements ISheetClipboardService {
    private _cellContentHooks: ISheetClipboardHook[] = [];

    constructor(
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService
    ) {
        super();
    }

    async copy(): Promise<boolean> {
        const hooks = this._cellContentHooks;
        // steps to copy cells from the sheet:
        // 1. get the selected range, the range should be the last one of selected ranges
        const selections = this._selectionManagerService.getLast();
        console.log('debug, copy range', selections);
        // 2. filtered out rows those are filtered out by plugins (e.g. filter feature)

        const filteredRows = hooks.reduce((acc, cur) => {
            const rows = cur.getFilteredOutRows?.();
            rows?.forEach((r) => acc.add(r));
            return acc;
        }, new Set<number>());

        // 3. calculate selection matrix
        // 4. get html and pure text contents
        return true;
    }

    async paste(): Promise<boolean> {
        return true;
    }

    async cut(): Promise<boolean> {
        return true;
    }

    addClipboardHook(hook: ISheetClipboardHook): IDisposable {
        this._cellContentHooks.push(hook);

        return toDisposable(() => {
            const index = this._cellContentHooks.indexOf(hook);
            if (index > -1) {
                this._cellContentHooks.splice(index, 1);
            }
        });
    }

    getCellContentClipboardHooks(): Readonly<ISheetClipboardHook[]> {
        return this._cellContentHooks.slice();
    }
}
