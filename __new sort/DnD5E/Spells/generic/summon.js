/* ==========================================================================
    Macro:         Summon
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Summon",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.itemData,

    duration: {
        seconds:    60,
        startRound: game.combat ? game.combat.round : 0,
        startTime:  game.time.worldTime
    },
    summonName: "",

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check Requirements ---------------------------------------------------------
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

if (props.state === "OnUse") {

    // Perform summon ---------------------------------------------------------
    const updates  = {};
    const summoned = await warpgate.spawn(props.summonName, { embedded: updates }, {}, {});


    // Add tracking flag ------------------------------------------------------
    if (summoned.length !== 1) {
        return false;
    }

    const summonedID = `Scene.${canvas.scene.id}.Token.${summoned[0]}`;
    const effectData = {
        changes: [{
            key:      "flags.dae.deleteUuid",
            mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value:    summonedID,
            priority: 30
        }],
        label:    `${props.summonName} Summon`,
        duration: props.duration,
        origin:   props.itemData.uuid,
        icon:     props.itemData.img
    };

    await createEffects({
        actorData: props.actorData,
        effects:   [effectData]
    });
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
 * Creates an effect on a selected actor
 *
 * @param    {object}         [options]
 * @param    {Actor5e}        actor        Target actor
 * @param    {Array<object>}  effects  Effects to be applied to target
 * @returns  {Promise<Function>}       Deletion status of effect
 */
async function createEffects ({ actorData, effects = [] } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    if (!effects || effects.length === 0) {
        return console.error("No effects specified");
    }

    return await MidiQOL.socket().executeAsGM("createEffects", {
        actorUuid: actorData.uuid,
        effects
    });
}
