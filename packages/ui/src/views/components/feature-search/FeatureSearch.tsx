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

import type { LocaleKey } from '../../../locale/types';
import type {
    IMenuCommandParams,
    IMenuItem,
    IValueOption,
    MenuItemDefaultValueType,
} from '../../../services/menu/menu';
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
import { combineLatest, isObservable, merge, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { IDialogService } from '../../../services/dialog/dialog.service';
import { ILayoutService } from '../../../services/layout/layout.service';
import { MenuItemType } from '../../../services/menu/menu';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { MenuManagerPosition } from '../../../services/menu/types';
import { IRibbonService } from '../../../services/ribbon/ribbon.service';
import { useDependency, useObservable } from '../../../utils/di';

export const FEATURE_SEARCH_COMPONENT = 'FeatureSearch';
export const FEATURE_SEARCH_DIALOG_ID = 'FEATURE_SEARCH_DIALOG';

export interface IFeatureSearchItem {
    key: string;
    title: string;
    parentTitle?: string;
    description: string;
    path: string;
    commandId: string;
    params?: IMenuCommandParams;
    getParams: () => IMenuCommandParams | undefined;
}

interface IMenuCandidate {
    key: string;
    item: IMenuItem;
    path: string[];
    ancestors: IMenuItem[];
    parentTitle?: string;
}

function resolveParams(item: IMenuItem, value: MenuItemDefaultValueType) {
    const params = typeof item.params === 'function' ? item.params() : item.params;
    return params ?? (value === undefined ? undefined : { value });
}

function resolveOptionParams(option: IValueOption) {
    const params = typeof option.params === 'function' ? option.params(option.value) : option.params;
    return params ?? (option.value === undefined ? undefined : { value: option.value });
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
    const ribbonService = useDependency(IRibbonService);
    const items$ = useMemo(() => {
        function getItemTitle(item: IMenuItem) {
            const titleKey = item.title ?? item.tooltip ?? item.description;
            return titleKey ? localeService.t(titleKey) : '';
        }

        function collectCandidates(
            schemas: IMenuSchema[],
            path: string[],
            keyPath: string[],
            ancestors: IMenuItem[] = [],
            parentTitle?: string
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
                        ancestors,
                        parentTitle,
                    });
                }

                if (schema.headerActionItem) {
                    result.push({
                        key: `${schemaKeyPath.join('/')}:header`,
                        item: schema.headerActionItem,
                        path: schemaPath,
                        ancestors,
                        parentTitle,
                    });
                }

                if (schema.children) {
                    result.push(...collectCandidates(
                        schema.children,
                        schemaPath,
                        schemaKeyPath,
                        schema.item ? [...ancestors, schema.item] : ancestors,
                        schema.item ? getItemTitle(schema.item) : parentTitle
                    ));
                }

                return result;
            });
        }

        function observeCandidate(candidate: IMenuCandidate) {
            const { item } = candidate;
            const hasOptions = item.type === MenuItemType.SELECTOR || item.type === MenuItemType.BUTTON_SELECTOR;
            const selections = hasOptions ? item.selections : undefined;
            const selections$ = isObservable(selections)
                ? selections.pipe(startWith([]))
                : of(selections ?? []);
            const ancestorHidden$ = candidate.ancestors.length
                ? combineLatest(candidate.ancestors.map((ancestor) => ancestor.hidden$?.pipe(startWith(true)) ?? of(false))).pipe(
                    map((states) => states.some(Boolean))
                )
                : of(false);
            const ancestorDisabled$ = candidate.ancestors.length
                ? combineLatest(candidate.ancestors.map((ancestor) => ancestor.disabled$?.pipe(startWith(true)) ?? of(false))).pipe(
                    map((states) => states.some(Boolean))
                )
                : of(false);

            return combineLatest([
                ancestorHidden$,
                ancestorDisabled$,
                item.hidden$?.pipe(startWith(true)) ?? of(false),
                item.disabled$?.pipe(startWith(true)) ?? of(false),
                item.value$?.pipe(startWith(undefined)) ?? of(undefined),
                selections$,
            ]).pipe(map(([ancestorHidden, ancestorDisabled, hidden, disabled, value, options]): IFeatureSearchItem[] => {
                if (ancestorHidden || ancestorDisabled || hidden || disabled) {
                    return [];
                }

                const title = getItemTitle(item);
                const path = candidate.path.join(' / ');
                const result: IFeatureSearchItem[] = [];

                if (title && item.type !== MenuItemType.SELECTOR && item.type !== MenuItemType.SUBITEMS) {
                    result.push({
                        key: candidate.key,
                        title,
                        parentTitle: candidate.parentTitle,
                        description: localeService.t(item.description ?? ''),
                        path,
                        commandId: item.commandId ?? item.id,
                        params: resolveParams(item, value),
                        getParams: () => resolveParams(item, value),
                    });
                }

                if (hasOptions) {
                    options.forEach((option, index) => {
                        if (option.disabled || typeof option.label !== 'string') {
                            return;
                        }

                        const commandId = option.commandId ?? option.id ?? item.selectionsCommandId ?? item.commandId ?? item.id;
                        result.push({
                            key: `${candidate.key}:option:${option.id ?? option.commandId ?? option.value ?? index}`,
                            title: localeService.t(option.label),
                            parentTitle: title,
                            description: '',
                            path,
                            commandId,
                            params: resolveOptionParams(option),
                            getParams: () => resolveOptionParams(option),
                        });
                    });
                }

                return result;
            }));
        }

        return combineLatest([
            ribbonService.ribbon$,
            merge(
                of(undefined),
                menuManagerService.menuChanged$,
                localeService.localeChanged$
            ),
        ]).pipe(switchMap(([ribbon]) => {
            const candidates = [
                ...collectCandidates(
                    ribbon,
                    [localeService.t<LocaleKey>('ui.featureSearch.ribbon')],
                    [MenuManagerPosition.RIBBON]
                ),
                ...collectCandidates(
                    menuManagerService.getMenuByPositionKey(MenuManagerPosition.CONTEXT_MENU),
                    [localeService.t<LocaleKey>('ui.featureSearch.contextMenu')],
                    [MenuManagerPosition.CONTEXT_MENU]
                ),
            ];

            if (candidates.length === 0) {
                return of([]);
            }

            return combineLatest(candidates.map(observeCandidate)).pipe(
                map((items) => deduplicate(items.flat()))
            );
        }));
    }, [localeService, menuManagerService, ribbonService]);
    const items = useObservable(items$, []);

    async function execute(item: IFeatureSearchItem) {
        layoutService.focus();
        const success = await commandService.executeCommand(
            item.commandId,
            item.getParams()
        );

        if (success) {
            dialogService.close(FEATURE_SEARCH_DIALOG_ID);
        }
    }

    return (
        <Command label={localeService.t<LocaleKey>('ui.featureSearch.title')} loop>
            <CommandInput autoFocus placeholder={localeService.t<LocaleKey>('ui.featureSearch.placeholder')} />
            <CommandList>
                <CommandEmpty>{localeService.t<LocaleKey>('ui.featureSearch.empty')}</CommandEmpty>
                <CommandGroup>
                    {items.map((item) => (
                        <CommandItem
                            key={item.key}
                            value={item.key}
                            keywords={[item.parentTitle ?? '', item.title, item.description, item.path]}
                            onSelect={() => execute(item)}
                        >
                            <span className="univer-flex univer-min-w-0 univer-flex-1 univer-items-center univer-gap-1">
                                {item.parentTitle && (
                                    <>
                                        <span className="univer-shrink-0">{item.parentTitle}</span>
                                        <span className="univer-text-gray-400">/</span>
                                    </>
                                )}
                                <span className="univer-truncate">{item.title}</span>
                            </span>
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
