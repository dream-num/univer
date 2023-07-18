import { UIObserver } from '../Types/Interfaces';
import { Observable } from '../Observer/Observable';

export type UniverObserver<T> = {
    onUIChangeObservable: Observable<UIObserver<T>>;
    onUIDidMountObservable: Observable<boolean>;
    onAfterChangeUISkinObservable: Observable<string>;
    onAfterChangeUILocaleObservable: Observable<string>;
    onViewComponentFocusChange: Observable<void>;
};
