import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlantCard {
  ImageURL: string;
  PlantName: string;
  PlantPetName: string;
  ScientificName: string;
  Species: string;
  PlantID: number;
  PlantHealth: number;
}

interface PlantImageContextType {
  updatePlantImage: (plantId: number, newImageUrl: string) => void;
  getPlantImage: (plantId: number) => string | null;
  refreshPlantData: () => Promise<void>;
}

const PlantImageContext = createContext<PlantImageContextType | undefined>(undefined);

interface PlantImageProviderProps {
  children: ReactNode;
}

export const PlantImageProvider: React.FC<PlantImageProviderProps> = ({ children }) => {
  const [plantImages, setPlantImages] = useState<{ [plantId: number]: string }>({});

  const updatePlantImage = (plantId: number, newImageUrl: string) => {
    setPlantImages(prev => ({
      ...prev,
      [plantId]: newImageUrl
    }));
  };

  const getPlantImage = (plantId: number): string | null => {
    return plantImages[plantId] || null;
  };

  const refreshPlantData = async () => {
    // This function can be used to refresh plant data from the server
    // For now, we'll just clear the local cache to force fresh data
    setPlantImages({});
  };

  return (
    <PlantImageContext.Provider value={{
      updatePlantImage,
      getPlantImage,
      refreshPlantData
    }}>
      {children}
    </PlantImageContext.Provider>
  );
};

export const usePlantImage = () => {
  const context = useContext(PlantImageContext);
  if (context === undefined) {
    throw new Error('usePlantImage must be used within a PlantImageProvider');
  }
  return context;
};
