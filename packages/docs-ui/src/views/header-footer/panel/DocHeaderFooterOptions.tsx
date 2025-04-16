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

import type { IDocumentStyle } from '@univerjs/core';
import type { IHeaderFooterProps } from '../../../commands/commands/doc-header-footer.command';
import { BooleanNumber, ICommandService, IUniverInstanceService, LocaleService, Tools } from '@univerjs/core';
import { Button, Checkbox, InputNumber } from '@univerjs/design';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { ILayoutService, useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { CloseHeaderFooterCommand, CoreHeaderFooterCommandId } from '../../../commands/commands/doc-header-footer.command';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';

function getSegmentId(documentStyle: IDocumentStyle, editArea: DocumentEditArea, pageIndex: number): string {
    const { useFirstPageHeaderFooter, evenAndOddHeaders, defaultHeaderId, defaultFooterId, firstPageHeaderId, firstPageFooterId, evenPageHeaderId, evenPageFooterId } = documentStyle;

    if (editArea === DocumentEditArea.HEADER) {
        if (useFirstPageHeaderFooter === BooleanNumber.TRUE) {
            if (pageIndex === 0) {
                return firstPageHeaderId!;
            } else {
                return evenAndOddHeaders === BooleanNumber.TRUE && pageIndex % 2 === 1 ? evenPageHeaderId! : defaultHeaderId!;
            }
        } else {
            return evenAndOddHeaders === BooleanNumber.TRUE && pageIndex % 2 === 1 ? evenPageHeaderId! : defaultHeaderId!;
        }
    } else {
        if (useFirstPageHeaderFooter === BooleanNumber.TRUE) {
            if (pageIndex === 0) {
                return firstPageFooterId!;
            } else {
                return evenAndOddHeaders === BooleanNumber.TRUE && pageIndex % 2 === 1 ? evenPageFooterId! : defaultFooterId!;
            }
        } else {
            return evenAndOddHeaders === BooleanNumber.TRUE && pageIndex % 2 === 1 ? evenPageFooterId! : defaultFooterId!;
        }
    }
}

export interface IDocHeaderFooterOptionsProps {
    unitId: string;
}

export const DocHeaderFooterOptions = (props: IDocHeaderFooterOptionsProps) => {
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const commandService = useDependency(ICommandService);

    const layoutService = useDependency(ILayoutService);

    const { unitId } = props;

    const docSelectionRenderService = renderManagerService.getRenderById(unitId)!.with(DocSelectionRenderService)!;

    const [options, setOptions] = useState<IHeaderFooterProps>({});

    const handleCheckboxChange = (val: boolean, type: 'useFirstPageHeaderFooter' | 'evenAndOddHeaders') => {
        setOptions((prev) => ({
            ...prev,
            [type]: val ? BooleanNumber.TRUE : BooleanNumber.FALSE,
        }));

        const docDataModel = univerInstanceService.getUniverDocInstance(unitId);
        const documentStyle = docDataModel?.getSnapshot().documentStyle;
        const docSkeletonManagerService = renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService);
        const viewModel = docSkeletonManagerService?.getViewModel();

        if (documentStyle == null || viewModel == null) {
            return;
        }

        const editArea = viewModel.getEditArea();

        let needCreateHeaderFooter = false;
        const segmentPage = docSelectionRenderService.getSegmentPage();
        let needChangeSegmentId = false;
        if (type === 'useFirstPageHeaderFooter' && val === true) {
            if (editArea === DocumentEditArea.HEADER && !documentStyle.firstPageHeaderId) {
                needCreateHeaderFooter = true;
            } else if (editArea === DocumentEditArea.FOOTER && !documentStyle.firstPageFooterId) {
                needCreateHeaderFooter = true;
            }

            if (needCreateHeaderFooter && segmentPage === 0) {
                needChangeSegmentId = true;
            }
        }

        if (type === 'evenAndOddHeaders' && val === true) {
            if (editArea === DocumentEditArea.HEADER && !documentStyle.evenPageHeaderId) {
                needCreateHeaderFooter = true;
            } else if (editArea === DocumentEditArea.FOOTER && !documentStyle.evenPageFooterId) {
                needCreateHeaderFooter = true;
            }

            if (needCreateHeaderFooter && segmentPage % 2 === 1) {
                needChangeSegmentId = true;
            }
        }

        if (needCreateHeaderFooter) {
            const SEGMENT_ID_LEN = 6;
            const segmentId = Tools.generateRandomId(SEGMENT_ID_LEN);
            // Set segment id first, then exec command.
            if (needChangeSegmentId) {
                docSelectionRenderService.setSegment(segmentId);
            }

            commandService.executeCommand(CoreHeaderFooterCommandId, {
                unitId,
                segmentId,
                headerFooterProps: {
                    [type]: val ? BooleanNumber.TRUE : BooleanNumber.FALSE,
                },
            });
        } else {
            const segmentPageIndex = docSelectionRenderService.getSegmentPage();
            const prevSegmentId = docSelectionRenderService.getSegment();

            const needFocusSegmentId = getSegmentId(
                {
                    ...documentStyle,
                    [type]: val ? BooleanNumber.TRUE : BooleanNumber.FALSE,
                },
                editArea,
                segmentPageIndex
            );

            if (needFocusSegmentId && needFocusSegmentId !== prevSegmentId) {
                docSelectionRenderService.setSegment(needFocusSegmentId);
            }

            commandService.executeCommand(CoreHeaderFooterCommandId, {
                unitId,
                headerFooterProps: {
                    [type]: val ? BooleanNumber.TRUE : BooleanNumber.FALSE,
                },
            });
        }

        layoutService.focus();
    };

    const handleMarginChange = async (val: number, type: 'marginHeader' | 'marginFooter') => {
        setOptions((prev) => ({
            ...prev,
            [type]: val,
        }));

        await commandService.executeCommand(CoreHeaderFooterCommandId, {
            unitId,
            headerFooterProps: {
                [type]: val,
            },
        });

        // To make sure input always has focus.
        docSelectionRenderService.removeAllRanges();
        docSelectionRenderService.blur();
    };

    const closeHeaderFooter = () => {
        commandService.executeCommand(CloseHeaderFooterCommand.id, {
            unitId,
        });
    };

    useEffect(() => {
        const docDataModel = univerInstanceService.getUniverDocInstance(unitId);
        const documentStyle = docDataModel?.getSnapshot().documentStyle;

        if (documentStyle) {
            const {
                marginHeader = 0,
                marginFooter = 0,
                useFirstPageHeaderFooter = BooleanNumber.FALSE,
                evenAndOddHeaders = BooleanNumber.FALSE,
            } = documentStyle;

            setOptions({
                marginHeader,
                marginFooter,
                useFirstPageHeaderFooter,
                evenAndOddHeaders,
            });
        }
    }, [unitId]);

    return (
        <div className="univer-grid univer-gap-4">
            <div className="univer-grid univer-gap-2">
                <div>
                    <Checkbox
                        checked={options.useFirstPageHeaderFooter === BooleanNumber.TRUE}
                        onChange={(val) => { handleCheckboxChange(val as boolean, 'useFirstPageHeaderFooter'); }}
                    >
                        {localeService.t('headerFooter.firstPageCheckBox')}
                    </Checkbox>
                </div>
                <div>
                    <Checkbox
                        checked={options.evenAndOddHeaders === BooleanNumber.TRUE}
                        onChange={(val) => { handleCheckboxChange(val as boolean, 'evenAndOddHeaders'); }}
                    >
                        {localeService.t('headerFooter.oddEvenCheckBox')}
                    </Checkbox>
                </div>
            </div>

            <div className="univer-mb-1 univer-flex">
                <div>
                    <span>{localeService.t('headerFooter.headerTopMargin')}</span>
                    <InputNumber
                        className="univer-mt-1.5 univer-w-4/5"
                        min={0}
                        max={200}
                        precision={1}
                        value={options.marginHeader}
                        onChange={(val) => { handleMarginChange(val as number, 'marginHeader'); }}
                    />
                </div>
                <div>
                    <span>{localeService.t('headerFooter.footerBottomMargin')}</span>
                    <InputNumber
                        className="univer-mt-1.5 univer-w-4/5"
                        min={0}
                        max={200}
                        precision={1}
                        value={options.marginFooter}
                        onChange={(val) => { handleMarginChange(val as number, 'marginFooter'); }}
                    />
                </div>
            </div>

            <div className="univer-flex univer-justify-end">
                <Button onClick={closeHeaderFooter}>{localeService.t('headerFooter.closeHeaderFooter')}</Button>
            </div>
        </div>
    );
};
