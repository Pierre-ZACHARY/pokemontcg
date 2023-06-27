export class Language{
    constructor(
        public alreadyClaimed: string = "You already claimed all your daily coins, come back later.",
        public firstClaim: string = "Hello {0}, this is your first time claiming coins, you got 200 coins extra!",
        public claimAmount: string = "You claimed {0} coins.",
        public nextRoll: string = "20 rolls / 2h, Next roll in {0} minutes",
        public wishedBy: string = "Wished by <@{0}> \n",
        public nextClaim: string = "Can't claim right now, next claim in : {0} minutes",
        public successClaim: string = "**{0}** ({1}) added to your collection ! 🎉",
        public addToCollection: string = "Add to collection",
        public loading: string = "Loading...",
        public wishGranted: string = "Wish granted",
        public cardNotFound: string = "Card not found",
        public alreadyWished: string = "You already wished for this card",
        public previous: string = "Previous",
        public next: string = "Next",
        public extensionSelected: string = "Extension selected!",
        public extensionUsage: string = "Use /extension <acronym> to see the cards in the extension\n\n"
    ) {}
}

export class English extends Language{
    constructor(){
        super();
    }
}

export const en = new English();