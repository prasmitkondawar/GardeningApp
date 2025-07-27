const PlantDirectory: React.FC = () => {

    async function fetchPlants(uuid: string) {
        try {
          const response = await fetch('http://10.0.0.237:8000/fetch-plants', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Fetched todos:', data);
          
          return data;
        } catch (error) {
          console.error('Error fetching todos:', error);
          throw error;
        }
    }

    return (
        <>
        </>
    )
}

export default PlantDirectory;