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

import { ICommandService, IUniverInstanceService, Tools, UniverInstanceType, useDependency, useObservable, UserManagerService } from '@univerjs/core';
import { AddDocMentionCommand, type IMention, MentionType } from '@univerjs/docs-mention';
import React, { useEffect } from 'react';
import { ITextSelectionRenderManager } from '@univerjs/engine-render';
import { DocMentionPopupService } from '../../services/doc-mention-popup.service';
import { MentionList } from '../mention-list';

export const MentionEditPopup = () => {
    const popupService = useDependency(DocMentionPopupService);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const textSelectionRenderService = useDependency(ITextSelectionRenderManager);
    const editPopup = useObservable(popupService.editPopup$);
    const userService = useDependency(UserManagerService);

    const mentions: IMention[] = userService.list().map((user) => ({
        objectId: user.userID,
        label: user.name,
        objectType: MentionType.PERSON,
        extra: {
            icon: user.avatar,
        },
    }));

    useEffect(() => {
        textSelectionRenderService.blur();
        return () => {
            textSelectionRenderService.focus();
        };
    }, [textSelectionRenderService]);

    if (!editPopup) {
        return null;
    }

    return (
        <MentionList
            onClick={() => popupService.closeEditPopup()}
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
