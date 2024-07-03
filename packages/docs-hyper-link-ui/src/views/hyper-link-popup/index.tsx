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

import { useDependency } from '@wendellhu/redi/react-bindings';
import React from 'react';
import { CopySingle, LinkSingle, UnlinkSingle, WriteSingle } from '@univerjs/icons';
import { ICommandService, LocaleService } from '@univerjs/core';
import cs from 'clsx';
import { MessageType, Tooltip } from '@univerjs/design';
import { IMessageService, useObservable } from '@univerjs/ui';
import { DocHyperLinkModel } from '@univerjs/docs-hyper-link';
import { DocHyperLinkService } from '../../services/hyper-link.service';
import { DeleteDocHyperLinkCommand } from '../../commands/commands/delete-link.command';
import { ShowDocHyperLinkEditPopupOperation } from '../../commands/operations/popup.operation';
import styles from './index.module.less';

export const DocLinkPopup = () => {
    const hyperLinkService = useDependency(DocHyperLinkService);
    const hyperLinkModel = useDependency(DocHyperLinkModel);
    const commandService = useDependency(ICommandService);
    const messageService = useDependency(IMessageService);
    const localeService = useDependency(LocaleService);
    const currentPopup = useObservable(hyperLinkService.showingLink$);
    if (!currentPopup) {
        return null;
    }

    const { unitId, linkId } = currentPopup;
    const link = hyperLinkModel.getLink(unitId, linkId);
    if (!link) {
        return null;
    }

    return (
        <div
            className={styles.docLink}
            onClick={() => {
                hyperLinkService.hideInfoPopup();
            }}
        >
            <div className={cs(styles.docLinkContent)} onClick={() => window.open(link.payload)}>
                <div className={styles.docLinkType}>
                    <LinkSingle />
                </div>
                <Tooltip showIfEllipsis title={link.payload}>
                    <span className={styles.docLinkUrl}>{link.payload}</span>
                </Tooltip>
            </div>
            <div className={styles.docLinkOperations}>
                <div
                    className={cs(styles.docLinkOperation)}
                    onClick={() => {
                        navigator.clipboard.writeText(link.payload);
                        messageService.show({
                            content: localeService.t('hyperLink.message.coped'),
                            type: MessageType.Info,
                        });
                    }}
                >
                    <Tooltip placement="bottom" title={localeService.t('hyperLink.popup.copy')}>
                        <CopySingle />
                    </Tooltip>

                </div>
                <div
                    className={styles.docLinkOperation}
                    onClick={() => {
                        commandService.executeCommand(ShowDocHyperLinkEditPopupOperation.id, {
                            link: { unitId, linkId },
                        });
                    }}
                >
                    <Tooltip placement="bottom" title={localeService.t('hyperLink.popup.edit')}>
                        <WriteSingle />
                    </Tooltip>
                </div>
                <div
                    className={styles.docLinkOperation}
                    onClick={() => {
                        commandService.executeCommand(DeleteDocHyperLinkCommand.id, {
                            unitId,
                            linkId: link.id,
                        });
                    }}
                >
                    <Tooltip placement="bottom" title={localeService.t('hyperLink.popup.cancel')}>
                        <UnlinkSingle />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

DocLinkPopup.componentKey = 'univer.doc.link-info-popup';
