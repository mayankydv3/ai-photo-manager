import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Duplicates from './pages/Duplicates';
import Categories from './pages/Categories';
import People from './pages/People';
import Connectors from './pages/Connectors';
import LightboxModal from './components/LightboxModal';
import DuplicateInspectorModal from './components/DuplicateInspectorModal';
import { api } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedDuplicateGroup, setSelectedDuplicateGroup] = useState(null);

  const refreshData = async () => {
    try {
      const statsData = await api.getStats();
      setStats(statsData);

      const photosData = await api.getPhotos({ limit: 100 });
      setPhotos(photosData);
    } catch (err) {
      console.error('Error loading API data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      refreshData();
      return;
    }
    try {
      const matched = await api.searchPhotos({ query, limit: 100 });
      setPhotos(matched);
      setActivePage('gallery');
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    refreshData();
  };

  const handleInspectDuplicateForPhoto = async (photo) => {
    try {
      const groups = await api.getDuplicateGroups();
      const matchGroup = groups.find(
        (g) => g.primary_photo?.id === photo.id || g.duplicates?.some((d) => d.id === photo.id)
      );
      if (matchGroup) {
        setSelectedDuplicateGroup(matchGroup);
      } else {
        alert('Duplicate group metadata not found for this photo.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderCurrentPage = () => {
    if (activePage.startsWith('category-')) {
      const catId = activePage.replace('category-', '');
      return (
        <Categories
          photos={photos}
          onPhotoClick={setSelectedPhoto}
          initialCategory={catId}
        />
      );
    }

    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats}
            photos={photos}
            onPhotoClick={setSelectedPhoto}
            onNavigate={setActivePage}
            refreshData={refreshData}
          />
        );
      case 'gallery':
        return (
          <Gallery
            photos={photos}
            searchQuery={searchQuery}
            onResetSearch={handleResetSearch}
            onPhotoClick={setSelectedPhoto}
            onInspectDuplicate={handleInspectDuplicateForPhoto}
          />
        );
      case 'duplicates':
        return (
          <Duplicates
            onInspectGroup={setSelectedDuplicateGroup}
            refreshData={refreshData}
          />
        );
      case 'categories':
        return (
          <Categories
            photos={photos}
            onPhotoClick={setSelectedPhoto}
          />
        );
      case 'people':
        return (
          <People
            onPhotoClick={setSelectedPhoto}
          />
        );
      case 'connectors':
        return (
          <Connectors
            refreshData={refreshData}
          />
        );
      default:
        return (
          <Dashboard
            stats={stats}
            photos={photos}
            onPhotoClick={setSelectedPhoto}
            onNavigate={setActivePage}
            refreshData={refreshData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onSearch={handleSearch}
        activePage={activePage}
        stats={stats}
        refreshData={refreshData}
      />

      <div className="flex-1 flex">
        <Sidebar
          activePage={activePage}
          setActivePage={(page) => {
            setSearchQuery('');
            setActivePage(page);
          }}
          stats={stats}
        />

        <main className="flex-1 min-w-0 bg-slate-950/60 pb-16">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Modals */}
      {selectedPhoto && (
        <LightboxModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={() => refreshData()}
          onInspectDuplicate={(p) => {
            setSelectedPhoto(null);
            handleInspectDuplicateForPhoto(p);
          }}
        />
      )}

      {selectedDuplicateGroup && (
        <DuplicateInspectorModal
          group={selectedDuplicateGroup}
          onClose={() => setSelectedDuplicateGroup(null)}
          onResolved={() => refreshData()}
        />
      )}
    </div>
  );
}
