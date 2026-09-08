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

import type { ReactNode } from 'react';
import type { LocaleKey } from '../../locale/types';
import { ICommandService, LocaleService } from '@univerjs/core';
import { clsx, Input, resetButtonClassName } from '@univerjs/design';
import { ArrowDownIcon, ArrowUpIcon, CloseIcon, ConfigureTabIcon, SearchIcon } from '@univerjs/icons';
import { IDialogService, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { ReplaceAllMatchesCommand, ReplaceCurrentMatchCommand } from '../../commands/commands/replace.command';
import {
    CloseFindDialogOperation,
    GoToNextMatchOperation,
    GoToPreviousMatchOperation,
} from '../../commands/operations/find-replace.operation';
import {
    MOBILE_FIND_REPLACE_SETTINGS_COMPONENT,
    MOBILE_FIND_REPLACE_SETTINGS_DIALOG_ID,
} from '../../const';
import { IFindReplaceService } from '../../services/find-replace.service';

const SEARCH_DEBOUNCE_TIME = 500;

export function MobileFindReplaceBar() {
    const findReplaceService = useDependency(IFindReplaceService);
    useObservable(findReplaceService.state$, undefined, true);

    if (!findReplaceService.revealed) {
        return null;
    }

    return <MobileFindReplaceBarContent />;
}

function MobileFindReplaceBarContent() {
    const commandService = useDependency(ICommandService);
    const dialogService = useDependency(IDialogService);
    const findReplaceService = useDependency(IFindReplaceService);
    const localeService = useDependency(LocaleService);
    const state = useObservable(findReplaceService.state$, undefined, true);
    const currentMatch = useObservable(findReplaceService.currentMatch$, null, true);
    const replaceables = useObservable(findReplaceService.replaceables$, [], true);
    const [findValue, setFindValue] = useState(() =>
        state.replaceRevealed ? state.inputtingFindString : state.findString);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const suppressNextFocusRef = useRef(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => inputRef.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        const subscription = findReplaceService.focusSignal$.subscribe(() => {
            if (suppressNextFocusRef.current) {
                suppressNextFocusRef.current = false;
                return;
            }

            inputRef.current?.focus();
        });
        return () => subscription.unsubscribe();
    }, [findReplaceService]);

    useEffect(() => () => {
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
    }, []);

    function clearSearchTimer(): void {
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
            searchTimerRef.current = null;
        }
    }

    function commitSearch(value: string): void {
        clearSearchTimer();
        if (!value) {
            findReplaceService.changeInputtingFindString('');
            return;
        }

        if (findReplaceService.replaceRevealed) {
            findReplaceService.changeInputtingFindString(value);
            findReplaceService.changeFindString(value);
            findReplaceService.find();
            return;
        }

        findReplaceService.changeFindString(value);
    }

    function scheduleSearch(value: string): void {
        clearSearchTimer();
        if (!value) {
            commitSearch(value);
            return;
        }

        searchTimerRef.current = setTimeout(() => commitSearch(value), SEARCH_DEBOUNCE_TIME);
    }

    function blurActiveElement(): void {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }

    function executeAfterBlur(commandId: string, suppressFocusSignal = false): void {
        blurActiveElement();
        if (findValue !== state.findString) {
            commitSearch(findValue);
            if (commandId === GoToNextMatchOperation.id || commandId === GoToPreviousMatchOperation.id) {
                return;
            }
        }

        suppressNextFocusRef.current = suppressFocusSignal;
        const execution = commandService.executeCommand(commandId);
        suppressNextFocusRef.current = false;
        execution.catch(() => undefined);
    }

    function openSettings(): void {
        commitSearch(findValue);
        blurActiveElement();
        dialogService.open({
            id: MOBILE_FIND_REPLACE_SETTINGS_DIALOG_ID,
            title: { title: localeService.t<LocaleKey>('find-replace.mobile.settings-title') },
            children: { label: MOBILE_FIND_REPLACE_SETTINGS_COMPONENT },
        });
    }

    const noResult = state.findCompleted && state.matchesCount === 0;
    const resultText = noResult
        ? localeService.t<LocaleKey>('find-replace.dialog.no-result')
        : state.matchesCount > 0 ? `${state.matchesPosition}/${state.matchesCount}` : undefined;
    const navigationDisabled = state.matchesCount === 0;
    const replaceDisabled = state.matchesCount === 0 || !currentMatch?.replaceable;
    const replaceAllDisabled = replaceables.length === 0;

    return (
        <div
            data-u-comp="mobile-find-replace-bar"
            className="
              univer-fixed univer-inset-x-0 univer-z-40 univer-grid univer-gap-2 univer-bg-gray-0 univer-px-2
              univer-pt-1.5 univer-shadow-[0_-4px_16px_rgba(0,0,0,0.08)]
              dark:!univer-bg-gray-800
            "
            style={{
                bottom: 'var(--univer-mobile-keyboard-inset, 0px)',
                paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))',
            }}
        >
            <div className="univer-flex">
                <IconButton
                    label={localeService.t<LocaleKey>('find-replace.mobile.settings')}
                    onClick={openSettings}
                >
                    <ConfigureTabIcon />
                </IconButton>
                <div className="univer-relative univer-mr-2 univer-min-w-0 univer-flex-1">
                    <SearchIcon
                        className="
                          univer-pointer-events-none univer-absolute univer-left-3 univer-top-1/2 univer-z-10
                          univer-size-5 -univer-translate-y-1/2 univer-text-gray-500
                        "
                    />
                    <Input
                        ref={inputRef}
                        size="middle"
                        allowClear
                        value={findValue}
                        placeholder={localeService.t<LocaleKey>('find-replace.dialog.find-placeholder')}
                        inputClass="!univer-pl-10"
                        slot={resultText
                            ? <span className="univer-text-xs univer-text-gray-400">{resultText}</span>
                            : undefined}
                        onChange={(value) => {
                            setFindValue(value);
                            scheduleSearch(value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                executeAfterBlur(GoToNextMatchOperation.id);
                            }
                        }}
                    />
                </div>
                <IconButton
                    disabled={navigationDisabled}
                    label={localeService.t<LocaleKey>('find-replace.mobile.previous-match')}
                    onClick={() => executeAfterBlur(GoToPreviousMatchOperation.id, true)}
                >
                    <ArrowUpIcon />
                </IconButton>
                <IconButton
                    disabled={navigationDisabled}
                    label={localeService.t<LocaleKey>('find-replace.mobile.next-match')}
                    onClick={() => executeAfterBlur(GoToNextMatchOperation.id, true)}
                >
                    <ArrowDownIcon />
                </IconButton>
                <IconButton
                    label={localeService.t<LocaleKey>('find-replace.mobile.close')}
                    onClick={() => {
                        blurActiveElement();
                        commandService.executeCommand(CloseFindDialogOperation.id).catch(() => undefined);
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </div>
            {state.replaceRevealed && (
                <div className="univer-flex univer-gap-1 univer-pl-9">
                    <Input
                        size="middle"
                        className="univer-min-w-0 univer-flex-1"
                        value={state.replaceString}
                        placeholder={localeService.t<LocaleKey>('find-replace.dialog.replace-placeholder')}
                        onChange={(value) => findReplaceService.changeReplaceString(value)}
                    />
                    <ActionButton
                        disabled={replaceDisabled}
                        onClick={() => executeAfterBlur(ReplaceCurrentMatchCommand.id)}
                    >
                        {localeService.t<LocaleKey>('find-replace.dialog.replace')}
                    </ActionButton>
                    <ActionButton
                        disabled={replaceAllDisabled}
                        onClick={() => executeAfterBlur(ReplaceAllMatchesCommand.id)}
                    >
                        {localeService.t<LocaleKey>('find-replace.dialog.replace-all')}
                    </ActionButton>
                </div>
            )}
        </div>
    );
}

