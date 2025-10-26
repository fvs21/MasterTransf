import { NativeModules } from "react-native";

const { BLEPeripheralModule } = NativeModules;

export type Transaction = {
    receiver: string;
    payeeId: string;
    amount: number;
    secureToken: string;
    concept?: string;
}

const usePeripheral = () => {    
    const startAdvertising = (transaction: Transaction) => {
        BLEPeripheralModule.startPeripheral("Receiver", transaction);
    }
    
    const stopAdvertising = () => {
        BLEPeripheralModule.stopPeripheral();
    }

    const send = (data: any) => {
        const payload = JSON.stringify(data);
        const base64 = Buffer.from(payload, 'utf8').toString('base64');
        BLEPeripheralModule.send(base64);
    }

    return {
        startAdvertising,
        stopAdvertising,
        send
    };
}

export default usePeripheral;