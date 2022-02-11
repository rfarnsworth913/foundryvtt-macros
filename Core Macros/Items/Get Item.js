/**
 * Returns a collection of items that have the specified label
 *
 * @param    {Actor5e}    actorData  Actor to be operated on
 * @param    {String}     itemLabel  Item name to be found
 * @returns  Array<Item>             Collection of items matching the label
 */
 async function getItems (actorData, itemLabel = ``) {
    if (!actorData) {
        return null;
    }

    return (actorData.items.filter((item) => {
        return item.name?.toLowerCase() === itemLabel.toLowerCase();
    }));
}
