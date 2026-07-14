const TRANSLATIONS: Record<string, Record<string, string>> = {
  spanish: {
    "Welcome to StandWay": "Bienvenido a StandWay",
    "Go to Gate C": "Vaya a la Puerta C",
    "Queue is long at Gate B": "La fila es larga en la Puerta B",
    "Step-free path is active": "La ruta sin escalones está activa",
    "Metro is delayed": "El metro está retrasado",
    "Skip the queue, use the accessible lift": "Evite la fila, use el ascensor accesible",
    "Here's a Spanish-speaking volunteer": "Aquí hay un voluntario que habla español"
  },
  french: {
    "Welcome to StandWay": "Bienvenue sur StandWay",
    "Go to Gate C": "Allez à la porte C",
    "Queue is long at Gate B": "La file d'attente est longue à la porte B",
    "Step-free path is active": "Le chemin sans marche est actif",
    "Metro is delayed": "Le métro est retardé",
    "Skip the queue, use the accessible lift": "Évitez la file d'attente, utilisez l'ascenseur accessible"
  },
  hindi: {
    "Welcome to StandWay": "StandWay में आपका स्वागत है",
    "Go to Gate C": "गेट सी पर जाएं",
    "Queue is long at Gate B": "गेट बी पर लंबी कतार है",
    "Step-free path is active": "सीढ़ी-मुक्त मार्ग सक्रिय है",
    "Metro is delayed": "मेट्रो में देरी है",
    "Skip the queue, use the accessible lift": "कतार छोड़ें, सुलभ लिफ्ट का उपयोग करें"
  },
  marathi: {
    "Welcome to StandWay": "StandWay वर आपले स्वागत आहे",
    "Go to Gate C": "गेट सी वर जा",
    "Queue is long at Gate B": "गेट बी वर मोठी रांग आहे",
    "Step-free path is active": "पायऱ्या नसलेला मार्ग उपलब्ध आहे",
    "Metro is delayed": "मेट्रो उशिराने धावत आहे",
    "Skip the queue, use the accessible lift": "रांग टाळा, सुलभ लिफ्ट वापरा"
  }
};

export interface LanguageAgentOutput {
  language: string;
  isTranslated: boolean;
  translatedText: string;
  recommendation: string;
  reasoning: string;
}

export function runLanguageAgent(text: string, targetLanguage: string): LanguageAgentOutput {
  const lang = targetLanguage.toLowerCase().trim();
  
  if (lang === 'english' || lang === 'en') {
    return {
      language: 'English',
      isTranslated: false,
      translatedText: text,
      recommendation: 'Output kept in English.',
      reasoning: 'Target language is English. No translation needed.'
    };
  }

  // Look up in dictionary
  const dict = TRANSLATIONS[lang];
  let translatedText = text;
  let isTranslated = false;

  if (dict) {
    // Attempt exact match or replace known fragments
    let tempText = text;
    Object.entries(dict).forEach(([eng, trans]) => {
      const regex = new RegExp(eng, 'gi');
      if (regex.test(tempText)) {
        tempText = tempText.replace(regex, trans);
        isTranslated = true;
      }
    });
    translatedText = tempText;
  }

  // If we couldn't translate dictionary-wise, note that the Orchestrator will use Groq
  const reasoning = isTranslated 
    ? `Translated terms into ${targetLanguage} using cached local dictionaries.`
    : `Dictionary miss. Delegating full translation to Groq LLM agent for language: ${targetLanguage}.`;

  return {
    language: targetLanguage,
    isTranslated,
    translatedText,
    recommendation: isTranslated ? 'Use cached translation.' : 'Requires Groq translation.',
    reasoning
  };
}
