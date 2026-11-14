import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { ArticleCard } from './components/ArticleCard';
import { ParticlesBg } from './components/ParticlesBg';
import type { Article, AWSCategory, CreatorProfile, ItemType } from './types';
import { INITIAL_ARTICLES } from './data/initialData';
import { AWS_CATEGORIES } from './data/categories';
import {
  Search,
  Sparkles,
  CheckCircle,
  UserPlus,
  BookOpen,
  PlusCircle,
  Lightbulb,
  MessageSquare,
  FileText,
  Award,
  Calendar,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { getArticles, createArticle, updateArticle, deleteArticle, toggleLike } from './services/api';

const ArticleModal = lazy(() => import('./components/ArticleModal').then((m) => ({ default: m.ArticleModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then((m) => ({ default: m.AuthModal })));
const ProfileModal = lazy(() => import('./components/ProfileModal').then((m) => ({ default: m.ProfileModal })));
const SecurityHoneypotModal = lazy(() => import('./components/SecurityHoneypotModal').then((m) => ({ default: m.SecurityHoneypotModal })));
const ConsoleSecurity = lazy(() => import('./components/ConsoleSecurity').then((m) => ({ default: m.ConsoleSecurity })));

export function App() {
  // 🎨 Gestión de los 2 Temas Oficiales Independientes (Diurno ☀️ vs Espectral 🌙)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return localStorage.getItem('awsug_theme') === 'dark' ? 'dark' : 'light';
  });

  const applyThemeToDOM = (t: 'dark' | 'light') => {
    const el = document.documentElement;
    el.classList.remove('dark', 'light');
    el.classList.add(t);
    localStorage.setItem('awsug_theme', t);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyThemeToDOM(next);
      return next;
    });
  };

  // 👤 Sesión de Usuario (Inicia como visitante si no hay guardada)
  const [currentUser, setCurrentUser] = useState<CreatorProfile | null>(() => {
    const saved = localStorage.getItem('creadores_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const handleLoginSuccess = (user: CreatorProfile) => {
    setCurrentUser(user);
    localStorage.setItem('creadores_active_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('creadores_active_user');
  };

  const handleUpdateUser = (updated: CreatorProfile) => {
    setCurrentUser(updated);
    localStorage.setItem('creadores_active_user', JSON.stringify(updated));
    setArticles((prev) =>
      prev.map((art) =>
        art.authorId === updated.id
          ? {
              ...art,
              authorName: updated.name,
              authorBio: updated.bio,
              authorAvatarUrl: updated.avatarUrl,
              authorBuilderUrl: updated.builderUrl,
              authorLinkedinUrl: updated.linkedinUrl,
              authorGithubUrl: updated.githubUrl,
              authorInstagramUrl: updated.instagramUrl,
            }
          : art
      )
    );
  };

  // 📝 Publicaciones del Hub (Carga reactiva desde DynamoDB Serverless)
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('creadores_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    return INITIAL_ARTICLES;
  });

  // Carga inicial y sincronización fluida desde DynamoDB Serverless
  useEffect(() => {
    getArticles().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setArticles(
          data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('creadores_articles', JSON.stringify(articles));
  }, [articles]);

  // ❤️ Checklist personal de apoyos por cada creador
  const [myLikedIds, setMyLikedIds] = useState<string[]>(() => {
    if (!currentUser) return [];
    const saved = localStorage.getItem(`creadores_likes_${currentUser.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Cargar checklist individual sincronizado con DynamoDB (likedBy) y localStorage
  useEffect(() => {
    if (currentUser) {
      const dbLikedIds = articles
        .filter((a) => Array.isArray(a.likedBy) && a.likedBy.includes(currentUser.id))
        .map((a) => a.id);

      const saved = localStorage.getItem(`creadores_likes_${currentUser.id}`);
      let localLikedIds: string[] = [];
      if (saved) {
        try {
          localLikedIds = JSON.parse(saved);
        } catch {
          // ignore
        }
      }

      const merged = Array.from(new Set([...dbLikedIds, ...localLikedIds]));
      setMyLikedIds(merged);
    } else {
      setMyLikedIds([]);
    }
  }, [currentUser, articles]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`creadores_likes_${currentUser.id}`, JSON.stringify(myLikedIds));
    }
  }, [myLikedIds, currentUser]);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'liked'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ItemType>('all');

  // Modales
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [copiedGlobalIguana, setCopiedGlobalIguana] = useState(false);

  const handleCopyGlobalIguana = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('🦎');
      } else {
        const input = document.createElement('textarea');
        input.value = '🦎';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedGlobalIguana(true);
      setTimeout(() => setCopiedGlobalIguana(false), 2500);
    } catch {
      setCopiedGlobalIguana(true);
      setTimeout(() => setCopiedGlobalIguana(false), 2500);
    }
  };

  // Toggle de Apoyo Idempotente (1 creador = 1 voto)
  const handleToggleLike = (articleId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const isLiked = myLikedIds.includes(articleId);
    const delta = isLiked ? -1 : 1;
    
    if (isLiked) {
      setMyLikedIds((prev) => prev.filter((id) => id !== articleId));
      setArticles((prev) =>
        prev.map((art) => {
          if (art.id !== articleId) return art;
          const newLikedBy = (art.likedBy || []).filter((id) => id !== currentUser.id);
          return {
            ...art,
            likedBy: newLikedBy,
            likesCount: Math.max(0, art.likesCount - 1),
          };
        })
      );
    } else {
      setMyLikedIds((prev) => [...prev, articleId]);
      setArticles((prev) =>
        prev.map((art) => {
          if (art.id !== articleId) return art;
          const currentLiked = art.likedBy || [];
          const newLikedBy = currentLiked.includes(currentUser.id) ? currentLiked : [...currentLiked, currentUser.id];
          return {
            ...art,
            likedBy: newLikedBy,
            likesCount: art.likesCount + 1,
          };
        })
      );
    }

    // Sincronización en segundo plano con Amazon DynamoDB pasando el userId real
    toggleLike(articleId, currentUser.id, delta).catch(() => {});
  };

  // Crear o Actualizar publicación permanente
  const handleSaveArticle = async (articleData: Partial<Article>) => {
    if (!currentUser) return;

    if (articleData.id) {
      // ✏️ Actualización de publicación existente por su autor
      const articleId = articleData.id;
      setArticles((prev) =>
        prev.map((art) =>
          art.id === articleId
            ? {
                ...art,
                itemType: articleData.itemType || art.itemType || 'article',
                title: articleData.title || art.title,
                summary: articleData.summary || art.summary,
                category: (articleData.category || art.category) as AWSCategory,
                builderUrl: articleData.builderUrl || art.builderUrl,
                wishlistUrl: articleData.wishlistUrl || art.wishlistUrl,
                commentUrl: articleData.commentUrl || art.commentUrl,
                linkedinPostUrl: articleData.linkedinPostUrl,
                instagramPostUrl: articleData.instagramPostUrl,
              }
            : art
        )
      );
      setEditingArticle(null);

      // Persistir en DynamoDB
      updateArticle(articleId, {
        ...articleData,
        authorId: currentUser.id,
      }).catch((err) => console.warn('Error actualizando en DynamoDB:', err));
    } else {
      // 🚀 Publicación permanente sin expiración por TTL
      const now = Date.now();
      const localNewArticle: Article = {
        id: `hub_${now}`,
        itemType: articleData.itemType || 'article',
        title: articleData.title || '',
        summary: articleData.summary || '',
        category: (articleData.category || 'Developer Tools') as AWSCategory,
        builderUrl: articleData.builderUrl || '',
        wishlistUrl: articleData.wishlistUrl,
        commentUrl: articleData.commentUrl,
        linkedinPostUrl: articleData.linkedinPostUrl,
        instagramPostUrl: articleData.instagramPostUrl,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorBio: currentUser.bio,
        authorAvatarUrl: currentUser.avatarUrl || '/images/mascot_opt.png',
        authorBuilderUrl: currentUser.builderUrl,
        authorLinkedinUrl: currentUser.linkedinUrl,
        authorGithubUrl: currentUser.githubUrl,
        authorInstagramUrl: currentUser.instagramUrl,
        createdAt: new Date().toISOString(),
        likesCount: 0,
      };

      // Optimistic update
      setArticles((prev) => [localNewArticle, ...prev]);

      // Guardar en DynamoDB
      try {
        const savedDynamo = await createArticle({
          ...articleData,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorBio: currentUser.bio,
          authorAvatarUrl: currentUser.avatarUrl || '/images/mascot_opt.png',
          authorBuilderUrl: currentUser.builderUrl,
          authorLinkedinUrl: currentUser.linkedinUrl,
          authorGithubUrl: currentUser.githubUrl,
          authorInstagramUrl: currentUser.instagramUrl,
        });
        if (savedDynamo && savedDynamo.id) {
          setArticles((prev) => prev.map((a) => (a.id === localNewArticle.id ? savedDynamo : a)));
        }
      } catch (err) {
        console.warn('Error guardando en DynamoDB:', err);
      }
    }
  };

  const handleDeleteArticle = (articleId: string) => {
    if (!currentUser) return;
    if (confirm('¿Deseas retirar esta publicación del Hub?')) {
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
      deleteArticle(articleId, currentUser.id).catch((err) =>
        console.warn('Error eliminando en DynamoDB:', err)
      );
    }
  };

  // 🛡️ Derecho al olvido: Eliminar cuenta, sesión y todas las publicaciones del usuario
  const handleDeleteAccount = async (userId: string) => {
    const userArticles = articles.filter((a) => a.authorId === userId);
    for (const art of userArticles) {
      deleteArticle(art.id, userId).catch(() => {});
    }

    setArticles((prev) => prev.filter((a) => a.authorId !== userId));
    localStorage.removeItem('creadores_active_user');
    localStorage.removeItem(`creadores_likes_${userId}`);

    setMyLikedIds([]);
    setCurrentUser(null);
    setIsProfileModalOpen(false);

    alert('Tu cuenta, checklist y publicaciones han sido eliminados correctamente del Hub.');
  };

  // Filtrado reactivo (coincide por tipo, título, resumen, autor y categoría)
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Filtro por tipo de contribución (Artículo, Wishlist, Comentario)
      if (typeFilter !== 'all') {
        const currentType = art.itemType || 'article';
        if (currentType !== typeFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesSummary = art.summary ? art.summary.toLowerCase().includes(q) : false;
        const matchesAuthor = art.authorName.toLowerCase().includes(q);
        const matchesCategory = art.category ? art.category.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesSummary && !matchesAuthor && !matchesCategory) return false;
      }

      if (selectedCategory !== 'all' && art.category !== selectedCategory) {
        return false;
      }

      const isLiked = myLikedIds.includes(art.id);
      if (statusFilter === 'pending' && isLiked) return false;
      if (statusFilter === 'liked' && !isLiked) return false;

      return true;
    });
  }, [articles, typeFilter, searchQuery, selectedCategory, statusFilter, myLikedIds]);

  // Paginación inteligente: 20 publicaciones iniciales
  const [visibleCount, setVisibleCount] = useState<number>(20);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, selectedCategory, statusFilter, typeFilter]);

  const displayedArticles = useMemo(() => {
    return filteredArticles.slice(0, visibleCount);
  }, [filteredArticles, visibleCount]);

  const stats = useMemo(() => {
    const total = articles.length;
    const articlesCount = articles.filter((a) => (a.itemType || 'article') === 'article').length;
    const wishlistsCount = articles.filter((a) => a.itemType === 'wishlist').length;
    const commentsCount = articles.filter((a) => a.itemType === 'comment').length;
    const supported = myLikedIds.filter((id) => articles.some((a) => a.id === id)).length;
    const pending = Math.max(0, total - supported);
    return { total, articlesCount, wishlistsCount, commentsCount, supported, pending };
  }, [articles, myLikedIds]);

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col transition-colors duration-300 relative overflow-x-hidden">
      {/* Auditoría y Mensaje de Seguridad en Consola (AWS UG Playa Vicente) */}
      <Suspense fallback={null}>
        <ConsoleSecurity />
      </Suspense>

      {/* 🔮 Canvas de Partículas Global: Animación interactiva en TODO el sitio web */}
      <ParticlesBg />

      {/* 🔮 Barra superior espectral del UG Playa Vicente */}
      <div className="spectrum-bar" />

      {/* 🧭 Navbar Cápsula Flotante Oficial con Selector de Temas */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 🌟 Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        
        {/* ── HERO BANNER DEL HUB DE CREADORES ── */}
        <section className="relative rounded-3xl p-6 sm:p-10 border border-border glass-card overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-accent text-xs font-bold mb-3 sm:mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AWS Builder Center & Creadores LATAM &middot; AWS UG Playa Vicente</span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-ink tracking-tight leading-tight mb-3">
                Hub de Creadores y Misiones{' '}
                <span className="spectrum-text">AWS Builder Center</span>
              </h1>

              <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
                Impulsa tus publicaciones técnicas, vota propuestas en la <strong>Wishlist de AWS</strong> y participa en debates con <strong>feedback constructivo</strong>. Ayudémonos como comunidad hispanohablante a desbloquear las <strong>21 misiones</strong> de AWS Builder Center.
              </p>

              {/* Aviso de acción según estado de sesión */}
              {currentUser ? (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatarUrl || '/images/mascot_opt.png'}
                      alt={currentUser.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/mascot_opt.png';
                      }}
                      className="w-12 h-12 rounded-xl object-cover border border-purple-500/30 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-bold text-ink">
                        ¡Hola de nuevo, {currentUser.name}!
                      </p>
                      <p className="text-xs text-muted">
                        Comparte tus artículos, deseos de Wishlist o comentarios de valor para recibir apoyo.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setEditingArticle(null);
                        setIsArticleModalOpen(true);
                      }}
                      className="btn-primary-gradient px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Nueva Publicación</span>
                    </button>
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="px-3 py-2 rounded-xl border border-border bg-surface hover:bg-surface-hover text-muted hover:text-ink text-xs font-medium transition-colors"
                      title="Configurar mis redes opcionales"
                    >
                      Mis Redes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                      <UserPlus className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">
                        ¿Participas en AWS Builder Center o Creadores LATAM?
                      </p>
                      <p className="text-[11px] text-muted">
                        Inicia sesión con Google para compartir tus artículos, votar en la Wishlist y llevar tu checklist de apoyos mutuos.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn-primary-gradient px-4 py-2 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Emblema Oficial AWSUG Playa Vicente */}
            <div className="relative shrink-0 hidden md:flex items-center justify-center w-36 h-36 lg:w-44 lg:h-44">
              <div className="absolute inset-0 bg-purple-500/25 rounded-full blur-2xl animate-pulse pointer-events-none" />
              <img
                src="/images/logo-tight.svg"
                alt="AWS User Group Playa Vicente"
                className="w-full h-full object-contain filter drop-shadow-[0_0_16px_rgba(168,85,247,0.55)] transition-transform hover:scale-105"
              />
            </div>
          </div>
        </section>

        {/* ── CARD INFORMATIVO: LAS 21 MISIONES DE AWS BUILDER CENTER & LINKTREE ── */}
        <section className="rounded-2xl p-4 sm:p-5 border border-purple-500/30 bg-purple-500/5 backdrop-blur-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-sm sm:text-base text-ink">
                  Estrategia Comunitaria: Las 21 Misiones de AWS Builder Center
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  Voucher 100% Examen AWS
                </span>
              </div>
              <p className="text-xs text-muted mt-1 leading-relaxed max-w-3xl">
                Al completar las 21 misiones (lectura, artículos, votos en <strong>Wishlist</strong> y <strong>comentarios de alto valor</strong>), AWS entrega hasta $30 USD en créditos y un voucher del 100% para certificación Foundational (CLF-C02 o AIF-C01). ¡Colaboremos para que ningún builder se quede sin su insignia!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            <a
              href="https://linktr.ee/awsusergroupplayavicente"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-500/30 bg-purple-500/15 hover:bg-purple-500/25 text-purple-600 dark:text-purple-300 text-xs font-bold transition-all shadow-sm"
              title="Acceder a todos los canales, meetups y redes del AWS User Group Playa Vicente"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Eventos & Meetups UG</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </a>
          </div>
        </section>

        {/* ── BANNER COMUNITARIO: DAR PARA RECIBIR & EL SELLO DE LA IGUANA ── */}
        <section className="rounded-2xl p-4 sm:p-5 border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-lg select-none">
              🦎
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-sm text-ink">
                  Comunidad: Dar para recibir
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                  Detalle Opcional
                </span>
              </div>
              <p className="text-xs text-muted mt-1 leading-relaxed max-w-3xl">
                Un like apoya, pero saber que tu artículo le sirvió a alguien y recibir feedback real es lo que hace crecer a un creador. Cuando leas el contenido de otro compañero, no te limites a pedir apoyo: tómate dos minutos para leer el suyo y dejar un comentario constructivo. Si gustas, puedes dejar una <strong>iguana 🦎</strong> al final de tu comentario en Builder Center como un guiño opcional para saber si alguien llegó gracias a esta herramienta.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={handleCopyGlobalIguana}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Copiar emoji de iguana para pegar al final de tu comentario en AWS Builder Center (opcional)"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedGlobalIguana ? '¡Iguana copiada!' : 'Copiar 🦎'}</span>
            </button>
          </div>
        </section>

        {/* ── PANEL DE FILTROS & PESTAÑAS DE CONTRIBUCIÓN ── */}
        <section className="space-y-3.5">
          
          {/* Pestañas Maestras: Todos vs Artículos vs Wishlist vs Comentarios */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                typeFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-surface border border-border text-muted hover:text-ink hover:bg-surface-hover'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Todo el Hub ({stats.total})</span>
            </button>

            <button
              onClick={() => setTypeFilter('article')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                typeFilter === 'article'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-surface border border-border text-muted hover:text-ink hover:bg-surface-hover'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Artículos Técnicos ({stats.articlesCount})</span>
            </button>

            <button
              onClick={() => setTypeFilter('wishlist')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                typeFilter === 'wishlist'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-surface border border-border text-muted hover:text-ink hover:bg-surface-hover'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Wishlist AWS ({stats.wishlistsCount})</span>
            </button>

            <button
              onClick={() => setTypeFilter('comment')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                typeFilter === 'comment'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-surface border border-border text-muted hover:text-ink hover:bg-surface-hover'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Comentarios & Feedback ({stats.commentsCount})</span>
            </button>
          </div>

          {/* Barra de búsqueda y selector de categoría */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, propuesta, debate o autor..."
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors shadow-sm"
              />
            </div>

            <div className="sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-purple-500 transition-colors shadow-sm"
              >
                <option value="all">Todas las Categorías ({articles.length})</option>
                {AWS_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtros de Apoyo Comunitario (Checklist To-Do) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40'
                  : 'bg-surface border border-border text-muted hover:text-ink'
              }`}
            >
              Ver todos
            </button>

            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40'
                  : 'bg-surface border border-border text-muted hover:text-ink'
              }`}
            >
              <span>Pendientes de apoyar</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-[10px] font-mono">
                {stats.pending}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('liked')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'liked'
                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40'
                  : 'bg-surface border border-border text-muted hover:text-ink'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Ya apoyados</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-[10px] font-mono">
                {stats.supported}
              </span>
            </button>
          </div>

        </section>

        {/* ── LISTA DE PUBLICACIONES ── */}
        <section className="space-y-4">
          {articles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface/50">
              <BookOpen className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <p className="text-base font-bold text-ink">
                ¡Aún no hay publicaciones registradas!
              </p>
              <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                Sé el primer builder de la comunidad en compartir tus artículos, deseos de Wishlist o comentarios con feedback para recibir apoyo mutuo.
              </p>
              <button
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                  } else {
                    setEditingArticle(null);
                    setIsArticleModalOpen(true);
                  }
                }}
                className="btn-primary-gradient px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 mt-4 shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar mi primera contribución</span>
              </button>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface/50">
              <BookOpen className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-ink">
                No se encontraron publicaciones con estos filtros.
              </p>
              <p className="text-xs text-muted mt-1">
                Prueba ajustando el término de búsqueda, la pestaña o la categoría seleccionada.
              </p>
            </div>
          ) : (
            <>
              {displayedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isLikedByMe={myLikedIds.includes(article.id)}
                  onToggleLike={handleToggleLike}
                  onEdit={(art: Article) => {
                    setEditingArticle(art);
                    setIsArticleModalOpen(true);
                  }}
                  canEdit={currentUser ? currentUser.id === article.authorId : false}
                  onDelete={handleDeleteArticle}
                  canDelete={currentUser ? currentUser.id === article.authorId : false}
                />
              ))}

              {/* Botón de paginación */}
              {visibleCount < filteredArticles.length && (
                <div className="pt-4 pb-2 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 20)}
                    className="px-6 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-ink text-xs font-bold transition-all shadow-sm hover:border-purple-500/50"
                  >
                    <span>Cargar más ({filteredArticles.length - visibleCount} restantes)</span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </main>

      {/* ── PIE DE PÁGINA COMUNITARIO ── */}
      <footer className="border-t border-border mt-12 py-8 bg-surface/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/logo-tight.svg"
              alt="AWSUG"
              className="w-6 h-6 object-contain filter drop-shadow-[0_0_4px_rgba(168,85,247,0.7)]"
            />
            <span className="font-medium text-ink">AWS User Group Playa Vicente &middot; Creadores LATAM</span>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="https://linktr.ee/awsusergroupplayavicente"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Linktree Oficial</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://awsugplayavicente.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              Sitio Oficial UG
            </a>
            <a
              href="https://t.me/AUGPlayaVicente"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              Telegram
            </a>
            <a
              href="https://chat.whatsapp.com/KXQYW7V00q12cSoeijob4h"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </footer>

      {/* Honeypot y Modales cargados dinámicamente bajo demanda */}
      <Suspense fallback={null}>
        <SecurityHoneypotModal />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        {currentUser && (
          <>
            <ProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              onOpenPublishArticle={() => {
                setEditingArticle(null);
                setIsArticleModalOpen(true);
              }}
              onDeleteAccount={handleDeleteAccount}
              userArticles={articles.filter((a) => a.authorId === currentUser.id)}
              onEditArticle={(art) => {
                setEditingArticle(art);
                setIsArticleModalOpen(true);
              }}
              onDeleteArticle={handleDeleteArticle}
            />

            <ArticleModal
              isOpen={isArticleModalOpen}
              onClose={() => {
                setIsArticleModalOpen(false);
                setEditingArticle(null);
              }}
              author={currentUser}
              initialArticle={editingArticle}
              onSubmit={handleSaveArticle}
            />
          </>
        )}
      </Suspense>

    </div>
  );
}

export default App;
