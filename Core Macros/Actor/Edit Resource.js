/**
 * Handles updating a global resource on the specified actor
 *
 * @param    {object} [options]
 * @param    {Actor5e}  actor  Target actor to update
 * @param    {string}   name   Name of resource to be updated
 * @param    {number}   value  New value of the resource
 * @returns  {Promise<any>}    Actor update handler
 */
async function editResource ({ actorData, name = "", value = 1} = {}) {

    // Check actor and name
    if (!actorData || !name) {
        return {};
    }

    // Attempt to find object on the specified actor
    let resources = actorData.toObject().data.resources;
    let [key, object] = Object.entries(resources).find(([key, object]) => {
        return key === name || object.label === name;
    });

    if (!key || !object) {
        return {};
    }

    // Attempt to update the resource with the specified value
    if (!object.value || !object.max) {
        object.value = object.max = value;
    } else {
        object.value = Math.clamped(object.value + value, 0, object.max);
    }

    resources[key] = object;

    return await actorData.update({ "data.resources": resources });
}
