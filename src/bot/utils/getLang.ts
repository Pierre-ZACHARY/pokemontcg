import {en, Language} from "../i18n/en";
import {fr} from "../i18n/fr";

export function getLang(lang: String): Language{
    switch(lang){
        case "fr":
            return fr;
        default:
            return en;
    }
}