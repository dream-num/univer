import { Inject } from '@wendellhu/redi';

import { NumfmtModalController } from '../Controller/NumfmtModalController';

export class NumfmtService {
    constructor(@Inject(NumfmtModalController) private _numfmtModalController: NumfmtModalController) {}

    showModal(type: string) {
        this._numfmtModalController.showModal(type, true);
    }
}
