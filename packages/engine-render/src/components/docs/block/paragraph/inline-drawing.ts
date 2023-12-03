import { IDrawing, LocaleService } from '@univerjs/core';

import { IDocumentSkeletonPage } from '../../../../basics/i-document-skeleton-cached';
import { IParagraphConfig, ISectionBreakConfig } from '../../../../basics/interfaces';

export function dealWidthInlineDrawing(
    drawing: IDrawing,
    sectionBreakConfig: ISectionBreakConfig,
    allPages?: IDocumentSkeletonPage[],
    paragraphConfig?: IParagraphConfig,
    localeService?: LocaleService
) {
    return [];
}
