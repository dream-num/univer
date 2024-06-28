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
import React, { useEffect, useState } from 'react';
import { Button, Checkbox, InputNumber } from '@univerjs/design';
import { BooleanNumber, ICommandService, IUniverInstanceService, LocaleService, Tools } from '@univerjs/core';
import clsx from 'clsx';
import { DocumentEditArea, IRenderManagerService, ITextSelectionRenderManager } from '@univerjs/engine-render';
import { DocSkeletonManagerService, TextSelectionManagerService } from '@univerjs/docs';
import { CoreHeaderFooterCommandId, type IHeaderFooterProps } from '../../../commands/commands/doc-header-footer.command';
import styles from './index.module.less';

export interface IDocHeaderFooterOptionsProps {
    unitId: string;
}

export const DocHeaderFooterOptions = (props: IDocHeaderFooterOptionsProps) => {
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const commandService = useDependency(ICommandService);
    const textSelectionRenderService = useDependency(ITextSelectionRenderManager);
    const textSelectionManagerService = useDependency(TextSelectionManagerService);
    const { unitId } = props;

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
        if (type === 'useFirstPageHeaderFooter' && val === true) {
            if (editArea === DocumentEditArea.HEADER && !documentStyle.firstPageHeaderId) {
                needCreateHeaderFooter = true;
            } else if (editArea === DocumentEditArea.FOOTER && !documentStyle.firstPageFooterId) {
                needCreateHeaderFooter = true;
            }
        }

        if (type === 'evenAndOddHeaders' && val === true) {
            if (editArea === DocumentEditArea.HEADER && !documentStyle.evenPageHeaderId) {
                needCreateHeaderFooter = true;
            } else if (editArea === DocumentEditArea.FOOTER && !documentStyle.evenPageFooterId) {
                needCreateHeaderFooter = true;
            }
        }

        if (needCreateHeaderFooter) {
            const SEGMENT_ID_LEN = 6;
            const segmentId = Tools.generateRandomId(SEGMENT_ID_LEN);
            // Set segment id first, then exec command.
            textSelectionRenderService.setSegment(segmentId);
            commandService.executeCommand(CoreHeaderFooterCommandId, {
                unitId,
                segmentId,
                headerFooterProps: {
                    [type]: val ? BooleanNumber.TRUE : BooleanNumber.FALSE,
                },
            });
        } else {
            commandService.executeCommand(CoreHeaderFooterCommandId, {
                unitId,
                headerFooterProps: {
                    [type]: val ? BooleanNumber.TRUE : BooleanNumber.FALSE,
                },
            });
        }
    };

    const handleMarginChange = (val: number, type: 'marginHeader' | 'marginFooter') => {
        setOptions((prev) => ({
            ...prev,
            [type]: val,
        }));

        commandService.executeCommand(CoreHeaderFooterCommandId, {
            unitId,
            headerFooterProps: {
                [type]: val,
            },
        });
    };

    const closeHeaderFooter = () => {
        const docSkeletonManagerService = renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService);
        const skeleton = docSkeletonManagerService?.getSkeleton();
        const viewModel = docSkeletonManagerService?.getViewModel();
        const render = renderManagerService.getRenderById(unitId);

        if (render == null || viewModel == null || skeleton == null) {
            return;
        }

        // TODO: @JOCS, these codes bellow should be automatically executed?
        textSelectionManagerService.replaceTextRanges([]); // Clear text selection.
        textSelectionRenderService.setSegment('');
        textSelectionRenderService.setSegmentPage(-1);
        viewModel.setEditArea(DocumentEditArea.BODY);
        skeleton.calculate();
        render.mainComponent?.makeDirty(true);
    };

    useEffect(() => {
        const docDataModel = univerInstanceService.getUniverDocInstance(unitId);
        const documentStyle = docDataModel?.getSnapshot().documentStyle;

        if (documentStyle) {
            const { marginHeader, marginFooter, useFirstPageHeaderFooter, evenAndOddHeaders } = documentStyle;

            setOptions({
                marginHeader,
                marginFooter,
                useFirstPageHeaderFooter,
                evenAndOddHeaders,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        precision={1}
                        value={options.marginHeader}
                        onChange={(val) => { handleMarginChange(val as number, 'marginHeader'); }}
                        className={styles.optionsInput}
                    />
                </div>
                <div className={styles.optionsMarginItem}>
                    <span>{localeService.t('headerFooter.footerBottomMargin')}</span>
                    <InputNumber
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

