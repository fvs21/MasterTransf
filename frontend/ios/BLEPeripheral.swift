//
//  BLEPeripheral.swift
//  frontend
//
//  Created by Fabrizio Vanzani on 25/10/25.
//

import Foundation
import CoreBluetooth
import os.log

struct Transaction: Codable {
  let receiver: String
  let amount: Float32
  let secureToken: String
  let concept: String?
};

final class BLEPeripheral: NSObject, CBPeripheralManagerDelegate {
  static let shared = BLEPeripheral()
  
  private lazy var manager: CBPeripheralManager = {
    return CBPeripheralManager(delegate: self, queue: nil);
  }()
  
  private let serviceUUID = CBUUID(string: "1D83F5C9-5ED8-43FB-B3C3-A9806CF73558");
  private let txCharUUID = CBUUID(string: "18D96145-1EF7-4AD8-9BCA-97DCFA077C06");
  
  private var txCharacteristics: CBMutableCharacteristic!;
  private var primaryCentral: CBCentral? = nil;
  private var isAdvertising = false;
  private var outQueue: [Data] = [];
  private var sending = false;
  
  private var transactionData: Transaction?
  
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
  
  func startAdvertising(receiverName: String, transactionData: Transaction) {
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
    
    self.transactionData = transactionData
  }
  
  func stopAdvertising() {
    manager.stopAdvertising();
    isAdvertising = false;
  }
  
  private func enqueue(_ data: Data) {
    let maxChunk = 180;
    var idx = 0;
    
    while idx < data.count {
      let end = min(idx + maxChunk, data.count);
      outQueue.append(data.subdata(in: idx..<end))
      idx = end
    }
    
    drainQueue();
  }
  
  private func drainQueue() {
    guard manager.state == .poweredOn,
      txCharacteristics != nil,
      primaryCentral != nil,
      sending == false,
      outQueue.isEmpty == false else { return }
    
    sending = true
    defer { sending = false }
    
    while !outQueue.isEmpty {
      let chunk = outQueue[0];
      let ok = manager.updateValue(chunk, for: txCharacteristics, onSubscribedCentrals: nil);
      
      if ok {
        outQueue.removeFirst();
      } else {
        break;
      }
    }
  }
  
  func peripheralManagerIsReady(toUpdateSubscribers peripheral: CBPeripheralManager) {
      drainQueue()
  }
  
  func send(data: Data) {
    enqueue(data);
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
      
      do {
        let jsonData = try JSONEncoder().encode(transactionData)
        
        if let jsonString = String(data: jsonData, encoding: .utf8) {
          send(data: jsonData)
        }
      } catch {
        print(error)
      }
      
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
