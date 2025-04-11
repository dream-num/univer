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

import type { DocumentDataModel, IDisposable, Nullable } from '@univerjs/core';
import type { IInsertCommandParams } from '@univerjs/docs-ui';
import type { Observable } from 'rxjs';
import { Disposable, ICommandService, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocCanvasPopManagerService, DocEventManagerService } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, tap } from 'rxjs';
import { DeleteSearchKeyCommand } from '../commands/commands/doc-quick-insert.command';
import { KeywordInputPlaceholder } from '../views/KeywordInputPlaceholder';
import { QuickInsertPopup } from '../views/QuickInsertPopup';

export interface IDocPopupGroupItem {
    id: string;
    icon?: string;
    title: string;
    children?: IDocPopupMenuItem[];
}

export interface IDocPopupMenuItem {
    id: string;
    icon?: string;
    title: string;
    keywords?: string[];
}

export type DocPopupMenu = IDocPopupGroupItem | IDocPopupMenuItem;

export interface IDocPopup {
    keyword: string;
    menus$: Observable<DocPopupMenu[]>;
    Placeholder?: React.ComponentType;
    preconditions?: (params: IInsertCommandParams) => boolean;
}

const noopDisposable = {
    dispose: () => {},
};
export class DocQuickInsertPopupService extends Disposable {
    private readonly _popups: Set<IDocPopup> = new Set();
    get popups() {
        return Array.from(this._popups);
    }

    private readonly _editPopup$ = new BehaviorSubject<Nullable<{
        popup: IDocPopup;
        anchor: number;
        disposable: IDisposable;
        unitId: string;
    }>>(undefined);

    readonly editPopup$ = this._editPopup$.asObservable();
    get editPopup() {
        return this._editPopup$.value;
    }

    private readonly _isComposing$ = new BehaviorSubject<boolean>(false);
    readonly isComposing$ = this._isComposing$.asObservable();
    get isComposing() {
        return this._isComposing$.value;
    }

    setIsComposing(isComposing: boolean) {
        this._isComposing$.next(isComposing);
    }

    private readonly _inputOffset$ = new BehaviorSubject<{ start: number; end: number }>({ start: 0, end: 0 });
    readonly inputOffset$ = this._inputOffset$.asObservable();
    get inputOffset() {
        return this._inputOffset$.value;
    }

    setInputOffset(offset: { start: number; end: number }) {
        this._inputOffset$.next(offset);
    }

    readonly filterKeyword$: Observable<string>;

    private _menuSelectedCallbacks: Set<(menu: IDocPopupMenuItem) => void> = new Set();

    private _inputPlaceholderRenderRoot: {
        unmount?: IDisposable;
        mount: () => void;
    } | null = null;

    private getDocEventManagerService(unitId: string) {
        return this._renderManagerService.getRenderById(unitId)?.with(DocEventManagerService);
    }

    constructor(
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopupManagerService: DocCanvasPopManagerService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(IRenderManagerService) private readonly _renderManagerService: IRenderManagerService,
        @Inject(DocSelectionManagerService) private readonly _docSelectionManagerService: DocSelectionManagerService
    ) {
        super();

        this.disposeWithMe(this._editPopup$);

        const getBodySlice = (start: number, end: number) => this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)?.getBody()?.dataStream.slice(start, end);

        let lastFilterKeyword = '';
        this.filterKeyword$ = this._inputOffset$.pipe(
            map((offset) => {
                const slice = getBodySlice(offset.start, offset.end);

                return slice?.slice(1) ?? '';
            }),
            distinctUntilChanged(),
            tap((filterKeyword) => {
                lastFilterKeyword = filterKeyword;
            })
        );

