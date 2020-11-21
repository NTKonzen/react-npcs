const NPCs = require('../db/NPCs');
const thisStartsWithOneOfThese = require('../serverUtilities/finding')

function NPCChecks(message, rooms) {
    return new Promise((res, rej) => {
        let startsWithNPC = false;
        let NPCObj;

        if (message.startsWith("the")) {
            // removes the
            message = message.split(' ').slice(1).join(' ');
        }

        // This runs three times!
        for (let i = 2; i >= 0; i--) {
            const messageString = message.toLowerCase().split(' ').slice(0, i + 1).join(' ');
            NPCs.forEach(NPC => {
                if (NPC.names.includes(messageString)) {
                    startsWithNPC = true;
                    NPCObj = NPC;
                    message = message.split(' ').slice(i + 1).join(' ');
                }
            })
        }

        if (startsWithNPC && thisStartsWithOneOfThese(NPCObj.inRoom, rooms)) {
            res({ NPCObj, message })
        } else if (startsWithNPC && !thisStartsWithOneOfThese(NPCObj.inRoom, rooms)) {
            rej({ status: 404, message: '' })
        } else {
            rej({ status: 204, message: "Doesn't start with NPC" })
        }
    })

}

module.exports = NPCChecks;