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
import { LocaleService, UniverInstanceType } from '@univerjs/core';
import { Button, clsx, Separator, Tooltip } from '@univerjs/design';
import { ConvertIcon, DeleteIcon, DownloadIcon, EyeIcon, LinkIcon, RenameIcon, WarningIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import type { LocaleKey } from '../../locale/types';
import { OleUIService } from '../../services/ole-ui.service';

interface IOlePopupActions {
    fileName?: string;
    officeType?: UniverInstanceType;
    showConvert?: boolean;
    hasOnlineUnit?: boolean;
    converting?: boolean;
    convert?: () => Promise<void>;
    available: boolean;
    previewAvailable: boolean;
    status: string;
    editable: boolean;
    onEnter: () => void;
    onLeave: () => void;
    download: () => Promise<void>;
    preview: () => Promise<void>;
    remove: () => Promise<void>;
    rename?: () => void;
}

function OleActionButton({ title, disabled, danger = false, children, onClick }: { title: string; disabled: boolean; danger?: boolean; children: ReactNode; onClick: () => void }) {
    return (
        <Tooltip title={title} placement="top" className="univer-font-sans">
            <span className="univer-inline-flex">
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={title}
                    disabled={disabled}
                    onClick={onClick}
                    className={clsx(
                        `
                          univer-shrink-0 !univer-text-gray-600
                          dark:!univer-text-gray-200
                        `,
                        `
                          focus-visible:univer-outline focus-visible:univer-outline-2
                          focus-visible:univer-outline-primary-500
                        `,
                        danger && `
                          hover:!univer-bg-red-50 hover:!univer-text-red-600
                          focus-visible:!univer-text-red-600
                          dark:hover:!univer-bg-red-900 dark:hover:!univer-text-red-300
                        `
                    )}
                >
                    {children}
                </Button>
            </span>
        </Tooltip>
    );
}

export function OlePopup({ popup }: { popup: { extraProps: IOlePopupActions } }) {
    const locale = useDependency(LocaleService);
    const [busy, setBusy] = useState<'action' | 'convert'>();
    const actions = popup.extraProps;
    const run = async (action: () => Promise<void>, isConversion = false) => {
        setBusy(isConversion ? 'convert' : 'action');
        try {
            await action();
        } finally {
            setBusy(undefined);
        }
    };
    let convertKey: LocaleKey = 'drawing-ui.ole.convertDoc';
    let openKey: LocaleKey = 'drawing-ui.ole.openDoc';
    if (actions.officeType === UniverInstanceType.UNIVER_SHEET) {
        convertKey = 'drawing-ui.ole.convertSheet';
        openKey = 'drawing-ui.ole.openSheet';
    } else if (actions.officeType === UniverInstanceType.UNIVER_SLIDE) {
        convertKey = 'drawing-ui.ole.convertSlide';
        openKey = 'drawing-ui.ole.openSlide';
    }
    const converting = actions.converting === true || busy === 'convert';
    let convertActionKey: LocaleKey = actions.hasOnlineUnit ? openKey : convertKey;
    if (converting) {
        convertActionKey = 'drawing-ui.ole.converting';
    }
    let convertIcon = actions.hasOnlineUnit ? <LinkIcon /> : <ConvertIcon />;
    if (converting) {
        convertIcon = (
            <span
                aria-hidden="true"
                className="
                  univer-size-4 univer-animate-spin univer-rounded-full univer-border-2 univer-border-solid
                  univer-border-current univer-border-t-transparent
                "
            />
        );
    }
    const disabled = busy != null || converting;
    return (
        <div
            role="toolbar"
            aria-label={actions.fileName ?? locale.t<LocaleKey>('drawing-ui.ole.actions')}
            aria-busy={busy != null || converting}
            className="
              univer-box-border univer-flex univer-h-10 univer-w-max univer-flex-nowrap univer-items-center univer-gap-1
              univer-rounded-lg univer-border univer-border-solid univer-border-gray-200 univer-bg-gray-0 univer-px-1
              univer-shadow-sm
              dark:univer-border-gray-600 dark:univer-bg-gray-800
            "
            onMouseEnter={actions.onEnter}
            onMouseLeave={actions.onLeave}
            onFocus={actions.onEnter}
            onBlur={actions.onLeave}
        >
            {actions.available
                ? (
                    <>
                        <OleActionButton title={locale.t<LocaleKey>(actions.previewAvailable ? 'drawing-ui.ole.preview' : 'drawing-ui.ole.unsupported')} disabled={disabled || !actions.previewAvailable} onClick={() => run(actions.preview)}><EyeIcon /></OleActionButton>
                        <OleActionButton title={locale.t<LocaleKey>('drawing-ui.ole.download')} disabled={disabled} onClick={() => run(actions.download)}><DownloadIcon /></OleActionButton>
                    </>
                )
                : (
                    <Tooltip
                        title={actions.status}
                        placement="top"
                        className="!univer-pointer-events-none univer-max-w-80 univer-font-sans"
                    >
                        <span
                            role="img"
                            aria-label={actions.status}
                            tabIndex={0}
                            className="
                              univer-inline-flex univer-size-8 univer-shrink-0 univer-items-center univer-justify-center
                              univer-rounded-md univer-text-yellow-600
                              focus-visible:univer-outline focus-visible:univer-outline-2
                              focus-visible:univer-outline-primary-500
                              dark:univer-text-yellow-400
                            "
                        >
                            <WarningIcon />
                        </span>
                    </Tooltip>
                )}
            {actions.available && actions.showConvert && actions.convert && (
                <OleActionButton title={locale.t<LocaleKey>(convertActionKey)} disabled={disabled || !actions.available || (!actions.hasOnlineUnit && !actions.editable)} onClick={() => run(actions.convert!, true)}>
                    {convertIcon}
                </OleActionButton>
            )}
            {actions.available && actions.editable && actions.rename && <OleActionButton title={locale.t<LocaleKey>('drawing-ui.ole.rename')} disabled={disabled} onClick={actions.rename}><RenameIcon /></OleActionButton>}
            {actions.editable && (
                <>
                    <Separator orientation="vertical" className="univer-mx-0.5 !univer-h-4" />
                    <OleActionButton danger title={locale.t<LocaleKey>('drawing-ui.ole.remove')} disabled={disabled} onClick={() => run(actions.remove)}><DeleteIcon /></OleActionButton>
                </>
            )}
        </div>
    );
}

export function OlePreview({ value }: { value: string }) {
    const locale = useDependency(LocaleService);
    const { url, mimeType, name } = JSON.parse(value) as { url: string; mimeType: string; name: string };
    return mimeType === 'application/pdf'
        ? (
            <div>
                <iframe title={name} src={url} style={{ height: '70vh', width: '100%', border: 0 }} />
                <div className="univer-flex univer-items-center univer-gap-2 univer-p-2 univer-text-sm">
                    <span>{locale.t<LocaleKey>('drawing-ui.ole.nativePreviewHint')}</span>
                    <a href={url} download={name} className="univer-text-primary-600">{locale.t<LocaleKey>('drawing-ui.ole.download')}</a>
                </div>
            </div>
        )
        : <img alt={name} src={url} style={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain' }} />;
}

export function OleOfficePreview({ value }: { value: string }) {
    const service = useDependency(OleUIService);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const viewer = containerRef.current ? service.mountOfficePreview(value, containerRef.current) : undefined;
        return () => queueMicrotask(() => viewer?.dispose());
    }, [service, value]);
    return <div ref={containerRef} style={{ height: '70vh', width: '100%' }} />;
}
