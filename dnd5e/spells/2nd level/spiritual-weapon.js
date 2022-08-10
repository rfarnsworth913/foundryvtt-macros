/* ==========================================================================
    Macro:         Spiritual Weapon
    Source:        https://github.com/trioderegion/warpgate/wiki/Spiritual-Weapon
    Usage:         DAE ItemMacro
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Spiritual Weapon",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    spellLevel:     lastArg.spellLevel,
    summonerAttack: tokenData.actor.getRollData().attributes.spelldc - 8,
    summonerMod:    getProperty(
        tokenData.actor,
        `data.data.abilities.${getProperty(tokenData.actor, "data.data.attributes.spellcasting")}.mod`
    ),

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */

// Check dependencies ---------------------------------------------------------
if (!(game.modules.get("warpgate")?.active)) {
    return ui.notifications.error("Warpgate is required!");
}

// Summon Weapon --------------------------------------------------------------
if (props.state === "on") {

    // Select Spiritual Weapon ------------------------------------------------
    const choices = await warpgate.dialog([

        // Weapon Type
        { type: "header", label: "Weapon Type" },
        { type: "radio", options: "weaponType", label: "Mace" },
        { type: "radio", options: "weaponType", label: "Maul" },
        { type: "radio", options: "weaponType", label: "Sword" },

        // Colors
        { type: "header", label: "Color" },
        { type: "radio", options: "color", label: "Flaming Blue" },
        { type: "radio", options: "color", label: "Flaming Green" },
        { type: "radio", options: "color", label: "Flaming Orange" },
        { type: "radio", options: "color", label: "Flaming Purple" },
        { type: "radio", options: "color", label: "Flaming Red" },
        { type: "radio", options: "color", label: "Flaming Yellow" },
        { type: "radio", options: "color", label: "Spectral Blue" },
        { type: "radio", options: "color", label: "Spectral Green" },
        { type: "radio", options: "color", label: "Spectral Orange" },
        { type: "radio", options: "color", label: "Spectral Purple" },
        { type: "radio", options: "color", label: "Spectral Red" }
    ],
    "Choose Your Spiritual Weapon", "Call Forth!");

    // Extract Choices --------------------------------------------------------
    const [weapon, color] = choices.filter(Boolean);

    const weaponID        = weapon === "Scythe" ? `${weapon}01_02` : `${weapon}01_01`;
    const colorID         = color.replace(" ", "_");
    const folderPath      = "modules/jb2a_patreon/Library/2nd_Level/Spiritual_Weapon";
    const spiritualWeapon = `${folderPath}/SpiritualWeapon_${weaponID}_${colorID}_200x200.webm`;

    // Define Token Mutations -------------------------------------------------
    let damageScale = "";

    if ((props.spellLevel - 3) > 0) {
        damageScale = `+ ${Math.floor((props.spellLevel - 2) / 2)}d8[upcast]`;
    }

    const updates = {
        token: {
            name: `Spiritual Weapon of ${props.actorData.name}`,
            img: spiritualWeapon
        },
        actor: {
            name: `Spiritual Weapon of ${props.actorData.name}`
        },
        embedded: {
            Item: {
                "Attack": {
                    "data.attackBonus": `${props.summonerAttack}`,
                    "data.damage.parts": [[`1d8 ${damageScale} + ${props.summonerMod}`, "force"]],
                    "flags.autoanimations.animName": weapon,
                    "falgs.autoanimations.color": color.toLowerCase()
                }
            }
        }
    };

    // Summon Target ----------------------------------------------------------
    const callbacks = {
        pre: async (template, update) => {
            summoningAnimation(props.tokenData);
            await warpgate.wait(1750);
        },
        post: async (template, token) => {
            summonTarget(token);
            await warpgate.wait(500);
        }
    };

    const options = {
        controllerActor: props.actorData
    };

    const target = await warpgate.spawn(props.name, updates, callbacks, options);
    DAE.setFlag(props.actorData, "spiritualWeapon", target[0]);
}


// Unsummon Weapon ------------------------------------------------------------
if (props.state === "off") {
    const target = DAE.getFlag(props.actorData, "spiritualWeapon");
    DAE.unsetFlag(props.actorData, "spiritualWeapon");

    if (target) {
        await warpgate.dismiss(target, game.scenes.current.data.document.id);
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
    console.group(`${props.name} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
 * Plays a magic sequence under the specified target
 *
 * @param  {Token5e}  target  Where to play the animation
 */
function summoningAnimation (target) {
    if (game.modules.get("sequencer").active) {
        new Sequence()
        .effect()
            .file("jb2a.magic_signs.circle.02.evocation.intro.blue")
            .scaleToObject(1.75)
            .atLocation(target)
            .belowTokens()
            .waitUntilFinished(-550)
        .effect()
            .file("jb2a.magic_signs.circle.02.evocation.loop.blue")
            .scaleToObject(1.75)
            .atLocation(target)
            .belowTokens()
            .fadeIn(200)
            .fadeOut(200)
            .waitUntilFinished(-550)
        .effect()
            .file("jb2a.magic_signs.circle.02.evocation.outro.blue")
            .scaleToObject(1.75)
            .atLocation(target)
            .belowTokens()
        .play();
    }
}

function summonTarget (target) {
    if (game.modules.get("sequencer").active) {
        new Sequence()
        .effect()
            .file("jb2a.misty_step.01.blue")
            .scaleToObject(1.75)
            .atLocation(target)
            .fadeIn(200)
            .fadeOut(200)
            .waitUntilFinished(-550)
        .play();
    }
}
