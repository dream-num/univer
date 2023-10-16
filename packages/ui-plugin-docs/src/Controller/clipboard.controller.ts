import { Disposable, ICommandService, IUniverInstanceService } from '@univerjs/core';

import { DocCopyCommand } from '../commands/commands/clipboard.command';
import { IDocClipboardService } from '../services/clipboard/clipboard.service';

export class DocClipboardController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IDocClipboardService private readonly _docClipboardService: IDocClipboardService
    ) {
        super();
    }

    initialize() {
        [DocCopyCommand, DocCopyCommand, DocCopyCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerAsMultipleCommand(command))
        );
    }
}
