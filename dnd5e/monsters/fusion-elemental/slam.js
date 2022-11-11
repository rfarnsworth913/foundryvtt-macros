/* ==========================================================================
    Macro:         Fusion Elemental Slam
    Source:        Custom
    Usage:         OnUse
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Fusion Elemental Slam",
    state: args[0]?.tag || args[0] || "unknown",
    pass:  args[0]?.macroPass || "",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.actor.items.get(lastArg.item._id),
    tokenData,

    target: canvas.tokens.get(lastArg.hitTargets[0].id),

    damageTypes: ["acid", "cold", "fire", "lightning"],

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (props.state === "OnUse" && props.pass === "preDamageRoll") {
    const index = Math.floor(Math.random() * props.damageTypes.length);
    await props.itemData.system.damage.parts.push(["2d8", props.damageTypes[index]]);
    attackAnimation(props.target, index);
}

if (props.state === "OnUse" && props.pass === "postActiveEffects") {
    await props.itemData.system.damage.parts.pop();
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
 * Plays an animation at the specified location based on damage type
 *
 * @param {string} target Target to be effected
 * @param {number} index  Animation to play
 */
function attackAnimation (target, index) {
    const animations = [
        "jb2a.fireball.explosion.dark_green",  // acid
        "jb2a.fireball.explosion.blue",        // cold
        "jb2a.fireball.explosion.orange",      // fire
        "jb2a.fireball.explosion.purple"       // lightning
    ];

    if ((game.modules.get("sequencer")?.active)) {
        new Sequence()
            .effect()
                .file(animations[index])
                .atLocation(target)
                .scaleToObject(1.25)
            .play();
    }
}
