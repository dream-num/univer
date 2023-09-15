import {
    Documents,
    getParagraphBySpan,
    hasListSpan,
    IDocumentSkeletonLine,
    IDocumentSkeletonSpan,
    IEditorInputConfig,
    INodePosition,
    INodeSearch,
    isFirstSpan,
    isIndentBySpan,
    isPlaceholderOrSpace,
    isSameLine,
    TextSelection,
} from '@univerjs/base-render';
import {
    DataStreamTreeTokenType,
    Direction,
    Disposable,
    DisposableCollection,
    DocumentModel,
    fromObservable,
    ICommandService,
    ICurrentUniverService,
    IParagraph,
    Nullable,
    Observable,
    toDisposable,
} from '@univerjs/core';
import { IDisposable, Inject } from '@wendellhu/redi';

import { DeleteCommand, IMEInputCommand, InsertCommand, UpdateCommand } from '../commands/commands/core-editing.command';
import { DocsViewManagerService } from '../services/docs-view-manager/docs-view-manager.service';
import { DocsView } from '../View/Render/Views';

/**
 * InputController handles inputting events on the currently focused DocsView and apply edits to corresponding UniverDoc.
 */
export class InputController extends Disposable {
    private _previousIMEContent: string = '';

    private _previousIMEStart: number;

    private _currentNodePosition: Nullable<INodePosition>;

    private _editorDisposables: DisposableCollection | null;

    private _currentDocsView: DocsView | null;

    constructor(
        @Inject(DocsViewManagerService) private readonly _docsViewManager: DocsViewManagerService,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this.disposeWithMe(
            fromObservable(
                this._docsViewManager.current$.subscribe((docsView) => {
                    this._currentDocsView?.getDocs().disableEditor();
                    this._editorDisposables?.dispose();
                    this._editorDisposables = null;

                    if (docsView) {
                        this._currentDocsView = docsView;
                        this._editorDisposables = this._initialize(docsView);
                    }
                })
            )
        );
    }

    override dispose(): void {
        super.dispose();

        this._currentDocsView = null;
        this._editorDisposables?.dispose();
    }

    moveCursor(_docModel: DocumentModel, direction: Direction) {
        if (!this._currentDocsView) {
            return;
        }

        const documents = this._currentDocsView.getDocs();
        const activeSelection = documents.getActiveSelection();
        if (!activeSelection) {
            return false;
        }

        const startNodePosition = activeSelection.getStart();
        const preSpan = documents.findSpanByPosition(startNodePosition);

        // TODO@DR-Univer: 这里的代码重复的部分比较多
        if (direction === Direction.DOWN || direction === Direction.UP) {
            const newPos = this._getTopOrBottomPosition(documents as Documents, preSpan, direction === Direction.DOWN);
            if (newPos == null) {
                return;
            }

            const selectionRemain = documents.remainActiveSelection() as TextSelection | undefined;
            if (selectionRemain == null) {
                return;
            }

            this._syncSelection(documents as Documents, selectionRemain, newPos, true);
        } else if (direction === Direction.LEFT) {
            const activeRange = activeSelection.getRange();
            const cursorStart = activeRange.cursorStart;
            let cursor = cursorStart;
            let span: Nullable<IDocumentSkeletonSpan>;
            let isBack = false;
            if (isFirstSpan(preSpan)) {
                span = documents.findNodeByCharIndex(cursor);

                if (preSpan === span) {
                    isBack = true;
                }

                while (isPlaceholderOrSpace(span)) {
                    span = documents.findNodeByCharIndex(--cursor);
                }
            } else {
                span = documents.findNodeByCharIndex(--cursor);
            }

            const selectionRemain = documents.remainActiveSelection() as TextSelection | undefined;
            this._adjustSelection(documents, selectionRemain, span, isBack, true);
        } else {
            const activeRange = activeSelection.getRange();
            const cursorStart = activeRange.cursorStart;
            const isStartBack = activeRange.isStartBack;
            let cursor = cursorStart;
            if (isStartBack === true) {
                cursor -= 1;
            }

            let span = documents.findNodeByCharIndex(++cursor);

            const originCursor = cursor;

            while (isPlaceholderOrSpace(span)) {
                span = documents.findNodeByCharIndex(++cursor);
            }

            let isBack = false;
            if (isFirstSpan(span) && preSpan !== span) {
                isBack = true;
            } else {
                span = documents.findNodeByCharIndex(originCursor);
            }

            if (span == null) {
                return;
            }
            const selectionRemain = documents.remainActiveSelection() as TextSelection | undefined;
            this._adjustSelection(documents, selectionRemain, span, isBack, true);
        }
    }

