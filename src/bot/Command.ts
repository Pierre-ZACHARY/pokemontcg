import { CommandInteraction, ChatInputApplicationCommandData, Client } from "discord.js";
import {Language} from "./commands/Language";
import {Extension} from "./commands/Extension";
import {Collection} from "./commands/Collection";
import {Wishlist} from "./commands/Wishlist";
import {Wish} from "./commands/Wish";
import {Roll} from "./commands/Roll";
import {Give} from "./commands/Give";
import {Card} from "./commands/Card";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}

export const Commands: Command[] = [Language, Extension, Collection, Wishlist, Wish, Roll, Give, Card];
