import { NextResponse } from 'next/server';

const API_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const HEADERS = {
  'customerId': 'cus_SGPn4uhjPI0F4w',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
};

export async function POST(request: Request) {
  try {
    const { code, questions, language } = await request.json();

    if (!code?.trim() || !questions?.length) {
      return NextResponse.json({ 
        success: false, 
        error: 'Code and questions are required' 
      });
    }

    const systemPrompt = language === 'fr' 
      ? `Vous êtes un expert en évaluation de code. Évaluez les réponses de l'étudiant aux questions sur le code fourni.

Pour chaque réponse, donnez:
- Un score sur 10 (précis, pas seulement des nombres entiers)
- Un commentaire détaillé expliquant le score
- Des suggestions d'amélioration si nécessaire

Gardez le contexte du code original lors de l'évaluation. Soyez juste mais constructif.

Répondez UNIQUEMENT en JSON valide avec cette structure:
{
  "results": [
    {
      "question": "Question originale",
      "studentAnswer": "Réponse de l'étudiant",
      "score": 7.5,
      "feedback": "Commentaire détaillé sur la réponse"
    }
  ]
}

Température: 0.5 pour des évaluations cohérentes.`
      : `You are a code evaluation expert. Evaluate the student's answers to questions about the provided code.

For each answer, provide:
- A score out of 10 (precise, not just whole numbers)
- Detailed feedback explaining the score  
- Improvement suggestions if needed

Keep the context of the original code when evaluating. Be fair but constructive.

Respond ONLY in valid JSON with this structure:
{
  "results": [
    {
      "question": "Original question",
      "studentAnswer": "Student's answer", 
      "score": 7.5,
      "feedback": "Detailed feedback on the answer"
    }
  ]
}

Temperature: 0.5 for consistent evaluations.`;

    const questionsText = questions.map((q: any) => 
      `Q: ${q.question}\nStudent Answer: ${q.studentAnswer || 'No answer provided'}\nExpected: ${q.expectedAnswer || 'See context'}`
    ).join('\n\n');

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
            content: `Original Code:\n${code}\n\nEvaluate these answers:\n\n${questionsText}`
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

    let parsedResults;
    try {
      parsedResults = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResults = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    if (!parsedResults?.results || !Array.isArray(parsedResults.results)) {
      throw new Error('Invalid results format received from AI');
    }

    return NextResponse.json({
      success: true,
      results: parsedResults.results
    });

  } catch (error) {
    console.error('Error evaluating answers:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}