/* ==========================================================================
    Macro:         Protective Bond
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Protective Bond",
    state: args[0]?.tag || args[0] || "unknown",

    tokenData,

    animationColor: "blue"
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

if (!(game.modules.get("sequencer")?.active)) {
    return ui.notifications.error("Sequencer is required!");
}


// Handle movement ------------------------------------------------------------
const range = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
    t:           "circle",
    user:        game.userId,
    x:           props.tokenData.x + canvas.grid.size / 2,
    y:           props.tokenData.y + canvas.grid.size / 2,
    direction:   0,
    distance:    30,
    borderColor: "#ff0000"
}]);

const position = await warpgate.crosshairs.show({
    size:        1,
    tag:         randomID(),
    label:       "Teleport to",
    drawOutline: false,
    drawIcon:    false
}, { show: async (crosshair) => {

    new Sequence()
        .effect()
            .from(props.tokenData)
            .attachTo(crosshair)
            .persist()
            .opacity(0.5)
        .play();
}});

await range[0].delete();


// Teleport Handling ----------------------------------------------------------
new Sequence()
    .effect()
        .file(`jb2a.misty_step.01.${props.animationColor}`)
        .atLocation(props.tokenData)
        .randomRotation()
        .scaleToObject(2)
    .wait(750)
    .animation()
        .on(props.tokenData)
        .opacity(0.0)
        .waitUntilFinished()
    .animation()
        .on(props.tokenData)
        .teleportTo(position)
        .snapToGrid()
        .waitUntilFinished()
    .effect()
        .file(`jb2a.misty_step.02.${props.animationColor}`)
        .atLocation(props.tokenData)
        .randomRotation()
        .scaleToObject(2)
    .wait(1500)
    .animation()
        .on(props.tokenData)
        .opacity(1.0)
    .play();


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