interface IIconButtonProps {
    children: ReactNode;
    disabled?: boolean;
    label: string;
    onClick: () => void;
}

function IconButton(props: IIconButtonProps) {
    return (
        <button
            type="button"
            aria-label={props.label}
            disabled={props.disabled}
            className={clsx(resetButtonClassName, `
              univer-flex univer-size-9 univer-flex-none univer-items-center univer-justify-center univer-rounded-full
              univer-text-lg univer-text-gray-700
              active:univer-bg-gray-100
              disabled:univer-opacity-35
              dark:!univer-text-gray-200
              dark:active:!univer-bg-gray-700
            `)}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}

interface IActionButtonProps {
    children: ReactNode;
    disabled?: boolean;
    onClick: () => void;
}

function ActionButton(props: IActionButtonProps) {
    return (
        <button
            type="button"
            disabled={props.disabled}
            className={clsx(resetButtonClassName, `
              univer-h-10 univer-flex-none univer-whitespace-nowrap univer-rounded-lg univer-bg-primary-600 univer-px-3
              univer-text-sm univer-font-medium univer-text-gray-0
              active:univer-bg-primary-700
              disabled:univer-bg-gray-100 disabled:univer-text-gray-400
              dark:disabled:!univer-bg-gray-700 dark:disabled:!univer-text-gray-500
            `)}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}
