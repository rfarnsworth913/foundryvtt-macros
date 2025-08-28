/* eslint-disable @stylistic/js/indent */
/* ==========================================================================
    Macro:         Summon
    Source:        Custom
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};
const { itemData } = lastArg.efData.flags.dae;

const props = {
    name: "Summon",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    itemData,
    tokenData,

    description: "<p>A simple overview of the spell</p>",
    sourceFolder: "Mage Hand",
    summonCount: 1,
    summonRange: 60,

    animations: {
        intro: "jb2a.magic_signs.circle.02.conjuration.intro.blue",
        loop: "jb2a.magic_signs.circle.02.conjuration.loop.blue",
        outro: "jb2a.magic_signs.circle.02.conjuration.outro.blue",

        belowToken: "jb2a.impact.ground_crack.02.orange",
        complete: "jb2a.magic_signs.circle.02.conjuration.complete.blue",
        loopOffset: "jb2a.magic_signs.circle.02.conjuration.loop.yellow"
    },

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!game.modules.get("portal-lib")?.active) {
    return ui.notifications.error("Portal Library is required!");
}


// Handle summoning target(s) -------------------------------------------------
if (props.state === "on") {

    // Get possible summons ---------------------------------------------------
    const actorList = game.folders.contents.find((folder) => {
        return folder.name === props.sourceFolder;
    });

    if (!actorList) {
        await removeEffect({
            actorData: props.actorData,
            effectLabel: props.itemData.name
        });
        return ui.notifications.error(
            `Cannot find folder name ${props.sourceFolder}.  Please create the folder and setup as required.`
        );
    }

    const actorImages = [];
    actorList.contents.forEach((actorData) => {
        const actorImage = actorData.prototypeToken.texture.src.replace("400x400.webm", "Thumb.webp");

        actorImages.push(`
            <label for="${actorData.id}" class="radio-label">
                <input type="radio" id="${actorData.id}" name="summonForm" value="${actorData.uuid}" />
                <img src="${actorImage}" style="border: 0; width: 50px; height: 50;" />
                ${actorData.name}
            </label>
        `);
    });


    // Summon dialog box ------------------------------------------------------
    return new Dialog({
        title: `${props.itemData.name} Selection`,
        content: `
            <style>
                #summonSpell .form-group {
                    display: flex;
                    flex-wrap: wrap;
                    width: 100%;
                    align-items: flex-start;
                    max-height: 400px;
                    margin-bottom: 15px;
                }

                #summonSpell .radio-label {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    text-align: center;
                    justify-content: flex-start;
                    flex: 0 0 100%;
                    line-height: normal;
                    padding: 5px;
                    cursor: pointer;
                }

                #summonSpell .radio-label input {
                    display: none;
                }

                #summonSpell img {
                    border: 0;
                    width: 50px;
                    height: 50px;
                    flex: 0 0 50px;
                    margin-right: 10px;
                }

                #summonSpell [type=radio]:checked + img {
                    outline: 2px solid #f00;
                }
            </style>
            <form id="summonSpell">
                ${props.description}
                <hr />
                <div class="form-group">
                    ${actorImages.join("")}
                </div>
            </form>
        `,
        buttons: {
            summon: {
                label: "Summon",
                callback: async (html) => {
                    // Get selected actor -------------------------------------
                    const actorDataID = await html.find("input[name='summonForm']:checked").val();

                    if (!actorDataID) {
                        await removeEffect({
                            actorData: props.actorData,
                            effectLabel: props.itemData.name
                        });
                        return ui.notifications.error("Please select a creature to summon.");
                    }

                    // Setup summon range -------------------------------------
                    const range = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
                        t: "circle",
                        user: game.userId,
                        x: props.tokenData.x + canvas.grid.size / 2,
                        y: props.tokenData.y + canvas.grid.size / 2,
                        direction: 0,
                        distance: props.summonRange,
                        document: {
                            borderColor: "#ff0000"
                        }
                    }]);

                    // Handle summoning ---------------------------------------
                    const updateData = {
                        actor: {
                            name: "Mage Hand"
                        },
                        token: {
                            name: "Mage Hand",
                            texture: {
                                scaleX: 0.5,
                                scaleY: 0.5,
                            }
                        }
                    };

                    const portal = new Portal();
                    portal.addCreature(actorDataID, { updateData })
                        .range(60)
                        .delay(1500)
                        .pick();

                    const summons = await portal.spawn();

                    // Summoning Animations -----------------------------------
                    const summonIDs = [];

                    summonerAnimation(props.tokenData);
                    summons.forEach(async (summonedToken, index) => {
                        summonIDs.push(summonedToken.id);
                        summonAnimation(summonedToken.id, index);
                    });

                    // Store summoned values in DAE Flags ---------------------
                    DAE.setFlag(props.actorData, props.itemData.name.replace(" ", ""), summonIDs);
                    await range[0].delete();
                }
            },
            cancel: {
                label: "Cancel",
                callback: async () => {
                    await removeEffect({
                        actorData: props.actorData,
                        effectLabel: props.itemData.name
                    });
                }
            }
        },
        default: "Cancel"
    }).render(true);
}

// Handle unsummoning target(s) -----------------------------------------------
if (props.state === "off") {
    const summonedIDs = DAE.getFlag(props.actorData, props.itemData.name.replace(" ", ""));
    DAE.unsetFlag(props.actorData, props.itemData.name.replace(" ", ""));

    await game.scenes.current.deleteEmbeddedDocuments("Token", summonedIDs);
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
        return effect.name.toLowerCase() === effectLabel.toLowerCase();
    });

    if (!effect) {
        return;
    }

    return await MidiQOL.socket().executeAsGM("removeEffects", {
        actorUuid: actorData.uuid,
        effects: [effect.id]
    });
}

/**
 * Simple summoner animation that plays on the summoner token
 * @param {Token5e}  tokenData  Token data of the summoner
 */
