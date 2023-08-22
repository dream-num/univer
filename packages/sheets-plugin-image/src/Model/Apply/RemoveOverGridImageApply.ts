import { IImagePluginData } from '../../Symbol';
import { IRemoveImagePropertyData } from '../Action/RemoveOverGridImageAction';

export function RemoveOverGridImageApply(property: IRemoveImagePropertyData): void {
    const injector = property.injector;
    if (injector == null) {
        throw new Error('Error injector is null');
    }
    const imagePluginData = injector.get(IImagePluginData);
    imagePluginData.delete(property.id);
}
