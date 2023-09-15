import { Observable } from '@univerjs/core';

import { ImagePlugin } from '../ImagePlugin';
import { IOverGridImageProperty } from './Interfaces';

export type ImagePluginObserve = {
    onChangeImageSize: Observable<IOverGridImageProperty>;
    onAddImage: Observable<IOverGridImageProperty>;
    onRemoveImage: Observable<IOverGridImageProperty>;
    onUpdateImage: Observable<IOverGridImageProperty>;
    onActiveImage: Observable<IOverGridImageProperty>;
};

export function uninstall(plugin: ImagePlugin) {
    plugin.deleteObserve('onChangeImageSize');
    plugin.deleteObserve('onAddImage');
    plugin.deleteObserve('onRemoveImage');
    plugin.deleteObserve('onUpdateImage');
    plugin.deleteObserve('onActiveImage');
}

export function install(plugin: ImagePlugin) {
    plugin.pushToObserve('onChangeImageSize');
    plugin.pushToObserve('onAddImage');
    plugin.pushToObserve('onRemoveImage');
    plugin.pushToObserve('onUpdateImage');
    plugin.pushToObserve('onActiveImage');
}
