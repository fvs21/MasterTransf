//
//  BLEPeripheralModule.swift
//  frontend
//
//  Created by Fabrizio Vanzani on 25/10/25.
//

import Foundation

@objc(BLEPeripheralModule)
class BLEPeripheralModule: NSObject {
  @objc(startPeripheral:)
  func startPeripheral(_ receiverName: NSString) {
    BLEPeripheral.shared.startAdvertising(receiverName: receiverName as String)
  }
  
  @objc(stopPeripheral)
  func stopPeripheral() {
    BLEPeripheral.shared.stopAdvertising();
  }
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
