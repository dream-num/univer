import { Observable } from '@univer/core';
import { OverGridImagePlugin, OverGridImageProperty } from '../OverGridImagePlugin';

export type ImagePluginObserve = {
    onChangeImageSize: Observable<OverGridImageProperty>;
    onAddImage: Observable<OverGridImageProperty>;
    onRemoveImage: Observable<OverGridImageProperty>;
    onUpdateImage: Observable<OverGridImageProperty>;
    onActiveImage: Observable<OverGridImageProperty>;
};

export function uninstall(plugin: OverGridImagePlugin) {
    plugin.deleteObserve('onChangeImageSize');
    plugin.deleteObserve('onAddImage');
    plugin.deleteObserve('onRemoveImage');
    plugin.deleteObserve('onUpdateImage');
    plugin.deleteObserve('onActiveImage');
}

export function install(plugin: OverGridImagePlugin) {
    plugin.pushToObserve('onChangeImageSize');
    plugin.pushToObserve('onAddImage');
    plugin.pushToObserve('onRemoveImage');
    plugin.pushToObserve('onUpdateImage');
    plugin.pushToObserve('onActiveImage');
}
