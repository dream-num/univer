import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/zh-HK';
import docsUI from '@univerjs/docs-ui/locale/zh-HK';
import slidesUI from '@univerjs/slides-ui/locale/zh-HK';
import ui from '@univerjs/ui/locale/zh-HK';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
