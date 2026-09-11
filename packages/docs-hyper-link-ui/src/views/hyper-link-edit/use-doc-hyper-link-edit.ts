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
import {
    BuildTextUtils,
    getBodySlice,
    ICommandService,
    IUniverInstanceService,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { AddDocHyperLinkCommand } from '../../commands/commands/add-link.command';
import { UpdateDocHyperLinkCommand } from '../../commands/commands/update-link.command';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';
import { isBlankInput } from './utils';

function hasProtocol(url: string): boolean {
    return /^[a-zA-Z]+:\/\//.test(url);
}

function isEmail(url: string): boolean {
    return /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(url);
}

function transformUrl(url: string): string {
    return hasProtocol(url) ? url : isEmail(url) ? `mailto://${url}` : `https://${url}`;
}

// eslint-disable-next-line max-lines-per-function
export function useDocHyperLinkEdit() {
    const hyperLinkService = useDependency(DocHyperLinkPopupService);
    const editing = useObservable(hyperLinkService.editingLink$, hyperLinkService.editing);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const [link, setLink] = useState('');
    const [label, setLabel] = useState('');
    const [showError, setShowError] = useState(false);
    const isLegal = Tools.isLegalUrl(link);
    const doc = editing
        ? univerInstanceService.getUnit<DocumentDataModel>(editing.unitId, UniverInstanceType.UNIVER_DOC)
        : univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

    // eslint-disable-next-line complexity
    useEffect(() => {
        const activeRange = docSelectionManagerService.getActiveTextRange();
        if (!activeRange) {
            return;
        }

        if (editing) {
            const body = doc?.getSelfOrHeaderFooterModel(editing.segmentId)?.getBody();
            const matchedRange = body?.customRanges?.find((range) =>
                editing.linkId === range.rangeId &&
                range.startIndex === editing.startIndex &&
                range.endIndex === editing.endIndex
            );
            if (doc && matchedRange) {
                // Selection changes are the external source of truth for these controlled inputs.
                // eslint-disable-next-line react/set-state-in-effect
                setLink(matchedRange.properties?.url ?? '');
                // eslint-disable-next-line react/set-state-in-effect
                setLabel(BuildTextUtils.transform.getPlainText(getBodySlice(body!, matchedRange.startIndex, matchedRange.endIndex + 1).dataStream));
            }
            return;
        }

        const body = doc?.getSelfOrHeaderFooterModel(activeRange.segmentId)?.getBody();
        const selection = body ? activeRange : null;
        const matchedRange = selection && BuildTextUtils.customRange.getCustomRangesInterestsWithSelection(selection, body?.customRanges ?? [])?.[0];
        if (doc && matchedRange) {
            // eslint-disable-next-line react/set-state-in-effect
            setLink(matchedRange.properties?.url ?? '');
        }
    }, [doc, docSelectionManagerService, editing]);

    const handleCancel = () => hyperLinkService.hideEditPopup();
    const handleConfirm = () => {
        setShowError(true);
        if (!isLegal || !doc) {
            return;
        }

        const payload = transformUrl(link);
        if (editing) {
            if (isBlankInput(label)) {
                return;
            }
            commandService.executeCommand(UpdateDocHyperLinkCommand.id, {
                unitId: doc.getUnitId(),
                payload,
                linkId: editing.linkId,
                label,
                segmentId: editing.segmentId,
            }).catch(() => undefined);
        } else {
            commandService.executeCommand(AddDocHyperLinkCommand.id, {
                unitId: doc.getUnitId(),
                payload,
            }).catch(() => undefined);
        }
        hyperLinkService.hideEditPopup();
    };

    return {
        doc,
        editing,
        handleCancel,
        handleConfirm,
        isLegal,
        label,
        link,
        setLabel,
        setLink,
        showError,
    };
}
