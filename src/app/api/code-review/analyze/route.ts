import { NextResponse } from 'next/server';

const API_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const HEADERS = {
  'customerId': 'cus_SGPn4uhjPI0F4w',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
};

export async function POST(request: Request) {
  try {
    const { code, specifications, language } = await request.json();

    if (!code?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Code is required' 
      });
    }

    const systemPrompt = language === 'fr' 
      ? `Vous êtes un expert en révision de code. Analysez le code fourni et fournissez:

1. AMÉLIORATIONS - Liste des améliorations recommandées avec:
   - Catégorie (ex: Performance, Sécurité, Lisibilité, Architecture)
   - Sévérité (critical, high, medium, low)
   - Description du problème
   - Suggestion d'amélioration
   - Exemple de code si pertinent

2. QUESTIONS D'AIDE - Questions qu'une personne externe peut poser pour comprendre le code sans le lire:
   - Question claire
   - Objectif de la question
   - Catégorie (Architecture, Fonctionnalité, etc.)

3. RÉSUMÉ - Analyse globale du code
4. SCORE - Note globale sur 10 pour la qualité du code

${specifications ? `Utilisez ces spécifications/normes pour l'évaluation: ${specifications}` : ''}

Répondez UNIQUEMENT en JSON valide:
{
  "improvements": [
    {
      "category": "Catégorie",
      "severity": "critical|high|medium|low",
      "description": "Description du problème",
      "suggestion": "Suggestion d'amélioration",
      "codeExample": "Exemple de code (optionnel)"
    }
  ],
  "helperQuestions": [
    {
      "question": "Question d'aide",
      "purpose": "Objectif de la question",
      "category": "Catégorie"
    }
  ],
  "overallScore": 7.5,
  "summary": "Résumé de l'analyse"
}`
      : `You are a code review expert. Analyze the provided code and provide:

1. IMPROVEMENTS - List of recommended improvements with:
   - Category (e.g., Performance, Security, Readability, Architecture)
   - Severity (critical, high, medium, low)
   - Problem description
   - Improvement suggestion
   - Code example if relevant

2. HELPER QUESTIONS - Questions an external person can ask to understand the code without reading it:
   - Clear question
   - Purpose of the question
   - Category (Architecture, Functionality, etc.)

3. SUMMARY - Overall code analysis
4. SCORE - Overall score out of 10 for code quality

${specifications ? `Use these specifications/norms for evaluation: ${specifications}` : ''}

Respond ONLY in valid JSON:
{
  "improvements": [
    {
      "category": "Category",
      "severity": "critical|high|medium|low", 
      "description": "Problem description",
      "suggestion": "Improvement suggestion",
      "codeExample": "Code example (optional)"
    }
  ],
  "helperQuestions": [
    {
      "question": "Helper question",
      "purpose": "Purpose of the question",
      "category": "Category"
    }
  ],
  "overallScore": 7.5,
  "summary": "Analysis summary"
}`;

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
            content: `Analyze this code and provide improvement suggestions:\n\n${code}`
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

    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    // Validate required fields
    if (!parsedResult || typeof parsedResult.overallScore !== 'number') {
      throw new Error('Invalid result format received from AI');
    }

    // Ensure arrays exist
    parsedResult.improvements = parsedResult.improvements || [];
    parsedResult.helperQuestions = parsedResult.helperQuestions || [];
    parsedResult.summary = parsedResult.summary || 'No summary provided';

    return NextResponse.json({
      success: true,
      result: parsedResult
    });

  } catch (error) {
    console.error('Error analyzing code:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}