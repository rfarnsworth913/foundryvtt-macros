/* ==========================================================================
    Macro:         Stench
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Stench",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    itemData: lastArg.efData || {},
    origin:   lastArg.efData.origin || "",

    lastArg,
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "each") {

    console.warn("Testing");

    // Handle stop conditions -------------------------------------------------
    const creatureTypes = ["undead"];

    if (creatureTypes.some((creatureType) => {
        return (props.actorData.data.data.details.race ||
                props.actorData.data.data.details.type.value).toLowerCase().includes(creatureType);
    })) {
        console.warn("Undead exit");
        return false;
    }

    if (await getEffect({
        actorData:    props.actorData,
        effectLabel: "Rotfiend Stench Immunity"
    })) {
        console.warn("Effect Exit");
        return false;
    }

    // Request saving throw ---------------------------------------------------
    const savingThrow = await props.actorData.rollAbilitySave("con", { fastFoward: false });
    const saveDC      = 12;

    if (savingThrow.total < saveDC) {
        await wait (500);

        const effectData = {
            changes: [{
                key:      "macro.CE",
                mode:     0,
                value:    "Poisoned",
                priority: 20
            }],
            origin: props.origin,
            disabled: false,
            duration: {
                rounds:     1,
                seconds:    12,
                startRound: game.combat ? game.combat.round : 0,
                startTime:  game.time.worldTime
            },
            icon:  props.itemData.icon,
            label: props.itemData.label,
            flags: {
                dae: {
                    specialDuration: ["turnStart"]
                }
            }
        };

        await props.actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);
    } else {
        const effectData = {
            changes: [],
            origin: props.origin,
            disabled: false,
            duration: {
                rounds:     null,
                seconds:    86400,
                startRound: game.combat ? game.combat.round : 0,
                startTime:  game.time.worldTime
            },
            icon:  props.itemData.icon,
            label: "Rotfiend Stench Immunity"
        };

        await props.actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);
    }
}


// Request saving throw
// Apply poisoned condition
// Apply immunity effect


/* ==========================================================================
    Helpers
   ========================================================================== */

/**
* Logs the global properties for the Macro to the console for debugging purposes
*
* @param  {Object}  props  Global properties
*/
function logProps (props) {
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
 * Simple Async wait function
 *
 * @param    {number}   Number of milliseconds to wait
 * @returns  {Promise}  Promise to resolve
 */
async function wait (ms) {
    return new Promise((resolve) => {
        return setTimeout(resolve, ms);
    });
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
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    }));
}
