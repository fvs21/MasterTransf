import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";
import { Buffer } from 'buffer';
global.Buffer = Buffer;

const serviceUUID = "1D83F5C9-5ED8-43FB-B3C3-A9806CF73558";
const txCharUUID = "18D96145-1EF7-4AD8-9BCA-97DCFA077C06";

interface BluetoothLowEnergyAPI {
    bleManager: BleManager;
    requestPermissions: () => Promise<boolean>;
    scanForPeripherals: (timeoutMs?: number) => void;
    stopScan: () => void;
    allDevices: Device[];
    connectAndSubscribe: (deviceId: string, onMsg: (msg: string) => void) => Promise<void>;
    disconnect: (deviceId?: string) => Promise<void>;
}

const RSSI_MIN = -40;

function useBLE(): BluetoothLowEnergyAPI {
    const bleManager = useMemo(() => new BleManager(), []);
    const [allDevices, setAllDevices] = useState<Device[]>([]);

    const requestPermissions = async () => {
        return true;
    };

    const upsertDevice = useCallback((d: Device) => {
        setAllDevices(prev => {
            const idx = prev.findIndex(x => x.id === d.id);
            if (idx === -1) return [...prev, d];
            const copy = prev.slice();
            copy[idx] = d;
            return copy;
        });
    }, []);

    const scanForPeripherals = useCallback(() => {
        bleManager.startDeviceScan([serviceUUID], { allowDuplicates: true }, (error, device) => {
            if (error) {
                console.log("scan error:", error);
                bleManager.stopDeviceScan();
                return;
            }

            if (!device) return;          

            const rssi = device.rssi ?? -999;

            if ((device.localName?.startsWith("Receiver") || device.name?.startsWith("Receiver")) && rssi >= RSSI_MIN) {
                upsertDevice(device);
            }
        });
    }, [bleManager, upsertDevice]);

    const stopScan = useCallback(() => {
        bleManager.stopDeviceScan();
    }, [bleManager]);

    const connectAndSubscribe = useCallback(
        async (deviceId: string, onMsg: (msg: string) => void) => {
            const device = await bleManager.connectToDevice(deviceId, { requestMTU: 185 }).catch(e => {
                console.warn("connect error", e);
                throw e;
            });

            const d2 = await device.discoverAllServicesAndCharacteristics();

            d2.monitorCharacteristicForService(serviceUUID, txCharUUID, (error, char) => {
                if (error) {
                    console.warn("notify error", error);
                    return;
                }
                
                const b64 = char?.value;
                const text = b64 ? Buffer.from(b64, "base64").toString("utf8") : "";

                if (text === "BUSY") {
                    return;
                }
                if (text) onMsg(text);
            });
        },
        [bleManager]
    );

    const disconnect = useCallback(
        async (deviceId?: string) => {
            if (deviceId) {
                try { await bleManager.cancelDeviceConnection(deviceId); } catch { }
            } else {
                const conns = await bleManager.connectedDevices([serviceUUID]);
                await Promise.all(conns.map(d => bleManager.cancelDeviceConnection(d.id).catch(() => { })));
            }
        },
        [bleManager]
    );

    useEffect(() => {
        return () => {
            stopScan();
            bleManager.destroy();
        };
    }, [bleManager, stopScan]);

    return {
        bleManager,
        requestPermissions,
        scanForPeripherals,
        stopScan,
        allDevices,
        connectAndSubscribe,
        disconnect,
    };
}

export default useBLE;