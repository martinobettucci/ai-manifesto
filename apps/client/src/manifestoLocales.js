import { DEFAULT_MANIFESTO } from './manifestoText.js';

function getLanguageCode(locale) {
  return locale?.split('-')[0]?.toLowerCase() ?? 'fr';
}

function toCommitments(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      recognize: typeof item?.recognize === 'string' ? item.recognize.trim() : '',
      act: typeof item?.act === 'string' ? item.act.trim() : '',
    }))
    .filter((item) => item.recognize && item.act);
}

const DEFAULT_EXTRA_COMMITMENTS = DEFAULT_MANIFESTO.commitments.slice(6);

const MANIFESTO_DETAILS = {
  fr: {
    extraCommitments: DEFAULT_EXTRA_COMMITMENTS,
    positionTitle: DEFAULT_MANIFESTO.positionTitle,
    positionLines: DEFAULT_MANIFESTO.positionLines,
    engagementTitle: DEFAULT_MANIFESTO.engagementTitle,
    engagementLines: DEFAULT_MANIFESTO.engagementLines,
  },
  en: {
    extraCommitments: [
      {
        recognize:
          'I recognize that some systems already influence how we perceive facts and possible options.',
        act: 'I warn that a dominant answer is not a neutral answer.',
      },
      {
        recognize:
          'I recognize that these technologies evolve under economic, political, and geopolitical constraints.',
        act: 'I warn that their neutrality can never be considered guaranteed.',
      },
      {
        recognize:
          'I recognize that preserving my freedom of judgment requires **active effort**.',
        act:
          'I act by maintaining human exchanges, listening to situated expertise, and reconsidering what AI presents to me as plausible.',
      },
    ],
    positionTitle: 'FUNDAMENTAL POSITION',
    positionLines: [
      'I recognize that AI comes from the knowledge accumulated by billions of human beings.',
      'I act by restoring value to that human, embodied, and contextualized experience.',
      'I refuse to replace my judgment with a synthetic answer, even a relevant one.',
      'I refuse to delegate my thinking out of comfort.',
      'I affirm a clear line:',
      '**AI helps me think.**',
      '**It does not think in my place.**',
    ],
    engagementTitle: 'FINAL COMMITMENT',
    engagementLines: [
      'Before AI, I would ask a human.',
      'After AI, I commit not to forget to do so.',
      'Above all, I commit to truly listening.',
      'Because my freedom does not disappear all at once.',
      '**It erodes when I stop exercising my judgment.**',
      '*And I refuse that erosion.*',
    ],
  },
  de: {
    extraCommitments: [
      {
        recognize:
          'Ich erkenne an, dass manche Systeme bereits beeinflussen, wie wir Fakten und mögliche Optionen wahrnehmen.',
        act: 'Ich warne davor, dass eine dominante Antwort keine neutrale Antwort ist.',
      },
      {
        recognize:
          'Ich erkenne an, dass sich diese Technologien unter wirtschaftlichen, politischen und geopolitischen Zwängen entwickeln.',
        act: 'Ich warne davor, ihre Neutralität jemals als gesichert anzusehen.',
      },
      {
        recognize:
          'Ich erkenne an, dass die Bewahrung meiner Urteilsfreiheit **aktive Anstrengung** verlangt.',
        act:
          'Ich handle, indem ich menschliche Gespräche aufrechterhalte, situierten Expertisen zuhöre und neu prüfe, was die KI mir als plausibel präsentiert.',
      },
    ],
    positionTitle: 'GRUNDPOSITION',
    positionLines: [
      'Ich erkenne an, dass KI aus dem von Milliarden Menschen angesammelten Wissen hervorgeht.',
      'Ich handle, indem ich dieser menschlichen, verkörperten und kontextualisierten Erfahrung wieder Wert gebe.',
      'Ich weigere mich, mein Urteil durch eine synthetische Antwort zu ersetzen, selbst wenn sie relevant ist.',
      'Ich weigere mich, mein Denken aus Bequemlichkeit zu delegieren.',
      'Ich ziehe eine klare Linie:',
      '**KI hilft mir zu denken.**',
      '**Sie denkt nicht an meiner Stelle.**',
    ],
    engagementTitle: 'SCHLUSSVERPFLICHTUNG',
    engagementLines: [
      'Vor der KI fragte ich einen Menschen.',
      'Nach der KI verpflichte ich mich, das nicht zu vergessen.',
      'Vor allem verpflichte ich mich, wirklich zuzuhören.',
      'Denn meine Freiheit verschwindet nicht auf einmal.',
      '**Sie erodiert, wenn ich aufhöre, mein Urteil auszuüben.**',
      '*Und ich verweigere diese Erosion.*',
    ],
  },
  es: {
    extraCommitments: [
      {
        recognize:
          'Reconozco que algunos sistemas ya influyen en la forma en que percibimos los hechos y las opciones posibles.',
        act: 'Advierto que una respuesta dominante no es una respuesta neutral.',
      },
      {
        recognize:
          'Reconozco que estas tecnologías evolucionan bajo restricciones económicas, políticas y geopolíticas.',
        act: 'Advierto que su neutralidad nunca puede darse por garantizada.',
      },
      {
        recognize:
          'Reconozco que preservar mi libertad de juicio exige un **esfuerzo activo**.',
        act:
          'Actúo manteniendo intercambios humanos, escuchando conocimientos situados y reconsiderando lo que la IA me presenta como plausible.',
      },
    ],
    positionTitle: 'POSICIÓN FUNDAMENTAL',
    positionLines: [
      'Reconozco que la IA surge del saber acumulado por miles de millones de seres humanos.',
      'Actúo devolviendo valor a esa experiencia humana, encarnada y contextualizada.',
      'Me niego a sustituir mi juicio por una respuesta sintética, incluso pertinente.',
      'Me niego a delegar mi pensamiento por comodidad.',
      'Afirmo una línea clara:',
      '**La IA me ayuda a pensar.**',
      '**No piensa en mi lugar.**',
    ],
    engagementTitle: 'COMPROMISO FINAL',
    engagementLines: [
      'Antes de la IA, pedía ayuda a una persona.',
      'Después de la IA, me comprometo a no olvidar hacerlo.',
      'Sobre todo, me comprometo a escuchar de verdad.',
      'Porque mi libertad no desaparece de golpe.',
      '**Se erosiona cuando dejo de ejercer mi juicio.**',
      '*Y rechazo esa erosión.*',
    ],
  },
  it: {
    extraCommitments: [
      {
        recognize:
          'Riconosco che alcuni sistemi influenzano già il modo in cui percepiamo i fatti e le opzioni possibili.',
        act: 'Avverto che una risposta dominante non è una risposta neutrale.',
      },
      {
        recognize:
          'Riconosco che queste tecnologie evolvono sotto vincoli economici, politici e geopolitici.',
        act: 'Avverto che la loro neutralità non può mai essere considerata acquisita.',
      },
      {
        recognize:
          'Riconosco che preservare la mia libertà di giudizio richiede uno **sforzo attivo**.',
        act:
          'Agisco mantenendo scambi umani, ascoltando le competenze situate e riconsiderando ciò che l’IA mi presenta come plausibile.',
      },
    ],
    positionTitle: 'POSIZIONE FONDAMENTALE',
    positionLines: [
      'Riconosco che l’IA nasce dal sapere accumulato da miliardi di esseri umani.',
      'Agisco restituendo valore a questa esperienza umana, incarnata e contestualizzata.',
      'Rifiuto di sostituire il mio giudizio con una risposta sintetica, anche se pertinente.',
      'Rifiuto di delegare il mio pensiero per comodità.',
      'Affermo una linea chiara:',
      '**L’IA mi aiuta a pensare.**',
      '**Non pensa al posto mio.**',
    ],
    engagementTitle: 'IMPEGNO FINALE',
    engagementLines: [
      'Prima dell’IA, chiedevo a un essere umano.',
      'Dopo l’IA, mi impegno a non dimenticarlo.',
      'Soprattutto, mi impegno ad ascoltare davvero.',
      'Perché la mia libertà non scompare di colpo.',
      '**Si erode quando smetto di esercitare il mio giudizio.**',
      '*E io rifiuto questa erosione.*',
    ],
  },
  pt: {
    extraCommitments: [
      {
        recognize:
          'Reconheço que alguns sistemas já influenciam a forma como percebemos os factos e as opções possíveis.',
        act: 'Alerto para o facto de uma resposta dominante não ser uma resposta neutra.',
      },
      {
        recognize:
          'Reconheço que estas tecnologias evoluem sob restrições económicas, políticas e geopolíticas.',
        act: 'Alerto para o facto de a sua neutralidade nunca poder ser considerada garantida.',
      },
      {
        recognize:
          'Reconheço que preservar a minha liberdade de julgamento exige um **esforço ativo**.',
        act:
          'Ajo mantendo trocas humanas, ouvindo conhecimentos situados e reconsiderando aquilo que a IA me apresenta como plausível.',
      },
    ],
    positionTitle: 'POSIÇÃO FUNDAMENTAL',
    positionLines: [
      'Reconheço que a IA resulta do saber acumulado por milhares de milhões de seres humanos.',
      'Ajo devolvendo valor a essa experiência humana, encarnada e contextualizada.',
      'Recuso substituir o meu julgamento por uma resposta sintética, mesmo pertinente.',
      'Recuso delegar o meu pensamento por conforto.',
      'Afirmo uma linha clara:',
      '**A IA ajuda-me a pensar.**',
      '**Não pensa por mim.**',
    ],
    engagementTitle: 'COMPROMISSO FINAL',
    engagementLines: [
      'Antes da IA, eu perguntava a um ser humano.',
      'Depois da IA, comprometo-me a não me esquecer de o fazer.',
      'Sobretudo, comprometo-me a escutar de verdade.',
      'Porque a minha liberdade não desaparece de uma vez.',
      '**Ela corrói-se quando deixo de exercer o meu julgamento.**',
      '*E eu recuso essa erosão.*',
    ],
  },
  nl: {
    extraCommitments: [
      {
        recognize:
          'Ik erken dat sommige systemen nu al beïnvloeden hoe wij feiten en mogelijke opties waarnemen.',
        act: 'Ik waarschuw dat een dominant antwoord geen neutraal antwoord is.',
      },
      {
        recognize:
          'Ik erken dat deze technologieën zich ontwikkelen onder economische, politieke en geopolitieke druk.',
        act: 'Ik waarschuw dat hun neutraliteit nooit als verworven mag worden beschouwd.',
      },
      {
        recognize:
          'Ik erken dat het bewaren van mijn oordeelsvrijheid een **actieve inspanning** vraagt.',
        act:
          'Ik handel door menselijke uitwisselingen te onderhouden, naar gesitueerde expertise te luisteren en te heroverwegen wat AI mij als plausibel voorlegt.',
      },
    ],
    positionTitle: 'FUNDAMENTELE POSITIE',
    positionLines: [
      'Ik erken dat AI voortkomt uit de kennis die door miljarden mensen is opgebouwd.',
      'Ik handel door die menselijke, belichaamde en gecontextualiseerde ervaring opnieuw waarde te geven.',
      'Ik weiger mijn oordeel te vervangen door een synthetisch antwoord, zelfs als het relevant is.',
      'Ik weiger mijn denken uit gemak uit te besteden.',
      'Ik trek een duidelijke lijn:',
      '**AI helpt mij denken.**',
      '**Het denkt niet in mijn plaats.**',
    ],
    engagementTitle: 'SLOTVERBINTENIS',
    engagementLines: [
      'Vóór AI vroeg ik een mens.',
      'Na AI verbind ik mij ertoe dat niet te vergeten.',
      'Vooral verbind ik mij ertoe echt te luisteren.',
      'Want mijn vrijheid verdwijnt niet in één keer.',
      '**Ze erodeert wanneer ik ophoud mijn oordeel uit te oefenen.**',
      '*En ik weiger die erosie.*',
    ],
  },
  sv: {
    extraCommitments: [
      {
        recognize:
          'Jag erkänner att vissa system redan påverkar hur vi uppfattar fakta och möjliga alternativ.',
        act: 'Jag varnar för att ett dominerande svar inte är ett neutralt svar.',
      },
      {
        recognize:
          'Jag erkänner att dessa teknologier utvecklas under ekonomiska, politiska och geopolitiska begränsningar.',
        act: 'Jag varnar för att deras neutralitet aldrig kan tas för given.',
      },
      {
        recognize:
          'Jag erkänner att det krävs en **aktiv ansträngning** för att bevara min omdömesfrihet.',
        act:
          'Jag agerar genom att hålla mänskliga utbyten levande, lyssna på situerad expertis och ompröva det som AI presenterar som plausibelt.',
      },
    ],
    positionTitle: 'GRUNDLÄGGANDE STÅNDPUNKT',
    positionLines: [
      'Jag erkänner att AI kommer ur den kunskap som samlats av miljarder människor.',
      'Jag agerar genom att återge värde åt denna mänskliga, förkroppsligade och kontextualiserade erfarenhet.',
      'Jag vägrar att ersätta mitt omdöme med ett syntetiskt svar, även ett relevant sådant.',
      'Jag vägrar att delegera mitt tänkande av bekvämlighet.',
      'Jag slår fast en tydlig linje:',
      '**AI hjälper mig att tänka.**',
      '**Det tänker inte i mitt ställe.**',
    ],
    engagementTitle: 'SLUTLIGT ÅTAGANDE',
    engagementLines: [
      'Före AI frågade jag en människa.',
      'Efter AI förbinder jag mig att inte glömma att göra det.',
      'Framför allt förbinder jag mig att verkligen lyssna.',
      'För min frihet försvinner inte plötsligt.',
      '**Den eroderar när jag slutar utöva mitt omdöme.**',
      '*Och jag vägrar den erosionen.*',
    ],
  },
  da: {
    extraCommitments: [
      {
        recognize:
          'Jeg anerkender, at visse systemer allerede påvirker, hvordan vi opfatter fakta og mulige valg.',
        act: 'Jeg advarer om, at et dominerende svar ikke er et neutralt svar.',
      },
      {
        recognize:
          'Jeg anerkender, at disse teknologier udvikler sig under økonomiske, politiske og geopolitiske begrænsninger.',
        act: 'Jeg advarer om, at deres neutralitet aldrig kan betragtes som givet.',
      },
      {
        recognize:
          'Jeg anerkender, at bevarelsen af min dømmekraft kræver en **aktiv indsats**.',
        act:
          'Jeg handler ved at fastholde menneskelige udvekslinger, lytte til situeret ekspertise og genoverveje det, som AI præsenterer som plausibelt.',
      },
    ],
    positionTitle: 'GRUNDLÆGGENDE POSITION',
    positionLines: [
      'Jeg anerkender, at AI kommer af den viden, som milliarder af mennesker har opbygget.',
      'Jeg handler ved at give værdi tilbage til denne menneskelige, legemliggjorte og kontekstualiserede erfaring.',
      'Jeg nægter at erstatte min dømmekraft med et syntetisk svar, selv et relevant et.',
      'Jeg nægter at delegere min tænkning af bekvemmelighed.',
      'Jeg fastslår en klar linje:',
      '**AI hjælper mig med at tænke.**',
      '**Det tænker ikke i mit sted.**',
    ],
    engagementTitle: 'AFSLUTTENDE FORPLIGTELSE',
    engagementLines: [
      'Før AI spurgte jeg et menneske.',
      'Efter AI forpligter jeg mig til ikke at glemme at gøre det.',
      'Frem for alt forpligter jeg mig til virkelig at lytte.',
      'For min frihed forsvinder ikke på én gang.',
      '**Den nedbrydes, når jeg holder op med at udøve min dømmekraft.**',
      '*Og den nedbrydning afviser jeg.*',
    ],
  },
  fi: {
    extraCommitments: [
      {
        recognize:
          'Tunnustan, että jotkin järjestelmät vaikuttavat jo siihen, miten havaitsemme tosiasiat ja mahdolliset vaihtoehdot.',
        act: 'Varoitan siitä, että hallitseva vastaus ei ole neutraali vastaus.',
      },
      {
        recognize:
          'Tunnustan, että nämä teknologiat kehittyvät taloudellisten, poliittisten ja geopoliittisten rajoitteiden alla.',
        act: 'Varoitan siitä, ettei niiden neutraaliutta voi koskaan pitää itsestään selvänä.',
      },
      {
        recognize:
          'Tunnustan, että arvostelukykyni vapauden säilyttäminen vaatii **aktiivista ponnistelua**.',
        act:
          'Toimin ylläpitämällä inhimillisiä vaihdoksia, kuuntelemalla paikantunutta asiantuntemusta ja arvioimalla uudelleen sitä, mitä tekoäly esittää minulle uskottavana.',
      },
    ],
    positionTitle: 'PERUSKANTA',
    positionLines: [
      'Tunnustan, että tekoäly syntyy miljardien ihmisten kerryttämästä tiedosta.',
      'Toimin palauttamalla arvoa tälle inhimilliselle, ruumiillistuneelle ja kontekstualisoidulle kokemukselle.',
      'Kieltäydyn korvaamasta omaa harkintaani synteettisellä vastauksella, vaikka se olisi osuva.',
      'Kieltäydyn ulkoistamasta ajatteluani mukavuuden vuoksi.',
      'Vahvistan selkeän linjan:',
      '**Tekoäly auttaa minua ajattelemaan.**',
      '**Se ei ajattele puolestani.**',
    ],
    engagementTitle: 'LOPULLINEN SITOUMUS',
    engagementLines: [
      'Ennen tekoälyä kysyin ihmiseltä.',
      'Tekoälyn jälkeen sitoudun olemaan unohtamatta sitä.',
      'Ennen kaikkea sitoudun kuuntelemaan oikeasti.',
      'Sillä vapauteni ei katoa yhdellä kertaa.',
      '**Se rapautuu, kun lakkaan käyttämästä omaa harkintaani.**',
      '*Ja tämän rapautumisen torjun.*',
    ],
  },
  et: {
    extraCommitments: [
      {
        recognize:
          'Tunnistan, et mõned süsteemid mõjutavad juba seda, kuidas me tajume fakte ja võimalikke valikuid.',
        act: 'Hoiatan, et domineeriv vastus ei ole neutraalne vastus.',
      },
      {
        recognize:
          'Tunnistan, et need tehnoloogiad arenevad majanduslike, poliitiliste ja geopoliitiliste piirangute all.',
        act: 'Hoiatan, et nende neutraalsust ei saa kunagi pidada iseenesestmõistetavaks.',
      },
      {
        recognize:
          'Tunnistan, et oma otsustusvabaduse säilitamine nõuab **aktiivset pingutust**.',
        act:
          'Tegutsen, hoides alles inimlikke vahetusi, kuulates situatiivset asjatundlikkust ja hinnates ümber seda, mida tehisintellekt mulle usutavana esitab.',
      },
    ],
    positionTitle: 'PÕHILINE SEISUKOHT',
    positionLines: [
      'Tunnistan, et tehisintellekt sünnib miljardite inimeste kogunenud teadmistest.',
      'Tegutsen, andes sellele inimlikule, kehastunud ja kontekstualiseeritud kogemusele taas väärtuse.',
      'Keeldun asendamast oma otsust sünteetilise vastusega, isegi kui see on asjakohane.',
      'Keeldun mugavuse tõttu oma mõtlemist delegeerimast.',
      'Kinnitan selge joone:',
      '**Tehisintellekt aitab mul mõelda.**',
      '**See ei mõtle minu eest.**',
    ],
    engagementTitle: 'LÕPLIK PÜHENDUMUS',
    engagementLines: [
      'Enne tehisintellekti küsisin inimeselt.',
      'Pärast tehisintellekti kohustun seda mitte unustama.',
      'Kõige enam kohustun ma päriselt kuulama.',
      'Sest mu vabadus ei kao korraga.',
      '**See kulub siis, kui ma lakan oma otsustusvõimet kasutamast.**',
      '*Ja ma keeldun sellest kulumisest.*',
    ],
  },
  lv: {
    extraCommitments: [
      {
        recognize:
          'Es atzīstu, ka dažas sistēmas jau ietekmē to, kā mēs uztveram faktus un iespējamās izvēles.',
        act: 'Es brīdinu, ka dominējoša atbilde nav neitrāla atbilde.',
      },
      {
        recognize:
          'Es atzīstu, ka šīs tehnoloģijas attīstās ekonomisku, politisku un ģeopolitisku ierobežojumu ietekmē.',
        act: 'Es brīdinu, ka to neitralitāti nekad nevar uzskatīt par pašsaprotamu.',
      },
      {
        recognize:
          'Es atzīstu, ka manas spriestspējas brīvības saglabāšana prasa **aktīvu piepūli**.',
        act:
          'Es rīkojos, uzturot cilvēciskas sarunas, uzklausot situētu ekspertīzi un pārskatot to, ko MI man pasniedz kā ticamu.',
      },
    ],
    positionTitle: 'PAMATPOZĪCIJA',
    positionLines: [
      'Es atzīstu, ka MI rodas no miljardu cilvēku uzkrātajām zināšanām.',
      'Es rīkojos, atjaunojot vērtību šai cilvēciskajai, iemiesotajai un kontekstualizētajai pieredzei.',
      'Es atsakos aizstāt savu spriedumu ar sintētisku atbildi, pat ja tā ir atbilstoša.',
      'Es atsakos ērtības dēļ deleģēt savu domāšanu.',
      'Es nosaku skaidru robežu:',
      '**MI palīdz man domāt.**',
      '**Tas nedomā manā vietā.**',
    ],
    engagementTitle: 'NOSLĒGUMA APŅEMŠANĀS',
    engagementLines: [
      'Pirms MI es jautāju cilvēkam.',
      'Pēc MI es apņemos to neaizmirst.',
      'Visvairāk es apņemos patiesi klausīties.',
      'Jo mana brīvība nepazūd vienā brīdī.',
      '**Tā erodējas, kad es pārstāju īstenot savu spriedumu.**',
      '*Un es atsakos no šīs erozijas.*',
    ],
  },
  lt: {
    extraCommitments: [
      {
        recognize:
          'Pripažįstu, kad kai kurios sistemos jau daro įtaką tam, kaip suvokiame faktus ir galimas galimybes.',
        act: 'Įspėju, kad dominuojantis atsakymas nėra neutralus atsakymas.',
      },
      {
        recognize:
          'Pripažįstu, kad šios technologijos vystosi ekonominių, politinių ir geopolitinių suvaržymų sąlygomis.',
        act: 'Įspėju, kad jų neutralumas niekada negali būti laikomas savaime suprantamu.',
      },
      {
        recognize:
          'Pripažįstu, kad mano sprendimo laisvės išsaugojimas reikalauja **aktyvių pastangų**.',
        act:
          'Veikiu palaikydamas žmogiškus mainus, klausydamasis situacinės ekspertizės ir iš naujo vertindamas tai, ką DI man pateikia kaip tikėtina.',
      },
    ],
    positionTitle: 'PAGRINDINĖ POZICIJA',
    positionLines: [
      'Pripažįstu, kad DI kyla iš milijardų žmonių sukauptų žinių.',
      'Veikiu grąžindamas vertę šiai žmogiškai, įkūnytai ir kontekstualizuotai patirčiai.',
      'Atsisakau pakeisti savo sprendimą sintetiniu atsakymu, net jei jis tinkamas.',
      'Atsisakau deleguoti savo mąstymą dėl patogumo.',
      'Nubrėžiu aiškią ribą:',
      '**DI padeda man mąstyti.**',
      '**Jis nemąsto už mane.**',
    ],
    engagementTitle: 'GALUTINIS ĮSIPAREIGOJIMAS',
    engagementLines: [
      'Prieš DI aš klausdavau žmogaus.',
      'Po DI įsipareigoju to nepamiršti.',
      'Svarbiausia, įsipareigoju iš tikrųjų klausytis.',
      'Nes mano laisvė nedingsta staiga.',
      '**Ji nyksta, kai nustojų naudotis savo sprendimu.**',
      '*Ir aš atsisakau šio nykimo.*',
    ],
  },
  pl: {
    extraCommitments: [
      {
        recognize:
          'Uznaję, że niektóre systemy już wpływają na to, jak postrzegamy fakty i możliwe opcje.',
        act: 'Ostrzegam, że dominująca odpowiedź nie jest odpowiedzią neutralną.',
      },
      {
        recognize:
          'Uznaję, że te technologie rozwijają się pod presją uwarunkowań ekonomicznych, politycznych i geopolitycznych.',
        act: 'Ostrzegam, że ich neutralności nigdy nie można uznać za gwarantowaną.',
      },
      {
        recognize:
          'Uznaję, że zachowanie wolności osądu wymaga **aktywnego wysiłku**.',
        act:
          'Działam, utrzymując ludzkie relacje, słuchając usytuowanej ekspertyzy i ponownie rozważając to, co AI przedstawia mi jako wiarygodne.',
      },
    ],
    positionTitle: 'PODSTAWOWE STANOWISKO',
    positionLines: [
      'Uznaję, że AI wyrasta z wiedzy zgromadzonej przez miliardy ludzi.',
      'Działam, przywracając wartość temu ludzkiemu, ucieleśnionemu i osadzonemu w kontekście doświadczeniu.',
      'Odmawiam zastąpienia własnego osądu syntetyczną odpowiedzią, nawet trafną.',
      'Odmawiam delegowania własnego myślenia z wygody.',
      'Wyznaczam jasną granicę:',
      '**AI pomaga mi myśleć.**',
      '**Nie myśli za mnie.**',
    ],
    engagementTitle: 'KOŃCOWE ZOBOWIĄZANIE',
    engagementLines: [
      'Przed AI pytałem człowieka.',
      'Po AI zobowiązuję się o tym nie zapominać.',
      'Przede wszystkim zobowiązuję się naprawdę słuchać.',
      'Bo moja wolność nie znika od razu.',
      '**Eroduje, gdy przestaję ćwiczyć własny osąd.**',
      '*I odrzucam tę erozję.*',
    ],
  },
  cs: {
    extraCommitments: [
      {
        recognize:
          'Uznávám, že některé systémy již ovlivňují to, jak vnímáme fakta a možné volby.',
        act: 'Varuji, že dominantní odpověď není neutrální odpověď.',
      },
      {
        recognize:
          'Uznávám, že se tyto technologie vyvíjejí pod ekonomickými, politickými a geopolitickými omezeními.',
        act: 'Varuji, že jejich neutralitu nikdy nelze považovat za samozřejmou.',
      },
      {
        recognize:
          'Uznávám, že zachování svobody úsudku vyžaduje **aktivní úsilí**.',
        act:
          'Jednám tak, že udržuji lidské výměny, naslouchám situované expertize a znovu posuzuji to, co mi AI předkládá jako věrohodné.',
      },
    ],
    positionTitle: 'ZÁKLADNÍ POZICE',
    positionLines: [
      'Uznávám, že AI vychází ze znalostí nahromaděných miliardami lidí.',
      'Jednám tak, že znovu vracím hodnotu této lidské, ztělesněné a kontextualizované zkušenosti.',
      'Odmítám nahradit svůj úsudek syntetickou odpovědí, i kdyby byla relevantní.',
      'Odmítám delegovat své myšlení z pohodlnosti.',
      'Vymezuji jasnou linii:',
      '**AI mi pomáhá myslet.**',
      '**Nemyslí za mě.**',
    ],
    engagementTitle: 'ZÁVĚREČNÝ ZÁVAZEK',
    engagementLines: [
      'Před AI jsem se ptal člověka.',
      'Po AI se zavazuji, že na to nezapomenu.',
      'Především se zavazuji skutečně naslouchat.',
      'Protože moje svoboda nemizí najednou.',
      '**Eroduje, když přestanu uplatňovat svůj úsudek.**',
      '*A tuto erozi odmítám.*',
    ],
  },
  sk: {
    extraCommitments: [
      {
        recognize:
          'Uznávam, že niektoré systémy už ovplyvňujú to, ako vnímame fakty a možné voľby.',
        act: 'Upozorňujem, že dominantná odpoveď nie je neutrálna odpoveď.',
      },
      {
        recognize:
          'Uznávam, že tieto technológie sa vyvíjajú pod ekonomickými, politickými a geopolitickými tlakmi.',
        act: 'Upozorňujem, že ich neutralitu nikdy nemožno považovať za samozrejmú.',
      },
      {
        recognize:
          'Uznávam, že zachovanie mojej slobody úsudku si vyžaduje **aktívne úsilie**.',
        act:
          'Konám tak, že udržiavam ľudské výmeny, počúvam situovanú expertízu a znovu zvažujem to, čo mi AI predkladá ako pravdepodobné.',
      },
    ],
    positionTitle: 'ZÁKLADNÁ POZÍCIA',
    positionLines: [
      'Uznávam, že AI vzniká zo znalostí nahromadených miliardami ľudí.',
      'Konám tak, že vraciam hodnotu tejto ľudskej, vtelesnenej a kontextualizovanej skúsenosti.',
      'Odmietam nahradiť svoj úsudok syntetickou odpoveďou, aj keď je relevantná.',
      'Odmietam delegovať svoje myslenie z pohodlia.',
      'Stanovujem jasnú líniu:',
      '**AI mi pomáha myslieť.**',
      '**Nemyslí namiesto mňa.**',
    ],
    engagementTitle: 'ZÁVEREČNÝ ZÁVÄZOK',
    engagementLines: [
      'Pred AI som sa pýtal človeka.',
      'Po AI sa zaväzujem, že na to nezabudnem.',
      'Predovšetkým sa zaväzujem naozaj počúvať.',
      'Pretože moja sloboda nezmizne naraz.',
      '**Eroduje, keď prestanem uplatňovať vlastný úsudok.**',
      '*A túto eróziu odmietam.*',
    ],
  },
  sl: {
    extraCommitments: [
      {
        recognize:
          'Priznavam, da nekateri sistemi že vplivajo na to, kako dojemamo dejstva in možne izbire.',
        act: 'Opozarjam, da prevladujoč odgovor ni nevtralen odgovor.',
      },
      {
        recognize:
          'Priznavam, da se te tehnologije razvijajo pod gospodarskimi, političnimi in geopolitičnimi omejitvami.',
        act: 'Opozarjam, da njihove nevtralnosti nikoli ne moremo imeti za samoumevno.',
      },
      {
        recognize:
          'Priznavam, da ohranitev moje svobode presoje zahteva **dejaven napor**.',
        act:
          'Ukrepam tako, da ohranjam človeške izmenjave, poslušam umeščeno strokovnost in ponovno premislim o tem, kar mi UI predstavi kot verjetno.',
      },
    ],
    positionTitle: 'TEMELJNO STALIŠČE',
    positionLines: [
      'Priznavam, da UI izhaja iz znanja, ki so ga nabrale milijarde ljudi.',
      'Ukrepam tako, da tej človeški, utelešeni in kontekstualizirani izkušnji vračam vrednost.',
      'Zavračam, da bi svojo presojo zamenjal s sintetičnim odgovorom, tudi če je ustrezen.',
      'Zavračam, da bi svoje mišljenje iz udobja delegiral.',
      'Postavljam jasno mejo:',
      '**UI mi pomaga misliti.**',
      '**Ne misli namesto mene.**',
    ],
    engagementTitle: 'KONČNA ZAVEZA',
    engagementLines: [
      'Pred UI sem vprašal človeka.',
      'Po UI se zavezujem, da na to ne bom pozabil.',
      'Predvsem se zavezujem, da bom resnično poslušal.',
      'Ker moja svoboda ne izgine naenkrat.',
      '**Razkraja se, ko preneham izvajati svojo presojo.**',
      '*In to razkrajanje zavračam.*',
    ],
  },
  hr: {
    extraCommitments: [
      {
        recognize:
          'Priznajem da neki sustavi već utječu na način na koji opažamo činjenice i moguće opcije.',
        act: 'Upozoravam da dominantan odgovor nije neutralan odgovor.',
      },
      {
        recognize:
          'Priznajem da se te tehnologije razvijaju pod ekonomskim, političkim i geopolitičkim ograničenjima.',
        act: 'Upozoravam da se njihova neutralnost nikada ne može smatrati zajamčenom.',
      },
      {
        recognize:
          'Priznajem da očuvanje moje slobode prosudbe zahtijeva **aktivan napor**.',
        act:
          'Djelujem održavajući ljudske razmjene, slušajući situiranu stručnost i ponovno razmatrajući ono što mi AI predstavlja kao uvjerljivo.',
      },
    ],
    positionTitle: 'TEMELJNA POZICIJA',
    positionLines: [
      'Priznajem da AI proizlazi iz znanja koje su akumulirale milijarde ljudi.',
      'Djelujem tako da toj ljudskoj, utjelovljenoj i kontekstualiziranoj iskustvenosti vraćam vrijednost.',
      'Odbijam zamijeniti svoju prosudbu sintetičkim odgovorom, čak i kad je relevantan.',
      'Odbijam delegirati svoje mišljenje iz komocije.',
      'Povlačim jasnu crtu:',
      '**AI mi pomaže misliti.**',
      '**Ne misli umjesto mene.**',
    ],
    engagementTitle: 'ZAVRŠNA OBVEZA',
    engagementLines: [
      'Prije AI pitao sam čovjeka.',
      'Poslije AI obvezujem se da to neću zaboraviti.',
      'Prije svega obvezujem se da ću doista slušati.',
      'Jer moja sloboda ne nestaje odjednom.',
      '**Ona erodira kada prestanem provoditi vlastitu prosudbu.**',
      '*I odbijam tu eroziju.*',
    ],
  },
  hu: {
    extraCommitments: [
      {
        recognize:
          'Elismerem, hogy egyes rendszerek már most befolyásolják, hogyan érzékeljük a tényeket és a lehetséges opciókat.',
        act: 'Figyelmeztetek arra, hogy egy uralkodó válasz nem semleges válasz.',
      },
      {
        recognize:
          'Elismerem, hogy ezek a technológiák gazdasági, politikai és geopolitikai kényszerek között fejlődnek.',
        act: 'Figyelmeztetek arra, hogy semlegességüket soha nem lehet adottnak tekinteni.',
      },
      {
        recognize:
          'Elismerem, hogy ítélőképességem szabadságának megőrzése **aktív erőfeszítést** kíván.',
        act:
          'Úgy cselekszem, hogy fenntartom az emberi kapcsolatokat, figyelek a helyhez kötött szakértelemre, és újragondolom azt, amit az MI számomra hihetőként mutat be.',
      },
    ],
    positionTitle: 'ALAPVETŐ ÁLLÁSPONT',
    positionLines: [
      'Elismerem, hogy az MI milliárdnyi ember által felhalmozott tudásból ered.',
      'Úgy cselekszem, hogy visszaadom az értékét ennek az emberi, megtestesült és kontextusba ágyazott tapasztalatnak.',
      'Elutasítom, hogy az ítéletemet egy szintetikus válasszal helyettesítsem, még ha releváns is.',
      'Elutasítom, hogy kényelmi okból delegáljam a gondolkodásomat.',
      'Világos határt húzok:',
      '**Az MI segít gondolkodni.**',
      '**Nem gondolkodik helyettem.**',
    ],
    engagementTitle: 'VÉGSŐ ELKÖTELEZŐDÉS',
    engagementLines: [
      'Az MI előtt embert kérdeztem.',
      'Az MI után elkötelezem magam, hogy ezt nem felejtem el.',
      'Mindenekelőtt elkötelezem magam a valódi figyelem mellett.',
      'Mert a szabadságom nem egyszerre tűnik el.',
      '**Akkor erodálódik, amikor felhagyok az ítélőképességem gyakorlásával.**',
      '*És ezt az eróziót elutasítom.*',
    ],
  },
  ro: {
    extraCommitments: [
      {
        recognize:
          'Recunosc că unele sisteme influențează deja felul în care percepem faptele și opțiunile posibile.',
        act: 'Avertizez că un răspuns dominant nu este un răspuns neutru.',
      },
      {
        recognize:
          'Recunosc că aceste tehnologii evoluează sub constrângeri economice, politice și geopolitice.',
        act: 'Avertizez că neutralitatea lor nu poate fi considerată niciodată garantată.',
      },
      {
        recognize:
          'Recunosc că păstrarea libertății mele de judecată cere un **efort activ**.',
        act:
          'Acționez menținând schimburi umane, ascultând expertize situate și reanalizând ceea ce IA îmi prezintă ca plauzibil.',
      },
    ],
    positionTitle: 'POZIȚIE FUNDAMENTALĂ',
    positionLines: [
      'Recunosc că IA provine din cunoașterea acumulată de miliarde de ființe umane.',
      'Acționez redând valoare acestei experiențe umane, întrupate și contextualizate.',
      'Refuz să îmi înlocuiesc judecata cu un răspuns sintetic, chiar și unul pertinent.',
      'Refuz să îmi deleg gândirea din comoditate.',
      'Afirmez o linie clară:',
      '**IA mă ajută să gândesc.**',
      '**Nu gândește în locul meu.**',
    ],
    engagementTitle: 'ANGAJAMENT FINAL',
    engagementLines: [
      'Înainte de IA, întrebam un om.',
      'După IA, mă angajez să nu uit să fac asta.',
      'Mai ales, mă angajez să ascult cu adevărat.',
      'Pentru că libertatea mea nu dispare dintr-odată.',
      '**Ea se erodează atunci când încetez să-mi exercit propria judecată.**',
      '*Și refuz această eroziune.*',
    ],
  },
  bg: {
    extraCommitments: [
      {
        recognize:
          'Признавам, че някои системи вече влияят върху начина, по който възприемаме фактите и възможните избори.',
        act: 'Предупреждавам, че доминиращият отговор не е неутрален отговор.',
      },
      {
        recognize:
          'Признавам, че тези технологии се развиват под икономически, политически и геополитически ограничения.',
        act: 'Предупреждавам, че тяхната неутралност никога не може да се приема за гарантирана.',
      },
      {
        recognize:
          'Признавам, че запазването на свободата ми на преценка изисква **активно усилие**.',
        act:
          'Действам, като поддържам човешки обмен, слушам ситуирана експертиза и преосмислям това, което ИИ ми представя като правдоподобно.',
      },
    ],
    positionTitle: 'ОСНОВНА ПОЗИЦИЯ',
    positionLines: [
      'Признавам, че ИИ произлиза от знанието, натрупано от милиарди човешки същества.',
      'Действам, като връщам стойност на този човешки, въплътен и контекстуализиран опит.',
      'Отказвам да заменя своята преценка със синтетичен отговор, дори когато е уместен.',
      'Отказвам да делегирам мисленето си от удобство.',
      'Утвърждавам ясна линия:',
      '**ИИ ми помага да мисля.**',
      '**Той не мисли вместо мен.**',
    ],
    engagementTitle: 'ФИНАЛЕН АНГАЖИМЕНТ',
    engagementLines: [
      'Преди ИИ питах човек.',
      'След ИИ се ангажирам да не забравям да го правя.',
      'Най-вече се ангажирам да слушам истински.',
      'Защото свободата ми не изчезва изведнъж.',
      '**Тя ерозира, когато спра да упражнявам собствената си преценка.**',
      '*И аз отказвам тази ерозия.*',
    ],
  },
  el: {
    extraCommitments: [
      {
        recognize:
          'Αναγνωρίζω ότι ορισμένα συστήματα επηρεάζουν ήδη τον τρόπο με τον οποίο αντιλαμβανόμαστε τα γεγονότα και τις πιθανές επιλογές.',
        act: 'Προειδοποιώ ότι μια κυρίαρχη απάντηση δεν είναι ουδέτερη απάντηση.',
      },
      {
        recognize:
          'Αναγνωρίζω ότι αυτές οι τεχνολογίες εξελίσσονται υπό οικονομικούς, πολιτικούς και γεωπολιτικούς περιορισμούς.',
        act: 'Προειδοποιώ ότι η ουδετερότητά τους δεν μπορεί ποτέ να θεωρείται δεδομένη.',
      },
      {
        recognize:
          'Αναγνωρίζω ότι η διατήρηση της ελευθερίας κρίσης μου απαιτεί **ενεργή προσπάθεια**.',
        act:
          'Δρω διατηρώντας ανθρώπινες ανταλλαγές, ακούγοντας εντοπισμένη εξειδίκευση και επανεξετάζοντας ό,τι η ΤΝ μου παρουσιάζει ως εύλογο.',
      },
    ],
    positionTitle: 'ΘΕΜΕΛΙΩΔΗΣ ΘΕΣΗ',
    positionLines: [
      'Αναγνωρίζω ότι η ΤΝ προέρχεται από τη γνώση που έχει συσσωρευτεί από δισεκατομμύρια ανθρώπους.',
      'Δρω αποδίδοντας ξανά αξία σε αυτή την ανθρώπινη, ενσώματη και πλαισιωμένη εμπειρία.',
      'Αρνούμαι να αντικαταστήσω την κρίση μου με μια συνθετική απάντηση, ακόμη κι αν είναι σχετική.',
      'Αρνούμαι να εκχωρήσω τη σκέψη μου από άνεση.',
      'Χαράζω μια σαφή γραμμή:',
      '**Η ΤΝ με βοηθά να σκέφτομαι.**',
      '**Δεν σκέφτεται στη θέση μου.**',
    ],
    engagementTitle: 'ΤΕΛΙΚΗ ΔΕΣΜΕΥΣΗ',
    engagementLines: [
      'Πριν από την ΤΝ, ρωτούσα έναν άνθρωπο.',
      'Μετά την ΤΝ, δεσμεύομαι να μην το ξεχνώ.',
      'Πάνω απ’ όλα, δεσμεύομαι να ακούω πραγματικά.',
      'Γιατί η ελευθερία μου δεν εξαφανίζεται μονομιάς.',
      '**Διαβρώνεται όταν παύω να ασκώ τη δική μου κρίση.**',
      '*Και αρνούμαι αυτή τη διάβρωση.*',
    ],
  },
  ga: {
    extraCommitments: [
      {
        recognize:
          'Aithním go mbíonn tionchar ag córais áirithe cheana féin ar an gcaoi a bhfeicimid fíricí agus roghanna indéanta.',
        act: 'Tugaim foláireamh nach freagra neodrach é freagra ceannasach.',
      },
      {
        recognize:
          'Aithním go bhforbraíonn na teicneolaíochtaí seo faoi shrianta eacnamaíocha, polaitiúla agus geo-pholaitiúla.',
        act: 'Tugaim foláireamh nach féidir a neodracht a ghlacadh mar rud cinnte riamh.',
      },
      {
        recognize:
          'Aithním go dteastaíonn **iarracht ghníomhach** chun saoirse mo bhreithiúnais a chaomhnú.',
        act:
          'Gníomhaím trí mhalartuithe daonna a choinneáil beo, trí éisteacht le saineolas suite agus trí athmhachnamh a dhéanamh ar an méid a chuireann an IS i láthair dom mar rud inchreidte.',
      },
    ],
    positionTitle: 'SEASAMH BUNÚSACH',
    positionLines: [
      'Aithním go dtagann IS as an eolas atá carntha ag billiúin daoine.',
      'Gníomhaím trí luach a thabhairt ar ais don taithí dhaonna seo atá corpraithe agus comhthéacsaithe.',
      'Diúltaím mo bhreithiúnas a chur in ionad freagra sintéiseach, fiú más cuí é.',
      'Diúltaím mo smaointeoireacht a tharmligean mar áis.',
      'Leagaim síos líne shoiléir:',
      '**Cabhraíonn IS liom smaoineamh.**',
      '**Ní smaoiníonn sé i m’áit.**',
    ],
    engagementTitle: 'TIOMANTAS DEIRIDH',
    engagementLines: [
      'Roimh an IS, d’iarrfainn ar dhuine.',
      'Tar éis an IS, geallaim gan dearmad a dhéanamh air sin.',
      'Thar aon rud eile, geallaim éisteacht go fírinneach.',
      'Mar ní imíonn mo shaoirse ar fad in aon bhuille amháin.',
      '**Creimíonn sí nuair a scoirim de mo bhreithiúnas féin a chleachtadh.**',
      '*Agus diúltaím don chreimeadh sin.*',
    ],
  },
  mt: {
    extraCommitments: [
      {
        recognize:
          'Nagħraf li xi sistemi diġà jinfluwenzaw il-mod kif nipperċepixxu l-fatti u l-għażliet possibbli.',
        act: 'Inwissi li tweġiba dominanti mhix tweġiba newtrali.',
      },
      {
        recognize:
          'Nagħraf li dawn it-teknoloġiji jevolvu taħt pressjonijiet ekonomiċi, politiċi u ġeopolitiċi.',
        act: 'Inwissi li n-newtralità tagħhom qatt ma tista’ titqies bħala garantita.',
      },
      {
        recognize:
          'Nagħraf li biex inżomm il-libertà tal-ġudizzju tiegħi hemm bżonn **sforz attiv**.',
        act:
          'Naġixxi billi nżomm skambji umani ħajjin, nisma’ l-għarfien situat u nerġa’ nikkunsidra dak li l-AI tippreżentalni bħala plawżibbli.',
      },
    ],
    positionTitle: 'POŻIZZJONI FUNDAMENTALI',
    positionLines: [
      'Nagħraf li l-AI toħroġ mill-għarfien miġbur minn biljuni ta’ bnedmin.',
      'Naġixxi billi nerġa’ nagħti valur lil din l-esperjenza umana, inkarnata u kkontestwalizzata.',
      'Nirrifjuta li nissostitwixxi l-ġudizzju tiegħi b’tweġiba sintetika, anke jekk tkun rilevanti.',
      'Nirrifjuta li niddelegaw il-ħsieb tiegħi għall-kumdità.',
      'Nafferma linja ċara:',
      '**L-AI tgħinni naħseb.**',
      '**Ma taħsibx flok jien.**',
    ],
    engagementTitle: 'IMPENN FINALI',
    engagementLines: [
      'Qabel l-AI, kont nistaqsi lil bniedem.',
      'Wara l-AI, nintrabat li ma ninsewx nagħmel hekk.',
      'Fuq kollox, nintrabat li nisma’ tassew.',
      'Għax il-libertà tiegħi ma tisparixxix f’daqqa.',
      '**Tiddeterjora meta nieqaf neżerċita l-ġudizzju tiegħi.**',
      '*U jiena nirrifjuta din l-erożjoni.*',
    ],
  },
};

