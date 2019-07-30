export class ApplicationModel {

    public id: string;

    public name: string;

    public ipAddress: string;

    constructor() {}

    public static randomize(): ApplicationModel {
        const instance = new ApplicationModel();
        instance.name = ApplicationModel.generateName();
        instance.ipAddress = ApplicationModel.generateIp();
        instance.id = ApplicationModel.generateGuid();
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

    private static generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0,
              v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }
}