    // eslint-disable-next-line max-lines-per-function
    deleteLeft() {
        if (!this._currentDocsView) {
            return;
        }

        const document = this._currentDocsView.getDocs();
        const activeSelection = document.getActiveSelection();
        if (!activeSelection) {
            return;
        }

        const skeleton = document.getSkeleton();
        const docsModel = this._currentUniverService.getCurrentUniverDocInstance().getDocument();
        const startNodePosition = activeSelection.getStart();
        const preSpan = document.findSpanByPosition(startNodePosition);

        const preIsBullet = hasListSpan(preSpan);

        const preIsIndent = isIndentBySpan(preSpan, docsModel.body);

        const activeRange = activeSelection.getRange();
        const cursorStart = activeRange.cursorStart;
        const isStartBack = activeRange.isStartBack;
        const isCollapse = activeRange.isCollapse;
        const segmentId = activeSelection.segmentId;
        let cursor = cursorStart;

        if (isStartBack === true) {
            cursor -= 1;
        }

        if (isCollapse === false) {
            cursor += 1;
        }

        let span = document.findNodeByCharIndex(cursor);

        const selectionRemain = document.remainActiveSelection() as TextSelection | undefined;

        // const content = document.findNodeByCharIndex(cursor - 1)?.content || '';
        const isUpdateParagraph = isFirstSpan(preSpan) && span !== preSpan && (preIsBullet === true || preIsIndent === true);
        if (isUpdateParagraph) {
            const paragraph = getParagraphBySpan(preSpan, docsModel.body);

            if (paragraph == null) {
                return;
            }

            const paragraphIndex = paragraph?.startIndex;

            const updateParagraph: IParagraph = { startIndex: 0 };

            const paragraphStyle = paragraph.paragraphStyle;
            if (preIsBullet === true) {
                const paragraphStyle = paragraph.paragraphStyle;
                if (paragraphStyle) {
                    updateParagraph.paragraphStyle = paragraphStyle;
                }
            } else if (preIsIndent === true) {
                const bullet = paragraph.bullet;
                if (bullet) {
                    updateParagraph.bullet = bullet;
                }
                if (paragraphStyle != null) {
                    updateParagraph.paragraphStyle = { ...paragraphStyle };
                    delete updateParagraph.paragraphStyle.hanging;
                    delete updateParagraph.paragraphStyle.indentStart;
                }
            }

            this._commandService.executeCommand(UpdateCommand.id, {
                unitId: docsModel.getUnitId(),
                body: {
                    dataStream: '',
                    paragraphs: [{ ...updateParagraph }],
                },
                range: {
                    cursorStart: paragraphIndex,
                    cursorEnd: paragraphIndex,
                    isEndBack: false,
                    isStartBack: false,
                    isCollapse: true,
                },
                segmentId,
            });
        } else {
            const endNodePosition = activeSelection?.getEnd();
            if (endNodePosition != null) {
                const endSpan = document.findSpanByPosition(endNodePosition);
                if (hasListSpan(endSpan) && !isSameLine(preSpan, endSpan)) {
                    activeRange.cursorEnd -= 1;
                }
            }

            this._commandService.executeCommand(DeleteCommand.id, {
                unitId: docsModel.getUnitId(),
                range: activeRange,
                segmentId,
            });
        }

        skeleton?.calculate();

        let isBack = false;

        if (isUpdateParagraph) {
            isBack = true;
            cursor++;
        } else if (isFirstSpan(span)) {
            isBack = true;
        } else {
            cursor--;
        }
        span = document.findNodeByCharIndex(cursor);

        this._adjustSelection(document as Documents, selectionRemain, span, isBack);

        //
        this._resetIME();
    }

