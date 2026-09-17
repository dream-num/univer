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

import type { LocaleKey } from '../locale/types';
import { LocaleService } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';

export const TABLE_OF_CONTENTS_DIALOG_COMPONENT = 'doc.table-of-contents-dialog';

export interface ITableOfContentsDialogProps {
    mode: 'pageNumbersOnly' | 'entireTable';
    onModeChange: (mode: ITableOfContentsDialogProps['mode']) => void;
}

export function TableOfContentsDialog(props: ITableOfContentsDialogProps) {
    const localeService = useDependency(LocaleService);
    const [mode, setMode] = useState(props.mode);
    const options = [
        ['pageNumbersOnly', 'docs-toc-ui.tableOfContents.updatePageNumbersOnly'],
        ['entireTable', 'docs-toc-ui.tableOfContents.updateEntireTable'],
    ] as const;

    return (
        <div className="univer-grid univer-gap-4 univer-py-2" data-testid="table-of-contents-update-dialog">
            <p className="univer-m-0 univer-text-sm">
                {localeService.t<LocaleKey>('docs-toc-ui.tableOfContents.updateHint')}
            </p>
            <fieldset className="univer-grid univer-gap-3 univer-border-0 univer-p-0">
                {options.map(([value, label]) => (
                    <label
                        key={value}
                        className="univer-flex univer-gap-3 univer-rounded-lg univer-border univer-p-3"
                    >
                        <input
                            type="radio"
                            name="toc-update-mode"
                            value={value}
                            checked={mode === value}
                            onChange={() => {
                                setMode(value);
                                props.onModeChange(value);
                            }}
                        />
                        <span className="univer-text-sm">
                            {localeService.t<LocaleKey>(label)}
                        </span>
                    </label>
                ))}
            </fieldset>
        </div>
    );
}
