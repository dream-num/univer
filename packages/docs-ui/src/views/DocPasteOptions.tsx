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
import type { DocPasteMode } from '../services/clipboard/paste-options';
import { ICommandService, LocaleService } from '@univerjs/core';
import { Button, DropdownMenu } from '@univerjs/design';
import { ILayoutService, useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';
import { DocChangePasteModeCommand } from '../commands/commands/clipboard.command';
import { IDocClipboardService } from '../services/clipboard/clipboard.service';
import { DOC_PASTE_OPTIONS } from '../services/clipboard/paste-options';

export const DOC_PASTE_OPTIONS_COMPONENT = 'docs-ui.paste-options';

export function DocPasteOptionsIcon() {
    return (
        <svg className="!univer-size-5" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="13" height="17" rx="2" fill="var(--univer-yellow-200)" stroke="var(--univer-gray-600)" />
            <path d="M7 4V3h1a2 2 0 0 1 4 0h1v3H7V4Z" fill="var(--univer-gray-300)" stroke="var(--univer-gray-600)" />
            <rect x="10" y="9" width="11" height="13" rx="1" fill="var(--univer-gray-0)" stroke="var(--univer-gray-600)" />
            <path d="M13 12h5m-5 3h5m-5 3h5" stroke="var(--univer-gray-600)" strokeLinecap="round" />
        </svg>
    );
}

export function DocPasteOptions() {
    const clipboard = useDependency(IDocClipboardService);
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const layoutService = useDependency(ILayoutService);
    const state = useObservable(clipboard.pasteOptions$, null);
    const [busy, setBusy] = useState(false);
    const [open, setOpen] = useState(false);

    const changeMode = async (value: DocPasteMode) => {
        setBusy(true);
        try {
            await commandService.executeCommand(DocChangePasteModeCommand.id, { value });
        } finally {
            setBusy(false);
            layoutService.focus();
        }
    };

    if (!state) {
        return null;
    }

    return (
        <DropdownMenu
            align="start"
            open={open}
            onOpenChange={setOpen}
            onCloseAutoFocus={(event) => {
                event.preventDefault();
                layoutService.focus();
            }}
            onEscapeKeyDown={() => clipboard.dismissPasteOptions()}
            items={DOC_PASTE_OPTIONS.map((option) => ({
                type: 'checkbox',
                value: option.value,
                label: localeService.t<LocaleKey>(option.label),
                checked: state.mode === option.value,
                disabled: busy,
                onSelect: () => changeMode(option.value),
            }))}
        >
            <Button
                size="small"
                disabled={busy}
                aria-label={localeService.t<LocaleKey>('docs-ui.pasteOptions.title')}
                title={localeService.t<LocaleKey>('docs-ui.pasteOptions.title')}
                onMouseDown={(event) => event.preventDefault()}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        clipboard.dismissPasteOptions();
                        layoutService.focus();
                    }
                }}
                className="univer-shadow-sm"
            >
                <DocPasteOptionsIcon />
                <svg className="!univer-size-2" width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                    <path d="m1 2 3 4 3-4Z" fill="currentColor" />
                </svg>
            </Button>
        </DropdownMenu>
    );
}
