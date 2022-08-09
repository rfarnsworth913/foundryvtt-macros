/* ==========================================================================
    Macro:         Deep Lead Bomb
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Deep Lead Bomb",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    targets: lastArg.hitTargets,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Request Saves --------------------------------------------------------------
const tokens = props.targets.map((token) => {
    return canvas.tokens.get(token.id);
});

await game.MonksTokenBar.requestRoll(tokens, {
    request:  "save:con",
    dc:       15,
    flavor:   "Deep Lead Poisoning",
    silent:   true,
    continue: "failed",
    rollMode: "request",
    callback: ({ tokenresults }) => {

        // Process failed tokens
        tokenresults.forEach(async (token) => {
            if (!token.passed) {
                const tokenData = await fromUuid(token.uuid);
                const actorData = tokenData.actor;
                const effectData = {
                    changes: [
                        {
                            key:      "macro.CE",
                            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value:    "Poisoned",
                            priority: 20
                        },
                        {
                            key:      "flags.midi-qol.OverTime",
                            mode:     CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                            value:    "turn=end,\nsaveAbility=con,\nsaveDC=15,\nlabel=\"Deep Lead Poisoning\"",
                            priority: 20
                        }
                    ],
                    label: "Deep Lead Poisoning",
                    icon:  "icons/svg/poison.svg",
                    tint:  "#06b003",
                    disabled: false,
                    duration: {
                        rounds:     10,
                        seconds:    60,
                        startRound: game.combat ? game.combat.round : 0,
                        startTime:  game.time.worldTime
                    }
                };

                await actorData.createEmbeddedDocuments("ActiveEffect", [effectData]);

                removeEffect({
                    actorData,
                    effectLabel: "Concentrating"
                });
            }
        });
    }
});


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
 * Removes an effect from a selected actor
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actor        Target actor
 * @param    {string}   effectLabel  Effect to be found on target actor
 * @returns  {Promise<Function>}     Deletion status of effect
 */
async function removeEffect ({ actorData, effectLabel = "" } = {}) {
    if (!actorData) {
        return console.error("No actor specified!");
    }

    const effect = actorData.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await actorData.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
}
