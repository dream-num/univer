import { UIObserver } from '../Interfaces';
import { Observable } from '../Observer/Observable';

export type UniverObserver<T> = {
    onUIChangeObservable: Observable<UIObserver<T>>;
    onUIDidMountObservable: Observable<boolean>;
    onAfterChangeUISkinObservable: Observable<string>;
    onAfterChangeUILocaleObservable: Observable<string>;
    onViewComponentFocusChange: Observable<void>;
    onAddSheet: Observable<void>;
    onDeleteSheet: Observable<void>;
    onHideSheet: Observable<void>;
    onToLeftSheet: Observable<void>;
    onToRightSheet: Observable<void>;
    onCopySheet: Observable<void>;
    onRemoveSheet: Observable<void>;
    onSheetColor: Observable<void>;
};
