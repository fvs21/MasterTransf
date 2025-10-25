import { useMemo, useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";

interface BluetoothLowEnergyAPI {
    requestPermissions(): Promise<boolean>;
    scanForPeripherals(): void;
    allDevices: Device[];
}

function useBLE(): BluetoothLowEnergyAPI {
    const bleManager = useMemo(() => new BleManager(), []);

    const [allDevices, setAllDevices] = useState<Device[]>([]);

    const requestPermissions = async () => {
        return true;
    }

    const isDuplicateDevice = (devices: Device[], nextDevice: Device) => 
        devices.findIndex((device) => nextDevice.id === device.id);

    const scanForPeripherals = () => {
        console.log("Unc");
        
        bleManager.startDeviceScan(null, null, (error, device) => {
            if (error)
                console.log(error);

            if (device)
                setAllDevices((prevState) => {
                    return [...prevState, device]
                });
        }); 
    }

    return {
        requestPermissions,
        scanForPeripherals,
        allDevices
    }
}

export default useBLE;