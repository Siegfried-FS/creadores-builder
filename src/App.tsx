import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import type { FilterStatus } from './components/StatsBar';
import { ArticleCard } from './components/ArticleCard';
import { ArticleModal } from './components/ArticleModal';
import { ProfileModal } from './components/ProfileModal';
import { ConsoleSecurityBanner } from './components/ConsoleSecurityBanner';
import { SecurityShield } from './components/SecurityShield';
import type { Article, CreatorProfile, AWSCategory } from './types';
import { INITIAL_ARTICLES, CURRENT_USER_MOCK } from './data/initialData';
import { AWS_CATEGORIES } from './data/categories';
import { getNextMonthFirstDay } from './utils/sanitizer';
import { Search, Sparkles, BookOpen, HeartHandshake } from 'lucide-react';

export function App() {
  // Estado de modo oscuro
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Usuario actual (simulado con Cognito Ready)
  const [currentUser, setCurrentUser] = useState<CreatorProfile>(() => {
    const saved = localStorage.getItem('creadores_profile');
    return saved ? JSON.parse(saved) : CURRENT_USER_MOCK;
  });

  // Artículos
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('creadores_articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  // Likes / Apoyos dados por el usuario actual (Checklist To-Do)
  const [myLikedArticleIds, setMyLikedArticleIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('creadores_likes');
    return saved ? JSON.parse(saved) : ['art_001'];
  });

  // Persistencia en localStorage
  useEffect(() => {
    localStorage.setItem('creadores_profile', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('creadores_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('creadores_likes', JSON.stringify(myLikedArticleIds));
  }, [myLikedArticleIds]);

  // Estados de interfaz y filtrado
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Modales
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Toggle de Apoyo / Like
  const handleToggleLike = (articleId: string) => {
    const alreadyLiked = myLikedArticleIds.includes(articleId);
    
    if (alreadyLiked) {
      // Quitar like
      setMyLikedArticleIds((prev) => prev.filter((id) => id !== articleId));
      setArticles((prev) =>
        prev.map((art) =>
          art.id === articleId ? { ...art, likesCount: Math.max(0, art.likesCount - 1) } : art
        )
      );
    } else {
      // Dar like
      setMyLikedArticleIds((prev) => [...prev, articleId]);
      setArticles((prev) =>
        prev.map((art) =>
          art.id === articleId ? { ...art, likesCount: art.likesCount + 1 } : art
        )
      );
    }
  };

  // Crear o editar artículo
  const handleSaveArticle = (articleData: Partial<Article>) => {
    if (articleData.id) {
      // Editar
      setArticles((prev) =>
        prev.map((art) =>
          art.id === articleData.id
            ? { ...art, ...articleData, updatedAt: new Date().toISOString() }
            : art
        )
      );
    } else {
      // Nuevo artículo
      const newArt: Article = {
        id: `art_${Date.now()}`,
        title: articleData.title || '',
        category: (articleData.category || 'Security, Identity & Compliance') as AWSCategory,
        builderUrl: articleData.builderUrl || '',
        linkedinPostUrl: articleData.linkedinPostUrl,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorBuilderHandle: currentUser.builderHandle,
        authorAvatarUrl: currentUser.avatarUrl,
        createdAt: new Date().toISOString(),
        expiresAt: getNextMonthFirstDay(),
        likesCount: 0,
      };
      setArticles((prev) => [newArt, ...prev]);
    }
  };

  // Eliminar artículo (solo autor)
  const handleDeleteArticle = (articleId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este artículo de la lista?')) {
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
      setMyLikedArticleIds((prev) => prev.filter((id) => id !== articleId));
    }
  };

  // Filtrado de artículos
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Filtro de búsqueda por texto
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.authorBuilderHandle.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro de categoría oficial
      const matchesCategory =
        selectedCategory === 'all' || art.category === selectedCategory;

      // Filtro To-Do (Pendientes vs Ya apoyados)
      const isLiked = myLikedArticleIds.includes(art.id);
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'liked' && isLiked) ||
        (filterStatus === 'pending' && !isLiked);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [articles, searchQuery, selectedCategory, filterStatus, myLikedArticleIds]);

  // Métricas
  const totalArticles = articles.length;
  const likedCount = myLikedArticleIds.filter((id) => articles.some((a) => a.id === id)).length;
  const uniqueCreators = new Set(articles.map((a) => a.authorId)).size;
  const totalCommunityLikes = articles.reduce((acc, curr) => acc + curr.likesCount, 0);

  return (
    <SecurityShield>
      <ConsoleSecurityBanner />
      <div className="min-h-screen bg-background text-ink flex flex-col font-sans transition-colors duration-200">
      
      {/* Barra de Navegación Oficial */}
      <Navbar
        currentUser={currentUser}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenNewArticle={() => {
          setEditingArticle(null);
          setIsArticleModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-b from-slate-100/60 to-transparent dark:from-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-full bg-aws-orange/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AWS User Group Playa Vicente &bull; Creadores LATAM</span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-4xl text-ink tracking-tight">
                Hub de Apoyo Mutuo para AWS Builder Center
              </h1>
              <p className="text-sm sm:text-base text-muted max-w-2xl mt-2 leading-relaxed">
                Descubre artículos publicados por los miembros de la comunidad, márcalos en tu lista de lectura y apóyalos con likes y comentarios en AWS Builder Center y LinkedIn.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => {
                  setEditingArticle(null);
                  setIsArticleModalOpen(true);
                }}
                className="flex items-center space-x-2 bg-aws-orange hover:bg-amber-600 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Compartir mi Artículo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Barra de Progreso To-Do y Métricas */}
        <StatsBar
          totalArticles={totalArticles}
          likedCount={likedCount}
          uniqueCreatorsCount={uniqueCreators}
          totalCommunityLikes={totalCommunityLikes}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {/* Barra de Búsqueda y Categorías Oficiales */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Buscador */}
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por título, autor o usuario (@)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-aws-orange/50 transition-all"
              />
            </div>

            {/* Total contador de resultados */}
            <div className="text-xs text-muted font-mono whitespace-nowrap self-end sm:self-center">
              Mostrando {filteredArticles.length} artículos
            </div>
          </div>

          {/* Carrusel / Píldoras de Categorías Oficiales */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap border transition-all ${
                selectedCategory === 'all'
                  ? 'bg-ink text-white dark:bg-white dark:text-gray-900 border-transparent shadow-sm'
                  : 'bg-surface text-muted border-border hover:border-slate-300 dark:hover:border-gray-700'
              }`}
            >
              Todas las Categorías
            </button>
            {AWS_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap border transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-aws-orange text-white border-transparent shadow-sm'
                    : 'bg-surface text-muted border-border hover:border-slate-300 dark:hover:border-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grilla de Artículos */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                currentUser={currentUser}
                isLikedByMe={myLikedArticleIds.includes(article.id)}
                onToggleLike={handleToggleLike}
                onEdit={(art) => {
                  setEditingArticle(art);
                  setIsArticleModalOpen(true);
                }}
                onDelete={handleDeleteArticle}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center max-w-md mx-auto my-8">
            <BookOpen className="w-12 h-12 text-muted mx-auto mb-3 opacity-40" />
            <h3 className="font-display font-bold text-base text-ink mb-1">
              No se encontraron artículos
            </h3>
            <p className="text-xs text-muted mb-4">
              {filterStatus === 'pending'
                ? '¡Felicidades! No tienes artículos pendientes por apoyar con este filtro.'
                : 'Intenta ajustando los términos de búsqueda o cambia la categoría seleccionada.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setFilterStatus('all');
                }}
                className="text-xs font-semibold text-aws-blue hover:underline"
              >
                Restablecer todos los filtros
              </button>
            )}
          </div>
        )}

      </main>

      {/* Footer Oficial */}
      <footer className="border-t border-border bg-white dark:bg-gray-900 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center space-x-2">
            <img src="/images/mascot_opt.png" alt="AWS UG Playa Vicente" className="h-6 w-6 object-contain" />
            <span>&copy; {new Date().getFullYear()} AWS User Group Playa Vicente &bull; Creadores Bootcamp</span>
          </div>

          {/* Enlaces de Comunidad: Telegram & WhatsApp */}
          <div className="flex items-center space-x-3">
            <span className="text-muted text-[11px] font-semibold">Comunidad activa:</span>
            <a
              href="https://t.me/AUGPlayaVicente"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] text-[11px] font-semibold transition-colors"
            >
              <span>Telegram</span>
            </a>
            <a
              href="https://chat.whatsapp.com/KXQYW7V00q12cSoeijob4h"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold transition-colors"
            >
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="font-mono text-[11px]">
            Dominio oficial: <span className="text-ink font-semibold">creadores.awsugplayavicente.com</span>
          </div>
        </div>
      </footer>

      {/* Modales */}
      <ArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => {
          setIsArticleModalOpen(false);
          setEditingArticle(null);
        }}
        onSubmit={handleSaveArticle}
        currentUser={currentUser}
        initialArticle={editingArticle}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onSaveProfile={setCurrentUser}
      />

    </div>
    </SecurityShield>
  );
}

export default App;
