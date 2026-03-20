const LINKS = {
  linkedin: 'https://www.linkedin.com/in/martinobettucci/',
  website: 'https://p2enjoy.studio',
};

const TEMPLATES = {
  bg: {
    subject: 'Потвърдете подписа си за AI манифеста',
    greeting: 'Здравейте {{name}},',
    greetingFallback: 'Здравейте,',
    welcome: 'Добре дошли и благодарим, че подписахте нашия манифест.',
    confirmAction: 'За да потвърдите подписа си, кликнете върху този линк:',
    privacyNotice:
      'Този имейл адрес няма да бъде съхраняван в нашата база. Използван е само за удостоверяване на реален подписал.',
    mission:
      'Нашето студио работи за отговорна и суверенна употреба на ИИ в професионалния и личния живот чрез конференции, съпровождане и обучения.',
    followIntro: 'За да следите следващите ни инициативи:',
    websiteLabel: 'Уебсайт',
    thanks:
      'Още веднъж благодарим за публично проверимата ви подкрепа към нашата кауза.',
    ignore:
      'Ако не сте инициирали тази заявка, просто игнорирайте този имейл.',
  },
  cs: {
    subject: 'Potvrďte svůj podpis manifestu AI',
    greeting: 'Dobrý den {{name}},',
    greetingFallback: 'Dobrý den,',
    welcome: 'Vítejte a děkujeme, že jste podepsal(a) náš manifest.',
    confirmAction: 'Pro potvrzení podpisu klikněte na tento odkaz:',
    privacyNotice:
      'Tato e-mailová adresa nebude uložena v naší databázi. Byla použita pouze k ověření skutečného signatáře.',
    mission:
      'Naše studio podporuje odpovědné a suverénní využití AI v pracovním i osobním životě prostřednictvím konferencí, doprovodu a školení.',
    followIntro: 'Pokud chcete sledovat naše další iniciativy:',
    websiteLabel: 'Web',
    thanks:
      'Ještě jednou děkujeme za vaši veřejně ověřitelnou podporu naší věci.',
    ignore:
      'Pokud jste tuto žádost nezadal(a), tento e-mail prosím ignorujte.',
  },
  da: {
    subject: 'Bekraeft din underskrift af AI-manifestet',
    greeting: 'Hej {{name}},',
    greetingFallback: 'Hej,',
    welcome: 'Velkommen, og tak fordi du har underskrevet vores manifest.',
    confirmAction: 'Klik pa dette link for at bekraefte din underskrift:',
    privacyNotice:
      'Denne e-mailadresse bliver ikke gemt i vores database. Den blev kun brugt til at autentificere en reel underskriver.',
    mission:
      'Vores studio arbejder for ansvarlig og suveraen brug af AI i arbejdsliv og privatliv gennem konferencer, sparring og traening.',
    followIntro: 'Foelg gerne vores naeste initiativer:',
    websiteLabel: 'Hjemmeside',
    thanks:
      'Tak igen for at give offentlig verificerbar stoette til vores sag.',
    ignore: 'Hvis du ikke stod bag denne anmodning, kan du blot ignorere denne e-mail.',
  },
  de: {
    subject: 'Bestaetigen Sie Ihre Unterschrift des KI-Manifests',
    greeting: 'Hallo {{name}},',
    greetingFallback: 'Hallo,',
    welcome: 'Willkommen und vielen Dank, dass Sie unser Manifest unterzeichnet haben.',
    confirmAction: 'Um Ihre Unterschrift zu bestaetigen, klicken Sie auf diesen Link:',
    privacyNotice:
      'Diese E-Mail-Adresse wird nicht in unserer Datenbank gespeichert. Sie wurde nur verwendet, um eine echte unterzeichnende Person zu authentifizieren.',
    mission:
      'Unser Studio setzt sich fuer einen verantwortungsvollen und souveraenen Einsatz von KI im beruflichen und persoenlichen Bereich ein, durch Konferenzen, Begleitung und Schulungen.',
    followIntro: 'Wenn Sie unsere naechsten Initiativen verfolgen moechten:',
    websiteLabel: 'Website',
    thanks:
      'Vielen Dank nochmals fuer Ihre oeffentlich nachvollziehbare Unterstuetzung unserer Sache.',
    ignore:
      'Falls diese Anfrage nicht von Ihnen stammt, ignorieren Sie diese Nachricht einfach.',
  },
  el: {
    subject: 'Επιβεβαιωστε την υπογραφη σας στο μανιφεστο AI',
    greeting: 'Γεια σας {{name}},',
    greetingFallback: 'Γεια σας,',
    welcome: 'Καλωσορισατε και ευχαριστουμε που υπογραψατε το μανιφεστο μας.',
    confirmAction:
      'Για να επιβεβαιωσετε την υπογραφη σας, πατηστε αυτο τον συνδεσμο:',
    privacyNotice:
      'Αυτη η διευθυνση email δεν θα αποθηκευτει στη βαση μας. Χρησιμοποιηθηκε μονο για να ταυτοποιησει εναν πραγματικο υπογραφοντα.',
    mission:
      'Το στουντιο μας εργαζεται για υπευθυνη και κυριαρχη χρηση της AI στον επαγγελματικο και προσωπικο χωρο με συνεδρια, υποστηριξη και εκπαιδευσεις.',
    followIntro: 'Για να ακολουθησετε τις επομενες πρωτοβουλιες μας:',
    websiteLabel: 'Ιστοσελιδα',
    thanks:
      'Σας ευχαριστουμε ξανα για την δημοσια επαληθευσιμη στηριξη στην υποθεση μας.',
    ignore:
      'Αν δεν κανατε εσεις αυτο το αιτημα, αγνοηστε απλα αυτο το μηνυμα.',
  },
  en: {
    subject: 'Confirm your AI manifesto signature',
    greeting: 'Hello {{name}},',
    greetingFallback: 'Hello,',
    welcome: 'Welcome, and thank you for signing our manifesto.',
    confirmAction: 'To confirm your signature, please click this link:',
    privacyNotice:
      'This email address will not be stored in our database. It was used only to authenticate a real signer.',
    mission:
      'Our studio works for a responsible and sovereign use of AI in professional and personal life through conferences, support, and training.',
    followIntro: 'To follow our next initiatives:',
    websiteLabel: 'Website',
    thanks:
      'Thank you again for showing publicly verifiable support for our cause.',
    ignore:
      'If you did not initiate this request, simply ignore this email.',
  },
  es: {
    subject: 'Confirme su firma del manifiesto de IA',
    greeting: 'Hola {{name}},',
    greetingFallback: 'Hola,',
    welcome: 'Bienvenido/a y gracias por firmar nuestro manifiesto.',
    confirmAction: 'Para confirmar su firma, haga clic en este enlace:',
    privacyNotice:
      'Esta direccion de correo no se conservara en nuestra base de datos. Se utilizo solo para autenticar a un firmante real.',
    mission:
      'Nuestro estudio trabaja por un uso responsable y soberano de la IA en el trabajo y en la vida personal, mediante conferencias, acompanamiento y formacion.',
    followIntro: 'Para seguir nuestras proximas iniciativas:',
    websiteLabel: 'Sitio web',
    thanks:
      'Gracias de nuevo por mostrar un apoyo publicamente verificable a nuestra causa.',
    ignore:
      'Si usted no inicio esta solicitud, simplemente ignore este mensaje.',
  },
  et: {
    subject: 'Kinnitage oma AI manifesti allkiri',
    greeting: 'Tere {{name}},',
    greetingFallback: 'Tere,',
    welcome: 'Tere tulemast ja aitah, et allkirjastasite meie manifesti.',
    confirmAction: 'Allkirja kinnitamiseks klikkige sellel lingil:',
    privacyNotice:
      'Seda e-posti aadressi meie andmebaasis ei salvestata. Seda kasutati ainult paris allakirjutaja tuvastamiseks.',
    mission:
      'Meie stuudio tegutseb AI vastutustundliku ja suveraaanse kasutuse eest too- ja eraelus konverentside, toe ning koolituste kaudu.',
    followIntro: 'Meie jargmiste algatuste jalgimiseks:',
    websiteLabel: 'Veebileht',
    thanks:
      'Aitah veel kord, et avaldasite meie eesmargile avalikult kontrollitavat toetust.',
    ignore:
      'Kui te ei algatanud seda pordingut, siis palun ignoreerige seda kirja.',
  },
  fi: {
    subject: 'Vahvista AI-manifestin allekirjoituksesi',
    greeting: 'Hei {{name}},',
    greetingFallback: 'Hei,',
    welcome: 'Tervetuloa ja kiitos, etta allekirjoitit manifestimme.',
    confirmAction: 'Vahvista allekirjoituksesi klikkaamalla tata linkkia:',
    privacyNotice:
      'Tata sahkopostiosoitetta ei tallenneta tietokantaamme. Sita kaytettiin vain aidon allekirjoittajan todentamiseen.',
    mission:
      'Studiomme edistaa tekoalyn vastuullista ja suvereenia kayttoa tyoelamassa ja arjessa konferenssien, tuen ja koulutusten avulla.',
    followIntro: 'Seurataksesi seuraavia aloitteitamme:',
    websiteLabel: 'Verkkosivusto',
    thanks:
      'Kiitos viela kerran julkisesti todennettavasta tuestasi asiallemme.',
    ignore:
      'Jos et tehnyt tata pyyntoa, voit jattaa taman viestin huomiotta.',
  },
  fr: {
    subject: 'Confirmez votre signature du manifeste IA',
    greeting: 'Bonjour {{name}},',
    greetingFallback: 'Bonjour,',
    welcome: 'Bienvenue, et merci d’avoir signe notre manifeste.',
    confirmAction: 'Pour confirmer votre signature, cliquez sur ce lien :',
    privacyNotice:
      'Cette adresse e-mail ne sera pas conservee dans notre base. Elle a ete utilisee uniquement pour authentifier un veritable signataire.',
    mission:
      'Notre studio travaille pour un usage responsable et souverain des IA dans le monde du travail et de la vie personnelle via des conferences, des accompagnements et des formations.',
    followIntro: 'Pour suivre nos prochaines initiatives :',
    websiteLabel: 'Site web',
    thanks:
      'Merci encore d’avoir montre un soutien publiquement verifiable a notre cause.',
    ignore:
      'Si vous n’etes pas a l’origine de cette demande, ignorez simplement ce message.',
  },
  ga: {
    subject: 'Dearbhaigh do shiniu ar an bhforogra AI',
    greeting: 'Dia dhuit {{name}},',
    greetingFallback: 'Dia dhuit,',
    welcome: 'Failte romhat, agus go raibh maith agat as ar bhforogra a shiniu.',
    confirmAction: 'Chun do shiniu a dhearbhU, cliceail an nasc seo:',
    privacyNotice:
      'Ni choimeadfar an seoladh riomhphoist seo inar mbunachar sonrai. Usaideadh e ach chun fior-shinitheoir a fhioru.',
    mission:
      'Ta ar stiudio ag obair ar son usaid fhreagrach agus fhlaithiuil de AI sa saol oibre agus pearsanta tri chomhdhalacha, tionlacan agus oiliuint.',
    followIntro: 'Chun leanuint lenar dtionscnaimh eile:',
    websiteLabel: 'Suibheasan',
    thanks:
      'Go raibh maith agat aris as tacaiocht phoibli infhioraithe a thabhairt dar gcuis.',
    ignore:
      'Mur tusa a chuir an t-iarratas seo isteach, dean neamhaird den teachtaireacht seo.',
  },
  hr: {
    subject: 'Potvrdite svoj potpis AI manifesta',
    greeting: 'Pozdrav {{name}},',
    greetingFallback: 'Pozdrav,',
    welcome: 'Dobrodosli i hvala sto ste potpisali nas manifest.',
    confirmAction: 'Za potvrdu potpisa kliknite na ovu poveznicu:',
    privacyNotice:
      'Ova adresa e-poste nece se pohraniti u nasoj bazi. Koristena je samo za autentikaciju stvarnog potpisnika.',
    mission:
      'Nas studio radi za odgovornu i suverenu upotrebu AI-a u poslovnom i osobnom zivotu kroz konferencije, podrsku i edukacije.',
    followIntro: 'Za pracenje nasih sljedecih inicijativa:',
    websiteLabel: 'Web stranica',
    thanks:
      'Jos jednom hvala na javno provjerljivoj podrsci nasoj inicijativi.',
    ignore:
      'Ako niste vi pokrenuli ovaj zahtjev, jednostavno zanemarite ovu poruku.',
  },
  hu: {
    subject: 'Erositse meg MI-manifesztum alairasat',
    greeting: 'Udvozoljuk {{name}},',
    greetingFallback: 'Udvozoljuk,',
    welcome: 'Udvozoljuk, es koszonjuk, hogy alairta a manifesztumunkat.',
    confirmAction: 'Az alairas megerositesehez kattintson erre a linkre:',
    privacyNotice:
      'Ezt az e-mail-cimet nem taroljuk az adatbazisunkban. Kizarolag egy valodi alairo hitelesitesere hasznaltuk.',
    mission:
      'Studio nk a MI felelos es szuveren hasznalataert dolgozik a munkahelyi es szemelyes eletben konferenciak, tamogatas es kepzesek reven.',
    followIntro: 'A kovetkezo kezdemenyezeseink kovetesehez:',
    websiteLabel: 'Weboldal',
    thanks:
      'Koszonjuk megegyszer, hogy nyilvanosan ellenorizheto modon tamogatja ugyunket.',
    ignore:
      'Ha nem On kezdemenyezte ezt a kerest, egyszeruen hagyja figyelmen kivul ezt az uzenetet.',
  },
  it: {
    subject: 'Conferma la tua firma del manifesto IA',
    greeting: 'Ciao {{name}},',
    greetingFallback: 'Ciao,',
    welcome: 'Benvenuto/a e grazie per aver firmato il nostro manifesto.',
    confirmAction: 'Per confermare la tua firma, clicca su questo link:',
    privacyNotice:
      'Questo indirizzo email non verra conservato nel nostro database. E stato usato solo per autenticare un firmatario reale.',
    mission:
      'Il nostro studio lavora per un uso responsabile e sovrano dell IA nel lavoro e nella vita personale attraverso conferenze, accompagnamento e formazione.',
    followIntro: 'Per seguire le nostre prossime iniziative:',
    websiteLabel: 'Sito web',
    thanks:
      'Grazie ancora per aver mostrato un sostegno pubblicamente verificabile alla nostra causa.',
    ignore:
      'Se non hai avviato tu questa richiesta, ignora semplicemente questo messaggio.',
  },
  lt: {
    subject: 'Patvirtinkite savo AI manifesto pasirasyma',
    greeting: 'Sveiki {{name}},',
    greetingFallback: 'Sveiki,',
    welcome: 'Sveiki atvyke ir aciu, kad pasirasyte musu manifesta.',
    confirmAction: 'Kad patvirtintumete savo pasirasyma, spauskite sia nuoroda:',
    privacyNotice:
      'Sis el. pasto adresas nebus saugomas musu duomenu bazeje. Jis buvo naudotas tik tikram pasirasiusiam asmeniui patvirtinti.',
    mission:
      'Musu studija dirba uz atsakinga ir suverenu AI naudojima darbe ir asmeniniame gyvenime per konferencijas, konsultacijas ir mokymus.',
    followIntro: 'Jei norite sekti musu kitas iniciatyvas:',
    websiteLabel: 'Svetaine',
    thanks:
      'Dar karta dekui uz viesai patikrinama parama musu idejai.',
    ignore:
      'Jei ne jus pateikete sia uzklausa, tiesiog ignoruokite si laiska.',
  },
  lv: {
    subject: 'Apstipriniet savu AI manifesta parakstu',
    greeting: 'Labdien {{name}},',
    greetingFallback: 'Labdien,',
    welcome: 'Laipni ludzam, un paldies, ka parakstijat musu manifestu.',
    confirmAction: 'Lai apstiprinatu savu parakstu, noklikskiniet uz sis saites:',
    privacyNotice:
      'Sia e-pasta adrese netiks glabata musu datubaze. Ta tika izmantota tikai ista parakstitaja autentificesanai.',
    mission:
      'Musu studija iestajas par atbildigu un suverenu AI lietojumu darba un personigaja dzive, rikojot konferences, atbalstu un apmacibas.',
    followIntro: 'Lai sekotu musu nakamajam iniciativam:',
    websiteLabel: 'Vietne',
    thanks:
      'Velreiz paldies par publiski parbaudamu atbalstu musu idejai.',
    ignore:
      'Ja jus neiesniedzat so pieprasijumu, vienkarsi ignorejiet so vestuli.',
  },
  mt: {
    subject: 'Ikkonferma l-firma tieghk tal-manifest AI',
    greeting: 'Bongu {{name}},',
    greetingFallback: 'Bongu,',
    welcome: 'Merhba, u grazzi talli ffirmajt il-manifest taghna.',
    confirmAction: 'Biex tikkonferma l-firma tieghk, ikklikkja din il-link:',
    privacyNotice:
      'Dan l-indirizz tal-email mhux se jinzamm fid-database taghna. Intuza biss biex jawtentika firmatarju veru.',
    mission:
      'L-istudio taghna jahdem ghall-uzu responsabbli u sovran tal-AI fid-dinja tax-xoghol u fil-hajja personali permezz ta konferenzi, accompagnament u tahrig.',
    followIntro: 'Biex issegwi l-inizjattivi li gejjin taghna:',
    websiteLabel: 'Websajt',
    thanks:
      'Nirringrazzjawk mill-gdid talli wrejt appogg pubblikament verifikabbli lejn il-kawza taghna.',
    ignore:
      'Jekk ma kontx int li bdejt din it-talba, injora sempliciment dan il-messagg.',
  },
  nl: {
    subject: 'Bevestig uw handtekening van het AI-manifest',
    greeting: 'Hallo {{name}},',
    greetingFallback: 'Hallo,',
    welcome: 'Welkom en dank u voor het ondertekenen van ons manifest.',
    confirmAction: 'Klik op deze link om uw handtekening te bevestigen:',
    privacyNotice:
      'Dit e-mailadres wordt niet opgeslagen in onze database. Het is uitsluitend gebruikt om een echte ondertekenaar te authenticeren.',
    mission:
      'Onze studio werkt aan verantwoord en soeverein gebruik van AI in werk en priveleven via conferenties, begeleiding en opleidingen.',
    followIntro: 'Om onze volgende initiatieven te volgen:',
    websiteLabel: 'Website',
    thanks:
      'Nogmaals dank voor uw publiek verifieerbare steun aan onze zaak.',
    ignore:
      'Als u dit verzoek niet heeft gedaan, kunt u dit bericht negeren.',
  },
  pl: {
    subject: 'Potwierdz swoj podpis manifestu AI',
    greeting: 'Witaj {{name}},',
    greetingFallback: 'Witaj,',
    welcome: 'Witamy i dziekujemy za podpisanie naszego manifestu.',
    confirmAction: 'Aby potwierdzic swoj podpis, kliknij ten link:',
    privacyNotice:
      'Ten adres e-mail nie bedzie przechowywany w naszej bazie danych. Zostal uzyty wylacznie do uwierzytelnienia prawdziwego sygnatariusza.',
    mission:
      'Nasze studio dziala na rzecz odpowiedzialnego i suwerennego wykorzystania AI w zyciu zawodowym i osobistym poprzez konferencje, wsparcie i szkolenia.',
    followIntro: 'Aby sledzic nasze kolejne inicjatywy:',
    websiteLabel: 'Strona internetowa',
    thanks:
      'Dziekujemy ponownie za publicznie weryfikowalne wsparcie naszej sprawy.',
    ignore:
      'Jesli to nie Ty wyslal(a)es to zgloszenie, po prostu zignoruj ta wiadomosc.',
  },
  pt: {
    subject: 'Confirme a sua assinatura do manifesto de IA',
    greeting: 'Ola {{name}},',
    greetingFallback: 'Ola,',
    welcome: 'Bem-vindo(a), e obrigado(a) por assinar o nosso manifesto.',
    confirmAction: 'Para confirmar a sua assinatura, clique neste link:',
    privacyNotice:
      'Este endereco de e-mail nao sera guardado na nossa base de dados. Foi usado apenas para autenticar um signatario real.',
    mission:
      'O nosso studio trabalha por um uso responsavel e soberano da IA no trabalho e na vida pessoal, atraves de conferencias, acompanhamento e formacao.',
    followIntro: 'Para acompanhar as nossas proximas iniciativas:',
    websiteLabel: 'Site',
    thanks:
      'Obrigado(a) novamente por mostrar um apoio publicamente verificavel a nossa causa.',
    ignore:
      'Se nao foi voce que iniciou este pedido, ignore simplesmente esta mensagem.',
  },
  ro: {
    subject: 'Confirmati semnatura dvs. pentru manifestul AI',
    greeting: 'Buna {{name}},',
    greetingFallback: 'Buna,',
    welcome: 'Bun venit si va multumim ca ati semnat manifestul nostru.',
    confirmAction: 'Pentru a confirma semnatura, faceti clic pe acest link:',
    privacyNotice:
      'Aceasta adresa de e-mail nu va fi pastrata in baza noastra de date. A fost folosita doar pentru a autentifica un semnatar real.',
    mission:
      'Studio-ul nostru lucreaza pentru o utilizare responsabila si suverana a AI in viata profesionala si personala, prin conferinte, insotire si formare.',
    followIntro: 'Pentru a urmari initiativele noastre viitoare:',
    websiteLabel: 'Site web',
    thanks:
      'Va multumim din nou pentru sustinerea publica verificabila a cauzei noastre.',
    ignore:
      'Daca nu dvs. ati initiat aceasta cerere, ignorati pur si simplu acest mesaj.',
  },
  sk: {
    subject: 'Potvrdte svoj podpis AI manifestu',
    greeting: 'Dobry den {{name}},',
    greetingFallback: 'Dobry den,',
    welcome: 'Vitajte a dakujeme, ze ste podpisali nas manifest.',
    confirmAction: 'Na potvrdenie podpisu kliknite na tento odkaz:',
    privacyNotice:
      'Tato e-mailova adresa sa nebude uchovavat v nasej databaze. Bola pouzita iba na overenie skutocneho signatara.',
    mission:
      'Nas studio podporuje zodpovedne a suverenne vyuzivanie AI v pracovnom aj osobnom zivote cez konferencie, sprevadzanie a skolenia.',
    followIntro: 'Ak chcete sledovat nase dalsie iniciativy:',
    websiteLabel: 'Web',
    thanks:
      'Este raz dakujeme za verejne overitelnu podporu nasej veci.',
    ignore:
      'Ak ste tuto poziadavku nezadali vy, jednoducho tento e-mail ignorujte.',
  },
  sl: {
    subject: 'Potrdite svoj podpis AI manifesta',
    greeting: 'Pozdravljeni {{name}},',
    greetingFallback: 'Pozdravljeni,',
    welcome: 'Dobrodosli in hvala, ker ste podpisali nas manifest.',
    confirmAction: 'Za potrditev podpisa kliknite to povezavo:',
    privacyNotice:
      'Ta e-postni naslov ne bo shranjen v nasi bazi. Uporabljen je bil le za preverjanje resnicnega podpisnika.',
    mission:
      'Nas studio si prizadeva za odgovorno in suvereno rabo AI v poklicnem in osebnem zivljenju s konferencami, podporo in izobrazevanji.',
    followIntro: 'Ce zelite spremljati nase naslednje pobude:',
    websiteLabel: 'Spletna stran',
    thanks:
      'Se enkrat hvala za javno preverljivo podporo nasi stvari.',
    ignore:
      'Ce te zahteve niste sprozili vi, to sporocilo preprosto prezrite.',
  },
  sv: {
    subject: 'Bekrafta din signatur av AI-manifestet',
    greeting: 'Hej {{name}},',
    greetingFallback: 'Hej,',
    welcome: 'Valkommen, och tack for att du skrev under vart manifest.',
    confirmAction: 'For att bekrafta din signatur, klicka pa den har lanken:',
    privacyNotice:
      'Denna e-postadress sparas inte i var databas. Den anvandes endast for att autentisera en verklig undertecknare.',
    mission:
      'Vart studio arbetar for ansvarsfull och suveran anvandning av AI i arbetsliv och privatliv genom konferenser, stod och utbildningar.',
    followIntro: 'For att folja vara kommande initiativ:',
    websiteLabel: 'Webbplats',
    thanks:
      'Tack igen for att du visat offentligt verifierbart stod for var sak.',
    ignore:
      'Om du inte initierade den har begaran kan du helt enkelt ignorera detta meddelande.',
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function resolveTemplate(locale) {
  return TEMPLATES[locale] ?? TEMPLATES.fr;
}

function resolveGreeting(template, fullName) {
  const safeName = typeof fullName === 'string' ? fullName.trim() : '';

  if (!safeName) {
    return template.greetingFallback;
  }

  return template.greeting.replace('{{name}}', safeName);
}

export function buildVerificationEmail({ locale, fullName, verifyUrl }) {
  const template = resolveTemplate(locale);
  const greeting = resolveGreeting(template, fullName);
  const safeVerifyUrl = String(verifyUrl);
  const escapedGreeting = escapeHtml(greeting);
  const escapedVerifyUrl = escapeHtml(safeVerifyUrl);

  const text = [
    greeting,
    '',
    template.welcome,
    template.confirmAction,
    safeVerifyUrl,
    '',
    template.privacyNotice,
    '',
    template.mission,
    '',
    template.followIntro,
    `LinkedIn: ${LINKS.linkedin}`,
    `${template.websiteLabel}: ${LINKS.website}`,
    '',
    template.thanks,
    '',
    template.ignore,
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
      <p>${escapedGreeting}</p>
      <p>${escapeHtml(template.welcome)}</p>
      <p>${escapeHtml(template.confirmAction)}</p>
      <p><a href="${escapedVerifyUrl}">${escapedVerifyUrl}</a></p>
      <p>${escapeHtml(template.privacyNotice)}</p>
      <p>${escapeHtml(template.mission)}</p>
      <p>${escapeHtml(template.followIntro)}</p>
      <p>LinkedIn: <a href="${LINKS.linkedin}">${LINKS.linkedin}</a><br />${escapeHtml(template.websiteLabel)}: <a href="${LINKS.website}">${LINKS.website}</a></p>
      <p>${escapeHtml(template.thanks)}</p>
      <p>${escapeHtml(template.ignore)}</p>
    </div>
  `;

  return {
    subject: template.subject,
    text,
    html,
  };
}

export function buildAdminMagicLinkEmail({ magicLink, expiresInMinutes }) {
  const safeMagicLink = String(magicLink);
  const safeExpiresInMinutes = Number.isFinite(expiresInMinutes) ? expiresInMinutes : 15;
  const escapedMagicLink = escapeHtml(safeMagicLink);

  const subject = 'Connexion backoffice Manifesto IA';
  const text = [
    'Bonjour,',
    '',
    'Une demande de connexion au backoffice a ete initiee.',
    'Cliquez sur ce lien magique pour vous authentifier :',
    safeMagicLink,
    '',
    `Ce lien expire dans ${safeExpiresInMinutes} minutes et ne peut etre utilise qu'une seule fois.`,
    '',
    "Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.",
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
      <p>Bonjour,</p>
      <p>Une demande de connexion au backoffice a ete initiee.</p>
      <p>Cliquez sur ce lien magique pour vous authentifier :</p>
      <p><a href="${escapedMagicLink}">${escapedMagicLink}</a></p>
      <p>Ce lien expire dans ${safeExpiresInMinutes} minutes et ne peut etre utilise qu'une seule fois.</p>
      <p>Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.</p>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}
