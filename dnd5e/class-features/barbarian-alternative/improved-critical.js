/* ==========================================================================
    Macro:         Improved Critical
    Source:        Custom
    Usage:         DAE Macro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Improved Critical",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.item,
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "on") {
    const hookID = Hooks.on("midi-qol.preAttackRoll", async (workflow) => {

        // Validate item type and ability modifier
        const itemData = workflow.item;
        if (itemData.type !== "weapon" && itemData.system.abilityMod !== "str") {
            return;
        }

        // Calculate new critical range
        let criticalRange = itemData.system.critical.threshold ? itemData.system.critical.threshold : 20;
        const scaleValue = props.actorData.getRollData()?.scale?.barbarian?.["improved-critical"] || 1;
        criticalRange -= scaleValue;

        const effect = {
            changes: [{
                key:      "flags.dnd5e.weaponCriticalThreshold",
                mode:     CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value:    criticalRange,
                priority: 20
            }],
            origin: itemData.uuid,
            disabled: false,
            flags: {
                dae: {
                    specialDuration: ["1Attack"]
                }
            },
            duration: {
                seconds:    6,
                startRound: game.combat ? game.combat.round : 0,
                startTime:  game.time.worldTime
            },
            label: "Improved Critical",
            icon:  props.itemData.img
        };

        await createEffects({
            actorData: props.actorData,
            effects:   [effect]
        });
    });

    DAE.setFlag(props.actorData, "improvedCritical", hookID);
}

if (props.state === "off") {
    const hookID = DAE.getFlag(props.actorData, "improvedCritical");
    DAE.unsetFlag(props.actorData, "improvedCritical");

    Hooks.off("midi-qol.preAttackRoll", hookID);
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
