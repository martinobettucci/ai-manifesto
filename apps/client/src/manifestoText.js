function toCleanArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
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

export const DEFAULT_REFLECTION = {
  title: 'Les réflexions derrière ce manifeste',
  subheadings: [
    'Un paradoxe comportemental',
    'Une faille cognitive exploitée',
    'Le problème n’est pas seulement technique',
    'Des exemples déjà visibles',
    'Une transformation à grande échelle',
    'Une réalité géopolitique',
    'Restaurer une architecture saine',
    'Une ligne claire',
    'Un rappel essentiel',
    'Ce que nous cherchons à préserver',
  ],
  bodyLines: [
    'Ce manifeste ne part pas d’un rejet de l’intelligence artificielle.',
    'Il part d’un constat plus subtil et plus préoccupant.',
    'Nous entrons dans un environnement où les réponses sont abondantes, rapides, bien formulées, et accessibles en quelques secondes. Mais cette abondance crée une illusion. L’impression de diversité ne garantit plus la diversité réelle des sources, des points de vue ou des raisonnements.',
    'Plusieurs réponses différentes peuvent provenir des mêmes chaînes de production, des mêmes corpus, des mêmes biais. Elles peuvent se contredire en surface tout en partageant les mêmes angles morts. Et pourtant, pour l’utilisateur, elles donnent le sentiment d’avoir vérifié.',
    'Le problème n’est donc pas seulement l’erreur.',
    'Le problème est **l’illusion de vérification**.',
    'Un paradoxe comportemental',
    'La majorité des utilisateurs affirme se méfier de l’intelligence artificielle.',
    'Ils disent croiser les sources, garder un esprit critique, ne pas prendre les réponses pour argent comptant.',
    'Mais dans les usages concrets, un autre comportement apparaît.',
    'Lorsque la réponse est rapide, fluide, structurée et directement exploitable, elle est acceptée beaucoup plus facilement. Elle est moins relue, moins questionnée, moins confrontée à d’autres formes d’expertise.',
    'Il existe donc un écart entre ce que nous pensons faire et ce que nous faisons réellement.',
    'Nous ne faisons pas seulement face à une évolution technologique.',
    'Nous faisons face à une transformation de notre rapport à l’effort de vérification.',
    'Une faille cognitive exploitée',
    'Le cerveau humain n’est pas conçu pour maximiser la vérité.',
    'Il est conçu pour arbitrer entre effort et efficacité.',
    'Une réponse lisible, cohérente en apparence et immédiatement utilisable est naturellement plus séduisante qu’un processus lent, contradictoire et exigeant.',
    'Les systèmes d’IA conversationnelle s’insèrent précisément dans cette dynamique.',
    'Ils réduisent la friction.',
    'Ils produisent une première version du réel très tôt dans le processus.',
    'Ils donnent le sentiment que le travail est déjà avancé.',
    'Ce sentiment peut être trompeur.',
    'Plus une réponse est facile à lire, plus elle semble crédible.',
    'Et plus elle semble crédible, moins elle est interrogée.',
    'Le problème n’est pas seulement technique',
    'Il serait tentant de réduire le sujet à des erreurs techniques, des biais de modèles ou des limitations des systèmes.',
    'Mais le cœur du problème est ailleurs.',
    'Il réside dans la manière dont les utilisateurs s’habituent à déléguer, puis à valider sans véritable contre analyse. Il réside dans l’émergence d’une acceptation passive.',
    'Dans ce contexte, le modèle du “humain dans la boucle” devient insuffisant.',
    'Un humain présent mais passif ne constitue pas une garantie.',
    'Un humain qui survole, valide ou entérine sans analyser devient une étape symbolique, pas un **véritable contre pouvoir**.',
    'Des exemples déjà visibles',
    'Ce phénomène n’est pas théorique.',
    'Dans l’éducation, des travaux produits en quelques minutes semblent corrects en surface, mais révèlent des incohérences dès qu’ils sont examinés sérieusement.',
    'Dans les environnements techniques, des décisions critiques sont prises sur la base de suggestions générées rapidement, avec un niveau de vérification insuffisant.',
    'Dans la santé, des patients arrivent avec des diagnostics déjà formulés et cherchent une validation plutôt qu’une expertise.',
    'Dans le développement ou le conseil, des professionnels sont sollicités pour confirmer des cadrages déjà établis, au lieu d’exercer leur jugement.',
    'Dans tous ces cas, l’ordre de l’autorité s’inverse.',
    'L’IA produit une première version.',
    'L’humain est relégué au rôle de validation.',
    'Une transformation à grande échelle',
    'À mesure que ces systèmes deviennent massivement utilisés, ils ne sont plus de simples outils.',
    'Ils deviennent des **interfaces d’accès au réel**.',
    'Ils influencent la manière dont les problèmes sont formulés.',
    'Ils influencent les mots utilisés.',
    'Ils influencent ce qui semble évident, discutable ou acceptable.',
    'À grande échelle, cela crée une capacité d’influence structurelle.',
    'Il ne s’agit pas nécessairement de manipulation directe.',
    'Il s’agit de **cadrage progressif**.',
    'Déplacer légèrement la manière dont un sujet est présenté, répéter certains angles, en ignorer d’autres, peut suffire à faire évoluer la perception collective sur le long terme.',
    'Une réalité géopolitique',
    'Ces systèmes n’existent pas en dehors du monde.',
    'Ils sont développés par des entreprises soumises à des contraintes économiques, réglementaires et politiques. Ils évoluent dans des contextes géopolitiques mouvants.',
    'Aucune organisation ne peut être considérée comme définitivement neutre.',
    'L’histoire montre que les équilibres changent.',
    'Les régimes évoluent.',
    'Les lignes politiques se déplacent.',
    'La question n’est donc pas de savoir si un acteur est digne de confiance aujourd’hui.',
    'La question est de savoir ce qui se passe lorsque les conditions changent.',
    'Restaurer une architecture saine',
    'Face à ces constats, la réponse ne peut pas être le rejet de l’intelligence artificielle.',
    'Elle doit être une réorganisation de son usage.',
    'L’IA peut être utilisée pour explorer, structurer, préparer.',
    'Elle peut accélérer la compréhension initiale.',
    'Mais elle ne doit pas devenir le **point de départ incontesté** de la décision.',
    'Le rôle de l’expert humain doit être restauré après l’IA, comme espace de relecture, de contextualisation et d’arbitrage.',
    'La posture doit changer.',
    'Il ne s’agit plus d’arriver avec une réponse à faire valider.',
    'Il s’agit d’arriver avec une hypothèse à discuter.',
    'Une ligne claire',
    'Ce manifeste repose sur une distinction simple.',
    'L’intelligence artificielle est un outil.',
    'Elle ne doit pas devenir un *oracle*.',
    'Un outil aide à penser.',
    'Un oracle remplace le jugement.',
    'Un outil ouvre des possibilités.',
    'Un oracle ferme la discussion.',
    'Un outil enrichit les relations humaines.',
    'Un oracle les court circuite.',
    'Un rappel essentiel',
    'L’intelligence artificielle n’est pas indépendante du monde humain.',
    'Elle est issue de données produites par des générations de personnes, d’expériences accumulées, de savoirs transmis, de contextes vécus.',
    'Sans cette base humaine, elle n’existerait pas.',
    'L’expertise humaine ne disparaît donc pas.',
    'Elle reste une source de contexte, de responsabilité et de jugement située.',
    'Ce que nous cherchons à préserver',
    'Ce manifeste ne défend pas une nostalgie du passé.',
    'Il défend une capacité.',
    'La capacité de juger.',
    'La capacité de douter.',
    'La capacité de confronter.',
    'La capacité d’écouter.',
    'La capacité de ne pas déléguer entièrement notre compréhension du monde.',
    'La liberté ne disparaît pas brutalement.',
    'Elle s’érode lorsque nous cessons d’exercer notre propre jugement.',
    'Ce manifeste est une réponse à cette érosion.',
  ],
};

