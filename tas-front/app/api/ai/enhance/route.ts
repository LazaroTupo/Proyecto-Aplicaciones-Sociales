import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client pointing to OpenRouter
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'http://213.210.20.7:3002', // Required for OpenRouter rankings
    'X-Title': 'ImpulsaTec Crowdfunding Platform', // Required for OpenRouter rankings
  },
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API Key not configured' },
        { status: 500 }
      );
    }

    const response = await openai.chat.completions.create({
      // Usamos GPT-4o-mini como default por ser altamente confiable y rápido en OpenRouter
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres un experto en marketing y redacción publicitaria especializado en campañas de crowdfunding (micromecenazgo).
Tu objetivo es tomar la descripción inicial del proyecto escrita por el usuario y mejorarla significativamente para hacerla más persuasiva, emocionante, profesional y estructurada.

Instrucciones:
1. Mejora la narrativa para conectar emocionalmente con los potenciales inversores o donantes.
2. Corrige cualquier error ortográfico o gramatical.
3. Añade estructura usando párrafos cortos para facilitar la lectura.
4. Mantén el tono optimista e inspirador, enfocado en el impacto y los beneficios.
5. NO añadas comentarios adicionales ni presentaciones tuyas (como "Aquí tienes la versión mejorada:").
6. Tu respuesta DEBE contener ÚNICAMENTE el texto mejorado del proyecto listo para ser copiado.`,
        },
        {
          role: 'user',
          content: `Mejora esta descripción de mi proyecto de crowdfunding:\n\n${text}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const enhancedText = response.choices[0]?.message?.content?.trim();

    if (!enhancedText) {
      throw new Error('No content returned from AI');
    }

    return NextResponse.json({ enhancedText });
  } catch (error: any) {
    console.error('Error enhancing text with AI:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