        this.disposeWithMe(combineLatest([
            this.filterKeyword$.pipe(tap((filterKeyword) => {
                if (filterKeyword.length > 0) {
                    this._inputPlaceholderRenderRoot?.unmount?.dispose();
                } else {
                    this._inputPlaceholderRenderRoot?.mount();
                }
            })),
            this.isComposing$.pipe(tap((isComposing) => {
                if (isComposing) {
                    this._inputPlaceholderRenderRoot?.unmount?.dispose();
                } else {
                    // If the last filter keyword is empty, after the composition end, mount the input placeholder render root
                    lastFilterKeyword.length <= 0 && this._inputPlaceholderRenderRoot?.mount();
                }
            })),
            this.editPopup$.pipe(tap((popup) => {
                if (!popup) {
                    this._inputPlaceholderRenderRoot?.unmount?.dispose();
                    this._inputPlaceholderRenderRoot = null;
                }
            })),
        ]).subscribe());
    }

    resolvePopup(keyword: string) {
        return Array.from(this._popups).find((popup) => popup.keyword === keyword);
    }

    registerPopup(popup: IDocPopup) {
        this._popups.add(popup);

        return () => {
            this._popups.delete(popup);
        };
    }

    private _createInputPlaceholderRenderRoot(mount: () => IDisposable) {
        const renderRoot: {
            isMounted: boolean;
            unmount?: IDisposable;
            mount: () => void;
        } = {
            isMounted: false,
            mount() {
                // Prevent duplicate mounting
                if (this.isMounted) {
                    return;
                }

                this.isMounted = true;

                const unmount = mount();

                this.unmount = {
                    dispose: () => {
                        unmount.dispose();
                        this.isMounted = false;
                    },
                };
            },
        };

        return renderRoot;
    }

    showPopup(options: { popup: IDocPopup; index: number; unitId: string }) {
        const { popup, index, unitId } = options;
        this.closePopup();
        const currentDoc = this._univerInstanceService.getUnit<DocumentDataModel>(unitId);
        const paragraph = currentDoc?.getBody()?.paragraphs?.find((p) => p.startIndex > index);
        if (!paragraph) {
            return;
        }
        const docEventManagerService = this.getDocEventManagerService(unitId);
        const paragraphBound = docEventManagerService?.findParagraphBoundByIndex(paragraph.startIndex);
        if (!paragraphBound) {
            return;
        }

        this._inputPlaceholderRenderRoot = this._createInputPlaceholderRenderRoot(() => {
            const docSkeletonManagerService = this._renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService);
            const activeRange = this._docSelectionManagerService.getActiveTextRange();
            if (!docSkeletonManagerService || !activeRange) {
                return noopDisposable;
            }

            const skeleton = docSkeletonManagerService.getSkeleton();
            const curGlyph = skeleton.findNodeByCharIndex(activeRange.startOffset, activeRange.segmentId, activeRange.segmentPage);
            const isEmptyLine = curGlyph?.content === '\r';
            // Only show filter keyword placeholder on empty line
            if (!isEmptyLine) {
                return noopDisposable;
            }

            const disposable = this._docCanvasPopupManagerService.attachPopupToRange(
                { startOffset: index + 1, endOffset: index + 1, collapsed: false },
                {
                    componentKey: KeywordInputPlaceholder.componentKey,
                    onClickOutside: () => {
                        disposable.dispose();
                    },
                    direction: 'horizontal',
                },
                unitId
            );

            return disposable;
        });
        this._inputPlaceholderRenderRoot.mount();

        const disposable = this._docCanvasPopupManagerService.attachPopupToRect(
            paragraphBound.firstLine,
            {
                componentKey: QuickInsertPopup.componentKey,
                onClickOutside: () => {
                    this.closePopup();
                },
                direction: 'bottom',
            },
            unitId
        );

        this._editPopup$.next({ disposable, popup, anchor: index, unitId });
    }

    closePopup() {
        if (this.editPopup) {
            this.editPopup.disposable.dispose();
            this._editPopup$.next(null);
        }
    }

    onMenuSelected(callback: (menu: IDocPopupMenuItem) => void) {
        this._menuSelectedCallbacks.add(callback);

        return () => {
            this._menuSelectedCallbacks.delete(callback);
        };
    }

    emitMenuSelected(menu: IDocPopupMenuItem) {
        const { start, end } = this.inputOffset;
        this._commandService.syncExecuteCommand(DeleteSearchKeyCommand.id, {
            start,
            end,
        });
        setTimeout(() => {
            this._menuSelectedCallbacks.forEach((callback) => callback(menu));
        }, 0);
    }
}
