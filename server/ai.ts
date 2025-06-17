import Anthropic from '@anthropic-ai/sdk';
import type { Profile } from '@shared/schema';
import type { TextBlock } from '@anthropic-ai/sdk/resources/messages';

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface CompatibilityScore {
  score: number; // 0-100
  explanation: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  resources?: Array<{
    title: string;
    description: string;
    url?: string;
  }>;
}

export interface ModerationResult {
  isAppropriate: boolean;
  reasons?: string[];
  severity: 'low' | 'medium' | 'high';
  suggestions?: string[];
}

// Système de matching intelligent
export async function calculateCompatibility(
  userProfile: Profile,
  targetProfile: Profile
): Promise<CompatibilityScore> {
  try {
    const prompt = `Tu es un expert en relations alternatives, tantra et polyamorie. Analyse la compatibilité entre ces deux profils et donne un score de compatibilité de 0 à 100.

Profil 1:
- Âge: ${userProfile.birthDate ? new Date().getFullYear() - new Date(userProfile.birthDate).getFullYear() : 'Non spécifié'}
- Localisation: ${userProfile.location || 'Non spécifiée'}
- Pratiques: ${userProfile.practices?.join(', ') || 'Non spécifiées'}
- Valeurs: ${userProfile.values?.join(', ') || 'Non spécifiées'}
- Intentions: ${userProfile.intentions?.join(', ') || 'Non spécifiées'}
- Bio: ${userProfile.bio || 'Pas de bio'}

Profil 2:  
- Âge: ${targetProfile.birthDate ? new Date().getFullYear() - new Date(targetProfile.birthDate).getFullYear() : 'Non spécifié'}
- Localisation: ${targetProfile.location || 'Non spécifiée'}
- Pratiques: ${targetProfile.practices?.join(', ') || 'Non spécifiées'}
- Valeurs: ${targetProfile.values?.join(', ') || 'Non spécifiées'}
- Intentions: ${targetProfile.intentions?.join(', ') || 'Non spécifiées'}
- Bio: ${targetProfile.bio || 'Pas de bio'}

Réponds UNIQUEMENT en JSON avec cette structure exacte:
{
  "score": nombre_entre_0_et_100,
  "explanation": "explication_courte_du_score",
  "strengths": ["point_fort_1", "point_fort_2", "point_fort_3"],
  "challenges": ["défi_potentiel_1", "défi_potentiel_2"],
  "recommendations": ["conseil_1", "conseil_2", "conseil_3"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0] as TextBlock;
    const result = JSON.parse(content.text);
    return {
      score: Math.max(0, Math.min(100, result.score)),
      explanation: result.explanation,
      strengths: result.strengths || [],
      challenges: result.challenges || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('Erreur calcul compatibilité:', error);
    return {
      score: 50,
      explanation: "Impossible de calculer la compatibilité pour le moment",
      strengths: [],
      challenges: [],
      recommendations: []
    };
  }
}

// Assistant éducatif spécialisé
export async function getEducationalResponse(
  question: string,
  userContext?: { experience?: string; interests?: string[] }
): Promise<ChatResponse> {
  try {
    const contextInfo = userContext ? 
      `Contexte utilisateur - Expérience: ${userContext.experience || 'débutant'}, Intérêts: ${userContext.interests?.join(', ') || 'général'}` : 
      'Pas de contexte spécifique';

    const prompt = `Tu es Fluide Assistant, un expert bienveillant en tantra, polyamorie, et relations alternatives. Réponds à cette question avec empathie et expertise.

${contextInfo}

Question: ${question}

Fournis une réponse complète, éducative et respectueuse. Inclus des conseils pratiques si approprié.

Réponds en JSON avec cette structure:
{
  "message": "ta_réponse_principale",
  "suggestions": ["suggestion_1", "suggestion_2", "suggestion_3"],
  "resources": [
    {
      "title": "Titre de la ressource",
      "description": "Description courte",
      "url": "optionnel"
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const educationalContent = response.content[0] as TextBlock;
    const result = JSON.parse(educationalContent.text);
    return {
      message: result.message,
      suggestions: result.suggestions || [],
      resources: result.resources || []
    };
  } catch (error) {
    console.error('Erreur assistant éducatif:', error);
    return {
      message: "Je rencontre des difficultés techniques. Pouvez-vous reformuler votre question ?",
      suggestions: ["Essayez de poser une question plus spécifique", "Consultez nos ressources éducatives"],
      resources: []
    };
  }
}

// Modération automatique
export async function moderateContent(
  content: string,
  type: 'profile' | 'message' | 'event' | 'resource'
): Promise<ModerationResult> {
  try {
    const prompt = `Tu es un modérateur expert pour une plateforme de rencontres alternatives axée sur le tantra et la polyamorie. Analyse ce contenu pour détecter:

- Harcèlement ou langage abusif
- Contenu inapproprié ou explicite non consensuel  
- Spam ou contenu commercial non autorisé
- Informations personnelles sensibles
- Langage discriminatoire

Type de contenu: ${type}
Contenu à analyser: "${content}"

Cette plateforme accepte les discussions ouvertes sur la sexualité et les relations alternatives dans un cadre respectueux et consensuel.

Réponds en JSON:
{
  "isAppropriate": true/false,
  "reasons": ["raison_si_inapproprié"],
  "severity": "low/medium/high",
  "suggestions": ["suggestion_d_amélioration"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const moderationContent = response.content[0] as TextBlock;
    const result = JSON.parse(moderationContent.text);
    return {
      isAppropriate: result.isAppropriate !== false,
      reasons: result.reasons || [],
      severity: result.severity || 'low',
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error('Erreur modération:', error);
    return {
      isAppropriate: true,
      reasons: [],
      severity: 'low',
      suggestions: []
    };
  }
}

// Suggestions de conversation
export async function generateConversationStarters(
  userProfile: Profile,
  targetProfile: Profile
): Promise<string[]> {
  try {
    const prompt = `Génère 3-5 suggestions de conversation respectueuses et engageantes pour initier un dialogue entre ces deux profils sur une plateforme de rencontres alternatives.

Profil utilisateur:
- Pratiques: ${userProfile.practices?.join(', ') || 'Non spécifiées'}
- Valeurs: ${userProfile.values?.join(', ') || 'Non spécifiées'}
- Intentions: ${userProfile.intentions?.join(', ') || 'Non spécifiées'}

Profil cible:
- Pratiques: ${targetProfile.practices?.join(', ') || 'Non spécifiées'}
- Valeurs: ${targetProfile.values?.join(', ') || 'Non spécifiées'}
- Intentions: ${targetProfile.intentions?.join(', ') || 'Non spécifiées'}

Les suggestions doivent être:
- Respectueuses et bienveillantes
- Basées sur les intérêts communs
- Adaptées au contexte des relations alternatives
- Ouvertes et non intrusives

Réponds avec un array JSON de strings: ["suggestion1", "suggestion2", "suggestion3"]`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0] as TextBlock;
    const suggestions = JSON.parse(content.text);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error('Erreur suggestions conversation:', error);
    return [
      "Bonjour ! J'ai remarqué que vous partagez des valeurs similaires aux miennes. J'aimerais en savoir plus sur votre parcours.",
      "Votre profil m'intrigue beaucoup. Quelles sont vos expériences favorites dans votre pratique ?",
      "Bonjour ! Nous semblons avoir des intentions compatibles. Seriez-vous intéressé(e) par un échange ?"
    ];
  }
}

// Recommandations personnalisées d'événements
export async function getEventRecommendations(
  userProfile: Profile,
  availableEvents: Array<{ title: string; description: string; category: string }>
): Promise<Array<{ eventTitle: string; reason: string; score: number }>> {
  try {
    const prompt = `Analyse ce profil utilisateur et recommande les événements les plus pertinents parmi ceux disponibles.

Profil utilisateur:
- Pratiques: ${userProfile.practices?.join(', ') || 'Non spécifiées'}
- Valeurs: ${userProfile.values?.join(', ') || 'Non spécifiées'}
- Intentions: ${userProfile.intentions?.join(', ') || 'Non spécifiées'}

Événements disponibles:
${availableEvents.map(event => `- ${event.title}: ${event.description} (Catégorie: ${event.category})`).join('\n')}

Pour chaque événement pertinent, donne un score de 0-100 et une explication.

Réponds en JSON:
[
  {
    "eventTitle": "titre_exact_de_l_événement",
    "reason": "pourquoi_cet_événement_est_recommandé",
    "score": score_0_à_100
  }
]`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0] as TextBlock;
    const recommendations = JSON.parse(content.text);
    return Array.isArray(recommendations) ? recommendations : [];
  } catch (error) {
    console.error('Erreur recommandations événements:', error);
    return [];
  }
}