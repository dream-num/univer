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

import type { LocaleKey } from '../locale/types';
import {
    CustomRangeType,
    DocumentDataModel,
    ICommandService,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import { MessageType, MobileActionRow } from '@univerjs/design';
import { getDocumentPermissionValue } from '@univerjs/docs';
import { UnitAction } from '@univerjs/protocol';
import { IMessageService, useDependency, useObservable } from '@univerjs/ui';
import { DeleteDocHyperLinkCommand } from '../commands/commands/delete-link.command';
import { ShowDocHyperLinkEditPopupOperation } from '../commands/operations/popup.operation';
import { DocHyperLinkPopupService } from '../services/hyper-link-popup.service';

export function MobileDocLinkPopup() {
    const commandService = useDependency(ICommandService);
    const hyperLinkService = useDependency(DocHyperLinkPopupService);
    const localeService = useDependency(LocaleService);
    const messageService = useDependency(IMessageService);
    const permissionService = useDependency(IPermissionService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const currentPopup = useObservable(hyperLinkService.showingLink$, hyperLinkService.showing);
    if (!currentPopup) {
        return null;
    }

    const { unitId, linkId, segmentId, startIndex, endIndex } = currentPopup;
    const document = univerInstanceService.getUnit(unitId, UniverInstanceType.UNIVER_DOC);
    const body = document instanceof DocumentDataModel
        ? document.getSelfOrHeaderFooterModel(segmentId)?.getBody()
        : undefined;
    const link = body?.customRanges?.find((range) => range.rangeId === linkId
        && range.rangeType === CustomRangeType.HYPERLINK
        && range.startIndex === startIndex
        && range.endIndex === endIndex);
    if (!link) {
        return null;
    }

    const url = link.properties?.url;
    const canEdit = hyperLinkService.canEditLink(unitId, currentPopup);
    const canCopy = getDocumentPermissionValue(permissionService, unitId, unitId, UnitAction.Copy);

    return (
        <div className="univer-flex univer-flex-col univer-gap-2 univer-py-2">
            <MobileActionRow
                title={<span className="univer-truncate univer-text-primary-600">{url}</span>}
                aria-label={url}
                variant="subtle"
                onClick={() => window.open(url, undefined, 'noopener noreferrer')}
            />
            {canCopy && (
                <MobileActionRow
                    title={localeService.t<LocaleKey>('docs-hyper-link-ui.info.copy')}
                    aria-label={localeService.t<LocaleKey>('docs-hyper-link-ui.info.copy')}
                    variant="subtle"
                    onClick={() => navigator.clipboard.writeText(url).then(() => {
                        messageService.show({
                            content: localeService.t<LocaleKey>('docs-hyper-link-ui.info.coped'),
                            type: MessageType.Info,
                        });
                    }).catch(() => undefined)}
                />
            )}
            {canEdit && (
                <>
                    <MobileActionRow
                        title={localeService.t<LocaleKey>('docs-hyper-link-ui.info.edit')}
                        aria-label={localeService.t<LocaleKey>('docs-hyper-link-ui.info.edit')}
                        variant="subtle"
                        onClick={() => {
                            commandService.executeCommand(ShowDocHyperLinkEditPopupOperation.id, {
                                link: currentPopup,
                            }).catch(() => undefined);
                        }}
                    />
                    <MobileActionRow
                        title={localeService.t<LocaleKey>('docs-hyper-link-ui.info.cancel')}
                        aria-label={localeService.t<LocaleKey>('docs-hyper-link-ui.info.cancel')}
                        variant="subtle"
                        onClick={() => {
                            commandService.executeCommand(DeleteDocHyperLinkCommand.id, {
                                unitId,
                                linkId: link.rangeId,
                                segmentId,
                            }).catch(() => undefined);
                        }}
                    />
                </>
            )}
        </div>
    );
}

MobileDocLinkPopup.componentKey = 'univer.doc.mobile-link-info-popup';
