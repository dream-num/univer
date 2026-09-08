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

import type { LocaleKey } from '../../locale/types';
import { LocaleService } from '@univerjs/core';
import { Checkbox, MobileSelect } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';
import { FindBy, FindDirection, FindScope, IFindReplaceService } from '../../services/find-replace.service';

const FIND_SCOPE_OPTIONS: Array<{ label: LocaleKey; value: FindScope }> = [
    { label: 'find-replace.dialog.find-scope.current-sheet', value: FindScope.SUBUNIT },
    { label: 'find-replace.dialog.find-scope.workbook', value: FindScope.UNIT },
];

const FIND_DIRECTION_OPTIONS: Array<{ label: LocaleKey; value: FindDirection }> = [
    { label: 'find-replace.dialog.find-direction.row', value: FindDirection.ROW },
    { label: 'find-replace.dialog.find-direction.column', value: FindDirection.COLUMN },
];

const FIND_BY_OPTIONS: Array<{ label: LocaleKey; value: FindBy }> = [
    { label: 'find-replace.dialog.find-by.value', value: FindBy.VALUE },
    { label: 'find-replace.dialog.find-by.formula', value: FindBy.FORMULA },
];

export function MobileFindReplaceSettings() {
    const findReplaceService = useDependency(IFindReplaceService);
    const localeService = useDependency(LocaleService);
    const state = useObservable(findReplaceService.state$, undefined, true);
    const capabilities = useObservable(findReplaceService.providerCapabilities$, null, true);

    function refreshSearch(force = false): void {
        if (state.findString && (force || state.replaceRevealed)) {
            findReplaceService.find();
        }
    }

    const findScopeOptions = FIND_SCOPE_OPTIONS.map((option) => ({
        ...option,
        label: localeService.t<LocaleKey>(option.label),
    }));
    const findDirectionOptions = FIND_DIRECTION_OPTIONS.map((option) => ({
        ...option,
        label: localeService.t<LocaleKey>(option.label),
    }));
    const findByOptions = FIND_BY_OPTIONS.map((option) => ({
        ...option,
        label: localeService.t<LocaleKey>(option.label),
    }));

    return (
        <div className="univer-grid univer-gap-2" data-u-comp="mobile-find-replace-settings">
            <SettingCheckbox
                checked={state.replaceRevealed}
                label={localeService.t<LocaleKey>('find-replace.dialog.replace')}
                onChange={(checked) => {
                    if (checked) {
                        findReplaceService.revealReplace();
                    } else {
                        findReplaceService.hideReplace();
                    }
                    refreshSearch(true);
                }}
            />
            {capabilities?.findDirection && (
                <SettingSelect
                    label={localeService.t<LocaleKey>('find-replace.dialog.find-direction.title')}
                    value={state.findDirection}
                    options={findDirectionOptions}
                    onChange={(value) => {
                        findReplaceService.changeFindDirection(value as FindDirection);
                        refreshSearch();
                    }}
                />
            )}
            {capabilities?.findScope && (
                <SettingSelect
                    label={localeService.t<LocaleKey>('find-replace.dialog.find-scope.title')}
                    value={state.findScope}
                    options={findScopeOptions}
                    onChange={(value) => {
                        findReplaceService.changeFindScope(value as FindScope);
                        refreshSearch();
                    }}
                />
            )}
            {capabilities?.findBy && (
                <SettingSelect
                    label={localeService.t<LocaleKey>('find-replace.dialog.find-by.title')}
                    value={state.findBy}
                    options={findByOptions}
                    onChange={(value) => {
                        findReplaceService.changeFindBy(value as FindBy);
                        refreshSearch();
                    }}
                />
            )}
            {capabilities?.caseSensitive && (
                <SettingCheckbox
                    checked={state.caseSensitive}
                    label={localeService.t<LocaleKey>('find-replace.dialog.case-sensitive')}
                    onChange={(checked) => {
                        findReplaceService.changeCaseSensitive(checked);
                        refreshSearch();
                    }}
                />
            )}
            {capabilities?.matchesTheWholeCell && (
                <SettingCheckbox
                    checked={state.matchesTheWholeCell}
                    label={localeService.t<LocaleKey>('find-replace.dialog.match-the-whole-cell')}
                    onChange={(checked) => {
                        findReplaceService.changeMatchesTheWholeCell(checked);
                        refreshSearch();
                    }}
                />
            )}
            {capabilities?.matchesTheWholeWord && (
                <SettingCheckbox
                    checked={state.matchesTheWholeWord}
                    label={localeService.t<LocaleKey>('find-replace.dialog.match-the-whole-word')}
                    onChange={(checked) => {
                        findReplaceService.changeMatchesTheWholeWord(checked);
                        refreshSearch();
                    }}
                />
            )}
        </div>
    );
}

interface ISettingSelectProps {
    label: string;
    value: string;
    options: Array<{ label: string; value: string }>;
    onChange: (value: string) => void;
}

function SettingSelect(props: ISettingSelectProps) {
    return (
        <label
            className="
              univer-grid univer-gap-1 univer-text-sm univer-text-gray-700
              dark:!univer-text-gray-300
            "
        >
            <span>{props.label}</span>
            <MobileSelect value={props.value} options={props.options} onChange={props.onChange} />
        </label>
    );
}

interface ISettingCheckboxProps {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
}

function SettingCheckbox(props: ISettingCheckboxProps) {
    return (
        <div className="univer-flex univer-min-h-9 univer-items-center">
            <Checkbox checked={props.checked} onChange={(checked) => props.onChange(Boolean(checked))}>
                {props.label}
            </Checkbox>
        </div>
    );
}
