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
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
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

export class DocQuickInsertPopupService extends Disposable {
    private readonly _popups: Set<IDocPopup> = new Set();

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

    constructor(
        @Inject(DocCanvasPopManagerService) private readonly _docCanvasPopupManagerService: DocCanvasPopManagerService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ICommandService) private readonly _commandService: ICommandService
    ) {
        super();

        this.disposeWithMe(this._editPopup$);

        const getBodySlice = (start: number, end: number) => this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)?.getBody()?.dataStream.slice(start, end);

        this.filterKeyword$ = this._inputOffset$.pipe(
            map((offset) => {
                const slice = getBodySlice(offset.start, offset.end);

                return slice?.slice(1) ?? '';
            }),
            distinctUntilChanged()
        );

        this.disposeWithMe(combineLatest([
            this.filterKeyword$.pipe(tap((filterKeyword) => {
                if (filterKeyword.length > 0) {
                    this._inputPlaceholderRenderRoot?.unmount?.dispose();
                } else {
                    this._inputPlaceholderRenderRoot?.mount();
                }
            })),
            this.editPopup$.pipe(tap((popup) => {
                if (!popup) {
                    this._inputPlaceholderRenderRoot?.unmount?.dispose();
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
            unmount?: IDisposable;
            mount: () => void;
        } = {
            mount() {
                this.unmount = mount();
            },
        };

        return renderRoot;
    }

    showPopup(options: { popup: IDocPopup; index: number; unitId: string }) {
        const { popup, index, unitId } = options;

        this.closePopup();

        const disposable = this._docCanvasPopupManagerService.attachPopupToRange(
            { startOffset: index, endOffset: index, collapsed: true },
            {
                componentKey: QuickInsertPopup.componentKey,
                onClickOutside: () => {
                    this.closePopup();
                },
                direction: 'bottom',
            },
            unitId
        );

        this._inputPlaceholderRenderRoot = this._createInputPlaceholderRenderRoot(() => {
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
