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
import { Checkbox } from '@univerjs/design';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useState } from 'react';
import type { LocaleKey } from '../../locale/types';
import { DocParagraphSettingCommand } from '../../commands/commands/doc-paragraph-setting.command';

export function ParagraphWordWrapSetting() {
    const commandService = useDependency(ICommandService);
    const instanceService = useDependency(IUniverInstanceService);
    const selectionService = useDependency(DocSelectionManagerService);
    const localeService = useDependency(LocaleService);
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

    const apply = async (checked: boolean) => {
        await commandService.executeCommand(DocParagraphSettingCommand.id, {
            paragraph: { wordWrap: checked ? BooleanNumber.TRUE : BooleanNumber.FALSE },
        });
        refresh();
    };
    return (
        <div
            data-u-editor-interaction-boundary="true"
            onMouseDown={(event) => event.preventDefault()}
        >
            <Checkbox
                checked={state.checked && !state.mixed}
                indeterminate={state.mixed}
                disabled={state.disabled}
                onChange={(checked) => apply(checked === true)}
            >
                {label}
            </Checkbox>
        </div>
    );
}
