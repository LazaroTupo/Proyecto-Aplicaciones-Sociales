const baseUrl = 'http://localhost:3001';

async function seed() {
  console.log('🌱 Iniciando poblado de datos (Seeder)...');

  const userPayload = {
    email: `inversor_seed@test.com`, // Correo fijo para no crear cientos de usuarios
    password: 'password123',
    name: 'Usuario Inversor Seed'
  };

  let token = '';

  try {
    // 1. Intentar hacer Login primero para ver si ya existe
    console.log(`Buscando usuario ${userPayload.email}...`);
    let loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userPayload.email, password: userPayload.password })
    });

    if (loginRes.ok) {
      const loginData = await loginRes.json();
      token = loginData.access_token;
      console.log(`✅ Usuario ya existía. Sesión iniciada.`);
    } else {
      // Si falla el login, asumimos que no existe y lo registramos
      console.log(`Usuario no encontrado. Registrando nuevo usuario...`);
      const authRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      });
      
      if (!authRes.ok) {
         const err = await authRes.json();
         throw new Error(`Error al crear usuario: ${JSON.stringify(err)}`);
      }
      
      // Intentar login nuevamente después de registrar
      loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userPayload.email, password: userPayload.password })
      });
      
      const loginData = await loginRes.json();
      token = loginData.access_token;
      console.log(`✅ Usuario creado y sesión iniciada.`);
    }

    // 2. Obtener proyectos existentes para no duplicar
    const existingRes = await fetch(`${baseUrl}/projects/allByUser`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const existingProjects = await existingRes.json();

    // 3. Crear proyectos
    const projects = [
      {
        title: "Dron Autónomo de Reforestación",
        description: "Dron capaz de disparar semillas de árboles endémicos en zonas de difícil acceso.",
        budget: 15000,
        deadLine: "2026-12-31",
        sector: 5,
        durationMonths: 12,
        teamSize: 4,
        complexity: "HIGH",
        hasPatents: false,
        hasTechnicalDoc: true,
        hasVideoPitch: true,
        trlLevel: 4,
        hasMarketStudy: true,
        hasMonetizationModel: false,
        hasDirectCompetitors: false,
        supervisorExperience: 5,
        priorSimilarProjects: 1
      },
      {
        title: "App de Tutoría Universitaria Inteligente",
        description: "Aplicación móvil con IA para conectar alumnos con los mejores tutores según su estilo de aprendizaje.",
        budget: 5000,
        deadLine: "2026-08-15",
        sector: 1,
        durationMonths: 6,
        teamSize: 2,
        complexity: "MEDIUM",
        hasPatents: false,
        hasTechnicalDoc: false,
        hasVideoPitch: false,
        trlLevel: 2,
        hasMarketStudy: false,
        hasMonetizationModel: true,
        hasDirectCompetitors: true,
        supervisorExperience: 1,
        priorSimilarProjects: 0
      },
      {
        title: "Nuevo Sistema de Filtros de Agua de Grafeno",
        description: "Sistema avanzado de purificación de agua de bajo costo usando grafeno modificado, patentado por la universidad.",
        budget: 80000,
        deadLine: "2027-01-01",
        sector: 2,
        durationMonths: 24,
        teamSize: 6,
        complexity: "HIGH",
        hasPatents: true,
        hasTechnicalDoc: true,
        hasVideoPitch: true,
        trlLevel: 6,
        hasMarketStudy: true,
        hasMonetizationModel: true,
        hasDirectCompetitors: false,
        supervisorExperience: 12,
        priorSimilarProjects: 4
      }
    ];

    for (const p of projects) {
      console.log(`\nProcesando proyecto: ${p.title}...`);
      
      // Buscar si el proyecto ya existe por título
      const existe = existingProjects.find(ep => ep.title === p.title);
      let projectId = null;

      if (existe) {
        console.log(`⚠️ El proyecto ya existe (ID: ${existe.id}). Omitiendo creación...`);
        projectId = existe.id;
      } else {
        const projRes = await fetch(`${baseUrl}/projects`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(p)
        });
        if (!projRes.ok) throw new Error(`Error al crear proyecto ${p.title}`);
        const projData = await projRes.json();
        projectId = projData.id;
        console.log(`✅ Proyecto creado (ID: ${projectId})`);
      }
      
      // Llamar al AI Analysis siempre para asegurarnos que tenga los índices
      console.log(`🧠 Analizando proyecto ${projectId} con IA (FastAPI)...`);
      const analyzeRes = await fetch(`${baseUrl}/projects/${projectId}/analyze`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      if (analyzeRes.ok) {
         console.log(`✅ Proyecto ${projectId} analizado con éxito.`);
      } else {
         console.log(`⚠️ Falló el análisis para el proyecto ${projectId}.`);
      }
    }

    console.log('\n🎉 Seeder completado con éxito!');

  } catch (error) {
    console.error('\n❌ Error en el seeder:', error.message);
  }
}

seed();
