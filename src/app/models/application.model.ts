export class ApplicationModel {

    public name: string;
    public ipAddress: string;

    constructor() {}

    public static randomize(): ApplicationModel {
        const instance = new ApplicationModel();
        instance.name = ApplicationModel.generateName();
        instance.ipAddress = ApplicationModel.generateIp();
        return instance;
    }

    private static generateName(): string {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const length = 5;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return result;
    }

    private static generateIp(): string {
        const result = `${ApplicationModel.generateIpSegment()}.` +
                     `${ApplicationModel.generateIpSegment()}.` +
                     `${ApplicationModel.generateIpSegment()}.` +
                     `${ApplicationModel.generateIpSegment()}`;
        return result;
    }

    private static generateIpSegment(): number {
        return Math.floor(Math.random() * 255) + 1;
    }
}
