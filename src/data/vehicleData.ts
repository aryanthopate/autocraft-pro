// Vehicle makes with their models, years, and available colors

export interface VehicleModel {
  name: string;
  years: number[];
}

export interface VehicleMake {
  name: string;
  models: VehicleModel[];
}

export const VEHICLE_COLORS = [
  { name: "White", hex: "#ffffff" },
  { name: "Pearl White", hex: "#f5f5f5" },
  { name: "Black", hex: "#1a1a1a" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "Grey", hex: "#808080" },
  { name: "Red", hex: "#dc2626" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Navy Blue", hex: "#1e3a5f" },
  { name: "Green", hex: "#16a34a" },
  { name: "Orange", hex: "#FF6600" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Brown", hex: "#78350f" },
  { name: "Beige", hex: "#d4c4a8" },
  { name: "Maroon", hex: "#7f1d1d" },
  { name: "Gold", hex: "#b8860b" },
  { name: "Champagne", hex: "#f7e7ce" },
];

export const VEHICLE_MAKES: VehicleMake[] = [
  {
    name: "BMW",
    models: [
      { name: "3 Series", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "5 Series", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "7 Series", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "M3", years: [2010, 2011, 2012, 2020, 2021, 2022, 2023, 2024] },
      { name: "M3 GTS", years: [2010, 2011, 2012] },
      { name: "M4", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "M5", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { name: "X1", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "X3", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "X5", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "X7", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
    ],
  },
  {
    name: "Mercedes-Benz",
    models: [
      { name: "A-Class", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "C-Class", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "E-Class", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "S-Class", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "GLA", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "GLC", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "GLE", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "GLS", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "AMG GT", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
    ],
  },
  {
    name: "Audi",
    models: [
      { name: "A3", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "A4", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "A6", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "A8", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Q3", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Q5", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Q7", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Q8", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "RS5", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { name: "RS7", years: [2020, 2021, 2022, 2023, 2024] },
    ],
  },
  {
    name: "Toyota",
    models: [
      { name: "Camry", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Corolla", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Innova Crysta", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Fortuner", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Glanza", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Urban Cruiser", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Land Cruiser", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { name: "Supra", years: [2020, 2021, 2022, 2023, 2024, 2025] },
    ],
  },
  {
    name: "Honda",
    models: [
      { name: "City", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Civic", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Amaze", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "WR-V", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { name: "Elevate", years: [2023, 2024, 2025] },
      { name: "CR-V", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Accord", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
    ],
  },
  {
    name: "Hyundai",
    models: [
      { name: "i20", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Verna", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Creta", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Venue", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Tucson", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Alcazar", years: [2021, 2022, 2023, 2024, 2025] },
      { name: "Ioniq 5", years: [2022, 2023, 2024, 2025] },
      { name: "Exter", years: [2023, 2024, 2025] },
    ],
  },
  {
    name: "Maruti Suzuki",
    models: [
      { name: "Swift", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Dzire", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Baleno", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Brezza", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Ertiga", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "XL6", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Grand Vitara", years: [2022, 2023, 2024, 2025] },
      { name: "Jimny", years: [2023, 2024, 2025] },
      { name: "Fronx", years: [2023, 2024, 2025] },
      { name: "Invicto", years: [2023, 2024, 2025] },
    ],
  },
  {
    name: "Tata",
    models: [
      { name: "Nexon", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Punch", years: [2021, 2022, 2023, 2024, 2025] },
      { name: "Harrier", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Safari", years: [2021, 2022, 2023, 2024, 2025] },
      { name: "Altroz", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Tiago", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Tigor", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Curvv", years: [2024, 2025] },
    ],
  },
  {
    name: "Mahindra",
    models: [
      { name: "XUV700", years: [2021, 2022, 2023, 2024, 2025] },
      { name: "XUV400", years: [2023, 2024, 2025] },
      { name: "Thar", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Scorpio-N", years: [2022, 2023, 2024, 2025] },
      { name: "Scorpio Classic", years: [2022, 2023, 2024, 2025] },
      { name: "XUV300", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Bolero", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
    ],
  },
  {
    name: "Kia",
    models: [
      { name: "Seltos", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Sonet", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Carens", years: [2022, 2023, 2024, 2025] },
      { name: "EV6", years: [2022, 2023, 2024, 2025] },
      { name: "Carnival", years: [2020, 2021, 2022, 2023, 2024] },
    ],
  },
  {
    name: "Royal Enfield",
    models: [
      { name: "Classic 350", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Hunter 350", years: [2022, 2023, 2024, 2025] },
      { name: "Meteor 350", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Himalayan", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Continental GT 650", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Interceptor 650", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Super Meteor 650", years: [2023, 2024, 2025] },
      { name: "Shotgun 650", years: [2024, 2025] },
    ],
  },
  {
    name: "Honda Bikes",
    models: [
      { name: "CB350", years: [2021, 2022, 2023, 2024, 2025] },
      { name: "CB300R", years: [2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Hornet 2.0", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Unicorn", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Activa 6G", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Dio", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Africa Twin", years: [2020, 2021, 2022, 2023, 2024, 2025] },
    ],
  },
  {
    name: "Yamaha",
    models: [
      { name: "R15 V4", years: [2021, 2022, 2023, 2024, 2025] },
      { name: "MT-15 V2", years: [2021, 2022, 2023, 2024, 2025] },
      { name: "FZ-S V4", years: [2023, 2024, 2025] },
      { name: "Fascino 125", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Aerox 155", years: [2022, 2023, 2024, 2025] },
      { name: "Ray ZR 125", years: [2020, 2021, 2022, 2023, 2024, 2025] },
    ],
  },
  {
    name: "KTM",
    models: [
      { name: "Duke 200", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Duke 390", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "RC 200", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "RC 390", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Adventure 390", years: [2020, 2021, 2022, 2023, 2024, 2025] },
    ],
  },
  {
    name: "Kawasaki",
    models: [
      { name: "Ninja 300", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Ninja 650", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Z650", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Z900", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Versys 650", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
    ],
  },
  {
    name: "Ducati",
    models: [
      { name: "Panigale V2", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Panigale V4", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Monster", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Scrambler", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Multistrada V4", years: [2021, 2022, 2023, 2024, 2025] },
    ],
  },
  {
    name: "Bajaj",
    models: [
      { name: "Pulsar NS200", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Pulsar RS200", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Dominar 400", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Chetak", years: [2021, 2022, 2023, 2024, 2025] },
    ],
  },
  {
    name: "TVS",
    models: [
      { name: "Apache RTR 200", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Apache RR 310", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Jupiter 125", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Ntorq 125", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "iQube", years: [2021, 2022, 2023, 2024, 2025] },
    ],
  },
  {
    name: "Ather",
    models: [
      { name: "450X", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "450S", years: [2023, 2024, 2025] },
      { name: "Rizta", years: [2024, 2025] },
    ],
  },
  {
    name: "Ola Electric",
    models: [
      { name: "S1 Pro", years: [2022, 2023, 2024, 2025] },
      { name: "S1 Air", years: [2023, 2024, 2025] },
      { name: "S1 X", years: [2024, 2025] },
    ],
  },
  {
    name: "Porsche",
    models: [
      { name: "911", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Cayenne", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Macan", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Panamera", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Taycan", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "718 Boxster", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { name: "718 Cayman", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
    ],
  },
  {
    name: "Lamborghini",
    models: [
      { name: "Huracán", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { name: "Urus", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Aventador", years: [2018, 2019, 2020, 2021, 2022] },
      { name: "Revuelto", years: [2024, 2025] },
    ],
  },
  {
    name: "Ferrari",
    models: [
      { name: "488", years: [2018, 2019, 2020] },
      { name: "F8 Tributo", years: [2020, 2021, 2022, 2023, 2024] },
      { name: "Roma", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "SF90", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "296 GTB", years: [2022, 2023, 2024, 2025] },
      { name: "Purosangue", years: [2023, 2024, 2025] },
    ],
  },
  {
    name: "Jaguar",
    models: [
      { name: "XE", years: [2018, 2019, 2020, 2021, 2022, 2023] },
      { name: "XF", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { name: "F-Pace", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "E-Pace", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { name: "I-Pace", years: [2019, 2020, 2021, 2022, 2023, 2024] },
      { name: "F-Type", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
    ],
  },
  {
    name: "Land Rover",
    models: [
      { name: "Range Rover", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Range Rover Sport", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Range Rover Velar", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Range Rover Evoque", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Defender", years: [2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "Discovery", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { name: "Discovery Sport", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
    ],
  },
  {
    name: "Volvo",
    models: [
      { name: "XC40", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "XC60", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "XC90", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
      { name: "S60", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] },
      { name: "S90", years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] },
    ],
  },
];

// Get models for a specific make
export const getModelsForMake = (makeName: string): VehicleModel[] => {
  const make = VEHICLE_MAKES.find(m => m.name === makeName);
  return make?.models || [];
};

// Get years for a specific model
export const getYearsForModel = (makeName: string, modelName: string): number[] => {
  const models = getModelsForMake(makeName);
  const model = models.find(m => m.name === modelName);
  return model?.years.sort((a, b) => b - a) || [];
};

// Get color hex from name
export const getColorHex = (colorName: string): string => {
  const color = VEHICLE_COLORS.find(c => c.name.toLowerCase() === colorName.toLowerCase());
  return color?.hex || "#FF6600";
};
