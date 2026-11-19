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
import { Button, Input, Tooltip } from '@univerjs/design';
import { CheckMarkIcon, CloseIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useRef, useState } from 'react';

interface IOleNameProps {
    fileName: string;
    close: () => void;
    save: (baseName: string) => Promise<string | undefined>;
}

export function OleName({ popup }: { popup: { extraProps: IOleNameProps } }) {
    const locale = useDependency(LocaleService);
    const { fileName, close, save } = popup.extraProps;
    const dot = fileName.lastIndexOf('.');
    const extension = dot > 0 ? fileName.slice(dot) : '';
    const [value, setValue] = useState(extension ? fileName.slice(0, dot) : fileName);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string>();
    const savingRef = useRef(false);
    const confirm = async () => {
        if (savingRef.current) return;
        savingRef.current = true;
        setBusy(true);
        try {
            setError(await save(value));
        } finally {
            savingRef.current = false;
            setBusy(false);
        }
    };
    return (
        <div
            role="dialog"
            aria-label={locale.t<LocaleKey>('drawing-ui.ole.rename')}
            aria-busy={busy}
            className="
              univer-box-border univer-w-80 univer-max-w-full univer-rounded-lg univer-border univer-border-solid
              univer-border-gray-200 univer-bg-gray-0 univer-p-2 univer-font-sans univer-text-sm univer-text-gray-900
              univer-shadow-md
              dark:univer-border-gray-600 dark:univer-bg-gray-800 dark:univer-text-gray-0
            "
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={async (event) => {
                event.stopPropagation();
                if (event.nativeEvent.isComposing || event.keyCode === 229) return;
                if (event.key === 'Escape' && !savingRef.current) close();
                if (event.key === 'Enter') {
                    event.preventDefault();
                    await confirm();
                }
            }}
        >
            <div className="univer-flex univer-items-center univer-gap-1">
                <Input
                    autoFocus
                    aria-label={locale.t<LocaleKey>('drawing-ui.ole.rename')}
                    value={value}
                    disabled={busy}
                    onChange={setValue}
                    onFocus={(event) => event.target.select()}
                />
                {extension && <span className="univer-shrink-0 univer-text-gray-500">{extension}</span>}
                <Tooltip title={locale.t<LocaleKey>('drawing-ui.ole.saveName')} placement="top">
                    <Button size="icon" variant="ghost" disabled={busy} aria-label={locale.t<LocaleKey>('drawing-ui.ole.saveName')} onClick={confirm}>
                        <CheckMarkIcon />
                    </Button>
                </Tooltip>
                <Tooltip title={locale.t<LocaleKey>('drawing-ui.ole.cancel')} placement="top">
                    <Button size="icon" variant="ghost" disabled={busy} aria-label={locale.t<LocaleKey>('drawing-ui.ole.cancel')} onClick={close}><CloseIcon /></Button>
                </Tooltip>
            </div>
            {error && <div role="alert" className="univer-mt-1 univer-text-red-600">{error}</div>}
        </div>
    );
}