function summonerAnimation (tokenData) {
    if (!game.modules.get("sequencer")?.active) {
        return false;
    }

    new Sequence()
        .effect()
        .file(props.animations.intro)
        .scaleToObject(1.75)
        .atLocation(tokenData)
        .belowTokens()
        .waitUntilFinished(-500)
        .effect()
        .file(props.animations.loop)
        .scaleToObject(1.75)
        .atLocation(tokenData)
        .belowTokens()
        .fadeIn(200)
        .fadeOut(200)
        .waitUntilFinished(-500)
        .effect()
        .file(props.animations.outro)
        .scaleToObject(1.75)
        .atLocation(tokenData)
        .belowTokens()
        .play();
}

/**
 * Simple summoning animation that plays on the summoned token
 *
 * @param {string}  tokenID  Token ID of the summoned actor
 */
// eslint-disable-next-line max-lines-per-function
function summonAnimation (tokenID, index = 0) {
    if (!game.modules.get("sequencer")?.active) {
        return false;
    }

    const tokenData = canvas.tokens.get(tokenID);
    const imageSize = tokenData.width * tokenData.document.texture.scaleX;
    const image = tokenData.document.texture.src;

    new Sequence()
        .wait(200 * (1 + index))
        .effect()
        .file(props.animations.complete)
        .atLocation(tokenData, { offset: { y: -((imageSize - 1) / 2) }, gridUnits: true })
        .scaleToObject(1.1)
        .filter("ColorMatrix", { saturate: -1, brightness: 0 })
        .filter("Blur", { blurX: 5, blurY: 10 })
        .animateProperty(
            "spriteContainer",
            "position.y",
            { from: -3, to: -0.3, duration: 500, ease: "easeOutCubic", gridUnits: true }
        )
        .fadeOut(100)
        .rotate(-90)
        .scaleOut(0, 100, { ease: "easeOutCubic" })
        .duration(500)
        .attachTo(tokenData, { bindAlpha: false })
        .zIndex(5)
        .waitUntilFinished(-300)
        .effect()
        .file(props.animations.belowToken)
        .atLocation(tokenData)
        .opacity(1)
        .randomRotation()
        .belowTokens()
        .scaleToObject(2)
        .zIndex(0.2)
        .wait(100)
        .effect()
        .file(props.animations.complete)
        .atLocation(tokenData)
        .opacity(1)
        .scaleToObject(1.5)
        .effect()
        .file(props.animations.loopOffset)
        .atLocation(tokenData)
        .scaleIn(0, 200, { ease: "easeOutCubic" })
        .belowTokens()
        .scaleToObject(1.25)
        .duration(1200)
        .fadeIn(200, { ease: "easeOutCirc", delay: 200 })
        .fadeOut(300, { ease: "linear" })
        .filter("ColorMatrix", { saturate: -1, brightness: 2 })
        .filter("Blur", { blurX: 5, blurY: 10 })
        .zIndex(0.1)
        .effect()
        .file(props.animations.loopOffset)
        .atLocation(tokenData)
        .scaleIn(0, 200, { ease: "easeOutCubic" })
        .belowTokens()
        .scaleToObject(1.25)
        .fadeOut(5000, { ease: "easeOutQuint" })
        .duration(10000)
        .effect()
        .file(image)
        .atLocation(tokenData)
        .scaleToObject(tokenData.document.texture.scaleX)
        .fadeOut(1000, { ease: "easeInExpo" })
        .filter("ColorMatrix", { saturate: -1, brightness: 0 })
        .filter("Blur", { blurX: 5, blurY: 5 })
        .scaleIn(0, 500, { ease: "easeOutCubic" })
        .duration(1200)
        .attachTo(tokenData, { bindAlpha: false })
        .waitUntilFinished(-800)
        .animation()
        .on(tokenData)
        .fadeIn(250)
        .play();
}
