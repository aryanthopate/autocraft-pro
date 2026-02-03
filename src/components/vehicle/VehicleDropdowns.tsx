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
import { VEHICLE_MAKES, VEHICLE_COLORS, getModelsForMake, getYearsForModel } from "@/data/vehicleData";

interface VehicleDropdownsProps {
  make: string;
  model: string;
  year: string;
  color: string;
  registrationNumber: string;
  onMakeChange: (make: string) => void;
  onModelChange: (model: string) => void;
  onYearChange: (year: string) => void;
  onColorChange: (color: string) => void;
  onRegistrationChange: (regNumber: string) => void;
}

export function VehicleDropdowns({
  make,
  model,
  year,
  color,
  registrationNumber,
  onMakeChange,
  onModelChange,
  onYearChange,
  onColorChange,
  onRegistrationChange,
}: VehicleDropdownsProps) {
  const [isCustomMake, setIsCustomMake] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isCustomYear, setIsCustomYear] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);

  const availableModels = make && !isCustomMake ? getModelsForMake(make) : [];
  const availableYears = make && model && !isCustomMake && !isCustomModel 
    ? getYearsForModel(make, model) 
    : [];

  // Reset downstream when upstream changes
  useEffect(() => {
    if (isCustomMake) {
      setIsCustomModel(true);
      setIsCustomYear(true);
    }
  }, [isCustomMake]);

  useEffect(() => {
    if (isCustomModel && !isCustomMake) {
      setIsCustomYear(true);
    }
  }, [isCustomModel, isCustomMake]);

  const handleMakeSelect = (value: string) => {
    if (value === "__custom__") {
      setIsCustomMake(true);
      onMakeChange("");
      onModelChange("");
      onYearChange("");
    } else {
      setIsCustomMake(false);
      setIsCustomModel(false);
      setIsCustomYear(false);
      onMakeChange(value);
      onModelChange("");
      onYearChange("");
    }
  };

  const handleModelSelect = (value: string) => {
    if (value === "__custom__") {
      setIsCustomModel(true);
      setIsCustomYear(true);
      onModelChange("");
      onYearChange("");
    } else {
      setIsCustomModel(false);
      setIsCustomYear(false);
      onModelChange(value);
      onYearChange("");
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

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {/* Make */}
      <div>
        <Label>Make *</Label>
        {isCustomMake ? (
          <div className="flex gap-2 mt-1.5">
            <Input
              value={make}
              onChange={(e) => onMakeChange(e.target.value)}
              placeholder="Enter make (e.g., Toyota)"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => {
                setIsCustomMake(false);
                onMakeChange("");
                onModelChange("");
                onYearChange("");
              }}
              className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              Back
            </button>
          </div>
        ) : (
          <Select value={make} onValueChange={handleMakeSelect}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {VEHICLE_MAKES.map((m) => (
                <SelectItem key={m.name} value={m.name}>
                  {m.name}
                </SelectItem>
              ))}
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
              placeholder="Enter model (e.g., Camry)"
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
                }}
                className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                Back
              </button>
            )}
          </div>
        ) : (
          <Select value={model} onValueChange={handleModelSelect} disabled={!make}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder={make ? "Select model" : "Select make first"} />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {availableModels.map((m) => (
                <SelectItem key={m.name} value={m.name}>
                  {m.name}
                </SelectItem>
              ))}
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
          <Select value={year} onValueChange={handleYearSelect} disabled={!model}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder={model ? "Select year" : "Select model first"} />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {availableYears.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
              <SelectItem value="__custom__" className="text-muted-foreground border-t mt-1 pt-1">
                ↳ None of these (enter manually)
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Color */}
      <div>
        <Label>Color</Label>
        {isCustomColor ? (
          <div className="flex gap-2 mt-1.5">
            <Input
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              placeholder="Enter color"
              className="flex-1"
            />
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
          </div>
        ) : (
          <Select value={color} onValueChange={handleColorSelect}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {VEHICLE_COLORS.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-border" 
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                  </div>
                </SelectItem>
              ))}
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
  );
}
