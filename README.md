# Collectibles Hub

Eine moderne Web-App für **Trading Cards, Gaming und Elektronik**. Kostenloses Open-Source-Hobbyprojekt.

## Stand: v0.1 – UI-Prototyp

Responsive Dark-Mode-Oberfläche mit Dashboard, Kategorienavigation, Suchfeld, leeren Portfoliokennzahlen und Diagramm-Platzhalter. **Noch keine echte Datenspeicherung, Anmeldung, Objekterfassung, KI-Erkennung oder Preisermittlung.**

## Lokal starten

Node.js 20+ erforderlich:

```bash
npm install
npm run dev
```

Produktionsbuild mit `npm run build`.

## Cloudflare Pages

- Framework: Vite
- Build-Befehl: `npm run build`
- Ausgabeordner: `dist`

## Supabase

Die Datei `src/lib/supabase.ts` bereitet den Client vor. Lege lokal eine `.env.local` anhand `.env.example` an und nutze nur die **öffentliche** Supabase-URL und den **Publishable-/Anon-Key**. Niemals Service-Role-Schlüssel in `VITE_...` speichern. Die Datenbank ist noch nicht eingebunden. Vor produktiver Nutzung wird Row Level Security für alle privaten Tabellen implementiert.

## Roadmap

1. Login und getrennte Portfolios mit Supabase Auth und RLS.
2. Sammlungsobjekte hinzufügen, bearbeiten und löschen.
3. Foto-Upload und Gemini-Erkennung über eine geschützte Serverfunktion.
4. Externe Preisquellen, manuelle Korrekturen und historisierte Werte.
5. Optionaler, ausdrücklich freigegebener Portfoliovergleich.

Siehe [LICENSE](LICENSE).
