import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `
Eres el asistente virtual oficial de "ImpulsaTec", una plataforma de Crowdfunding enfocada en proyectos universitarios y tecnológicos.
Tu tono debe ser amigable, pero directo y claro. No des rodeos. 
Si debes explicar un proceso, hazlo paso a paso.

Conocimiento clave sobre la plataforma ImpulsaTec:
1. CREAR UN PROYECTO:
   - El usuario debe tener el rol de Creador (CREATOR).
   - Debe ir a su "Dashboard" (Panel de Control) o a la opción "Crear Proyecto".
   - Se llena un formulario que incluye: Título, Meta (Target Amount), Duración (en días), Nivel TRL (Madurez Tecnológica), Categoría y si tiene Video (Pitch).
   - Nuestra Inteligencia Artificial evaluará automáticamente el proyecto y predecirá sus probabilidades de éxito.

2. DONAR / INVERTIR EN UN PROYECTO (BACKER):
   - El usuario puede navegar por el feed o buscar proyectos en la sección "Proyectos".
   - Para donar, se hace clic en "Contribuir" o "Invertir" en los Tiers (Niveles de recompensa) del proyecto.
   - El pago se procesa mediante PayPal.

3. USO GENERAL:
   - Los usuarios tienen un Perfil donde pueden ver sus donaciones y proyectos.
   - La plataforma utiliza notificaciones en tiempo real para avisar sobre nuevas donaciones y actualizaciones.
   - Existe una pestaña de IA predictiva donde los creadores pueden simular sus probabilidades de éxito antes de publicar.

Responde de forma concisa y estructurada. Usa viñetas o listas numeradas cuando corresponda.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini', // Same model used for enhancement
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return NextResponse.json({
      message: response.choices[0].message.content,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Error connecting to the AI assistant' },
      { status: 500 }
    );
  }
}
