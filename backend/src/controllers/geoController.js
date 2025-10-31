const getUniversityLocation = (req, res) => {
  try {
    const universityData = {
      name: process.env.UNIVERSITY_NAME || 'Universidad',
      latitude: parseFloat(process.env.UNIVERSITY_LAT) || 19.432608,
      longitude: parseFloat(process.env.UNIVERSITY_LNG) || -99.133209,
      address: process.env.UNIVERSITY_ADDRESS || 'Dirección de la universidad'
    };

    res.json({
      success: true,
      university: universityData,
      message: 'Ubicación de la universidad obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error en getUniversityLocation:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la ubicación de la universidad'
    });
  }
};

module.exports = {
  getUniversityLocation
};