    breakLine() {
        if (!this._currentDocsView) {
            return;
        }

        const document = this._currentDocsView.getDocs();
        const activeSelection = document.getActiveSelection();
        if (!activeSelection) {
            return;
        }

        const skeleton = document.getSkeleton();
        const docsModel = this._currentUniverService.getCurrentUniverDocInstance().getDocument();
        const startNodePosition = activeSelection.getStart();

        const activeRange = activeSelection.getRange();
        const cursorStart = activeRange.cursorStart;
        const isStartBack = activeRange.isStartBack;
        const segmentId = activeSelection.segmentId;
        // split paragraph
        let cursor = cursorStart;

        if (isStartBack === false) {
            cursor += 1;
        }

        const selectionRemain = document.remainActiveSelection() as TextSelection | undefined;

        this._commandService.executeCommand(InsertCommand.id, {
            unitId: docsModel.getUnitId(),
            body: {
                dataStream: DataStreamTreeTokenType.PARAGRAPH,
                paragraphs: this._generateParagraph(DataStreamTreeTokenType.PARAGRAPH),
            },
            range: activeRange,
            segmentId,
        });

        skeleton?.calculate();

        const span = document.findNodeByCharIndex(++cursor);

        this._adjustSelection(document as Documents, selectionRemain, span, true);
    }

    private _initialInput(onInputObservable: Observable<IEditorInputConfig>, docsModel: DocumentModel): IDisposable {
        const observer = onInputObservable.add((config) => {
            const { event, content = '', document, activeSelection, selectionList } = config;

            const e = event as InputEvent;

            const activeRange = activeSelection?.getRange();

            const skeleton = document.getSkeleton();

            const segmentId = activeSelection?.segmentId;

            if (e.data == null) {
                return;
            }

            if (!skeleton || !activeRange) {
                return;
            }

            const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = activeRange;

            let cursor = cursorStart;

            if (isStartBack === false) {
                cursor += 1;
            }

            const selectionRemain = document.remainActiveSelection() as TextSelection | undefined;

            this._commandService.executeCommand(InsertCommand.id, {
                unitId: docsModel.getUnitId(),
                body: {
                    dataStream: content,
                },
                range: activeRange,
                segmentId,
            });

            skeleton.calculate();

            cursor += content.length - 1;

            const span = document.findNodeByCharIndex(cursor);

            this._adjustSelection(document as Documents, selectionRemain, span);
        });

        return toDisposable(() => onInputObservable.remove(observer));
    }

    private _initialComposition(
        onCompositionstartObservable: Observable<IEditorInputConfig>,
        onCompositionupdateObservable: Observable<IEditorInputConfig>,
        onCompositionendObservable: Observable<IEditorInputConfig>,
        docsModel: DocumentModel
    ): IDisposable {
        const startObserver = onCompositionstartObservable.add((config) => {
            const { activeSelection, selectionList } = config;

            const activeRange = activeSelection?.getRange();

            if (!activeRange) {
                return;
            }

            const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = activeRange;

            let cursor = cursorStart;

            if (isStartBack === true) {
                cursor -= 1;
            }
            this._previousIMEStart = cursor;
        });

        const updateObserver = onCompositionupdateObservable.add(async (config) => {
            const { event, document, activeSelection } = config;

            let cursor = this._previousIMEStart;

            const skeleton = document.getSkeleton();

            const segmentId = activeSelection?.segmentId;

            if (!skeleton) {
                return;
            }

            const e = event as CompositionEvent;

            const content = e.data;

            if (content === this._previousIMEContent) {
                return;
            }

            const selectionRemain = document.remainActiveSelection() as TextSelection | undefined;

            await this._commandService.executeCommand(IMEInputCommand.id, {
                unitId: docsModel.getUnitId(),
                newText: content,
                oldTextLen: this._previousIMEContent.length,
                start: cursor,
                segmentId,
            });

            skeleton.calculate();

            cursor += content.length;

            const span = document.findNodeByCharIndex(cursor);

            this._adjustSelection(document as Documents, selectionRemain, span);

            this._previousIMEContent = content;
        });

        const endObserver = onCompositionendObservable.add((config) => {
            this._resetIME();
        });

        return toDisposable(() => {
            onCompositionstartObservable.remove(startObserver);
            onCompositionupdateObservable.remove(updateObserver);
            onCompositionendObservable.remove(endObserver);
        });
    }

