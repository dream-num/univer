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
import { BooleanNumber, BuildTextUtils, ICommandService, IUniverInstanceService, LocaleService, resolveDocumentParagraphWordWrap, UniverInstanceType } from '@univerjs/core';
import { Button, Checkbox, Dropdown, Tooltip } from '@univerjs/design';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { AutowrapIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useState } from 'react';
import type { IDocParagraphSettingCommandParams } from '../../commands/commands/doc-paragraph-setting.command';
import type { LocaleKey } from '../../locale/types';
import { DocParagraphSettingCommand } from '../../commands/commands/doc-paragraph-setting.command';

export interface IParagraphWordWrapSettingProps {
    dropdown?: boolean;
    onBeforeChange?: () => void;
    onAfterChange?: () => void;
}

export function ParagraphWordWrapSetting({ dropdown = false, onBeforeChange, onAfterChange }: IParagraphWordWrapSettingProps) {
    const commandService = useDependency(ICommandService);
    const instanceService = useDependency(IUniverInstanceService);
    const selectionService = useDependency(DocSelectionManagerService);
    const localeService = useDependency(LocaleService);
    const [open, setOpen] = useState(false);
    const label = localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.wordWrap');

    const readState = useCallback(() => {
        const document = instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const ranges = selectionService.getDocRanges();
        const body = document?.getSelfOrHeaderFooterModel(ranges[0]?.segmentId)?.getBody();
        const paragraphs = body && ranges.length
            ? BuildTextUtils.range.getParagraphsInRanges(ranges, body.paragraphs ?? [], body.dataStream) ?? []
            : [];
        const values = paragraphs.map((paragraph) => resolveDocumentParagraphWordWrap(document!.getSnapshot(), paragraph));
        return {
            checked: values[0] === BooleanNumber.TRUE,
            mixed: values.some((value) => value !== values[0]),
            hasOverride: paragraphs.some((paragraph) => paragraph.paragraphStyle?.wordWrap != null),
            disabled: paragraphs.length === 0,
        };
    }, [instanceService, selectionService]);

    const [state, setState] = useState(readState);
    const refresh = useCallback(() => setState(readState()), [readState]);

    useEffect(() => {
        const selection = selectionService.textSelection$.subscribe(refresh);
        const mutation = commandService.onCommandExecuted((command) => {
            if (command.id === RichTextEditingMutation.id) {
                refresh();
            }
        });
        return () => {
            selection.unsubscribe();
            mutation.dispose();
        };
    }, [commandService, refresh, selectionService]);

    const apply = async (params: IDocParagraphSettingCommandParams) => {
        onBeforeChange?.();
        await commandService.executeCommand(DocParagraphSettingCommand.id, params);
        refresh();
        onAfterChange?.();
    };
    const content = (
        <div
            className="univer-flex univer-flex-col univer-items-start univer-gap-2 univer-p-2"
            data-u-editor-interaction-boundary="true"
            onMouseDown={(event) => event.preventDefault()}
        >
            <Checkbox
                checked={state.checked && !state.mixed}
                indeterminate={state.mixed}
                disabled={state.disabled}
                onChange={(checked) => apply({ paragraph: { wordWrap: checked ? BooleanNumber.TRUE : BooleanNumber.FALSE } })}
            >
                {label}
            </Checkbox>
            <Button
                variant="link"
                size="small"
                disabled={!state.hasOverride}
                onClick={() => apply({ resetWordWrap: true })}
            >
                {localeService.t<LocaleKey>('docs-ui.doc.paragraphSetting.inheritWordWrap')}
            </Button>
        </div>
    );

    return dropdown
        ? (
            <Dropdown open={open} onOpenChange={setOpen} overlay={content}>
                <span>
                    <Tooltip title={label}>
                        <Button
                            variant="ghost"
                            size="small"
                            aria-label={label}
                            aria-expanded={open}
                            data-u-editor-interaction-boundary="true"
                            onMouseDown={(event) => event.preventDefault()}
                        >
                            <AutowrapIcon />
                        </Button>
                    </Tooltip>
                </span>
            </Dropdown>
        )
        : content;
}
