/* ==========================================================================
    Macro:         Detect Magic Ping
    Source:        Sequencer Macro Library
    Usage:         On Use
   ========================================================================== */

/* ==========================================================================
    Macro Globals
   ========================================================================== */
const lastArg   = args[args.length - 1];
const tokenData = canvas.tokens.get(lastArg?.tokenId) || {};

const props = {
    name: "Detect Magic Ping",
    state: args[0]?.tag || args[0] || "unknown",

    actorData: tokenData?.actor || {},
    tokenData,

    lastArg
};

logProps(props);


/* ==========================================================================
    Macro Logic
   ========================================================================== */
if (!(game.modules.get("tagger")?.active)) {
    return ui.notifications.error("Tagger is required!");
}

if (props.state === "OnUse") {
    let magicalObjects = [];

    const magicalSchools = [
        "abjuration",
        "conjuration",
        "divination",
        "enhancement",
        "evocation",
        "illusion",
        "necromancy",
        "transmutation"
    ];

    const magicalColors = [
        "blue",
        "green",
        "pink",
        "purple",
        "red",
        "yellow"
    ];

    // Get objects on scene ---------------------------------------------------
    const objects = Tagger.getByTag("magical", { ignore: [props.tokenData] });

    magicalObjects = objects.map((object) => {
        const distance = canvas.grid.measureDistance(props.tokenData, object);

        return {
            delay: distance * 55,
            distance,
            obj: object,
            school: Tagger.getTags(object).find((tag) => {
                return magicalSchools.includes(tag.toLowerCase());
            }),
            color: Tagger.getTags(object).find((tag) => {
                return magicalColors.includes(tag.toLowerCase());
            }) || "blue"
        };
    }).filter((object) => {
        return object.distance <= 32.5;
    });

    // Define Animation Sequence ----------------------------------------------
    const sequence = new Sequence()
        .effect("jb2a.detect_magic.circle.blue")
            .atLocation(props.tokenData)
            .belowTiles()
            .size(13.75 * canvas.grid.size);

    for (const magical of magicalObjects) {
        if (!magical.school) {
            continue;
        }

        new Sequence()
            .effect(`jb2a.magic_signs.rune.${magical.school}.intro.${magical.color}`)
                .atLocation(magical.obj)
                .scale(0.25)
                .delay(magical.delay)
                .waitUntilFinished(-800)
                .zIndex(0)
            .effect(`jb2a.magic_signs.rune.${magical.school}.loop.${magical.color}`)
                .atLocation(magical.obj)
                .scale(0.25)
                .fadeOut(500)
                .waitUntilFinished(-800)
                .zIndex(1)
            .effect(`jb2a.magic_signs.rune.${magical.school}.outro.${magical.color}`)
                .atLocation(magical.obj)
                .scale(0.25)
                .zIndex(0)
            .play();

        new Sequence()
            .effect("jb2a.detect_magic.cone.blue")
                .atLocation(magical.obj)
                .stretchTo(props.tokenData)
                .delay(magical.delay)
            .play();
    }

    sequence.play();
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
