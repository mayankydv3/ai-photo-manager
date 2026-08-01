import React, { useEffect, useState } from 'react';
import { Users, Edit2, Check, UserCheck, Images } from 'lucide-react';
import { api } from '../services/api';
import PhotoCard from '../components/PhotoCard';

export default function People({ onPhotoClick }) {
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personPhotos, setPersonPhotos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');

  const fetchPeople = async () => {
    try {
      const data = await api.getPeople();
      setPeople(data);
      if (data.length > 0 && !selectedPerson) {
        selectPerson(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectPerson = async (person) => {
    setSelectedPerson(person);
    try {
      const photos = await api.getPersonPhotos(person.id);
      setPersonPhotos(photos);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleSaveName = async (personId) => {
    if (!newName.trim()) return;
    try {
      await api.updatePersonName(personId, newName);
      setEditingId(null);
      fetchPeople();
    } catch (err) {
      alert('Error updating name: ' + err.message);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Facial Recognition & People Grouping</h1>
          <p className="text-xs text-slate-400">Automated DBSCAN face feature clustering groups photos by individual people</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* People List Sidebar */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recognized Individuals</p>
          
          <div className="space-y-2">
            {people.map((person) => {
              const isSelected = selectedPerson?.id === person.id;
              const isEditing = editingId === person.id;

              return (
                <div
                  key={person.id}
                  onClick={() => selectPerson(person)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/10 border-purple-500/40 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700">
                      {person.cover_photo_url ? (
                        <img src={person.cover_photo_url} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserCheck className="w-5 h-5 text-purple-400" />
                      )}
                    </div>

                    <div>
                      {isEditing ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-slate-950 px-2 py-1 border border-purple-500 rounded text-xs text-white"
                          />
                          <button
                            onClick={() => handleSaveName(person.id)}
                            className="p-1 bg-purple-600 text-white rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-semibold text-xs text-slate-200">{person.name}</h3>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">{person.face_count} face detections</span>
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(person.id);
                        setNewName(person.name);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Person Photo Gallery */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPerson ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  Photos featuring <span className="text-purple-400 font-mono">{selectedPerson.name}</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">{personPhotos.length} Photos</span>
              </div>

              {personPhotos.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
                  No photos found for this person.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {personPhotos.map((p) => (
                    <PhotoCard key={p.id} photo={p} onClick={onPhotoClick} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
              Select a person from the list to view their recognized photos.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
