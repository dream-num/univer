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
import { CustomRangeType, ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { borderClassName, clsx, MessageType, Tooltip } from '@univerjs/design';
import { CopySingle, LinkSingle, UnlinkSingle, WriteSingle } from '@univerjs/icons';
import { IMessageService, useDependency, useObservable } from '@univerjs/ui';
import { DeleteDocHyperLinkCommand } from '../../commands/commands/delete-link.command';
import { ShowDocHyperLinkEditPopupOperation } from '../../commands/operations/popup.operation';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';

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
            className={clsx(`
              univer-box-border univer-flex univer-max-w-80 univer-items-center univer-justify-between
              univer-overflow-hidden univer-rounded-lg univer-bg-white univer-p-3 univer-shadow
              dark:univer-bg-gray-900
            `, borderClassName)}
            onClick={() => {
                hyperLinkService.hideInfoPopup();
            }}
        >
            <div
                className={`
                  univer-flex univer-h-6 univer-flex-1 univer-cursor-pointer univer-items-center univer-truncate
                  univer-text-sm univer-leading-5 univer-text-primary-500
                `}
                onClick={() => window.open(url, undefined, 'noopener noreferrer')}
            >
                <div
                    className={`
                      univer-mr-2 univer-flex univer-size-5 univer-flex-[0_0_auto] univer-items-center
                      univer-justify-center univer-text-base univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    <LinkSingle />
                </div>
                <Tooltip showIfEllipsis title={url}>
                    <span className="univer-flex-1 univer-truncate">{url}</span>
                </Tooltip>
            </div>
            <div className="univer-flex univer-h-6 univer-flex-[0_0_auto] univer-items-center univer-justify-center">
                <div
                    className={`
                      univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-items-center
                      univer-justify-center univer-rounded univer-text-base
                    `}
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
                    className={`
                      univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-items-center
                      univer-justify-center univer-rounded univer-text-base
                    `}
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
                    className={`
                      univer-ml-2 univer-flex univer-size-6 univer-cursor-pointer univer-items-center
                      univer-justify-center univer-rounded univer-text-base
                    `}
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
