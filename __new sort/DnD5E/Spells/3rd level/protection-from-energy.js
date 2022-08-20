/* ==========================================================================
    Macro:         Protection from Energy
    Source:        Custom
    Usage:         ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Protection from Energy",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg,

    resistances: {
        "Acid":       "green",
        "Cold":       "blue",
        "Fire":       "yellow",
        "Lightining": "purple",
        "Thunder":    "blue"
    }
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

if (props.state === "on") {

    // Get Dialog Content -----------------------------------------------------
    const selectOptions = Object.keys(props.resistances).reduce((list, resistance) => {
        list.push(`<option value="${resistance.toLowerCase()}">${resistance}</option>`);
        return list;
    }, []);

    const dialogContent = `
        <form class="flexcol">
            <p class="message-content">Select resistance type:</p>
            <div class="form-group">
                <select id="element">
                    ${selectOptions}
                </select>
            </div>
        </form>
    `;

    await wait(500);

    // Apply Dialog -----------------------------------------------------------
    new Dialog({
        title: "Protection from Energy",
        content: dialogContent,
        buttons: {
            yes: {
                icon:  "<i class=\"fas fa-check\"></i>",
                label: "Apply Resistance",
                callback: async (html) => {
                    const resistance = html.find("#element").val();
                    const effect     = await getEffect({
                        actorData:   props.actorData,
                        effectLabel: props.name
                    });

                    // Apply Effect
                    if (effect) {
                        await props.actorData.updateEmbeddedDocuments("ActiveEffect", [{
                            _id: effect.id,
                            changes: [
                                ...effect.data.changes,
                                {
                                    key:      "data.traits.dr.value",
                                    mode:     2,
                                    priority: 20,
                                    value:    resistance
                                }
                            ]
                        }]);

                        // Create Animation Effect
                        if ((game.modules.get("sequencer")?.active)) {
                            new Sequence()
                                .effect()
                                    .file(`jb2a.shield.03.intro.${props.resistances[capitalizeFirstLetter(resistance)]}`)
                                    .attachTo(props.tokenData)
                                    .waitUntilFinished(-500)
                                .effect()
                                    .file(`jb2a.shield.03.loop.${props.resistances[capitalizeFirstLetter(resistance)]}`)
                                    .attachTo(props.tokenData)
                                    .persist()
                                    .name(`Protection-from-Energy-${props.tokenData.id}`)
                                    .fadeIn(300)
                                    .fadeOut(300)
                                    .extraEndDuration(800)
                                .play();
                        }
                    }
                }
            }
        }
    }).render(true);
}


if (props.state === "off") {

    // Remove Animation Effect
    if ((game.modules.get("sequencer")?.active)) {
        const effects = Sequencer.EffectManager.getEffects({
            name:   `Protection-from-Energy-${props.tokenData.id}`,
            object: props.tokenData
        });

        Sequencer.EffectManager.endEffects({
            name:   `Protection-from-Energy-${props.tokenData.id}`,
            object: props.tokenData
        });

        new Sequence()
            .effect()
                .file(effects[0].data.file.replace("loop", "outro_fade"))
                .attachTo(props.tokenData)
            .play();
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

function capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Simple Async wait function
 *
 * @param    {number}   Number of milliseconds to wait
 * @returns  {Promise}  Promise to resolve
 */
async function wait (ms) {
    return new Promise((resolve) => {
        return setTimeout(resolve, ms);
    });
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
        return effect.data.label.toLowerCase() === effectLabel.toLowerCase();
    }));
}
