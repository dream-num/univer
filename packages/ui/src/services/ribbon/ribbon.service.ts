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

import type { Observable } from 'rxjs';
import type { IMenuSchema } from '../menu/menu-manager.service';
import { createIdentifier, Disposable, IUniverInstanceService } from '@univerjs/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { IMenuManagerService } from '../menu/menu-manager.service';
import { MenuManagerPosition, RibbonPosition } from '../menu/types';

export const IRibbonService = createIdentifier<IRibbonService>('univer.ribbon-service');

export interface IRibbonService {
    ribbon$: Observable<IMenuSchema[]>;
    activatedTab$: Observable<string>;
    collapsedIds$: Observable<string[]>;
    fakeToolbarVisible$: Observable<boolean>;

    setActivatedTab(tab: string): void;
    setCollapsedIds(ids: string[]): void;
    setFakeToolbarVisible(visible: boolean): void;
}

export class DesktopRibbonService extends Disposable implements IRibbonService {
    private readonly _ribbon$ = new BehaviorSubject<IMenuSchema[]>([]);
    readonly ribbon$ = this._ribbon$.asObservable();

    private readonly _activatedTab$ = new BehaviorSubject<string>(RibbonPosition.START);
    readonly activatedTab$ = this._activatedTab$.asObservable();

    private readonly _collapsedIds$ = new BehaviorSubject<string[]>([]);
    readonly collapsedIds$ = this._collapsedIds$.asObservable();

    private readonly _fakeToolbarVisible$ = new BehaviorSubject<boolean>(false);
    readonly fakeToolbarVisible$ = this._fakeToolbarVisible$.asObservable();

    constructor(
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initRibbonSubscription();
    }

    setActivatedTab(tab: string): void {
        this._activatedTab$.next(tab);
    }

    setCollapsedIds(ids: string[]): void {
        this._collapsedIds$.next(ids);
    }

    setFakeToolbarVisible(visible: boolean): void {
        this._fakeToolbarVisible$.next(visible);
    }

    private _initRibbonSubscription(): void {
        this.disposeWithMe(
            combineLatest([
                this._menuManagerService.menuChanged$.pipe(startWith(undefined)),
                this._univerInstanceService.focused$.pipe(startWith(undefined)),
            ]).subscribe(() => {
                this._updateRibbon();
            })
        );
    }

    private _updateRibbon() {
        const ribbon = this._menuManagerService.getMenuByPositionKey(MenuManagerPosition.RIBBON);

        // Collect all hidden$ Observables and their corresponding paths
        const hiddenObservableMap: Observable<boolean>[] = [];
        const hiddenKeyMap: string[] = [];
        for (const group of ribbon) {
            if (group.children) {
                for (const item of group.children) {
                    if (item.children) {
                        for (const child of item.children) {
                            if (child.item?.hidden$) {
                                hiddenObservableMap.push(child.item.hidden$);
                                hiddenKeyMap.push(child.key);
                            }
                        }
                    }
                }
            }
        }

        if (hiddenObservableMap.length === 0) {
            this._ribbon$.next(ribbon);
            return;
        }

        // Only get the current value once, not continuously subscribe
        combineLatest(hiddenObservableMap)
            .pipe(startWith(new Array(hiddenObservableMap.length).fill(false)))
            .subscribe((hiddenMap) => {
                const newRibbon: IMenuSchema[] = [];

                const hiddenPathMap = hiddenMap.map((hidden, index) => {
                    if (hidden) {
                        return hiddenKeyMap[index];
                    }
                    return null;
                }).filter((item) => !!item) as string[];

                for (const group of ribbon) {
                    const newGroup: IMenuSchema = { ...group, children: [] };

                    if (group.children?.length) {
                        for (const item of group.children) {
                            const newItem: IMenuSchema = { ...item, children: [] };
                            let shouldAddItem = true;

                            if (item.children?.length) {
                                for (const child of item.children) {
                                    if (!hiddenPathMap.includes(child.key)) {
                                        newItem.children?.push(child);
                                    }
                                }

                                if (newItem.children?.every((child) => child.children?.length === 0)) {
                                    shouldAddItem = false;
                                }
                            }

                            if (shouldAddItem) {
                                newGroup.children?.push(newItem);
                            }
                        }
                    }

                    if (newGroup.children?.length && newGroup.children.every((item) => item.children?.length)) {
                        newRibbon.push(newGroup);
                    }
                }

                this._ribbon$.next(newRibbon);
            })
            .unsubscribe();
    }
}
