"use client";

import {
  AppConfig,
  showConnect,
  type UserData,
  UserSession,
} from "@stacks/connect";
import { STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import { useNetwork } from "@/contexts/network-context";
import { useEffect, useMemo, useState } from "react";

// Key where Stacks stores session info
const SESSION_KEY = "blockstack-session";

// Function to validate session structure
function isValidSessionData(json: any): boolean {
  return json && typeof json === "object" && typeof json.version === "string";
}

export function useStacks() {
  const { network, getApiUrl } = useNetwork();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Create Stacks network instance based on current network
  const stacksNetwork = useMemo(() => {
    const apiUrl = getApiUrl();
    if (network === "mainnet") {
      return { ...STACKS_MAINNET, url: apiUrl };
    }
    return { ...STACKS_TESTNET, url: apiUrl };
  }, [network, getApiUrl]);

  // Create AppConfig with the current Stacks network
  const appConfig = useMemo(
    () => new AppConfig(["store_write"], undefined, undefined, undefined, stacksNetwork.url),
    [stacksNetwork]
  );

  // Initialize UserSession
  const userSession = useMemo(() => {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(SESSION_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!isValidSessionData(parsed)) {
          console.warn("Invalid session schema. Clearing corrupted session.");
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (err) {
        console.warn("Failed to parse session JSON. Clearing corrupted session.");
        localStorage.removeItem(SESSION_KEY);
      }
    }

    return new UserSession({ appConfig });
  }, [appConfig]);

  function connectWallet() {
    if (!userSession) return;

    showConnect({
      appDetails: {
        name: "Stacks Account History",
        icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
      },
      onFinish: () => {
        setUserData(userSession.loadUserData()); // Update userData without reloading
      },
      onCancel: () => {
        console.log("Wallet connection cancelled");
      },
      userSession,
    });
  }

  function disconnectWallet() {
    if (!userSession) return;

    userSession.signUserOut();
    localStorage.removeItem(SESSION_KEY); // Clear session data on disconnect
    setUserData(null);
  }

  useEffect(() => {
    if (!userSession) return;

    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    }
  }, [userSession]);

  return { userData, connectWallet, disconnectWallet, network };
}