const CELEBRATION_BY_LOCALE = {
  fr: {
    eyebrow: 'Merci',
    title: 'MERCI POUR VOTRE ENGAGEMENT',
    body: 'Votre charte est complète. Vous pouvez maintenant signer.',
  },
  en: {
    eyebrow: 'Thank you',
    title: 'THANK YOU FOR YOUR ENGAGEMENT',
    body: 'Your charter is complete. You can now sign.',
  },
  de: {
    eyebrow: 'Danke',
    title: 'DANKE FÜR IHR ENGAGEMENT',
    body: 'Ihre Charta ist vollständig. Sie können jetzt unterzeichnen.',
  },
  es: {
    eyebrow: 'Gracias',
    title: 'GRACIAS POR SU COMPROMISO',
    body: 'Su carta está completa. Ya puede firmar.',
  },
  it: {
    eyebrow: 'Grazie',
    title: 'GRAZIE PER IL TUO IMPEGNO',
    body: 'La tua carta è completa. Ora puoi firmare.',
  },
  pt: {
    eyebrow: 'Obrigado',
    title: 'OBRIGADO PELO SEU COMPROMISSO',
    body: 'A sua carta está completa. Já pode assinar.',
  },
  nl: {
    eyebrow: 'Dank je',
    title: 'BEDANKT VOOR JE ENGAGEMENT',
    body: 'Je charter is volledig. Je kunt nu ondertekenen.',
  },
  sv: {
    eyebrow: 'Tack',
    title: 'TACK FÖR DITT ENGAGEMANG',
    body: 'Din stadga är komplett. Du kan nu skriva under.',
  },
  da: {
    eyebrow: 'Tak',
    title: 'TAK FOR DIT ENGAGEMENT',
    body: 'Dit charter er nu komplet. Du kan nu underskrive.',
  },
  fi: {
    eyebrow: 'Kiitos',
    title: 'KIITOS SITOUTUMISESTASI',
    body: 'Peruskirjasi on valmis. Voit nyt allekirjoittaa.',
  },
  et: {
    eyebrow: 'Aitäh',
    title: 'AITÄH SINU PÜHENDUMISE EEST',
    body: 'Sinu harta on nüüd täielik. Sa võid nüüd allkirjastada.',
  },
  lv: {
    eyebrow: 'Paldies',
    title: 'PALDIES PAR TAVU APŅEMŠANOS',
    body: 'Tava harta ir pilnīga. Tagad vari parakstīt.',
  },
  lt: {
    eyebrow: 'Ačiū',
    title: 'AČIŪ UŽ TAVO ĮSIPAREIGOJIMĄ',
    body: 'Tavo chartija užpildyta. Dabar gali pasirašyti.',
  },
  pl: {
    eyebrow: 'Dziękujemy',
    title: 'DZIĘKUJEMY ZA TWOJE ZAANGAŻOWANIE',
    body: 'Twoja karta jest kompletna. Możesz teraz podpisać.',
  },
  cs: {
    eyebrow: 'Děkujeme',
    title: 'DĚKUJEME ZA VÁŠ ZÁVAZEK',
    body: 'Vaše charta je kompletní. Nyní můžete podepsat.',
  },
  sk: {
    eyebrow: 'Ďakujeme',
    title: 'ĎAKUJEME ZA VÁŠ ZÁVÄZOK',
    body: 'Vaša charta je kompletná. Teraz môžete podpísať.',
  },
  sl: {
    eyebrow: 'Hvala',
    title: 'HVALA ZA VAŠO ZAVEZO',
    body: 'Vaša listina je popolna. Zdaj lahko podpišete.',
  },
  hr: {
    eyebrow: 'Hvala',
    title: 'HVALA NA VAŠOJ OBVEZI',
    body: 'Vaša povelja je potpuna. Sada možete potpisati.',
  },
  hu: {
    eyebrow: 'Köszönjük',
    title: 'KÖSZÖNJÜK AZ ELKÖTELEZŐDÉSED',
    body: 'A chartád teljes. Most már aláírhatod.',
  },
  ro: {
    eyebrow: 'Mulțumim',
    title: 'MULȚUMIM PENTRU ANGAJAMENTUL TĂU',
    body: 'Carta ta este completă. Acum poți semna.',
  },
  bg: {
    eyebrow: 'Благодарим',
    title: 'БЛАГОДАРИМ ЗА ВАШИЯ АНГАЖИМЕНТ',
    body: 'Вашата харта е попълнена. Вече можете да подпишете.',
  },
  el: {
    eyebrow: 'Ευχαριστούμε',
    title: 'ΕΥΧΑΡΙΣΤΟΥΜΕ ΓΙΑ ΤΗ ΔΕΣΜΕΥΣΗ ΣΑΣ',
    body: 'Η χάρτα σας είναι πλήρης. Τώρα μπορείτε να υπογράψετε.',
  },
  ga: {
    eyebrow: 'Go raibh maith agat',
    title: 'GO RAIBH MAITH AGAT AS DO THIOMANTAS',
    body: 'Tá do chairt iomlán. Is féidir leat síniú anois.',
  },
  mt: {
    eyebrow: 'Grazzi',
    title: 'GRAZZI GĦALL-IMPENN TIEGĦEK',
    body: 'Il-karta tiegħek hija kompluta. Issa tista’ tiffirma.',
  },
};

