export {
    CoverCommand,
    DeleteCommand,
    ICoverCommandParams,
    IDeleteCommandParams,
    IIMEInputCommandParams,
    IInsertCommandParams,
    IMEInputCommand,
    InsertCommand,
    IUpdateCommandParams,
    UpdateCommand,
} from './commands/commands/core-editing.command';
export * from './DocPlugin';
export * from './Locale';
export { DocsViewManagerService } from './services/docs-view-manager/docs-view-manager.service';
export { DocsView, DocsViewFactory } from './View/Render/Views/DocsView';
