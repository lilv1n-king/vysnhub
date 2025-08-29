'use client';

import { Metadata } from 'next';
import { useState } from 'react';

export default function DataProtectionPage() {
  const [language, setLanguage] = useState<'de' | 'en'>('de');

  const content = {
    de: {
      title: "Datenschutzerklärung für die VYSN App",
      lastUpdated: "Stand: August 2025",
      toggleButton: "English",
      sections: {
        intro: `Wir freuen uns über Ihr Interesse an der VYSN App. Der Schutz Ihrer personenbezogenen Daten hat für uns einen hohen Stellenwert. In dieser Datenschutzerklärung möchten wir Sie darüber informieren, welche personenbezogenen Daten wir bei der Nutzung unserer App (verfügbar für iOS, Android und als Web-Anwendung) erheben, wie wir diese verarbeiten und welche Rechte Ihnen nach der Datenschutz-Grundverordnung (DSGVO) zustehen. Wir verarbeiten Ihre Daten ausschließlich im Rahmen der geltenden Datenschutzgesetze der Europäischen Union (insbesondere DSGVO) und Deutschlands.`,
        
        responsible: {
          title: "1. Verantwortlicher",
          content: `Verantwortlicher im Sinne der DSGVO für die Datenverarbeitung im Zusammenhang mit der Nutzung der VYSN App ist:

VYSN GmbH (Anbieter der App)
[Straße, Hausnummer], [PLZ] [Ort], Deutschland (vollständige Anschrift wird vom Anbieter eingefügt)
E-Mail: datenschutz@vysn.de

(Hinweis: Gegebenenfalls wird hier auch der Datenschutzbeauftragte genannt, falls ein solcher benannt wurde.)`
        },

        dataProcessing: {
          title: "2. Von uns verarbeitete personenbezogene Daten",
          content: `Wir verarbeiten personenbezogene Daten, die Sie uns aktiv zur Verfügung stellen, sowie Daten, die bei der Nutzung der App automatisch erhoben werden.

**Von Ihnen bereitgestellte Daten**

**Registrierungs- und Kontodaten:** Beim Erstellen eines Kontos erheben wir Ihre E-Mail-Adresse sowie Ihren Vor- und Nachnamen. Sie müssen zudem ein Passwort festlegen (dieses wird von uns nur in verschlüsselter Form gespeichert). Optional können Sie weitere Angaben machen, z.B. Ihren Firmennamen und eine Telefonnummer. Außerdem vergeben wir bei der Registrierung automatisch eine Kundennummer und ordnen Ihrem Konto einen Kundentyp (z.B. Standard, Premium, Großkunde oder Partner) sowie einen Account-Status zu.

**Profildaten:** In Ihrem Profil können Sie zusätzliche Informationen hinterlegen, z.B. Ihre Rechnungsadresse (Straße, Postleitzahl, Ort, Land) und ggf. Ihre Umsatzsteuer-Identifikationsnummer (USt-IdNr.). Außerdem können für Ihr Konto spezielle Konditionen oder Rabatte hinterlegt sein (Rabattinformationen). Die App speichert auch von Ihnen gewählte Einstellungen wie bevorzugte Sprache und Währung. Des Weiteren wird vermerkt, ob Sie dem Erhalt unseres Newsletters zugestimmt haben und ob Sie Marketing-E-Mails erhalten möchten.

**Bestelldaten:** Wenn Sie über die App Bestellungen tätigen, verarbeiten wir Daten zu Ihren Bestellungen. Dazu gehören u.a. Ihre Bestellhistorie mit den bestellten Produkten, Bestelldatum und Bestellstatus, die von Ihnen angegebenen Lieferadressen sowie die zugehörigen Rechnungsinformationen. Gegebenenfalls speichern wir auch Angaben zu Ihren Produktpräferenzen oder bevorzugten Produktkategorien, falls Sie bestimmte Produkte häufiger bestellen oder in der App markieren.

**Projektdaten:** Die VYSN App bietet die Möglichkeit, Projekte anzulegen (z.B. Installations- oder Bauprojekte). Dabei können Sie projektbezogene Informationen eingeben, wie z.B. den Projektnamen und eine Beschreibung, den Projektstandort, den aktuellen Status und die Priorität des Projekts, geplanten Start- und Endtermin, Budgetrahmen sowie etwaige Notizen oder Tags zum Projekt (ggf. auch detaillierte Installationsangaben). Falls Sie im Projekt Fotos oder Dokumente hochladen (z.B. Installationsbilder), werden auch diese im Zusammenhang mit Ihrem Projekt gespeichert.

**Kommunikationsdaten:** Wenn Sie mit uns in Kontakt treten oder Funktionen wie einen Support-Chat oder einen KI-basierten Assistenten innerhalb der App nutzen, verarbeiten wir die Inhalte dieser Kommunikation. Das können beispielsweise Anfragen an unseren Kundenservice oder Eingaben in einem Chat-Tool sein. Diese Daten verwenden wir ausschließlich zur Bearbeitung Ihrer Anfrage bzw. zur Bereitstellung der jeweiligen Funktion.

**Automatisch erhobene Nutzungs- und technische Daten**

**Technische Zugriffsdaten:** Bei der Nutzung der App übermittelt Ihr Gerät automatisch bestimmte Daten. Dazu gehören z.B. die IP-Adresse Ihres Geräts, Angaben zum verwendeten Gerätetyp (Smartphone, Tablet oder PC) und Betriebssystem (inkl. Versionsnummer, z.B. iOS- oder Android-Version), der App- bzw. Browser-Typ und dessen Version sowie eindeutige Geräte- oder Sitzungs-IDs. Wir protokollieren zudem Zeitstempel für die Nutzung (Datum und Uhrzeit des Zugriffs) und ggf. Fehlerberichte oder Log-Einträge, um die Sicherheit und Funktionalität unseres Dienstes zu gewährleisten.

**Nutzungsdaten:** Während Sie unsere App verwenden, erfassen wir bestimmte Nutzungsinformationen, um die App-Funktionen bereitzustellen und kontinuierlich zu verbessern. Dazu gehören z.B. Ihre Suchanfragen nach Produkten und die jeweiligen Suchergebnisse, die Ihnen angezeigt werden, Ihr Navigationsverhalten innerhalb der App (welche Seiten oder Menüpunkte Sie aufrufen) sowie Aktionen im Warenkorb (hinzugefügte oder entfernte Produkte). Diese Nutzungsdaten helfen uns dabei, die App zu optimieren und Ihnen relevante Inhalte anzuzeigen.

**Scanner-Daten:** Die VYSN App enthält eine Scanner-Funktion, mit der Sie Barcodes oder QR-Codes scannen können (z.B. um Produkte hinzuzufügen oder Informationen abzurufen). Wenn Sie diese Funktion nutzen, werden scan-bezogene Daten aufgezeichnet, z.B. welcher Code-Typ gescannt wurde (Barcode oder QR-Code), eine Kennung des gescannten Codes (z.B. Produktnummer oder Projektschlüssel) und der Zeitpunkt des Scans. Diese Informationen verwenden wir, um Ihnen direkt die entsprechenden Produktinformationen oder projektbezogenen Inhalte anzuzeigen und um die Scanner-Funktion sowie unser Produktangebot laufend zu verbessern.

**Standortdaten (optional):** Sofern Sie uns die Erlaubnis geben, auf Ihren Standort zuzugreifen (siehe auch Abschnitt "App-Berechtigungen"), kann die App bei bestimmten Funktionen Standortdaten verarbeiten. Beispielsweise kann bei der Nutzung der Scanner-Funktion der aktuelle Standort erhoben werden, um das gescannte Objekt ggf. einem Projekt in Ihrer Nähe zuzuordnen oder um standortbezogene Services bereitzustellen. Die Nutzung von Standortdaten erfolgt ausschließlich zu den Zwecken, denen Sie zuvor zugestimmt haben. Sie können die Standortfreigabe jederzeit in den Einstellungen Ihres Geräts deaktivieren. (Hinweis: Falls Standortdaten übermittelt werden, protokollieren wir ggf. auch die vom Gerät gemeldete Standortgenauigkeit, um die Qualität der Daten einschätzen zu können.)

Bitte beachten Sie, dass all diese Daten grundsätzlich nur Ihrem Benutzerkonto zugeordnet werden, wenn dies für die Erfüllung der App-Funktionen notwendig ist (z.B. Zuordnung der Bestell- oder Projektdaten zu Ihrem Account). Teilweise können technische Nutzungsdaten aber auch ohne direkte Personenbeziehbarkeit anonym oder pseudonymisiert ausgewertet werden (z.B. zur technischen Optimierung der App).`
        },

        appPermissions: {
          title: "3. App-Berechtigungen und Zugriff auf Gerätefunktionen",
          content: `Die VYSN App kann je nach genutzter Plattform (iOS, Android oder Web) bestimmte Berechtigungen oder Zugriffe auf Funktionen Ihres Endgeräts erfordern. Wir fragen diese Zugriffsrechte jeweils nur ab, um Ihnen die entsprechenden Funktionen anbieten zu können. Im Einzelnen nutzt unsere App folgende Berechtigungen, wobei Sie diese bei der ersten Nutzung aktiv erlauben müssen (und später jederzeit über die Geräteeinstellungen widerrufen können):

**Kamera:** Der Zugriff auf die Kamera wird benötigt, um die Barcode-/QR-Code-Scanner-Funktion der App zu ermöglichen. Wenn Sie z.B. die Scan-Funktion öffnen, fragt die App Sie um Erlaubnis, die Kamera zu verwenden. Wir nutzen die Kamera ausschließlich zum Scannen von Codes; es werden keine Video- oder Fotoaufnahmen ohne Ihre Interaktion gespeichert.

**Standort:** Der optionale Zugriff auf Ihren Standort (GPS-Daten) wird benötigt, um bestimmte projektbezogene Funktionen zu unterstützen. Beispielsweise kann so ein gescanntes Objekt direkt einem Projekt an Ihrem aktuellen Standort zugeordnet werden, oder Sie erhalten standortbezogene Informationen zu Projekten und Produkten. Die Standortfreigabe ist freiwillig; wenn Sie diese nicht erteilen, können Sie die meisten App-Funktionen dennoch nutzen (einige ortsbasierte Features stehen dann ggf. nicht zur Verfügung).

**Push-Benachrichtigungen:** Wir möchten Sie gerne über wichtige Ereignisse auf dem Laufenden halten, z.B. über den Status Ihrer Bestellungen oder relevante Neuigkeiten zu unseren Produkten. Hierfür kann die App Ihnen Push-Mitteilungen senden, sofern Sie dem Empfang von Push-Benachrichtigungen zugestimmt haben. Das Betriebssystem (iOS/Android) wird Sie beim ersten Start der App fragen, ob Sie Mitteilungen zulassen möchten. Diese Zustimmung ist freiwillig und kann von Ihnen jederzeit in den System-/App-Einstellungen Ihres Geräts widerrufen werden. Ohne Ihre Einwilligung erhalten Sie keine Push-Nachrichten von uns.

**Speicher/Fotobibliothek:** Sollte die App um Erlaubnis bitten, auf den Speicher bzw. die Fotos/Medien Ihres Geräts zuzugreifen, geschieht dies z.B. wenn Sie ein Bild zu einem Projekt hochladen möchten. In diesem Fall benötigt die App die Berechtigung, auf Ihre Fotobibliothek zuzugreifen, damit Sie ein Bild aus Ihren Dateien auswählen können. Die App greift dabei nur auf die von Ihnen ausgewählten Dateien zu und speichert diese dann als Teil der Projektdokumentation auf unseren Servern.

**Mikrofon:** Falls in der App eine Audio-Aufnahme-Funktion zur Verfügung steht (z.B. um Sprachnotizen für ein Projekt aufzunehmen), benötigt die App Zugriff auf das Mikrofon Ihres Geräts. Die Berechtigung hierfür wird nur abgefragt, wenn Sie aktiv versuchen, eine Audio-Aufnahme in der App zu erstellen. Sie können diese Berechtigung jederzeit verweigern oder nachträglich wieder entziehen; ohne Mikrofonzugriff ist die Aufnahme-Funktion dann nicht nutzbar.

**Wichtig:** In jedem Fall werden die genannten Zugriffsrechte erst nach Ihrer ausdrücklichen Zustimmung aktiviert. Sie können Berechtigungen, die Sie einmal erteilt haben, jederzeit in den Einstellungen Ihres Smartphones oder Tablets widerrufen. Unsere App greift nur auf die unbedingt notwendigen Daten zu und nutzt die Berechtigungen ausschließlich für die beschriebenen Zwecke.`
        },

        legalBasis: {
          title: "4. Zwecke und Rechtsgrundlagen der Datenverarbeitung",
          content: `Wir verarbeiten Ihre personenbezogenen Daten zu verschiedenen Zwecken. Dabei stützen wir uns – je nach Art der Datenverarbeitung – auf unterschiedliche Rechtsgrundlagen nach Art. 6 DSGVO:

**Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):** Hauptzweck der Datenverarbeitung ist die Bereitstellung unserer App-Dienstleistungen im Rahmen des mit Ihnen geschlossenen Vertragsverhältnisses (Nutzungsbedingungen). Wir verwenden Ihre Registrierungs- und Kontodaten, um Ihr Konto einzurichten und zu verwalten. Ihre Bestell- und Profildaten werden verarbeitet, um Ihre Bestellungen abzuwickeln, Rechnungen zu erstellen und Lieferungen zu organisieren. Projektdaten verarbeiten wir, um Ihnen die Projektverwaltungsfunktionen der App zur Verfügung zu stellen. Kurz gesagt: Ohne die Verarbeitung dieser erforderlichen Daten wäre die Nutzung unserer App als B2B-Bestellplattform nicht möglich.

**Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO):** Ein Teil der Datenverarbeitung erfolgt zur Wahrung unserer berechtigten Interessen, sofern nicht Ihre überwiegenden Interessen oder Grundrechte entgegenstehen. Wir haben z.B. ein berechtigtes Interesse daran, unsere App technisch zu verbessern und benutzerfreundlicher zu gestalten. Daher analysieren wir Nutzungsdaten und Scanner-Daten in anonymisierter oder pseudonymisierter Form, um Funktionen zu optimieren und unser Produktangebot besser auf die Bedürfnisse der Kunden auszurichten. Ebenso liegt es in Ihrem und unserem Interesse, die App sicher zu halten; deshalb verarbeiten wir technische Log-Daten, um Sicherheit, Fehlerbehebung und Missbrauchsprävention zu gewährleisten. Auch die Nutzung Ihrer Daten für Kundenservice-Zwecke (z.B. Beantwortung von Anfragen im Support-Chat) stützt sich auf unser berechtigtes Interesse an einem effizienten Kundenservice und ist zugleich in Ihrem Interesse. Wo immer möglich, achten wir darauf, bei dieser Verarbeitung entweder keine oder nur stark pseudonymisierte Daten zu verwenden, um Ihre Privatsphäre zu schützen.

**Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):** In bestimmten Fällen verarbeiten wir Ihre Daten nur, wenn Sie uns zuvor ausdrücklich Ihre Einwilligung erteilt haben. Das betrifft zum Beispiel den Versand von Newslettern oder Marketing-E-Mails an Ihre E-Mail-Adresse – diese erhalten Sie nur, wenn Sie dem ausdrücklich zugestimmt haben. Auch die Nutzung von optionalen Analysefunktionen in der App (um aus Ihrem Nutzungsverhalten zu lernen und Ihnen ggf. personalisierte Inhalte bereitzustellen) erfolgt nur mit Ihrer vorherigen Zustimmung. Ebenso holen wir Ihre Einwilligung ein, bevor wir Push-Benachrichtigungen senden oder auf Ihren genauen Standort zugreifen (siehe App-Berechtigungen oben). Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen (siehe Abschnitt "Einwilligungs-Management und Widerspruch" unten). Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt hiervon unberührt.`
        },

        consent: {
          title: "5. Einwilligungs-Management und Widerspruch",
          content: `**Einwilligungen:** Sofern wir Sie um eine datenschutzrechtliche Einwilligung bitten (z.B. für den Erhalt von Newslettern, für optionale Analysen oder für die Nutzung von Standortdaten/Push-Nachrichten), haben Sie das Recht, diese Entscheidung frei zu treffen. Wenn Sie keine Einwilligung erteilen, entstehen Ihnen keine Nachteile – möglicherweise können Sie dann lediglich bestimmte freiwillige Zusatzfunktionen nicht nutzen (z.B. erhalten Sie ohne Newsletter-Anmeldung keinen Newsletter). Erteilen Sie eine Einwilligung, protokollieren wir diese Zustimmung elektronisch. Das bedeutet, wir speichern zu Nachweiszwecken, wann und wofür Sie Ihre Einwilligung gegeben haben (inkl. der zum Zeitpunkt der Einwilligung geltenden Datenschutzerklärung oder Einwilligungstexte). Gegebenenfalls speichern wir dabei auch technische Metadaten wie Ihre IP-Adresse oder Geräteinformationen zum Zeitpunkt der Einwilligung, um die Einwilligung rechtskonform dokumentieren zu können.

**Widerruf und Widerspruch:** Sie können eine einmal erteilte Einwilligung jederzeit widerrufen. Der Widerruf gilt ab dem Zeitpunkt, an dem Sie ihn uns gegenüber mitteilen. Das bedeutet, sobald Sie uns informieren (oder z.B. eine entsprechende Einstellung in der App vornehmen), dass Sie eine Einwilligung zurückziehen, werden wir die auf dieser Einwilligung beruhende Datenverarbeitung künftig unterlassen. Beispielsweise können Sie sich jederzeit vom Newsletter abmelden (durch Klick auf den Abmeldelink in jeder E-Mail oder über die Profileinstellungen in der App). Auch in den App-Einstellungen können Sie ggf. bestimmte Analyse- oder Tracking-Optionen deaktivieren, falls wir solche anbieten. Für den Widerruf können Sie uns auch formlos über die unten angegebenen Kontaktdaten benachrichtigen.

Unabhängig von Einwilligungen können Sie auch der Verarbeitung Ihrer personenbezogenen Daten widersprechen, sofern wir diese auf Grundlage berechtigter Interessen verarbeiten (Art. 21 DSGVO). In einem solchen Fall werden wir die Verarbeitung einstellen, es sei denn, wir können zwingende schutzwürdige Gründe nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen. Gegen die Verarbeitung Ihrer personenbezogenen Daten zu Zwecken der Direktwerbung können Sie jederzeit ohne Angabe von Gründen Widerspruch einlegen; wir werden die betroffenen Daten dann nicht mehr für diesen Zweck nutzen.`
        },

        dataSharing: {
          title: "6. Datenweitergabe und eingesetzte Dienstleister",
          content: `Wir geben Ihre personenbezogenen Daten grundsätzlich nicht an unberechtigte Dritte weiter. Eine Übermittlung erfolgt nur, wenn dies zur Erfüllung unserer vertraglichen Pflichten Ihnen gegenüber notwendig ist, wir gesetzlich oder durch behördliche/gerichtliche Anordnung dazu verpflichtet sind, oder Sie in eine solche Weitergabe eingewilligt haben. Im Rahmen der Bereitstellung unserer App und Services setzen wir jedoch einige externe Dienstleister als Auftragsverarbeiter ein, die in unserem Auftrag Daten verarbeiten. Diese Dienstleister sind vertraglich nach Art. 28 DSGVO verpflichtet, Ihre Daten streng vertraulich und nur nach unseren Weisungen zu behandeln. Im Folgenden informieren wir Sie über die wichtigsten Kategorien von Empfängern bzw. Dienstleistern:

**Hosting und Backend-Services:** Unsere App sowie die dazugehörige Datenbank werden auf Servern in Deutschland betrieben. Wir nutzen hierzu einen Cloud-Dienstleister (derzeit Supabase), der uns Infrastruktur für die Datenbank und Benutzer-Authentifizierung bereitstellt. Dieser Dienstleister speichert und verarbeitet die Daten ausschließlich in von uns festgelegten Rechenzentren innerhalb der EU (vorzugsweise in Deutschland) und agiert DSGVO-konform. Sämtliche in der App erhobenen Daten (z.B. Account-Informationen, Bestellungen, Projektdaten) werden sicher in dieser Datenbank gespeichert. Mit dem Hosting-Provider besteht ein Vertrag zur Auftragsverarbeitung, der den Schutz Ihrer Daten gewährleistet.

**Versand von Push-Benachrichtigungen:** Wenn Sie Push-Benachrichtigungen zugestimmt haben, erfolgt die Zustellung dieser Mitteilungen über die Dienste der jeweiligen Betriebssystem-Anbieter (Apple Push Notification Service für iOS-Geräte und Firebase Cloud Messaging für Android-Geräte). Dabei wird eine gerätespezifische Push-Token-ID an Apple bzw. Google übermittelt, damit die Nachricht an Ihr Gerät zugestellt werden kann. Diese IDs enthalten keine direkten personenbezogenen Inhalte – sie dienen lediglich zur Adressierung Ihres Geräts. Die Inhalte unserer Push-Nachrichten beschränken wir auf das Nötigste (z.B. „Ihre Bestellung Nr. 1234 ist versandt worden"); sensitive oder vertrauliche Informationen versenden wir nicht per Push. Apple und Google agieren bei der Zustellung der Nachrichten als eigenständige Dienstanbieter; nähere Informationen zur Datenverarbeitung durch diese entnehmen Sie bitte den Datenschutzhinweisen von Apple bzw. Google.

**E-Mail-Kommunikation:** Zum Versand von transaktionalen E-Mails (z.B. Bestellbestätigungen, Passwort-Zurücksetzen) oder von Newslettern können wir externe E-Mail-Dienstleister einsetzen. Diese erhalten in der Regel lediglich Ihre E-Mail-Adresse und die notwendigen Inhaltsdaten, um die Nachricht in unserem Auftrag zu versenden. Auch hier stellen wir durch entsprechende Verträge sicher, dass Ihre Daten nicht für andere Zwecke genutzt werden und die Dienstleister die Datenschutzstandards einhalten.

**Keine externen Analyse- oder Tracking-Dienste:** Wir verwenden keine externen Tracking- oder Analysetools wie Google Analytics, Firebase Analytics, Facebook/Meta Pixel oder ähnliche Dienste in unserer App. Das bedeutet, es findet keine Übermittlung Ihrer App-Nutzungsdaten an Drittanbieter zu Werbe-, Marketing- oder Profilingzwecken statt. Ebenso setzen wir keine externen Crash-Reporting-Dienste (z.B. Crashlytics) ein, die Daten an Dritte leiten würden. Sollten wir in Zukunft bestimmte Analysedienste einsetzen, würden wir dies nur nach Ihrer vorherigen Einwilligung tun und Sie in dieser Datenschutzerklärung darüber informieren.

Abgesehen von den oben genannten Fällen können im Einzelfall weitere Stellen Daten erhalten, wenn eine gesetzliche Verpflichtung zur Weitergabe besteht (z.B. an Strafverfolgungsbehörden) oder wenn es zur Durchsetzung unserer Rechte erforderlich ist (z.B. Weitergabe an Gerichte oder unsere Rechtsbeistände bei Rechtsstreitigkeiten). In allen Fällen achten wir darauf, nur das erforderliche Maß an Daten zu übermitteln.

Wir versichern, dass wir Ihre personenbezogenen Daten nicht verkaufen und nicht zu Marketingzwecken an unberechtigte Dritte weitergeben.`
        },

        dataSecurity: {
          title: "7. Datensicherheit",
          content: `Wir treffen umfangreiche technische und organisatorische Maßnahmen, um Ihre personenbezogenen Daten vor Verlust, Missbrauch und unbefugtem Zugriff zu schützen. Hierzu setzen wir aktuelle Sicherheitstechnologien und bewährte Verfahren ein:

Alle Kommunikationen zwischen der App (bzw. Ihrem Endgerät) und unseren Servern erfolgen über verschlüsselte Verbindungen (HTTPS/TLS). Dadurch sind die übertragenen Daten vor dem Mitlesen oder Manipulieren geschützt.

Passwörter werden bei uns ausschließlich in verschlüsselter (gehashter) Form gespeichert. Das bedeutet, dass selbst wir als Betreiber Ihr Passwort nicht im Klartext einsehen können. Bitte verwenden Sie dennoch ein sicheres, individuelles Passwort und behandeln Sie Ihre Zugangsdaten vertraulich.

Unsere Server befinden sich in sicheren Rechenzentren in Deutschland. Der physische Zugang zu den Serveranlagen sowie der elektronische Zugriff auf die Daten sind streng eingeschränkt und nur autorisiertem Personal möglich. Unsere Mitarbeiter und beauftragten Dienstleister sind auf die Einhaltung der Datenschutz- und Datensicherheitsvorschriften verpflichtet.

Wir verwenden ein tokenbasiertes Authentifizierungssystem (JWT – JSON Web Token) für die Zugriffskontrolle in der App. Nach dem Login erhalten Sie ein sicheres Token, das bei jeder Anfrage zur Identifikation dient. Dieses Token hat eine begrenzte Gültigkeitsdauer und wird bei Ablauf automatisch erneuert (Refresh-Token-Mechanismus), um eine nahtlose und dennoch sichere Nutzung zu ermöglichen. Bei längerer Inaktivität werden Ihre Sitzungstoken ungültig und Sie müssen sich gegebenenfalls erneut anmelden – dies dient dem Schutz Ihres Kontos vor unbefugter Nutzung.

Auf Ihrem Gerät speichert die App einige lokale Daten in einem geschützten Speicherbereich. Dazu gehören z.B. Ihr Login-Token (damit Sie sich nicht bei jeder Nutzung neu einloggen müssen), Ihre Spracheinstellungen, der Status Ihrer Datenschutz-Einwilligungen sowie temporäre Daten wie Warenkorbinhalte. Diese lokalen Daten verbleiben auf Ihrem Gerät und werden nicht an uns übertragen; sie dienen allein der Verbesserung der Benutzerfreundlichkeit (z.B. Offline-Verfügbarkeit Ihres Warenkorbs). Sie können diese lokal gespeicherten Daten entfernen, indem Sie z.B. die App von Ihrem Gerät deinstallieren oder sich aktiv ausloggen (dadurch werden die lokalen Daten und Tokens zurückgesetzt).

Wir aktualisieren unsere Systeme regelmäßig mit Sicherheitsupdates und überwachen sie fortlaufend, um ungewöhnlichen Verkehr oder unautorisierte Zugriffsversuche frühzeitig zu erkennen. Sicherheitsrelevante Ereignisse und Log-Dateien werden ausgewertet, damit wir bei Bedarf umgehend Maßnahmen ergreifen können.

Bitte beachten Sie, dass keine Internet- oder App-Übertragung absolut 100% sicher ist. Wir bemühen uns jedoch nach bestem Wissen und Gewissen, Ihre Daten nach dem aktuellen Stand der Technik zu schützen. Sollte es dennoch zu einem Sicherheitsvorfall kommen, der voraussichtlich ein hohes Risiko für Ihre persönlichen Rechte und Freiheiten mit sich bringt, werden wir Sie und ggf. die zuständige Aufsichtsbehörde unverzüglich darüber informieren, wie es die gesetzlichen Vorgaben erfordern.`
        },

        dataRetention: {
          title: "8. Speicherdauer und Löschung",
          content: `Wir speichern personenbezogene Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist oder wir gesetzlich zu einer Aufbewahrung verpflichtet sind. Konkret gelten für die VYSN App u.a. die folgenden Aufbewahrungsfristen bzw. Löschkonzepte:

**Account- und Profildaten:** Alle personenbezogenen Daten, die mit Ihrem Benutzerkonto verknüpft sind (z.B. Registrierungsdaten, Profildaten, Projektdaten), bewahren wir grundsätzlich für die Dauer des Bestehens Ihres Accounts auf. Wenn Sie Ihr Konto löschen (oder die Löschung durch uns veranlassen), werden wir die zu Ihrem Profil gespeicherten personenbezogenen Daten aus unseren aktiven Systemen entfernen, sofern dem keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Beachten Sie, dass Sie nach einer Kontolöschung nicht mehr auf Ihre Projekte oder Bestellhistorie in der App zugreifen können.

**Bestelldaten und Rechnungsinformationen:** Daten zu getätigten Bestellungen – insbesondere solche, die in Rechnungen eingehen – müssen wir aufgrund handels- und steuerrechtlicher Vorgaben 10 Jahre lang aufbewahren (gesetzliche Aufbewahrungsfristen nach § 257 Handelsgesetzbuch und § 147 Abgabenordnung). Diese Daten werden nach einer eventuellen Kontolöschung für die normale Nutzung gesperrt und nur noch für Archiv-/Behördenzwecke vorgehalten. Zugriff darauf haben dann nur noch befugte Personen (z.B. zur Erfüllung von Buchprüfungspflichten oder im Rahmen gesetzlicher Archivierungen).

**Nutzungs- und Scandaten:** Nutzungsbezogene Aufzeichnungen (z.B. Protokolle Ihrer App-Aktivitäten, Scan-Historien) speichern wir in der Regel für maximal 2 Jahre zu Analyse- und Optimierungszwecken. Nach Ablauf dieser Zeit werden sie entweder gelöscht oder so anonymisiert/pseudonymisiert, dass ein Personenbezug nicht mehr herstellbar ist, sofern wir gewisse aggregierte Auswertungen länger vorhalten möchten. Statistische, nicht auf einzelne Personen rückführbare Auswertungen (z.B. Gesamtzahl aller Scans pro Monat) können wir auch dauerhaft speichern, da hierbei kein Personenbezug besteht.

**Technische Log- und Sicherheitsdaten:** Server-Logs, die IP-Adressen und Geräteinformationen enthalten (z.B. Zugriffsprotokolle, Fehler- und Absturzmeldungen), bewahren wir in der Regel für ca. 6 Monate auf. Diese Logs dienen primär dazu, die Sicherheit zu überwachen und Fehler zu finden. Eine längere Aufbewahrung erfolgt nur in besonderen Fällen – etwa wenn bestimmte Log-Einträge als Beweismittel für sicherheitsrelevante Vorfälle benötigt werden oder ausnahmsweise gesetzliche Pflichten dies verlangen.

**Einwilligungsnachweise:** Informationen über erteilte oder verweigerte Einwilligungen (sowie über einen Widerruf) können wir so lange speichern, wie wir die entsprechende Verarbeitung durchführen und darüber hinaus für einen angemessenen Zeitraum, um unserer Nachweispflicht gemäß Art. 5 Abs. 2 DSGVO gerecht zu werden. Praktisch bedeutet dies: Wir halten z.B. fest, ob und wann Sie dem Erhalt des Newsletters zugestimmt oder widersprochen haben, solange Ihr Newsletter-Abonnement aktiv ist und danach noch für einen begrenzten Zeitraum. Dies dient dazu, einen versehentlichen erneuten Versand zu verhindern und im Zweifel belegen zu können, dass eine Einwilligung vorlag bzw. widerrufen wurde.

Nach Ablauf der genannten Fristen bzw. sobald die genannten Zwecke wegfallen und keine anderweitige Rechtsgrundlage mehr besteht, werden wir die entsprechenden Daten routinemäßig löschen oder endgültig anonymisieren. Sollten Sie eine vorzeitige Löschung bestimmter Daten wünschen, können Sie uns jederzeit kontaktieren – wir prüfen dann, ob dem eine Pflicht zur weiteren Speicherung entgegensteht und kommen Ihrem Löschwunsch ggf. gerne nach.`
        },

        rights: {
          title: "9. Ihre Rechte als betroffene Person",
          content: `Als Nutzer der VYSN App und somit als betroffene Person im Sinne der DSGVO stehen Ihnen die folgenden Rechte zu. Diese können Sie jederzeit uns gegenüber geltend machen:

**Recht auf Auskunft (Art. 15 DSGVO):** Sie haben das Recht, von uns eine Bestätigung zu erhalten, ob wir personenbezogene Daten von Ihnen verarbeiten. Ist dies der Fall, können Sie Auskunft über diese Daten verlangen. In Ihrem Auskunftsersuchen können Sie Informationen erhalten über die konkreten personenbezogenen Daten, die wir zu Ihrer Person gespeichert haben, die Verarbeitungszwecke, die Kategorien der verarbeiteten Daten, die Empfänger oder Kategorien von Empfängern (falls wir Daten weitergeben), die geplante Speicherdauer bzw. die Kriterien für deren Festlegung sowie Hinweise auf Ihre weiteren Rechte. Sie haben zudem Anspruch auf eine Kopie dieser Daten, die wir in der Regel elektronisch bereitstellen.

**Recht auf Berichtigung (Art. 16 DSGVO):** Sie haben das Recht, unverzüglich die Berichtigung Sie betreffender unrichtiger personenbezogener Daten zu verlangen. Ferner steht Ihnen das Recht zu, die Vervollständigung unvollständiger Daten zu fordern – z.B. durch eine ergänzende Erklärung. In Ihrem Nutzerprofil der App können Sie einige Basisdaten selbst aktualisieren; für weitergehende Korrekturen können Sie sich jederzeit an uns wenden.

**Recht auf Löschung (Art. 17 DSGVO):** Sie haben das Recht zu verlangen, dass wir Ihre personenbezogenen Daten löschen, sofern die gesetzlichen Voraussetzungen dafür vorliegen. Dies ist z.B. der Fall, wenn die Daten für die Zwecke, für die sie erhoben oder verarbeitet wurden, nicht mehr notwendig sind, Sie eine von Ihnen erteilte Einwilligung widerrufen und es an einer anderweitigen Rechtsgrundlage für die Verarbeitung fehlt, Sie berechtigt Widerspruch gegen die Verarbeitung einlegen (siehe Art. 21 DSGVO) oder die Daten unrechtmäßig verarbeitet wurden. Bitte beachten Sie, dass das Löschungsrecht eingeschränkt sein kann, wenn eine Verarbeitung zur Erfüllung einer rechtlichen Verpflichtung erforderlich ist (z.B. gesetzliche Aufbewahrungspflichten) oder in weiteren gesetzlich geregelten Fällen. In solchen Fällen löschen wir die betreffenden Daten nicht sofort, sondern sperren sie zunächst und löschen sie endgültig nach Ablauf der maßgeblichen Frist.

**Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO):** Sie haben das Recht, unter bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Das bedeutet, die Daten werden zwar weiterhin gespeichert, aber nicht mehr anderweitig verarbeitet (außer für gesetzlich vorgesehene Ausnahmefälle). Ein solcher Fall liegt z.B. vor, wenn Sie die Richtigkeit Ihrer Daten bestreiten – dann können Sie verlangen, dass wir die Datenverarbeitung einschränken, solange wir die Richtigkeit überprüfen. Auch wenn Sie Widerspruch nach Art. 21 DSGVO gegen eine Verarbeitung eingelegt haben, können Sie für die Dauer der Prüfung eine Einschränkung verlangen. Zudem können Sie statt einer Löschung die Einschränkung verlangen, wenn Daten zwar unrechtmäßig verarbeitet wurden, Sie aber keine Löschung wünschen, oder wenn wir Ihre Daten für die eigentlichen Zwecke nicht länger benötigen, Sie sie aber zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen noch benötigen.

**Recht auf Datenübertragbarkeit (Art. 20 DSGVO):** Sie haben das Recht, die personenbezogenen Daten, die Sie uns bereitgestellt haben, in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten, oder – nach Ihrer Wahl und soweit technisch machbar – die direkte Übertragung dieser Daten an einen anderen Verantwortlichen zu verlangen. Dieses Recht besteht allerdings nur für Daten, die wir auf Grundlage Ihrer Einwilligung oder zur Vertragserfüllung automatisiert verarbeiten. Daten, die wir z.B. aufgrund gesetzlicher Pflichten speichern, sind hiervon nicht erfasst.

**Widerspruchsrecht (Art. 21 DSGVO):** Wie oben bereits erwähnt, haben Sie das Recht, jederzeit Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten einzulegen, sofern wir diese auf Grundlage eines berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO) verarbeiten. Wenn Sie Widerspruch einlegen, werden wir Ihre Daten nicht weiter auf dieser Grundlage verarbeiten, es sei denn, wir können zwingende schutzwürdige Gründe für die Verarbeitung nachweisen, die Ihre Interessen, Rechte und Freiheiten überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen. Insbesondere können Sie jederzeit Widerspruch gegen die Verarbeitung zu Zwecken der Direktwerbung einlegen – in diesem Fall werden wir Ihre personenbezogenen Daten nicht mehr für Werbezwecke nutzen. Für den Widerspruch genügt eine formlose Mitteilung an uns (z.B. per E-Mail).

**Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO):** Unbeschadet anderweitiger verwaltungsrechtlicher oder gerichtlicher Rechtsbehelfe steht Ihnen das Recht zu, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt. Sie können dieses Recht bei der Aufsichtsbehörde Ihres üblichen Aufenthaltsortes, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes geltend machen. In der Regel ist für Unternehmen mit Sitz in Deutschland die Landesdatenschutzbehörde des jeweiligen Bundeslandes zuständig. Für uns wäre dies z.B. die Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW). Die Beschwerde kann formlos erfolgen. Die Aufsichtsbehörde wird Sie über den Stand und die Ergebnisse Ihrer Eingabe einschließlich der Möglichkeit eines gerichtlichen Rechtsbehelfs informieren.

**Ausübung Ihrer Rechte:** Zur Wahrnehmung Ihrer oben genannten Rechte können Sie uns jederzeit formlos kontaktieren (siehe Kontaktinformationen unten). Bitte beachten Sie, dass wir bei begründeten Zweifeln an Ihrer Identität zusätzliche Informationen anfordern dürfen, um sicherzustellen, dass keine Daten an Unbefugte herausgegeben werden. Die Ausübung Ihrer Rechte ist für Sie grundsätzlich kostenlos.`
        },

        contact: {
          title: "10. Kontakt und weitere Informationen",
          content: `Wenn Sie Fragen zu dieser Datenschutzerklärung oder zur Verarbeitung Ihrer Daten in der VYSN App haben, oder wenn Sie eines Ihrer oben genannten Rechte ausüben möchten, können Sie sich jederzeit an uns wenden:

VYSN GmbH – Datenschutzabteilung
[Anschrift des Unternehmens, Straße Nr., PLZ Ort]
E-Mail: datenschutz@vysn.de
Web: www.vysn.de/datenschutz

(Hinweis: Genaue Kontaktdaten, wie z.B. die vollständige Postanschrift, oder den Namen eines Datenschutzbeauftragten ergänzt der Anbieter hier, falls erforderlich.)

Wir werden Ihr Anliegen zeitnah prüfen und Ihnen spätestens innerhalb der gesetzlich vorgegebenen Fristen antworten.`
        },

        updates: {
          title: "11. Aktualität und Änderungen dieser Datenschutzerklärung",
          content: `Diese Datenschutzerklärung hat den Stand August 2025 und ist aktuell gültig. Wir behalten uns vor, den Inhalt dieser Erklärung bei Bedarf anzupassen, um sie an Änderungen unserer App-Services oder an geänderte rechtliche Anforderungen anzulehnen. Die jeweils aktuelle Fassung der Datenschutzerklärung können Sie jederzeit über unsere App sowie auf unserer Website unter vysn.de/datenschutz abrufen. Sollten wesentliche Änderungen vorgenommen werden (insbesondere solche, die eine Einwilligung betreffen oder die für Sie im Verhältnis zur bisherigen Version nachteilig sein könnten), werden wir Sie – z.B. innerhalb der App oder per E-Mail – in geeigneter Weise darauf aufmerksam machen.`
        }
      }
    },
    en: {
      title: "Privacy Policy for the VYSN App",
      lastUpdated: "Last updated: August 2025",
      toggleButton: "Deutsch",
      sections: {
        intro: `We are pleased about your interest in the VYSN App. The protection of your personal data is of high importance to us. In this privacy policy, we would like to inform you about which personal data we collect when using our app (available for iOS, Android and as a web application), how we process this data and what rights you have under the General Data Protection Regulation (GDPR). We process your data exclusively within the framework of the applicable data protection laws of the European Union (in particular GDPR) and Germany.`,

        responsible: {
          title: "1. Responsible Party",
          content: `The responsible party within the meaning of the GDPR for data processing in connection with the use of the VYSN App is:

VYSN GmbH (App Provider)
[Street, House Number], [Postal Code] [City], Germany (complete address will be inserted by the provider)
Email: datenschutz@vysn.de

(Note: If applicable, the data protection officer will also be named here if one has been appointed.)`
        },

        dataProcessing: {
          title: "2. Personal Data We Process",
          content: `We process personal data that you actively provide to us, as well as data that is automatically collected when using the app.

**Data Provided by You**

**Registration and Account Data:** When creating an account, we collect your email address as well as your first and last name. You must also set a password (this is only stored by us in encrypted form). Optionally, you can provide additional information, e.g., your company name and a phone number. In addition, we automatically assign a customer number during registration and assign a customer type (e.g., Standard, Premium, Enterprise, or Partner) as well as an account status to your account.

**Profile Data:** In your profile, you can store additional information, e.g., your billing address (street, postal code, city, country) and possibly your VAT identification number (VAT ID). Special conditions or discounts may also be stored for your account (discount information). The app also stores settings you have chosen, such as preferred language and currency. Furthermore, it is noted whether you have consented to receiving our newsletter and whether you want to receive marketing emails.

**Order Data:** When you place orders through the app, we process data related to your orders. This includes, among other things, your order history with the ordered products, order date and order status, the delivery addresses you provided, as well as the associated billing information. If applicable, we also store information about your product preferences or preferred product categories if you order certain products more frequently or mark them in the app.

**Project Data:** The VYSN App offers the possibility to create projects (e.g., installation or construction projects). You can enter project-related information, such as the project name and description, project location, current status and priority of the project, planned start and end dates, budget framework, as well as any notes or tags for the project (possibly also detailed installation information). If you upload photos or documents in the project (e.g., installation images), these are also stored in connection with your project.

**Communication Data:** When you contact us or use functions such as a support chat or an AI-based assistant within the app, we process the contents of this communication. These can be, for example, inquiries to our customer service or inputs in a chat tool. We use this data exclusively to process your inquiry or to provide the respective function.

**Automatically Collected Usage and Technical Data**

**Technical Access Data:** When using the app, your device automatically transmits certain data. This includes, for example, the IP address of your device, information about the device type used (smartphone, tablet, or PC) and operating system (including version number, e.g., iOS or Android version), the app or browser type and its version, as well as unique device or session IDs. We also log timestamps for usage (date and time of access) and possibly error reports or log entries to ensure the security and functionality of our service.

**Usage Data:** While you use our app, we collect certain usage information to provide app functions and continuously improve them. This includes, for example, your product search queries and the respective search results displayed to you, your navigation behavior within the app (which pages or menu items you access), as well as actions in the shopping cart (added or removed products). This usage data helps us optimize the app and show you relevant content.

**Scanner Data:** The VYSN App contains a scanner function with which you can scan barcodes or QR codes (e.g., to add products or retrieve information). When you use this function, scan-related data is recorded, e.g., which code type was scanned (barcode or QR code), an identifier of the scanned code (e.g., product number or project key), and the time of the scan. We use this information to directly show you the corresponding product information or project-related content and to continuously improve the scanner function and our product offering.

**Location Data (optional):** If you give us permission to access your location (see also section "App Permissions"), the app can process location data for certain functions. For example, when using the scanner function, the current location can be collected to possibly assign the scanned object to a project near you or to provide location-based services. The use of location data occurs exclusively for the purposes to which you have previously consented. You can deactivate location sharing at any time in your device settings. (Note: If location data is transmitted, we may also log the location accuracy reported by the device to assess the quality of the data.)

Please note that all this data is generally only assigned to your user account if this is necessary for fulfilling the app functions (e.g., assignment of order or project data to your account). Partially, technical usage data can also be evaluated anonymously or pseudonymously without direct personal reference (e.g., for technical optimization of the app).`
        },

        appPermissions: {
          title: "3. App Permissions and Access to Device Functions",
          content: `The VYSN App may require certain permissions or access to functions of your end device depending on the platform used (iOS, Android, or Web). We only request these access rights to offer you the corresponding functions. Specifically, our app uses the following permissions, which you must actively allow when first using them (and can revoke at any time via device settings):

**Camera:** Access to the camera is needed to enable the barcode/QR code scanner function of the app. When you open the scan function, for example, the app asks you for permission to use the camera. We use the camera exclusively for scanning codes; no video or photo recordings are stored without your interaction.

**Location:** Optional access to your location (GPS data) is needed to support certain project-related functions. For example, a scanned object can be directly assigned to a project at your current location, or you receive location-based information about projects and products. Location sharing is voluntary; if you do not grant this, you can still use most app functions (some location-based features may then not be available).

**Push Notifications:** We would like to keep you informed about important events, e.g., about the status of your orders or relevant news about our products. For this, the app can send you push messages if you have consented to receiving push notifications. The operating system (iOS/Android) will ask you when you first start the app whether you want to allow messages. This consent is voluntary and can be revoked by you at any time in the system/app settings of your device. Without your consent, you will not receive push messages from us.

**Storage/Photo Library:** Should the app ask for permission to access the storage or photos/media on your device, this happens, for example, when you want to upload an image to a project. In this case, the app needs permission to access your photo library so you can select an image from your files. The app only accesses the files you select and then stores them as part of the project documentation on our servers.

**Microphone:** If an audio recording function is available in the app (e.g., to record voice notes for a project), the app needs access to your device's microphone. Permission for this is only requested when you actively try to create an audio recording in the app. You can refuse this permission at any time or revoke it later; without microphone access, the recording function is then not usable.

**Important:** In any case, the mentioned access rights are only activated after your explicit consent. You can revoke permissions you have once granted at any time in the settings of your smartphone or tablet. Our app only accesses the absolutely necessary data and uses the permissions exclusively for the described purposes.`
        },

        legalBasis: {
          title: "4. Purposes and Legal Basis for Data Processing",
          content: `We process your personal data for various purposes. Depending on the type of data processing, we rely on different legal bases according to Art. 6 GDPR:

**Contract Fulfillment (Art. 6 para. 1 lit. b GDPR):** The main purpose of data processing is to provide our app services within the framework of the contractual relationship concluded with you (terms of use). We use your registration and account data to set up and manage your account. Your order and profile data are processed to handle your orders, create invoices, and organize deliveries. We process project data to provide you with the project management functions of the app. In short: Without processing this required data, using our app as a B2B ordering platform would not be possible.

**Legitimate Interests (Art. 6 para. 1 lit. f GDPR):** Part of the data processing is carried out to protect our legitimate interests, provided your overriding interests or fundamental rights do not conflict with this. We have, for example, a legitimate interest in technically improving our app and making it more user-friendly. Therefore, we analyze usage data and scanner data in anonymized or pseudonymized form to optimize functions and better align our product offering with customer needs. It is also in your and our interest to keep the app secure; therefore, we process technical log data to ensure security, error correction, and abuse prevention. The use of your data for customer service purposes (e.g., answering inquiries in support chat) is also based on our legitimate interest in efficient customer service and is simultaneously in your interest. Wherever possible, we ensure that we use either no data or only heavily pseudonymized data in this processing to protect your privacy.

**Consent (Art. 6 para. 1 lit. a GDPR):** In certain cases, we only process your data if you have previously given us your explicit consent. This applies, for example, to sending newsletters or marketing emails to your email address – you only receive these if you have explicitly consented to them. The use of optional analysis functions in the app (to learn from your usage behavior and possibly provide you with personalized content) also only occurs with your prior consent. We also obtain your consent before sending push notifications or accessing your precise location (see app permissions above). You can revoke consent you have given at any time with effect for the future (see section "Consent Management and Objection" below). The lawfulness of data processing carried out until the revocation remains unaffected.`
        },

        consent: {
          title: "5. Consent Management and Objection",
          content: `**Consents:** If we ask you for data protection consent (e.g., for receiving newsletters, for optional analyses, or for using location data/push messages), you have the right to make this decision freely. If you do not give consent, you will not suffer any disadvantages – you may only not be able to use certain voluntary additional functions (e.g., you will not receive a newsletter without newsletter registration). If you give consent, we record this consent electronically. This means we store for documentation purposes when and for what you gave your consent (including the privacy policy or consent texts valid at the time of consent). We may also store technical metadata such as your IP address or device information at the time of consent to document the consent in compliance with the law.

**Revocation and Objection:** You can revoke consent you have given at any time. The revocation applies from the time you communicate it to us. This means as soon as you inform us (or make a corresponding setting in the app, for example) that you are withdrawing consent, we will refrain from data processing based on this consent in the future. For example, you can unsubscribe from the newsletter at any time (by clicking the unsubscribe link in each email or via profile settings in the app). You may also be able to deactivate certain analysis or tracking options in the app settings if we offer such options. For revocation, you can also informally notify us via the contact details provided below.

Independent of consents, you can also object to the processing of your personal data if we process it based on legitimate interests (Art. 21 GDPR). In such a case, we will stop processing unless we can demonstrate compelling legitimate grounds that override your interests, rights, and freedoms, or the processing serves to assert, exercise, or defend legal claims. You can object to the processing of your personal data for direct marketing purposes at any time without giving reasons; we will then no longer use the affected data for this purpose.`
        },

        dataSharing: {
          title: "6. Data Sharing and Service Providers Used",
          content: `We generally do not pass on your personal data to unauthorized third parties. Transmission only occurs if this is necessary to fulfill our contractual obligations to you, if we are legally obligated or required by official/judicial order to do so, or if you have consented to such transmission. However, in the context of providing our app and services, we use some external service providers as processors who process data on our behalf. These service providers are contractually obligated according to Art. 28 GDPR to treat your data strictly confidentially and only according to our instructions. Below we inform you about the main categories of recipients or service providers:

**Hosting and Backend Services:** Our app and the associated database are operated on servers in Germany. We use a cloud service provider (currently Supabase) that provides us with infrastructure for the database and user authentication. This service provider stores and processes data exclusively in data centers within the EU (preferably in Germany) determined by us and acts in compliance with GDPR. All data collected in the app (e.g., account information, orders, project data) is securely stored in this database. There is a data processing agreement with the hosting provider that ensures the protection of your data.

**Sending Push Notifications:** If you have consented to push notifications, these messages are delivered via the services of the respective operating system providers (Apple Push Notification Service for iOS devices and Firebase Cloud Messaging for Android devices). A device-specific push token ID is transmitted to Apple or Google so that the message can be delivered to your device. These IDs do not contain direct personal content – they only serve to address your device. We limit the content of our push messages to the essentials (e.g., "Your order No. 1234 has been shipped"); we do not send sensitive or confidential information via push. Apple and Google act as independent service providers when delivering messages; for more information about data processing by them, please refer to Apple's and Google's privacy notices.

**Email Communication:** For sending transactional emails (e.g., order confirmations, password reset) or newsletters, we may use external email service providers. These generally only receive your email address and the necessary content data to send the message on our behalf. Here too, we ensure through appropriate contracts that your data is not used for other purposes and that service providers comply with data protection standards.

**No External Analysis or Tracking Services:** We do not use external tracking or analysis tools such as Google Analytics, Firebase Analytics, Facebook/Meta Pixel, or similar services in our app. This means there is no transmission of your app usage data to third parties for advertising, marketing, or profiling purposes. We also do not use external crash reporting services (e.g., Crashlytics) that would forward data to third parties. Should we use certain analysis services in the future, we would only do so after your prior consent and inform you about it in this privacy policy.

Apart from the cases mentioned above, other parties may receive data in individual cases if there is a legal obligation to pass on data (e.g., to law enforcement agencies) or if it is necessary to enforce our rights (e.g., transmission to courts or our legal advisors in legal disputes). In all cases, we ensure that only the necessary amount of data is transmitted.

We assure that we do not sell your personal data and do not pass it on to unauthorized third parties for marketing purposes.`
        },

        dataSecurity: {
          title: "7. Data Security",
          content: `We take extensive technical and organizational measures to protect your personal data from loss, misuse, and unauthorized access. For this, we use current security technologies and proven procedures:

All communications between the app (or your end device) and our servers occur via encrypted connections (HTTPS/TLS). This protects the transmitted data from being read or manipulated.

Passwords are stored by us exclusively in encrypted (hashed) form. This means that even we as operators cannot view your password in plain text. Nevertheless, please use a secure, individual password and treat your access data confidentially.

Our servers are located in secure data centers in Germany. Physical access to the server facilities as well as electronic access to the data are strictly limited and only possible for authorized personnel. Our employees and commissioned service providers are obligated to comply with data protection and data security regulations.

We use a token-based authentication system (JWT – JSON Web Token) for access control in the app. After logging in, you receive a secure token that serves for identification with each request. This token has a limited validity period and is automatically renewed when it expires (refresh token mechanism) to enable seamless yet secure use. During longer inactivity, your session tokens become invalid and you may need to log in again – this serves to protect your account from unauthorized use.

The app stores some local data in a protected storage area on your device. This includes, for example, your login token (so you don't have to log in again with each use), your language settings, the status of your privacy consents, as well as temporary data such as shopping cart contents. This local data remains on your device and is not transmitted to us; it serves solely to improve user-friendliness (e.g., offline availability of your shopping cart). You can remove this locally stored data by, for example, uninstalling the app from your device or actively logging out (this resets the local data and tokens).

We regularly update our systems with security updates and monitor them continuously to detect unusual traffic or unauthorized access attempts early. Security-relevant events and log files are evaluated so we can take immediate action if necessary.

Please note that no internet or app transmission is absolutely 100% secure. However, we strive to the best of our knowledge and belief to protect your data according to the current state of technology. Should a security incident nevertheless occur that is likely to result in a high risk to your personal rights and freedoms, we will inform you and possibly the competent supervisory authority immediately, as required by legal provisions.`
        },

        dataRetention: {
          title: "8. Storage Duration and Deletion",
          content: `We store personal data only as long as it is necessary for the respective purposes or we are legally obligated to retain it. Specifically, the following retention periods or deletion concepts apply for the VYSN App:

**Account and Profile Data:** All personal data linked to your user account (e.g., registration data, profile data, project data) we generally retain for the duration of your account's existence. If you delete your account (or we initiate the deletion), we will remove the personal data stored for your profile from our active systems, provided no legal retention obligations prevent this. Note that after account deletion, you can no longer access your projects or order history in the app.

**Order Data and Billing Information:** Data on orders placed – especially those included in invoices – must be retained by us for 10 years due to commercial and tax law requirements (legal retention periods according to § 257 German Commercial Code and § 147 German Tax Code). After a possible account deletion, this data is blocked for normal use and only kept for archive/official purposes. Only authorized persons then have access to it (e.g., to fulfill audit obligations or in the context of legal archiving).

**Usage and Scan Data:** Usage-related recordings (e.g., logs of your app activities, scan histories) we generally store for a maximum of 2 years for analysis and optimization purposes. After this time expires, they are either deleted or anonymized/pseudonymized so that personal reference is no longer possible, if we want to keep certain aggregated evaluations longer. Statistical evaluations not traceable to individual persons (e.g., total number of all scans per month) we can also store permanently, as there is no personal reference.

**Technical Log and Security Data:** Server logs containing IP addresses and device information (e.g., access logs, error and crash reports) we generally retain for about 6 months. These logs primarily serve to monitor security and find errors. Longer retention only occurs in special cases – for example, if certain log entries are needed as evidence for security-relevant incidents or exceptionally legal obligations require this.

**Consent Records:** Information about granted or refused consents (as well as about revocation) we can store as long as we carry out the corresponding processing and beyond that for an appropriate period to meet our obligation to provide evidence according to Art. 5 para. 2 GDPR. Practically, this means: We record, for example, whether and when you consented to or objected to receiving the newsletter, as long as your newsletter subscription is active and afterward for a limited period. This serves to prevent accidental renewed sending and to be able to prove in case of doubt that consent existed or was revoked.

After the mentioned periods expire or as soon as the mentioned purposes cease and no other legal basis exists, we will routinely delete or permanently anonymize the corresponding data. Should you wish early deletion of certain data, you can contact us at any time – we will then check whether an obligation to continue storage prevents this and will gladly comply with your deletion request if possible.`
        },

        rights: {
          title: "9. Your Rights as a Data Subject",
          content: `As a user of the VYSN App and thus as a data subject within the meaning of the GDPR, you have the following rights. You can assert these against us at any time:

**Right to Information (Art. 15 GDPR):** You have the right to receive confirmation from us whether we process personal data about you. If this is the case, you can request information about this data. In your information request, you can receive information about the specific personal data we have stored about you, the processing purposes, the categories of processed data, the recipients or categories of recipients (if we pass on data), the planned storage duration or the criteria for determining it, as well as information about your further rights. You are also entitled to a copy of this data, which we generally provide electronically.

**Right to Rectification (Art. 16 GDPR):** You have the right to demand immediate rectification of incorrect personal data concerning you. Furthermore, you have the right to demand completion of incomplete data – e.g., through a supplementary statement. In your user profile of the app, you can update some basic data yourself; for more extensive corrections, you can contact us at any time.

**Right to Erasure (Art. 17 GDPR):** You have the right to demand that we delete your personal data, provided the legal requirements for this are met. This is the case, for example, if the data is no longer necessary for the purposes for which it was collected or processed, if you revoke consent you have given and there is no other legal basis for processing, if you legitimately object to processing (see Art. 21 GDPR), or if the data was processed unlawfully. Please note that the right to erasure may be limited if processing is necessary to fulfill a legal obligation (e.g., legal retention obligations) or in other legally regulated cases. In such cases, we do not delete the relevant data immediately but first block it and delete it permanently after the relevant period expires.

**Right to Restriction of Processing (Art. 18 GDPR):** You have the right to demand restriction of processing your personal data under certain circumstances. This means the data continues to be stored but is no longer otherwise processed (except for legally provided exceptions). Such a case exists, for example, if you dispute the accuracy of your data – then you can demand that we restrict data processing while we verify the accuracy. If you have lodged an objection according to Art. 21 GDPR against processing, you can also demand restriction for the duration of the review. You can also demand restriction instead of deletion if data was processed unlawfully but you do not want deletion, or if we no longer need your data for the actual purposes but you still need it for asserting, exercising, or defending legal claims.

**Right to Data Portability (Art. 20 GDPR):** You have the right to receive the personal data you have provided to us in a structured, commonly used, and machine-readable format, or – at your choice and as far as technically feasible – to demand direct transmission of this data to another controller. However, this right only exists for data that we process automatically based on your consent or for contract fulfillment. Data that we store, for example, due to legal obligations is not covered by this.

**Right to Object (Art. 21 GDPR):** As already mentioned above, you have the right to object to the processing of your personal data at any time, provided we process it based on legitimate interest (Art. 6 para. 1 lit. f GDPR). If you object, we will no longer process your data on this basis unless we can demonstrate compelling legitimate grounds for processing that override your interests, rights, and freedoms, or the processing serves to assert, exercise, or defend legal claims. In particular, you can object to processing for direct marketing purposes at any time – in this case, we will no longer use your personal data for advertising purposes. An informal notification to us (e.g., by email) is sufficient for objection.

**Right to Complaint to a Supervisory Authority (Art. 77 GDPR):** Without prejudice to other administrative or judicial remedies, you have the right to complain to a data protection supervisory authority if you believe that the processing of your personal data violates the GDPR. You can assert this right with the supervisory authority of your usual place of residence, workplace, or the place of the alleged violation. Generally, for companies based in Germany, the state data protection authority of the respective federal state is responsible. For us, this would be, for example, the State Commissioner for Data Protection and Freedom of Information North Rhine-Westphalia (LDI NRW). The complaint can be made informally. The supervisory authority will inform you about the status and results of your submission, including the possibility of judicial remedy.

**Exercise of Your Rights:** To exercise your above-mentioned rights, you can contact us informally at any time (see contact information below). Please note that we may request additional information if we have justified doubts about your identity to ensure that no data is released to unauthorized persons. Exercising your rights is generally free of charge for you.`
        },

        contact: {
          title: "10. Contact and Further Information",
          content: `If you have questions about this privacy policy or about the processing of your data in the VYSN App, or if you want to exercise any of your above-mentioned rights, you can contact us at any time:

VYSN GmbH – Data Protection Department
[Company address, Street No., Postal Code City]
Email: datenschutz@vysn.de
Web: www.vysn.de/datenschutz

(Note: Exact contact details, such as the complete postal address, or the name of a data protection officer will be added by the provider here if necessary.)

We will examine your request promptly and respond to you at the latest within the legally prescribed deadlines.`
        },

        updates: {
          title: "11. Currency and Changes to this Privacy Policy",
          content: `This privacy policy is dated August 2025 and is currently valid. We reserve the right to adapt the content of this declaration as needed to align it with changes to our app services or changed legal requirements. The current version of the privacy policy can be accessed at any time via our app as well as on our website at vysn.de/datenschutz. Should significant changes be made (especially those concerning consent or that could be disadvantageous for you compared to the previous version), we will draw your attention to this in an appropriate manner – e.g., within the app or by email.`
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Language Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {content[language].title}
            </h1>
            <p className="text-gray-600">
              {content[language].lastUpdated}
            </p>
          </div>
          <button
            onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {content[language].toggleButton}
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="mb-8 text-gray-700 leading-relaxed">
            {content[language].sections.intro}
          </div>

          {Object.entries(content[language].sections).map(([key, section]) => {
            if (key === 'intro') return null;
            
            return (
              <section key={key} className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}