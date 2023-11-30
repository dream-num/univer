import { Disposable, ILogService } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { FUniver } from '../facade/facade';

/**
 * This service is to
 */
export class UniscriptExecutionService extends Disposable {
    constructor(
        @ILogService private readonly _logService: ILogService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
    }

    async execute(code: string): Promise<boolean> {
        this._logService.log('[UniscriptExecutionService]', 'executing Uniscript...');

        const facadeInstance = FUniver.newInstance(this._injector);
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const scriptFunction = new Function('Univer', `(() => {${code}})()`);

        try {
            scriptFunction(facadeInstance);
            return true;
        } catch (e) {
            this._logService.error(e);
            return false;
        }
    }
}
