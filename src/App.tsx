import { useState, useEffect, useMemo } from 'react';
import { Navbar, type AppTheme } from './components/Navbar';
import { ArticleCard } from './components/ArticleCard';
import { ArticleModal } from './components/ArticleModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { ParticlesBg } from './components/ParticlesBg';
import type { Article, AWSCategory, CreatorProfile } from './types';
import { INITIAL_ARTICLES } from './data/initialData';
import { AWS_CATEGORIES } from './data/categories';
import { Search, Sparkles, CheckCircle, UserPlus, BookOpen, PlusCircle } from 'lucide-react';
import { ConsoleSecurity, checkInputSecurity } from './components/ConsoleSecurity';
import { getArticles, createArticle, updateArticle, deleteArticle, toggleLike } from './services/api';

export function App() {
  // 🎨 Gestión de los 2 Temas Oficiales: Espectral 🌙 y Confortable Slate ☀️
  const [theme, setTheme] = useState<AppTheme>(() => {
    return localStorage.getItem('awsug_theme') === 'light' ? 'light' : 'dark';
  });

  const applyThemeToDOM = (t: AppTheme) => {
    const el = document.documentElement;
    el.classList.remove('dark', 'tropical', 'light');
    el.classList.add(t);
    localStorage.setItem('awsug_theme', t);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next: AppTheme = prev === 'dark' ? 'light' : 'dark';
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
    // Actualizar también en los artículos del usuario si cambió el nombre, bio, avatar o redes
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

  // 📝 Artículos del Hub (Carga reactiva desde DynamoDB con caché local)
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

  // Carga inicial desde DynamoDB Serverless
  useEffect(() => {
    getArticles().then((data) => {
      if (data && data.length > 0) {
        setArticles(data);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('creadores_articles', JSON.stringify(articles));
  }, [articles]);

  // ❤️ Artículos que el usuario actual ya apoyó (Checklist personal por cada creador)
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

  // Cargar checklist individual cuando cambia el usuario logueado
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`creadores_likes_${currentUser.id}`);
      if (saved) {
        try {
          setMyLikedIds(JSON.parse(saved));
          return;
        } catch {
          // ignore
        }
      }
      setMyLikedIds([]);
    } else {
      setMyLikedIds([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`creadores_likes_${currentUser.id}`, JSON.stringify(myLikedIds));
    }
  }, [myLikedIds, currentUser]);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'liked'>('all');

  // Modales
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Toggle de Apoyo (Solo para usuarios registrados para llevar control real y evitar spam)
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
        prev.map((art) =>
          art.id === articleId ? { ...art, likesCount: Math.max(0, art.likesCount - 1) } : art
        )
      );
    } else {
      setMyLikedIds((prev) => [...prev, articleId]);
      setArticles((prev) =>
        prev.map((art) =>
          art.id === articleId ? { ...art, likesCount: art.likesCount + 1 } : art
        )
      );
    }

    // Sincronización en segundo plano con Amazon DynamoDB
    toggleLike(articleId, delta).catch(() => {});
  };

  // Crear o Actualizar artículo (con vigencia de 30 días deslizantes y persistencia DynamoDB)
  const handleSaveArticle = async (articleData: Partial<Article>) => {
    if (!currentUser) return;

    if (articleData.id) {
      // ✏️ Actualización de artículo existente por su autor
      const articleId = articleData.id;
      setArticles((prev) =>
        prev.map((art) =>
          art.id === articleId
            ? {
                ...art,
                title: articleData.title || art.title,
                summary: articleData.summary || art.summary,
                category: (articleData.category || art.category) as AWSCategory,
                builderUrl: articleData.builderUrl || art.builderUrl,
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
      // 🚀 Publicación de nuevo artículo con TTL de 30 días deslizantes
      const now = Date.now();
      const localNewArticle: Article = {
        id: `art_${now}`,
        title: articleData.title || '',
        summary: articleData.summary || '',
        category: (articleData.category || 'Developer Tools') as AWSCategory,
        builderUrl: articleData.builderUrl || '',
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
        expiresAt: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ttl: Math.floor(now / 1000) + 30 * 24 * 60 * 60,
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
    // 1. Eliminar publicaciones del autor en DynamoDB
    const userArticles = articles.filter((a) => a.authorId === userId);
    for (const art of userArticles) {
      deleteArticle(art.id, userId).catch(() => {});
    }

    // 2. Limpiar del estado y almacenamiento local
    setArticles((prev) => prev.filter((a) => a.authorId !== userId));
    localStorage.removeItem('creadores_active_user');
    localStorage.removeItem(`creadores_likes_${userId}`);

    // 3. Resetear sesión y cerrar modales
    setMyLikedIds([]);
    setCurrentUser(null);
    setIsProfileModalOpen(false);

    alert('Tu cuenta, checklist y publicaciones han sido eliminados correctamente del Hub.');
  };

  // Filtrado reactivo (coincide por título, resumen, autor y también por categoría/etiquetas)
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
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
  }, [articles, searchQuery, selectedCategory, statusFilter, myLikedIds]);

  const stats = useMemo(() => {
    const total = articles.length;
    const supported = myLikedIds.filter((id) => articles.some((a) => a.id === id)).length;
    const pending = Math.max(0, total - supported);
    return { total, supported, pending };
  }, [articles, myLikedIds]);

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col transition-colors duration-300 relative overflow-x-hidden">
      {/* 🔒 Auditoría y Mensaje de Seguridad en Consola (AWS UG Playa Vicente) */}
      <ConsoleSecurity />

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
          {/* Orbes de luz ambientales con pulso suave estilo UG Playa Vicente */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-accent text-xs font-bold mb-3 sm:mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Comunidad Abierta &middot; AWS Builder Center & Creadores LATAM</span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-ink tracking-tight leading-tight mb-3">
                Hub Comunitario de Creadores{' '}
                <span className="spectrum-text">AWS Builder Center</span>
              </h1>

              <p className="text-xs sm:text-sm text-muted leading-relaxed mb-6">
                Lee, apoya y amplifica los artículos técnicos de la comunidad. Aunque esta plataforma nació inspirada en el Bootcamp de Creación de Contenido LATAM, está abierta para que cualquier builder comparta sus aprendizajes, dé visibilidad a sus publicaciones y lleve su propio checklist interactivo.
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
                        ¡Bienvenido/a, {currentUser.name}! 👋
                      </p>
                      <p className="text-xs text-muted">
                        Comparte tus posts de AWS Builder Center para recibir apoyo mutuo.
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
                      <span>Publicar mi Artículo</span>
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
                        ¿Creas o compartes contenido técnico en AWS?
                      </p>
                      <p className="text-[11px] text-muted">
                        Cualquier builder de la comunidad puede iniciar sesión para registrar sus posts de AWS Builder Center, dar difusión y recibir apoyo.
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

            {/* Emblema Oficial AWSUG Playa Vicente con Aura Espectral */}
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

        {/* ── PANEL DE FILTROS & CHECKLIST TO-DO ── */}
        <section className="space-y-3">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  checkInputSecurity(e.target.value);
                }}
                placeholder="Buscar por título, tema o autor..."
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-purple-500 transition-colors shadow-sm"
              />
            </div>

            {/* Selector de categoría */}
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

          {/* Filtros de Apoyo Comunitario (To-Do) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'bg-surface border border-border text-muted hover:text-ink'
              }`}
            >
              Todos ({stats.total})
            </button>

            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-purple-500 text-white shadow-sm'
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
                  ? 'bg-purple-500 text-white shadow-sm'
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

        {/* ── LISTA DE ARTÍCULOS ── */}
        <section className="space-y-4">
          {filteredArticles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface/50">
              <BookOpen className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-ink">
                No se encontraron publicaciones con estos filtros.
              </p>
              <p className="text-xs text-muted mt-1">
                Prueba ajustando el término de búsqueda o la categoría seleccionada.
              </p>
            </div>
          ) : (
            filteredArticles.map((article) => (
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
            ))
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
          
          <div className="flex items-center gap-4">
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

      {/* ── MODALES ── */}
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

    </div>
  );
}

export default App;
