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

import type { ComponentType } from 'react';
import type { LocaleKey } from '../../../locale/types';
import { BooleanNumber, LocaleService } from '@univerjs/core';
import { Button, Checkbox, InputNumber } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency, useObservable } from '@univerjs/ui';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import { useHeaderFooterOptions } from './use-header-footer-options';

export interface IDocHeaderFooterOptionsProps {
    unitId: string;
    ContentComponent?: ComponentType<{ unitId: string }>;
}

export const DocHeaderFooterOptions = (props: IDocHeaderFooterOptionsProps) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const docSelectionRenderService = renderManagerService.getRenderUnitById(props.unitId)!.with(DocSelectionRenderService)!;
    const segmentContext = useObservable(docSelectionRenderService.segmentContext$, {
        segmentId: docSelectionRenderService.getSegment(),
        segmentPage: docSelectionRenderService.getSegmentPage(),
    });

    const ContentComponent = props.ContentComponent ?? DocHeaderFooterOptionsContent;
    return <ContentComponent key={`${segmentContext?.segmentId ?? ''}:${segmentContext?.segmentPage ?? -1}`} {...props} />;
};

function DocHeaderFooterOptionsContent({ unitId }: { unitId: string }) {
    const localeService = useDependency(LocaleService);
    const { canLinkToPrevious, linkedToPrevious, options, handleLinkToPreviousChange, handleCheckboxChange, handleMarginChange, closeHeaderFooter } = useHeaderFooterOptions(unitId);
    return (
        <div className="univer-grid univer-gap-4">
            {canLinkToPrevious && (
                <div>
                    <Checkbox checked={linkedToPrevious} onChange={(val) => { handleLinkToPreviousChange(Boolean(val)); }}>
                        {localeService.t<LocaleKey>('docs-ui.headerFooter.linkToPrevious')}
                    </Checkbox>
                </div>
            )}
            <div className="univer-grid univer-gap-2">
                <div>
                    <Checkbox
                        checked={options.useFirstPageHeaderFooter === BooleanNumber.TRUE}
                        onChange={(val) => { handleCheckboxChange(Boolean(val), 'useFirstPageHeaderFooter'); }}
                    >
                        {localeService.t<LocaleKey>('docs-ui.headerFooter.firstPageCheckBox')}
                    </Checkbox>
                </div>
                <div>
                    <Checkbox
                        checked={options.evenAndOddHeaders === BooleanNumber.TRUE}
                        onChange={(val) => { handleCheckboxChange(Boolean(val), 'evenAndOddHeaders'); }}
                    >
                        {localeService.t<LocaleKey>('docs-ui.headerFooter.oddEvenCheckBox')}
                    </Checkbox>
                </div>
            </div>

            <div className="univer-mb-1 univer-flex">
                <div>
                    <span>{localeService.t<LocaleKey>('docs-ui.headerFooter.headerTopMargin')}</span>
                    <InputNumber
                        className="univer-mt-1.5 univer-w-4/5"
                        min={0}
                        max={200}
                        precision={1}
                        value={options.marginHeader}
                        onChange={(val) => { handleMarginChange(val ?? 0, 'marginHeader'); }}
                    />
                </div>
                <div>
                    <span>{localeService.t<LocaleKey>('docs-ui.headerFooter.footerBottomMargin')}</span>
                    <InputNumber
                        className="univer-mt-1.5 univer-w-4/5"
                        min={0}
                        max={200}
                        precision={1}
                        value={options.marginFooter}
                        onChange={(val) => { handleMarginChange(val ?? 0, 'marginFooter'); }}
                    />
                </div>
            </div>

            <div className="univer-flex univer-justify-end">
                <Button onClick={closeHeaderFooter}>
                    {localeService.t<LocaleKey>('docs-ui.headerFooter.closeHeaderFooter')}
                </Button>
            </div>
        </div>
    );
}
