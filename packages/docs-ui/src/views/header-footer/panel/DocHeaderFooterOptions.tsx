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

import { BooleanNumber, ICommandService, IUniverInstanceService, LocaleService, Tools, useDependency } from '@univerjs/core';
import { Button, Checkbox, InputNumber } from '@univerjs/design';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { ILayoutService } from '@univerjs/ui';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { CoreHeaderFooterCommandId, type IHeaderFooterProps } from '../../../commands/commands/doc-header-footer.command';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import styles from './index.module.less';

export interface IDocHeaderFooterOptionsProps {
    unitId: string;
}

export const DocHeaderFooterOptions = (props: IDocHeaderFooterOptionsProps) => {
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const commandService = useDependency(ICommandService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
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
            let needFocusSegmentId;
            const segmentPageIndex = docSelectionRenderService.getSegmentPage();
            const prevSegmentId = docSelectionRenderService.getSegment();

            if (type === 'useFirstPageHeaderFooter') {
                if (editArea === DocumentEditArea.HEADER) {
                    needFocusSegmentId = val && segmentPageIndex === 0 ? documentStyle.firstPageHeaderId : documentStyle.defaultHeaderId;
                } else if (editArea === DocumentEditArea.FOOTER) {
                    needFocusSegmentId = val && segmentPageIndex === 0 ? documentStyle.firstPageFooterId : documentStyle.defaultFooterId;
                }
            } else if (type === 'evenAndOddHeaders') {
                if (editArea === DocumentEditArea.HEADER) {
                    needFocusSegmentId = val && segmentPageIndex % 2 === 1 ? documentStyle.evenPageHeaderId : documentStyle.defaultHeaderId;
                } else if (editArea === DocumentEditArea.FOOTER) {
                    needFocusSegmentId = val && segmentPageIndex % 2 === 1 ? documentStyle.evenPageFooterId : documentStyle.defaultFooterId;
                }
            }

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
        const renderObject = renderManagerService.getRenderById(unitId);
        if (renderObject == null) {
            return;
        }

        const { scene } = renderObject;
        const transformer = scene.getTransformerByCreate();
        const docSkeletonManagerService = renderObject.with(DocSkeletonManagerService);
        const skeleton = docSkeletonManagerService?.getSkeleton();
        const viewModel = docSkeletonManagerService?.getViewModel();
        const render = renderManagerService.getRenderById(unitId);

        if (render == null || viewModel == null || skeleton == null) {
            return;
        }

        // TODO: @JOCS, these codes bellow should be automatically executed?
        docSelectionManagerService.replaceTextRanges([]); // Clear text selection.
        transformer.clearSelectedObjects();
        docSelectionRenderService.setSegment('');
        docSelectionRenderService.setSegmentPage(-1);
        viewModel.setEditArea(DocumentEditArea.BODY);
        skeleton.calculate();
        render.mainComponent?.makeDirty(true);
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
        <div className={styles.options}>
            <div className={styles.optionsSection}>
                <div className={styles.optionsFormItem}>
                    <Checkbox
                        checked={options.useFirstPageHeaderFooter === BooleanNumber.TRUE}
                        onChange={(val) => { handleCheckboxChange(val as boolean, 'useFirstPageHeaderFooter'); }}
                    >
                        {localeService.t('headerFooter.firstPageCheckBox')}
                    </Checkbox>
                </div>
                <div className={styles.optionsFormItem}>
                    <Checkbox
                        checked={options.evenAndOddHeaders === BooleanNumber.TRUE}
                        onChange={(val) => { handleCheckboxChange(val as boolean, 'evenAndOddHeaders'); }}
                    >
                        {localeService.t('headerFooter.oddEvenCheckBox')}
                    </Checkbox>
                </div>
            </div>
            <div className={clsx(styles.optionsSection, styles.optionsMarginSetting)}>
                <div className={styles.optionsMarginItem}>
                    <span>{localeService.t('headerFooter.headerTopMargin')}</span>
                    <InputNumber
                        min={0}
                        max={200}
                        precision={1}
                        value={options.marginHeader}
                        onChange={(val) => { handleMarginChange(val as number, 'marginHeader'); }}
                        className={styles.optionsInput}
                    />
                </div>
                <div className={styles.optionsMarginItem}>
                    <span>{localeService.t('headerFooter.footerBottomMargin')}</span>
                    <InputNumber
                        min={0}
                        max={200}
                        precision={1}
                        value={options.marginFooter}
                        onChange={(val) => { handleMarginChange(val as number, 'marginFooter'); }}
                        className={styles.optionsInput}
                    />
                </div>
            </div>
            <div className={styles.optionsSection}>
                <Button onClick={closeHeaderFooter}>{localeService.t('headerFooter.closeHeaderFooter')}</Button>
            </div>
        </div>
    );
};

