export async function setupCustomlocalize(hass) {
  const translations = {};
  const lang = hass.locale.language || 'en';

  const languagesToLoad = new Set([lang, 'en']); // Siempre cargar inglés como fallback

  for (const language of languagesToLoad) {
    try {
      // Ajusta esta ruta para que coincida con la ubicación de tu tarjeta
      const response = await fetch(`/local/community/horizontal-timeline-card/translations/${language}.json`);
      if (response.ok) {
        translations[language] = await response.json();
      } else {
        throw new Error(`Failed to load ${language}.json`);
      }
    } catch (e) {
      console.error(`HORIZONTAL-TIMELINE-CARD: Could not load translation file: ${language}.json`, e);
    }
  }

  return function(key) {
    const keyParts = key.split('.');
    let translation = translations[lang] || translations['en'];
    
    for (const part of keyParts) {
      if (translation && typeof translation === 'object' && part in translation) {
        translation = translation[part];
      } else {
        // Si no se encuentra, buscar en inglés
        translation = translations['en'];
        for (const enPart of keyParts) {
           if (translation && typeof translation === 'object' && enPart in translation) {
             translation = translation[enPart];
           } else {
             return key; // Devolver la clave si no se encuentra nada
           }
        }
        break;
      }
    }
    return typeof translation === 'string' ? translation : key;
  };
}