export function getLocalizedManifestoContent(locale, charterItems) {
  const language = getLanguageCode(locale);
  const localizedCharterItems = toCommitments(charterItems);
  const baseCommitments =
    localizedCharterItems.length > 0
      ? localizedCharterItems
      : DEFAULT_MANIFESTO.commitments.slice(0, 6);
  const details = MANIFESTO_DETAILS[language] ?? MANIFESTO_DETAILS.fr;
  const extraCommitments = toCommitments(details.extraCommitments);

  return {
    title: DEFAULT_MANIFESTO.title,
    commitments: [...baseCommitments, ...(extraCommitments.length > 0 ? extraCommitments : DEFAULT_EXTRA_COMMITMENTS)],
    requiredChecks: baseCommitments.length + (extraCommitments.length > 0 ? extraCommitments.length : DEFAULT_EXTRA_COMMITMENTS.length),
    positionTitle: details.positionTitle ?? DEFAULT_MANIFESTO.positionTitle,
    positionLines: Array.isArray(details.positionLines) && details.positionLines.length > 0
      ? details.positionLines
      : DEFAULT_MANIFESTO.positionLines,
    engagementTitle: details.engagementTitle ?? DEFAULT_MANIFESTO.engagementTitle,
    engagementLines: Array.isArray(details.engagementLines) && details.engagementLines.length > 0
      ? details.engagementLines
      : DEFAULT_MANIFESTO.engagementLines,
  };
}

export function getLocalizedCelebration(locale) {
  const language = getLanguageCode(locale);
  const details = CELEBRATION_BY_LOCALE[language] ?? CELEBRATION_BY_LOCALE.fr;

  return {
    ...details,
    emoticons: ['✨', '🌟', '😊'],
  };
}