    private _getTopOrBottomPosition(document: Documents, span: Nullable<IDocumentSkeletonSpan>, direction: boolean): Nullable<INodePosition> {
        const referenceSpan = document.findSpanByPosition(this._currentNodePosition);
        if (referenceSpan == null || span == null) {
            return;
        }

        const offsetLeft = this._getSpanLeftOffsetInLine(referenceSpan);

        const line = this._getNextOrPrevLine(span, direction);

        if (line == null) {
            return;
        }

        const position: Nullable<INodeSearch> = this._matchPositionByLeftOffset(document, line, offsetLeft);

        let isBack = this._currentNodePosition?.isBack;

        isBack = isBack == null ? false : isBack;

        if (position == null) {
            return;
        }

        return { ...position, isBack };
    }

    private _getSpanLeftOffsetInLine(span: IDocumentSkeletonSpan) {
        const divide = span.parent;

        if (divide == null) {
            return -Infinity;
        }

        const divideLeft = divide.left;

        const { left, width } = span;

        const start = divideLeft + left;

        if (this._currentNodePosition?.isBack === true) {
            return start;
        }

        return start + width;
    }

    private _matchPositionByLeftOffset(document: Documents, line: IDocumentSkeletonLine, offsetLeft: number) {
        const nearestNode: {
            span?: IDocumentSkeletonSpan;
            distance: number;
        } = {
            distance: Infinity,
        };
        for (const divide of line.divides) {
            const divideLeft = divide.left;
            for (const span of divide.spanGroup) {
                const { left, width } = span;
                const leftSide = divideLeft + left;
                const rightSide = leftSide + width;
                if (offsetLeft >= leftSide && offsetLeft <= rightSide) {
                    return document.findPositionBySpan(span);
                }

                const distance = Math.abs(offsetLeft - (leftSide + rightSide) / 2);
                if (distance < nearestNode.distance) {
                    nearestNode.span = span;
                    nearestNode.distance = distance;
                }
            }
        }

        if (nearestNode.span == null) {
            return;
        }

        return document.findPositionBySpan(nearestNode.span);
    }

    // eslint-disable-next-line max-lines-per-function
    private _getNextOrPrevLine(span: IDocumentSkeletonSpan, direction: boolean) {
        const divide = span.parent;
        if (divide == null) {
            return;
        }

        const line = divide.parent;
        if (line == null) {
            return;
        }

        const column = line.parent;
        if (column == null) {
            return;
        }

        const currentLineIndex = column.lines.indexOf(line);

        if (currentLineIndex === -1) {
            return;
        }

        let newLine: IDocumentSkeletonLine;

        if (direction === true) {
            newLine = column.lines[currentLineIndex + 1];
        } else {
            newLine = column.lines[currentLineIndex - 1];
        }

        if (newLine != null) {
            return newLine;
        }

        const section = column.parent;

        if (section == null) {
            return;
        }

        const currentColumnIndex = section.columns.indexOf(column);

        if (currentColumnIndex === -1) {
            return;
        }

        if (direction === true) {
            newLine = section.columns[currentColumnIndex + 1]?.lines[0];
        } else {
            const prevColumnLines = section.columns?.[currentColumnIndex - 1]?.lines;
            newLine = prevColumnLines?.[prevColumnLines.length - 1];
        }

        if (newLine != null) {
            return newLine;
        }

        const page = section.parent;

        if (page == null) {
            return;
        }

        const currentSectionIndex = page.sections.indexOf(section);

        if (currentSectionIndex === -1) {
            return;
        }

        if (direction === true) {
            newLine = page.sections[currentSectionIndex - 1]?.columns[0]?.lines[0];
        } else {
            const prevColumns = page.sections?.[currentSectionIndex - 1]?.columns;
            const column = prevColumns?.[prevColumns.length - 1];
            const prevColumnLines = column?.lines;
            newLine = prevColumnLines?.[prevColumnLines.length - 1];
        }

        if (newLine != null) {
            return newLine;
        }

        const skeleton = page.parent;

        if (skeleton == null) {
            return;
        }

        const currentPageIndex = skeleton.pages.indexOf(page);

        if (currentPageIndex === -1) {
            return;
        }

        if (direction === true) {
            newLine = skeleton.pages[currentPageIndex + 1]?.sections[0]?.columns[0]?.lines[0];
        } else {
            const prevSections = skeleton.pages[currentPageIndex - 1]?.sections;
            if (prevSections == null) {
                return;
            }
            const prevColumns = prevSections[prevSections.length - 1]?.columns;
            const column = prevColumns[prevColumns.length - 1];
            const prevColumnLines = column?.lines;
            newLine = prevColumnLines[prevColumnLines.length - 1];
        }

        if (newLine != null) {
            return newLine;
        }
    }

