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
import { useDependency, useObservable } from '@wendellhu/redi/react-bindings';
import { DocHyperLinkModel } from '@univerjs/docs-hyper-link';
import type { DocumentDataModel } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocHyperLinkService } from '../../services/hyper-link.service';
import { AddDocHyperLinkCommand } from '../../commands/commands/add-link.command';
import { UpdateDocHyperLinkCommand } from '../../commands/commands/update-link.command';
import styles from './index.module.less';

export const DocHyperLinkEdit = () => {
    const hyperLinkService = useDependency(DocHyperLinkService);
    const hyperLinkModel = useDependency(DocHyperLinkModel);
    const editingId = useObservable(hyperLinkService.editingLink$);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const [link, setLink] = useState('');
    const doc = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
    useEffect(() => {
        if (!doc) {
            return;
        }
        const unitId = doc.getUnitId();
        const linkDetail = editingId ? hyperLinkModel.getLink(unitId, editingId) : null;
        setLink(linkDetail?.payload ?? '');
    }, [doc, editingId, hyperLinkModel]);

    const handleCancel = () => {
        hyperLinkService.hideEditPopup();
    };
    const handleConfirm = () => {
        if (!doc) {
            return;
        }
        if (!editingId) {
            commandService.executeCommand(AddDocHyperLinkCommand.id, {
                unitId: doc.getUnitId(),
                payload: link,
            });
        } else {
            commandService.executeCommand(UpdateDocHyperLinkCommand.id, {
                unitId: doc.getUnitId(),
                payload: link,
                linkId: editingId,
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
                <span>Link</span>
                <CloseSingle className={styles.docsLinkEditClose} onClick={handleCancel} />
            </div>
            <div>
                <FormLayout label="Link address">
                    <Input value={link} onChange={setLink} />
                </FormLayout>
            </div>
            <div className={styles.docsLinkEditButtons}>
                <Button className={styles.docsLinkEditButton} onClick={handleCancel}>Cancel</Button>
                <Button className={styles.docsLinkEditButton} type="primary" onClick={handleConfirm}>Confirm</Button>
            </div>
        </div>
    );
};

DocHyperLinkEdit.componentKey = 'docs-hyper-link-edit';
