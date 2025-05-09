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
import { BuildTextUtils, getBodySlice, ICommandService, IUniverInstanceService, LocaleService, Tools, UniverInstanceType } from '@univerjs/core';
import { borderClassName, Button, clsx, FormLayout, Input } from '@univerjs/design';
import { DocSelectionManagerService } from '@univerjs/docs';
import { KeyCode, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { AddDocHyperLinkCommand } from '../../commands/commands/add-link.command';
import { UpdateDocHyperLinkCommand } from '../../commands/commands/update-link.command';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';

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
    const editing = useObservable(hyperLinkService.editingLink$);
    const commandService = useDependency(ICommandService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const [link, setLink] = useState('');
    const [label, setLabel] = useState('');
    const [showError, setShowError] = useState(false);
    const isLegal = Tools.isLegalUrl(link);
    const doc = editing
        ? univerInstanceService.getUnit<DocumentDataModel>(editing.unitId, UniverInstanceType.UNIVER_DOC) :
        univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);

    useEffect(() => {
        const activeRange = docSelectionManagerService.getActiveTextRange();
        if (!activeRange) {
            return;
        }

        if (editing) {
            const body = doc?.getSelfOrHeaderFooterModel(editing.segmentId)?.getBody();
            const matchedRange = body?.customRanges?.find((i) => editing?.linkId === i.rangeId && i.startIndex === editing.startIndex && i.endIndex === editing.endIndex);
            if (doc && matchedRange) {
                setLink(matchedRange.properties?.url ?? '');
                setLabel(BuildTextUtils.transform.getPlainText(getBodySlice(body!, matchedRange.startIndex, matchedRange.endIndex + 1).dataStream));
            }
            return;
        }

        const body = doc?.getSelfOrHeaderFooterModel(activeRange.segmentId)?.getBody();
        const selection = body ? activeRange : null;
        const matchedRange = selection && BuildTextUtils.customRange.getCustomRangesInterestsWithSelection(selection, body?.customRanges ?? [])?.[0];
        if (doc && matchedRange) {
            setLink(matchedRange?.properties?.url ?? '');
        }
    }, [doc, editing, docSelectionManagerService, univerInstanceService]);

    const handleCancel = () => {
        hyperLinkService.hideEditPopup();
    };
    const handleConfirm = () => {
        setShowError(true);
        if (!isLegal || !doc) {
            return;
        }
        const linkFinal = transformUrl(link);

        if (!editing) {
            commandService.executeCommand(AddDocHyperLinkCommand.id, {
                unitId: doc.getUnitId(),
                payload: linkFinal,
            });
        } else {
            if (!label) {
                return;
            }

            commandService.executeCommand(UpdateDocHyperLinkCommand.id, {
                unitId: doc.getUnitId(),
                payload: linkFinal,
                linkId: editing.linkId,
                label,
                segmentId: editing.segmentId,
            });
        }
        hyperLinkService.hideEditPopup();
    };

    if (!doc) {
        return;
    }

    return (
        <div
            className={clsx(`
              univer-box-border univer-w-[328px] univer-rounded-xl univer-bg-white univer-px-6 univer-py-5 univer-shadow
            `, borderClassName)}
        >
            <div>
                {editing
                    ? (
                        <FormLayout
                            label={localeService.t('docLink.edit.label')}
                            error={showError && !label ? localeService.t('docLink.edit.labelError') : ''}
                        >
                            <Input
                                value={label}
                                onChange={setLabel}
                                autoFocus
                                onKeyDown={(evt) => {
                                    if (evt.keyCode === KeyCode.ENTER) {
                                        handleConfirm();
                                    }
                                }}
                            />
                        </FormLayout>
                    )
                    : null}
                <FormLayout
                    label={localeService.t('docLink.edit.address')}
                    error={showError && !isLegal ? localeService.t('docLink.edit.addressError') : ''}
                >
                    <Input
                        value={link}
                        onChange={setLink}
                        autoFocus
                        onKeyDown={(evt) => {
                            if (evt.keyCode === KeyCode.ENTER) {
                                handleConfirm();
                            }
                        }}
                    />
                </FormLayout>
            </div>
            <div className="univer-flex univer-justify-end univer-gap-3">
                <Button onClick={handleCancel}>
                    {localeService.t('docLink.edit.cancel')}
                </Button>
                <Button
                    variant="primary"
                    disabled={!link}
                    onClick={handleConfirm}
                >
                    {localeService.t('docLink.edit.confirm')}
                </Button>
            </div>
        </div>
    );
};

DocHyperLinkEdit.componentKey = 'docs-hyper-link-edit';
