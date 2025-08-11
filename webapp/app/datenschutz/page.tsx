import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | VYSN Hub',
  description: 'Datenschutzerklärung für die VYSN Hub Mobile App - Transparente Information über die Verarbeitung Ihrer persönlichen Daten.',
  robots: 'index, follow'
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-8 sm:px-8 sm:py-12">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Datenschutzerklärung
              </h1>
              <p className="text-lg text-gray-600">
                VYSN Hub Mobile App
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Stand: {new Date().toLocaleDateString('de-DE', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Verantwortlicher</h2>
                <p className="text-gray-700 mb-4">
                  Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">
                    <strong>VYSN GmbH</strong><br />
                    [Adresse]<br />
                    [PLZ Ort]<br />
                    Deutschland<br />
                    <br />
                    E-Mail: [datenschutz@vysn.de]<br />
                    Telefon: [Telefonnummer]
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Allgemeine Hinweise</h2>
                <p className="text-gray-700 mb-4">
                  Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck der Verarbeitung von 
                  personenbezogenen Daten in der VYSN Hub Mobile App auf. Die Verarbeitung erfolgt ausschließlich 
                  auf Grundlage der gesetzlichen Bestimmungen der DSGVO.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Erfasste Daten und Verarbeitungszwecke</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">3.1 Registrierungs- und Kontodaten</h3>
                <p className="text-gray-700 mb-3">Bei der Registrierung in der App erfassen wir:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700">
                  <li>E-Mail-Adresse (Pflichtfeld)</li>
                  <li>Vor- und Nachname (Pflichtfeld)</li>
                  <li>Passwort (verschlüsselt gespeichert)</li>
                  <li>Firmenname (optional)</li>
                  <li>Telefonnummer (optional)</li>
                  <li>Adressdaten (optional)</li>
                  <li>USt-IdNr. (optional)</li>
                  <li>Sprach- und Währungseinstellungen</li>
                  <li>Marketing- und Newsletter-Einverständnis</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  <strong>Zweck:</strong> Kontoerstellung, Identifikation, Kommunikation, Auftragsabwicklung
                  <br />
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">3.2 Projektdaten</h3>
                <p className="text-gray-700 mb-3">Für Ihre Beleuchtungsprojekte speichern wir:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700">
                  <li>Projektname und -beschreibung</li>
                  <li>Projektstandort und Raumangaben</li>
                  <li>Status und Priorität</li>
                  <li>Termine und Budgetinformationen</li>
                  <li>Hinzugefügte Produkte und Installationsnotizen</li>
                  <li>Projektspezifische Tags und Notizen</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  <strong>Zweck:</strong> Projektmanagement, Produktplanung, Auftragsabwicklung
                  <br />
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">3.3 Bestelldaten</h3>
                <p className="text-gray-700 mb-3">Bei Bestellungen verarbeiten wir:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700">
                  <li>Bestellnummer und -status</li>
                  <li>Bestellte Produkte und Mengen</li>
                  <li>Preise, Rabatte und Gesamtsummen</li>
                  <li>Lieferadresse und Versandmethode</li>
                  <li>Kundennotizen und interne Vermerke</li>
                  <li>Liefertermine und Tracking-Informationen</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  <strong>Zweck:</strong> Auftragsabwicklung, Rechnungsstellung, Lieferung
                  <br />
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">3.4 Warenkorb-Daten</h3>
                <p className="text-gray-700 mb-3">Für die Warenkorbfunktion speichern wir:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700">
                  <li>Ausgewählte Produkte und Mengen</li>
                  <li>Session-IDs für nicht registrierte Nutzer</li>
                  <li>Zeitstempel der Warenkorbaktivitäten</li>
                  <li>Preise zum Zeitpunkt der Hinzufügung</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  <strong>Zweck:</strong> Warenkorbfunktionalität, Kaufabschluss
                  <br />
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen)
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">3.5 Barcode-Scan Daten (anonymisiert)</h3>
                <p className="text-gray-700 mb-3">Beim Scannen von Barcodes erfassen wir anonymisiert:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700">
                  <li>Gescannte Codes (Barcode/QR-Code)</li>
                  <li>Scan-Typ und -Quelle (App/Web)</li>
                  <li>Geräteinformationen (Plattform, Version)</li>
                  <li>Session-ID (ohne Personenbezug)</li>
                  <li>GPS-Koordinaten (nur mit Ihrer Zustimmung)</li>
                  <li>Suchergebnisse und durchgeführte Aktionen</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  <strong>Zweck:</strong> App-Verbesserung, Produktsuche-Optimierung, Analysezwecke
                  <br />
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen)
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">3.6 Event-Registrierungsdaten</h3>
                <p className="text-gray-700 mb-3">Bei Anmeldungen zu Events (Schulungen, Webinare, etc.) erfassen wir:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700">
                  <li>Registrierungsstatus und -datum</li>
                  <li>Zahlungsstatus (falls kostenpflichtig)</li>
                  <li>Besondere Anforderungen (Ernährung, Barrierefreiheit)</li>
                  <li>Teilnahmestatus (anwesend/nicht anwesend)</li>
                  <li>Event-spezifische Notizen</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  <strong>Zweck:</strong> Event-Organisation, Teilnehmermanagement, Kommunikation
                  <br />
                  <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Technische Datenverarbeitung</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 App-Nutzungsdaten</h3>
                <p className="text-gray-700 mb-4">
                  Zur ordnungsgemäßen Funktion der App verarbeiten wir automatisch technische Daten wie:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700">
                  <li>Geräte-ID und Plattforminformationen</li>
                  <li>App-Version und Betriebssystem</li>
                  <li>Login-Zeiten und Session-Daten</li>
                  <li>Fehlermeldungen und Crash-Reports</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 Datenübertragung</h3>
                <p className="text-gray-700 mb-4">
                  Alle Datenübertragungen zwischen der App und unseren Servern erfolgen verschlüsselt über HTTPS. 
                  Ihre Daten werden auf sicheren Servern in Deutschland gespeichert.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Speicherdauer</h2>
                <p className="text-gray-700 mb-4">Wir speichern Ihre Daten nur so lange, wie es erforderlich ist:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700">
                  <li><strong>Kontodaten:</strong> Bis zur Löschung des Accounts</li>
                  <li><strong>Bestelldaten:</strong> 10 Jahre (gesetzliche Aufbewahrungsfristen)</li>
                  <li><strong>Projektdaten:</strong> Bis zur Löschung durch Sie oder des Accounts</li>
                  <li><strong>Warenkorb:</strong> 30 Tage bei Inaktivität</li>
                  <li><strong>Scan-Daten:</strong> 24 Monate (anonymisiert)</li>
                  <li><strong>Event-Daten:</strong> 2 Jahre nach Event-Ende</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Ihre Rechte</h2>
                <p className="text-gray-700 mb-4">Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700">
                  <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Information über verarbeitete Daten</li>
                  <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Korrektur unrichtiger Daten</li>
                  <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Löschung Ihrer Daten</li>
                  <li><strong>Einschränkungsrecht (Art. 18 DSGVO):</strong> Einschränkung der Verarbeitung</li>
                  <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Herausgabe Ihrer Daten in strukturiertem Format</li>
                  <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Widerspruch gegen die Verarbeitung</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter: datenschutz@vysn.de
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Einverständniserklärungen</h2>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">7.1 Marketing-Kommunikation</h3>
                <p className="text-gray-700 mb-4">
                  Die Zustimmung zu Marketing-E-Mails und Newsletter ist optional und kann jederzeit 
                  in den App-Einstellungen oder per E-Mail widerrufen werden.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">7.2 Analytics und Verbesserung</h3>
                <p className="text-gray-700 mb-4">
                  Die Zustimmung zur anonymisierten Analyse von App-Nutzung, Scan-Verhalten und Chats 
                  hilft uns bei der Verbesserung der App. Diese Zustimmung ist optional und widerrufbar.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3">7.3 Standortdaten</h3>
                <p className="text-gray-700 mb-4">
                  GPS-Koordinaten werden nur bei Barcode-Scans erfasst, wenn Sie der Standorterfassung 
                  explizit zugestimmt haben. Diese Funktion kann in den Geräteeinstellungen deaktiviert werden.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Datensicherheit</h2>
                <p className="text-gray-700 mb-4">
                  Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten vor Verlust, 
                  Manipulation und unberechtigtem Zugriff zu schützen:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700">
                  <li>SSL/TLS-Verschlüsselung aller Datenübertragungen</li>
                  <li>Sichere Passwort-Verschlüsselung (Hashing)</li>
                  <li>Regelmäßige Sicherheits-Updates</li>
                  <li>Zugriffskontrolle auf Datenbankebene</li>
                  <li>Backup-Systeme und Notfallpläne</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Datenübertragung an Dritte</h2>
                <p className="text-gray-700 mb-4">
                  Eine Übertragung Ihrer Daten an Dritte erfolgt nur in folgenden Fällen:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700">
                  <li>Für die Auftragsabwicklung notwendige Dienstleister (Versand, Zahlung)</li>
                  <li>Gesetzlich vorgeschriebene Übertragungen</li>
                  <li>Mit Ihrer ausdrücklichen Einverständnis</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Alle Dienstleister sind vertraglich zur Einhaltung der DSGVO verpflichtet.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Kinder</h2>
                <p className="text-gray-700 mb-4">
                  Unsere App richtet sich an Personen ab 16 Jahren. Wir erfassen nicht wissentlich 
                  personenbezogene Daten von Kindern unter 16 Jahren.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Änderungen dieser Datenschutzerklärung</h2>
                <p className="text-gray-700 mb-4">
                  Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren, um sie an 
                  geänderte Rechtslage oder App-Funktionen anzupassen. Sie werden über wesentliche 
                  Änderungen in der App benachrichtigt.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Beschwerderecht</h2>
                <p className="text-gray-700 mb-4">
                  Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, 
                  wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten rechtswidrig erfolgt.
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">
                    <strong>Zuständige Aufsichtsbehörde:</strong><br />
                    [Name der zuständigen Datenschutzbehörde]<br />
                    [Adresse]<br />
                    [PLZ Ort]<br />
                    Website: [URL]
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Kontakt</h2>
                <p className="text-gray-700 mb-4">
                  Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte wenden Sie sich an:
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">
                    <strong>E-Mail:</strong> datenschutz@vysn.de<br />
                    <strong>Post:</strong> VYSN GmbH, Datenschutz, [Adresse], [PLZ Ort]
                  </p>
                </div>
              </section>

              <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">
                  Diese Datenschutzerklärung wurde zuletzt aktualisiert am{' '}
                  {new Date().toLocaleDateString('de-DE', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}