export const EN_REFLECTION = {
  title: 'Reflections behind this manifesto',
  subheadings: [
    'A behavioral paradox',
    'An exploited cognitive weakness',
    'The problem is not only technical',
    'Examples already visible',
    'A transformation at scale',
    'A geopolitical reality',
    'Restoring a healthy architecture',
    'A clear line',
    'An essential reminder',
    'What we are trying to preserve',
  ],
  bodyLines: [
    'This manifesto does not begin with a rejection of artificial intelligence.',
    'It begins with a subtler and more troubling observation.',
    'We are entering an environment where answers are abundant, fast, well-phrased, and available within seconds. But that abundance creates an illusion. The impression of diversity no longer guarantees the real diversity of sources, viewpoints, or reasoning.',
    'Several different answers can come from the same production chains, the same corpora, the same biases. They may contradict one another on the surface while sharing the same blind spots. And yet, for the user, they create the feeling that verification has happened.',
    'The problem is therefore not only error.',
    'The problem is **the illusion of verification**.',
    'A behavioral paradox',
    'Most users say they distrust artificial intelligence.',
    'They say they cross-check sources, keep a critical mind, and do not take answers at face value.',
    'But in concrete usage, another behavior appears.',
    'When an answer is fast, fluent, structured, and directly usable, it is accepted much more easily. It is reread less, questioned less, and compared less with other forms of expertise.',
    'There is therefore a gap between what we think we do and what we actually do.',
    'We are not only facing a technological evolution.',
    'We are facing a transformation in our relationship to the effort of verification.',
    'An exploited cognitive weakness',
    'The human brain is not designed to maximize truth.',
    'It is designed to arbitrate between effort and efficiency.',
    'A readable answer, apparently coherent and immediately usable, is naturally more attractive than a slow, contradictory, and demanding process.',
    'Conversational AI systems fit directly into that dynamic.',
    'They reduce friction.',
    'They produce a first version of reality very early in the process.',
    'They create the feeling that the work is already advanced.',
    'That feeling can be misleading.',
    'The easier an answer is to read, the more credible it seems.',
    'And the more credible it seems, the less it is questioned.',
    'The problem is not only technical',
    'It would be tempting to reduce the issue to technical errors, model bias, or system limitations.',
    'But the heart of the problem lies elsewhere.',
    'It lies in the way users become accustomed to delegating, then validating without real counter-analysis. It lies in the rise of passive acceptance.',
    'In that context, the model of the “human in the loop” becomes insufficient.',
    'A human who is present but passive is not a guarantee.',
    'A human who skims, validates, or rubber-stamps without analysis becomes a symbolic step, not a **real counter-power**.',
    'Examples already visible',
    'This phenomenon is not theoretical.',
    'In education, assignments produced in a few minutes may look correct on the surface, yet reveal inconsistencies as soon as they are examined seriously.',
    'In technical environments, critical decisions are made on the basis of rapidly generated suggestions, with an insufficient level of verification.',
    'In healthcare, patients arrive with diagnoses already formulated and seek validation rather than expertise.',
    'In development or consulting, professionals are asked to confirm framings that have already been set, instead of exercising judgment.',
    'In all these cases, the order of authority is reversed.',
    'AI produces a first version.',
    'The human is reduced to the role of validation.',
    'A transformation at scale',
    'As these systems become widely used, they are no longer simple tools.',
    'They become **interfaces to reality**.',
    'They influence how problems are formulated.',
    'They influence the words being used.',
    'They influence what feels obvious, debatable, or acceptable.',
    'At scale, this creates a structural power of influence.',
    'This is not necessarily about direct manipulation.',
    'It is about **progressive framing**.',
    'Slightly shifting how a subject is presented, repeating certain angles, and ignoring others can be enough to reshape collective perception over the long term.',
    'A geopolitical reality',
    'These systems do not exist outside the world.',
    'They are developed by companies subject to economic, regulatory, and political constraints. They evolve in shifting geopolitical contexts.',
    'No organization can be considered permanently neutral.',
    'History shows that balances change.',
    'Regimes evolve.',
    'Political lines shift.',
    'So the question is not whether an actor is trustworthy today.',
    'The question is what happens when the conditions change.',
    'Restoring a healthy architecture',
    'Faced with these observations, the response cannot be the rejection of artificial intelligence.',
    'It must be a reorganization of how it is used.',
    'AI can be used to explore, structure, and prepare.',
    'It can accelerate initial understanding.',
    'But it must not become the **unquestioned starting point** of a decision.',
    'The role of the human expert must be restored after AI, as a space for rereading, contextualization, and arbitration.',
    'The posture must change.',
    'It is no longer about arriving with an answer to be validated.',
    'It is about arriving with a hypothesis to discuss.',
    'A clear line',
    'This manifesto rests on a simple distinction.',
    'Artificial intelligence is a tool.',
    'It must not become an *oracle*.',
    'A tool helps us think.',
    'An oracle replaces judgment.',
    'A tool opens possibilities.',
    'An oracle closes discussion.',
    'A tool enriches human relationships.',
    'An oracle short-circuits them.',
    'An essential reminder',
    'Artificial intelligence is not independent from the human world.',
    'It comes from data produced by generations of people, accumulated experience, transmitted knowledge, and lived contexts.',
    'Without that human foundation, it would not exist.',
    'Human expertise therefore does not disappear.',
    'It remains a source of context, responsibility, and situated judgment.',
    'What we are trying to preserve',
    'This manifesto does not defend nostalgia for the past.',
    'It defends a capacity.',
    'The capacity to judge.',
    'The capacity to doubt.',
    'The capacity to confront.',
    'The capacity to listen.',
    'The capacity not to fully delegate our understanding of the world.',
    'Freedom does not disappear all at once.',
    'It erodes when we stop exercising our own judgment.',
    'This manifesto is a response to that erosion.',
  ],
};

