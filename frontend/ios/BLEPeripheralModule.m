//
//  BLEPeripheralModule.m
//  frontend
//
//  Created by Fabrizio Vanzani on 25/10/25.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BLEPeripheralModule, NSObject)
RCT_EXTERN_METHOD(startPeripheral: (NSString *)receiverName
                  transaction: (NSDictionary*)transaction)
RCT_EXTERN_METHOD(stopPeripheral)
RCT_EXTERN_METHOD(send:(NSString *)data)
@end
