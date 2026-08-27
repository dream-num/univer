import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/zh-CN';
import docsUI from '@univerjs/docs-ui/locale/zh-CN';
import slidesUI from '@univerjs/slides-ui/locale/zh-CN';
import ui from '@univerjs/ui/locale/zh-CN';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