    private _generateParagraph(dataStream: string) {
        const paragraphs: IParagraph[] = [];
        for (let i = 0, len = dataStream.length; i < len; i++) {
            const char = dataStream[i];
            if (char !== DataStreamTreeTokenType.PARAGRAPH) {
                continue;
            }

            paragraphs.push({
                startIndex: i,
            });
        }
        return paragraphs;
    }

    private _resetIME() {
        this._previousIMEContent = '';

        this._previousIMEStart = -1;
    }

    private _getIncreaseText(current: string, old: string) {
        const oldLen = old.length;
        return current.slice(oldLen);
    }

    private _adjustSelection(document: Documents, selectionRemain?: TextSelection, span?: Nullable<IDocumentSkeletonSpan>, isBack = false, isSyncScroll = false) {
        if (span == null) {
            return;
        }

        const position = document.findPositionBySpan(span);

        if (position == null || selectionRemain == null) {
            return;
        }

        const newPos: INodePosition = { ...position, isBack };

        this._syncSelection(document, selectionRemain, newPos, isSyncScroll);

        this._currentNodePosition = selectionRemain.getStart();

        // document.addSelection(selectionRemain);

        // selectionRemain.startNodePosition = newPos;

        // selectionRemain.endNodePosition = undefined;

        // selectionRemain.refresh(document);

        // this._currentNodePosition = selectionRemain.getStart();

        // if (isSyncScroll) {
        //     document.scrollBySelection();
        // }

        // document.syncSelection();
    }

    private _syncSelection(document: Documents, selectionRemain: TextSelection, newPos: INodePosition, isSyncScroll = false) {
        document.addSelection(selectionRemain);

        selectionRemain.startNodePosition = newPos;

        selectionRemain.endNodePosition = undefined;

        selectionRemain.refresh(document);

        if (isSyncScroll) {
            document.scrollBySelection();
        }

        document.syncSelection();
    }

    private _initialize(docsView: DocsView): DisposableCollection {
        docsView.getDocs().enableEditor();
        const events = docsView.getDocs().getEditorInputEvent();
        const docsModel = this._currentUniverService.getCurrentUniverDocInstance().getDocument();
        const disposableCollection = new DisposableCollection();

        if (!events) {
            return disposableCollection;
        }

        const { onInputObservable, onCompositionstartObservable, onCompositionupdateObservable, onCompositionendObservable, onSelectionStartObservable } = events;

        disposableCollection.add(this._initialInput(onInputObservable, docsModel));
        disposableCollection.add(this._initialComposition(onCompositionstartObservable, onCompositionupdateObservable, onCompositionendObservable, docsModel));

        const observer = onSelectionStartObservable.add((nodePosition) => {
            this._currentNodePosition = nodePosition;
        });
        disposableCollection.add(toDisposable(() => onSelectionStartObservable.remove(observer)));

        return disposableCollection;
    }
}
