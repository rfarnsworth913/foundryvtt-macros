//###########################################################################
// READ FIRST!!!!!!!!!!!!!!!!!!!
// Hotbar macro for toggling on and off using Active Effects
// Some parts of this macro require Midi-qol and DAE for full effect.
//##########################################################################
let rage = async function() {
  let actorD = canvas.tokens.controlled[0].actor;
  let level = actorD.data.type === "npc" ? actorD.data.data.details.cr : actorD.items.find(i=> i.name === "Barbarian").data.data.levels;
  let gameRound = game.combat ? game.combat.round : 0;
  let the_message = "";
  if (actorD.effects.find(ef=> ef.data.label === "Rage")) {
    let rage_id = await actorD.effects.find(ef=> ef.data.label === "Rage").id;
    await actorD.updateEmbeddedDocuments("ActiveEffect", [{_id:rage_id,disabled:true}]);
    await actorD.deleteEmbeddedDocuments("ActiveEffect", [rage_id]);
    the_message = `<em>${actorD.name}'s Rage wears off.</em>`;
  } else {
    const effectData = {
      label : "Rage",
      icon : "systems/dnd5e/icons/skills/red_10.jpg",
      changes: [{
        "key": "data.bonuses.mwak.damage",        
        "value": `+${(Math.ceil(Math.floor(level/(9-(Math.floor(level/9)))+2)))}`,
        "mode": 2,
        "priority": 20
        },{
        "key": "data.traits.dr.value",
        "value": "slashing",
        "mode": 2,
        "priority": 20
        },{
        "key": "data.traits.dr.value",
        "value": "bludgeoning",
        "mode": 2,
        "priority": 20
        },{
        "key": "data.traits.dr.value",
        "value": "piercing",
        "mode": 2,
        "priority": 20
        },{
        "key": "flags.midi-qol.advantage.ability.check.str",
        "value": 1,
        "mode": 0,
        "priority": 30
        },{
        "key": "flags.midi-qol.advantage.ability.save.str",
        "value": 1,
        "mode": 0,
        "priority": 20
        }],
        disabled: false,
        duration: {rounds: 10, seconds: 60,startRound: gameRound, startTime: game.time.worldTime},
      }
    await actorD.createEmbeddedDocuments("ActiveEffect", [effectData]);
    the_message = `<em>${actor.name} starts to Rage!</em>`;
  }
  ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({actor: actorD}),
      content: the_message,
      type: CONST.CHAT_MESSAGE_TYPES.EMOTE
    });
};
rage();
