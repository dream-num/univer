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

import type { IDisposable, Nullable } from '@univerjs/core';
import type { ForwardedRef } from 'react';
import { ICommandService, IContextService, LocaleService } from '@univerjs/core';
import { Button, Checkbox, FormDualColumnLayout, FormLayout, Input, MessageType, Select } from '@univerjs/design';
import { ILayoutService, IMessageService, useDependency, useObservable } from '@univerjs/ui';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { fromEvent } from 'rxjs';
import { ReplaceAllMatchesCommand, ReplaceCurrentMatchCommand } from '../../commands/commands/replace.command';
import { OpenReplaceDialogOperation } from '../../commands/operations/find-replace.operation';
import { FIND_REPLACE_DIALOG_FOCUS, FIND_REPLACE_INPUT_FOCUS } from '../../services/context-keys';
import { FindBy, FindDirection, FindScope, IFindReplaceService } from '../../services/find-replace.service';
import { SearchInput } from './SearchInput';

interface ISubFormRef {
    focus(): void;
    selectHasFocus(): boolean;
}

function useFindInputFocus(findReplaceService: IFindReplaceService, ref: ForwardedRef<unknown>) {
    const focus = useCallback(() => {
        (document.querySelector('.univer-find-input input') as Nullable<HTMLInputElement>)?.focus();
    }, []);

    const selectHasFocus = useCallback(() => {
        const allInputs = document.querySelectorAll('[data-u-comp=find-replace-dialog] [data-u-comp=search-input]');
        return Array.from(allInputs).some((input) => input === document.activeElement);
    }, []);

    useImperativeHandle(ref, () => ({ focus, selectHasFocus }));

    useEffect(() => {
        const subscription = findReplaceService.focusSignal$.subscribe(() => focus());
        return () => subscription.unsubscribe();
    }, [findReplaceService, focus]);

    return { focus, selectHasFocus };
}

export const FindDialog = forwardRef(function FindDialogImpl(_props, ref) {
    const localeService = useDependency(LocaleService);
    const findReplaceService = useDependency(IFindReplaceService);
    const commandService = useDependency(ICommandService);

    const state = useObservable(findReplaceService.state$, undefined, true);
    const { findCompleted, findString, matchesCount, matchesPosition } = state;

    const revealReplace = useCallback(() => {
        commandService.executeCommand(OpenReplaceDialogOperation.id);
    }, [commandService]);

    const onFindStringChange = useCallback((findString: string) => findReplaceService.changeFindString(findString), [findReplaceService]);

    useFindInputFocus(findReplaceService, ref);

    return (
        <>
            <SearchInput
                findCompleted={findCompleted}
                className="univer-find-input"
                matchesCount={matchesCount}
                matchesPosition={matchesPosition}
                findReplaceService={findReplaceService}
                localeService={localeService}
                findString={findString}
                onChange={onFindStringChange}
            />
            <div className="univer-mt-4 univer-text-center">
                <a
                    className={`
                      univer-cursor-pointer univer-text-sm univer-text-primary-500 univer-transition-colors
                      hover:univer-text-primary-500/80
                    `}
                    onClick={revealReplace}
                >
                    {localeService.t('find-replace.dialog.advanced-finding')}
                </a>
            </div>
        </>
    );
});

