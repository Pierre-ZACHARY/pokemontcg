import { Language } from './en';
import {CLAIM_MINUTES, MAX_ROLLS, ROLL_MINUTES} from "../commands/Roll";
class French extends Language {
  constructor() {
    super(
        "Vous avez déjà réclamé toutes vos pièces quotidiennes, revenez plus tard.",
        "Bonjour {0}, c'est la première fois que vous réclamez des pièces, vous avez reçu 200 pièces supplémentaires!",
        "Vous avez obtenu {0} pièces.",
        "{0} rolls / {1} minutes, Prochain lancer dans {2} minutes",
        "Souhaité par <@{0}> \n",
        "Impossible de claim maintenant, prochain claim dans : {0} minutes",
        "**{0}** ({1}) ajouté à votre collection ! 🎉",
        "Ajouter à la collection",
        "Chargement...",
        "Wish ajouté!",
        "Carte introuvable",
        "Vous avez déjà souhaité cette carte",
        "Précédent",
        "Suivant",
        "Extension sélectionnée!",
        "Utilisez /extension <acronyme> pour voir les cartes de l'extension\n\n",
        "Possédé par {0} \n",
        "Trier par : extension",
        "Trier par : date d'obtention",
        "Seul {0} peut claim cette carte.",
        "Tout le monde",
        "Utilisation :" +
        "\n**/language <language>**: Définissez la langue du bot." +
        "\n**/roll**: Lancez une carte, max : " + MAX_ROLLS + " lancers toutes les " + ROLL_MINUTES + " minutes. Vous pouvez ajouter une carte à votre collection toutes les " + CLAIM_MINUTES + " minutes." +
        "\n**/collection**: Affichez votre collection. Vous pouvez trier les cartes de la collection par date d'obtention ou par acronyme d'extension." +
        "\n**/collection <user>**: Affichez la collection de l'utilisateur si elle existe." +
        "\n**/wishlist**: Affichez votre liste de souhaits." +
        "\n**/wishlist <user>**: Affichez la liste de souhaits de l'utilisateur spécifié." +
        "\n**/wish <card acronym>**: Souhaitez une carte. Lorsqu'une carte de votre liste de souhaits est roll, vous serez notifié." +
        "\n**/give <card acronym> <user>**: Donnez une carte de votre collection à l'utilisateur spécifié." +
        "\n**/card <card acronym>**: Affichez une carte spécifique à partir de son acronyme. ex : SUM-1." +
        "\n**/extension**: Affichez toutes les extensions disponibles." +
        "\n**/extension <extension acronym>**: Affichez une extension spécifique avec toutes ses cartes. Vous pouvez **sélectionner l'extension** pour ne lancer que des cartes de celle-ci." +
        "\n**/help**: Affichez ce message." +
        "\n**/stats <user>**: Affichez les statistiques de roll d'un utilisateur."
    );
  }
}

export const fr = new French();