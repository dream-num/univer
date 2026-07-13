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

import type { DocumentDataModel, IDocumentStyle } from '@univerjs/core';
import type { IHeaderFooterProps } from '@univerjs/docs';
import type { IDocumentSkeletonPage } from '@univerjs/engine-render';
import type { LocaleKey } from '../../../locale/types';
import {
    BooleanNumber,
    generateRandomId,
    getSectionHeaderFooterReferenceKey,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    resolveSectionHeaderFooterReference,
    UniverInstanceType,
} from '@univerjs/core';
import { Button, Checkbox, InputNumber } from '@univerjs/design';
import { DocSkeletonManagerService, SetSectionHeaderFooterLinkCommand } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { ILayoutService, useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';
import {
    CloseHeaderFooterCommand,
    CoreHeaderFooterCommandId,
} from '../../../commands/commands/doc-header-footer.command';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import { getDocPageSectionContext } from '../../../utils/section-header-footer';

function getSegmentId(documentStyle: IDocumentStyle, editArea: DocumentEditArea, pageIndex: number, page?: IDocumentSkeletonPage): string {
    const {
        useFirstPageHeaderFooter,
        evenAndOddHeaders,
        defaultHeaderId,
        defaultFooterId,
        firstPageHeaderId,
        firstPageFooterId,
        evenPageHeaderId,
        evenPageFooterId,
    } = documentStyle;
    const isFirstPage = page ? page.pageNumber === page.pageNumberStart : pageIndex === 0;
    const isEvenPage = page ? page.pageNumber % 2 === 0 : pageIndex % 2 === 1;

    if (editArea === DocumentEditArea.HEADER) {
        if (useFirstPageHeaderFooter === BooleanNumber.TRUE) {
            if (isFirstPage) {
                return firstPageHeaderId!;
            } else {
                return evenAndOddHeaders === BooleanNumber.TRUE && isEvenPage ? evenPageHeaderId! : defaultHeaderId!;
            }
        } else {
            return evenAndOddHeaders === BooleanNumber.TRUE && isEvenPage ? evenPageHeaderId! : defaultHeaderId!;
        }
    } else {
        if (useFirstPageHeaderFooter === BooleanNumber.TRUE) {
            if (isFirstPage) {
                return firstPageFooterId!;
            } else {
                return evenAndOddHeaders === BooleanNumber.TRUE && isEvenPage ? evenPageFooterId! : defaultFooterId!;
            }
        } else {
            return evenAndOddHeaders === BooleanNumber.TRUE && isEvenPage ? evenPageFooterId! : defaultFooterId!;
        }
    }
}

export interface IDocHeaderFooterOptionsProps {
    unitId: string;
}

export const DocHeaderFooterOptions = (props: IDocHeaderFooterOptionsProps) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const docSelectionRenderService = renderManagerService.getRenderById(props.unitId)!.with(DocSelectionRenderService)!;
    const segmentContext = useObservable(docSelectionRenderService.segmentContext$, {
        segmentId: docSelectionRenderService.getSegment(),
        segmentPage: docSelectionRenderService.getSegmentPage(),
    });

    return <DocHeaderFooterOptionsContent key={`${segmentContext?.segmentId ?? ''}:${segmentContext?.segmentPage ?? -1}`} {...props} />;
};

