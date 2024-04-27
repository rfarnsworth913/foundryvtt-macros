/* ==========================================================================
    Macro:         Infectus Bite
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Infectus Bite",
    state: args[0]?.tag || args[0] || "unknown",
    macroPass: args[0]?.macroPass || "",

    actorData: tokenData?.actor || {},
    itemData: lastArg.itemData,
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.state === "OnUse" && props.macroPass === "postActiveEffects") {
    const targets = props.lastArg.hitTargets;

    if (targets.length === 0) {
        return false;
    }

    await game.MonksTokenBar.requestRoll(targets, {
        request:  "save:con",
        dc:       11,
        flavor:   "Infected Bite",
        showdc:   false,
        silent:   true,
        continue: "failed",
        rollMode: "request",
        callback: async ({ tokenresults }) => {
            if (tokenresults[0].passed) {
                return false;
            }

            const effectData = {
                changes: [
                    {
                        key:      "StatusEffect",
                        value:    "Convenient Effect: Diseased",
                        mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                        priority: 20
                    },
                    {
                        key:      "system.traits.di.value",
                        value:    "healing",
                        mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
                        priority: 20
                    },
                    {
                        key:      "system.attributes.hp.max",
                        value:    "-1",
                        mode:     CONST.ACTIVE_EFFECT_MODES.ADD,
                        priority: 20
                    }
                ],
                label: "Infected Bite (Disease)",
                duration: {
                    seconds:   604800,
                    startTime: game.time.worldTime
                },
                origin: props.itemData.uuid,
                icon:   "icons/svg/biohazard.svg"
            };

            await createEffects({
                actorData: targets[0].actor,
                effects:   [effectData]
            });
        }
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
