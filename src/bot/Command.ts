import { CommandInteraction, ChatInputApplicationCommandData, Client } from "discord.js";
import {Inventory} from "./commands/Inventory";
import {ClaimTcg} from "./commands/ClaimTcg";
import {Shop} from "./commands/Shop";
import {Language} from "./commands/Language";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}

export const Commands: Command[] = [Language];
