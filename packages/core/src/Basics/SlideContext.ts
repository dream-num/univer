import { CommandManager } from '../Command/CommandManager';
import { Slide } from '../Slides/Domain/Slide';
import { ISlideData } from '../Types/Interfaces/ISlideData';
import { ContextBase } from './ContextBase';

/**
 * Core context, mount important instances, managers
 */
export class SlideContext extends ContextBase {
    protected _slide: Slide;

    constructor(private snapshot: Partial<ISlideData> = {}, private commandManager: CommandManager) {
        super();
        this._slide = new Slide(snapshot, commandManager);
    }

    getSlide(): Slide {
        return this._slide;
    }

    protected _setObserver(): void {}
}
