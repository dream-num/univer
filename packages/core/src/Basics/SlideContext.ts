import { ISlideData } from '../Interfaces/ISlideData';
import { ContextBase } from './ContextBase';

/**
 * Core context, mount important instances, managers
 */
export class SlideContext extends ContextBase {
    constructor(univerSlideData: Partial<ISlideData> = {}) {
        super();
        this._locale.initialize(univerSlideData.locale);
    }

    protected _setObserver(): void {}
}
