import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { EmbedHostAnchorModelService } from '../services/embed-host-anchor-model.service';

const EMBED_HOST_ANCHOR_HOST_TYPES = [
    UniverInstanceType.UNIVER_DOC,
    UniverInstanceType.UNIVER_SHEET,
    UniverInstanceType.UNIVER_BASE,
    UniverInstanceType.UNIVER_SLIDE,
] as const;

export class EmbedHostAnchorCleanupController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(EmbedHostAnchorModelService) private readonly _anchorModelService: EmbedHostAnchorModelService
    ) {
        super();

        EMBED_HOST_ANCHOR_HOST_TYPES.forEach((type) => {
            this.disposeWithMe(
                this._univerInstanceService.getTypeOfUnitDisposed$(type).subscribe((unit) => {
                    this._anchorModelService.clearUnit(unit.getUnitId());
                })
            );
        });
    }
}
