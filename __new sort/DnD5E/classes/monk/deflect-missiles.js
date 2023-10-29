/* ==========================================================================
    Macro:         Defect Missiles
    Source:        MidiQOL
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Defect Missiles",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    workflow: lastArg.workflowOptions,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse") {

    // Check for effect -------------------------------------------------------
    const effect = await getEffect({
        actorData:   props.actorData,
        effectLabel: "Deflect Missiles"
    });
    const change = effect.changes.find((change) => {
        return change.key === "flags.midi-qol.DR.rwak";
    });

    // Apply damage reduction -------------------------------------------------
    const dr = (await new Roll(change.value, props.actorData.getRollData()).evaluate({ async: true })).total;

    // Check Ki Points --------------------------------------------------------
    const kiPoints = await getResource({
        actorData: props.actorData,
        resource:  "Ki"
    });

    if (kiPoints.value === 0) {
        return false;
    }

    // Start throwback workflow -----------------------------------------------
    if (dr >= props.workflow.damageTotal) {
        const throwBack = await Dialog.confirm({
            title:   game.i18n.localize("Return Missile"),
            content: "<p>Throw the missile back at the attacker?</p>"
        });

        if (!throwBack) {
            return false;
        }

        await editResource({
            actorData: props.actorData,
            resource:  "Ki",
            value:     -1
        });

        const itemSource = await fromUuid(props.workflow.sourceAmmoUuid ?? props.workflow.sourceItemUuid);
        const itemData = itemSource.toObject();
        itemData.actionType = "rwak";
        itemData.system.range.value = 20;
        itemData.system.range.long = 40;
        itemData.system.consume = props.lastArg.itemData.system.consume;
        itemData.system.damage.parts[0][0] = props.actorData.getRollData().scale.monk["martial-arts"];

        console.warn(itemData);

        const tokenOrActor = await fromUuid(props.lastArg.actorUuid);
        const theActor = tokenOrActor.actor ?? tokenOrActor;
        const ownedItem = new CONFIG.Item.documentClass(itemData, { parent: theActor });

        const targetTokenOrActor = await fromUuid(props.workflow.sourceActorUuid);
        const targetActor = targetTokenOrActor.actor ?? targetTokenOrActor;
        const target = targetActor.token ?? targetActor.getActiveTokens()?.shift();
        await MidiQOL.completeItemRoll(ownedItem, {
            targetUuids: [target.uuid ?? target.document.uuid],
            workflowOptions: {
                notReaction: true,
                autoConsumeResource: "both"
            }
        });
    }
}


/* ==========================================================================
    Helpers
   ========================================================================== */

/**
* Logs the global properties for the Macro to the console for debugging purposes
*
* @param  {Object}  props  Global properties
*/
function logProps (props) {
    console.groupCollapsed("%cmacro" + `%c${props.name}`,
        "background-color: #333; color: #fff; padding: 3px 5px;",
        "background-color: #004481; color: #fff; padding: 3px 5px;");
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
 * Returns the specified effect
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
async function getEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    return (actorData.effects.find((effect) => {
        return effect.label.toLowerCase() === effectLabel.toLowerCase();
    }));
}

/**
 * Handles attempting to find a resource, and returning it
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor     Target actor to update
 * @param    {string}   resource  Name of resource to be updated
 * @returns  {Promise<any>}       Actor update handler
 */
async function getResource ({ actorData, resource = "" } = {}) {

    // Check actor and name
    if (!actorData || !resource) {
        return {};
    }

    // Attempt to find object on the specified actor
    const { resources } = actorData.toObject().system;

    const [key] = Object.entries(resources).find(([key, object]) => {
        return key === resource || object.label === resource;
    });

    return resources[key];
}

/**
 * Handles updating a global resource on the specified actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor     Target actor to update
 * @param    {string}   resource  Name of resource to be updated
 * @param    {number}   value     New value of the resource
 * @returns  {Promise<any>}       Actor update handler
 */
async function editResource ({ actorData, resource = "", value = 1 } = {}) {

    // Check actor and name
    if (!actorData || !resource) {
        return {};
    }

    // Attempt to find object on the specified actor
    const { resources } = actorData.toObject().system;
    const [key, object] = Object.entries(resources).find(([key, object]) => {
        return key === resource || object.label === resource;
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
