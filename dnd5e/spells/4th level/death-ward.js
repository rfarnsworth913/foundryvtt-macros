/* ==========================================================================
    Macro:         Death Ward
    Source:        https://github.com/chrisk123999/foundry-macros/blob/main/Spells/Death%20Ward/Chris-DeathWardWorld.js
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Death War",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (props.state === "on") {
    const hookID = Hooks.on("midi-qol.damageApplied", async (token, { item, workflow, dItem }) => {
        const effect = token.actor.effects.find((effect) => {
            return effect.data.label === "Death Ward";
        });

        if (!effect || dItem.newHP !== 0) {
            return;
        }

        dItem.newHP = 1;
        dItem.hpDamage = Math.abs(dItem.newHP - dItem.oldHP);
        await MidiQOL.socket().executeAsGM("removeEffects", {
            actorUuid: effect.parent.uuid,
            effects: [effect.id]
        });
    });

    DAE.setFlag(props.actorData, "deathWard", hookID);
}

if (props.state === "off") {
    const hookID = DAE.getFlag(props.actorData, "deathWard");
    DAE.unsetFlag(props.actorData, "deathWard");

    Hooks.off("updateActor", hookID);
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
