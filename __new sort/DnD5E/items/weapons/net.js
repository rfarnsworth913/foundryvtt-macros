/* ==========================================================================
    Macro:         Net
    Source:        Custom
    Usage:         DAE ItemMacro {{ Token Name }} @item
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Net",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    summonLabel: `${args[2]?.name?.replace(" ", "_")}_Summoned_Token`,
    summonToken: args[1] || "",

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

await warpgate.wait(1000);


// Summon Token ---------------------------------------------------------------
if (props.state === "on") {

    // Summon Coordinates -----------------------------------------------------
    const location  = props.tokenData.center;
    const gridScale = game.scenes.current.data.grid;
    location.x += gridScale * (0.5 * props.tokenData.data.width);
    location.y -= gridScale * (0.5 * props.tokenData.data.height);

    // Summon and apply updates -------------------------------------------
    const updates  = {
        token: {
            height: 0.5,
            width:  0.5
        }
    };
    const target = await warpgate.spawnAt(location, props.summonToken, updates);
    await props.actorData.setFlag("midi-qol", props.summonLabel, target[0]);

    // Attach tracker to host token ---------------------------------------
    if (game.modules.get("token-attacher")) {
        await tokenAttacher.attachElementToToken(canvas.tokens.get(target[0]), props.tokenData, true);
    }
}


// Unsummon Token -------------------------------------------------------------
if (props.state === "off") {

    const target = await props.actorData.getFlag("midi-qol", props.summonLabel);

    if (target) {
        if (game.modules.get("token-attacher")) {
            await tokenAttacher.detachElementFromToken(canvas.tokens.get(target), props.tokenData, true);
        }

        await warpgate.dismiss(target, game.scenes.current.data.document.id);
        await props.actorData.unsetFlag("midi-qol", props.summonLabel);
    }
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