function DocHeaderFooterOptionsContent(props: IDocHeaderFooterOptionsProps) {
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);
    const commandService = useDependency(ICommandService);

    const layoutService = useDependency(ILayoutService);

    const { unitId } = props;

    const docSelectionRenderService = renderManagerService.getRenderById(unitId)!.with(DocSelectionRenderService)!;
    const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);

    const getCurrentSectionContext = () => {
        const snapshot = docDataModel?.getSnapshot();
        const docSkeletonManagerService = renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService);
        const page = docSkeletonManagerService?.getSkeleton?.()?.getSkeletonData()?.pages[docSelectionRenderService.getSegmentPage()];
        return snapshot == null ? undefined : { ...getDocPageSectionContext(snapshot, page), page };
    };
    const [options, setOptions] = useState<IHeaderFooterProps>(() => {
        const config = getCurrentSectionContext()?.config;
        return {
            marginHeader: config?.marginHeader ?? 0,
            marginFooter: config?.marginFooter ?? 0,
            useFirstPageHeaderFooter: config?.useFirstPageHeaderFooter ?? BooleanNumber.FALSE,
            evenAndOddHeaders: config?.evenAndOddHeaders ?? BooleanNumber.FALSE,
        };
    });
    const sectionContext = getCurrentSectionContext();
    const editArea = renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService)?.getViewModel()?.getEditArea();
    const headerFooterKind = editArea === DocumentEditArea.FOOTER ? 'footer' : 'header';
    const variant = getHeaderFooterVariant(
        sectionContext?.config ?? {},
        docSelectionRenderService.getSegmentPage(),
        sectionContext?.page
    );
    const referenceKey = getSectionHeaderFooterReferenceKey(headerFooterKind, variant);
    const canLinkToPrevious = (sectionContext?.sectionIndex ?? -1) > 0;
    const [linkedToPrevious, setLinkedToPrevious] = useState(
        canLinkToPrevious && !sectionContext?.section?.[referenceKey]
    );

    const handleCheckboxChange = (val: boolean, type: 'useFirstPageHeaderFooter' | 'evenAndOddHeaders') => {
        setOptions((prev) => ({
            ...prev,
            [type]: val ? BooleanNumber.TRUE : BooleanNumber.FALSE,
        }));

        const sectionContext = getCurrentSectionContext();
        const documentStyle = sectionContext?.config;
        const docSkeletonManagerService = renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService);
        const viewModel = docSkeletonManagerService?.getViewModel();

        if (documentStyle == null || viewModel == null) {
            return;
        }

        const editArea = viewModel.getEditArea();

        let needCreateHeaderFooter = false;
        const segmentPage = docSelectionRenderService.getSegmentPage();
        const isFirstSectionPage = sectionContext?.page
            ? sectionContext.page.pageNumber === sectionContext.page.pageNumberStart
            : segmentPage === 0;
        const isEvenPage = sectionContext?.page ? sectionContext.page.pageNumber % 2 === 0 : segmentPage % 2 === 1;
        let needChangeSegmentId = false;
        if (type === 'useFirstPageHeaderFooter' && val === true) {
            if (editArea === DocumentEditArea.HEADER && !documentStyle.firstPageHeaderId) {
                needCreateHeaderFooter = true;
            } else if (editArea === DocumentEditArea.FOOTER && !documentStyle.firstPageFooterId) {
                needCreateHeaderFooter = true;
            }

            if (needCreateHeaderFooter && isFirstSectionPage) {
                needChangeSegmentId = true;
            }
        }

        if (type === 'evenAndOddHeaders' && val === true) {
            if (editArea === DocumentEditArea.HEADER && !documentStyle.evenPageHeaderId) {
                needCreateHeaderFooter = true;
            } else if (editArea === DocumentEditArea.FOOTER && !documentStyle.evenPageFooterId) {
                needCreateHeaderFooter = true;
            }

            if (needCreateHeaderFooter && isEvenPage) {
                needChangeSegmentId = true;
            }
        }

        if (needCreateHeaderFooter) {
            const SEGMENT_ID_LEN = 6;
            const segmentId = generateRandomId(SEGMENT_ID_LEN);
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
                sectionId: sectionContext?.sectionId,
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
                segmentPageIndex,
                sectionContext?.page
            );

            if (needFocusSegmentId && needFocusSegmentId !== prevSegmentId) {
                docSelectionRenderService.setSegment(needFocusSegmentId);
            }

            commandService.executeCommand(CoreHeaderFooterCommandId, {
                unitId,
                headerFooterProps: {
                    [type]: val ? BooleanNumber.TRUE : BooleanNumber.FALSE,
                },
                sectionId: sectionContext?.sectionId,
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
            sectionId: getCurrentSectionContext()?.sectionId,
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

    const handleLinkToPreviousChange = async (linked: boolean) => {
        const context = getCurrentSectionContext();
        if (!context?.sectionId || context.sectionIndex <= 0 || !docDataModel) {
            return;
        }
        const currentEditArea = renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService)?.getViewModel()?.getEditArea();
        const kind = currentEditArea === DocumentEditArea.FOOTER ? 'footer' : 'header';
        const currentVariant = getHeaderFooterVariant(context.config, docSelectionRenderService.getSegmentPage(), context.page);
        const key = getSectionHeaderFooterReferenceKey(kind, currentVariant);
        const segmentId = generateRandomId(6);
        const previousSegmentId = resolveSectionHeaderFooterReference(
            docDataModel.getDocumentStyle(),
            context.sections,
            context.sectionIndex - 1,
            key
        ).segmentId;
        const success = await commandService.executeCommand(SetSectionHeaderFooterLinkCommand.id, {
            unitId,
            sectionId: context.sectionId,
            kind,
            variant: currentVariant,
            linkedToPrevious: linked,
            ...(linked ? {} : { segmentId }),
        });
        if (!success) {
            return;
        }
        setLinkedToPrevious(linked);
        docSelectionRenderService.setSegment(linked ? previousSegmentId ?? '' : segmentId);
        layoutService.focus();
    };

    return (
        <div className="univer-grid univer-gap-4">
            {canLinkToPrevious && (
                <div>
                    <Checkbox checked={linkedToPrevious} onChange={(val) => { handleLinkToPreviousChange(val as boolean); }}>
                        {localeService.t<LocaleKey>('docs-ui.headerFooter.linkToPrevious')}
                    </Checkbox>
                </div>
            )}
            <div className="univer-grid univer-gap-2">
                <div>
                    <Checkbox
                        checked={options.useFirstPageHeaderFooter === BooleanNumber.TRUE}
                        onChange={(val) => { handleCheckboxChange(val as boolean, 'useFirstPageHeaderFooter'); }}
                    >
                        {localeService.t<LocaleKey>('docs-ui.headerFooter.firstPageCheckBox')}
                    </Checkbox>
                </div>
                <div>
                    <Checkbox
                        checked={options.evenAndOddHeaders === BooleanNumber.TRUE}
                        onChange={(val) => { handleCheckboxChange(val as boolean, 'evenAndOddHeaders'); }}
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
                        onChange={(val) => { handleMarginChange(val as number, 'marginHeader'); }}
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
                        onChange={(val) => { handleMarginChange(val as number, 'marginFooter'); }}
                    />
                </div>
            </div>

            <div className="univer-flex univer-justify-end">
                <Button onClick={closeHeaderFooter}>{localeService.t<LocaleKey>('docs-ui.headerFooter.closeHeaderFooter')}</Button>
            </div>
        </div>
    );
}

function getHeaderFooterVariant(documentStyle: IDocumentStyle, pageIndex: number, page?: IDocumentSkeletonPage) {
    const isFirstPage = page ? page.pageNumber === page.pageNumberStart : pageIndex === 0;
    const isEvenPage = page ? page.pageNumber % 2 === 0 : pageIndex % 2 === 1;
    if (documentStyle.useFirstPageHeaderFooter === BooleanNumber.TRUE && isFirstPage) {
        return 'first' as const;
    }
    if (documentStyle.evenAndOddHeaders === BooleanNumber.TRUE && isEvenPage) {
        return 'even' as const;
    }
    return 'default' as const;
}
