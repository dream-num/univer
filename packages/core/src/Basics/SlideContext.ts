import { ISlideData } from '../Types/Interfaces/ISlideData';
import { SlideModel } from '../Slides/Domain/SlideModel';
import { ContextBase } from './ContextBase';

/**
 * Core context, mount important instances, managers
 */
export class SlideContext extends ContextBase {
    protected _slide: SlideModel;

    constructor(univerSlideData: Partial<ISlideData> = {}) {
        super();
        this._slide = new SlideModel(univerSlideData, this);
    }

    getSlide(): SlideModel {
        return this._slide;
    }

    protected _setObserver(): void {}
}
