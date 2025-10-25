//
//  BLEPeripheral.swift
//  frontend
//
//  Created by Fabrizio Vanzani on 25/10/25.
//

import Foundation
import CoreBluetooth
import os.log

final class BLEPeripheral: NSObject, CBPeripheralManagerDelegate {
  static let shared = BLEPeripheral()
  
  private lazy var manager: CBPeripheralManager = {
    CBPeripheralManager(delegate: self, queue: nil);
  }()
  
  private let serviceUUID = CBUUID(string: "1D83F5C9-5ED8-43FB-B3C3-A9806CF73558");
  private let txCharUUID = CBUUID(string: "18D96145-1EF7-4AD8-9BCA-97DCFA077C06");
  
  private var txCharacteristics: CBMutableCharacteristic!;
  private var primaryCentral: CBCentral? = nil;
  private var isAdvertising = false;
  private var outQueue: [Data] = [];
  private var sending = false;

  
  private override init() {
    super.init();
  }
  
  func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
    
  }
  
  private func setupService() {
    txCharacteristics = CBMutableCharacteristic(
      type: txCharUUID,
      properties: [.notify],
      value: nil,
      permissions: [.readable]
    );
    
    
    let service = CBMutableService(type: serviceUUID, primary: true);
    service.characteristics = [txCharacteristics];
    manager.add(service)
  }
  
  func startAdvertising(receiverName: String) {
    guard manager.state == .poweredOn else {
      os_log("Manager is not poweredOn")
      return;
    }
    
    if txCharacteristics == nil {
      setupService();
    }
    
    let adv: [String: Any] = [
      CBAdvertisementDataServiceUUIDsKey: [serviceUUID],
      CBAdvertisementDataLocalNameKey: receiverName
    ];
    
    manager.startAdvertising(adv);
    isAdvertising = true;
  }
  
  func stopAdvertising() {
    manager.stopAdvertising();
    isAdvertising = false;
  }
  
  func send(text: String) {
    guard let d = text.data(using: .utf8) else { return };
    
    let success = manager.updateValue(d, for: txCharacteristics, onSubscribedCentrals: nil);
    
    if !success {
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
        self?.send(text: text);
      }
    }
  }
  
  private func sendBusy(to central: CBCentral) {
    if let d = "BUSY".data(using: .utf8), let tx = txCharacteristics {
      _ = manager.updateValue(d, for: tx, onSubscribedCentrals: [central])
    }
  }
  
  func peripheralManager(_ peripheral: CBPeripheralManager, central: CBCentral, didSubscribeTo characteristic: CBCharacteristic) {
    guard characteristic.uuid == txCharUUID else { return };
    
    if primaryCentral == nil {
      primaryCentral = central;
      
      if isAdvertising { stopAdvertising() }
      
      send(text: "HELLO");
    } else if central.identifier != primaryCentral?.identifier {
      sendBusy(to: central);
    }
  }
  
  func peripheralManager(_ peripheral: CBPeripheralManager, central: CBCentral, didUnsubscribeFrom characteristic: CBCharacteristic) {
    guard characteristic.uuid == txCharUUID else { return }
    
    if central.identifier == primaryCentral?.identifier {
      primaryCentral = nil;
    }
  }
}
