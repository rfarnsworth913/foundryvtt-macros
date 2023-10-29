/* ==========================================================================
    Macro:         Color Spray
    Source:        https://www.patreon.com/posts/color-spray-73242885
    Usage:         DAE On Use
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Color Spray",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData:  lastArg.item,
    tokenData,

    colorHP: lastArg.damageTotal,
    immuneConditions: ["blinded"],

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
const targets = props.lastArg.targets.filter((target) => {
    return target.actor.getRollData().attributes.hp.value > 0;
}).sort((a, b) => {
    return canvas.tokens.get(a.id).actor.getRollData().attributes.hp.value <
        canvas.tokens.get(b.id).actor.getRollData().attributes.hp.value ? -1 : 1;
});
let remainingColorHP = props.colorHP;
const colorTargets = [];


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
