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

import type { ICellData, IDisposable, IObjectMatrixPrimitiveType, IRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { IFindComplete, IFindMatch, IFindMoveParams, IFindQuery, IFindReplaceProvider, IReplaceAllResult } from '@univerjs/find-replace';
import type {
    ISelectionWithStyle,
    ISelectRangeCommandParams,
    ISetRangeValuesCommandParams,
    ISetSelectionsOperationParams,
    ISetWorksheetActivateCommandParams,
    ISheetCommandSharedParams,
    WorkbookSelectionModel,
} from '@univerjs/sheets';
import type { IScrollToCellCommandParams } from '@univerjs/sheets-ui';
import type { ISheetReplaceCommandParams, ISheetReplacement } from '../commands/commands/sheet-replace.command';
import type { ISheetFindReplaceHighlightShapeProps } from '../views/shapes/find-replace-highlight.shape';
import {
    ColorKit,
    CommandType,
    Disposable,
    EDITOR_ACTIVATED,
    fromCallback,
    groupBy,
    ICommandService,
    IContextService,
    Inject,
    Injector,
    IUniverInstanceService,
    ObjectMatrix,
    replaceInDocumentBody,
    rotate,
    ThemeService,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService, RENDER_RAW_FORMULA_KEY } from '@univerjs/engine-render';
import { FindBy, FindDirection, FindModel, FindReplaceController, FindScope, IFindReplaceService } from '@univerjs/find-replace';
import {
    SelectRangeCommand,
    SetRangeValuesCommand,
    SetSelectionsOperation,
    SetWorksheetActivateCommand,
    SetWorksheetActiveOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { getCoordByCell, getSheetObject, ScrollToCellCommand, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { debounceTime, filter, merge, skip, Subject, throttleTime } from 'rxjs';
import { SheetReplaceCommand } from '../commands/commands/sheet-replace.command';
import { SheetFindReplaceHighlightShape } from '../views/shapes/find-replace-highlight.shape';
import {
    isBeforePositionWithColumnPriority,
    isBeforePositionWithRowPriority,
    isBehindPositionWithColumnPriority,
    isBehindPositionWithRowPriority,
    isSamePosition,
    isSelectionSingleCell,
} from './utils';

export class SheetsFindReplaceController extends Disposable implements IDisposable {
    private _provider!: SheetsFindReplaceProvider;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(FindReplaceController) private readonly _findReplaceController: FindReplaceController,
        @IContextService private readonly _contextService: IContextService,
        @IFindReplaceService private readonly _findReplaceService: IFindReplaceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._init();
        this._initCommands();
    }

    override dispose(): void {
        super.dispose();

        this._findReplaceController.closePanel();
        this._provider.dispose();
    }

    private _init(): void {
        const provider = this._injector.createInstance(SheetsFindReplaceProvider);
        this._provider = provider;

        this.disposeWithMe(this._findReplaceService.registerFindReplaceProvider(provider));

        // The find replace panel should be closed when sheet cell editor is activated, or the formula editor is focused.
        this.disposeWithMe(this._contextService.subscribeContextValue$(EDITOR_ACTIVATED)
            .pipe(filter((v) => !!v))
            .subscribe(() => this._findReplaceController.closePanel()));
    }

    private _initCommands(): void {
        [SheetReplaceCommand].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }
}

const SHEETS_FIND_REPLACE_PROVIDER_NAME = 'sheets-find-replace-provider';
const FIND_REPLACE_Z_INDEX = 10000;

export interface ISheetCellMatch extends IFindMatch {
    isFormula: boolean;
    provider: typeof SHEETS_FIND_REPLACE_PROVIDER_NAME;
    range: {
        subUnitId: string;
        range: IRange;
    };
}

/**
 * This class executes finding in a workbook and subscribe to the content change event so when its results changes
 * FindReplaceService would know that and update searching results. Also this class in responsible for
 * highlighting matched cells.
 */
export class SheetFindModel extends FindModel {
    // We can directly inject the `FindReplaceService` here, and call its methods instead of using the observables.
    private readonly _matchesUpdate$ = new Subject<ISheetCellMatch[]>();
    readonly matchesUpdate$ = this._matchesUpdate$.asObservable();

    private readonly _activelyChangingMatch$ = new Subject<ISheetCellMatch>();
    readonly activelyChangingMatch$ = this._activelyChangingMatch$.asObservable();

    /** Hold matches by the worksheet they are in. Make it easier to track the next (or previous) match when searching in the whole workbook. */
    private _matchesByWorksheet = new Map<string, ISheetCellMatch[]>();
    /** Hold all matches in the currently searching scope. */
    private _matches: ISheetCellMatch[] = [];
    /** Position of the current focused ISheetCellMatch, starting from 1. */
    private _matchesPosition = 0;

    private _activeHighlightIndex = -1;
    private _highlightShapes: SheetFindReplaceHighlightShape[] = [];
    private _currentHighlightShape: Nullable<SheetFindReplaceHighlightShape> = null;

    /** This properties holds the query params during this searching session. */
    private _query: Nullable<IFindQuery> = null;

    private get _matchesCount(): number { return this._matches.length; }
    get unitId(): string { return this._workbook.getUnitId(); }
    get matchesCount(): number { return this._matchesCount; }
    get matchesPosition(): number { return this._matchesPosition; }
    get currentMatch(): Nullable<ISheetCellMatch> { return this._matchesPosition > 0 ? this._matches[this._matchesPosition - 1] : null; }

    private _workbookSelections: WorkbookSelectionModel;

    constructor(
        private readonly _workbook: Workbook,
        private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @IContextService private readonly _contextService: IContextService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(SheetsSelectionsService) _selectionManagerService: SheetsSelectionsService
    ) {
        super();

        this._workbookSelections = _selectionManagerService.getWorkbookSelections(this.unitId);
    }

    override dispose(): void {
        super.dispose();

        this._disposeHighlights();
        this._toggleDisplayRawFormula(false);
    }

    getMatches(): IFindMatch[] {
        return this._matches;
    }

    start(query: IFindQuery): void {
        this._query = query;

        if (query.findBy === FindBy.FORMULA) {
            this._toggleDisplayRawFormula(true);
        } else {
            this._toggleDisplayRawFormula(false);
        }

        switch (query.findScope) {
            case FindScope.UNIT:
                this.findInWorkbook(query);
                break;
            case FindScope.SUBUNIT:
            default:
                this.findInActiveWorksheet(query);
                break;
        }
    }

    override focusSelection(): void {
        const currentMatch = this.currentMatch;
        if (!currentMatch) return;

        this._commandService.executeCommand(SelectRangeCommand.id, {
            unitId: currentMatch.unitId,
            subUnit: currentMatch.range.subUnitId,
            range: currentMatch.range.range,

        } as ISelectRangeCommandParams);
    }

    private _toggleDisplayRawFormula(force: boolean): void {
        this._contextService.setContextValue(RENDER_RAW_FORMULA_KEY, force);
    }

    /**
     * Find all matches in the current workbook no matter which worksheet is activated.
     * @param query the query object
     * @returns the query complete event
     */
    findInWorkbook(query: IFindQuery): IFindComplete {
        const unitId = this._workbook.getUnitId();

        let complete: IFindComplete;
        let firstSearch = true;

        const findInWorkbook = () => {
            const allCompletes = this._workbook.getSheets()
                .filter((worksheet) => !worksheet.isSheetHidden()) // We do not search in hidden Worksheets.
                .map((worksheet) => {
                    const complete = this._findInWorksheet(worksheet, query, unitId);
                    const sheetId = worksheet.getSheetId();

                    const { results } = complete;
                    if (results.length) {
                        this._matchesByWorksheet.set(sheetId, complete.results);
                    } else {
                        this._matchesByWorksheet.delete(sheetId);
                    }

                    return complete;
                });

            this._matches = allCompletes.map((c) => c.results).flat();
            this._updateFindHighlight();

            if (firstSearch) {
                complete = { results: this._matches };
                firstSearch = false;
            } else {
                this._matchesUpdate$.next(this._matches);
            }
        };

        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe(() => {
            this._updateFindHighlight();
            this._updateCurrentHighlightShape(this._activeHighlightIndex);
        }));

        this.disposeWithMe(
            fromCallback(this._commandService.onCommandExecuted.bind(this._commandService))
                .pipe(filter(([command, options]) => command.id === SetWorksheetActiveOperation.id && !options?.fromFindReplace))
                .subscribe(() => {
                    const activeSheet = this._workbook.getActiveSheet();
                    if (!activeSheet) {
                        return;
                    }

                    const activeSheetId = activeSheet.getSheetId();
                    if (!this._matchesByWorksheet.has(activeSheetId)) {
                        return;
                    }

                    this._findNextMatchOnActiveSheetChange(activeSheet);
                })
        );

        // When the sheet model changes, we should re-search.
        this.disposeWithMe(
            fromCallback(this._commandService.onCommandExecuted.bind(this._commandService))
                .pipe(
                    filter(([command]) => command.type === CommandType.MUTATION
                        && (command.params as ISheetCommandSharedParams).unitId === this._workbook.getUnitId()
                    ),
                    throttleTime(600, undefined, { leading: false, trailing: true })
                )
                .subscribe(() => findInWorkbook())
        );

        findInWorkbook();
        return complete!;
    }

    /**
     * This method is used in `findInWorkbook`. When the active sheet changes, this method helps to find the next match
     * in the new worksheet.
     */
    private _findNextMatchOnActiveSheetChange(activeSheet: Worksheet): void {
        let match: ISheetCellMatch;
        let index: number;
        let globalIndex = 0;

        const matchesByWorksheet = this._matchesByWorksheet.get(activeSheet.getSheetId())!;
        const selections = this._workbookSelections.getCurrentSelections();
        if (!selections?.length) {
            match = matchesByWorksheet[0];
            index = 0;
            globalIndex = this._matches.findIndex((m) => m === match);
        } else {
            [match, globalIndex] = this._findNextMatchByRange(matchesByWorksheet, selections[0].range);
            index = matchesByWorksheet.findIndex((m) => m === match);
        }

        this._matchesPosition = globalIndex + 1;
        this._activelyChangingMatch$.next(match);

        this._activeHighlightIndex = index;
        this._updateFindHighlight();
        this._updateCurrentHighlightShape(index);
    }

    /**
     * Find all matches (only) in the currently activated worksheet.
     * @param query the query object
     * @returns the query complete event
     */
    findInActiveWorksheet(query: IFindQuery): IFindComplete {
        const unitId = this._workbook.getUnitId();

        const checkShouldFindInSelections = (): boolean => {
            const currentWorksheet = this._workbook.getActiveSheet();
            if (!currentWorksheet) return false;
            const currentSelections = this._workbookSelections.getCurrentSelections();
            const shouldFindInSelections = currentSelections?.some((selection) => !isSelectionSingleCell(selection, currentWorksheet)) ?? false;
            return shouldFindInSelections;
        };

        let complete: IFindComplete;
        let firstSearch = true;
        let findBySelections = false;

        const performFindInWorksheet = (): IFindComplete => {
            const currentWorksheet = this._workbook.getActiveSheet();
            if (!currentWorksheet) return { results: [] };

            const lastMatch = this.currentMatch; // temporarily store the last match to restore the position after the model changes

            findBySelections = checkShouldFindInSelections();
            const currentSelections = this._workbookSelections.getCurrentSelections();
            const newComplete = findBySelections
                ? this._findInSelections(currentWorksheet, currentSelections as ISelectionWithStyle[], query, unitId)
                : this._findInWorksheet(currentWorksheet, query, unitId);

            this._matches = newComplete.results;
            this._matchesPosition = this._tryRestoreLastMatchesPosition(lastMatch, this._matches);

            if (firstSearch) {
                complete = newComplete;
                firstSearch = false;
            } else {
                this._matchesUpdate$.next(this._matches);
            }

            this._updateFindHighlight();
            return newComplete;
        };

        // When the skeleton changes, we should re-render the highlights.
        this.disposeWithMe(this._sheetSkeletonManagerService.currentSkeleton$.subscribe(() => this._updateFindHighlight()));

        this.disposeWithMe(
            merge(
                fromCallback(this._commandService.onCommandExecuted.bind(this._commandService)).pipe(
                    filter(([command]) => {
                        // If there mutations happens on this unit, we should re-search.
                        if (command.type === CommandType.MUTATION && (command.params as ISheetCommandSharedParams).unitId === this._workbook.getUnitId()) {
                            return true;
                        };

                        // If selections changes, we should re-search.
                        if (command.id === SetSelectionsOperation.id && (command.params as ISetSelectionsOperationParams).unitId === unitId) {
                            const shouldFindBySelections = checkShouldFindInSelections();
                            if (shouldFindBySelections === false && findBySelections === false) {
                                return false;
                            }

                            findBySelections = shouldFindBySelections;
                            return true;
                        }

                        return false;
                    })
                ),
                // activeSheet$ is a BehaviorSubject, so we need to skip the first
                this._workbook.activeSheet$.pipe(skip(1))
            ).pipe(debounceTime(200)).subscribe(() => performFindInWorksheet())
        );

        performFindInWorksheet();

        return complete!;
    }

    private _findInRange(
        worksheet: Worksheet,
        query: IFindQuery,
        range: IRange,
        unitId: string,
        dedupeFn?: (row: number, col: number) => boolean
    ): IFindComplete<ISheetCellMatch> {
        const results: ISheetCellMatch[] = [];
        const subUnitId = worksheet.getSheetId();

        const iter = (query.findDirection === FindDirection.COLUMN
            ? worksheet.iterateByColumn
            : worksheet.iterateByRow
        ).bind(worksheet)(range);

        for (const value of iter) {
            const { row, col, colSpan, rowSpan, value: cellData } = value;

            if (dedupeFn?.(row, col) || !cellData) {
                continue;
            };

            if (worksheet.getRowFiltered(row)) {
                continue;
            }

            const { hit, replaceable, isFormula } = hitCell(worksheet, row, col, query, cellData);
            if (hit) {
                const result: ISheetCellMatch = {
                    provider: SHEETS_FIND_REPLACE_PROVIDER_NAME,
                    unitId,
                    replaceable,
                    isFormula,
                    range: {
                        subUnitId,
                        range: {
                            startRow: row,
                            startColumn: col,
                            endColumn: col + (colSpan ?? 1) - 1,
                            endRow: row + (rowSpan ?? 1) - 1,
                        },
                    },
                };

                results.push(result);
            }
        }

        return { results };
    }

    private _findInSelections(
        worksheet: Worksheet,
        selections: ISelectionWithStyle[],
        query: IFindQuery,
        unitId: string
    ): IFindComplete<ISheetCellMatch> {
        const { findDirection } = query;

        const sortFn = findDirection === FindDirection.ROW ? isBehindPositionWithRowPriority : isBehindPositionWithColumnPriority;
        const dedupeSet = new Set<string>();
        const finds = selections
            .map((selection) => this._findInRange(worksheet, query, selection.range, unitId, (row, col) => {
                const key = `${row}-${col}`;
                if (dedupeSet.has(key)) return true;
                dedupeSet.add(key);
                return false;
            }).results)
            .flat()
            .sort((a, b) => sortFn(a.range.range, b.range.range) ? -1 : 1);

        return { results: finds };
        // TODO@wzhudev: we need to dedupe
    }

    /** Find matches in a given worksheet. */
    private _findInWorksheet(worksheet: Worksheet, query: IFindQuery, unitId: string): IFindComplete<ISheetCellMatch> {
        const rowCount = worksheet.getRowCount();
        const colCount = worksheet.getColumnCount();
        const range: IRange = { startRow: 0, startColumn: 0, endRow: rowCount - 1, endColumn: colCount - 1 };

        return this._findInRange(worksheet, query, range, unitId);
    }

    private _disposeHighlights(): void {
        this._highlightShapes.forEach((shape) => {
            shape.getScene()?.makeDirty();
            shape.dispose();
        });

        this._highlightShapes = [];

        this._currentHighlightShape?.dispose();
        this._currentHighlightShape = null;
    }

    private _updateFindHighlight(): void {
        this._disposeHighlights();

        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (!skeleton) {
            return;
        }

        const unitId = this._workbook.getUnitId();
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (currentRender == null) {
            return;
        }

        const { scene } = currentRender;
        const matches = this._matches;

        const searchBackgroundColor = this._themeService.getColorFromTheme('yellow.400');
        const color = new ColorKit(searchBackgroundColor).toRgb();
        const worksheet = this._workbook.getActiveSheet();
        if (!worksheet) {
            return;
        }

        const activeSheetId = worksheet.getSheetId();
        const highlightShapes = matches.filter((match) => match.range.subUnitId === activeSheetId).map((find, index) => {
            const { startColumn, startRow, endColumn, endRow } = find.range.range;
            const startPosition = getCoordByCell(startRow, startColumn, scene, skeleton);
            const endPosition = getCoordByCell(endRow, endColumn, scene, skeleton);
            const { startX, startY } = startPosition;
            const { endX, endY } = endPosition;

            const rowHidden = !worksheet.getRowRawVisible(startRow);
            const columnHidden = !worksheet.getColVisible(startColumn);

            const inHiddenRange = rowHidden || columnHidden;
            const width = columnHidden ? 2 : endX - startX;
            const height = rowHidden ? 2 : endY - startY;

            const props: ISheetFindReplaceHighlightShapeProps = {
                left: startX,
                top: startY,
                color,
                width,
                height,
                evented: false,
                inHiddenRange,
                zIndex: FIND_REPLACE_Z_INDEX,
            };

            return new SheetFindReplaceHighlightShape(`find-highlight-${index}`, props);
        });

        scene.addObjects(highlightShapes);
        this._highlightShapes = highlightShapes;

        scene.makeDirty();
    }

    private _updateCurrentHighlightShape(matchIndex?: number): void {
        // de-highlight the current highlighted shape
        this._currentHighlightShape?.setShapeProps({ activated: false });
        this._currentHighlightShape = null;

        if (matchIndex !== undefined) {
            const shape = this._highlightShapes[matchIndex];
            if (!shape) {
                return;
            }

            this._currentHighlightShape = shape;
            shape.setShapeProps({ activated: true });
        }
    }

    private _getSheetObject() {
        return getSheetObject(this._univerInstanceService, this._renderManagerService);
    }

    private _focusMatch(match: ISheetCellMatch): void {
        const subUnitId = match.range.subUnitId;
        if (subUnitId !== this._workbook.getActiveSheet()?.getSheetId()) {
            this._commandService.executeCommand(SetWorksheetActivateCommand.id, { unitId: this._workbook.getUnitId(), subUnitId } as ISetWorksheetActivateCommandParams, { fromFindReplace: true });
        }

        this._commandService.executeCommand(
            ScrollToCellCommand.id,
            { range: match.range.range } as IScrollToCellCommandParams,
            { fromFindReplace: true }
        );
    }

    private _tryRestoreLastMatchesPosition(lastMatch: Nullable<ISheetCellMatch>, newMatches: ISheetCellMatch[]): number {
        if (!lastMatch) return 0;

        const { subUnitId: lastSubUnitId } = lastMatch.range;
        const { startColumn: lastStartColumn, startRow: lastStartRow } = lastMatch.range.range;
        const index = newMatches.findIndex((match) => {
            if (lastSubUnitId !== match.range.subUnitId) {
                return false;
            }

            const { startColumn, startRow } = match.range.range;
            return startColumn === lastStartColumn && startRow === lastStartRow;
        });

        return index > -1 ? index + 1 : 0;
    }

    override moveToNextMatch(params?: IFindMoveParams): ISheetCellMatch | null {
        if (!this._matches.length) {
            return null;
        }

        const loop = params?.loop ?? false;
        const stayIfOnMatch = params?.stayIfOnMatch ?? false;
        const noFocus = params?.noFocus ?? false;
        const ignoreSelection = params?.ignoreSelection ?? false;

        const matchToMove = this._findNextMatch(loop, stayIfOnMatch, ignoreSelection);
        if (matchToMove) {
            const [match, index] = matchToMove;
            this._matchesPosition = index + 1;

            if (this._query!.findScope === FindScope.UNIT) {
                this._activeHighlightIndex = this._matchesByWorksheet.get(match.range.subUnitId)!.findIndex((m) => m === match);
            } else {
                this._activeHighlightIndex = index;
            }

            if (!noFocus) this._focusMatch(match);
            if (this._workbook.getActiveSheet()?.getSheetId() === match.range.subUnitId) {
                this._updateCurrentHighlightShape(this._activeHighlightIndex);
            }

            return match;
        }

        this._matchesPosition = 0;
        this._updateCurrentHighlightShape();
        return null;
    }

    override moveToPreviousMatch(params?: IFindMoveParams): ISheetCellMatch | null {
        if (!this._matches.length) {
            return null;
        }

        const loop = params?.loop ?? false;
        const stayIfOnMatch = params?.stayIfOnMatch ?? false;
        const noFocus = params?.noFocus ?? false;
        const ignoreSelection = params?.ignoreSelection ?? false;

        const matchToMove = this._findPreviousMatch(loop, stayIfOnMatch, ignoreSelection);
        if (matchToMove) {
            const [match, index] = matchToMove;
            this._matchesPosition = index + 1;

            if (this._query!.findScope === FindScope.UNIT) {
                this._activeHighlightIndex = this._matchesByWorksheet.get(match.range.subUnitId)!.findIndex((m) => m === match);
            } else {
                this._activeHighlightIndex = index;
            }

            if (!noFocus) this._focusMatch(match);
            if (this._workbook.getActiveSheet()?.getSheetId() === match.range.subUnitId) {
                this._updateCurrentHighlightShape(this._activeHighlightIndex);
            }

            return match;
        }

        this._matchesPosition = 0;
        this._updateCurrentHighlightShape();
        return null;
    }

    private _findPreviousMatch(loop = false, stayIfOnMatch = false, ignoreSelection = false): [ISheetCellMatch, number] | null {
        // Technically speaking, there are eight different situations!
        // Case 1: if there is a current match and the process is very easy
        if (this.currentMatch) {
            const currentMatchIndex = this._matches.findIndex((match) => match === this.currentMatch);
            if (stayIfOnMatch) {
                return [this.currentMatch, currentMatchIndex];
            }

            const nextMatchIndex = currentMatchIndex - 1;
            if (!loop && nextMatchIndex < 0) {
                return null;
            }

            const length = this._matches.length;
            const modded = (nextMatchIndex + length) % length;
            return [this._matches[modded], modded];
        }

        // Case 2: ignore current selection or there is no selection
        const lastSelection = this._workbookSelections.getCurrentLastSelection();
        if (ignoreSelection || !lastSelection) {
            const lastIndex = this._matches.length - 1;
            return [this._matches[lastIndex], lastIndex];
        }

        // Case 3: if there is no current match, we should find the next match that is closest to the user's current selection.
        // Still need to handle `stayInOnMatch` here.
        if (this._query!.findScope !== FindScope.UNIT) {
            return this._findPreviousMatchByRange(this._matches, lastSelection.range);
        }

        const currentSheetId = this._workbook.getActiveSheet()?.getSheetId();
        if (!currentSheetId) {
            return null;
        }

        const worksheetThatHasMatch = this._findPreviousWorksheetThatHasAMatch(currentSheetId, loop);
        if (!worksheetThatHasMatch) {
            return null;
        }

        return this._findPreviousMatchByRange(this._matchesByWorksheet.get(worksheetThatHasMatch)!, lastSelection.range);
    }

    private _findNextMatch(loop = false, stayIfOnMatch = false, ignoreSelection = false): [ISheetCellMatch, number] | null {
        // Technically speaking, there are eight different situations!
        // Case 1: if there is a current match and the process is very easy
        if (this.currentMatch) {
            const currentMatchIndex = this._matches.findIndex((match) => match === this.currentMatch);
            if (stayIfOnMatch) {
                return [this.currentMatch, currentMatchIndex];
            }

            const nextMatchIndex = currentMatchIndex + 1;
            const length = this._matches.length;
            if (!loop && nextMatchIndex >= length) {
                return null;
            }

            const modded = nextMatchIndex % length; // we don't need to add length here
            return [this._matches[modded], modded];
        }

        // Case 2:

        // Case 3: if there is no current match, we should find the next match that is closest to the user's current selection.
        // Still need to handle `stayInOnMatch` here.
        const last = this._workbookSelections.getCurrentLastSelection();
        if (ignoreSelection || !last) {
            return [this._matches[0], 0];
        }

        if (this._query!.findScope !== FindScope.UNIT) {
            return this._findNextMatchByRange(this._matches, last.range, stayIfOnMatch);
        }

        const currentSheetId = this._workbook.getActiveSheet()?.getSheetId();
        if (!currentSheetId) {
            return null;
        }

        const worksheetThatHasMatch = this._findNextWorksheetThatHasAMatch(currentSheetId, loop);
        if (!worksheetThatHasMatch) {
            return null;
        }

        return this._findNextMatchByRange(this._matchesByWorksheet.get(worksheetThatHasMatch)!, last.range);
    }

    private _findPreviousWorksheetThatHasAMatch(currentWorksheet: string, loop = false): string | null {
        const rawWorksheetsInOrder = this._workbook.getSheetOrders();
        const currentSheetIndex = rawWorksheetsInOrder.findIndex((sheet) => sheet === currentWorksheet);
        const worksheetsToSearch = loop
            ? rotate(rawWorksheetsInOrder, currentSheetIndex + 1)
            : rawWorksheetsInOrder.slice(0, currentSheetIndex + 1);
        const first = worksheetsToSearch.findLast((worksheet) => this._matchesByWorksheet.has(worksheet));
        return first ?? null;
    }

    private _findNextWorksheetThatHasAMatch(currentWorksheet: string, loop = false): string | null {
        const rawWorksheetsInOrder = this._workbook.getSheetOrders();
        const currentSheetIndex = rawWorksheetsInOrder.findIndex((sheet) => sheet === currentWorksheet);
        const worksheetsToSearch = loop
            ? rotate(rawWorksheetsInOrder, currentSheetIndex)
            : rawWorksheetsInOrder.slice(currentSheetIndex);
        const first = worksheetsToSearch.find((worksheet) => this._matchesByWorksheet.has(worksheet));
        return first ?? null;
    }

    private _findNextMatchByRange(matches: ISheetCellMatch[], range: IRange, stayIfOnMatch = false): [ISheetCellMatch, number] {
        const findByRow = this._query!.findDirection === FindDirection.ROW;
        let index = matches.findIndex((match) => {
            const matchRange = match.range.range;
            const isBehind = findByRow ? isBehindPositionWithRowPriority(range, matchRange) : isBehindPositionWithColumnPriority(range, matchRange);
            if (!isBehind) {
                return false;
            }

            const isSame = isSamePosition(range, matchRange);
            return stayIfOnMatch ? isSame : !isSame;
        });

        if (index === -1) {
            index = matches.length - 1;
        }

        const match = matches[index];
        return [match, this._matches.findIndex((m) => m === match)];
    }

    private _findPreviousMatchByRange(matches: ISheetCellMatch[], range: IRange, stayIfOnMatch = false): [ISheetCellMatch, number] {
        const findByRow = this._query!.findDirection === FindDirection.ROW;
        let index = this._matches.findLastIndex((match) => {
            const matchRange = match.range.range;
            const isBefore = findByRow ? isBeforePositionWithRowPriority(range, matchRange) : isBeforePositionWithColumnPriority(range, matchRange);
            if (!isBefore) {
                return false;
            }

            const isSame = isSamePosition(range, matchRange);
            return stayIfOnMatch ? isSame : !isSame;
        });

        if (index === -1) {
            index = 0;
        }

        const match = matches[index];
        return [match, this._matches.findIndex((m) => m === match)];
    }

    async replace(replaceString: string): Promise<boolean> {
        if (this._matchesCount === 0 || !this.currentMatch || !this._query || !this.currentMatch.replaceable) {
            return false;
        }

        const range = this.currentMatch.range;
        const targetWorksheet = this._workbook.getSheetBySheetId(this.currentMatch.range.subUnitId)!;
        const newContent = this._getReplacedCellData(
            this.currentMatch,
            targetWorksheet,
            this._query.findBy === FindBy.FORMULA,
            this._query.findString,
            replaceString,
            this._query.caseSensitive ? 'g' : 'ig'
        );

        // for single cell replace we just use SetRangeValuesCommand directly for simplicity
        const params: ISetRangeValuesCommandParams = {
            unitId: this.currentMatch.unitId,
            subUnitId: range.subUnitId,
            value: {
                [range.range.startRow]: {
                    [range.range.startColumn]: newContent,
                },
            } as IObjectMatrixPrimitiveType<ICellData>,
        };

        return this._commandService.executeCommand(SetRangeValuesCommand.id, params);
    }

    async replaceAll(replaceString: string): Promise<IReplaceAllResult> {
        if (this._matchesCount === 0 || !this._query) {
            return { success: 0, failure: 0 };
        }

        const unitId = this._workbook.getUnitId();

        const { findString, caseSensitive, findBy } = this._query!;
        const shouldReplaceFormula = findBy === FindBy.FORMULA;
        const replaceFlag = caseSensitive ? 'g' : 'ig';

        const replacements: ISheetReplacement[] = [];
        const matchesByWorksheet = groupBy(this._matches.filter((m) => m.replaceable), (match) => match.range.subUnitId);
        matchesByWorksheet.forEach((matches, subUnitId) => {
            const matrix = new ObjectMatrix<ICellData>();
            const worksheet = this._workbook.getSheetBySheetId(subUnitId)!;

            matches.forEach((match) => {
                const { startColumn, startRow } = match.range.range;
                const newCellData = this._getReplacedCellData(match, worksheet, shouldReplaceFormula, findString, replaceString!, replaceFlag);
                if (newCellData) {
                    matrix.setValue(startRow, startColumn, newCellData);
                }
            });

            replacements.push({
                count: matches.length,
                subUnitId,
                value: matrix.getMatrix(),
            });
        });

        if (!replacements) {
            return { success: 0, failure: 0 };
        }

        return this._commandService.executeCommand(SheetReplaceCommand.id, {
            unitId,
            replacements,
        } as ISheetReplaceCommandParams);
    }

    private _getReplacedCellData(
        match: ISheetCellMatch,
        worksheet: Worksheet,
        shouldReplaceFormula: boolean,
        findString: string,
        replaceString: string,
        replaceFlag: string
    ): Nullable<ICellData> {
        const range = match.range.range;
        const { startRow, startColumn } = range;

        const currentContent = worksheet.getCellRaw(startRow, startColumn)!;
        // TODO: should not get it again, just hook to match item

        // replace formula
        if (match.isFormula) {
            if (!shouldReplaceFormula) {
                return null;
            }

            const newContent = currentContent!.f!.replace(new RegExp(escapeRegExp(findString), replaceFlag), replaceString);
            return { f: newContent, v: null };
        }

        // replace rich format text
        const isRichText = !!currentContent.p?.body;
        if (isRichText) {
            const clonedRichText = Tools.deepClone(currentContent.p!);
            replaceInDocumentBody(clonedRichText.body!, findString, replaceString, this._query!.caseSensitive);
            return { p: clonedRichText };
        }

        // replace plain text string
        const newContent = currentContent.v!.toString().replace(new RegExp(escapeRegExp(findString), replaceFlag), replaceString!);
        return { v: newContent };
    }
}

function escapeRegExp(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * This module is responsible for searching and replacing in the sheets.
 * It also adds the search results to the search view by highlighting them.
 */
class SheetsFindReplaceProvider extends Disposable implements IFindReplaceProvider {
    /**
     * Hold all find results in this kind of univer business instances (Workbooks).
     */
    private readonly _findModelsByUnitId = new Map<string, SheetFindModel>();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    async find(query: IFindQuery): Promise<SheetFindModel[]> {
        this._terminate();

        const allWorkbooks = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const parsedQuery = this._preprocessQuery(query);
        const findModels = allWorkbooks.map((workbook) => {
            const skeletonManagerService = this._renderManagerService.getRenderById(workbook.getUnitId())!.with(SheetSkeletonManagerService);
            const sheetFind = this._injector.createInstance(SheetFindModel, workbook, skeletonManagerService);
            this._findModelsByUnitId.set(workbook.getUnitId(), sheetFind);
            sheetFind.start(parsedQuery);
            return sheetFind;
        });

        return findModels;
    }

    terminate(): void {
        this._terminate();
    }

    private _terminate(): void {
        this._findModelsByUnitId.forEach((model) => model.dispose());
        this._findModelsByUnitId.clear();
    }

    /**
     * Parsed the query object before do actual searching in favor of performance.
     * @param query the raw query object
     * @returns the parsed query object
     */
    private _preprocessQuery(query: Readonly<IFindQuery>): IFindQuery {
        let findString = query.caseSensitive
            ? query.findString
            : query.findString.toLowerCase();

        findString = findString.trim();

        return {
            ...query,
            findString,
        };
    }
}

// Use this object to pass results in avoid of GC.
interface IValuePassingObject {
    hit: boolean;
    replaceable: boolean;
    isFormula: boolean;
    rawData: Nullable<ICellData>;
}
const VALUE_PASSING_OBJECT: IValuePassingObject = { hit: false, replaceable: false, isFormula: false, rawData: null };

/**
 * This function determines if a cell's content matches what is searched for.
 * @param worksheet worksheet the Worksheet to search
 * @param row the row index
 * @param col the column index
 * @param query the parsed query object
 * @returns if the cell is hit, replaceable and is a formula
 */
export function hitCell(worksheet: Worksheet, row: number, col: number, query: IFindQuery, cellData: ICellData): IValuePassingObject {
    const { findBy } = query;
    const findByFormula = findBy === FindBy.FORMULA;

    const rawData = worksheet.getCellRaw(row, col);
    VALUE_PASSING_OBJECT.rawData = rawData;

    // Deal with formula searching first.
    const hasFormula = !!rawData?.f;
    if (hasFormula) {
        VALUE_PASSING_OBJECT.isFormula = true;

        // For formula, it is only replaceable when it matches the raw formula.
        if (findByFormula) {
            const formulaMatch = matchCellData({ v: rawData.f! }, query);
            if (formulaMatch) {
                VALUE_PASSING_OBJECT.hit = true;
                VALUE_PASSING_OBJECT.replaceable = true;
                return VALUE_PASSING_OBJECT;
            }

            VALUE_PASSING_OBJECT.hit = false;
            VALUE_PASSING_OBJECT.replaceable = false;
            return VALUE_PASSING_OBJECT;
        }

        // Otherwise, no matter it matches the result value, it should be unreplaceable.
        VALUE_PASSING_OBJECT.replaceable = false;
        if (matchCellData(cellData, query)) {
            VALUE_PASSING_OBJECT.hit = true;
        } else {
            VALUE_PASSING_OBJECT.hit = false;
        }

        return VALUE_PASSING_OBJECT;
    }

    // If the cell does not match, we should not check the raw data.
    VALUE_PASSING_OBJECT.isFormula = false;
    if (!matchCellData(cellData, query)) {
        VALUE_PASSING_OBJECT.hit = false;
        VALUE_PASSING_OBJECT.replaceable = false;
    } else if (!rawData) {
        VALUE_PASSING_OBJECT.hit = true;
        VALUE_PASSING_OBJECT.replaceable = false;
    } else {
        VALUE_PASSING_OBJECT.hit = true;
        VALUE_PASSING_OBJECT.replaceable = true;
    }

    return VALUE_PASSING_OBJECT;
}

function matchCellData(cellData: ICellData, query: IFindQuery): boolean {
    let value = extractPureValue(cellData);
    if (!value) {
        return false;
    }

    if (query.matchesTheWholeCell) {
        // Only need to trim the next when we want to match the whole cell.
        value = trimLeadingTrailingWhitespace(value);
        return query.caseSensitive
            ? value === query.findString
            : value.toLowerCase() === query.findString;
    }
    return query.caseSensitive
        ? value.indexOf(query.findString) > -1
        : value.toLowerCase().indexOf(query.findString) > -1;
}

function extractPureValue(cell: ICellData): Nullable<string> {
    const rawValue = cell?.p?.body?.dataStream ?? cell?.v;

    if (typeof rawValue === 'number') {
        return `${rawValue}`;
    }

    if (typeof rawValue === 'boolean') {
        return rawValue ? '1' : '0';
    }

    return rawValue;
}

/**
 * Trim only white spaces but not line breaks from the start and end of a string.
 * @param value the string to be trimmed
 */
function trimLeadingTrailingWhitespace(value: string): string {
    return value.replace(/^ +/g, '').replace(/ +$/g, ''); // be careful there are two spaces in the regex
}
