import React, { useState, useEffect } from 'react';
import { fetchEntities, fetchEntityById, searchEntityByCnic } from '../api/entities';
import { LoadingSpinner } from '../app/components/shared/LoadingSpinner';

// Minimal types for the component
type Entity = {
  id: string;
  cnic: string;
  fullName: string;
  profession: string;
  caseStatus: string;
  complianceScore: {
    total: number;
    level: string;
  };
};

export const EntityList = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadInitialEntities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEntities();
      setEntities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialEntities();
  }, []);

  const handleSelectEntity = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const entity = await fetchEntityById(id);
      setSelectedEntity(entity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadInitialEntities(); // Reload all entities if search is cleared
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const entity = await searchEntityByCnic(searchTerm);
      if (entity) {
        setEntities([entity]);
        setSelectedEntity(null); // Clear selection
      } else {
        setEntities([]);
        setError('No entity found with that CNIC.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Entity Investigation Portal</h1>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by CNIC (e.g., 42101-1234567-3) or clear to reset"
          className="border p-2 rounded w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Search
        </button>
      </form>

      {loading && <LoadingSpinner />}
      {error && <div className="text-red-500 bg-red-100 p-3 rounded">Error: {error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold">Entities ({entities.length})</h2>
            <ul className="mt-2 space-y-2">
              {entities.map((entity) => (
                <li
                  key={entity.id} // <-- Important: Added key prop
                  onClick={() => handleSelectEntity(entity.id)}
                  className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                >
                  <p className="font-bold">{entity.fullName}</p>
                  <p className="text-sm text-gray-600">{entity.cnic}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold">Entity Details</h2>
            {selectedEntity ? (
              <div className="mt-2 p-4 border rounded bg-white">
                <p><strong>ID:</strong> {selectedEntity.id}</p>
                <p><strong>Name:</strong> {selectedEntity.fullName}</p>
                <p><strong>CNIC:</strong> {selectedEntity.cnic}</p>
                <p><strong>Profession:</strong> {selectedEntity.profession}</p>
                <p><strong>Case Status:</strong> {selectedEntity.caseStatus}</p>
                <p><strong>Compliance Score:</strong> {selectedEntity.complianceScore.total} ({selectedEntity.complianceScore.level})</p>
              </div>
            ) : (
              <p className="mt-2 text-gray-500">Select an entity to see details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

