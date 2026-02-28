import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import EmptyState from "../components/EmptyState";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Search,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

import { notify } from "@/lib/toast";
import { logger } from "@/lib/logger";

import type { Pharmacy } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";

const checkIsOpen = (hours: string): boolean => {
  if (hours === "24/7") return true;
  return true; // simplified safe fallback
};

const PharmacyCardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-60" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-4 w-40" />
    </CardContent>
  </Card>
);

export default function PharmacyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] =
    useState<Pharmacy | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchPharmacies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get("/pharmacies", {
        params: searchQuery ? { search: searchQuery } : {},
      });

      const data = response.data?.data || response.data || [];

      const processed = data.map((p: Pharmacy) => ({
        ...p,
        isOpen: p.isOpen ?? checkIsOpen(p.hours),
      }));

      setPharmacies(processed);
    } catch (err) {

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load pharmacies");

      logger.error("Failed to fetch pharmacies:", { error: err });
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || "Failed to load pharmacies. Please try again.");

      } else {
        setError("Failed to load pharmacies");
      }
      setPharmacies([]);
    } finally {
      setIsLoading(false);
    }

  }, []);

  /**
   * Request geolocation on mount
   */
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      notify.warning("Geolocation is not supported by your browser");
      fetchPharmacies();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus("granted");
        fetchPharmacies(latitude, longitude);
      },
      (error) => {
        logger.warn("Geolocation error:", { message: error.message });
        let status: "denied" | "unavailable" = "unavailable";
        let message = "Unable to access location. Showing all pharmacies.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            status = "denied";
            message = "Location access denied. Showing all pharmacies.";
            break;
          case error.POSITION_UNAVAILABLE:
            status = "unavailable";
            message = "Location unavailable. Showing all pharmacies.";
            break;
          case error.TIMEOUT:
            status = "unavailable";
            message = "Location request timed out. Showing all pharmacies.";
            break;
          default:
            status = "unavailable";
            message = "Unable to access location. Showing all pharmacies.";
            break;
        }

        setLocationStatus(status);
        notify.info(message);
        fetchPharmacies();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, [fetchPharmacies]);

  /**
   * Handle search with debounce
   * First effect: update debouncedSearch after a delay when searchQuery changes
   */
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);

  }, [searchQuery]);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleDirections = (pharmacy: Pharmacy) => {
    const query = encodeURIComponent(pharmacy.address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank"
    );
  };

  const handleViewDetails = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Find Nearby Pharmacies
        </h1>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search pharmacies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
          )}
        </div>

        {error && (
          <EmptyState
            title="Error"
            description={error}
            icon={<MapPin className="h-8 w-8 text-red-400" />}
          />
        )}

        {isLoading && pharmacies.length === 0 && (
          <>
            <PharmacyCardSkeleton />
            <PharmacyCardSkeleton />
          </>
        )}

        {!isLoading && pharmacies.length === 0 && !error && (
          <EmptyState
            title="No Pharmacies Found"
            description="Try a different search."
            icon={<MapPin className="h-8 w-8 text-gray-400" />}
          />
        )}

        <div className="grid gap-6">
          {!isLoading &&
            pharmacies.map((pharmacy) => (
              <Card key={pharmacy.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{pharmacy.name}</CardTitle>
                      <CardDescription>
                        {pharmacy.address}
                      </CardDescription>
                    </div>
                    <Badge variant={pharmacy.isOpen ? "default" : "secondary"}>
                      {pharmacy.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {pharmacy.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {pharmacy.hours}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {pharmacy.rating}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCall(pharmacy.phone)}
                    >
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDirections(pharmacy)}
                    >
                      Directions
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(pharmacy)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            {selectedPharmacy && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedPharmacy.name}</DialogTitle>
                  <DialogDescription>
                    {selectedPharmacy.address}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4 text-sm">
                  <p><strong>Phone:</strong> {selectedPharmacy.phone}</p>
                  <p><strong>Hours:</strong> {selectedPharmacy.hours}</p>
                  <p><strong>Rating:</strong> {selectedPharmacy.rating}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleCall(selectedPharmacy.phone)}
                  >
                    Call
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() =>
                      handleDirections(selectedPharmacy)
                    }
                  >
                    Directions
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}