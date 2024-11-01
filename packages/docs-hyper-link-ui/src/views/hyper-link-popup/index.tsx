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

import type { DocumentDataModel } from '@univerjs/core';
import { CustomRangeType, ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType, useDependency } from '@univerjs/core';
import { MessageType, Tooltip } from '@univerjs/design';
import { CopySingle, LinkSingle, UnlinkSingle, WriteSingle } from '@univerjs/icons';
import { IMessageService, useObservable } from '@univerjs/ui';
import cs from 'clsx';
import React from 'react';
import { DeleteDocHyperLinkCommand } from '../../commands/commands/delete-link.command';
import { ShowDocHyperLinkEditPopupOperation } from '../../commands/operations/popup.operation';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';
import styles from './index.module.less';

export const DocLinkPopup = () => {
    const hyperLinkService = useDependency(DocHyperLinkPopupService);
    const commandService = useDependency(ICommandService);
    const messageService = useDependency(IMessageService);
    const localeService = useDependency(LocaleService);
    const currentPopup = useObservable(hyperLinkService.showingLink$);
    const univerInstanceService = useDependency(IUniverInstanceService);
    if (!currentPopup) {
        return null;
    }

    const { unitId, linkId, segmentId, startIndex, endIndex } = currentPopup;
    const doc = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
    const body = doc?.getSelfOrHeaderFooterModel(segmentId).getBody();
    const link = body?.customRanges?.find((range) => range.rangeId === linkId && range.rangeType === CustomRangeType.HYPERLINK && range.startIndex === startIndex && range.endIndex === endIndex);

    if (!link) {
        return null;
    }

    const url = link.properties?.url;

    return (
        <div
            className={styles.docLink}
            onClick={() => {
                hyperLinkService.hideInfoPopup();
            }}
        >
            <div className={cs(styles.docLinkContent)} onClick={() => window.open(url)}>
                <div className={styles.docLinkType}>
                    <LinkSingle />
                </div>
                <Tooltip showIfEllipsis title={url}>
                    <span className={styles.docLinkUrl}>{url}</span>
                </Tooltip>
            </div>
            <div className={styles.docLinkOperations}>
                <div
                    className={cs(styles.docLinkOperation)}
                    onClick={() => {
                        navigator.clipboard.writeText(url);
                        messageService.show({
                            content: localeService.t('docLink.info.coped'),
                            type: MessageType.Info,
                        });
                    }}
                >
                    <Tooltip placement="bottom" title={localeService.t('docLink.info.copy')}>
                        <CopySingle />
                    </Tooltip>

                </div>
                <div
                    className={styles.docLinkOperation}
                    onClick={() => {
                        commandService.executeCommand(ShowDocHyperLinkEditPopupOperation.id, {
                            link: currentPopup,
                        });
                    }}
                >
                    <Tooltip placement="bottom" title={localeService.t('docLink.info.edit')}>
                        <WriteSingle />
                    </Tooltip>
                </div>
                <div
                    className={styles.docLinkOperation}
                    onClick={() => {
                        commandService.executeCommand(DeleteDocHyperLinkCommand.id, {
                            unitId,
                            linkId: link.rangeId,
                            segmentId,
                        });
                    }}
                >
                    <Tooltip placement="bottom" title={localeService.t('docLink.info.cancel')}>
                        <UnlinkSingle />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

DocLinkPopup.componentKey = 'univer.doc.link-info-popup';
