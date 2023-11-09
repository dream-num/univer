import { Inject } from '@wendellhu/redi';

import { NumfmtModalController } from '../controllers/numfmt-modal-controller';

export class NumfmtService {
    constructor(@Inject(NumfmtModalController) private _numfmtModalController: NumfmtModalController) {}

    showModal(type: string) {
        this._numfmtModalController.showModal(type, true);
    }
}
