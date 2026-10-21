import { AudioTrack, ArtistProfile, FriendActivity } from '../../types';

export const INITIAL_TRACKS: AudioTrack[] = [
  {
    id: 'track-saldo-07',
    title: 'Saldo 0,7',
    artist: 'Taco Hemingway, Szprycer',
    album: 'Szprycer',
    year: 2017,
    duration: 215,
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    lyricsLrc: `[ti:Saldo 0,7]
[ar:Taco Hemingway]
[al:Szprycer]
[00:04.20]Nocny spacer, warszawskie neony
[00:08.80]Wracam do domu, telefon wyłączony
[00:13.50]Saldo zero siedem, puste kieszenie
[00:18.20]Ale w głowie wciąż nowe wspomnienie
[00:23.10]Światła Wisły odbijają się w rzece
[00:27.90]Wszystkie troski dziś z wiatrem ulecą
[00:32.40]Miasto śpi, a my wciąż na nogach
[00:37.00]Przed nami długa, nieznana droga
[00:41.50]Tamagotchi gra w kieszeni płaszcza
[00:46.20]Każda chwila w tym mieście coś znaczy
[00:51.00]Saldo zero siedem, jeszcze raz to powtórz
[00:55.80]Złap ten rytm i nigdy nie odpuszczaj`,
    provider: 'open-catalog',
    isFavorite: true,
  },
  {
    id: 'track-tip-toes',
    title: 'Tip Toes',
    artist: 'half•alive',
    album: 'Now, Not Yet',
    year: 2019,
    duration: 195,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/612/612611_5674468-lq.mp3',
    lyricsLrc: `[ti:Tip Toes]
[ar:half•alive]
[al:Now, Not Yet]
[00:05.10]Walking through the quiet room
[00:08.50]But still my pride is screaming
[00:13.20]My future will listen to me
[00:18.00]Listen to me
[00:23.10]I am walking on tip toes
[00:27.40]Hoping nobody hears me
[00:32.00]Hear me out now
[00:36.50]There's a fire in the basement
[00:41.00]Looking for an empty space
[00:45.80]Take a breath and step inside
[00:50.20]No more reasons left to hide`,
    provider: 'open-catalog',
    isFavorite: true,
  },
  {
    id: 'track-the-boy-is-mine',
    title: 'The boy is mine',
    artist: 'Ariana Grande',
    album: 'eternal sunshine',
    year: 2024,
    duration: 173,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/612/612612_5674468-lq.mp3',
    lyricsLrc: `[ti:The boy is mine]
[ar:Ariana Grande]
[al:eternal sunshine]
[00:04.20]How can it be?
[00:06.10]So independent
[00:08.50]Tell me why
[00:10.90]'Cause the boy is mine, mine
[00:14.20]Somethin' about him is made for
[00:17.50]somebody like me
[00:20.10]Baby, come over, come over (over)
[00:23.40]And God knows I'm tryin', but there's just
[00:26.50]no use in denying
[00:29.10]The boy is mine
[00:31.40]I can't wait to try him
[00:33.80]Le-let's get intertwined
[00:36.20]The stars, they aligned
[00:39.10]The boy is mine`,
    provider: 'open-catalog',
    isFavorite: true,
  },
  {
    id: 'track-tamagotchi',
    title: 'Tamagotchi',
    artist: 'Taco Hemingway, Quebonafide, Soma 0,5',
    album: 'Soma 0,5 mg',
    year: 2018,
    duration: 202,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/587/587979_12496818-lq.mp3',
    lyricsLrc: `[ti:Tamagotchi]
[ar:Taco Hemingway & Quebonafide]
[00:06.00]Piję, żeby zapomnieć, nie pytaj o nic
[00:11.20]W kieszeni mały stary tamagotchi
[00:16.40]Tyle powiadomień znów na ekranie
[00:21.50]Nie wiem co z tym wszystkim dziś się stanie
[00:26.80]Wszyscy tańczą, klub wypełniony dymem
[00:31.90]Gubimy się w nocy z każdą wolną chwilą`,
    provider: 'open-catalog',
    isFavorite: true,
  },
  {
    id: 'track-wszystko-na-niby',
    title: 'Wszystko na niby',
    artist: 'Taco Hemingway',
    album: 'Café Belga',
    year: 2018,
    duration: 188,
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/587/587980_12496818-lq.mp3',
    lyricsLrc: `[ti:Wszystko na niby]
[ar:Taco Hemingway]
[00:05.00]Kolejny dzień w Café Belga
[00:09.50]Kawa stygnie, czas powoli ucieka
[00:14.20]Wszystko na niby, maski na twarzach
[00:19.00]To samo miasto, ta sama plaża`,
    provider: 'open-catalog',
    isFavorite: false,
  },
  {
    id: 'track-w-piatki',
    title: 'W piątki leżę w wannie',
    artist: 'Taco Hemingway, Dawid Podsiadło',
    album: 'Pocztówka z WWA, lato \'19',
    year: 2019,
    duration: 210,
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/568/568434_9497060-lq.mp3',
    lyricsLrc: `[ti:W piątki leżę w wannie]
[ar:Taco Hemingway & Dawid Podsiadło]
[00:06.00]W piątki leżę w wannie i nie robię nic
[00:11.20]Zimna woda, piana, po co dalej żyć w pośpiechu
[00:16.80]Miasto tętni głośno tuż za moją ścianą
[00:22.00]A ja zostanę w wannie aż do rana`,
    provider: 'open-catalog',
    isFavorite: true,
  },
  {
    id: 'track-good-girls',
    title: 'all the good girls go to hell',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
    year: 2019,
    duration: 168,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/568/568435_9497060-lq.mp3',
    lyricsLrc: `[00:04.00]My Lucifer is lonely
[00:08.00]Standing there, killing time
[00:12.00]Can't commit to anything but a crime
[00:16.50]All the good girls go to hell
[00:20.50]'Cause even God herself has enemies`,
    provider: 'open-catalog',
    isFavorite: false,
  },
  {
    id: 'track-copycat',
    title: 'COPYCAT',
    artist: 'Billie Eilish',
    album: 'dont smile at me',
    year: 2017,
    duration: 193,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/568/568436_9497060-lq.mp3',
    lyricsLrc: `[00:05.00]Don't be cautious, don't be kind
[00:09.20]You committed, I'm your crime
[00:13.50]Push my finger to the trigger
[00:18.00]Copycat trying to cop my manner`,
    provider: 'open-catalog',
    isFavorite: false,
  },
  {
    id: 'track-900729',
    title: '900729',
    artist: 'Taco Hemingway',
    album: 'WOSK',
    year: 2016,
    duration: 182,
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/568/568437_9497060-lq.mp3',
    lyricsLrc: `[00:05.00]Dziewięć zero zero siedem dwa dziewięć
[00:10.00]Gdzie jesteś teraz, nikt tego nie wie
[00:15.00]Stare taśmy, czarny wosk na gramofonie`,
    provider: 'open-catalog',
    isFavorite: false,
  },
  {
    id: 'track-wszystko-jedno',
    title: 'Wszystko jedno',
    artist: 'Taco Hemingway',
    album: 'Trójkąt Warszawski',
    year: 2014,
    duration: 205,
    coverUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/568/568438_9497060-lq.mp3',
    lyricsLrc: `[00:04.00]Wszystko jedno, dokąd dziś pojedzie nocny
[00:09.00]Kolejny przystanek, wiatr jest chłodny i mocny`,
    provider: 'open-catalog',
    isFavorite: false,
  },
  {
    id: 'track-nie-ma-fal',
    title: 'Nie ma fal',
    artist: 'Dawid Podsiadło',
    album: 'Małomiasteczkowy',
    year: 2018,
    duration: 238,
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
    streamUrl: 'https://cdn.freesound.org/previews/568/568439_9497060-lq.mp3',
    lyricsLrc: `[00:06.00]Nie ma fal, nie ma fal
[00:10.50]Płyniemy pod prąd, chociaż woda stoi w miejscu
[00:15.80]Znowu patrzysz w dal, a ja szukam sensu`,
    provider: 'open-catalog',
    isFavorite: true,
  },
];

