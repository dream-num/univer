import { mergeLocales } from '@univerjs/core';
import design from '@univerjs/design/locale/ja-JP';
import docsUI from '@univerjs/docs-ui/locale/ja-JP';
import slidesUI from '@univerjs/slides-ui/locale/ja-JP';
import ui from '@univerjs/ui/locale/ja-JP';

export default mergeLocales(
    design,
    docsUI,
    slidesUI,
    ui
);
