 import { useState, useEffect } from "react";
 import { motion } from "framer-motion";
 import {
   Box,
   Search,
   Filter,
   Car,
   Bike,
   Truck,
   Eye,
   Trash2,
   Loader2,
   ArrowLeft,
   Grid,
   List,
   Shield,
   Calendar,
 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Card, CardContent } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { format } from "date-fns";
 import { Model3DPreview } from "@/components/admin/Model3DPreview";
 import { useNavigate } from "react-router-dom";
 
 interface CarModel3D {
   id: string;
   make: string;
   model: string;
   year: number | null;
   model_url: string;
   thumbnail_url: string | null;
   default_color: string | null;
   is_active: boolean;
   created_at: string;
   vehicle_category: string;
 }
 
 const VEHICLE_CATEGORIES = [
   { value: "all", label: "All Categories", icon: Car },
   { value: "car", label: "Car", icon: Car },
   { value: "suv", label: "SUV", icon: Truck },
   { value: "bike", label: "Bike", icon: Bike },
   { value: "truck", label: "Truck", icon: Truck },
   { value: "van", label: "Van", icon: Truck },
 ];
 
 export default function AdminModelsPage() {
   const navigate = useNavigate();
   const { toast } = useToast();
   const [models, setModels] = useState<CarModel3D[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [categoryFilter, setCategoryFilter] = useState("all");
   const [brandFilter, setBrandFilter] = useState("all");
   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
   const [previewModel, setPreviewModel] = useState<CarModel3D | null>(null);
 
   // Get unique brands from models
   const uniqueBrands = [...new Set(models.map((m) => m.make))].sort();
 
   useEffect(() => {
     fetchModels();
   }, []);
 
   const fetchModels = async () => {
     setLoading(true);
     try {
       const { data, error } = await supabase
         .from("car_models_3d")
         .select("*")
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       setModels((data as CarModel3D[]) || []);
     } catch (error) {
       console.error("Error fetching models:", error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to load 3D models",
       });
     } finally {
       setLoading(false);
     }
   };
 
   const handleDelete = async (model: CarModel3D) => {
     if (!confirm(`Delete ${model.make} ${model.model}?`)) return;
 
     try {
       const fileName = model.model_url.split("/").pop();
       if (fileName) {
         await supabase.storage.from("car-models").remove([fileName]);
       }
 
       const { error } = await supabase
         .from("car_models_3d")
         .delete()
         .eq("id", model.id);
 
       if (error) throw error;
 
       toast({ title: "Deleted", description: "Model removed successfully" });
       fetchModels();
     } catch (error: any) {
       toast({
         variant: "destructive",
         title: "Delete Failed",
         description: error.message,
       });
     }
   };
 
   const filteredModels = models.filter((model) => {
     const matchesSearch =
       searchQuery === "" ||
       model.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
       model.model.toLowerCase().includes(searchQuery.toLowerCase());
 
     const matchesCategory =
       categoryFilter === "all" || model.vehicle_category === categoryFilter;
 
     const matchesBrand =
       brandFilter === "all" || model.make === brandFilter;
 
     return matchesSearch && matchesCategory && matchesBrand;
   });
 
   const getCategoryIcon = (category: string) => {
     const cat = VEHICLE_CATEGORIES.find((c) => c.value === category);
     return cat?.icon || Car;
   };
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
         <div className="container flex h-16 items-center justify-between px-4">
           <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
               <ArrowLeft className="h-5 w-5" />
             </Button>
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-racing text-white">
               <Box className="h-5 w-5" />
             </div>
             <div>
               <h1 className="font-display text-lg font-bold">3D Models Gallery</h1>
               <p className="text-xs text-muted-foreground">
                 {models.length} models uploaded
               </p>
             </div>
           </div>
           <Badge variant="outline" className="bg-racing/10 text-racing border-racing/30">
             <Shield className="h-3 w-3 mr-1" />
             Admin
           </Badge>
         </div>
       </header>
 
       <main className="container px-4 py-6 space-y-6">
         {/* Filters */}
         <Card>
           <CardContent className="pt-6">
             <div className="flex flex-wrap gap-4">
               {/* Search */}
               <div className="flex-1 min-w-[200px]">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     placeholder="Search make or model..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-10"
                   />
                 </div>
               </div>
 
               {/* Category Filter */}
               <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                 <SelectTrigger className="w-[160px]">
                   <Filter className="h-4 w-4 mr-2" />
                   <SelectValue placeholder="Category" />
                 </SelectTrigger>
                 <SelectContent>
                   {VEHICLE_CATEGORIES.map((cat) => (
                     <SelectItem key={cat.value} value={cat.value}>
                       <div className="flex items-center gap-2">
                         <cat.icon className="h-4 w-4" />
                         {cat.label}
                       </div>
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
 
               {/* Brand Filter */}
               <Select value={brandFilter} onValueChange={setBrandFilter}>
                 <SelectTrigger className="w-[160px]">
                   <SelectValue placeholder="All Brands" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Brands</SelectItem>
                   {uniqueBrands.map((brand) => (
                     <SelectItem key={brand} value={brand}>
                       {brand}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
 
               {/* View Toggle */}
               <div className="flex border rounded-lg overflow-hidden">
                 <Button
                   variant={viewMode === "grid" ? "default" : "ghost"}
                   size="icon"
                   onClick={() => setViewMode("grid")}
                   className="rounded-none"
                 >
                   <Grid className="h-4 w-4" />
                 </Button>
                 <Button
                   variant={viewMode === "list" ? "default" : "ghost"}
                   size="icon"
                   onClick={() => setViewMode("list")}
                   className="rounded-none"
                 >
                   <List className="h-4 w-4" />
                 </Button>
               </div>
             </div>
           </CardContent>
         </Card>
 
         {/* Models Grid/List */}
         {loading ? (
           <div className="flex items-center justify-center py-20">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
           </div>
         ) : filteredModels.length === 0 ? (
           <div className="text-center py-20">
             <Box className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
             <p className="font-medium">No models found</p>
             <p className="text-sm text-muted-foreground">
               {searchQuery || categoryFilter !== "all" || brandFilter !== "all"
                 ? "Try adjusting your filters"
                 : "Upload your first 3D model from the admin panel"}
             </p>
           </div>
         ) : viewMode === "grid" ? (
           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {filteredModels.map((model) => {
               const CategoryIcon = getCategoryIcon(model.vehicle_category);
               return (
                 <motion.div
                   key={model.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                 >
                   <Card className="group hover:border-racing/50 transition-all">
                     <CardContent className="pt-6">
                       {/* Preview Area */}
                       <div
                         className="relative h-32 rounded-lg mb-4 flex items-center justify-center cursor-pointer overflow-hidden"
                         style={{
                           background: `linear-gradient(135deg, ${model.default_color || "#FF6600"}22, ${model.default_color || "#FF6600"}44)`,
                         }}
                         onClick={() => setPreviewModel(model)}
                       >
                         <div
                           className="w-16 h-16 rounded-full flex items-center justify-center"
                           style={{ backgroundColor: model.default_color || "#FF6600" }}
                         >
                           <CategoryIcon className="h-8 w-8 text-white" />
                         </div>
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                           <Eye className="h-8 w-8 text-white" />
                         </div>
                       </div>
 
                       {/* Info */}
                       <div className="space-y-2">
                         <div className="flex items-start justify-between">
                           <div>
                             <p className="font-semibold">
                               {model.make} {model.model}
                             </p>
                             <p className="text-sm text-muted-foreground">
                               {model.year || "All years"}
                             </p>
                           </div>
                           <Badge variant="outline" className="text-xs capitalize">
                             {model.vehicle_category}
                           </Badge>
                         </div>
 
                         <div className="flex items-center justify-between text-xs text-muted-foreground">
                           <div className="flex items-center gap-1">
                             <Calendar className="h-3 w-3" />
                             {format(new Date(model.created_at), "MMM d, yyyy")}
                           </div>
                           <div className="flex gap-1">
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-7 w-7"
                               onClick={() => setPreviewModel(model)}
                             >
                               <Eye className="h-3.5 w-3.5" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-7 w-7 text-destructive"
                               onClick={() => handleDelete(model)}
                             >
                               <Trash2 className="h-3.5 w-3.5" />
                             </Button>
                           </div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </motion.div>
               );
             })}
           </div>
         ) : (
           <Card>
             <CardContent className="p-0">
               <div className="divide-y">
                 {filteredModels.map((model) => {
                   const CategoryIcon = getCategoryIcon(model.vehicle_category);
                   return (
                     <div
                       key={model.id}
                       className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                     >
                       <div
                         className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                         style={{ backgroundColor: model.default_color || "#FF6600" }}
                       >
                         <CategoryIcon className="h-6 w-6 text-white" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="font-semibold">
                           {model.make} {model.model}
                         </p>
                         <p className="text-sm text-muted-foreground">
                           {model.year || "All years"} •{" "}
                           {format(new Date(model.created_at), "MMM d, yyyy")}
                         </p>
                       </div>
                       <Badge variant="outline" className="capitalize shrink-0">
                         {model.vehicle_category}
                       </Badge>
                       <div className="flex gap-1 shrink-0">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setPreviewModel(model)}
                         >
                           <Eye className="h-4 w-4 mr-1" />
                           Preview
                         </Button>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="text-destructive"
                           onClick={() => handleDelete(model)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </CardContent>
           </Card>
         )}
       </main>
 
       {/* Preview Dialog */}
       {previewModel && (
         <Model3DPreview
           open={!!previewModel}
           onOpenChange={(open) => !open && setPreviewModel(null)}
           modelUrl={previewModel.model_url}
           modelName={`${previewModel.make} ${previewModel.model}${previewModel.year ? ` (${previewModel.year})` : ""}`}
           defaultColor={previewModel.default_color || "#FF6600"}
         />
       )}
     </div>
   );
 }