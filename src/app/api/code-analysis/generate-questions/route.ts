import { NextResponse } from 'next/server';

const API_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const HEADERS = {
  'customerId': 'cus_SGPn4uhjPI0F4w',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
};



export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();

    if (!code?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Code is required' 
      });
    }

    const systemPrompt = language === 'fr' 
      ? `Vous êtes un expert en évaluation de code. Analysez le code fourni et générez exactement 10 questions d'évaluation pour tester la compréhension de l'étudiant. 

Générez des questions de différents niveaux de difficulté (easy, medium, hard) qui couvrent:
- Compréhension de la logique du code
- Concepts de programmation utilisés
- Problèmes potentiels ou améliorations
- Fonctionnalités et cas d'usage

Répondez UNIQUEMENT en JSON valide avec cette structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question ici",
      "difficulty": "easy|medium|hard",
      "expectedAnswer": "Réponse attendue détaillée"
    }
  ]
}

Température: 0.5 pour limiter les hallucinations.`
      : `You are a code evaluation expert. Analyze the provided code and generate exactly 10 evaluation questions to test student understanding.

Generate questions of different difficulty levels (easy, medium, hard) that cover:
- Understanding of code logic
- Programming concepts used
- Potential issues or improvements
- Features and use cases

Respond ONLY in valid JSON with this structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question here",
      "difficulty": "easy|medium|hard",
      "expectedAnswer": "Detailed expected answer"
    }
  ]
}

Temperature: 0.5 to limit hallucinations.`;

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        model: 'openrouter/anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Analyze this code and generate 10 evaluation questions:\n\n${code}`
          }
        ],
        temperature: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    if (!parsedQuestions?.questions || !Array.isArray(parsedQuestions.questions)) {
      throw new Error('Invalid questions format received from AI');
    }

    return NextResponse.json({
      success: true,
      questions: parsedQuestions.questions
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}