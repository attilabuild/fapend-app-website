//
//  Records.swift
//  Pods
//
//  Created by Serhii Fozykosh on 12.07.2025.
//

import Foundation
import ExpoModulesCore

struct FamilyControlsAvailability: Record {
    @Field
    var isAvailable: Bool = false
    
    @Field
    var deviceSupported: Bool = false
    
}
