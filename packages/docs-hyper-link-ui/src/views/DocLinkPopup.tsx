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

import {
    CustomRangeType,
    DocumentDataModel,
    ICommandService,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { getDocumentPermissionValue } from '@univerjs/docs';
import { UnitAction } from '@univerjs/protocol';
import { HyperlinkPreview, IMessageService, useDependency, useObservable } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { DeleteDocHyperLinkCommand } from '../commands/commands/delete-link.command';
import { ClickDocHyperLinkOperation, ShowDocHyperLinkEditPopupOperation } from '../commands/operations/popup.operation';
import { DocHyperLinkPopupService } from '../services/hyper-link-popup.service';

export const DocLinkPopup = () => {
    const hyperLinkService = useDependency(DocHyperLinkPopupService);
    const commandService = useDependency(ICommandService);
    const messageService = useDependency(IMessageService);
    const localeService = useDependency(LocaleService);
    const currentPopup = useObservable(hyperLinkService.showingLink$, hyperLinkService.showing);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const permissionService = useDependency(IPermissionService);
    if (!currentPopup) {
        return null;
    }

    const { unitId, linkId, segmentId, startIndex, endIndex } = currentPopup;
    const doc = univerInstanceService.getUnit(unitId, UniverInstanceType.UNIVER_DOC);
    const body = doc instanceof DocumentDataModel
        ? doc.getSelfOrHeaderFooterModel(segmentId)?.getBody()
        : undefined;
    const link = body?.customRanges?.find((range) => range.rangeId === linkId && range.rangeType === CustomRangeType.HYPERLINK && range.startIndex === startIndex && range.endIndex === endIndex);

    if (!link) {
        return null;
    }

    const target = link.properties?.url ?? `#${link.properties?.bookmarkId ?? link.properties?.headingId ?? ''}`;
    const canEdit = hyperLinkService.canEditLink(unitId, currentPopup);
    const canCopy = getDocumentPermissionValue(permissionService, unitId, unitId, UnitAction.Copy);
    return (
        <HyperlinkPreview
            title={target}
            copyDisabled={!canCopy}
            labels={{ copy: localeService.t<LocaleKey>('docs-hyper-link-ui.info.copy'), edit: localeService.t<LocaleKey>('docs-hyper-link-ui.info.edit'), remove: localeService.t<LocaleKey>('docs-hyper-link-ui.info.cancel') }}
            onPointerEnter={() => hyperLinkService.setInfoPopupHovered(true)}
            onPointerLeave={() => {
                hyperLinkService.setInfoPopupHovered(false);
                hyperLinkService.scheduleHideInfoPopup();
            }}
            onDismiss={() => hyperLinkService.hideInfoPopup()}
            onOpen={() => commandService.executeCommand(ClickDocHyperLinkOperation.id, { unitId, linkId, segmentId })}
            onCopy={async () => {
                await navigator.clipboard.writeText(target);
                messageService.show({ content: localeService.t<LocaleKey>('docs-hyper-link-ui.info.coped'), type: MessageType.Info });
            }}
            onEdit={canEdit ? () => commandService.executeCommand(ShowDocHyperLinkEditPopupOperation.id, { link: currentPopup }) : undefined}
            onRemove={canEdit ? () => commandService.executeCommand(DeleteDocHyperLinkCommand.id, { unitId, linkId: link.rangeId, segmentId }) : undefined}
        />
    );
};

DocLinkPopup.componentKey = 'univer.doc.link-info-popup';
