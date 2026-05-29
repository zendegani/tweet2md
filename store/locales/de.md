tweet2md ist eine Open-Source-Chrome-Erweiterung, die Inhalte von x.com in produktionsreifes Markdown für Recherche, Notizen, KI-Workflows und Offline-Archivierung umwandelt.

Was ist neu?

Die neuesten Updates und Releases:
https://github.com/zendegani/tweet2md/blob/main/CHANGELOG.md

Hauptfunktionen:

- Drei Möglichkeiten zum Auslösen: Toolbar-Popup, Inline-Download-Button bei jedem Tweet oder Rechtsklick-Kontextmenü (Als Markdown speichern / kopieren / Zu Obsidian hinzufügen)
- Markdown in die Zwischenablage kopieren, als Datei herunterladen oder an Obsidian übergeben
- Ein-Klick-Button „Zu Obsidian hinzufügen": öffnet Obsidian über das obsidian://-URI-Schema mit vorausgefülltem Markdown; optionaler Vault-Name
- Optionaler Vault-Unterordner für die Obsidian-Übergabe: Notizen werden in einem bestimmten Ordner abgelegt (z. B. Tweets oder Inbox/Tweets) — leer lassen für das Vault-Stammverzeichnis
- Obsidian-freundliches Frontmatter (optional): wikiverlinkter [[@handle]]-Autor, generierter Titel, getrennte Veröffentlichungs- und Erstellungsdaten, Beschreibungsauszug und Tags-Array sowie bestehende Engagement-Metadaten für Dataview-Abfragen
- Erfasst Linkkarten aus Tweets: Titel, Quelldomain und Open-Graph-Vorschaubild
- Vollständige Unterstützung für lange X-Artikel (ehemals Notes) mit Überschriften, Listen und Codeblöcken
- Extrahiert Tweets, verschachtelte Threads und zitierte Tweets in sauberes Markdown
- Exportiert nur einen einzelnen Tweet ohne Thread — über das Kontextmenü oder Umschalt-/Alt-Klick auf den Inline-Button
- Bewahrt Struktur und Kontext zitierter Beiträge einschließlich Name und Handle des ursprünglichen Autors
- Mehransichts-Popup mit fokussierten Hauptaktionen und Einstellungen hinter einem Zahnrad-Symbol
- Inline-Button kann bei Konflikten mit anderen Erweiterungen ein- oder ausgeblendet werden
- Inline-Button kann so konfiguriert werden, dass Markdown kopiert statt heruntergeladen wird
- Optionales automatisches Schließen neuer Tabs nach dem Export
- Lädt eingebettete X-Medien lokal zusammen mit der md-Datei herunter, um Linkverlust zu vermeiden
- Optionaler Downloads-Unterordner: Markdown-Dateien und Bilder landen in einem ausgewählten Unterordner statt direkt im Downloads-Verzeichnis
- Anpassbare Dateinamen-Vorlage: Stelle den exportierten Dateinamen aus Platzhaltern wie {date}, {datetime}, {handle}, {author}, {id}, {slug} und {type} zusammen, mit Live-Vorschau in den Einstellungen — leer lassen für den Standard
- Umfangreiches YAML-Frontmatter mit Autor, Handle, Datum, Quell-URL, Inhaltstyp und Engagement-Statistiken
- Optionale X-ähnliche Engagement-Zeile direkt im Markdown-Text
- Erweitert automatisch gekürzte Beiträge und entfernt Engagement-Buttons, Follow-Hinweise und Tracker
- Mehrsprachige Oberfläche: Englisch, Spanisch, Deutsch, Französisch, Japanisch, Portugiesisch (Brasilien), vereinfachtes Chinesisch, Arabisch und Persisch
- Hell- und Dunkelmodus passend zu den Systemeinstellungen

Ideal für:

- Importieren von X-Inhalten in Obsidian, Notion, Logseq, Hugo oder andere Markdown-basierte PKM-Systeme
- Export sauberer Texte für LLM-Prompts, RAG-Pipelines oder KI-Trainingsworkflows
- Offline-Archivierung von Recherche-Threads, Nachrichtenreferenzen und langen Artikeln
- Aufbau eines durchsuchbaren Second Brain aus Twitter/X-Aktivitäten
- Vorbereitung von Quellenmaterial für Schreiben, Übersetzung oder Zusammenfassungen

Warum verwenden?

- Ein-Klick-Workflow für Tweets, Threads und Artikel
- Erstklassige Obsidian-Integration ohne Plugins oder Synchronisation
- Saubere, gut strukturierte Markdown-Ausgabe
- Lokale Bildarchivierung gegen defekte Links
- Keine API erforderlich — funktioniert direkt im Browser
- Alles wird lokal verarbeitet. Keine Analysen, kein Tracking, keine Datenübertragung.

Aktuelle Einschränkungen:

- Fokus auf die Extraktion von x.com-Inhalten
- Videos und GIFs werden nicht als abspielbare Mediendateien exportiert
- Nach Installation oder Update der Erweiterung ist ein Neuladen der Seite erforderlich
- Einige Inhalte funktionieren möglicherweise nicht mehr, wenn x.com seine Seitenstruktur stark verändert

Dies ist ein Open-Source-Projekt.
tweet2md ist ein unabhängiges Tool und nicht mit X oder x.com verbunden.
