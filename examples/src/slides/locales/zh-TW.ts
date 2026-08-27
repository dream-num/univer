import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/zh-TW';
import docsUI from '@univerjs/docs-ui/locale/zh-TW';
import slidesUI from '@univerjs/slides-ui/locale/zh-TW';
import ui from '@univerjs/ui/locale/zh-TW';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
