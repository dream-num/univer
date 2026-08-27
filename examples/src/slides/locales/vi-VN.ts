import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/vi-VN';
import docsUI from '@univerjs/docs-ui/locale/vi-VN';
import slidesUI from '@univerjs/slides-ui/locale/vi-VN';
import ui from '@univerjs/ui/locale/vi-VN';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
