import { IDrawing, LocaleService } from '@univerjs/core';

import { IDocumentSkeletonPage } from '../../../../Basics/IDocumentSkeletonCached';
import { IParagraphConfig, ISectionBreakConfig } from '../../../../Basics/Interfaces';

export function dealWidthInlineDrawing(
    drawing: IDrawing,
    sectionBreakConfig: ISectionBreakConfig,
    allPages?: IDocumentSkeletonPage[],
    paragraphConfig?: IParagraphConfig,
    localeService?: LocaleService
) {
    return [];
}