export const TACO_ARTIST_PROFILE: ArtistProfile = {
  id: 'artist-taco-hemingway',
  name: 'Taco Hemingway',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  followers: '1.4M',
  isFollowed: true,
  albums: [
    {
      id: 'alb-1',
      title: "Pocztówka z WWA, lato '19",
      year: 2019,
      coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=80',
      trackCount: 11,
    },
    {
      id: 'alb-2',
      title: 'Café Belga',
      year: 2018,
      coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
      trackCount: 11,
    },
    {
      id: 'alb-3',
      title: 'Flagey EP',
      year: 2018,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      trackCount: 5,
    },
    {
      id: 'alb-4',
      title: 'Szprycer',
      year: 2017,
      coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80',
      trackCount: 9,
    },
    {
      id: 'alb-5',
      title: 'Marmur',
      year: 2016,
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
      trackCount: 17,
    },
    {
      id: 'alb-6',
      title: 'Wosk',
      year: 2016,
      coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
      trackCount: 6,
    },
  ],
  popularTracks: INITIAL_TRACKS.slice(0, 5),
  similarArtists: [
    {
      id: 'sim-1',
      name: 'Dawid Podsiadło',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      isFollowed: true,
    },
    {
      id: 'sim-2',
      name: 'Billie Eilish',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      isFollowed: false,
    },
    {
      id: 'sim-3',
      name: 'Quebonafide',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      isFollowed: false,
    },
  ],
};

export const INITIAL_FRIENDS: FriendActivity[] = [
  {
    id: 'f-1',
    name: 'Natalie Kowalska',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    currentTrack: 'Szprycer',
    artist: 'Taco Hemingway',
    isOnline: true,
    timeAgo: 'Now',
  },
  {
    id: 'f-2',
    name: 'Mark Stan',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    currentTrack: 'Air',
    artist: 'BIV',
    isOnline: true,
    timeAgo: '3m',
  },
  {
    id: 'f-3',
    name: 'Felipe Polski',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    currentTrack: 'LadyBug',
    artist: 'Skamberville',
    isOnline: false,
    timeAgo: '12m',
  },
  {
    id: 'f-4',
    name: 'Maria Louis',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    currentTrack: 'Co mówimy',
    artist: 'Dawid Podsiadło',
    isOnline: false,
    timeAgo: '1h',
  },
  {
    id: 'f-5',
    name: 'Tomasz Borowski',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    currentTrack: 'Deszcz na betonie',
    artist: 'Taco Hemingway',
    isOnline: false,
    timeAgo: '4h',
  },
  {
    id: 'f-6',
    name: 'Nela Magani',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    currentTrack: 'early mornings',
    artist: 'eaves',
    isOnline: false,
    timeAgo: '1d',
  },
];