export const ReplaceDialog = forwardRef(function ReplaceDialogImpl(_props, ref) {
    const findReplaceService = useDependency(IFindReplaceService);
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);
    const messageService = useDependency(IMessageService);

    const currentMatch = useObservable(findReplaceService.currentMatch$, undefined, true);
    const replaceables = useObservable(findReplaceService.replaceables$, undefined, true);
    const state = useObservable(findReplaceService.state$, undefined, true);
    const {
        matchesCount,
        matchesPosition,
        findString,
        inputtingFindString,
        replaceString,
        caseSensitive,
        matchesTheWholeCell,
        findDirection,
        findScope,
        findBy,
        findCompleted,
    } = state;

    const findDisabled = inputtingFindString.length === 0;
    const replaceDisabled = matchesCount === 0 || !currentMatch?.replaceable;
    const replaceAllDisabled = replaceables.length === 0;

    const onFindStringChange = useCallback(
        (newValue: string) => findReplaceService.changeInputtingFindString(newValue),
        [findReplaceService]
    );
    const onReplaceStringChange = useCallback(
        (replaceString: string) => findReplaceService.changeReplaceString(replaceString),
        [findReplaceService]
    );

    const { focus } = useFindInputFocus(findReplaceService, ref);

    const onClickFindButton = useCallback(() => {
        if (findString === inputtingFindString) {
            findReplaceService.moveToNextMatch();
        } else {
            findReplaceService.changeFindString(inputtingFindString);
            findReplaceService.find();
        }
    }, [findString, inputtingFindString, findReplaceService]);
    const onClickReplaceButton = useCallback(() => commandService.executeCommand(ReplaceCurrentMatchCommand.id), [commandService]);
    const onClickReplaceAllButton = useCallback(async () => {
        await commandService.executeCommand(ReplaceAllMatchesCommand.id);
        focus();
    }, [commandService]);

    const onChangeFindDirection = useCallback((findDirection: string) => {
        findReplaceService.changeFindDirection(findDirection as FindDirection);
    }, [findReplaceService]);
    const onChangeFindScope = useCallback((findScope: string) => {
        findReplaceService.changeFindScope(findScope as FindScope);
    }, [findReplaceService]);
    const onChangeFindBy = useCallback((findBy: string) => {
        findReplaceService.changeFindBy(findBy as FindBy);
    }, [findReplaceService]);

    const findScopeOptions = useFindScopeOptions(localeService);
    const findDirectionOptions = useFindDirectionOptions(localeService);
    const findByOptions = useFindByOptions(localeService);

    useEffect(() => {
        const shouldDisplayNoMatchInfo = findCompleted && matchesCount === 0;

        if (shouldDisplayNoMatchInfo) {
            messageService.show({
                content: localeService.t('find-replace.dialog.no-match'),
                type: MessageType.Warning,
                duration: 5000,
            });
        }
    }, [findCompleted, matchesCount, messageService, localeService]);

    return (
        <div>
            <FormLayout label={localeService.t('find-replace.dialog.find')}>
                <SearchInput
                    findCompleted={findCompleted}
                    className="univer-find-input"
                    matchesCount={matchesCount}
                    matchesPosition={matchesPosition}
                    findReplaceService={findReplaceService}
                    localeService={localeService}
                    findString={inputtingFindString}
                    onChange={onFindStringChange}
                />
            </FormLayout>
            <FormLayout label={localeService.t('find-replace.dialog.replace')}>
                <Input
                    placeholder={localeService.t('find-replace.dialog.replace-placeholder')}
                    value={replaceString}
                    onChange={(value) => onReplaceStringChange(value)}
                />
            </FormLayout>
            <FormLayout label={localeService.t('find-replace.dialog.find-direction.title')}>
                <Select value={findDirection} options={findDirectionOptions} onChange={onChangeFindDirection} />
            </FormLayout>
            <FormDualColumnLayout>
                <>
                    <FormLayout label={localeService.t('find-replace.dialog.find-scope.title')}>
                        <Select value={findScope} options={findScopeOptions} onChange={onChangeFindScope} />
                    </FormLayout>
                    <FormLayout label={localeService.t('find-replace.dialog.find-by.title')}>
                        <Select value={findBy} options={findByOptions} onChange={onChangeFindBy} />
                    </FormLayout>
                </>
            </FormDualColumnLayout>
            <FormDualColumnLayout>
                <>
                    <FormLayout>
                        <Checkbox
                            checked={caseSensitive}
                            onChange={(checked) => {
                                findReplaceService.changeCaseSensitive(checked as boolean);
                            }}
                        >
                            {localeService.t('find-replace.dialog.case-sensitive')}
                        </Checkbox>
                    </FormLayout>
                    <FormLayout>
                        <Checkbox
                            checked={matchesTheWholeCell}
                            onChange={(checked) => {
                                findReplaceService.changeMatchesTheWholeCell(checked as boolean);
                            }}
                        >
                            {localeService.t('find-replace.dialog.match-the-whole-cell')}
                        </Checkbox>
                    </FormLayout>
                </>
            </FormDualColumnLayout>
            <div className="univer-mt-6 univer-flex univer-justify-between">
                <Button variant="primary" onClick={onClickFindButton} disabled={findDisabled}>{localeService.t('find-replace.dialog.find')}</Button>
                <span className="univer-inline-flex univer-gap-2">
                    <Button disabled={replaceDisabled} onClick={onClickReplaceButton}>{localeService.t('find-replace.dialog.replace')}</Button>
                    <Button disabled={replaceAllDisabled} onClick={onClickReplaceAllButton}>{localeService.t('find-replace.dialog.replace-all')}</Button>
                </span>
            </div>
        </div>
    );
});

