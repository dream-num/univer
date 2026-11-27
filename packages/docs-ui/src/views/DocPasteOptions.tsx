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

import { ICommandService, LocaleService } from '@univerjs/core';
import { Button, DropdownMenu } from '@univerjs/design';
import { DocPasteOptionsIcon, DownIcon } from '@univerjs/icons';
import { ILayoutService, useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';
import type { LocaleKey } from '../locale/types';
import type { DocPasteMode } from '../services/clipboard/paste-options';
import { DocChangePasteModeCommand } from '../commands/commands/clipboard.command';
import { IDocClipboardService } from '../services/clipboard/clipboard.service';
import { DOC_PASTE_OPTIONS } from '../services/clipboard/paste-options';
import { IEditorService } from '../services/editor/editor-manager.service';

export const DOC_PASTE_OPTIONS_COMPONENT = 'docs-ui.paste-options';

export function DocPasteOptions() {
    const clipboard = useDependency(IDocClipboardService);
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const layoutService = useDependency(ILayoutService);
    const editorService = useDependency(IEditorService);
    const state = useObservable(clipboard.pasteOptions$, null);
    const [busy, setBusy] = useState(false);
    const [open, setOpen] = useState(false);

    const focusEditor = () => {
        const editor = state && clipboard.isPasteOptionsEnabled(state.unitId) && editorService.getEditor(state.unitId);
        if (editor) {
            editor.focus();
        } else {
            layoutService.focus();
        }
    };

    const changeMode = async (value: DocPasteMode) => {
        setBusy(true);
        try {
            await commandService.executeCommand(DocChangePasteModeCommand.id, { value });
        } finally {
            setBusy(false);
            focusEditor();
        }
    };

    if (!state) {
        return null;
    }

    return (
        <DropdownMenu
            data-u-editor-interaction-boundary="true"
            align="start"
            open={open}
            onOpenChange={setOpen}
            onCloseAutoFocus={(event) => {
                event.preventDefault();
                focusEditor();
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
                data-u-editor-interaction-boundary="true"
                size="small"
                disabled={busy}
                aria-label={localeService.t<LocaleKey>('docs-ui.pasteOptions.title')}
                title={localeService.t<LocaleKey>('docs-ui.pasteOptions.title')}
                onMouseDown={(event) => event.preventDefault()}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        clipboard.dismissPasteOptions();
                        focusEditor();
                    }
                }}
                className="univer-shadow-sm"
            >
                <DocPasteOptionsIcon className="!univer-size-5" aria-hidden="true" />
                <DownIcon className="!univer-size-2" aria-hidden="true" />
            </Button>
        </DropdownMenu>
    );
}
