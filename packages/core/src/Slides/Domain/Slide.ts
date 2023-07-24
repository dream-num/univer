import { CommandManager } from '../../Command';
import { ISlideData } from '../../Types/Interfaces';
import { SlideModel } from '../Model';

export class Slide {
    private model: SlideModel;

    constructor(private snapshot: Partial<ISlideData>, private commandManager: CommandManager) {
        this.model = new SlideModel(snapshot);
    }
}
