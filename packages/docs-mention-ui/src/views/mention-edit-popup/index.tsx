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

import type { DocumentDataModel, ITypeMentionList } from '@univerjs/core';
import { ICommandService, IMentionIOService, IUniverInstanceService, Tools, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IEditorService } from '@univerjs/docs-ui';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useState } from 'react';
import { filter } from 'rxjs';
import { AddDocMentionCommand } from '../../commands/commands/doc-mention.command';
import { DocMentionPopupService } from '../../services/doc-mention-popup.service';
import { MentionList } from '../mention-list';

export const MentionEditPopup = () => {
    const popupService = useDependency(DocMentionPopupService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const editPopup = useObservable(popupService.editPopup$);
    const mentionIOService = useDependency(IMentionIOService);
    const editorService = useDependency(IEditorService);
    const documentDataModel = editPopup ? univerInstanceService.getUnit<DocumentDataModel>(editPopup.unitId) : null;
    const textSelectionService = useDependency(DocSelectionManagerService);
    const [mentions, setMentions] = useState<ITypeMentionList[]>([]);
    const textSelection$ = useMemo(() =>
        textSelectionService.textSelection$.pipe(
            filter((selection) => selection.unitId === editPopup?.unitId)
        ), [textSelectionService.textSelection$, editPopup]);

    const textSelection = useObservable(textSelection$);
    const search = editPopup ? documentDataModel?.getBody()?.dataStream.slice(editPopup.anchor, textSelection?.textRanges[0].startOffset) : '';

    useEffect(() => {
        (async () => {
            if (editPopup) {
                const res = await mentionIOService.list({ unitId: editPopup.unitId, search });
                setMentions(res.list);
            }
        })();
    }, [mentionIOService, editPopup, search]);
    if (!editPopup) {
        return null;
    }

    return (
        <MentionList
            editorId={editPopup.unitId}
            onClick={() => {
                popupService.closeEditPopup();
                editorService.focus(editPopup.unitId);
            }}
            mentions={mentions}
            onSelect={async (mention) => {
                await commandService.executeCommand(AddDocMentionCommand.id, {
                    unitId: univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC)!.getUnitId(),
                    mention: {
                        ...mention,
                        id: Tools.generateRandomId(),
                    },
                    startIndex: editPopup.anchor,
                });
                editorService.focus(editPopup.unitId);
            }}
        />
    );
};

MentionEditPopup.componentKey = 'univer.popup.doc-mention-edit';
