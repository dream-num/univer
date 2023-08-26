import { createIdentifier } from "@wendellhu/redi";

export interface ILogService {

}

export const ILogService = createIdentifier<ILogService>('univer.log');
