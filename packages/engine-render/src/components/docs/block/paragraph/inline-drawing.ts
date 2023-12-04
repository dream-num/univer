import type { IDrawing, LocaleService } from '@univerjs/core';

import type { IDocumentSkeletonPage } from '../../../../basics/i-document-skeleton-cached';
import type { IParagraphConfig, ISectionBreakConfig } from '../../../../basics/interfaces';

export function dealWidthInlineDrawing(
    drawing: IDrawing,
    sectionBreakConfig: ISectionBreakConfig,
    allPages?: IDocumentSkeletonPage[],
    paragraphConfig?: IParagraphConfig,
    localeService?: LocaleService
) {
    return [];
}
