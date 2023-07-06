import {CLAIM_MINUTES, MAX_ROLLS, ROLL_MINUTES} from "../commands/Roll";

export class Language{
    constructor(
        public alreadyClaimed: string = "You already claimed all your daily coins, come back later.",
        public firstClaim: string = "Hello {0}, this is your first time claiming coins, you got 200 coins extra!",
        public claimAmount: string = "You claimed {0} coins.",
        public nextRoll: string = "{0} rolls / {1} minutes, Next roll in {2} minutes",
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
        public extensionUsage: string = "Use /extension <acronym> to see the cards in the extension\n\n",
        public ownedBy: string = "Owned by {0} \n",
        public sortByExtension: string = "Sort by : extension",
        public sortByOptainedAt: string = "Sort by : obtained date",
        public ownerCanClaim: string = "Only {0} can claim this card.",
        public anyoneCanClaim: string = "Everyone",
        public alreadyInCollection: string = "Card already in {0} collection.",
        public helpMessage: string = "Usage:" +
        "\n**/language <language>**: Set the bot language." +
        "\n**/roll**: Roll a card, max : " + MAX_ROLLS + " rolls every " + ROLL_MINUTES + " minutes. You can add a card to your collection every " + CLAIM_MINUTES + " minutes." +
        "\n**/collection**: Display your collection. You can sort collection cards by obtention date or by extensions acronym." +
        "\n**/collection <user>**: Display the user's collection if any." +
        "\n**/wishlist**: Display your wishlist." +
        "\n**/wishlist <user>**: Display given user wishlist." +
        "\n**/wish <card acronym>**: Wish for a card. When a card from your wishlist is rolled, you'll be notified." +
        "\n**/give <card acronym> <user>**: Give a card from your collection to specified user." +
        "\n**/card <card acronym>**: Display a specific card from its acronym. eg : SUM-1." +
        "\n**/extension**: Display all available extensions." +
        "\n**/extension <extension acronym>**: Display a specific extension with all its card. You can **select the extension** to only roll cards from it." +
        "\n**/help**: Display this message." +
        "\n**/stats <user>**: Display user roll's stats."
    ) {}
}

export class English extends Language{
    constructor(){
        super();
    }
}

export const en = new English();