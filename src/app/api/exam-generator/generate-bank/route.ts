import { NextResponse } from 'next/server';

const API_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const HEADERS = {
  'customerId': 'cus_SGPn4uhjPI0F4w',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
};

export async function POST(request: Request) {
  try {
    const { latexContent, language } = await request.json();

    if (!latexContent?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'LaTeX content is required' 
      });
    }

    const systemPrompt = language === 'fr' 
      ? `Vous êtes un expert en création d'examens. Analysez le contenu LaTeX du sujet fourni et générez une banque de questions QCM complète.

Créez des questions basées sur les compétences que l'on doit acquérir en validant ce projet. Générez au minimum 20 questions variées:

- Niveaux de difficulté: easy (30%), medium (50%), hard (20%)
- 4 options de réponse par question (A, B, C, D)
- Une seule réponse correcte par question
- Questions couvrant différentes compétences du projet
- Questions en français

Répondez UNIQUEMENT en JSON valide:
{
  "subject": "Titre du sujet extrait",
  "questions": [
    {
      "id": "q1",
      "question": "Question ici",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "competency": "Compétence testée",
      "difficulty": "easy|medium|hard"
    }
  ],
  "totalQuestions": 20
}

Température: 0.5 pour des questions cohérentes.`
      : `You are an exam creation expert. Analyze the provided LaTeX subject content and generate a comprehensive QCM question bank.

Create questions based on competencies that should be acquired by validating this project. Generate at least 20 varied questions:

- Difficulty levels: easy (30%), medium (50%), hard (20%)
- 4 answer options per question (A, B, C, D)  
- One correct answer per question
- Questions covering different project competencies
- Questions in English

Respond ONLY in valid JSON:
{
  "subject": "Extracted subject title",
  "questions": [
    {
      "id": "q1", 
      "question": "Question here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "competency": "Competency being tested", 
      "difficulty": "easy|medium|hard"
    }
  ],
  "totalQuestions": 20
}

Temperature: 0.5 for consistent questions.`;

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
            content: `Generate a QCM question bank from this LaTeX content:\n\n${latexContent}`
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

    let parsedBank;
    try {
      parsedBank = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedBank = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    if (!parsedBank?.questions || !Array.isArray(parsedBank.questions)) {
      throw new Error('Invalid question bank format received from AI');
    }

    // Validate questions format
    const validQuestions = parsedBank.questions.filter((q: any) => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length >= 4 &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 &&
      q.correctAnswer < q.options.length
    );

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated');
    }

    const questionBank = {
      subject: parsedBank.subject || 'Generated Exam',
      questions: validQuestions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q${index + 1}`
      })),
      totalQuestions: validQuestions.length
    };

    return NextResponse.json({
      success: true,
      questionBank
    });

  } catch (error) {
    console.error('Error generating question bank:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}