export function FindReplaceDialog() {
    const findReplaceService = useDependency(IFindReplaceService);
    const layoutService = useDependency(ILayoutService);
    const contextService = useDependency(IContextService);

    const state = useObservable(findReplaceService.state$, undefined, true);

    const dialogContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let disposable: IDisposable | undefined;
        if (dialogContainerRef.current) {
            disposable = layoutService.registerContainerElement(dialogContainerRef.current);
        }

        return () => disposable?.dispose();
    }, [layoutService]);

    const focusRef = useRef<ISubFormRef>(null);
    const setDialogContainerFocus = useCallback(
        (focused: boolean) => contextService.setContextValue(FIND_REPLACE_DIALOG_FOCUS, focused),
        [contextService]
    );
    const setDialogInputFocus = useCallback(
        (focused: boolean) => contextService.setContextValue(FIND_REPLACE_INPUT_FOCUS, focused),
        [contextService]
    );

    useEffect(() => {
        const focusSubscription = fromEvent(document, 'focusin').subscribe((event) => {
            if (event.target && dialogContainerRef.current?.contains(event.target as Node)) {
                setDialogContainerFocus(true);
            } else {
                setDialogContainerFocus(false);
            }

            if (!focusRef.current || !focusRef.current.selectHasFocus()) {
                setDialogInputFocus(true);
            } else {
                setDialogInputFocus(false);
            }
        });

        // Focus the input element the first time we open the find replace dialog.
        focusRef.current?.focus();

        setDialogContainerFocus(true);
        setDialogInputFocus(true);

        return () => {
            focusSubscription.unsubscribe();
            setDialogContainerFocus(false);
        };
    }, [setDialogContainerFocus, setDialogInputFocus]);

    return (
        <div ref={dialogContainerRef} data-u-comp="find-replace-dialog">
            {!state.replaceRevealed ? <FindDialog ref={focusRef} /> : <ReplaceDialog ref={focusRef} />}
        </div>
    );
}

function useFindScopeOptions(localeService: LocaleService): Array<{ label: string; value: string }> {
    const locale = localeService.getCurrentLocale();
    const options = useMemo(() => {
        return [
            { label: localeService.t('find-replace.dialog.find-scope.current-sheet'), value: FindScope.SUBUNIT },
            { label: localeService.t('find-replace.dialog.find-scope.workbook'), value: FindScope.UNIT },
        ];
    }, [locale]);

    return options;
}

function useFindDirectionOptions(localeService: LocaleService): Array<{ label: string; value: string }> {
    const locale = localeService.getCurrentLocale();
    const options = useMemo(() => {
        return [
            { label: localeService.t('find-replace.dialog.find-direction.row'), value: FindDirection.ROW },
            { label: localeService.t('find-replace.dialog.find-direction.column'), value: FindDirection.COLUMN },
        ];
    }, [locale]);

    return options;
}

function useFindByOptions(localeService: LocaleService): Array<{ label: string; value: string }> {
    const locale = localeService.getCurrentLocale();
    const options = useMemo(() => {
        return [
            { label: localeService.t('find-replace.dialog.find-by.value'), value: FindBy.VALUE },
            { label: localeService.t('find-replace.dialog.find-by.formula'), value: FindBy.FORMULA },
        ];
    }, [locale]);

    return options;
}
