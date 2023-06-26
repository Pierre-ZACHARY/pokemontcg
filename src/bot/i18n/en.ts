export class Language{
    constructor(
        public alreadyClaimed: string = "You already claimed all your daily coins, come back later.",
        public firstClaim: string = "Hello {0}, this is your first time claiming coins, you got 200 coins extra!",
        public claimAmount: string = "You claimed {0} coins."
    ) {}
}

export class English extends Language{
    constructor(){
        super();
    }
}

export const en = new English();