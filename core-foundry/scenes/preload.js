/* ==========================================================================
    Macro:         Preload Scene
    Source:        Custom
    Usage:         Preload [{{ Scene Names }}]
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const props = {
    name: "Preload Scene",
    scenes: Array.from(args) || []
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (props.scenes.length > 0) {
    props.scenes.forEach((sceneName) => {
        const scene = game.scenes.getName(sceneName)?.id;
        game.scenes.preload(scene, true);
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
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}
