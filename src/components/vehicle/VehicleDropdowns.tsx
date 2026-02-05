import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Car, Truck, Bike } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarModel3D {
  id: string;
  make: string;
  model: string;
  year: number | null;
  default_color: string | null;
}

export type VehicleCategory = "sedan" | "suv" | "hatchback" | "coupe" | "convertible" | "pickup" | "van" | "bike";

interface VehicleDropdownsProps {
  vehicleType?: VehicleCategory;
  make: string;
  model: string;
  year: string;
  color: string;
  registrationNumber: string;
  onVehicleTypeChange?: (type: VehicleCategory) => void;
  onMakeChange: (make: string) => void;
  onModelChange: (model: string) => void;
  onYearChange: (year: string) => void;
  onColorChange: (color: string) => void;
  onRegistrationChange: (regNumber: string) => void;
  showVehicleType?: boolean;
}

const VEHICLE_TYPES: { id: VehicleCategory; label: string; icon: React.ElementType }[] = [
  { id: "sedan", label: "Sedan", icon: Car },
  { id: "suv", label: "SUV", icon: Truck },
  { id: "hatchback", label: "Hatchback", icon: Car },
  { id: "coupe", label: "Coupe", icon: Car },
  { id: "convertible", label: "Convertible", icon: Car },
  { id: "pickup", label: "Pickup", icon: Truck },
  { id: "van", label: "Van", icon: Truck },
  { id: "bike", label: "Bike", icon: Bike },
];

