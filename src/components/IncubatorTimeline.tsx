import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Search, 
  Sparkles, 
  Check, 
  Plus, 
  History, 
  ListOrdered, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ArrowUpDown
} from "lucide-react";
import { FFItem } from "../constants";

interface IncubatorInfo {
  id: string;
  name: string;
  releaseDate: string; // Format: "YYYY-MM"
  releaseLabel: string; // Format: "December 2018"
  rarity: "Legendary" | "Mythic" | "Epic" | "Rare";
  description: string;
  rewards: string[];
  originalCost: string;
  iconType: "suit" | "weapon";
}

const INCUBATORS_DATA: IncubatorInfo[] = [
  {
    id: "inc-dino",
    name: "Dino Legendario",
    releaseDate: "2018-12",
    releaseLabel: "Diciembre 2018",
    rarity: "Legendary",
    description: "La primera incubadora en la historia de Free Fire. Marcó un hito introduciendo trajes completos de dinosaurio de felpa en varios colores.",
    rewards: ["Dino Azul (Principal)", "Dino Amarillo", "Dino Rosa", "Dino Verde", "Dino Cavernícola"],
    originalCost: "7 Piedras Evolutivas + 3 Planos",
    iconType: "suit"
  },
  {
    id: "inc-criminal",
    name: "Top Criminal",
    releaseDate: "2019-01",
    releaseLabel: "Enero 2019",
    rarity: "Mythic",
    description: "Una de las incubadoras más deseadas de todos los tiempos. Trajes sencillos pero sumamente icónicos basados en asaltantes de colores.",
    rewards: ["Criminal Rojo (Más ralo)", "Criminal Azul", "Criminal Amarillo", "Criminal Morado"],
    originalCost: "8 Piedras Evolutivas + 4 Planos",
    iconType: "suit"
  },
  {
    id: "inc-sunmoon",
    name: "Luna y Sol",
    releaseDate: "2019-02",
    releaseLabel: "Febrero 2019",
    rarity: "Epic",
    description: "Inspirada en guerreros mágicos y místicos orientales que dominan los poderes cósmicos celestiales de la noche y el día.",
    rewards: ["Guerrero Solar (Masculino)", "Guerrera Lunar (Femenino)", "Máscaras de Eclipse"],
    originalCost: "5 Piedras Evolutivas + 2 Planos",
    iconType: "suit"
  },
  {
    id: "inc-ak-unicorn",
    name: "AK-47 Unicornio Rabioso",
    releaseDate: "2019-04",
    releaseLabel: "Abril 2019",
    rarity: "Legendary",
    description: "Línea de armas icónica que dominó el competitivo por sus brutales aumentos de índice de disparo, daño y precisión.",
    rewards: ["AK-47 Unicornio Dorado (Era de Hielo)", "AK-47 Lava", "AK-47 Violeta de Trueno"],
    originalCost: "7 Piedras Evolutivas + 3 Planos",
    iconType: "weapon"
  },
  {
    id: "inc-scar-beast",
    name: "Scar Bestia de Guerra",
    releaseDate: "2019-05",
    releaseLabel: "Mayo 2019",
    rarity: "Legendary",
    description: "La respuesta bélica en skins para SCAR, portando modelos futuristas holográficos con halos de destellos y garras biomecánicas.",
    rewards: ["SCAR Bestia de Oro (Megatrón)", "SCAR Bestia de Agua", "SCAR Bestia de Fuego"],
    originalCost: "7 Piedras Evolutivas + 3 Planos",
    iconType: "weapon"
  },
  {
    id: "inc-yinyang",
    name: "Maestros Místicos (Yin Yang)",
    releaseDate: "2019-09",
    releaseLabel: "Septiembre 2019",
    rarity: "Epic",
    description: "Fusión estética japonesa taoísta del equilibrio. Introdujo cabellos blancos flotantes que se volvieron leyenda en las combinaciones de ropa.",
    rewards: ["Loto Dorado (Blanco/Oro)", "Sombra Marina", "Plano Yin-Yang espiritual"],
    originalCost: "5 Piedras Evolutivas + 2 Planos",
    iconType: "suit"
  },
  {
    id: "inc-samurai",
    name: "Samurai Dorado (Shogun)",
    releaseDate: "2019-12",
    releaseLabel: "Diciembre 2019",
    rarity: "Legendary",
    description: "Armaduras japonesas samurai blindadas de cuerpo completo con máscaras Oni talladas y efectos de flamas espirituales en el casco.",
    rewards: ["Samurái de Oro", "Shogún de Acero", "Emperatriz de Sangre"],
    originalCost: "6 Piedras Evolutivas + 3 Planos",
    iconType: "suit"
  },
  {
    id: "inc-graffiti",
    name: "Squad Grafiteros",
    releaseDate: "2020-01",
    releaseLabel: "Enero 2020",
    rarity: "Epic",
    description: "Estilo urbano repleto de botes de pintura en aerosol, chaquetas holográficas de cuero desabrochadas, gorras de graffiti y mascarillas.",
    rewards: ["Grafitero de Oro", "Grafitera Salvaje", "Máscara de Aerosol de Gas"],
    originalCost: "5 Piedras Evolutivas + 2 Planos",
    iconType: "suit"
  },
  {
    id: "inc-poker",
    name: "MP40 Lucky Poker",
    releaseDate: "2020-03",
    releaseLabel: "Marzo 2020",
    rarity: "Legendary",
    description: "La línea rey de velocidad de disparo para la ametralladora MP40. Cada skin representa una mano de cartas de casino y brillo radiante.",
    rewards: ["MP40 Flashing Spade (Espadas - Amarilla)", "MP40 Royal Flush (Corazones)", "MP40 Eternal Diamond (Diamantes)"],
    originalCost: "7 Piedras Evolutivas + 3 Planos",
    iconType: "weapon"
  },
  {
    id: "inc-apocalyptic",
    name: "M1014 Apocalipsis",
    releaseDate: "2020-07",
    releaseLabel: "Julio 2020",
    rarity: "Legendary",
    description: "Skins apocalípticas de corto alcance para la escopeta M1014. Diseñadas con cañones pesados reforzados y flamas incandescentes.",
    rewards: ["M1014 Apocalipsis Rojo (Fuego Infernal)", "M1014 Apocalipsis Oro", "M1014 Ceniza"],
    originalCost: "7 Piedras Evolutivas + 3 Planos",
    iconType: "weapon"
  },
  {
    id: "inc-spiritual",
    name: "Fuerza Espiritual",
    releaseDate: "2020-11",
    releaseLabel: "Noviembre 2020",
    rarity: "Epic",
    description: "Túnicas de sabios orientales levitantes cubiertas por escrituras budistas flotantes y resplandores mágicos sutiles.",
    rewards: ["Monje Elemental de Oro", "Sacerdotisa del Viento", "Pergamín Espiritual"],
    originalCost: "5 Piedras Evolutivas + 2 Planos",
    iconType: "suit"
  },
  {
    id: "inc-timetraveller",
    name: "Viajeros del Tiempo",
    releaseDate: "2020-12",
    releaseLabel: "Diciembre 2020",
    rarity: "Epic",
    description: "Colección elegante de aviadores victorianos combinada con ingeniosa tecnología steampunk cuántica de control de relojería solar.",
    rewards: ["Viajero Temporal de Oro", "Thompson Viajeros (Skins de arma asociadas)", "Disfraz de Cronos"],
    originalCost: "5 Piedras Evolutivas + 2 Planos",
    iconType: "suit"
  },
  {
    id: "inc-netherworld",
    name: "M4A1 Inframundo",
    releaseDate: "2021-02",
    releaseLabel: "Febrero 2021",
    rarity: "Epic",
    description: "Emanaciones y garras del purgatorio plasmadas en el rifle M4A1. Destacada por su estela de humo de azufre permanente.",
    rewards: ["M4A1 Inframundo de Oro", "M4A1 Glaciar Infernal", "Armadura Demoniaca de Inframundo"],
    originalCost: "6 Piedras Evolutivas + 3 Planos",
    iconType: "weapon"
  },
  {
    id: "inc-mythos",
    name: "Mythos Modernos",
    releaseDate: "2021-07",
    releaseLabel: "Julio 2021",
    rarity: "Epic",
    description: "Reinterpretación de los cuatro guardianes celestiales chinos (Tigre Blanco, Tortuga Negra, Dragón Azul y Fénix Rojo) en atuendos cibernéticos modernos.",
    rewards: ["General Tigre Metálico", "Fénix Cibernético", "Disfraz Tortuga de Combate"],
    originalCost: "5 Piedras Evolutivas + 2 Planos",
    iconType: "suit"
  },
  {
    id: "inc-geometric",
    name: "Geometric Shock",
    releaseDate: "2021-09",
    releaseLabel: "Septiembre 2021",
    rarity: "Epic",
    description: "Aspecto futurista techno con trajes modulares compuestos por uniones triangulares acanaladas y máscaras de cuarzo reflectantes.",
    rewards: ["Geometric Shock Oro (Líder)", "Geometric Shock Turquesa", "Geometric Shock Magenta"],
    originalCost: "5 Piedras Evolutivas + 2 Planos",
    iconType: "suit"
  }
];

