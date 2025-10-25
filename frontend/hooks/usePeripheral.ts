import { NativeModules } from "react-native";

const { BLEPeripheralModule } = NativeModules;

const usePeripheral = () => {
    const startAdvertising = () => {
        BLEPeripheralModule.startPeripheral("Receiver");
    }
    
    const stopAdverstising = () => {
        BLEPeripheralModule.stopPeripheral();
    }

    return {
        startAdvertising,
        stopAdverstising
    };
}

export default usePeripheral;