export function VehicleDropdowns({
  vehicleType = "sedan",
  make,
  model,
  year,
  color,
  registrationNumber,
  onVehicleTypeChange,
  onMakeChange,
  onModelChange,
  onYearChange,
  onColorChange,
  onRegistrationChange,
  showVehicleType = false,
}: VehicleDropdownsProps) {
  const [carModels, setCarModels] = useState<CarModel3D[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCustomMake, setIsCustomMake] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isCustomYear, setIsCustomYear] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);

  // Fetch car models from database
  useEffect(() => {
    const fetchCarModels = async () => {
      try {
        const { data, error } = await supabase
          .from("car_models_3d")
          .select("id, make, model, year, default_color")
          .eq("is_active", true)
          .order("make");

        if (error) {
          console.error("Error fetching car models:", error);
          return;
        }

        console.log("Fetched car models:", data);
        setCarModels(data || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarModels();
  }, []);

  // Get unique makes from uploaded models (trimmed)
  const availableMakes = [...new Set(carModels.map((m) => m.make.trim()))].sort();

  // Get models for selected make (compare trimmed values)
  const availableModels = make && !isCustomMake
    ? [...new Set(carModels.filter((m) => m.make.trim() === make.trim()).map((m) => m.model.trim()))].sort()
    : [];

  // Get years for selected make + model
  const availableYears = make && model && !isCustomMake && !isCustomModel
    ? [...new Set(carModels
        .filter((m) => m.make.trim() === make.trim() && m.model.trim() === model.trim() && m.year)
        .map((m) => m.year!))]
        .sort((a, b) => b - a)
    : [];

  // Get colors for selected make + model
  const availableColors = make && model && !isCustomMake && !isCustomModel
    ? [...new Set(carModels
        .filter((m) => m.make.trim() === make.trim() && m.model.trim() === model.trim() && m.default_color)
        .map((m) => m.default_color!))]
    : [];

  // Reset downstream when upstream changes
  useEffect(() => {
    if (isCustomMake) {
      setIsCustomModel(true);
      setIsCustomYear(true);
      setIsCustomColor(true);
    }
  }, [isCustomMake]);

  useEffect(() => {
    if (isCustomModel && !isCustomMake) {
      setIsCustomYear(true);
      setIsCustomColor(true);
    }
  }, [isCustomModel, isCustomMake]);

  const handleMakeSelect = (value: string) => {
    console.log("handleMakeSelect called with:", value);
    if (value === "__custom__") {
      setIsCustomMake(true);
      onMakeChange("");
      onModelChange("");
      onYearChange("");
      onColorChange("");
    } else {
      setIsCustomMake(false);
      setIsCustomModel(false);
      setIsCustomYear(false);
      setIsCustomColor(false);
      onMakeChange(value);
      // Don't call onModelChange here - let parent handle the cascade
    }
  };

  const handleModelSelect = (value: string) => {
    console.log("handleModelSelect called with:", value);
    if (value === "__custom__") {
      setIsCustomModel(true);
      setIsCustomYear(true);
      setIsCustomColor(true);
      onModelChange("");
      onYearChange("");
      onColorChange("");
    } else {
      setIsCustomModel(false);
      setIsCustomYear(false);
      setIsCustomColor(false);
      onModelChange(value);
      onYearChange("");
      onColorChange("");

      // Auto-set color if there's only one
      const modelColors = carModels
        .filter((m) => m.make.trim() === make.trim() && m.model.trim() === value.trim() && m.default_color)
        .map((m) => m.default_color!);
      const uniqueColors = [...new Set(modelColors)];
      if (uniqueColors.length === 1) {
        onColorChange(uniqueColors[0]);
      }
    }
  };

  const handleYearSelect = (value: string) => {
    if (value === "__custom__") {
      setIsCustomYear(true);
      onYearChange("");
    } else {
      setIsCustomYear(false);
      onYearChange(value);
    }
  };

  const handleColorSelect = (value: string) => {
    if (value === "__custom__") {
      setIsCustomColor(true);
      onColorChange("");
    } else {
      setIsCustomColor(false);
      onColorChange(value);
    }
  };

  // Debug logging
  console.log("VehicleDropdowns render - make:", make, "availableModels:", availableModels, "isCustomMake:", isCustomMake);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading vehicle options...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vehicle Type Selector */}
      {showVehicleType && onVehicleTypeChange && (
        <div className="space-y-2">
          <Label>Vehicle Type *</Label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {VEHICLE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => onVehicleTypeChange(type.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                  vehicleType === type.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <type.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Make / Brand */}
        <div>
          <Label>Brand *</Label>
          {isCustomMake ? (
            <div className="flex gap-2 mt-1.5">
              <Input
                value={make}
                onChange={(e) => onMakeChange(e.target.value)}
                placeholder="Enter brand (e.g., BMW)"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  setIsCustomMake(false);
                  onMakeChange("");
                  onModelChange("");
                  onYearChange("");
                  onColorChange("");
                }}
                className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                Back
              </button>
            </div>
          ) : (
            <Select value={make || undefined} onValueChange={handleMakeSelect}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-[300px]">
                {availableMakes.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No vehicles uploaded yet
                  </div>
                ) : (
                  availableMakes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))
                )}
                <SelectItem value="__custom__" className="text-muted-foreground border-t mt-1 pt-1">
                  ↳ None of these (enter manually)
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Model */}
        <div>
          <Label>Model *</Label>
          {isCustomModel || isCustomMake ? (
            <div className="flex gap-2 mt-1.5">
              <Input
                value={model}
                onChange={(e) => onModelChange(e.target.value)}
                placeholder="Enter model (e.g., M3)"
                className="flex-1"
                disabled={!make}
              />
              {!isCustomMake && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomModel(false);
                    onModelChange("");
                    onYearChange("");
                    onColorChange("");
                  }}
                  className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  Back
                </button>
              )}
            </div>
          ) : (
            <Select 
              value={model || undefined} 
              onValueChange={handleModelSelect} 
              disabled={!make || availableModels.length === 0}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={!make ? "Select brand first" : availableModels.length === 0 ? "No models available" : "Select model"} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-[300px]">
                {availableModels.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No models for this brand
                  </div>
                ) : (
                  availableModels.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))
                )}
                <SelectItem value="__custom__" className="text-muted-foreground border-t mt-1 pt-1">
                  ↳ None of these (enter manually)
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Year */}
        <div>
          <Label>Year</Label>
          {isCustomYear || isCustomModel || isCustomMake ? (
            <div className="flex gap-2 mt-1.5">
              <Input
                value={year}
                onChange={(e) => onYearChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="Enter year (e.g., 2023)"
                className="flex-1"
                disabled={!model}
              />
              {!isCustomMake && !isCustomModel && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomYear(false);
                    onYearChange("");
                  }}
                  className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  Back
                </button>
              )}
            </div>
          ) : (
            <Select value={year || undefined} onValueChange={handleYearSelect} disabled={!model}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={model ? "Select year" : "Select model first"} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-[300px]">
                {availableYears.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No year data available
                  </div>
                ) : (
                  availableYears.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))
                )}
                <SelectItem value="__custom__" className="text-muted-foreground border-t mt-1 pt-1">
                  ↳ None of these (enter manually)
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Color */}
        <div>
           <Label>Color <span className="text-muted-foreground font-normal">(optional - uses default if empty)</span></Label>
          {isCustomColor || isCustomModel || isCustomMake ? (
            <div className="flex gap-2 mt-1.5">
              <Input
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                placeholder="Enter color"
                className="flex-1"
              />
              {!isCustomMake && !isCustomModel && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomColor(false);
                    onColorChange("");
                  }}
                  className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  Back
                </button>
              )}
            </div>
          ) : (
            <Select value={color || undefined} onValueChange={handleColorSelect} disabled={!model}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder={model ? "Select color" : "Select model first"} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-[300px]">
                {availableColors.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No color data available
                  </div>
                ) : (
                  availableColors.map((c) => (
                    <SelectItem key={c} value={c}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: c }}
                        />
                        {c}
                      </div>
                    </SelectItem>
                  ))
                )}
                <SelectItem value="__custom__" className="text-muted-foreground border-t mt-1 pt-1">
                  ↳ None of these (enter manually)
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Registration Number */}
        <div className="sm:col-span-2">
          <Label>Registration Number</Label>
          <Input
            value={registrationNumber}
            onChange={(e) => onRegistrationChange(e.target.value.toUpperCase())}
            placeholder="e.g., MH 12 AB 1234"
            className="mt-1.5 uppercase font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">Automatically converted to uppercase</p>
        </div>
      </div>
    </div>
  );
}
