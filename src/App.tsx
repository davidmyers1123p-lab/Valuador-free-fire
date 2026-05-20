/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Trash2, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Shield, 
  Trophy,
  Users,
  Dna,
  Loader2,
  AlertCircle,
  Gem,
  Plus,
  LogIn,
  LogOut,
  User as UserIcon,
  Link as LinkIcon,
  ExternalLink
} from "lucide-react";
import { FF_ITEMS, REGIONS, RANKS, FFItem } from "./constants";
import IncubatorTimeline from "./components/IncubatorTimeline";
import { 
  auth, 
  loginWithGoogle, 
  logout, 
  getLinkedAccount, 
  linkAccount, 
  LinkedAccount 
} from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface EvaluationResult {
  estimatedValueRange: string;
  breakdown: string;
  rarityScore: number;
  topRarityItems: string[];
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [linkedAccount, setLinkedAccount] = useState<LinkedAccount | null>(null);
  const [level, setLevel] = useState<number>(50);
  const [rank, setRank] = useState<string>("Platinum");
  const [region, setRegion] = useState<string>("Latam (Sudamérica/Norte)");
  const [selectedItems, setSelectedItems] = useState<FFItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Linking Form State
  const [playerId, setPlayerId] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const account = await getLinkedAccount(currentUser.uid);
        if (account) {
          setLinkedAccount(account);
          setLevel(account.level || 50);
          setRank(account.rank || "Platinum");
          setRegion(account.region || "Latam (Sudamérica/Norte)");
          setNickname(account.nickname || "");
          setPlayerId(account.playerId || "");
        }
      } else {
        setLinkedAccount(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFetchAccountDetails = async () => {
    if (!playerId) return;
    setIsFetchingDetails(true);
    setError(null);
    try {
      const response = await fetch("/api/fetch-account-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setNickname(data.nickname);
      setLevel(data.level);
      setRank(data.rank);
      setHasDetected(true);
    } catch (err) {
      setError("No se pudo detectar la cuenta automáticamente. Intenta ingresar los datos manualmente.");
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!user) return;
    setIsLinking(true);
    try {
      const data: Partial<LinkedAccount> = {
        playerId,
        nickname,
        region,
        level,
        rank
      };
      await linkAccount(user.uid, data);
      const updated = await getLinkedAccount(user.uid);
      setLinkedAccount(updated);
    } catch (err) {
      console.error(err);
      setError("Error al vincular la cuenta.");
    } finally {
      setIsLinking(false);
    }
  };

  const filteredItems = useMemo(() => {
    return FF_ITEMS.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedItems.find(s => s.id === item.id)
    );
  }, [searchQuery, selectedItems]);

  const toggleItem = (item: FFItem) => {
    if (selectedItems.find(s => s.id === item.id)) {
      setSelectedItems(selectedItems.filter(s => s.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
      setSearchQuery("");
    }
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(s => s.id !== id));
  };

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "text-brand-yellow bg-brand-yellow/10 border-brand-yellow/20";
      case "Mythic": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "Epic": return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "Rare": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      default: return "text-white/40 bg-white/5 border-white/10";
    }
  };

  const getRarityDot = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "bg-brand-yellow shadow-[0_0_8px_rgba(255,204,0,0.5)]";
      case "Mythic": return "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]";
      case "Epic": return "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]";
      case "Rare": return "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]";
      default: return "bg-white/20";
    }
  };

  const getSelectedRarityStyle = (rarity: string) => {
    switch (rarity) {
      case "Legendary": 
        return "text-brand-yellow bg-brand-yellow/[0.12] border-brand-yellow/80 border-2 shadow-[0_0_20px_rgba(255,204,0,0.25)] hover:shadow-[0_0_30px_rgba(255,204,0,0.4)] hover:scale-[1.02]";
      case "Mythic": 
        return "text-orange-500 bg-orange-500/[0.12] border-orange-500/80 border-2 shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:scale-[1.02]";
      case "Epic": 
        return "text-purple-400 bg-purple-400/[0.12] border-purple-400/80 border-2 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02]";
      case "Rare": 
        return "text-blue-400 bg-blue-400/[0.12] border-blue-400/80 border-2 shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.02]";
      default: 
        return "text-white/60 bg-white/[0.05] border-white/30 border-2 shadow-none hover:scale-[1.02]";
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "text-brand-yellow";
      case "Mythic": return "text-orange-500";
      case "Epic": return "text-purple-400";
      case "Rare": return "text-blue-400";
      default: return "text-white/60";
    }
  };

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30 shadow-[0_0_10px_rgba(255,204,0,0.15)]";
      case "Mythic": return "bg-orange-500/15 text-orange-500 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.15)]";
      case "Epic": return "bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]";
      case "Rare": return "bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]";
      default: return "bg-white/10 text-white/50 border border-white/20";
    }
  };

  const Tooltip = ({ children, text, className = "" }: { children: React.ReactNode; text: string, className?: string, key?: React.Key }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX + rect.width / 2,
        });
      }
    };

    const handleMouseEnter = () => {
      updatePosition();
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Ensure tooltip position stays accurate if the page scrolls/resizes while visible
    useEffect(() => {
      if (isVisible) {
        window.addEventListener("scroll", updatePosition, { passive: true });
        window.addEventListener("resize", updatePosition, { passive: true });
        return () => {
          window.removeEventListener("scroll", updatePosition);
          window.removeEventListener("resize", updatePosition);
        };
      }
    }, [isVisible]);

    return (
      <div 
        ref={triggerRef}
        className={`relative inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {isVisible && coords && createPortal(
          <div 
            style={{
              position: "absolute",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: "translate(-50%, -100%)",
              marginTop: "-8px",
              zIndex: 99999,
            }}
            className="pointer-events-none"
          >
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="w-48 p-2 bg-brand-gray/95 border border-white/10 rounded-lg shadow-xl text-[10px] text-white/80 text-center leading-tight relative"
              >
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-gray/95" />
              </motion.div>
            </AnimatePresence>
          </div>,
          document.body
        )}
      </div>
    );
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          rank,
          region,
          items: selectedItems.map(i => `${i.name} (${i.rarity})`),
        }),
      });

      if (!response.ok) throw new Error("Error en la evaluación");

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError("No se pudo conectar con el evaluador. Asegúrate de que el servidor esté activo.");
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex-1 text-center md:text-left space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-brand-red/20 border border-brand-red/30 rounded-full mb-2"
            >
              <Zap className="w-3 h-3 text-brand-red" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-brand-red">AI Valuator & Profile</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tighter"
            >
              FREE FIRE <span className="text-brand-red">VALUATOR</span>
            </motion.h1>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="ff-card px-4 py-2 flex items-center gap-3">
                <img src={user.photoURL || ""} alt={user.displayName || ""} className="w-8 h-8 rounded-full border border-white/20" />
                <div className="hidden sm:block">
                  <div className="text-xs font-bold">{user.displayName}</div>
                  <div className="text-[9px] text-white/40 uppercase">Vinculado</div>
                </div>
                <button onClick={() => logout()} className="p-2 hover:text-brand-red transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => loginWithGoogle()}
                className="ff-button-primary flex items-center gap-2 text-sm"
              >
                <LogIn className="w-4 h-4" />
                INGRESAR CON GOOGLE
              </button>
            )}
          </div>
        </header>

        {/* Account Linking / Status */}
        {user && !linkedAccount && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ff-card p-6 border-brand-yellow/30 bg-brand-yellow/5 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-lg uppercase text-brand-yellow flex items-center gap-2 justify-center md:justify-start">
                <LinkIcon className="w-5 h-5" />
                VINCULA TU CUENTA REAL
              </h3>
              <p className="text-xs text-white/60">
                Usa el botón "Detectar" arriba con tu ID y luego confirma aquí para guardar tu perfil.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center items-center">
              {playerId && nickname ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] text-white/40 uppercase">Listo para vincular:</div>
                    <div className="text-sm font-bold text-brand-yellow">{nickname} ({playerId})</div>
                  </div>
                  <button 
                    onClick={handleLinkAccount}
                    disabled={isLinking}
                    className="ff-button-primary py-2 px-6 text-xs bg-brand-yellow text-black hover:bg-yellow-500"
                  >
                    {isLinking ? "VINCULANDO..." : "CONFIRMAR VINCULACIÓN"}
                  </button>
                </div>
              ) : (
                <div className="text-xs text-white/40 italic">
                  Ingresa tu ID arriba y dale a "Detectar" para comenzar...
                </div>
              )}
            </div>
          </motion.div>
        )}

        {linkedAccount && (
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ff-card p-4 border-green-500/30 bg-green-500/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-xs uppercase text-green-500 font-bold tracking-tighter">Cuenta Verificada</div>
                <div className="font-display font-bold">ID: {linkedAccount.playerId} {linkedAccount.nickname && `| ${linkedAccount.nickname}`}</div>
              </div>
            </div>
            <div className="text-[9px] uppercase text-white/40 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              Región: {linkedAccount.region}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Account Details */}
            <div className="ff-card p-6 space-y-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-yellow" />
                  <h2 className="text-xl uppercase">Detalles de Cuenta</h2>
                </div>
                
                {/* Auto-detect button inside the card for better accessibility */}
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Tu ID..."
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="ff-input text-[10px] py-1 h-8 w-24 bg-white/5 border-white/5 opacity-60 focus:opacity-100"
                  />
                  <button 
                    onClick={handleFetchAccountDetails}
                    disabled={isFetchingDetails || !playerId}
                    className="ff-button h-8 py-0 px-3 bg-brand-red/10 border border-brand-red/30 text-brand-red text-[10px] uppercase font-bold hover:bg-brand-red hover:text-white transition-all flex items-center gap-2"
                  >
                    {isFetchingDetails ? <Loader2 className="w-3 h-3 animate-spin"/> : <Zap className="w-3 h-3"/>}
                    Detectar
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {hasDetected && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      DATOS DETECTADOS: {nickname}
                    </div>
                    <button onClick={() => setHasDetected(false)} className="text-white/20 hover:text-white">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase text-white/40 block">Nivel de Cuenta</label>
                  <input 
                    type="number" 
                    value={level}
                    onChange={(e) => setLevel(parseInt(e.target.value) || 0)}
                    className="ff-input w-full"
                    placeholder="Ej: 65"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-white/40 block">Rango Actual</label>
                  <select 
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="ff-input w-full appearance-none px-4"
                  >
                    {RANKS.map(r => <option key={r} value={r} className="bg-brand-gray">{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-white/40 block">Región</label>
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="ff-input w-full appearance-none px-4"
                  >
                    {REGIONS.map(r => <option key={r} value={r} className="bg-brand-gray">{r}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Select: Passes, Evo, Collabs & Incubators */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="ff-card p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase text-brand-red flex items-center gap-2">
                    <TrendingUp className="w-3 h-3"/>
                    Pases Elite & Booyah
                  </h3>
                  <button 
                    onClick={() => {
                      const allPasses = FF_ITEMS.filter(i => i.category === "Elite Pass" || i.category === "Booyah Pass");
                      const currentIds = selectedItems.map(s => s.id);
                      const toAdd = allPasses.filter(i => !currentIds.includes(i.id));
                      setSelectedItems([...selectedItems, ...toAdd]);
                    }}
                    className="text-[9px] uppercase font-bold text-white/40 hover:text-brand-red transition-colors"
                  >
                    Seleccionar Todo
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                          {FF_ITEMS.filter(i => i.category === "Elite Pass" || i.category === "Booyah Pass").map(item => (
                            <Tooltip key={item.id} text={item.description}>
                              <button 
                                onClick={() => toggleItem(item)}
                                className={`text-[10px] px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
                                  selectedItems.find(s => s.id === item.id) 
                                  ? "bg-brand-red border-brand-red text-white" 
                                  : `bg-white/5 border-white/10 hover:border-brand-red/50 ${getRarityStyle(item.rarity)}`
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${getRarityDot(item.rarity)}`} />
                                {item.name}
                              </button>
                            </Tooltip>
                          ))}
                </div>
              </div>

              <div className="ff-card p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase text-brand-yellow flex items-center gap-2">
                    <Zap className="w-3 h-3"/>
                    Armas Evolutivas
                  </h3>
                  <button 
                    onClick={() => {
                      const allEvos = FF_ITEMS.filter(i => i.category === "Evo Weapon");
                      const currentIds = selectedItems.map(s => s.id);
                      const toAdd = allEvos.filter(i => !currentIds.includes(i.id));
                      setSelectedItems([...selectedItems, ...toAdd]);
                    }}
                    className="text-[9px] uppercase font-bold text-white/40 hover:text-brand-yellow transition-colors"
                  >
                    Seleccionar Todo
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                          {FF_ITEMS.filter(i => i.category === "Evo Weapon").map(item => (
                            <Tooltip key={item.id} text={item.description}>
                              <button 
                                onClick={() => toggleItem(item)}
                                className={`text-[10px] px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
                                  selectedItems.find(s => s.id === item.id) 
                                  ? "bg-brand-yellow border-brand-yellow text-black" 
                                  : `bg-white/5 border-white/10 hover:border-brand-yellow/50 ${getRarityStyle(item.rarity)}`
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${getRarityDot(item.rarity)}`} />
                                {item.name}
                              </button>
                            </Tooltip>
                          ))}
                </div>
              </div>

              <div className="ff-card p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase text-orange-500 flex items-center gap-2">
                    <Users className="w-3 h-3"/>
                    Colaboraciones
                  </h3>
                  <button 
                    onClick={() => {
                      const allCollabs = FF_ITEMS.filter(i => i.category === "Collaboration");
                      const currentIds = selectedItems.map(s => s.id);
                      const toAdd = allCollabs.filter(i => !currentIds.includes(i.id));
                      setSelectedItems([...selectedItems, ...toAdd]);
                    }}
                    className="text-[9px] uppercase font-bold text-white/40 hover:text-orange-500 transition-colors"
                  >
                    Seleccionar Todo
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                          {FF_ITEMS.filter(i => i.category === "Collaboration").map(item => (
                            <Tooltip key={item.id} text={item.description}>
                              <button 
                                onClick={() => toggleItem(item)}
                                className={`text-[10px] px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
                                  selectedItems.find(s => s.id === item.id) 
                                  ? "bg-orange-500 border-orange-500 text-white" 
                                  : `bg-white/5 border-white/10 hover:border-orange-500/50 ${getRarityStyle(item.rarity)}`
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${getRarityDot(item.rarity)}`} />
                                {item.name}
                              </button>
                            </Tooltip>
                          ))}
                </div>
              </div>

              <div className="ff-card p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase text-purple-400 flex items-center gap-2">
                    <Dna className="w-3 h-3"/>
                    Incubadoras
                  </h3>
                  <button 
                    onClick={() => {
                      const allIncs = FF_ITEMS.filter(i => i.category === "Incubator");
                      const currentIds = selectedItems.map(s => s.id);
                      const toAdd = allIncs.filter(i => !currentIds.includes(i.id));
                      setSelectedItems([...selectedItems, ...toAdd]);
                    }}
                    className="text-[9px] uppercase font-bold text-white/40 hover:text-purple-400 transition-colors"
                  >
                    Seleccionar Todo
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                          {FF_ITEMS.filter(i => i.category === "Incubator").map(item => (
                            <Tooltip key={item.id} text={item.description}>
                              <button 
                                onClick={() => toggleItem(item)}
                                className={`text-[10px] px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
                                  selectedItems.find(s => s.id === item.id) 
                                  ? "bg-purple-500 border-purple-500 text-white" 
                                  : `bg-white/5 border-white/10 hover:border-purple-500/50 ${getRarityStyle(item.rarity)}`
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${getRarityDot(item.rarity)}`} />
                                {item.name}
                              </button>
                            </Tooltip>
                          ))}
                </div>
              </div>
            </div>

            {/* Item Selection */}
            <div className="ff-card p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-brand-red" />
                  <h2 className="text-xl uppercase">Objetos Valiosos</h2>
                </div>
                <span className="text-xs text-white/40">{selectedItems.length} seleccionados</span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-white/40" />
                </div>
                <input 
                  type="text"
                  placeholder="Busca objetos raros (Ej: Sakura, Hip Hop, Evo...)"
                  className="ff-input w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {searchQuery && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 z-50 mt-2 ff-card max-h-60 overflow-y-auto"
                    >
                      {filteredItems.length > 0 ? (
                            filteredItems.map(item => (
                              <Tooltip key={item.id} text={item.description} className="w-full">
                                <button
                                  onClick={() => toggleItem(item)}
                                  className={`w-full p-3 text-left hover:bg-white/5 flex items-center justify-between group border-b border-white/5 last:border-0 transition-all border-l-2 pl-4 ${
                                    item.rarity === "Legendary" ? "border-l-brand-yellow" :
                                    item.rarity === "Mythic" ? "border-l-orange-500" :
                                    item.rarity === "Epic" ? "border-l-purple-500" :
                                    item.rarity === "Rare" ? "border-l-blue-500" :
                                    "border-l-transparent"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${getRarityDot(item.rarity)}`} />
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <div className={`font-bold transition-colors ${getRarityTextColor(item.rarity)}`}>
                                          {item.name}
                                        </div>
                                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${getRarityBadgeStyle(item.rarity)}`}>
                                          {item.rarity}
                                        </span>
                                      </div>
                                      <div className="text-[9px] uppercase text-white/40 flex gap-2 mt-0.5">
                                        <span>{item.category}</span>
                                        <span>•</span>
                                        <span>ID: {item.id}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-red" />
                                </button>
                              </Tooltip>
                            ))
                      ) : (
                        <div className="p-4 text-center text-white/40 text-sm">No se encontraron más objetos...</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {selectedItems.map(item => (
                    <Tooltip key={item.id} text={item.description} className="w-full">
                      <motion.div 
                        layout
                        className={`flex items-center justify-between p-3 border rounded-lg overflow-hidden relative group transition-all duration-300 ${getSelectedRarityStyle(item.rarity)}`}
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-current opacity-60 filter drop-shadow-[0_0_4px_currentColor]" />
                        <div className="relative z-10 pl-3">
                          <div className="font-bold text-sm tracking-tight text-white">{item.name}</div>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${getRarityBadgeStyle(item.rarity)}`}>{item.rarity}</span>
                            <span className="ff-badge bg-black/30 text-white/40 border-none py-0 px-1">{item.category}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-black/35 rounded-full transition-colors text-white/60 hover:text-white relative z-20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    </Tooltip>
                  ))}
                {selectedItems.length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-white/5 rounded-xl text-white/40">
                    Selecciona tus skins más raras para una mejor valuación
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={handleEvaluate}
              disabled={isEvaluating || selectedItems.length === 0}
              className="ff-button-primary w-full py-4 text-lg flex items-center justify-center gap-3"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ANALIZANDO MERCADO...
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5" />
                  CALCULAR VALOR DE CUENTA
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-3 text-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Results Sidebar */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ff-card p-6 border-brand-red/40 bg-brand-red/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <TrendingUp className="w-24 h-24" />
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="text-center space-y-1">
                      <div className="text-xs uppercase tracking-widest text-brand-red font-bold">Valuación Estimada</div>
                      <div className="text-4xl md:text-5xl font-black text-brand-yellow font-display drop-shadow-[0_0_15px_rgba(255,204,0,0.3)]">
                        {result.estimatedValueRange}
                      </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase text-white/60">Puntaje de Rareza</span>
                        <span className="text-brand-red font-bold">{result.rarityScore}/100</span>
                      </div>
                      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-brand-red"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.rarityScore}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm uppercase flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-red" />
                        Análisis AI
                      </h3>
                      <p className="text-xs text-white/70 leading-relaxed italic border-l-2 border-brand-red/30 pl-3">
                        "{result.breakdown}"
                      </p>
                    </div>

                    {result.topRarityItems && result.topRarityItems.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm uppercase flex items-center gap-2">
                          <Zap className="w-4 h-4 text-brand-yellow" />
                          Mejores Activos
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.topRarityItems.map((item, i) => (
                            <span key={i} className="text-[10px] bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 px-2 py-1 rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => window.print()}
                      className="w-full py-2 bg-white text-black rounded-lg font-bold text-xs uppercase hover:bg-white/90 transition-colors"
                    >
                      Descargar Reporte
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ff-card p-12 text-center space-y-4 bg-white/[0.02]"
                >
                  <TrendingUp className="w-12 h-12 text-white/10 mx-auto" />
                  <p className="text-sm text-white/40">
                    Ingresa tus detalles y selecciona tus objetos más raros para ver la valuación aquí.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Tips */}
            <div className="ff-card p-4 space-y-3">
              <h3 className="text-xs uppercase font-bold text-white/60">¿Cómo valuamos?</h3>
              <div className="space-y-2">
                <div className="flex gap-2 text-[10px] text-white/60">
                  <span className="text-brand-red">01</span>
                  <span>Analizamos el costo original en diamantes de cada skin.</span>
                </div>
                <div className="flex gap-2 text-[10px] text-white/60">
                  <span className="text-brand-red">02</span>
                  <span>Calculamos el factor de rareza basado en la temporada (Ej: Sakura Season 1).</span>
                </div>
                <div className="flex gap-2 text-[10px] text-white/60">
                  <span className="text-brand-red">03</span>
                  <span>Ajustamos según la economía actual de la región seleccionada.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Chronological Incubators Timeline Section */}
        <div className="mt-8">
          <IncubatorTimeline 
            selectedItems={selectedItems} 
            onToggleItem={toggleItem} 
            allFFItems={FF_ITEMS} 
          />
        </div>

        <footer className="text-center py-12 border-t border-white/5 space-y-4">
          <div className="text-xl font-black italic tracking-widest text-white/20">BOOYAH!</div>
          <div className="text-[10px] text-white/30 uppercase tracking-widest">
            VALUATOR IA PARA FREE FIRE • NO AFILIADO A GARENA
          </div>
        </footer>

      </div>
    </div>
  );
}
