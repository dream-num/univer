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

import type { IMenuCommandParams, IMenuItem, MenuItemDefaultValueType } from '../../../services/menu/menu';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import { ICommandService, LocaleService, Tools } from '@univerjs/core';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@univerjs/design';
import { useMemo } from 'react';
import { combineLatest, merge, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { IDialogService } from '../../../services/dialog/dialog.service';
import { ILayoutService } from '../../../services/layout/layout.service';
import { MenuItemType } from '../../../services/menu/menu';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { MenuManagerPosition } from '../../../services/menu/types';
import { useDependency, useObservable } from '../../../utils/di';

export const FEATURE_SEARCH_COMPONENT = 'FeatureSearch';
export const FEATURE_SEARCH_DIALOG_ID = 'FEATURE_SEARCH_DIALOG';

export interface IFeatureSearchItem {
    key: string;
    title: string;
    description: string;
    path: string;
    commandId: string;
    executable: boolean;
    item: IMenuItem;
    value: MenuItemDefaultValueType;
    params?: IMenuCommandParams;
}

interface IMenuCandidate {
    key: string;
    item: IMenuItem;
    path: string[];
}

function resolveParams(item: IMenuItem, value: MenuItemDefaultValueType) {
    const params = typeof item.params === 'function' ? item.params() : item.params;
    return params ?? (value === undefined ? undefined : { value });
}

function deduplicate(items: IFeatureSearchItem[]) {
    // ponytail: Menu inventories are small; replace this scan only if profiling shows it is a hot path.
    return items.filter((item, index) => items.findIndex((candidate) => (
        candidate.commandId === item.commandId && Tools.diffValue(candidate.params, item.params)
    )) === index);
}

export function FeatureSearch() {
    const menuManagerService = useDependency(IMenuManagerService);
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const dialogService = useDependency(IDialogService);
    const layoutService = useDependency(ILayoutService);
    const items$ = useMemo(() => {
        function collectCandidates(
            schemas: IMenuSchema[],
            path: string[],
            keyPath: string[]
        ): IMenuCandidate[] {
            return schemas.flatMap((schema, index) => {
                const schemaTitle = localeService.t(schema.title ?? '');
                const schemaPath = schemaTitle ? [...path, schemaTitle] : path;
                const schemaKeyPath = [...keyPath, `${schema.key}:${index}`];
                const result: IMenuCandidate[] = [];

                if (schema.item) {
                    result.push({
                        key: `${schemaKeyPath.join('/')}:item`,
                        item: schema.item,
                        path: schemaPath,
                    });
                }

                if (schema.headerActionItem) {
                    result.push({
                        key: `${schemaKeyPath.join('/')}:header`,
                        item: schema.headerActionItem,
                        path: schemaPath,
                    });
                }

                if (schema.children) {
                    result.push(...collectCandidates(schema.children, schemaPath, schemaKeyPath));
                }

                return result;
            });
        }

        function observeCandidate(candidate: IMenuCandidate) {
            const { item } = candidate;

            return combineLatest([
                item.hidden$?.pipe(startWith(false)) ?? of(false),
                item.disabled$?.pipe(startWith(false)) ?? of(false),
                item.value$?.pipe(startWith(undefined)) ?? of(undefined),
            ]).pipe(map(([hidden, disabled, value]): IFeatureSearchItem | null => {
                if (hidden || disabled) {
                    return null;
                }

                const titleKey = item.title ?? item.tooltip ?? item.description;
                if (!titleKey) {
                    return null;
                }

                return {
                    key: candidate.key,
                    title: localeService.t(titleKey),
                    description: localeService.t(item.description ?? ''),
                    path: candidate.path.join(' / '),
                    commandId: item.commandId ?? item.id,
                    executable: item.type === MenuItemType.BUTTON || item.type === MenuItemType.BUTTON_SELECTOR,
                    item,
                    value,
                    params: resolveParams(item, value),
                };
            }));
        }

        return merge(
            of(undefined),
            menuManagerService.menuChanged$,
            localeService.localeChanged$
        ).pipe(switchMap(() => {
            const candidates = [
                ...collectCandidates(
                    menuManagerService.getMenuByPositionKey(MenuManagerPosition.RIBBON),
                    [localeService.t('ui.featureSearch.ribbon')],
                    [MenuManagerPosition.RIBBON]
                ),
                ...collectCandidates(
                    menuManagerService.getMenuByPositionKey(MenuManagerPosition.CONTEXT_MENU),
                    [localeService.t('ui.featureSearch.contextMenu')],
                    [MenuManagerPosition.CONTEXT_MENU]
                ),
            ];

            if (candidates.length === 0) {
                return of([]);
            }

            return combineLatest(candidates.map(observeCandidate)).pipe(
                map((items) => deduplicate(items.filter((item): item is IFeatureSearchItem => item !== null)))
            );
        }));
    }, [localeService, menuManagerService]);
    const items = useObservable(items$, []);

    async function execute(item: IFeatureSearchItem) {
        if (!item.executable) {
            return;
        }

        layoutService.focus();
        const success = await commandService.executeCommand(
            item.commandId,
            resolveParams(item.item, item.value)
        );

        if (success) {
            dialogService.close(FEATURE_SEARCH_DIALOG_ID);
        }
    }

    return (
        <Command label={localeService.t('ui.featureSearch.title')} loop>
            <CommandInput autoFocus placeholder={localeService.t('ui.featureSearch.placeholder')} />
            <CommandList>
                <CommandEmpty>{localeService.t('ui.featureSearch.empty')}</CommandEmpty>
                <CommandGroup>
                    {items.map((item) => (
                        <CommandItem
                            key={item.key}
                            value={item.key}
                            keywords={[item.title, item.description, item.path]}
                            disabled={!item.executable}
                            onSelect={() => execute(item)}
                        >
                            <span className="univer-min-w-0 univer-flex-1 univer-truncate">{item.title}</span>
                            {item.path && (
                                <span className="univer-max-w-1/2 univer-truncate univer-text-xs univer-text-gray-400">
                                    {item.path}
                                </span>
                            )}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    );
}
