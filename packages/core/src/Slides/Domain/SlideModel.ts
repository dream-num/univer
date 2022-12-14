import { nanoid } from 'nanoid';
import { SlideContext } from '../../Basics/SlideContext';
import { DEFAULT_SLIDE } from '../../Const';
import { ISlideData } from '../../Interfaces';

export class SlideModel {
    private _snapshot: ISlideData;

    private _context: SlideContext;

    private _unitId: string;

    constructor(snapshot: Partial<ISlideData>, context: SlideContext) {
        this._context = context;
        this._snapshot = { ...DEFAULT_SLIDE, ...snapshot };
        this._unitId = this._snapshot.id ?? nanoid(6);
    }

    getSnapshot() {
        return this._snapshot;
    }

    getUnitId(): string {
        return this._unitId;
    }
}
