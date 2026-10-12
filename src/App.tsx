import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ArticleCard } from './components/ArticleCard';
import { ArticleModal } from './components/ArticleModal';
import type { Article, AWSCategory } from './types';
import { INITIAL_ARTICLES } from './data/initialData';
import { AWS_CATEGORIES } from './data/categories';
import { Search, Heart, Sparkles, PlusCircle } from 'lucide-react';

export function App() {
  // Modo oscuro / claro
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

  // Artículos persistidos
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

  // Lista de artículos que el usuario ya apoyó (Checklist To-Do mutuo)
  const [myLikedIds, setMyLikedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('creadores_likes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'liked'>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('creadores_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('creadores_likes', JSON.stringify(myLikedIds));
  }, [myLikedIds]);

  // Toggle de Apoyo / Like
  const handleToggleLike = (articleId: string) => {
    const isLiked = myLikedIds.includes(articleId);
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
  };

  // Crear nuevo artículo
  const handleAddArticle = (articleData: Partial<Article>) => {
    const newArticle: Article = {
      id: `art_${Date.now()}`,
      title: articleData.title || '',
      summary: articleData.summary || '',
      category: (articleData.category || 'Developer Tools') as AWSCategory,
      builderUrl: articleData.builderUrl || '',
      linkedinPostUrl: articleData.linkedinPostUrl,
      instagramPostUrl: articleData.instagramPostUrl,
      xPostUrl: articleData.xPostUrl,
      authorId: `usr_${Date.now()}`,
      authorName: articleData.authorName || 'Creador de la Comunidad',
      authorBio: articleData.authorBio || 'Miembro del Bootcamp AWS Builder Center',
      authorAvatarUrl: articleData.authorAvatarUrl || '/images/mascot_opt.png',
      authorBuilderUrl: articleData.authorBuilderUrl || articleData.builderUrl || '',
      authorLinkedinUrl: articleData.authorLinkedinUrl,
      authorInstagramUrl: articleData.authorInstagramUrl,
      authorXUrl: articleData.authorXUrl,
      createdAt: new Date().toISOString(),
      likesCount: 0
    };

    setArticles((prev) => [newArticle, ...prev]);
  };

  // Eliminar artículo
  const handleDeleteArticle = (articleId: string) => {
    if (confirm('¿Deseas retirar este artículo de la lista?')) {
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
      setMyLikedIds((prev) => prev.filter((id) => id !== articleId));
    }
  };

  // Artículos filtrados
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Texto
      const matchesText =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (art.summary && art.summary.toLowerCase().includes(searchQuery.toLowerCase()));

      // Categoría
      const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;

      // Estado de apoyo
      const isLiked = myLikedIds.includes(art.id);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'liked' && isLiked) ||
        (statusFilter === 'pending' && !isLiked);

      return matchesText && matchesCat && matchesStatus;
    });
  }, [articles, searchQuery, selectedCategory, statusFilter, myLikedIds]);

  const total = articles.length;
  const liked = myLikedIds.filter((id) => articles.some((a) => a.id === id)).length;
  const percent = total > 0 ? Math.round((liked / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-ink flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. Barra de Navegación con identidad de Playa Vicente */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenNewArticle={() => setIsModalOpen(true)}
      />

      {/* 2. Hero Section: Directo y sin florituras genéricas */}
      <section className="relative border-b border-border bg-gradient-to-b from-surface/50 to-background pt-10 pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comunidad Oficial &bull; AWS User Group Playa Vicente</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="font-display font-black text-2xl sm:text-4xl text-ink tracking-tight leading-tight">
                Hub de Creadores <span className="text-amber-500">AWS Builder Center</span>
              </h1>
              <p className="text-sm sm:text-base text-muted max-w-2xl mt-2 leading-relaxed">
                Plataforma de apoyo mutuo para miembros del Bootcamp de Creadores y la comunidad. Conoce a cada builder, lee sus artículos técnicos y apoya las publicaciones donde los difundió.
              </p>
            </div>

            {/* Barra de progreso de lectura y apoyo To-Do */}
            <div className="w-full lg:w-80 shrink-0 bg-surface border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  Tu apoyo comunitario
                </span>
                <span className="font-mono text-amber-500 font-bold">{liked} de {total} ({percent}%)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60 text-[11px]">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    statusFilter === 'all' ? 'bg-amber-500/15 text-amber-500 font-bold' : 'text-muted hover:text-ink'
                  }`}
                >
                  Todos ({total})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    statusFilter === 'pending' ? 'bg-amber-500/15 text-amber-500 font-bold' : 'text-muted hover:text-ink'
                  }`}
                >
                  Pendientes ({total - liked})
                </button>
                <button
                  onClick={() => setStatusFilter('liked')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    statusFilter === 'liked' ? 'bg-emerald-500/15 text-emerald-500 font-bold' : 'text-muted hover:text-ink'
                  }`}
                >
                  Apoyados ({liked})
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Filtros y Búsqueda */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por creador, tema o título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm pl-10 pr-4 py-2 rounded-xl border border-border bg-surface text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Selector de Categorías Oficiales */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="all">Todas las categorías de AWS</option>
            {AWS_CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 4. Lista Principal de Creadores y sus Artículos (Mobile-First) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {filteredArticles.length > 0 ? (
          <div className="space-y-4 sm:space-y-5">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isLikedByMe={myLikedIds.includes(article.id)}
                onToggleLike={handleToggleLike}
                onDelete={handleDeleteArticle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-surface rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-ink">
              No se encontraron artículos con ese filtro
            </h3>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto mt-1 mb-5">
              Prueba cambiando la búsqueda o sé el primero en sumar un nuevo artículo de la comunidad.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Sumar mi artículo
            </button>
          </div>
        )}
      </main>

      {/* 5. Footer con enlaces oficiales de AWS UG Playa Vicente */}
      <footer className="border-t border-border bg-surface/50 py-8 px-4 sm:px-6 mt-12 text-center text-xs text-muted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/mascot_opt.png" alt="Mascota" className="w-6 h-6 object-contain" />
            <span className="font-display font-bold text-ink">AWS User Group Playa Vicente</span>
            <span>&bull;</span>
            <span>Bootcamp Creadores LATAM</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <a href="https://awsugplayavicente.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
              Sitio Oficial
            </a>
            <a href="https://www.meetup.com/aws-user-group-playa-vicente" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
              Meetup
            </a>
            <a href="https://chat.whatsapp.com/LRSCG0GdTwY8datTlsNGXE" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
              Comunidad WhatsApp
            </a>
            <a href="https://www.linkedin.com/company/111588988" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>

      {/* Modal para sumar artículos */}
      <ArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddArticle}
      />

    </div>
  );
}

export default App;
