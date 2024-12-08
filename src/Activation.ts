class Activation {
    constructor(settings: Settings = anura.settings) {
        this.activated =
            settings.get("product-key") !== undefined &&
            this.validate(settings.get("product-key"));
    }

    activated: boolean;

    validate(key: string): boolean {
        // Split the key into parts based on the hyphen
        const parts = key.split("-");
        if (parts.length !== 2) return false;

        const prefix = parts[0];
        const suffix = parts[1];

        // Validate prefix: 3 digits, not starting with '0'
        if (
            !prefix ||
            prefix?.length !== 3 ||
            isNaN(Number(prefix)) ||
            prefix.startsWith("0")
        )
            return false;

        // Validate suffix: 7 digits
        if (!suffix || suffix?.length !== 7 || isNaN(Number(suffix)))
            return false;

        // Calculate sum of digits in the suffix
        let sum = 0;
        for (let i = 0; i < suffix.length; i++) {
            sum += parseInt(suffix![i]!, 10);
        }

        // The sum of the digits should be divisible by 7
        const res = sum % 7 === 0;
        console.log(res);
        return res;
    }

    refreshActivationState() {
        this.activated =
            anura.settings.get("product-key") !== undefined &&
            this.validate(anura.settings.get("product-key"));
    }
}
