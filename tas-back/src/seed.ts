import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { ProjectsService } from './projects/projects.service';
import { Logger } from '@nestjs/common';
import { UserRole } from './users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentsService } from './payments/payments.service';
import { DataSource } from 'typeorm';
import { Reward } from './projects/entities/reward.entity';
import { RecommendationsService } from './recommendations/recommendations.service';
import { InteractionType } from './recommendations/entities/interaction.entity';

async function bootstrap() {
  const logger = new Logger('Seeder');
  logger.log('Iniciando Seeder Context...');

  // Creamos el contexto de la aplicación NestJS pero SIN levantar el servidor HTTP
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Obtenemos las instancias de nuestros servicios directamente
  const authService = app.get(AuthService);
  const usersService = app.get(UsersService);
  
  logger.log('Limpiando o preparando la base de datos...');
  
  try {
    let authResult;
    // 1. Crear un usuario de prueba usando el AuthService real (así la contraseña se hashea correctamente)
    logger.log('Creando usuario de prueba admin...');
    try {
      authResult = await authService.register({
        email: 'admin@impulsatec.com',
        password: 'Password123!',
        firstName: 'Admin',
        lastName: 'Principal',
        role: UserRole.ADMIN,
      });
    } catch (e: any) {
      if (e.code === '23505' || e.message?.includes('already exists') || e.message?.includes('already in use') || e.status === 400) {
        const existingUser = await usersService.findByEmail('admin@impulsatec.com');
        if (!existingUser) throw new Error('User should exist but not found');
        authResult = { id: existingUser.id };
      } else {
        throw e;
      }
    }
    
    const user = await usersService.getMe(authResult.id);
    
    logger.log(`¡Usuario Admin listo! ID: ${user.id}`);
    
    // --- INICIO INYECCIÓN MÓDULO AUTH ---
    logger.log('Creando perfiles hiperrealistas de Creadores y Financiadores...');
    const realisticUsersData = [
      { firstName: 'Elena', lastName: 'Salas', email: 'elena.salas@innovatech.com', password: 'Password123!', role: UserRole.CREATOR },
      { firstName: 'Marcos', lastName: 'Vargas', email: 'marcos.v@greenworld.org', password: 'Password123!', role: UserRole.CREATOR },
      { firstName: 'Sofia', lastName: 'Linares', email: 'sofia.linares@healthapp.net', password: 'Password123!', role: UserRole.CREATOR },
      { firstName: 'Javier', lastName: 'Rosas', email: 'j.rosas@investments.pe', password: 'Password123!', role: UserRole.BACKER },
      { firstName: 'Camila', lastName: 'Trelles', email: 'camila.trelles@capital.com', password: 'Password123!', role: UserRole.BACKER },
      { firstName: 'Roberto', lastName: 'Guzman', email: 'rguzman@techangels.com', password: 'Password123!', role: UserRole.BACKER },
      { firstName: 'Lucia', lastName: 'Mendez', email: 'lucia.mendez@eco-sustentable.org', password: 'Password123!', role: UserRole.CREATOR },
      { firstName: 'Andres', lastName: 'Caceres', email: 'andres.caceres@futurehardware.dev', password: 'Password123!', role: UserRole.CREATOR },
      { firstName: 'Valeria', lastName: 'Montes', email: 'valeria.montes@edutech.pe', password: 'Password123!', role: UserRole.CREATOR },
      { firstName: 'Diego', lastName: 'Navarro', email: 'diego.navarro@angelinvest.net', password: 'Password123!', role: UserRole.BACKER }
    ];

    const generatedUsers = [user]; // Guardamos el admin primero para el resto del flujo

    for (const data of realisticUsersData) {
      try {
        const authRes = await authService.register(data);
        const newUser = await usersService.getMe(authRes.id);
        generatedUsers.push(newUser);
        logger.log(`Perfil creado exitosamente: ${data.firstName} ${data.lastName} (${data.role})`);
      } catch (e: any) {
        if (e.code === '23505' || e.message?.includes('already exists') || e.status === 400) {
          logger.warn(`El usuario ${data.email} ya existe o falló validación. Recuperándolo de la BD...`);
          const existing = await usersService.findByEmail(data.email);
          if (existing) generatedUsers.push(existing as any); // cast for array compatibility
        } else {
          logger.error(`Error crítico creando al usuario ${data.email}: ${e.message}`);
        }
      }
    }
    logger.log(`Total de usuarios disponibles en el sistema (generatedUsers): ${generatedUsers.length}`);
    // --- FIN INYECCIÓN MÓDULO AUTH ---
    
    // --- INICIO INYECCIÓN MÓDULO USUARIOS ---
    logger.log('Enriqueciendo perfiles de usuarios con biografías y avatares realistas...');
    const biosCreadores = [
      'Ingeniera de software apasionada por las tecnologías limpias. Con más de 5 años en la industria del desarrollo sostenible, busco revolucionar cómo gestionamos el agua.',
      'Activista climático y emprendedor. Mi misión es construir soluciones de hardware de código abierto para monitorear la calidad del aire en ciudades latinoamericanas.',
      'Especialista en biotecnología y creadora de health-apps. Trabajo incansablemente para democratizar el acceso a la salud mental mediante IA.',
      'Arquitecto sustentable enfocado en la construcción de viviendas modulares de bajo coste y cero emisiones. Creando el futuro del urbanismo ecológico.',
      'Diseñador industrial obsesionado con la economía circular. Diseñando productos que no terminan en el vertedero.'
    ];
    const biosFinanciadores = [
      'Inversor ángel especializado en startups de impacto social y EdTech. Siempre en búsqueda del próximo gran equipo que cambie el mundo.',
      'Analista de venture capital enfocado en sostenibilidad y energías renovables. Apoyando el talento local con gran proyección.',
      'Emprendedor serial devolviendo al ecosistema. Interesado principalmente en proyectos de biotecnología y hardware avanzado.',
      'Entusiasta de la tecnología y micro-inversor. Me encanta apoyar proyectos innovadores en etapas tempranas que resuelvan problemas reales.'
    ];

    let creadorIdx = 0;
    let backerIdx = 0;

    for (const u of generatedUsers) {
      if (u.role === UserRole.ADMIN) continue; // Admin ya fue configurado arriba

      try {
        let bio = '';
        if (u.role === UserRole.CREATOR) {
          bio = biosCreadores[creadorIdx % biosCreadores.length];
          creadorIdx++;
        } else if (u.role === UserRole.BACKER) {
          bio = biosFinanciadores[backerIdx % biosFinanciadores.length];
          backerIdx++;
        }

        // Generamos un avatar atractivo con ui-avatars
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.firstName + '+' + u.lastName)}&background=random&color=fff&size=256`;

        // Enriquecemos el perfil usando nuestra función segura del UsersService
        await usersService.updateMe(u.id, {
          bio,
          avatarUrl
        });
        
        logger.log(`Perfil de ${u.firstName} ${u.lastName} enriquecido con Bio y Avatar.`);
      } catch (e: any) {
        logger.error(`Error enriqueciendo perfil de ${u.email}: ${e.message}`);
      }
    }
    logger.log('Todos los perfiles han sido enriquecidos exitosamente.');
    // --- FIN INYECCIÓN MÓDULO USUARIOS ---

    // --- INICIO INYECCIÓN MÓDULO PROYECTOS ---
    const projectsService = app.get(ProjectsService);
    const eventEmitter = app.get(EventEmitter2);

    logger.log('Inyectando proyectos hiperrealistas...');
    const realisticProjectsData = [
      {
        title: 'EcoDrone: Reforestación Aérea Autónoma',
        description: 'Desarrollo de drones capaces de plantar semillas encapsuladas en terrenos deforestados. Este proyecto busca mitigar el cambio climático mediante tecnología aeroespacial y botánica. Los drones usarán IA para identificar el suelo óptimo.',
        targetAmount: 45000,
        durationDays: 60,
        trlLevel: 6,
        hasVideo: true,
        category: 'Tecnología Sostenible',
        descriptionLength: 220,
        rewards: [
          { amount: 50, description: 'Certificado digital de plantación de 10 árboles.' },
          { amount: 200, description: 'Drone en miniatura impreso en 3D y reporte trimestral.' }
        ]
      },
      {
        title: 'VitaBand: Monitor de Signos Vitales para Adultos Mayores',
        description: 'Pulsera inteligente de bajo costo que monitorea frecuencia cardíaca y oxigenación. Envia alertas automáticas a familiares y centros médicos si detecta anomalías. Nuestro objetivo es reducir la tasa de mortalidad en zonas rurales.',
        targetAmount: 20000,
        durationDays: 45,
        trlLevel: 7,
        hasVideo: true,
        category: 'Salud y Bienestar',
        descriptionLength: 210,
        rewards: [
          { amount: 30, description: 'Mención en nuestra página web como pionero.' },
          { amount: 150, description: 'Una VitaBand de primera edición (Early Bird).' }
        ]
      },
      {
        title: 'AquaPura: Filtros de Grafeno Portátiles',
        description: 'Filtro de agua revolucionario utilizando grafeno para eliminar metales pesados y bacterias al 99.9%. Ideal para comunidades sin acceso a agua potable y campistas.',
        targetAmount: 15000,
        durationDays: 30,
        trlLevel: 5,
        hasVideo: false,
        category: 'Impacto Social',
        descriptionLength: 170,
        rewards: [
          { amount: 25, description: 'Filtro básico de supervivencia.' },
          { amount: 100, description: 'Pack familiar de 5 filtros y botella térmica.' }
        ]
      },
      {
        title: 'SolarCook: Cocinas Solares Plegables',
        description: 'Diseño de cocina solar portátil hecha con materiales reciclados. Permite cocinar alimentos en zonas de extrema pobreza sin necesidad de leña, previniendo enfermedades respiratorias y la deforestación local.',
        targetAmount: 8000,
        durationDays: 40,
        trlLevel: 8,
        hasVideo: true,
        category: 'Energías Renovables',
        descriptionLength: 205,
        rewards: [
          { amount: 15, description: 'Recetario digital de cocina solar.' },
          { amount: 80, description: 'Una cocina SolarCook donada a tu nombre a una familia.' }
        ]
      },
      {
        title: 'CodeKids: Kit de Robótica Educativa de Código Abierto',
        description: 'Un kit ensamblable y programable para enseñar lógica y programación a niños de escuelas públicas. Basado en Arduino y con piezas impresas en 3D locales para abaratar costos.',
        targetAmount: 12000,
        durationDays: 50,
        trlLevel: 6,
        hasVideo: true,
        category: 'Educación',
        descriptionLength: 185,
        rewards: [
          { amount: 20, description: 'Manual interactivo de robótica.' },
          { amount: 120, description: 'Kit completo CodeKids enviado a tu casa.' }
        ]
      }
    ];

    const generatedProjects: any[] = [];
    // Filtramos solo a los usuarios que sean creadores
    const creators = generatedUsers.filter(u => u.role === UserRole.CREATOR);

    for (let i = 0; i < realisticProjectsData.length; i++) {
      const pData = realisticProjectsData[i];
      // Asignar un creador aleatorio (o secuencial)
      const projectCreator = creators[i % creators.length] || user; 

      try {
        const savedProject = await projectsService.create(pData as any, projectCreator, []);
        generatedProjects.push(savedProject);
        logger.log(`Proyecto creado exitosamente: "${pData.title}" por ${projectCreator.firstName}. Indexado y Evaluado con IA.`);
        
        // Simular evento de estado
        eventEmitter.emit('project_status_changed', {
          userId: projectCreator.id,
          projectId: savedProject.id,
          projectName: savedProject.title,
          status: 'aprobado',
        });
      } catch (err: any) {
        logger.error(`Error al crear el proyecto "${pData.title}": ${err.message}`);
      }
    }
    logger.log(`Total de proyectos disponibles (generatedProjects): ${generatedProjects.length}`);
    // --- FIN INYECCIÓN MÓDULO PROYECTOS ---

    // --- INICIO INYECCIÓN MÓDULO PAGOS ---
    const paymentsService = app.get(PaymentsService);
    const dataSource = app.get(DataSource);
    logger.log('Simulando inversiones hiperrealistas en los proyectos generados...');

    const backers = generatedUsers.filter(u => u.role === UserRole.BACKER || u.role === UserRole.ADMIN);
    
    const realisticInvestments = [
       { amount: 50, useReward: true },
       { amount: 250, useReward: true },
       { amount: 1500, useReward: false },
       { amount: 30, useReward: true },
       { amount: 10000, useReward: false },
       { amount: 500, useReward: true },
    ];

    let investmentCount = 0;

    for (const project of generatedProjects) {
      try {
        // Aseguramos que el proyecto pueda recibir aportes
        await dataSource.query(`UPDATE projects SET status = 'funding' WHERE id = $1`, [project.id]);
        
        const rewards = await dataSource.manager.find(Reward, {
            where: { project: { id: project.id } },
            order: { amount: 'ASC' }
        });

        // 1 a 3 inversores aleatorios por proyecto
        const numInvestors = Math.floor(Math.random() * 3) + 1;
        
        for(let j = 0; j < numInvestors; j++) {
           const backer = backers[Math.floor(Math.random() * backers.length)];
           const investmentData = realisticInvestments[Math.floor(Math.random() * realisticInvestments.length)];
           
           let rewardId: string | undefined = undefined;
           if (investmentData.useReward && rewards && rewards.length > 0) {
              const validRewards = rewards.filter(r => Number(r.amount) <= investmentData.amount);
              if (validRewards.length > 0) {
                 rewardId = validRewards[validRewards.length - 1].id;
              }
           }

           try {
              // 1. Crear Orden
              const pledgeResult = await paymentsService.createPledge(project.id, backer.id, {
                 amount: investmentData.amount,
                 rewardId: rewardId
              });
              
              // 2. Capturar Pago
              await paymentsService.capturePayPalOrder(pledgeResult.paypalOrderId);
              
              logger.log(`Aporte de $${investmentData.amount} exitoso: ${backer.firstName} invirtió en "${project.title}"`);
              investmentCount++;
           } catch(e: any) {
              logger.error(`Error simulando aporte en "${project.title}" por ${backer.firstName}: ${e.message}`);
           }
        }
      } catch (e: any) {
        logger.error(`Error general procesando inversiones para ${project.title}: ${e.message}`);
      }
    }
    logger.log(`Se han procesado un total de ${investmentCount} inversiones de prueba.`);
    // --- FIN INYECCIÓN MÓDULO PAGOS ---

    // --- INICIO INYECCIÓN MÓDULO PREDICCIONES ---
    const predictionRepository = dataSource.getRepository('Prediction');
    logger.log('Generando perfiles de Inteligencia Artificial (Predicciones) para los proyectos...');

    const realisticAiData = [
      {
        successProbability: 88.5,
        feasibilityIndex: 8.2,
        transparencyIndex: 9.1,
        recommendations: [
          'El uso de tecnología aeroespacial eleva el riesgo operativo. Recomendamos detallar los costos de mantenimiento.',
          'Excelente TRL, pero podrías detallar más la experiencia del equipo técnico.',
          'Aclarar cómo se obtienen los permisos de vuelo en zonas protegidas.'
        ]
      },
      {
        successProbability: 92.0,
        feasibilityIndex: 9.0,
        transparencyIndex: 8.5,
        recommendations: [
          'La salud es un tema sensible. Asegúrate de enlazar certificaciones médicas del dispositivo VitaBand.',
          'Considera añadir más recompensas intermedias para backers menores.',
          'Un desglose detallado del uso de los $20,000 ayudaría a la transparencia.'
        ]
      },
      {
        successProbability: 75.3,
        feasibilityIndex: 6.8,
        transparencyIndex: 7.0,
        recommendations: [
          'Falta un video explicativo. Esto reduce drásticamente el índice de transparencia.',
          'Detalla mejor el proceso de manufactura y escalabilidad del grafeno.',
          'La meta es adecuada, pero el TRL 5 sugiere que aún faltan validaciones de laboratorio.'
        ]
      },
      {
        successProbability: 81.4,
        feasibilityIndex: 7.9,
        transparencyIndex: 8.2,
        recommendations: [
          'Las cocinas solares dependen de la geografía. Especifica las regiones del despliegue inicial.',
          'Añadir fotos reales de familias usando los prototipos aumentará la empatía.',
          'Considerar alianzas con ONGs locales para reducir costos de distribución.'
        ]
      },
      {
        successProbability: 89.9,
        feasibilityIndex: 8.5,
        transparencyIndex: 9.4,
        recommendations: [
          'El sector educativo requiere credibilidad. Menciona si ya tienes escuelas piloto interesadas.',
          'Tu meta de financiamiento es muy razonable y el TRL 6 respalda la viabilidad técnica.',
          'Ofrecer un manual interactivo es un gran acierto, ¡destácalo más en tu título!'
        ]
      }
    ];

    let predictionCount = 0;

    for (let i = 0; i < generatedProjects.length; i++) {
      const project = generatedProjects[i];
      // Seleccionamos la data correspondiente, o una aleatoria si hay más proyectos
      const aiData = realisticAiData[i % realisticAiData.length];
      
      try {
        // Buscamos si el proyecto ya fue evaluado al crearse (por si el ProjectsService disparó el endpoint real)
        let prediction = await predictionRepository.findOne({ where: { project: { id: project.id } } });
        
        if (!prediction) {
          prediction = predictionRepository.create({
            project: project,
            successProbability: aiData.successProbability,
            feasibilityIndex: aiData.feasibilityIndex,
            transparencyIndex: aiData.transparencyIndex,
            recommendations: aiData.recommendations
          });
          await predictionRepository.save(prediction);
          logger.log(`Predicción inyectada para "${project.title}": ${aiData.successProbability}% de éxito.`);
          predictionCount++;
        } else {
          logger.log(`El proyecto "${project.title}" ya contaba con una predicción (posiblemente generada por API).`);
        }
      } catch (e: any) {
        logger.error(`Error inyectando predicción para "${project.title}": ${e.message}`);
      }
    }
    
    logger.log(`Se han inyectado un total de ${predictionCount} predicciones hiperrealistas.`);
    // --- FIN INYECCIÓN MÓDULO PREDICCIONES ---

    // --- INICIO INYECCIÓN MÓDULO RECOMENDACIONES ---
    const recommendationsService = app.get(RecommendationsService);
    logger.log('Simulando interacciones hiperrealistas (vistas y likes) para nutrir el motor de recomendaciones...');

    let interactionCount = 0;
    
    for (const u of generatedUsers) {
      const numViews = Math.floor(Math.random() * 3) + 2; // 2 a 4 vistas por usuario
      const shuffledProjects = [...generatedProjects].sort(() => 0.5 - Math.random());
      const projectsToView = shuffledProjects.slice(0, numViews);
      
      for (const proj of projectsToView) {
        try {
          await recommendationsService.recordInteraction(u.id, proj.id, InteractionType.VIEW);
          interactionCount++;
          
          if (Math.random() > 0.6) {
             await recommendationsService.recordInteraction(u.id, proj.id, InteractionType.LIKE);
             interactionCount++;
             logger.log(`Interacción: ${u.firstName} vio y le gustó "${proj.title}"`);
          } else {
             logger.log(`Interacción: ${u.firstName} vio "${proj.title}"`);
          }
        } catch(e: any) {
          logger.error(`Error inyectando interacción para ${u.firstName} en "${proj.title}": ${e.message}`);
        }
      }
    }
    
    logger.log(`Se han inyectado un total de ${interactionCount} interacciones (Views y Likes) hiperrealistas.`);
    // --- FIN INYECCIÓN MÓDULO RECOMENDACIONES ---

    // --- INICIO INYECCIÓN MÓDULO NOTIFICACIONES ---
    const notificationRepository = dataSource.getRepository('Notification');
    logger.log('Generando notificaciones hiperrealistas y de sistema en la bandeja de entrada...');
    
    let notifCount = 0;
    
    const systemMessages = [
      '¡Bienvenido a ImpulsaTec! Completa tu perfil para empezar a interactuar con la comunidad.',
      'Recuerda verificar tu identidad (KYC) en la pestaña de Seguridad para poder retirar o invertir fondos sin límites.',
      'Tenemos nuevos proyectos de Tecnología Sostenible y Energías Renovables que encajan perfectamente con tus intereses.'
    ];

    for (const u of generatedUsers) {
      if (u.role === UserRole.ADMIN) continue;

      try {
        // 1. Notificación de bienvenida obligatoria
        await notificationRepository.save(
          notificationRepository.create({
            user: { id: u.id },
            type: 'system_welcome',
            message: `¡Hola ${u.firstName}! ${systemMessages[0]}`,
            isRead: false
          })
        );
        notifCount++;

        // 2. Notificación aleatoria sobre KYC o Sugerencias
        if (Math.random() > 0.5) {
          const isKyc = Math.random() > 0.5;
          await notificationRepository.save(
            notificationRepository.create({
              user: { id: u.id },
              type: isKyc ? 'kyc_reminder' : 'system_suggestion',
              message: systemMessages[isKyc ? 1 : 2],
              isRead: false
            })
          );
          notifCount++;
        }

        // 3. Si es creador, simular una alerta de hito alcanzado
        if (u.role === UserRole.CREATOR && Math.random() > 0.6) {
           await notificationRepository.save(
            notificationRepository.create({
              user: { id: u.id },
              type: 'milestone_reached',
              message: `¡Excelentes noticias, ${u.firstName}! Tu proyecto está ganando tracción y ha superado un nuevo hito de visitas hoy.`,
              isRead: false
            })
          );
          notifCount++;
        }
      } catch (e: any) {
        logger.error(`Error generando notificaciones de bandeja para ${u.firstName}: ${e.message}`);
      }
    }
    
    logger.log(`Se han inyectado un total de ${notifCount} notificaciones hiperrealistas en el sistema.`);
    // --- FIN INYECCIÓN MÓDULO NOTIFICACIONES ---

  } catch (error) {
    logger.error('Error durante la ejecución del seeder', error);
  }

  // Cerramos la conexión de BD y el contexto de la app
  await app.close();
  logger.log('Seeder finalizado con éxito.');
}

bootstrap();
