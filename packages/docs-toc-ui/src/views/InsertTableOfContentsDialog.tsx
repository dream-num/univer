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

import type { TableOfContentsFormat, TableOfContentsTabLeader } from '@univerjs/docs-toc';
import type { LocaleKey } from '../locale/types';
import { LocaleService } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';

export const INSERT_TABLE_OF_CONTENTS_DIALOG_COMPONENT = 'doc.insert-table-of-contents-dialog';

export interface IInsertTableOfContentsDialogValue {
    levels: number;
    showPageNumbers: boolean;
    rightAlignPageNumbers: boolean;
    tabLeader: TableOfContentsTabLeader;
    format: TableOfContentsFormat;
}

export interface IInsertTableOfContentsDialogProps {
    options: IInsertTableOfContentsDialogValue;
    onChange: (value: IInsertTableOfContentsDialogValue) => void;
}

const FORMAT_OPTIONS: Array<[TableOfContentsFormat, LocaleKey]> = [
    ['fromTemplate', 'docs-toc-ui.tableOfContents.formatFromTemplate'],
    ['classic', 'docs-toc-ui.tableOfContents.formatClassic'],
    ['modern', 'docs-toc-ui.tableOfContents.formatModern'],
    ['simple', 'docs-toc-ui.tableOfContents.formatSimple'],
];

const LEADER_OPTIONS: Array<[TableOfContentsTabLeader, LocaleKey]> = [
    ['none', 'docs-toc-ui.tableOfContents.leaderNone'],
    ['dots', 'docs-toc-ui.tableOfContents.leaderDots'],
    ['dashes', 'docs-toc-ui.tableOfContents.leaderDashes'],
    ['underline', 'docs-toc-ui.tableOfContents.leaderUnderline'],
];

export function InsertTableOfContentsDialog(props: IInsertTableOfContentsDialogProps) {
    const localeService = useDependency(LocaleService);
    const [value, setValue] = useState(props.options);
    const update = (patch: Partial<IInsertTableOfContentsDialogValue>) => {
        const next = { ...value, ...patch };
        setValue(next);
        props.onChange(next);
    };
    const leader = value.tabLeader === 'dots' ? '··········' : value.tabLeader === 'dashes' ? '----------' : value.tabLeader === 'underline' ? '__________' : '';

    return (
        <div className="univer-grid univer-gap-4 univer-py-2" data-testid="table-of-contents-insert-dialog">
            <div className="univer-grid univer-grid-cols-2 univer-gap-3">
                <label className="univer-grid univer-gap-1 univer-text-sm">
                    <span>{localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.levels')}</span>
                    <select
                        className="univer-h-8 univer-rounded-md univer-border univer-bg-transparent univer-px-2"
                        value={value.levels}
                        onChange={(event) => update({ levels: Number(event.target.value) })}
                    >
                        {Array.from({ length: 9 }, (_, index) => index + 1).map((level) => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </label>
                <label className="univer-grid univer-gap-1 univer-text-sm">
                    <span>{localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.format')}</span>
                    <select
                        className="univer-h-8 univer-rounded-md univer-border univer-bg-transparent univer-px-2"
                        value={value.format}
                        onChange={(event) => update({ format: event.target.value as TableOfContentsFormat })}
                    >
                        {FORMAT_OPTIONS.map(([format, label]) => (
                            <option key={format} value={format}>{localeService.t<LocaleKey>(label)}</option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="univer-grid univer-gap-2 univer-text-sm">
                <label className="univer-flex univer-items-center univer-gap-2">
                    <input
                        type="checkbox"
                        checked={value.showPageNumbers}
                        onChange={(event) => update({
                            showPageNumbers: event.target.checked,
                            rightAlignPageNumbers: event.target.checked && value.rightAlignPageNumbers,
                        })}
                    />
                    <span>{localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.showPageNumbers')}</span>
                </label>
                <label className="univer-flex univer-items-center univer-gap-2">
                    <input
                        type="checkbox"
                        checked={value.rightAlignPageNumbers}
                        disabled={!value.showPageNumbers}
                        onChange={(event) => update({ rightAlignPageNumbers: event.target.checked })}
                    />
                    <span>{localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.rightAlignPageNumbers')}</span>
                </label>
                <label className="univer-flex univer-items-center univer-justify-between univer-gap-3">
                    <span>{localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.tabLeader')}</span>
                    <select
                        className="
                          univer-h-8 univer-min-w-40 univer-rounded-md univer-border univer-bg-transparent univer-px-2
                        "
                        value={value.tabLeader}
                        disabled={!value.showPageNumbers || !value.rightAlignPageNumbers}
                        onChange={(event) => update({ tabLeader: event.target.value as TableOfContentsTabLeader })}
                    >
                        {LEADER_OPTIONS.map(([tabLeader, label]) => (
                            <option key={tabLeader} value={tabLeader}>{localeService.t<LocaleKey>(label)}</option>
                        ))}
                    </select>
                </label>
            </div>
            <section
                className="
                  univer-rounded-lg univer-border univer-bg-gray-50 univer-p-4
                  dark:univer-bg-gray-900
                "
            >
                <div className="univer-mb-3 univer-text-xs univer-font-medium univer-text-gray-500">
                    {localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.preview')}
                </div>
                {Array.from({ length: Math.min(value.levels, 3) }, (_, index) => index).map((level) => (
                    <div
                        key={level}
                        className={`
                          univer-flex univer-items-baseline univer-text-sm
                          ${value.format === 'modern'
                        ? 'univer-mb-2'
                        : 'univer-mb-1'}
                        `}
                        style={{ marginInlineStart: `${level * (value.format === 'simple' ? 12 : value.format === 'classic' ? 14 : value.format === 'modern' ? 20 : 18)}px` }}
                    >
                        <span>
                            {localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.previewHeading')}
                            {' '}
                            {level + 1}
                        </span>
                        {value.showPageNumbers && value.rightAlignPageNumbers && (
                            <span
                                className="
                                  univer-mx-2 univer-flex-1 univer-overflow-hidden univer-whitespace-nowrap
                                  univer-text-gray-400
                                "
                            >
                                {leader}
                            </span>
                        )}
                        {value.showPageNumbers && <span className={value.rightAlignPageNumbers ? '' : 'univer-ml-2'}>{level + 1}</span>}
                    </div>
                ))}
            </section>
        </div>
    );
}