export const DEFAULT_MANIFESTO = {
  title: 'MANIFESTE — IA OUI COMME OUTIL, NON COMME ORACLE',
  commitments: [
    {
      recognize:
        'Je reconnais que la pluralité apparente des réponses ne garantit plus la **pluralité réelle** des sources ni des jugements.',
      act: 'J’agis en questionnant l’origine des informations et leur indépendance réelle.',
    },
    {
      recognize:
        'Je reconnais que le vrai danger n’est pas seulement l’erreur, mais mon **acceptation passive**.',
      act:
        'J’agis en relisant, en doutant et en refusant de valider automatiquement ce qui est simplement bien formulé.',
    },
    {
      recognize:
        'Je reconnais que l’IA réduit l’effort mental nécessaire pour produire une réponse exploitable.',
      act: 'J’agis en ne confondant jamais **facilité de lecture** et fiabilité.',
    },
    {
      recognize:
        'Je reconnais que la présence d’un humain dans la chaîne peut devenir **purement symbolique**.',
      act:
        'J’agis en exerçant un véritable jugement, et non une validation par confort ou habitude.',
    },
    {
      recognize: 'Je reconnais que **l’expertise humaine reste indispensable**.',
      act: 'J’agis en consultant les experts après l’IA, pour relire, contextualiser et décider.',
    },
    {
      recognize:
        'Je reconnais que l’IA peut devenir un **cadre de pensée** avant même que je réfléchisse.',
      act:
        'J’agis en l’utilisant pour préparer, jamais pour cadrer seul ma compréhension du réel.',
    },
    {
      recognize:
        'Je reconnais que certains systèmes influencent déjà la manière dont nous percevons les faits et les options possibles.',
      act: 'J’alerte sur le fait qu’une réponse dominante n’est pas une réponse neutre.',
    },
    {
      recognize:
        'Je reconnais que ces technologies évoluent sous contraintes économiques, politiques et géopolitiques.',
      act:
        'J’alerte sur le fait que leur neutralité ne peut jamais être considérée comme acquise.',
    },
    {
      recognize:
        'Je reconnais que préserver ma liberté de jugement demande un **effort actif**.',
      act:
        'J’agis en maintenant des échanges humains, en écoutant les expertises situées et en reconsidérant ce que l’IA me présente comme plausible.',
    },
  ],
  positionTitle: 'POSITION FONDAMENTALE',
  positionLines: [
    'Je reconnais que l’IA est issue du savoir accumulé par des milliards d’êtres humains.',
    'J’agis en redonnant de la valeur à cette expérience humaine, incarnée et contextualisée.',
    'Je refuse de remplacer mon jugement par une réponse synthétique, même pertinente.',
    'Je refuse de déléguer ma pensée par confort.',
    'J’affirme une ligne claire :',
    '**L’IA m’aide à penser.**',
    '**Elle ne pense pas à ma place.**',
  ],
  engagementTitle: 'ENGAGEMENT FINAL',
  engagementLines: [
    'Avant l’IA, je demandais à un humain.',
    'Après l’IA, je m’engage à ne pas oublier de le faire.',
    'Je m’engage surtout à l’écouter réellement.',
    'Parce que ma liberté ne disparaît pas d’un coup.',
    '**Elle s’érode lorsque je cesse d’exercer mon jugement.**',
    '*Et je refuse cette érosion.*',
  ],
};

