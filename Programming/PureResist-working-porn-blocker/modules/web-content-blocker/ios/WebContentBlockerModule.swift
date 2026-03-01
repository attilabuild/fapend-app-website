import ExpoModulesCore
import FamilyControls
import ManagedSettings

public class WebContentBlockerModule: Module {
  private let store = ManagedSettingsStore()
  private let center = AuthorizationCenter.shared

  public func definition() -> ModuleDefinition {
    Name("WebContentBlocker")

    AsyncFunction("checkAvailability") { () -> [String: Any] in
      if #available(iOS 16, *) {
        return ["available": true, "deviceSupported": true]
      }
      return ["available": false, "deviceSupported": false, "error": "iOS 16+ required"]
    }

    AsyncFunction("requestAuthorization") { () async -> [String: Any] in
      guard #available(iOS 16, *) else {
        return ["status": "unavailable", "error": "iOS 16+ required"]
      }
      do {
        try await center.requestAuthorization(for: .individual)
        return ["status": "\(center.authorizationStatus)"]
      } catch {
        return ["status": "error", "error": error.localizedDescription]
      }
    }

    Function("getAuthorizationStatus") { () -> [String: Any] in
      guard #available(iOS 16, *) else {
        return ["status": "unavailable"]
      }
      let status = center.authorizationStatus
      return ["status": "\(status)"]
    }

    Function("isBlockingActive") { () -> Bool in
      guard #available(iOS 16, *) else { return false }
      if let blocked = store.webContent.blockedByFilter {
        switch blocked {
        case .none:
          return false
        case .specific(let domains):
          return !domains.isEmpty
        @unknown default:
          return false
        }
      }
      return false
    }

    AsyncFunction("setBlockedDomains") { (domains: [String]) -> [String: Any] in
      guard #available(iOS 16, *) else {
        return ["enabled": false, "error": "iOS 16+ required"]
      }
      guard center.authorizationStatus == .approved else {
        return ["enabled": false, "error": "Authorization required"]
      }
      let webDomains: Set<WebDomain> = Set(domains.map { WebDomain(domain: $0) })
      store.webContent.blockedByFilter = .specific(webDomains)
      return ["enabled": true]
    }

    AsyncFunction("disableBlocking") { () -> [String: Any] in
      guard #available(iOS 16, *) else {
        return ["disabled": false, "error": "iOS 16+ required"]
      }
      guard center.authorizationStatus == .approved else {
        return ["disabled": false, "error": "Authorization required"]
      }
      store.webContent.blockedByFilter = .none
      return ["disabled": true]
    }
  }
}

