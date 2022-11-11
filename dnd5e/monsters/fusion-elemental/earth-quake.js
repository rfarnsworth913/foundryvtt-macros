/* ==========================================================================
    Macro:         Earthquake: Cracked Ground
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Earthquake - Cracked Ground",
    state: args[0]?.tag || args[0] || "unknown",
    pass:  args[0]?.macroPass || "",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("sequencer")?.active)) {
    return ui.notifications.error("Sequencer is required!");
}

// Update Targets to remove self ----------------------------------------------
if (props.state === "OnUse" && props.pass === "templatePlaced") {
    const newTargets = props.lastArg.targets.reduce((targets, target) => {
        if (target.actorId !== props.actorData.id) {
            targets.push(target);
        }

        return targets;
    }, []).map((token) => {
        return token.id;
    });

    game.user.updateTokenTargets(newTargets);
    game.user.broadcastActivity({ targets: newTargets });
}

// Handle Animation and Concentration Checks ----------------------------------
if (props.state === "OnUse" && props.pass === "postActiveEffects") {

    // Play Animation ---------------------------------------------------------
    new Sequence()
        .effect()
            .file("jb2a.ground_cracks.03.orange")
            .attachTo(props.tokenData)
            .belowTokens()
            .scaleToObject(3)
            .opacity(0.75)
            .fadeIn(300)
            .fadeOut(300)
        .play();

    // Request Saves for Concentration ----------------------------------------
    const targets = [];

    await props.lastArg.failedSaves.forEach(async (target) => {
        const token = canvas.tokens.get(target.id);
        const hasConcentration = await getEffect({
            actorData:   token.actor,
            effectLabel: "Concentrating"
        });

        if (hasConcentration) {
            targets.push(token);
        }
    }, []);

    if (targets.length === 0) {
        return false;
    }

    await game.MonksTokenBar.requestRoll(targets, {
        request:  "save:con",
        dc:       18,
        flavor:   "Earthquake",
        showdc:   false,
        continue: "failed",
        rollMode: "request",
        callback: async ({ tokenresults }) => {
            tokenresults.forEach(async (token) => {
                const actor = await fromUuid(token.uuid);
                await removeEffect({
                    actorData:   actor.actor,
                    effectLabel: "Concentrating"
                });
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
        return effect.label.toLowerCase() === effectLabel.toLowerCase();
    });

    console.warn(actorData, effect);

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects:   [effect.id]
    });
}