export function getReflectionContent(value, fallback = DEFAULT_REFLECTION) {
  const fallbackTitle =
    typeof fallback?.title === 'string' && fallback.title.trim()
      ? fallback.title.trim()
      : DEFAULT_REFLECTION.title;
  const fallbackSubheadings = toCleanArray(fallback?.subheadings);
  const fallbackBodyLines = toCleanArray(fallback?.bodyLines);
  const title =
    typeof value?.title === 'string' && value.title.trim()
      ? value.title.trim()
      : fallbackTitle;
  const subheadings = toCleanArray(value?.subheadings);
  const bodyLines = toCleanArray(value?.bodyLines);

  return {
    title,
    subheadings: new Set(
      subheadings.length > 0
        ? subheadings
        : fallbackSubheadings.length > 0
          ? fallbackSubheadings
          : DEFAULT_REFLECTION.subheadings,
    ),
    bodyLines:
      bodyLines.length > 0
        ? bodyLines
        : fallbackBodyLines.length > 0
          ? fallbackBodyLines
          : DEFAULT_REFLECTION.bodyLines,
  };
}

export function getManifestoContent(value) {
  const commitments = toCommitments(value?.commitments);
  const safeCommitments =
    commitments.length > 0 ? commitments : DEFAULT_MANIFESTO.commitments;

  return {
    title:
      typeof value?.title === 'string' && value.title.trim()
        ? value.title.trim()
        : DEFAULT_MANIFESTO.title,
    commitments: safeCommitments,
    requiredChecks: safeCommitments.length,
    positionTitle:
      typeof value?.positionTitle === 'string' && value.positionTitle.trim()
        ? value.positionTitle.trim()
        : DEFAULT_MANIFESTO.positionTitle,
    positionLines: toCleanArray(value?.positionLines).length > 0
      ? toCleanArray(value.positionLines)
      : DEFAULT_MANIFESTO.positionLines,
    engagementTitle:
      typeof value?.engagementTitle === 'string' && value.engagementTitle.trim()
        ? value.engagementTitle.trim()
        : DEFAULT_MANIFESTO.engagementTitle,
    engagementLines: toCleanArray(value?.engagementLines).length > 0
      ? toCleanArray(value.engagementLines)
      : DEFAULT_MANIFESTO.engagementLines,
  };
}
