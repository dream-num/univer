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

import { Button, FormLayout, Input } from '@univerjs/design';
import React, { useEffect, useState } from 'react';
import { CloseSingle } from '@univerjs/icons';
import { ICommandService, IUniverInstanceService, LocaleService, Tools, UniverInstanceType, useDependency, useObservable } from '@univerjs/core';
import { DocHyperLinkModel } from '@univerjs/docs-hyper-link';
import type { DocumentDataModel } from '@univerjs/core';
import { ITextSelectionRenderManager } from '@univerjs/engine-render';
import { TextSelectionManagerService } from '@univerjs/docs';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';
import { AddDocHyperLinkCommand } from '../../commands/commands/add-link.command';
import { UpdateDocHyperLinkCommand } from '../../commands/commands/update-link.command';
import styles from './index.module.less';

function hasProtocol(urlString: string) {
    const pattern = /^[a-zA-Z]+:\/\//;
    return pattern.test(urlString);
}

function isEmail(url: string) {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return pattern.test(url);
}

function transformUrl(urlStr: string) {
    return hasProtocol(urlStr) ? urlStr : isEmail(urlStr) ? `mailto://${urlStr}` : `https://${urlStr}`;
}

export const DocHyperLinkEdit = () => {
    const hyperLinkService = useDependency(DocHyperLinkPopupService);
    const localeService = useDependency(LocaleService);
    const hyperLinkModel = useDependency(DocHyperLinkModel);
    const editingId = useObservable(hyperLinkService.editingLink$);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const textSelectionRenderManager = useDependency(ITextSelectionRenderManager);
    const textSelectionManagerService = useDependency(TextSelectionManagerService);
    const [link, setLink] = useState('');
    const [showError, setShowError] = useState(false);
    const isLegal = Tools.isLegalUrl(link);
    const doc = editingId
        ? univerInstanceService.getUnit<DocumentDataModel>(editingId.unitId, UniverInstanceType.UNIVER_DOC) :
        univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

    useEffect(() => {
        if (editingId) {
            const linkDetail = editingId ? hyperLinkModel.getLink(editingId.unitId, editingId.linkId) : null;
            setLink(linkDetail?.payload ?? '');
            return;
        }
        const activeRange = textSelectionManagerService.getActiveRange();
        if (!activeRange) {
            return;
        }
        const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const matchedRange = doc?.getBody()?.customRanges?.find((i) => Math.max(activeRange.startOffset, i.startIndex) <= Math.min(activeRange.endOffset - 1, i.endIndex));
        if (doc && matchedRange) {
            const linkDetail = hyperLinkModel.getLink(doc.getUnitId(), matchedRange.rangeId);
            setLink(linkDetail?.payload ?? '');
        }
    }, [editingId, hyperLinkModel, textSelectionManagerService, univerInstanceService]);

    useEffect(() => {
        textSelectionRenderManager.blurEditor();
        return () => {
            textSelectionRenderManager.focusEditor();
        };
    }, [textSelectionRenderManager]);

    const handleCancel = () => {
        hyperLinkService.hideEditPopup();
    };
    const handleConfirm = () => {
        setShowError(true);
        if (!isLegal || !doc) {
            return;
        }
        const linkFinal = transformUrl(link);

        if (!editingId) {
            commandService.executeCommand(AddDocHyperLinkCommand.id, {
                unitId: doc.getUnitId(),
                payload: linkFinal,
            });
        } else {
            commandService.executeCommand(UpdateDocHyperLinkCommand.id, {
                unitId: doc.getUnitId(),
                payload: linkFinal,
                linkId: editingId.linkId,
            });
        }
        hyperLinkService.hideEditPopup();
    };

    if (!doc) {
        return;
    }

    return (
        <div className={styles.docsLinkEdit}>
            <div className={styles.docsLinkEditTitle}>
                <span>{localeService.t('docLink.edit.title')}</span>
                <CloseSingle className={styles.docsLinkEditClose} onClick={handleCancel} />
            </div>
            <div>
                <FormLayout
                    label={localeService.t('docLink.edit.address')}
                    error={showError && !isLegal ? localeService.t('docLink.edit.addressError') : ''}
                >
                    <Input value={link} onChange={setLink} autoFocus />
                </FormLayout>
            </div>
            <div className={styles.docsLinkEditButtons}>
                <Button
                    className={styles.docsLinkEditButton}
                    onClick={handleCancel}
                >
                    {localeService.t('docLink.edit.cancel')}
                </Button>
                <Button
                    disabled={!link}
                    className={styles.docsLinkEditButton}
                    type="primary"
                    onClick={handleConfirm}
                >
                    {localeService.t('docLink.edit.confirm')}
                </Button>
            </div>
        </div>
    );
};

DocHyperLinkEdit.componentKey = 'docs-hyper-link-edit';
