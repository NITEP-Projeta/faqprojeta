'use client';

import { useEffect } from 'react';

const ChatwootWidget = () => {
  useEffect(() => {
    // Configurações extraídas da sua imagem
    const WEBSITE_TOKEN = 'QZE8T7cqYSoWbyG19CpDVApz';
    const BASE_URL = 'https://freewill-kizzy-regardant.ngrok-free.dev';

    // Função para carregar o script do Chatwoot
    (function(d, t) {
      var g = d.createElement(t) as HTMLScriptElement;
      var s = d.getElementsByTagName(t)[0];
      g.src = BASE_URL + "/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      s.parentNode?.insertBefore(g, s);

      g.onload = function() {
        // @ts-ignore
        window.chatwootSDK.run({
          websiteToken: WEBSITE_TOKEN,
          baseUrl: BASE_URL
        });
      };
    })(document, "script");
  }, []);

  return null;
};

export default ChatwootWidget;