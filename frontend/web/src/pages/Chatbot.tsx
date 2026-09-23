import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, Sparkles, CheckCircle2, AlertTriangle, 
  ArrowRight, MapPin, RefreshCw, Send, Trash2, Maximize2, 
  User, Bot, Check, X, ShieldAlert, Loader2, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { mockUser, products, supermarketById, formatPrice } from '@/data/mock';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  type: 'welcome' | 'text' | 'processing' | 'rich-recipe' | 'out-of-stock';
  content?: string;
  step?: number;
};

export default function Chatbot() {
  const [isGuest, setIsGuest] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', type: 'welcome' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (isGuest) {
      setShowAuthModal(true);
      return;
    }
    
    if (!text.trim() || isProcessing) return;

    const newMsg: Message = { id: Date.now().toString(), role: 'user', type: 'text', content: text };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsProcessing(true);

    // Check if it's the out of stock trigger
    const isOutOfStockScenario = text.toLowerCase().includes('harina de almendras');

    // Add processing message
    const processingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: processingId, role: 'assistant', type: 'processing', step: 1 }]);

    // Simulate steps
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === processingId ? { ...m, step: 2 } : m));
    }, 1500);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === processingId ? { ...m, step: 3 } : m));
    }, 3000);

    setTimeout(() => {
      setIsProcessing(false);
      setMessages(prev => prev.filter(m => m.id !== processingId));
      
      if (isOutOfStockScenario) {
        setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), role: 'assistant', type: 'out-of-stock' }]);
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), role: 'assistant', type: 'rich-recipe' }]);
      }
    }, 4500);
  };

  const handleClear = () => {
    setMessages([{ id: Date.now().toString(), role: 'assistant', type: 'welcome' }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background text-foreground overflow-hidden relative">
      {/* Header */}
      <header className="flex-none flex items-center justify-between px-4 py-3 bg-card border-b border-border shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center">
            <Bot className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="font-semibold text-base leading-tight">Chef & Shopper IA</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                Catálogos actualizados
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex group relative items-center justify-center rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-accent transition-colors">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
            Consultas IA: {mockUser.cuotaTokensIa}/5 disponibles
            {/* Tooltip */}
            <div className="absolute top-full mt-2 w-48 rounded-md border border-border bg-card p-2 text-center text-xs text-muted-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 pointer-events-none z-50">
              Conviértete en Colaborador para cuota extendida
            </div>
          </div>

          <div className="flex items-center gap-1 border-l border-border pl-2 ml-2">
             <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer mr-2">
              <input 
                type="checkbox" 
                checked={isGuest} 
                onChange={(e) => setIsGuest(e.target.checked)}
                className="rounded border-input text-emerald-600 focus:ring-emerald-600"
              />
              Modo Guest
            </label>
            <button onClick={handleClear} className="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors" title="Vaciar chat">
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors hidden sm:block" title="Pantalla completa">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-background scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3 sm:gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
              
              {/* Assistant Avatar */}
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mt-1">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              {/* Message Content */}
              <div className={cn(
                "relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                msg.role === 'user' 
                  ? "bg-emerald-600 text-white rounded-br-none" 
                  : "bg-card border border-border text-foreground rounded-bl-none shadow-sm"
              )}>
                {msg.type === 'text' && <p className="leading-relaxed">{msg.content}</p>}
                
                {msg.type === 'welcome' && (
                  <div className="space-y-4">
                    <p className="leading-relaxed">
                      ¡Hola! Soy tu asistente inteligente de compras. Puedo ayudarte a planificar tus comidas optimizando tu presupuesto con los precios reales de Temuco. ¿Qué tienes en mente hoy?
                    </p>
                    <div className="flex flex-col gap-2 mt-4">
                      {[
                        "Almuerzo saludable para 4 por menos de $15.000",
                        "Asado familiar económico para este fin de semana",
                        "Busco Harina de Almendras 1kg"
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(chip)}
                          className="text-left px-3 py-2 text-sm bg-background hover:bg-emerald-50 dark:hover:bg-emerald-950 border border-border hover:border-emerald-200 dark:hover:border-emerald-800 rounded-xl transition-all duration-200 text-emerald-700 dark:text-emerald-400 font-medium"
                        >
                          "{chip}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.type === 'processing' && (
                  <div className="space-y-3 py-1">
                    <div className="flex items-center gap-3 text-sm">
                      {msg.step! > 1 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      <span className={msg.step! > 1 ? "text-foreground" : "text-muted-foreground"}>Extrayendo ingredientes y cantidades...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {msg.step! > 2 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : msg.step! === 2 ? <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> : <div className="h-4 w-4 rounded-full border-2 border-border" />}
                      <span className={msg.step! > 2 ? "text-foreground" : msg.step! === 2 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}>Cruzando stock en supermercados de Temuco...</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {msg.step! > 3 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : msg.step! === 3 ? <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> : <div className="h-4 w-4 rounded-full border-2 border-border" />}
                      <span className={msg.step! > 3 ? "text-foreground" : msg.step! === 3 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}>Redactando alternativa más conveniente...</span>
                    </div>
                  </div>
                )}

                {msg.type === 'out-of-stock' && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800 dark:text-amber-400">Producto sin stock en la zona</h4>
                        <p className="text-amber-700 dark:text-amber-300/80 mt-1 leading-relaxed">
                          No encontramos disponibilidad para 'Harina de Almendras 1kg' en ningún supermercado de Temuco en este momento. ¿Deseas buscar un reemplazo como Harina de Avena o Nuez?
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium rounded-md transition-colors">
                            Buscar reemplazos
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {msg.type === 'rich-recipe' && (
                  <div className="space-y-5">
                    <p className="leading-relaxed">
                      ¡Excelente elección! He calculado la alternativa más económica para tu almuerzo saludable. Aquí tienes los ingredientes optimizados según los catálogos vigentes:
                    </p>
                    
                    <div className="space-y-2.5">
                      {[
                        { 
                          name: products[0].name, 
                          market: supermarketById(products[0].supermarketId)?.name || "Supermercado", 
                          marketColor: `bg-[${supermarketById(products[0].supermarketId)?.color}]/10 text-[${supermarketById(products[0].supermarketId)?.color}] border-[${supermarketById(products[0].supermarketId)?.color}]/20`, 
                          price: formatPrice(products[0].price), 
                          stock: true 
                        },
                        { 
                          name: products[1].name, 
                          market: supermarketById(products[1].supermarketId)?.name || "Supermercado", 
                          marketColor: `bg-[${supermarketById(products[1].supermarketId)?.color}]/10 text-[${supermarketById(products[1].supermarketId)?.color}] border-[${supermarketById(products[1].supermarketId)?.color}]/20`, 
                          price: formatPrice(products[1].price), 
                          stock: true 
                        },
                        { 
                          name: products[3].name, 
                          market: supermarketById(products[3].supermarketId)?.name || "Supermercado", 
                          marketColor: `bg-[${supermarketById(products[3].supermarketId)?.color}]/10 text-[${supermarketById(products[3].supermarketId)?.color}] border-[${supermarketById(products[3].supermarketId)?.color}]/20`, 
                          price: formatPrice(products[3].price), 
                          stock: false, 
                          substitute: "Sustituto sugerido: Cous Cous" 
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-3 rounded-xl border border-border bg-background hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                          <div className="flex gap-3 items-start sm:items-center">
                            <input type="checkbox" defaultChecked className="mt-1 sm:mt-0 h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-600" />
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", item.marketColor)}>
                                  {item.market}
                                </span>
                                {item.stock ? (
                                  <span className="inline-flex items-center text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                    <Check className="h-3 w-3 mr-0.5" /> En stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                    <RefreshCw className="h-3 w-3 mr-0.5" /> {item.substitute}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold self-end sm:self-auto shrink-0 bg-background px-2 py-1 rounded-md border border-border shadow-sm">
                            {item.price}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg">
                      <div className="rounded-[10px] bg-card p-4 h-full">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-muted-foreground font-medium">Subtotal Estimado</span>
                          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$10.870</span>
                        </div>
                        <Link 
                          to="/route"
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors shadow-sm focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                        >
                          <MapPin className="h-4 w-4" />
                          Calcular Ruta Óptima
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 mt-1">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Input Area */}
      <div className="flex-none bg-card border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
            className="relative flex items-end gap-2 bg-background border border-border rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all"
          >
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder="Pide una receta, ingredientes o presupuesto..."
              className="w-full max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground"
              rows={1}
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isProcessing}
              className="p-2.5 mb-0.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-muted disabled:text-muted-foreground transition-colors shrink-0 flex items-center justify-center"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <Info className="h-3 w-3" />
            Los precios y el stock son validados contra catálogos vigentes de Temuco.
          </p>
        </div>
      </div>

      {/* Auth Gating Modal Overlay */}
      {showAuthModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-2">
                <ShieldAlert className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Inicia sesión para consultar al Asistente IA
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                El cálculo inteligente de recetas y optimización de rutas requiere una cuenta activa para personalizar tu experiencia.
              </p>
              
              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="w-full bg-background border border-border hover:bg-accent text-foreground font-medium py-2.5 rounded-xl transition-colors"
                >
                  Crear Cuenta Gratuita
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
