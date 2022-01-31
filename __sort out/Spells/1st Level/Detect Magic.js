/* ==========================================================================
    Macro:              Detect Magic
    Description:        Handles detect magic interactions
    Source:             Custom
    Usage:              ItemMacro
   ========================================================================== */

// Macro actions --------------------------------------------------------------
(async () => {
    const props = getProps();
    logProps(props, props.name || this.name);

    if (!validateProps(props)) {
        return;
    }


    // Check dependecies ------------------------------------------------------
    if (!(game.modules.get("jb2a_patreon")?.active)) {
        return ui.notifications.error("JB2A's Patreon Module is required!");
    }

    if (!(game.modules.get("advanced-macros")?.active)) {
        return ui.notifications.error("Advanced Macros is required!");
    }

    if (!(game.modules.get("tagger")?.active)) {
        return ui.notifications.error("Tagger is required!");
    }


    // Perform magical check --------------------------------------------------
    let magicalObjects = [];
    let magicalSchools = ["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation"];
    let magicalColors  = ["blue", "green", "pink", "purple", "red", "yellow"];

    let objects = Tagger.getByTag("magical", { ignore: [props.token] });

    magicalObjects = objects.map((object) => {
        let distance = canvas.grid.measureDistance(props.token, object);

        return {
            delay:    distance * 55,
            distance: distance,
            obj:      object,
            school:   Tagger.getTags(object).find(tag => magicalSchools.includes(tag.toLowerCase())) || false,
            color:    Tagger.getTags(object.find(tag => magicalColors.includes(tag.toLowerCase()))) || "blue"
        }
    }).filter(object => object.distance <= 32.5);


    // Generate Animation Sequence --------------------------------------------
    let sequence = new Sequence()
        .effect("jb2a.detect_magic.circle.blue")
        .atLocation(props.token)
        .belowTiles()
        .size(13.75 * canvas.grid.size);

    for (let item of magicalObjects) {

        if (!item.school) {
            continue;
        }

        new Sequence()
            .effect("jb2a.magic_signs.rune.{{school}}.intro.{{color}}")
                .atLocation(item.obj)
                .scale(0.25)
                .delay(item.delay)
                .setMustache(item)
                .waitUntilFinished(-800)
                .zIndex(0)
            .effect("jb2a.magic_signs.rune.{{school}}.loop.{{color}}")
                .atLocation(item.obj)
                .scale(0.25)
                .setMustache(item)
                ._fadeOut(500)
                .waitUntilFinished(-800)
                .zIndex(1)
            .effect("jb2a.magic_signs.rune.{{school}}.outro.{{color}}")
                .atLocation(item.obj)
                .scale(0.25)
                .setMustache(item)
                .zIndex(0)
            .play();

        new Sequence()
            .effect("jb2a.detect_magic.cone.blue")
                .atLocation(item.object)
                .stretchTo(props.token)
                .delay(item.delay)
            .play();
    }

    sequence.play();

})();


// Property Helpers -----------------------------------------------------------

/**
* Extracts properties from passed in values and assigns them to a common object which
* is eaiser to access
*
* @returns  Extracted property values as object
*/
function getProps () {
    const lastArg = args[args.length - 1];

    return {
        name: "Detect Magic",
        token: canvas.tokens.get(lastArg.tokenId)
    };
}

/**
* Logs the extracted property values to the console for debugging purposes
*/
function logProps (props, title) {
    console.group(`${title} Macro`);
    Object.keys(props).forEach((key) => {
        console.log(`${key}: `, props[key]);
    });
    console.groupEnd();
}

/**
* Takes the properties object and validates that all specified values have been defined before trying to execute
* the macro
*
* @param  props  Properties to be evaluated
*/
function validateProps (props) {
    let missingProps = [];

    Object.keys(props).forEach((key) => {
        if (props[key] === undefined || props[key] === null) {
            missingProps.push(key);
        }
    });

    if (missingProps.length > 0) {
        ui.notifications.error(`The following parameters are invalid: ${missingProps.join(", ")}`);
        return false;
    }

    return true;
}
