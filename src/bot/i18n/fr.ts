import { Language } from './en';
class French extends Language {
  constructor() {
    super(
        "Vous avez déjà réclamé toutes vos pièces quotidiennes, revenez plus tard.",
        "Bonjour {0}, c'est la première fois que vous réclamez des pièces, vous avez reçu 200 pièces supplémentaires!",
        "Vous avez obtenu {0} pièces."
    );
  }
}

export const fr = new French();