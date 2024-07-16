/**
 * Copyright 2023-present DreamNum Inc.
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

import { useDependency, useObservable } from '@wendellhu/redi/react-bindings';
import { AddDocMentionCommand, type IMention, MentionType } from '@univerjs/docs-mention';
import React from 'react';
import { ICommandService, IUniverInstanceService, Tools, UniverInstanceType } from '@univerjs/core';
import { DocMentionPopupService } from '../../services/doc-mention-popup.service';
import { MentionList } from '../mention-list';

export const MentionEditPopup = () => {
    const popupService = useDependency(DocMentionPopupService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const editPopup = useObservable(popupService.editPopup$);
    const mentions: IMention[] = [{
        objectId: '1',
        objectType: MentionType.PERSON,
        label: '123',
    }];

    if (!editPopup) {
        return null;
    }

    return (
        <MentionList
            mentions={mentions}
            onSelect={(mention) => {
                commandService.executeCommand(AddDocMentionCommand.id, {
                    unitId: univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC)!.getUnitId(),
                    mention: {
                        ...mention,
                        id: Tools.generateRandomId(),
                    },
                    startIndex: editPopup.anchor,
                });
            }}
        />
    );
};

MentionEditPopup.componentKey = 'univer.popup.doc-mention-edit';
