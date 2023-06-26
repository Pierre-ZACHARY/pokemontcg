import {Client, CommandInteraction, Interaction} from "discord.js";
import {Commands} from "../Command";
import {userGuard} from "../utils/userGuard";
import {serverGuard} from "../utils/serverGuard";
import {updateShop} from "../utils/updateShop";
import {redisWrapper} from "../utils/redisWrapper";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(client, interaction);
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    if(!interaction.guild){
        await interaction.followUp({content: "Can't answer here"});
        return; // we don't want to answer to non-guild message
    }
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        await interaction.followUp({content: "An error has occurred"});
        return;
    }
    await interaction.deferReply();
    await redisWrapper("discordUser-"+interaction.user.id+"discordServer-"+interaction.guild!.id, 900, async ()=>{
    await redisWrapper("discordUser-"+interaction.user.id, 900, async ()=>{
        await userGuard(interaction.user);
    });
    await redisWrapper("discordServer-"+interaction.guild!.id, 3600, async ()=>{
    await serverGuard(interaction.guild!);
    });
    });
    //await updateShop(interaction.guild!);


    slashCommand.run(client, interaction);
};