import { Documents, IDocumentSkeletonLine, IDocumentSkeletonSpan, IEditorInputConfig, SpanType, TextSelection } from '@univerjs/base-render';
import { DataStreamTreeTokenType, DocumentModel, ICurrentUniverService, IParagraph, Nullable, Observable } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { CanvasView } from '../View/Render/CanvasView';
import { DocsView } from '../View/Render/Views';

enum KeyboardKeyType {
    Backspace = 'Backspace',
    Delete = 'Delete',
    Enter = 'Enter',
    Copy = 'c',
    Paste = 'v',
    ArrowUp = 'ArrowUp',
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrowLeft',
    ArrowRight = 'ArrowRight',
}

export class InputController {
    private _previousIMEContent: string = '';

    private _previousIMEStart: number;

    private _currentSpan: Nullable<IDocumentSkeletonSpan>;

    private _currentSpanPosBack: boolean = false;

    constructor(@Inject(CanvasView) private readonly _CanvasView: CanvasView, @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService) {
        this._initialize();
    }

    private _initialize() {
        const docsView = this._CanvasView.getDocsView() as DocsView;
        const events = docsView.getDocs().getEditorInputEvent();

        const docsModel = this._currentUniverService.getCurrentUniverDocInstance().getDocument();

        if (!events) {
            return;
        }
        const { onInputObservable, onCompositionstartObservable, onCompositionupdateObservable, onCompositionendObservable, onKeydownObservable, onSelectionStartObservable } =
            events;

        this._initialKeydown(onKeydownObservable, docsModel);

        this._initialInput(onInputObservable, docsModel);

        this._initialComposition(onCompositionstartObservable, onCompositionupdateObservable, onCompositionendObservable, docsModel);

        onSelectionStartObservable.add((nodeInfo) => {
            if (nodeInfo === false) {
                this._currentSpan = null;
            } else {
                this._currentSpan = nodeInfo.node;
            }
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _initialKeydown(onKeydownObservable: Observable<IEditorInputConfig>, docsModel: DocumentModel) {
        // eslint-disable-next-line max-lines-per-function
        onKeydownObservable.add((config) => {
            const { event, document, activeSelection, selectionList } = config;
            const e = event as KeyboardEvent;

            const isCtrl = e.ctrlKey;

            const activeRange = activeSelection?.getRange();

            const segmentId = activeSelection?.segmentId;

            const skeleton = document.getSkeleton();

            if (!skeleton || !activeRange) {
                return;
            }

            const { cursorStart, cursorEnd, isCollapse, isEndBack, isStartBack } = activeRange;

            if (e.key === KeyboardKeyType.Backspace) {
                let cursor = cursorStart;

                if (isStartBack === true) {
                    cursor -= 1;
                }

                if (isCollapse === false) {
                    cursor += 1;
                }

                const selectionRemain = document.remainActiveSelection() as TextSelection | undefined;

                // const content = document.findNodeByCharIndex(cursor - 1)?.content || '';

                docsModel.delete(activeRange, segmentId);

                skeleton.calculate();

                const span = document.findNodeByCharIndex(cursor - 1);

                this._adjustSelection(document as Documents, selectionRemain, span);

                this._resetIME();
            } else if (e.key === KeyboardKeyType.Enter) {
                // split paragraph
                let cursor = cursorStart;

                if (isStartBack === false) {
                    cursor += 1;
                }

                const selectionRemain = document.remainActiveSelection() as TextSelection | undefined;

                docsModel.insert(
                    {
                        dataStream: DataStreamTreeTokenType.PARAGRAPH,
                        paragraphs: this._generateParagraph(DataStreamTreeTokenType.PARAGRAPH),
                    },
                    activeRange,
                    segmentId
                );

                skeleton.calculate();

                const span = document.findNodeByCharIndex(cursor + 1);

                this._adjustSelection(document as Documents, selectionRemain, span, true);
            } else if (e.key === KeyboardKeyType.ArrowUp) {
                let cursor = cursorStart;
                if (isStartBack === true) {
                    cursor -= 1;
                }
                const span = document.findNodeByCharIndex(cursor);
                const newSpan = this._getTopOrBottomSpan(span, false);
                if (newSpan == null) {
                    return;
                }
                const selectionRemain = document.remainActiveSelection() as TextSelection | undefined;
                this._adjustSelection(document as Documents, selectionRemain, newSpan, false, true);
            } else if (e.key === KeyboardKeyType.ArrowDown) {
                let cursor = cursorStart;
                if (isStartBack === true) {
                    cursor -= 1;
                }
                const span = document.findNodeByCharIndex(cursor);
                const newSpan = this._getTopOrBottomSpan(span, true);
                if (newSpan == null) {
                    return;
                }
                const selectionRemain = document.remainActiveSelection() as TextSelection | undefined;
                this._adjustSelection(document as Documents, selectionRemain, newSpan, false, true);
            } else if (e.key === KeyboardKeyType.ArrowLeft) {
                let cursor = cursorStart;
                if (isStartBack === true) {
                    cursor -= 1;
                }
                const span = document.findNodeByCharIndex(cursor - 1);
                this._currentSpan = span;
                if (span == null) {
                    return;
                }
                const selectionRemain = document.remainActiveSelection() as TextSelection | undefined;
                this._adjustSelection(document as Documents, selectionRemain, span, false, true);
            } else if (e.key === KeyboardKeyType.ArrowRight) {
                // copy handler
                let cursor = cursorStart;
                if (isStartBack === true) {
                    cursor -= 1;
                }
                const span = document.findNodeByCharIndex(cursor + 1);
                this._currentSpan = span;
                if (span == null) {
                    return;
                }
                const selectionRemain = document.remainActiveSelection() as TextSelection | undefined;
                this._adjustSelection(document as Documents, selectionRemain, span, false, true);
            } else if (e.key === KeyboardKeyType.Copy && isCtrl) {
                // copy handler
            } else if (e.key === KeyboardKeyType.Paste && isCtrl) {
                // paste handler
            }
        });
    }

    private _initialInput(onInputObservable: Observable<IEditorInputConfig>, docsModel: DocumentModel) {
        onInputObservable.add((config) => {
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

            docsModel.insert({ dataStream: content }, activeRange, segmentId);

            skeleton.calculate();

            const span = document.findNodeByCharIndex(cursor + content.length - 1);

            this._adjustSelection(document as Documents, selectionRemain, span);
        });
    }

    private _initialComposition(
        onCompositionstartObservable: Observable<IEditorInputConfig>,
        onCompositionupdateObservable: Observable<IEditorInputConfig>,
        onCompositionendObservable: Observable<IEditorInputConfig>,
        docsModel: DocumentModel
    ) {
        onCompositionstartObservable.add((config) => {
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

        onCompositionupdateObservable.add((config) => {
            const { event, document, activeSelection } = config;

            const cursor = this._previousIMEStart;

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

            docsModel.IMEInput(content, this._previousIMEContent.length, cursor, segmentId);

            skeleton.calculate();

            const span = document.findNodeByCharIndex(cursor + content.length);

            this._adjustSelection(document as Documents, selectionRemain, span);

            this._previousIMEContent = content;
        });

        onCompositionendObservable.add((config) => {
            this._resetIME();
        });
    }

    private _getTopOrBottomSpan(span: Nullable<IDocumentSkeletonSpan>, direction: boolean) {
        const referenceSpan = this._currentSpan;
        if (referenceSpan == null || span == null) {
            return;
        }

        const offsetLeft = this._getSpanLeftOffsetInLine(referenceSpan);

        const line = this._getNextOrPrevLine(span, direction);

        if (line == null) {
            return;
        }

        const newSpan = this._matchSpanByLeftOffset(line, offsetLeft);

        return newSpan;
    }

    private _getSpanLeftOffsetInLine(span: IDocumentSkeletonSpan) {
        const divide = span.parent;

        if (divide == null) {
            return -Infinity;
        }

        const divideLeft = divide.left;

        const { left, width } = span;

        return divideLeft + left + width;
    }

    private _matchSpanByLeftOffset(line: IDocumentSkeletonLine, offsetLeft: number) {
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
                    return span;
                }

                const distance = Math.abs(offsetLeft - (leftSide + rightSide) / 2);
                if (distance < nearestNode.distance) {
                    nearestNode.span = span;
                    nearestNode.distance = distance;
                }
            }
        }

        return nearestNode.span;
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

        if (this._hasListSpan(span)) {
            position.span += 1;
        }

        const newPos = { ...position, isBack };

        document.addSelection(selectionRemain);

        selectionRemain.startNodePosition = newPos;

        selectionRemain.endNodePosition = undefined;

        selectionRemain.refresh(document);

        if (isSyncScroll) {
            document.scrollBySelection();
        }

        document.syncSelection();
    }

    private _hasListSpan(span: Nullable<IDocumentSkeletonSpan>) {
        const divide = span?.parent;

        if (divide == null) {
            return false;
        }

        const spanGroup = divide.spanGroup;

        return spanGroup[0]?.spanType === SpanType.LIST;
    }
}
