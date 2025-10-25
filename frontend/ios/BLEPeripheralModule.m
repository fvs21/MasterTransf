//
//  BLEPeripheralModule.m
//  frontend
//
//  Created by Fabrizio Vanzani on 25/10/25.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BLEPeripheralModule, NSObject)
RCT_EXTERN_METHOD(startPeripheral: (NSString *)receiverName)
RCT_EXTERN_METHOD(stopPeripheral)
@end
