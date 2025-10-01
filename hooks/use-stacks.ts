"use client";

import { AppConfig, UserSession } from "@stacks/connect";
import type { UserData } from "@stacks/connect";
import { useEffect, useMemo, useState } from "react";

export function useStacks() {
  // Initially when the user is not logged in, userData is null
  const [userData, setUserData] = useState<UserData | null>(null);

  const appConfig = useMemo(() => new AppConfig(["store_write"]), []);
  const userSession = useMemo(() => new UserSession({ appConfig }), [appConfig]);

  async function connectWallet() {
    const { showConnect } = await import("@stacks/connect");

    showConnect({
      appDetails: {
        name: "Stacks Account History",
        icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
      },
      onFinish: () => {
        // reload the webpage when wallet connection succeeds
        // to ensure that the user session gets populated from local storage
        window.location.reload();
      },
      userSession,
    });
  }

  function disconnectWallet() {
    // sign out the user and close their session
    // also clear out the user data
    userSession.signUserOut();
    setUserData(null);
  }

  // When the page first loads, if the user is already signed in,
  // set the userData
  // If the user has a pending sign-in instead, resume the sign-in flow
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    }
  }, []);

  // return the user data, connect wallet function, and disconnect wallet function
  return { userData, connectWallet, disconnectWallet, userSession };
}
