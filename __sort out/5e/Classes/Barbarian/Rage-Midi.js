//###########################################################################
// READ FIRST!!!!!!!!!!!!!!!!!!!
// Requires Midi-Qol On Use and DAE to be installed.
//##########################################################################
const actorD = canvas.tokens.get(args[0].tokenId).actor;
const itemD = args[0].item;
const level = actorD.data.type === "npc" ? actorD.data.data.details.cr : actorD.items.find(i => i.name === "Barbarian").data.data.levels;
const gameRound = game.combat ? game.combat.round : 0;
let the_message = "";
if (actorD.effects.find(ef => ef.data.label === itemD.name)) {
    let effect = await actorD.effects.find(ef => ef.data.label === itemD.name);
    await actorD.updateEmbeddedDocuments("ActiveEffect", [{_id:effect.id,disabled:true}]);
    await actorD.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
    the_message = `<em>${actorD.name}'s Rage wears off.</em>`;
} else {
    const effectData = {
        label: itemD.name,
        icon: itemD.img,
        disabled: false,
        duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
        origin: args[0].uuid,
        changes: [{
            "key": "data.bonuses.mwak.damage",
            "value": `+${(Math.ceil(Math.floor(level / (9 - (Math.floor(level / 9))) + 2)))}`,
            "mode": 2,
            "priority": 20
        }, {
            "key": "data.traits.dr.value",
            "value": "slashing",
            "mode": 2,
            "priority": 20
        }, {
            "key": "data.traits.dr.value",
            "value": "bludgeoning",
            "mode": 2,
            "priority": 20
        }, {
            "key": "data.traits.dr.value",
            "value": "piercing",
            "mode": 2,
            "priority": 20
        }, {
            "key": "flags.midi-qol.advantage.ability.check.str",
            "value": 1,
            "mode": 0,
            "priority": 30
        }, {
            "key": "flags.midi-qol.advantage.ability.save.str",
            "value": 1,
            "mode": 0,
            "priority": 20
        }]
    }
    await actorD.createEmbeddedDocuments("ActiveEffect", [effectData]);
    the_message = `<em>${actor.name} starts to Rage!</em>`;
}
let chatMessage = game.messages.get(args[0].itemCardId);
let content = await duplicate(chatMessage.data.content);
let searchString = /<div class="midi-qol-saves-display">[\s\S]*<div class="end-midi-qol-saves-display">/g;
let replaceString = `<div class="midi-qol-saves-display"><div class="end-midi-qol-saves-display">${the_message}`;
content = content.replace(searchString, replaceString);
await chatMessage.update({ content: content });
await ui.chat.scrollBottom();
