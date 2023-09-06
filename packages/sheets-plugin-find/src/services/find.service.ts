import { Inject } from '@wendellhu/redi';

import { FindModalController } from '../Controller/FindModalController';

export class FindService {
    constructor(@Inject(FindModalController) private _findModalController: FindModalController) {}

    showModal(show: boolean) {
        this._findModalController.showModal(show);
    }
}
