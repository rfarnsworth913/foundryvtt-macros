/* ==========================================================================
    Macro:              Regenerate
    Description:        Handles regeneration on target
    Source:             https://github.com/kandashi/Macros/blob/master/Spell%20Macros/7th%20Level/Regenerate.js
    Usage:              DAE ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Apply Effect -----------------------------------------------------------
    if (props.state === "on") {

        // Create time hook
        const timeHookID = Hooks.on("updateWorldTime", async (currentTime, updateInterval) => {
            const effect = await getEffect({
                actorData:   props.actorData,
                effectLabel: "Regenerate"
            });

            const applyTime  = effect.data.duration.startTime;
            const expireTime = applyTime + effect.data.duration.seconds;
            const healing    = roundCount(currentTime, updateInterval, applyTime, expireTime);

            props.actorData.applyDamage(-healing);

            if (game.combat) {
                ChatMessage.create({
                    content: `${props.actorData.name} gains 1 hp.`
                });
            }
        });

        props.actorData.setFlag("world", "Regenerate", {
            timeHook: timeHookID
        });
    }


    // Remove Effect ----------------------------------------------------------
    if (props.state === "off") {
        const flag = await props.actorData.getFlag("world", "Regenerate");
        Hooks.off("updateWorldTime", flag.timeHook);
        props.actorData.unsetFlag("world", "Regenerate");
    }


})();


/**
 * Calculates the rounds that have passed since the spell was cast.
 *
 * @param  {Number}  currentTime     Current world time
 * @param  {Number}  updateInterval  Amount the world time was incremented
 * @param  {Number}  applyTime       Time the effect was applied
 * @param  {Number}  expireTime      Time the effect should expire
 * @returns                          Current round count
 */
function roundCount (currentTime, updateInterval, applyTime, expireTime) {

    // Don't count time before applyTime
    if (currentTime - updateInterval < applyTime) {
        let offset = applyTime - (currentTime - updateInterval);
        updateInterval -= offset;
    }

    // Don't count time after expireTime
    if (currentTime > expireTime) {
        let offset = currentTime - expireTime;
        currentTime = expireTime;
        updateInterval -= offset;
    }

    let sTime      = currentTime - updateInterval;
    let firstRound = sTime + 6 - (sTime % 6);
    let lastRound  = currentTime - (currentTime % 6);
    let roundCount = 0;

    if (lastRound >= firstRound) {
        roundCount = (lastRound - firstRound) / 6 + 1;
    }

    return roundCount;
}

/**
 * Returns the specified effect
 *
 * @param    {object}   [options]
 * @param    {Actor5e}  actorData     Target Actor
 * @param    {string}   effectLabel   Effect to be found on target actor
 * @returns  {Promise<ActiveEffect>}  Effect
 */
async function getEffect({ actorData, effectLabel = `` } = {}) {
    if (!actorData) {
        return console.error(`No actor specified!`);
    }

    return (actorData.effects.find((effect) => {
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase()
    }));
}


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
function getProps () {
    const lastArg   = args[args.length - 1];
    const tokenData = canvas.tokens.get(lastArg.tokenId) || {};

    return {
        name:  `Regenerate`,
        state: args[0] || ``,

        actorData: tokenData.actor || {},
        tokenData

    };
}

/**
* Logs the extracted property values to the console for debugging purposes
*/
function logProps (props, title) {
    console.group(`${title} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
* Takes the properties object and validates that all specified values have been defined before trying to execute
* the macro
*
* @param  props  Properties to be evaluated
*/
function validateProps (props) {
    let missingProps = [];

    Object.keys(props).forEach((key) => {
        if (props[key] === undefined || props[key] === null) {
            missingProps.push(key);
        }
    });

    if (missingProps.length > 0) {
        ui.notifications.error(`The following parameters are invalid: ${missingProps.join(", ")}`);
        return false;
    }

    return true;
}
