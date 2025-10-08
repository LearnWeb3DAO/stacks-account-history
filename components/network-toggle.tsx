"use client";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNetwork, type Network } from "@/contexts/network-context";
import { Globe, Wifi } from "lucide-react";

export function NetworkToggle() {
  const { network, setNetwork } = useNetwork();

  const handleNetworkChange = (value: Network) => {
    setNetwork(value); // Update context without reloading
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {network === "mainnet" ? (
          <Globe className="h-4 w-4 text-green-600" />
        ) : (
          <Wifi className="h-4 w-4 text-orange-600" />
        )}
        <Badge variant={network === "mainnet" ? "default" : "secondary"}>
          {network === "mainnet" ? "Mainnet" : "Testnet"}
        </Badge>
      </div>

      <Select value={network} onValueChange={handleNetworkChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mainnet">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              Mainnet
            </div>
          </SelectItem>
          <SelectItem value="testnet">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-orange-600" />
              Testnet
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}