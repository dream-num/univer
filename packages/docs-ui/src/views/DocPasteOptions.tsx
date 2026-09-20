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
import { DocPasteOptionsIcon } from '@univerjs/icons';
import { ILayoutService, useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';
import { DocChangePasteModeCommand } from '../commands/commands/clipboard.command';
import { IDocClipboardService } from '../services/clipboard/clipboard.service';
import { DOC_PASTE_OPTIONS } from '../services/clipboard/paste-options';

export const DOC_PASTE_OPTIONS_COMPONENT = 'docs-ui.paste-options';

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
                <DocPasteOptionsIcon className="!univer-size-5" aria-hidden="true" />
                <svg className="!univer-size-2" width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                    <path d="m1 2 3 4 3-4Z" fill="currentColor" />
                </svg>
            </Button>
        </DropdownMenu>
    );
}
