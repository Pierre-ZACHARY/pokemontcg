import { Language } from './en';
class French extends Language {
  constructor() {
    super(
        "Vous avez déjà réclamé toutes vos pièces quotidiennes, revenez plus tard.",
        "Bonjour {0}, c'est la première fois que vous réclamez des pièces, vous avez reçu 200 pièces supplémentaires!",
        "Vous avez obtenu {0} pièces.",
        "20 lancers / 2h, Prochain lancer dans {0} minutes",
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
        "Utilisez /extension <acronyme> pour voir les cartes de l'extension\n\n"
    );
  }
}

export const fr = new French();