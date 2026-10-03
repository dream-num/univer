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

import type { DocumentDataModel } from '@univerjs/core';
import type { IInsertHeaderFooterFieldParams } from '../../../commands/commands/insert-header-footer-field.command';
import type { LocaleKey } from '../../../locale/types';
import type { DateTimeFieldFormat } from '../../../utils/date-time-field';
import { ICommandService, IUniverInstanceService, LOCALE_META, LocaleService } from '@univerjs/core';
import { Button, Checkbox, Dialog, DropdownMenu, Select } from '@univerjs/design';
import { DocSelectionManagerService } from '@univerjs/docs';
import { CalendarIcon, MoreDownIcon, NumberIcon } from '@univerjs/icons';
import { ILayoutService, IShortcutService, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { InsertHeaderFooterFieldCommand } from '../../../commands/commands/insert-header-footer-field.command';
import { RefreshHeaderFooterFieldsCommand } from '../../../commands/commands/refresh-header-footer-fields.command';
import { createDateTimeField } from '../../../utils/date-time-field';

export function DocHeaderFooterFields({ unitId, disabled }: { unitId: string; disabled: boolean }) {
    const localeService = useDependency(LocaleService);
    useObservable(localeService.currentLocale$);
    const commands = useDependency(ICommandService);
    const layout = useDependency(ILayoutService);
    const shortcuts = useDependency(IShortcutService);
    const selections = useDependency(DocSelectionManagerService);
    const instances = useDependency(IUniverInstanceService);
    const [target, setTarget] = useState<Omit<IInsertHeaderFooterFieldParams, 'fieldType'> | null>(null);
    const [format, setFormat] = useState<DateTimeFieldFormat>('short');
    const [automatic, setAutomatic] = useState(true);
    const [error, setError] = useState(false);
    const [previewDate, setPreviewDate] = useState(() => new Date());
    const locale = LOCALE_META[localeService.getCurrentLocale()].tag;

    const dialogOpen = target !== null;
    useEffect(() => {
        if (!dialogOpen) {
            return;
        }
        const escape = shortcuts.forceEscape();
        return () => escape.dispose();
    }, [dialogOpen, shortcuts]);

    function restoreFocus(event: Event) {
        event.preventDefault();
        layout.focus(unitId);
    }

    function openDateTime() {
        const selection = selections.getActiveTextRange();
        const body = instances.getUnit<DocumentDataModel>(unitId)?.getSelfOrHeaderFooterModel(selection?.segmentId)?.getBody();
        if (!selection?.segmentId || !body) {
            return;
        }
        setTarget({ unitId, selection: { ...selection }, segmentId: selection.segmentId, segmentPage: selection.segmentPage, expectedDataStream: body.dataStream });
        setPreviewDate(new Date());
        setError(false);
    }

    async function insertDateTime() {
        if (!target) {
            return;
        }
        const result = await commands.executeCommand(InsertHeaderFooterFieldCommand.id, {
            ...target,
            fieldType: format === 'time' ? 'TIME' : 'DATE',
            format,
            automatic,
        });
        if (result) {
            setTarget(null);
        } else {
            setError(true);
        }
    }

    return (
        <div className="univer-flex univer-flex-col univer-gap-1 univer-text-xs">
            <DropdownMenu
                onCloseAutoFocus={restoreFocus}
                disabled={disabled}
                items={[
                    { type: 'item', children: localeService.t<LocaleKey>('docs-ui.headerFooter.currentPage'), onSelect: () => commands.executeCommand(InsertHeaderFooterFieldCommand.id, { unitId, fieldType: 'PAGE' }) },
                    { type: 'item', children: localeService.t<LocaleKey>('docs-ui.headerFooter.totalPages'), onSelect: () => commands.executeCommand(InsertHeaderFooterFieldCommand.id, { unitId, fieldType: 'NUMPAGES' }) },
                    { type: 'separator' },
                    { type: 'item', children: localeService.t<LocaleKey>('docs-ui.headerFooter.refreshFields'), onSelect: () => commands.executeCommand(RefreshHeaderFooterFieldsCommand.id, { unitId }) },
                ]}
            >
                <Button className="univer-justify-start" data-u-command={InsertHeaderFooterFieldCommand.id} size="small" variant="text" disabled={disabled} onMouseDown={(event) => event.preventDefault()}>
                    <NumberIcon aria-hidden="true" />
                    <span className="univer-flex-1 univer-text-start">{localeService.t<LocaleKey>('docs-ui.headerFooter.pageNumber')}</span>
                    <MoreDownIcon aria-hidden="true" />
                </Button>
            </DropdownMenu>
            <Button className="univer-justify-start" data-u-command={InsertHeaderFooterFieldCommand.id} size="small" variant="text" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={openDateTime}>
                <CalendarIcon aria-hidden="true" />
                {localeService.t<LocaleKey>('docs-ui.headerFooter.dateTime')}
            </Button>
            <Dialog
                open={dialogOpen}
                width={360}
                title={localeService.t<LocaleKey>('docs-ui.headerFooter.dateTime')}
                showOk
                showCancel
                onClose={() => setTarget(null)}
                onCancel={() => setTarget(null)}
                onOk={insertDateTime}
                onCloseAutoFocus={restoreFocus}
            >
                <div className="univer-flex univer-flex-col univer-gap-4">
                    <Select
                        aria-label={localeService.t<LocaleKey>('docs-ui.headerFooter.dateTime')}
                        value={format}
                        onChange={(value) => setFormat(value as DateTimeFieldFormat)}
                        options={(['short', 'long', 'time'] as const).map((value) => ({
                            value,
                            label: createDateTimeField(value, locale, previewDate).cachedResult,
                        }))}
                    />
                    <Checkbox checked={automatic} onChange={(value) => setAutomatic(Boolean(value))}>
                        {localeService.t<LocaleKey>('docs-ui.headerFooter.updateAutomatically')}
                    </Checkbox>
                    {error && <p role="alert">{localeService.t<LocaleKey>('docs-ui.headerFooter.insertFailed')}</p>}
                </div>
            </Dialog>
        </div>
    );
}
