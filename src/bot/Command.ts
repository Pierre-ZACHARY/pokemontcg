import { CommandInteraction, ChatInputApplicationCommandData, Client } from "discord.js";
// import {Inventory} from "./commands/Inventory";
import {ClaimTcg} from "./commands/ClaimTcg";
import {Shop} from "./commands/Shop";
import {Language} from "./commands/Language";
import {Extension} from "./commands/Extension";
import {Collection} from "./commands/Collection";
import {Wishlist} from "./commands/Wishlist";
import {Wish} from "./commands/Wish";
import {Roll} from "./commands/Roll";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}

export const Commands: Command[] = [Language, Extension, Collection, Wish, Wishlist, Roll];
