//
//  BLEPeripheralModule.swift
//  frontend
//
//  Created by Fabrizio Vanzani on 25/10/25.
//

import Foundation

@objc(BLEPeripheralModule)
class BLEPeripheralModule: NSObject {
  @objc(startPeripheral:transaction:)
  func startPeripheral(receiverName: NSString, transactionData: NSDictionary) {
    guard
      let receiver = transactionData["receiver"] as? String,
      let secureToken = transactionData["secureToken"] as? [String: String],
      let msg = secureToken["message"],
      let sig = secureToken["signature"],
      let payeeId = transactionData["payeeId"] as? String
    else {
      return;
    }
    
    let amount = (transactionData["amount"] as? NSNumber)?.floatValue ?? 0
    let model = Transaction(
      payeeId: payeeId,
      receiver: receiver,
      amount: amount,
      secureToken: SecureToken(message: msg, signature: sig),
      concept: transactionData["concept"] as? String
    )
    
    BLEPeripheral.shared.startAdvertising(receiverName: receiverName as String, transactionData: model);
  }
  
  @objc(stopPeripheral)
  func stopPeripheral() {
    BLEPeripheral.shared.stopAdvertising();
  }
  
  @objc(send:)
  func send(_ data: NSString) {
    guard let data = Data(base64Encoded: data as String) else {
      return;
    }
    
    BLEPeripheral.shared.send(data: data);
  }
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
