import { GroupOpenType, StructGroup } from '../Controller/StructGroup';

/**
 *
 * @param structGroup
 * @param openType
 *
 * @internal
 */
export function SetCollapseAllRowGroups(structGroup: StructGroup, openType: GroupOpenType) {
    structGroup.setAllGroupOpenType(openType);
}