interface IncubatorTimelineProps {
  selectedItems: FFItem[];
  onToggleItem: (item: FFItem) => void;
  allFFItems: FFItem[];
}

export default function IncubatorTimeline({ selectedItems, onToggleItem, allFFItems }: IncubatorTimelineProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleToggle = (id: string) => {
    // Find matching item metadata in official lists
    const matchedItem = allFFItems.find(item => item.id === id);
    if (matchedItem) {
      onToggleItem(matchedItem);
    }
  };

  const filteredIncubators = useMemo(() => {
    return INCUBATORS_DATA.filter(inc => {
      const matchesSearch = inc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            inc.rewards.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRarity = selectedRarity === "All" || inc.rarity === selectedRarity;
      const matchesType = selectedType === "All" || 
                          (selectedType === "suit" && inc.iconType === "suit") ||
                          (selectedType === "weapon" && inc.iconType === "weapon");
      
      return matchesSearch && matchesRarity && matchesType;
    }).sort((a, b) => {
      const timeA = new Date(a.releaseDate).getTime();
      const timeB = new Date(b.releaseDate).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  }, [searchQuery, selectedRarity, selectedType, sortOrder]);

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "bg-brand-yellow/15 text-brand-yellow border-brand-yellow/30 shadow-[0_0_8px_rgba(255,204,0,0.15)]";
      case "Mythic":
        return "bg-orange-500/15 text-orange-500 border-orange-500/30 shadow-[0_0_8px_rgba(249,115,22,0.15)]";
      case "Epic":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]";
      default:
        return "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.15)]";
    }
  };

  const getRarityBorderColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "border-l-brand-yellow";
      case "Mythic": return "border-l-orange-500";
      case "Epic": return "border-l-purple-500";
      default: return "border-l-blue-400";
    }
  };

  // Stats
  const selectedCount = useMemo(() => {
    return INCUBATORS_DATA.filter(inc => selectedItems.some(s => s.id === inc.id)).length;
  }, [selectedItems]);

  return (
    <div id="incubators-timeline-section" className="ff-card p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-red" />
            <h2 className="text-xl font-display font-black tracking-wider text-white uppercase">
              Archivo de Incubadoras FF
            </h2>
          </div>
          <p className="text-xs text-white/50 leading-relaxed max-w-xl">
            Explora de manera cronológica oficiales todas las emblemáticas Incubadoras lanzadas por <strong className="text-brand-yellow">Garena Free Fire</strong>. Incluye fechas de lanzamiento, rarezas originales y costos. ¡Incorpóralas directo a tu inventario de cálculo!
          </p>
        </div>
        
        {/* Quick Stats Block */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 text-center min-w-24">
            <div className="text-[10px] text-white/40 uppercase">Total Archivos</div>
            <div className="text-xl font-bold font-mono text-white">{INCUBATORS_DATA.length}</div>
          </div>
          <div className="bg-brand-red/5 border border-brand-red/20 rounded-lg p-3 text-center min-w-24">
            <div className="text-[10px] text-brand-red uppercase font-bold">Tus Skins</div>
            <div className="text-xl font-bold font-mono text-brand-yellow">{selectedCount}/{INCUBATORS_DATA.length}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Sorting, and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-white/40" />
          </span>
          <input 
            type="text"
            placeholder="Buscar incubadora o recompensa..."
            className="ff-input w-full pl-9 py-2 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Rarity filter */}
        <div>
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="ff-input w-full text-xs appearance-none py-2 px-3 bg-brand-gray"
          >
            <option value="All">Todas las Rarezas</option>
            <option value="Legendary">Legendario ⭐⭐⭐⭐⭐</option>
            <option value="Mythic">Mítico ⭐⭐⭐⭐</option>
            <option value="Epic">Épico ⭐⭐⭐</option>
          </select>
        </div>

        {/* Type filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="ff-input w-full text-xs appearance-none py-2 px-3 bg-brand-gray"
          >
            <option value="All">Todos los Tipos</option>
            <option value="suit">Trajes / Ropa</option>
            <option value="weapon">Skins de Armas</option>
          </select>
        </div>

        {/* Chronological Sorting order toggle */}
        <button
          onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
          className="ff-button text-xs py-2 px-3 flex items-center justify-center gap-2 hover:border-brand-red/50 w-full"
        >
          <ArrowUpDown className="w-3 h-3 text-brand-red" />
          <span>Cronología: {sortOrder === "asc" ? "Más Antigua" : "Más Reciente"}</span>
        </button>
      </div>

      {/* Timeline List Grid */}
      <div className="relative pl-1">
        {/* Timeline center line */}
        <div className="absolute left-[15px] sm:left-1/2 top-4 bottom-4 w-0.5 bg-white/5 -translate-x-1/2 hidden sm:block" />

        <div className="space-y-6 sm:space-y-8 relative">
          <AnimatePresence mode="popLayout">
            {filteredIncubators.length > 0 ? (
              filteredIncubators.map((inc, index) => {
                const isSelected = selectedItems.some(s => s.id === inc.id);
                // Alternating timeline nodes for elegant layout on modern desktops
                const isLeft = index % 2 === 0;

                return (
                  <motion.div
                    key={inc.id}
                    layoutId={`inc-node-${inc.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className={`flex flex-col sm:flex-row items-stretch sm:justify-between relative ${
                      isLeft ? "sm:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Visual Center Node Bullet */}
                    <div className="absolute left-[15px] sm:left-1/2 top-5 w-4 h-4 rounded-full border-2 border-brand-red bg-brand-gray z-10 -translate-x-1/2 flex items-center justify-center shadow-[0_0_10px_rgba(235,50,35,0.4)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                    </div>

                    {/* Left/Right Container blocks for desktops */}
                    <div className="w-full sm:w-[47%] pl-8 sm:pl-0">
                      <div 
                        className={`bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-xl p-5 relative transition-all duration-300 border-l-4 ${getRarityBorderColor(inc.rarity)} ${
                          isSelected ? "bg-white/[0.04] shadow-[0_0_20px_rgba(255,255,255,0.03)] border-2" : ""
                        }`}
                      >
                        {/* Header details */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${getRarityBadgeColor(inc.rarity)}`}>
                            {inc.rarity}
                          </span>
                          
                          <div className="flex items-center gap-1 text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded">
                            <Calendar className="w-3 h-3 text-brand-red" />
                            <span>{inc.releaseLabel}</span>
                          </div>
                        </div>

                        {/* Incubator Title */}
                        <h3 className="text-base font-display font-black tracking-tight text-white mb-1.5 flex items-center gap-2">
                          {inc.name}
                          {isSelected && (
                            <span className="flex items-center gap-0.5 text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                              <Check className="w-2.5 h-2.5" /> Poseído
                            </span>
                          )}
                        </h3>

                        {/* Incubator Description */}
                        <p className="text-xs text-white/60 leading-relaxed mb-4 italic">
                          "{inc.description}"
                        </p>

                        {/* Rewards badge collection */}
                        <div className="space-y-2 mb-4 bg-black/20 p-3 rounded-lg border border-white/5">
                          <div className="text-[9px] uppercase tracking-wider text-white/40 flex items-center gap-1 font-bold">
                            <Sparkles className="w-2.5 h-2.5 text-brand-yellow" />
                            Recompensas Destacadas:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {inc.rewards.map((reward, rid) => (
                              <span key={rid} className="text-[9px] bg-white/5 text-white/80 border border-white/5 px-1.5 py-0.5 rounded">
                                {reward}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Stats & Operational Button */}
                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5 flex-wrap">
                          <div className="text-[10px] text-white/40">
                            Costo: <span className="font-mono text-white/70">{inc.originalCost}</span>
                          </div>

                          <button
                            onClick={() => handleToggle(inc.id)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 ${
                              isSelected 
                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20" 
                                : "bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white border border-brand-red/30 hover:border-brand-red"
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Quitar de Cuenta
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                Agregar a Cuenta
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Empty block on the opposite side to balance timeline layout */}
                    <div className="w-0 sm:w-[47%] hidden sm:block" />

                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center text-white/40 space-y-2 select-none"
              >
                <ShieldAlert className="w-12 h-12 text-brand-red/20 mx-auto" />
                <p className="text-sm">No se encontraron incubadoras que coincidan con los filtros.</p>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRarity("All");
                    setSelectedType("All");
                  }}
                  className="text-xs text-brand-yellow hover:underline"
                >
                  Restablecer filtros de búsqueda
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
